// Type definitions for dat.GUI v0.6.1
// Project: https://github.com/dataarts/dat.gui
// Definitions by: Satoru Kimura <https://github.com/gyohk>, ZongJing Lu <https://github.com/sonic3d>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace dat {

    export module controllers {

        export class Controller {
            destroy(): void;

            // Controller
            onChange: (value?: any) => void;
            onFinishChange: (value?: any) => void;

            setValue(value: any): Controller;

            getValue(): any;

            updateDisplay(): void;

            isModified(): boolean;

            // NumberController
            min(n: number): Controller;

            max(n: number): Controller;

            step(n: number): Controller;

            domElement: HTMLElement;

            // FunctionController
            fire(): Controller;

            // augmentController in dat/gui/GUI.js
            options(option: any): Controller;

            name(s: string): Controller;

            listen(): Controller;

            remove(): Controller;
        }
    }
    export var GUIController: controllers.Controller;
    // var GUIController: controllers.Controller;

    export class GUI {
        constructor(option?: GUIParams);

        __controllers: controllers.Controller[];
        __folders: GUI[];
        domElement: HTMLElement;

        add(target: Object, propName: string): controllers.Controller;
        add(target: Object, propName: string, min: number, max: number): controllers.Controller;
        add(target: Object, propName: string, status: boolean): controllers.Controller;
        add(target: Object, propName: string, items: string[]): controllers.Controller;
        add(target: Object, propName: string, items: number[]): controllers.Controller;
        add(target: Object, propName: string, items: Object): controllers.Controller;

        addColor(target: Object, propName: string): controllers.Controller;
        addColor(target: Object, propName: string, color: string): controllers.Controller;
        addColor(target: Object, propName: string, rgba: number[]): controllers.Controller; // rgb or rgba
        addColor(target: Object, propName: string, hsv: {h: number; s: number; v: number}): controllers.Controller;

        remove(controller: controllers.Controller): void;

        destroy(): void;

        addFolder(propName: string): GUI;

        open(): void;

        close(): void;

        remember(target: Object, ...additionalTargets: Object[]): void;

        getRoot(): GUI;

        getSaveObject(): Object;

        save(): void;

        saveAs(presetName: string): void;

        revert(gui: GUI): void;

        listen(controller: controllers.Controller): void;

        updateDisplay(): void;

        // gui properties in dat/gui/GUI.js
        parent(): GUI;

        scrollable(): boolean;

        autoPlace(): boolean;

        preset(): string;
        preset(s: string): void;

        width(): number;
        width(n: number): void;

        name(): string;
        name(s: string): void;

        closed(): boolean;
        closed(b: boolean): void;

        load(): Object;

        useLocalStorage(): boolean;
        useLocalStorage(b: boolean): void;
    }

    export interface GUIParams {
        autoPlace?: boolean;
        closed?: boolean;
        load?: any;
        name?: string;
        preset?: string;
        width?: number;
    }


}
