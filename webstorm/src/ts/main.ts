/**
 * Created by YK on 11/9/16.
 */
/// <reference path="./dat.gui.d.ts" />
/// <reference path="./three.d.ts" />
/// <reference path="./jquery.d.ts" />

$($(".btn_group").click(function (event) {
    var fileName = $(this).data("file");
    $.ajax({
        url: 'glsl/' + fileName,
        dataType: 'text'
    })
        .done(function (data) {
            material.fragmentShader = data;
            material.needsUpdate = true;
        });
}));

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

window.onload = function () {
    var text = new FizzyText();
    var gui = new dat.GUI();
    gui.add(text, 'message');
    gui.add(text, 'speed', -5, 5);
    gui.add(text, 'displayOutline');
    gui.add(text, 'explode');
};

var container;
var camera, scene, renderer;
var material, geometry;
var uniforms;

init();
animate();
function init() {
    container = document.getElementById('container');
    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();
    geometry = new THREE.PlaneBufferGeometry(2, 2);

    uniforms = {
        time: {value: 1.0},
        resolution: {value: new THREE.Vector2()}
    };


    // uniforms = {
    //     mn: {value: new THREE.Vector2()}
    // };

    var origVertShader = document.getElementById('vertexShader').textContent;
    var origFragShader = document.getElementById('fragmentShader').textContent;

    material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: origVertShader,
        fragmentShader: origFragShader
    } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

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
