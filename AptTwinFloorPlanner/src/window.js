import { ObjectType, HouseObject } from './houseobject.js';


export class Window extends HouseObject {
    constructor(pos, angle, size, thick, height) {
        super(pos, angle, size, thick);

        this.window_height = height;
        this.type = ObjectType.WINDOW;

        this.create();
    }

    _calculate(sizeObj, thickObj) {
        let construc = [];
        construc.params = {};
        // construc.params.bindBox = false;
        construc.params.move = false;
        construc.params.resize = false;
        construc.params.resizeLimit = {};
        construc.params.resizeLimit.width = { min: false, max: false };
        construc.params.resizeLimit.height = { min: false, max: false };
        construc.params.rotate = false;

        this.pushToConstruc(construc, "M " + (-sizeObj / 2) + "," + (-thickObj / 2) + " L " + (-sizeObj / 2) + "," + thickObj / 2 +
                " M " + sizeObj / 2 + "," + thickObj / 2 + " L " + sizeObj / 2 + "," + (-thickObj / 2), "none", "#ceeff2", '');

        this.pushToConstruc(construc, "M " + (-sizeObj / 2) + ",-2 L " + (-sizeObj / 2) + ",0 L 2,0 L 2,2 L 3,2 L 3,-2 Z", "#ceeff2", "none", '');
        this.pushToConstruc(construc, "M -2,1 L -2,3 L " + sizeObj / 2 + ",3 L " + sizeObj / 2 + ",1 L -1,1 L -1,-1 L -2,-1 Z", "#ceeff2", "none", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 60, max: 360 };

        return construc;
    }

    toJson() {
        let obj = {
            pos: {
                x: this.x,
                y: this.y
            },
            angle: this.angle,
            size: this.size,
            thick: this.thick,
            window_height: this.window_height,
            type: this.type
        }

        return obj;
    }
}

export class Window2 extends HouseObject {
    constructor(pos, angle, size, thick, height) {
        super(pos, angle, size, thick);

        this.window_height = height;
        this.type = ObjectType.WINDOW2;

        this.create();
    }

    _calculate(sizeObj, thickObj) {
        let construc = [];
        construc.params = {};
        // construc.params.bindBox = false;
        construc.params.move = false;
        construc.params.resize = false;
        construc.params.resizeLimit = {};
        construc.params.resizeLimit.width = { min: false, max: false };
        construc.params.resizeLimit.height = { min: false, max: false };
        construc.params.rotate = false;

        this.pushToConstruc(construc, "M " + (-sizeObj / 2) + "," + (-thickObj / 2) + " L " + (-sizeObj / 2) + "," + thickObj / 2 +
                " M " + sizeObj / 2 + "," + thickObj / 2 + " L " + sizeObj / 2 + "," + (-thickObj / 2), "none", "#ceeff2", '');

        this.pushToConstruc(construc, "M " + (-sizeObj / 2) + ",4 L " + (-sizeObj / 2) + ",0 L" + (-sizeObj / 4) + ",0 L" + (-sizeObj / 4) + ",4 Z", "#ceeff2", "none", '');
        this.pushToConstruc(construc, "M " + (-sizeObj / 4) + ",-4 L " + (-sizeObj / 4) + ",0 L -1,0 L -1,-4 Z", "#ceeff2", "none", '');
        this.pushToConstruc(construc, "M 1,0 L 1,-4 L " + sizeObj / 4 + ",-4 L " + sizeObj / 4 + ",0 Z", "#ceeff2", "none", '');
        this.pushToConstruc(construc, "M " + (sizeObj / 4) + ",4 L " + (sizeObj / 4) + ",0 L" + (sizeObj / 2) + ",0 L " + (sizeObj / 2) + ",4 Z", "#ceeff2", "none", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 60, max: 600 };

        return construc;
    }

    toJson() {
        let obj = {
            pos: {
                x: this.x,
                y: this.y
            },
            angle: this.angle,
            size: this.size,
            thick: this.thick,
            window_height: this.window_height,
            type: this.type
        }

        return obj;
    }
}