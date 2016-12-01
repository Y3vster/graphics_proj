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
var DEFAULT_NUM_COLORS = 5;
var DEFAULT_SATURATION = 0.7;
var DEFAULT_MAG_STRENGTH = 0.2;
var DEFAULT_LINE_POWER = 5.0;
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


// Add functionality to the gui controller
// Makes it hideable and highlightable
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
        this.style().borderLeftWidth = '10px';
    }

    margin_collapse() {
        this.style().borderLeftWidth = '3px';
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


class vec2 {
    x: number;
    y: number;
}

class polar {
    r: number;
    a: number;
}

// Component to modify a vector
class VectorPicker {
    domElement: HTMLElement;    // main container
    domBack: HTMLElement;        // the background box
    domKnob: HTMLElement;
    polarCallback: ((ra: polar) => void);   // callback for changes

    // constructor accepts a callback for notifying about changes
    constructor(polarCallback: ((ra: polar)=>void)) {

        this.polarCallback = polarCallback;

        this.domBack = document.createElement('div');
        this.domBack.className = 'vect-pick-back';

        this.domKnob = document.createElement('div');
        this.domKnob.className = 'vect-knob';

        this.domElement = document.createElement('div');
        this.domElement.style.display = 'inline-block';
        this.domElement.appendChild(this.domKnob);
        this.domElement.appendChild(this.domBack);

        // event processing for mouse clicks and moves
        var changeColorEvent = (e) => {
            this.processMouseEvent(e);
            e.preventDefault();
        };
        var removeColorFinish = (e) => {
            this.processMouseEvent(e);
            window.removeEventListener('mousemove', changeColorEvent);
            window.removeEventListener('mouseup', removeColorFinish);
            e.preventDefault();
        };
        var startDrag = (e) => {
            this.processMouseEvent(e);
            window.addEventListener('mousemove', changeColorEvent);
            window.addEventListener('mouseup', removeColorFinish);
            e.preventDefault();
        };

        this.domBack.addEventListener('mousedown', startDrag);
        this.domKnob.addEventListener('mousedown', startDrag);
    }

    // returns {x, y} that is bounded within  the rect
    static getBoundedCoord(x_px: number, y_px: number, rect: ClientRect): vec2 {
        if (x_px > rect.width)
            x_px = rect.width;
        else if (x_px < 0.0)
            x_px = 0.0;

        if (y_px > rect.height)
            y_px = rect.height;
        else if (y_px < 0.0)
            y_px = 0.0;

        return {x: x_px, y: y_px};
    }

    // accepts a mouse {x, y} and returns a bounded relative {x, y}
    static getCoordFromMouse(x: number, y: number, rect: ClientRect): vec2 {
        x = x - rect.left;
        y = y - rect.top;
        return VectorPicker.getBoundedCoord(x, y, rect);
    }

    // Sets the draggable knob to some polar coordinate
    // params: radius and angle
    setKnobPosnPolar(r, a) {
        var rect = this.domBack.getBoundingClientRect();
        var x = 0.5 * r * Math.cos(a) + 0.5;
        x = x * rect.width;
        var y = 0.5 * r * Math.sin(a) + 0.5;
        y = 1.0 - y;
        y = y * rect.height;
        var xy = VectorPicker.getBoundedCoord(x, y, rect);
        this.setKnobPosn(xy.x, xy.y);
    }

    // Sets the draggable knob to the relative container {x, y}
    setKnobPosn(x, y) {
        this.domKnob.style.marginLeft = (x - 7) + 'px';
        this.domKnob.style.marginTop = (y - 7) + 'px';
    }

    static hypot(xy: vec2): number {
        if (xy.x == 0.0 && xy.y == 0.0) return 0.0;
        var x = Math.abs(xy.x);
        var y = Math.abs(xy.y);
        if (x > y) {
            y = y / x;
            return x * Math.sqrt(1.0 + y * y);
        } else {
            x = x / y;
            return y * Math.sqrt(1.0 + x * x);
        }
    }

    static polarFmWindXY(xy: vec2): polar {
        var h = VectorPicker.hypot(xy);
        var ang = Math.atan2(xy.y, xy.x);
        return {r: h, a: ang};
    }

    processMouseEvent(e: MouseEvent) {
        e.preventDefault();

        var rect = this.domBack.getBoundingClientRect();
        var windXY = VectorPicker.getCoordFromMouse(e.clientX, e.clientY, rect);

        this.setKnobPosn(windXY.x, windXY.y);

        var x_norm = ((windXY.x * 2.0) / rect.width) - 1.0;
        var y_norm = 1.0 - ((windXY.y * 2.0) / rect.height);

        var plr = VectorPicker.polarFmWindXY({x: x_norm, y: y_norm});
        this.polarCallback(plr);
    }
}

class TermSet {
    fldr: dat.GUI;

    constructor(folder: dat.GUI) {
        this.fldr = folder;
    }

    n: GUIControllerX;
    m: GUIControllerX;
    r: GUIControllerX;
    a: GUIControllerX;

    props = ['n', 'm', 'r', 'a'];

    hideMe() {
        this.props.forEach(x => this[x].hideMe());
    }

    showMe() {
        this.props.forEach(x => this[x].showMe());
    }
}

var screenshooter = {
    shoot: function () {
        var wind = window.open();
        wind.document.write('<img src="' + renderer.domElement.toDataURL("image/png") + '" style="width: 100%"/>');
    }
};


window.onload = function () {

    var glsl_entries: Array<GLSLEntry> = JSON.parse($("#shader-filelist").html()).shader_files;

    init(glsl_entries[1].file);

    // TODO: VECTOR PICKER TEST
    var vectPick = new VectorPicker((plr: polar) => {
        // console.log(plr);
        uniforms.r_vals.value[0] = plr.r;
        uniforms.a_vals.value[0] = plr.a;
        canvas_update();
    });
    var mnPick = new VectorPicker((plr: polar) => {
        // console.log(plr);
        uniforms.r_vals.value[1] = plr.r;
        uniforms.a_vals.value[1] = plr.a;
        canvas_update();
    });
    $('#test-pickers').append(vectPick.domElement);
    $('#test-pickers').append(mnPick.domElement);
    vectPick.setKnobPosnPolar(0.5, 0.5);
    mnPick.setKnobPosnPolar(-0.5, 0.5);


    var gui = new dat.GUI({autoPlace: false});
    gui.add(screenshooter, 'shoot').name('Take Screenshot');
    /*
     Create a folder with the available shaders
     */
    class GLSLEntry {
        name: string;
        file: string;
    }
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
    let terms: Array<TermSet> = [];
    let max_terms = 10;
    for (var i = 0; i < max_terms; i++) {
        let n = i + 1;
        let term_set = new TermSet(fldr);
        term_set.m = <GUIControllerX>fldr.add(uniforms.m_vals.value, i.toString()).min(0).max(10).step(1).name('M' + n);
        term_set.n = <GUIControllerX>fldr.add(uniforms.n_vals.value, i.toString()).min(0).max(10).step(1).name('N' + n);
        term_set.r = <GUIControllerX>fldr.add(uniforms.r_vals.value, i.toString()).min(0).max(1.0).step(0.05).name('R' + n);
        term_set.a = <GUIControllerX>fldr.add(uniforms.a_vals.value, i.toString()).min(0).max(2.0 * Math.PI).step(0.05).name('A' + n);
        term_set.m.onChange(canvas_update);
        term_set.n.onChange(canvas_update);
        term_set.r.onChange(canvas_update);
        term_set.a.onChange(canvas_update);
        terms.push(term_set);
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

    // COLOR
    // var clrTest = {val: '#012345'};
    // var colorControlelr = gui.addColor(clrTest, 'val');

    var num_colors_controller = gui
        .add(uniforms.num_colors, 'value')
        .min(1)
        .max(20)
        .step(1)
        .name("# Colors");
    num_colors_controller.onChange(canvas_update);

    var saturation_controller = gui
        .add(uniforms.saturation, 'value')
        .min(0.0)
        .max(1.0)
        .step(0.1)
        .name("Saturation");
    saturation_controller.onChange(canvas_update);

    var magnitude_strength_controller = gui
        .add(uniforms.magnitude_strength, 'value')
        .min(0.0)
        .max(1.0)
        .step(0.1)
        .name("Magnitude Strength");
    magnitude_strength_controller.onChange(canvas_update);

    var line_power_controller = gui
        .add(uniforms.line_power, 'value')
        .min(0.0)
        .max(10.0)
        .step(0.5)
        .name("Line Power");
    line_power_controller.onChange(canvas_update);

    var scale_controller = gui
        .add(uniforms.scale, 'value')
        .min(0.5)
        .max(20.0)
        .step(0.5)
        .name("Scale");
    scale_controller.onChange(canvas_update);

    // global dat.gui event listening
    $(gui.domElement).on('mousedown mouseup keydown keyup hover', canvas_update);

    $('#dat-gui').append(gui.domElement);

    canvas_update();
};


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
