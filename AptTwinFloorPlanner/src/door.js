import { ObjectType, HouseObject } from './houseobject.js';
import { Color } from './editor.js';

export const Hinge = { NORMAL: 1, REVERSE: -1 };

export class Door extends HouseObject {
    constructor(pos, angle, angleSign, size, hinge, thick) {
        super(pos, angle, size, thick);

        this.angleSign = angleSign;
        this.hinge = hinge;
        this.type = ObjectType.DOOR;

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
            " L " + sizeObj / 2 + "," + thickObj / 2 + " L " + sizeObj / 2 + "," + (-thickObj / 2) + " Z", "#e6e3fbff", "none",
            '');

        this.pushToConstruc(construc, "M " + (-sizeObj / 2) + "," + (-thickObj / 2) + " L " + (-sizeObj / 2) + "," +
            (-sizeObj - thickObj / 2) + "  A" + sizeObj + "," + sizeObj + " 0 0,1 " + sizeObj / 2 + "," + (-thickObj / 2), "none", Color.WALL,
            '');
        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 40, max: 120 };

        return construc;
    }

    toJson() {
        let obj = {
            pos: {
                x: this.x,
                y: this.y
            },
            angle: this.angle,
            angleSign: this.angleSign,
            size: this.size,
            hinge: this.hinge,
            thick: this.thick,
            type: this.type
        }

        return obj;
    }
}

export class Door2 extends HouseObject {
    constructor(pos, angle, angleSign, size, hinge, thick) {
        super(pos, angle, size, thick);

        this.angleSign = angleSign;
        this.hinge = hinge;
        this.type = ObjectType.DOOR2;

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
            " L " + sizeObj / 2 + "," + thickObj / 2 + " L " + sizeObj / 2 + "," + (-thickObj / 2) + " Z", "#f29c9cff", "none",
            '');

        this.pushToConstruc(construc, "M " + (-sizeObj / 2) + "," + (-thickObj / 2) + " L " + (-sizeObj / 2) + "," +
            (-sizeObj - thickObj / 2) + "  A" + sizeObj + "," + sizeObj + " 0 0,1 " + sizeObj / 2 + "," + (-thickObj / 2), "none", Color.WALL,
            '');
        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 40, max: 120 };

        return construc;
    }

    toJson() {
        let obj = {
            pos: {
                x: this.x,
                y: this.y
            },
            angle: this.angle,
            angleSign: this.angleSign,
            size: this.size,
            hinge: this.hinge,
            thick: this.thick,
            type: this.type
        }

        return obj;
    }
}
