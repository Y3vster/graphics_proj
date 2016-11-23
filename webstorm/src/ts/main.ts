/**
 * Created by YK on 11/9/16.
 */
/// <reference path="./dat.gui.d.ts" />
/// <reference path="./three.d.ts" />
/// <reference path="./jquery.d.ts" />
/// <reference path="./requirejs.d.ts" />

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
    });

}

// $($(".fn-btn").click(function (event) {
//     var fileName = $(this).data("file");
//     $.ajax({
//         url: 'glsl/' + fileName,
//         dataType: 'text'
//     })
//         .done(function (data) {
//             material.fragmentShader = data;
//             material.needsUpdate = true;
//         });
// }));


var sidebarOpen;
(function () {
    $('#settings-button').click(
        function () {
            if (sidebarOpen) {
                $('#sidebar').animate({width: 0})
            } else {
                $('#sidebar').animate({width: 240})
            }
            sidebarOpen = !sidebarOpen;
        });
})();


// class MyUniforms{
//     mn:THREE.Vector2;
//     resolution:THREE.Vector2;
//     constructor(){
//         this.mn = new THREE.Vector2();
//     }
// }
//
// var uniforms = new MyUniforms();

var FizzyText = function () {
    this.message = 'dat.gui';
    this.speed = 0.8;
    this.displayOutline = false;
    this.explode = function () {

    };

};

class TermSet {
    fldr: dat.GUI;

    constructor(folder: dat.GUI) {
        this.fldr = folder;
    }

    n: dat.GUIController;
    m: dat.GUIController;
    r: dat.GUIController;
    a: dat.GUIController;

    hide() {
        this.n.domElement.parentElement.parentElement.style.display = 'none';
        this.m.domElement.parentElement.parentElement.style.display = 'none';
        this.r.domElement.parentElement.parentElement.style.display = 'none';
        this.a.domElement.parentElement.parentElement.style.display = 'none';
    }

    show() {
        this.n.domElement.parentElement.parentElement.style.display = 'list-item';
        this.m.domElement.parentElement.parentElement.style.display = 'list-item';
        this.r.domElement.parentElement.parentElement.style.display = 'list-item';
        this.a.domElement.parentElement.parentElement.style.display = 'list-item';
    }
}


window.onload = function () {
    init();
    var text = new FizzyText();
    var gui = new dat.GUI({autoPlace: false});

    /*
     Create a folder with the available shaders
     */
    var file_names = JSON.parse($("#shader-filelist").html()).shader_files;
    var shader_load_fns = file_names.map(function (name: string) {
        return function () { load_shader(name); }
    });

    let shadersFolder = gui.addFolder("Groups");
    for (var i = 0; i < file_names.length; i++) {
        shadersFolder.add(shader_load_fns, i.toString()).name(file_names[i]);
    }
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
    for (i = 0; i < max_terms; i++) {
        let n = i + 1;
        let set = new TermSet(fldr);
        set.m = fldr.add(uniforms.m_vals.value, i.toString()).min(0).max(10).step(1).name('M' + n);
        set.n = fldr.add(uniforms.n_vals.value, i.toString()).min(0).max(10).step(1).name('N' + n);
        set.r = fldr.add(uniforms.r_vals.value, i.toString()).min(0).max(10).step(0.5).name('R' + n);
        set.a = fldr.add(uniforms.a_vals.value, i.toString()).min(-3).max(3).step(0.1).name('A' + n);
        terms.push(set);
    }

    fldr.open();

    let num_terms = 5;

    for (var i = num_terms; i < max_terms; i++) {
        terms[i].hide();
    }


    num_terms_controller.onChange(function (value) {
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
    });

    $('#dat-gui').append(gui.domElement);
    animate();
};


// init();
// animate();
function init() {
    container = document.getElementById('container');
    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();
    geometry = new THREE.PlaneBufferGeometry(2, 2);

    uniforms = {
        time: {value: 1.0},
        resolution: {value: new THREE.Vector2()},
        n_vals: {value: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]},
        m_vals: {value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
        r_vals: {value: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]},
        a_vals: {value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0]},
        num_terms: {value: 1}
    };


    // uniforms = {
    //     mn: {value: new THREE.Vector2()}
    // };

    var origVertShader = document.getElementById('vertexShader').textContent;
    var origFragShader = document.getElementById('fragmentShader').textContent;

    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: origVertShader,
        fragmentShader: origFragShader
    });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);

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


    container.appendChild(renderer.domElement);
    onWindowResize(null);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
}

//
function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    uniforms.time.value += 0.05;
    renderer.render(scene, camera);
}
