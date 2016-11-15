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
var MyUniforms = (function () {
    function MyUniforms() {
        this.mn = new THREE.Vector2();
    }
    return MyUniforms;
}());
var uniforms = new MyUniforms();
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
init();
animate();
function init() {
    container = document.getElementById('container');
    camera = new THREE.Camera();
    camera.position.z = 1;
    scene = new THREE.Scene();
    geometry = new THREE.PlaneBufferGeometry(2, 2);
    // uniforms = {
    //     mn: { value: new THREE.Vector2() }
    // };
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    onWindowResize();
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
    renderer.render(scene, camera);
}
//# sourceMappingURL=main.js.map