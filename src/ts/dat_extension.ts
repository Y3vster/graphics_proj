/**
 * Created by YK on 12/1/16.
 */
/// <reference path="./dat.gui.d.ts" />

import WaveElement from './my_components';


function addGUIWaveController(waveElem){
    waveElem.domElement.className = 'c';

}

//
// class CustomDatGUI extends dat.GUI {
//     addTermController(waveElem : WaveElement) {
//
//         // recallSavedValue(gui, controller);
//
//         // dom.addClass(controller.domElement, 'c');
//         //
//         // const name = document.createElement('span');
//         // dom.addClass(name, 'property-name');
//         // name.innerHTML = controller.property;
//         //
//         // const container = document.createElement('div');
//         // container.appendChild(name);
//         // container.appendChild(controller.domElement);
//         //
//         // const li = addRow(gui, container, params.before);
//         //
//         // dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
//         // if (controller instanceof ColorController) {
//         //     dom.addClass(li, 'color');
//         // } else {
//         //     dom.addClass(li, typeof controller.getValue());
//         // }
//         //
//         // augmentController(gui, li, controller);
//         //
//         // gui.__controllers.push(controller);
//         //
//         // return controller;
//     }
//
// }

