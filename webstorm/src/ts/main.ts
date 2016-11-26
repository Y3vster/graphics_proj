/**
 * Created by YK on 11/9/16.
 */
/// <reference path="./dat.gui.d.ts" />
/// <reference path="./three.d.ts" />
/// <reference path="./jquery.d.ts" />
/// <reference path="./requirejs.d.ts" />


/* GLOBAL DECLARATIONS */
var sidebar_open = false;
var sidebar_element: HTMLElement;
var SIDEBAR_WIDTH = 240;
var DEFAULT_NUM_TERMS = 3;

var container;
var camera, scene, renderer;
var material: THREE.ShaderMaterial, geometry;
var uniforms;


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


class GUIControllerX extends dat.controllers.Controller {
    style(): CSSStyleDeclaration {
        return this.domElement.parentElement.parentElement.style;
    }

    hideMe() {
        this.style().display = 'none';
    }

    showMe() {
        this.style().display = 'list-item';
    }

    margin_expand() {
        this.style().marginLeft = '10px';
    }

    margin_collapse() {
        this.style().marginLeft = '3px';
    }
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
applyMixins(dat.controllers.Controller, [GUIControllerX]);

class TermPair {
    fldr: dat.GUI;

    constructor(folder: dat.GUI) {
        this.fldr = folder;
    }

    n: GUIControllerX;
    m: GUIControllerX;

    hideMe() {
        this.n.hideMe();
        this.m.hideMe();
    }

    showMe() {
        this.n.showMe();
        this.m.showMe();
    }
}



// TODO: remove global after done debugging
var gui;

window.onload = function () {

    init();
    gui = new dat.GUI({autoPlace: false});

    /*
     Create a folder with the available shaders
     */
    class GLSLEntry {
        name: string;
        file: string;
    }
    let shadersFolder = gui.addFolder("Groups");
    var glsl_entries: Array<GLSLEntry> = JSON.parse($("#shader-filelist").html()).shader_files;
    glsl_entries.forEach(function (x: GLSLEntry) {
        var fn = {
            value: function () {
                load_shader(x.file);
                canvas_update();
            }
        };
        shadersFolder.add(fn, 'value').name(x.name);
    });


    shadersFolder.open();


    var num_terms_controller = gui
        .add(uniforms.num_terms, 'value')
        .min(1)
        .max(10)
        .step(1)
        .name("# Terms");

    let fldr = gui.addFolder("Terms");
    let terms: Array<TermPair> = [];
    let max_terms = 10;
    for (var i = 0; i < max_terms; i++) {
        let n = i + 1;
        let pair = new TermPair(fldr);
        pair.m = <GUIControllerX>fldr.add(uniforms.m_vals.value, i.toString()).min(0).max(10).step(1).name('M' + n);
        pair.m.onChange(canvas_update);
        pair.n = <GUIControllerX>fldr.add(uniforms.n_vals.value, i.toString()).min(0).max(10).step(1).name('N' + n);
        pair.n.onChange(canvas_update);
        terms.push(pair);
    }
    fldr.open();

    let num_terms = 10;
    var num_terms_change_fn = function (value) {
        if (num_terms < value) {
            for (var i = num_terms - 1; i < value; i++) {
                terms[i].showMe();
            }
        } else if (num_terms > value) {
            for (var i = num_terms - 1; i > (value - 1); i--) {
                terms[i].hideMe();
            }
        }
        num_terms = value;
        canvas_update();
    };
    num_terms_controller.onChange(num_terms_change_fn);
    num_terms_change_fn(DEFAULT_NUM_TERMS);

    var screenshot_fn = {
        fn: function () {
            var wind = window.open();
            wind.document.write('<img src="' + renderer.domElement.toDataURL("image/png") + '" style="width: 100%"/>');
        }
    };
    gui.add(screenshot_fn, 'fn').name('Take Screenshot');


    // global dat.gui event listening
    $(gui.domElement).on('mousedown mouseup keydown keyup hover', canvas_update);

    $('#dat-gui').append(gui.domElement);
    canvas_update();
};


function init() {

    uniforms = {
        time: {value: 1.0},
        resolution: {value: new THREE.Vector2()},
        n_vals: {value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
        m_vals: {value: [2, 2, 1, 0, 0, 0, 0, 0, 0, 0]},
        r_vals: {value: [0.5, 1.5, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]},
        a_vals: {value: [2.5, 1.0, 0.0, -1.0, -2.5, 0.0, 0, 0, 0.0, 0.0, 0.0]},
        num_terms: {value: DEFAULT_NUM_TERMS}
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
    var origVertShader = document.getElementById('vertexShader').textContent;
    var origFragShader = document.getElementById('fragmentShader').textContent;
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: origVertShader,
        fragmentShader: origFragShader
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


// Updates the canvas
function canvas_update() {
    requestAnimationFrame(render);
}

function render() {
    uniforms.time.value += 0.05;
    renderer.render(scene, camera);
}

/*** ADDING SCREEN SHOT ABILITY ***/
$(function () {
    window.addEventListener("keyup", function (e) {
        //Listen to 'P' key
        if (e.which !== 80) return;
        try {
            console.log("Image taken");
        }
        catch (e) {
            console.log("Browser does not support taking screenshot of 3d context");
            return;
        }

    });
});


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
