/**
 * Created by YK on 11/9/16.
 */
/// <reference path="./dat.gui.d.ts" />
/// <reference path="./three.d.ts" />
/// <reference path="./jquery.d.ts" />
/// <reference path="./requirejs.d.ts" />

// import {vec2, polar} from "./primitives";
// import components = require("./my_components");
// import primitives = require("./primitives");
import {polar} from "./primitives";
import {TermSet, WallpTerm, VectorPicker, CoeffPicker, GUIControllerX} from "./my_components";
// import {polar} from "./primitives";


/* GLOBAL DECLARATIONS */
var sidebar_open = false;
var sidebar_element: HTMLElement;
var SIDEBAR_WIDTH = 245;
var DEFAULT_NUM_TERMS = 3;
var DEFAULT_NUM_COLORS = 64;
var DEFAULT_SATURATION = 0.8;
var DEFAULT_MAG_STRENGTH = 0.5;
var DEFAULT_LINE_POWER = 25.0;
var DEFAULT_SCALE = 1.0;

var container;
var camera, scene, renderer;
var material: THREE.ShaderMaterial, geometry;
var uniforms;


// Loads the shader files
function load_shader(name: string) {
    $.ajax({
        url: 'glsl/' + name,
        dataType: 'text'
    }).done(function (data) {
        material.fragmentShader = data;
        material.needsUpdate = true;
        canvas_update();
    });
}

// hides the sidebar
(function () {
    sidebar_element = document.getElementById('sidebar');
    $('#settings-button').click(
        function () {
            if (sidebar_open) {
                $(sidebar_element).animate({width: 0}, {queue: false})
            } else {
                $(sidebar_element).animate({width: SIDEBAR_WIDTH}, {queue: false})
            }
            sidebar_open = !sidebar_open;
            onWindowResize(null);
        });
})();


// Component to modify a vector


var screenshooter = {
    shoot: function () {
        var wind = window.open();
        wind.document.write('<img src="' + renderer.domElement.toDataURL("image/png") + '" style="width: 100%"/>');
    }
};


$(function () {

    var glsl_entries: Array<GLSLEntry> = JSON.parse($("#shader-filelist").html()).shader_files;
    var uniforms_default = JSON.parse($("#uniforms-default").html());


    init(glsl_entries[1].file);

    // TODO: VECTOR PICKER TEST


    var gui = new dat.GUI({
        autoPlace: false,
        load: uniforms_default
    });
    gui.remember(uniforms.n_vals.value);
    gui.remember(uniforms.m_vals.value);
    gui.remember(uniforms.r_vals.value);
    gui.remember(uniforms.a_vals.value);
    gui.remember(uniforms.num_terms);
    gui.add(screenshooter, 'shoot').name('Take Screenshot');
    /*
     Create a folder with the available shaders
     */
    class GLSLEntry {
        name: string;
        file: string;
    }

    var dispSettings = gui.addFolder('Display Settings');
    dispSettings.add(uniforms.scale, 'value')
        .min(0.25)
        .max(5.0)
        .name("Scale")
        .onChange(canvas_update);
    dispSettings.add(uniforms.num_colors, 'value')
        .min(1)
        .max(128)
        .step(1)
        .name("# Colors")
        .onChange(canvas_update);

    dispSettings.add(uniforms.saturation, 'value')
        .min(0.0)
        .max(1.0)
        .step(0.1)
        .name("Saturation")
        .onChange(canvas_update);

    dispSettings.add(uniforms.magnitude_strength, 'value')
        .min(0.0)
        .max(1.0)
        .step(0.1)
        .name("Magnitude Strength")
        .onChange(canvas_update);

    dispSettings.add(uniforms.line_power, 'value')
        .min(0.0)
        .max(30.0)
        .step(1)
        .name("Line Power")
        .onChange(canvas_update);

    let shadersFolder = gui.addFolder("Groups");
    var shader_buttons: Array<GUIControllerX>;
    var active_shader_btn: GUIControllerX;
    shader_buttons = glsl_entries.map(function (x: GLSLEntry) {
        var this_shader_btn: GUIControllerX;
        var fn = {
            value: function () {
                load_shader(x.file);
                active_shader_btn.margin_collapse();
                active_shader_btn = this_shader_btn;
                this_shader_btn.margin_expand();
                canvas_update();
            }
        };
        this_shader_btn = <GUIControllerX>shadersFolder.add(fn, 'value').name(x.name);
        return this_shader_btn;
    });
    active_shader_btn = shader_buttons[0];
    shadersFolder.open();

    var num_terms_controller = gui
        .add(uniforms.num_terms, 'value')
        .min(1)
        .max(10)
        .step(1)
        .name("# Terms");


    let fldr = gui.addFolder("Terms");
    let terms: Array<WallpTerm> = [];
    let max_terms = 10;
    for (var i = 0; i < max_terms; i++) {

        let idx = i;
        var elem = new WallpTerm(
            (plr: polar)=> {
                uniforms.r_vals.value[idx] = plr.r;
                uniforms.a_vals.value[idx] = plr.a;
                canvas_update();
            },
            (m: number, n: number) => {
                uniforms.m_vals.value[idx] = m;
                uniforms.n_vals.value[idx] = n;
                canvas_update();
            });
        elem.add_to_folder(fldr);
        terms.push(elem);
    }
    fldr.open();

    let num_terms = 10;
    var num_terms_change_fn = function (value) {
        if (num_terms < value) {
            for (var i = num_terms - 1; i < value; i++) {
                terms[i].show();
            }
        } else if (num_terms > value) {
            for (var i = num_terms - 1; i > (value - 1); i--) {
                terms[i].hide();
            }
        }
        num_terms = value;
        canvas_update();
    };
    num_terms_controller.onChange(num_terms_change_fn);
    num_terms_change_fn(DEFAULT_NUM_TERMS);


    // global dat.gui event listening
    $(gui.domElement).on('mousedown mouseup keydown keyup hover', canvas_update);

    $('#dat-gui').append(gui.domElement);

    // can update the knobs on the components after adding them to the dom
    for (var i = 0; i < max_terms; i++) {
        terms[i].SetValue(
            uniforms.r_vals.value[i],
            uniforms.a_vals.value[i],
            uniforms.m_vals.value[i],
            uniforms.n_vals.value[i]
        );
    }

    canvas_update();
});


function init(shader_file: string) {

    uniforms = {
        time: {value: 1.0},
        resolution: {value: new THREE.Vector2()},
        n_vals: {value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
        m_vals: {value: [2, 2, 1, 0, 0, 0, 0, 0, 0, 0]},
        r_vals: {value: [0.5, 0.9, 1.0, 0.2, 0.4, 0.0, 0.0, 0.0, 0.0, 0.0]},
        a_vals: {value: [2.5, 1.0, 0.0, -1.0, -2.5, 0.0, 0, 0, 0.0, 0.0, 0.0]},
        num_terms: {value: DEFAULT_NUM_TERMS},
        num_colors: {value: DEFAULT_NUM_COLORS},
        saturation: {value: DEFAULT_SATURATION},
        magnitude_strength: {value: DEFAULT_MAG_STRENGTH},
        line_power: {value: DEFAULT_LINE_POWER},
        scale: {value: DEFAULT_SCALE}
    };

    // RENDERER THAT PRESERVES THE DRAWING BUFFER
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setPixelRatio(window.devicePixelRatio);

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.Camera();
    camera.position.z = 1;

    // GEOMETRY
    geometry = new THREE.PlaneBufferGeometry(2, 2);

    // MATERIAL
    var shader_text;
    $.ajax({
        url: 'glsl/' + shader_file,
        dataType: 'text',
        success: function (data) {
            shader_text = data;
        },
        async: false
    });
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: shader_text
    });

    // MESH FROM GEOMETRY & MATERIAL
    var mesh = new THREE.Mesh(geometry, material);

    // SCENE FROM MESH
    scene = new THREE.Scene();
    scene.add(mesh);

    onWindowResize(null);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
    var w = window.innerWidth;
    if (sidebar_open) {
        w -= SIDEBAR_WIDTH;
    }
    var h = window.innerHeight;
    renderer.setSize(w, h);
    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
    canvas_update();
}

function canvas_update() {
    requestAnimationFrame(render);
}

function render() {
    renderer.render(scene, camera);
}

/*
 HOW TO USE RAW SHADER WITH NO GEOM
 */
// var gl = renderer.context;
//
// var glVertexShader = new THREE.WebGLShader(gl, gl.VERTEX_SHADER, origVertShader);
// var glFragmentShader = new THREE.WebGLShader(gl, gl.FRAGMENT_SHADER, origFragShader);
//
// var program = gl.createProgram();
//
// gl.attachShader(program, glVertexShader);
// gl.attachShader(program, glFragmentShader);
//
// gl.linkProgram(program);
// gl.useProgram(program);
