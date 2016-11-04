###jslint browser: true###
###global THREE, window###
"use strict"

$ = jQuery

###
  Update render area
  Update aspect
  Recalc Perspective matrix
###


scene = new (THREE.Scene)
camera = new (THREE.PerspectiveCamera)(75, window.innerWidth / window.innerHeight, 0.1, 10000)
renderer = new THREE.WebGLRenderer({antialias: true})
stats = new Stats();
$ =>
    $('body').append renderer.domElement
    $('#container').append stats.dom


windSize = new THREE.Vector2()
windFloor = -250
windCenterXY = new THREE.Vector2()
mouseXY = new THREE.Vector2()
camXY = new THREE.Vector2()

onWindResize = () ->
    w = window.innerWidth
    h = window.innerHeight
    windSize.x = w
    windSize.y = h
    windCenterXY.x = w / 2
    windCenterXY.y = h / 2
    renderer.setSize w, h
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    return

onMove = (event) ->
    mouseXY.x = 2 * (event.clientX - windCenterXY.x) / windCenterXY.x
    mouseXY.y = 2 * (event.clientY - windCenterXY.y) / windCenterXY.y
    return


# Event Handlers
#------------------------------------------------------------
$ =>
    $(window).resize => onWindResize()
    $(window).on "mousemove", (e) => onMove(e)

init = ->
    renderer.setPixelRatio(window.devicePixelRatio)


updateCameraPosn = ->
    camera.position.x += ( mouseXY.x - camera.position.x ) * .05;
    camera.position.y =
        THREE.Math.clamp(
            camera.position.y + ( -mouseXY.y - camera.position.y ) * .05,
            -100,
            100);


render = ->
#    cube.rotation.x += 0.01
#    cube.rotation.y += 0.01

    updateCameraPosn()

    renderer.render scene, camera

    stats.update()
    requestAnimationFrame render


geometry = new (THREE.BoxGeometry)(1, 1, 1)
material = new (THREE.MeshBasicMaterial)(color: 0x00ff00)
cube = new (THREE.Mesh)(geometry, material)
scene.add cube
camera.position.z = 1.5
onWindResize()
render()


