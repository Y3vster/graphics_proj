var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="./requirejs.d.ts" />
/**
 * Created by YK on 11/28/16.
 */
System.register("primitives", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var vec2, polar;
    return {
        setters:[],
        execute: function() {
            vec2 = (function () {
                function vec2() {
                }
                return vec2;
            }());
            exports_1("vec2", vec2);
            polar = (function () {
                function polar() {
                }
                return polar;
            }());
            exports_1("polar", polar);
        }
    }
});
///<reference path="./requirejs.d.ts" />
/// <reference path="./dat.gui.d.ts" />
System.register("my_components", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var TermSet, WallpTerm, GUIControllerX, VectorPicker, CoeffPicker;
    function applyMixins(derivedCtor, baseCtors) {
        baseCtors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }
    return {
        setters:[],
        execute: function() {
            TermSet = (function () {
                function TermSet(folder) {
                    this.props = ['n', 'm', 'r', 'a'];
                    this.fldr = folder;
                }
                TermSet.prototype.hideMe = function () {
                    var _this = this;
                    this.props.forEach(function (x) { return _this[x].hideMe(); });
                };
                TermSet.prototype.showMe = function () {
                    var _this = this;
                    this.props.forEach(function (x) { return _this[x].showMe(); });
                };
                return TermSet;
            }());
            exports_2("TermSet", TermSet);
            /**
             * Created by YK on 11/28/16.
             */
            // Add functionality to the gui controller
            // Makes it hideable and highlightable
            WallpTerm = (function () {
                function WallpTerm(polarCallback, mnCallback) {
                    this.pickerVect = new VectorPicker(polarCallback);
                    this.pickerMN = new CoeffPicker(mnCallback);
                    this.domElement = document.createElement('li');
                    this.domElement.className = 'term-controller';
                    this.domElement.appendChild(this.pickerVect.domElement);
                    this.domElement.appendChild(this.pickerMN.domElement);
                }
                WallpTerm.prototype.SetValue = function (r, a, m, n) {
                    this.pickerVect.SetValue(r, a);
                    this.pickerMN.SetValue(m, n);
                };
                WallpTerm.prototype.hide = function () {
                    this.domElement.style.display = 'none';
                };
                WallpTerm.prototype.show = function () {
                    this.domElement.style.display = 'list-item';
                };
                WallpTerm.prototype.add_to_folder = function (fldr) {
                    fldr.__ul.appendChild(this.domElement);
                };
                return WallpTerm;
            }());
            exports_2("WallpTerm", WallpTerm);
            GUIControllerX = (function (_super) {
                __extends(GUIControllerX, _super);
                function GUIControllerX() {
                    _super.apply(this, arguments);
                }
                GUIControllerX.prototype.style = function () {
                    return this.domElement.parentElement.parentElement.style;
                };
                GUIControllerX.prototype.hideMe = function () {
                    this.style().display = 'none';
                };
                GUIControllerX.prototype.showMe = function () {
                    this.style().display = 'list-item';
                };
                GUIControllerX.prototype.margin_expand = function () {
                    this.style().borderLeftWidth = '10px';
                };
                GUIControllerX.prototype.margin_collapse = function () {
                    this.style().borderLeftWidth = '3px';
                };
                return GUIControllerX;
            }(dat.controllers.Controller));
            exports_2("GUIControllerX", GUIControllerX);
            applyMixins(dat.controllers.Controller, [GUIControllerX]);
            // Component to modify a vector
            VectorPicker = (function () {
                // constructor accepts a callback for notifying about changes
                function VectorPicker(polarCallback) {
                    var _this = this;
                    this.polarCallback = polarCallback;
                    this.domBack = document.createElement('div');
                    this.domBack.className = 'vect-pick-back';
                    this.domKnob = document.createElement('div');
                    this.domKnob.className = 'vect-knob';
                    this.domElement = document.createElement('div');
                    this.domElement.className = 'vect-pick-component';
                    this.domElement.appendChild(this.domKnob);
                    this.domElement.appendChild(this.domBack);
                    // event processing for mouse clicks and moves
                    var changeColorEvent = function (e) {
                        _this.processMouseEvent(e);
                        e.preventDefault();
                    };
                    var removeColorFinish = function (e) {
                        _this.processMouseEvent(e);
                        window.removeEventListener('mousemove', changeColorEvent);
                        window.removeEventListener('mouseup', removeColorFinish);
                        e.preventDefault();
                    };
                    var startDrag = function (e) {
                        _this.processMouseEvent(e);
                        window.addEventListener('mousemove', changeColorEvent);
                        window.addEventListener('mouseup', removeColorFinish);
                        e.preventDefault();
                    };
                    this.domBack.addEventListener('mousedown', startDrag);
                    this.domKnob.addEventListener('mousedown', startDrag);
                }
                // returns {x, y} that is bounded within  the rect
                VectorPicker.getBoundedCoord = function (x_px, y_px, rect) {
                    if (x_px > rect.width)
                        x_px = rect.width;
                    else if (x_px < 0.0)
                        x_px = 0.0;
                    if (y_px > rect.height)
                        y_px = rect.height;
                    else if (y_px < 0.0)
                        y_px = 0.0;
                    return { x: x_px, y: y_px };
                };
                // accepts a mouse {x, y} and returns a bounded relative {x, y}
                VectorPicker.getCoordFromMouse = function (x, y, rect) {
                    x = x - rect.left;
                    y = y - rect.top;
                    return VectorPicker.getBoundedCoord(x, y, rect);
                };
                // Sets the draggable knob to some polar coordinate
                // params: radius and angle
                VectorPicker.prototype.SetValue = function (r, a) {
                    var rect = this.domBack.getBoundingClientRect();
                    var x = 0.5 * r * Math.cos(a) + 0.5;
                    x = x * rect.width;
                    var y = 0.5 * r * Math.sin(a) + 0.5;
                    y = 1.0 - y;
                    y = y * rect.height;
                    var xy = VectorPicker.getBoundedCoord(x, y, rect);
                    this.setKnobPosn(xy.x, xy.y);
                };
                // Sets the draggable knob to the relative container {x, y}
                VectorPicker.prototype.setKnobPosn = function (x, y) {
                    this.domKnob.style.marginLeft = (x - 7) + 'px';
                    this.domKnob.style.marginTop = (y - 7) + 'px';
                };
                VectorPicker.hypot = function (xy) {
                    if (xy.x == 0.0 && xy.y == 0.0)
                        return 0.0;
                    var x = Math.abs(xy.x);
                    var y = Math.abs(xy.y);
                    if (x > y) {
                        y = y / x;
                        return x * Math.sqrt(1.0 + y * y);
                    }
                    else {
                        x = x / y;
                        return y * Math.sqrt(1.0 + x * x);
                    }
                };
                VectorPicker.polarFmWindXY = function (xy) {
                    var h = VectorPicker.hypot(xy);
                    var ang = Math.atan2(xy.y, xy.x);
                    return { r: h, a: ang };
                };
                VectorPicker.prototype.processMouseEvent = function (e) {
                    e.preventDefault();
                    var rect = this.domBack.getBoundingClientRect();
                    var windXY = VectorPicker.getCoordFromMouse(e.clientX, e.clientY, rect);
                    this.setKnobPosn(windXY.x, windXY.y);
                    var x_norm = ((windXY.x * 2.0) / rect.width) - 1.0;
                    var y_norm = 1.0 - ((windXY.y * 2.0) / rect.height);
                    var plr = VectorPicker.polarFmWindXY({ x: x_norm, y: y_norm });
                    this.polarCallback(plr);
                };
                return VectorPicker;
            }());
            exports_2("VectorPicker", VectorPicker);
            // Component to modify a vector
            CoeffPicker = (function () {
                // constructor accepts a callback for notifying about changes
                function CoeffPicker(mnCallback) {
                    var _this = this;
                    this.mnCallback = mnCallback;
                    this.domBack = document.createElement('div');
                    this.domBack.className = 'coeff-pick-back';
                    this.domKnob = document.createElement('div');
                    this.domKnob.className = 'vect-knob';
                    this.domElement = document.createElement('div');
                    this.domElement.className = 'vect-pick-component';
                    this.domElement.appendChild(this.domKnob);
                    this.domElement.appendChild(this.domBack);
                    // event processing for mouse clicks and moves
                    var changeColorEvent = function (e) {
                        _this.processMouseEvent(e);
                        e.preventDefault();
                    };
                    var removeColorFinish = function (e) {
                        _this.processMouseEvent(e);
                        window.removeEventListener('mousemove', changeColorEvent);
                        window.removeEventListener('mouseup', removeColorFinish);
                        e.preventDefault();
                    };
                    var startDrag = function (e) {
                        _this.processMouseEvent(e);
                        window.addEventListener('mousemove', changeColorEvent);
                        window.addEventListener('mouseup', removeColorFinish);
                        e.preventDefault();
                    };
                    this.domBack.addEventListener('mousedown', startDrag);
                    this.domKnob.addEventListener('mousedown', startDrag);
                }
                // returns {x, y} that is bounded within  the rect
                CoeffPicker.getBoundedCoord = function (x_px, y_px, rect) {
                    if (x_px > rect.width)
                        x_px = rect.width;
                    else if (x_px < 0.0)
                        x_px = 0.0;
                    if (y_px > rect.height)
                        y_px = rect.height;
                    else if (y_px < 0.0)
                        y_px = 0.0;
                    return { x: x_px, y: y_px };
                };
                // accepts a mouse {x, y} and returns a bounded relative {x, y}
                CoeffPicker.getCoordFromMouse = function (x, y, rect) {
                    x = x - rect.left;
                    y = y - rect.top;
                    return CoeffPicker.getBoundedCoord(x, y, rect);
                };
                // Sets the draggable knob to some polar coordinate
                // params: radius and angle
                CoeffPicker.prototype.SetValue = function (m, n) {
                    var rect = this.domBack.getBoundingClientRect();
                    var stride_x = rect.width / 8.0;
                    var stride_y = rect.height / 8.0;
                    var x = stride_x * m;
                    var y = stride_y * n;
                    var xy = CoeffPicker.getBoundedCoord(x, y, rect);
                    this.setKnobPosn(xy.x, xy.y);
                };
                // Sets the draggable knob to the relative container {x, y}
                CoeffPicker.prototype.setKnobPosn = function (x, y) {
                    this.domKnob.style.marginLeft = (x - 7) + 'px';
                    this.domKnob.style.marginTop = (y - 7) + 'px';
                };
                CoeffPicker.hypot = function (xy) {
                    if (xy.x == 0.0 && xy.y == 0.0)
                        return 0.0;
                    var x = Math.abs(xy.x);
                    var y = Math.abs(xy.y);
                    if (x > y) {
                        y = y / x;
                        return x * Math.sqrt(1.0 + y * y);
                    }
                    else {
                        x = x / y;
                        return y * Math.sqrt(1.0 + x * x);
                    }
                };
                CoeffPicker.polarFmWindXY = function (xy) {
                    var h = CoeffPicker.hypot(xy);
                    var ang = Math.atan2(xy.y, xy.x);
                    return { r: h, a: ang };
                };
                CoeffPicker.prototype.processMouseEvent = function (e) {
                    e.preventDefault();
                    var rect = this.domBack.getBoundingClientRect();
                    var windXY = CoeffPicker.getCoordFromMouse(e.clientX, e.clientY, rect);
                    var stride_x = rect.width / 8.0;
                    var stride_y = rect.height / 8.0;
                    var m_val = Math.round(windXY.x / stride_x);
                    var n_val = Math.round(windXY.y / stride_y);
                    var snapped_x = m_val * stride_x;
                    var snapped_y = n_val * stride_y;
                    this.setKnobPosn(snapped_x, snapped_y);
                    var x_norm = ((windXY.x * 2.0) / rect.width) - 1.0;
                    var y_norm = 1.0 - ((windXY.y * 2.0) / rect.height);
                    this.mnCallback(m_val, n_val);
                };
                return CoeffPicker;
            }());
            exports_2("CoeffPicker", CoeffPicker);
        }
    }
});
// Yevgeni Kamenski and Kelly Corrigan
// CPSC 5700 - Computer Graphics
// 12/1/2016
// Sources:
//    https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
System.register("main", ["my_components"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var my_components_1;
    var sidebar_open, sidebar_element, SIDEBAR_WIDTH, DEFAULT_NUM_TERMS, DEFAULT_NUM_COLORS, DEFAULT_SATURATION, DEFAULT_MAG_STRENGTH, DEFAULT_LINE_POWER, DEFAULT_SCALE, container, camera, scene, renderer, material, geometry, uniforms, screenshooter;
    // Loads the shader files
    function load_shader(name) {
        $.ajax({
            url: 'glsl/' + name,
            dataType: 'text'
        }).done(function (data) {
            material.fragmentShader = data;
            material.needsUpdate = true;
            canvas_update();
        });
    }
    function init(shader_file) {
        uniforms = {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2() },
            n_vals: { value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            m_vals: { value: [2, 2, 1, 0, 0, 0, 0, 0, 0, 0] },
            r_vals: { value: [0.5, 0.9, 1.0, 0.2, 0.4, 0.0, 0.0, 0.0, 0.0, 0.0] },
            a_vals: { value: [2.5, 1.0, 0.0, -1.0, -2.5, 0.0, 0, 0, 0.0, 0.0, 0.0] },
            num_terms: { value: DEFAULT_NUM_TERMS },
            num_colors: { value: DEFAULT_NUM_COLORS },
            saturation: { value: DEFAULT_SATURATION },
            magnitude_strength: { value: DEFAULT_MAG_STRENGTH },
            line_power: { value: DEFAULT_LINE_POWER },
            scale: { value: DEFAULT_SCALE }
        };
        // RENDERER THAT PRESERVES THE DRAWING BUFFER
        renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
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
    return {
        setters:[
            function (my_components_1_1) {
                my_components_1 = my_components_1_1;
            }],
        execute: function() {
            // import {polar} from "./primitives";
            /* GLOBAL DECLARATIONS */
            sidebar_open = false;
            SIDEBAR_WIDTH = 245;
            DEFAULT_NUM_TERMS = 3;
            DEFAULT_NUM_COLORS = 64;
            DEFAULT_SATURATION = 0.8;
            DEFAULT_MAG_STRENGTH = 0.5;
            DEFAULT_LINE_POWER = 25.0;
            DEFAULT_SCALE = 1.0;
            // hides the sidebar
            (function () {
                sidebar_element = document.getElementById('sidebar');
                $('#settings-button').click(function () {
                    if (sidebar_open) {
                        $(sidebar_element).animate({ width: 0 }, { queue: false });
                    }
                    else {
                        $(sidebar_element).animate({ width: SIDEBAR_WIDTH }, { queue: false });
                    }
                    sidebar_open = !sidebar_open;
                    onWindowResize(null);
                });
            })();
            // Component to modify a vector
            screenshooter = {
                shoot: function () {
                    var wind = window.open();
                    wind.document.write('<img src="' + renderer.domElement.toDataURL("image/png") + '" style="width: 100%"/>');
                }
            };
            $(function () {
                var glsl_entries = JSON.parse($("#shader-filelist").html()).shader_files;
                var uniforms_default = JSON.parse($("#uniforms-default").html());
                init(glsl_entries[2].file);
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
                var GLSLEntry = (function () {
                    function GLSLEntry() {
                    }
                    return GLSLEntry;
                }());
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
                // Zoom using scroll wheel (not working)
                // $("#container").on('mousewheel', function(e: any) {
                //     if (e.originalEvent.deltaY > 0 && uniforms.scale.value < 10.0) {
                //         uniforms.scale.value += 0.01;
                //         canvas_update();
                //         console.log("Scrolled down");
                //     } else if (e.originalEvent.deltaY < 0 && uniforms.scale.value > 0.1) {
                //         uniforms.scale.value -= 0.01;
                //         canvas_update();
                //         console.log("Scrolled up");
                //     };
                // });
                var shadersFolder = gui.addFolder("Groups");
                var shader_buttons;
                var active_shader_btn;
                shader_buttons = glsl_entries.map(function (x) {
                    var this_shader_btn;
                    var fn = {
                        value: function () {
                            load_shader(x.file);
                            active_shader_btn.margin_collapse();
                            active_shader_btn = this_shader_btn;
                            this_shader_btn.margin_expand();
                            canvas_update();
                        }
                    };
                    this_shader_btn = shadersFolder.add(fn, 'value').name(x.name);
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
                var fldr = gui.addFolder("Terms");
                var terms = [];
                var max_terms = 10;
                var _loop_1 = function() {
                    var idx = i;
                    elem = new my_components_1.WallpTerm(function (plr) {
                        uniforms.r_vals.value[idx] = plr.r;
                        uniforms.a_vals.value[idx] = plr.a;
                        canvas_update();
                    }, function (m, n) {
                        uniforms.m_vals.value[idx] = m;
                        uniforms.n_vals.value[idx] = n;
                        canvas_update();
                    });
                    elem.add_to_folder(fldr);
                    terms.push(elem);
                };
                var elem;
                for (var i = 0; i < max_terms; i++) {
                    _loop_1();
                }
                fldr.open();
                var num_terms = 10;
                var num_terms_change_fn = function (value) {
                    if (num_terms < value) {
                        for (var i = num_terms - 1; i < value; i++) {
                            terms[i].show();
                        }
                    }
                    else if (num_terms > value) {
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
                    terms[i].SetValue(uniforms.r_vals.value[i], uniforms.a_vals.value[i], uniforms.m_vals.value[i], uniforms.n_vals.value[i]);
                }
                canvas_update();
            });
        }
    }
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
//# sourceMappingURL=main.js.map