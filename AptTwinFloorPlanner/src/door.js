import { Opening } from './opening.js';
import { WallType } from './wall.js';
import { Color } from './editor.js';

export const Hinge = { NORMAL: 1, REVERSE: -1 };

export class Door extends Opening {
    constructor(pos, angle, angleSign, size, hinge, thick) {
        super(pos, angle, size, thick);

        this.angleSign = angleSign;
        this.hinge = hinge;
        this.type = WallType.DOOR;

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
            " L " + sizeObj / 2 + "," + thickObj / 2 + " L " + sizeObj / 2 + "," + (-thickObj / 2) + " Z", "#ccc", "none",
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
