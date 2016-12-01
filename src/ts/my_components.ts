///<reference path="./requirejs.d.ts" />
/// <reference path="./dat.gui.d.ts" />

import {polar, vec2} from "./primitives";

export class TermSet {
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


/**
 * Created by YK on 11/28/16.
 */

// Add functionality to the gui controller
// Makes it hideable and highlightable

export class WallpTerm  {
    domElement : HTMLElement;
    pickerVect: VectorPicker;
    pickerMN: CoeffPicker;

    constructor(polarCallback, mnCallback) {
        this.pickerVect = new VectorPicker(polarCallback);
        this.pickerMN = new CoeffPicker(mnCallback);
        this.domElement = document.createElement('li');
        this.domElement.className = 'term-controller';
        this.domElement.appendChild(this.pickerVect.domElement);
        this.domElement.appendChild(this.pickerMN.domElement);
    }

    SetValue(r, a, m, n){
        this.pickerVect.SetValue(r, a);
        this.pickerMN.SetValue(m, n);
    }

    hide(){
        this.domElement.style.display = 'none';
    }
    show(){
        this.domElement.style.display = 'list-item';
    }
    add_to_folder(fldr){
        (<any>fldr).__ul.appendChild(this.domElement);
    }
}


export class GUIControllerX extends dat.controllers.Controller {
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

// Component to modify a vector
export class VectorPicker {
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
        this.domElement.className = 'vect-pick-component';
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
    SetValue(r, a) {
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

// Component to modify a vector
export class CoeffPicker {
    domElement: HTMLElement;    // main container
    domBack: HTMLElement;        // the background box
    domKnob: HTMLElement;
    mnCallback: ((m: number, n: number) => void);   // callback for changes

    // constructor accepts a callback for notifying about changes
    constructor(mnCallback: ((m: number, n: number)=>void)) {

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
        return CoeffPicker.getBoundedCoord(x, y, rect);
    }

    // Sets the draggable knob to some polar coordinate
    // params: radius and angle
    SetValue(m, n) {
        var rect = this.domBack.getBoundingClientRect();
        var stride_x = rect.width / 8.0;
        var stride_y = rect.height / 8.0;
        var x = stride_x * m;
        var y = stride_y * n;
        var xy = CoeffPicker.getBoundedCoord(x, y, rect);
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
        var h = CoeffPicker.hypot(xy);
        var ang = Math.atan2(xy.y, xy.x);
        return {r: h, a: ang};
    }

    processMouseEvent(e: MouseEvent) {
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
    }
}
