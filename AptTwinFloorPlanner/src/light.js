import { ObjectType } from "./houseobject.js";
import { HouseObject } from "./houseobject.js";
import { qSVG } from "./qSVG.js";

export class Light extends HouseObject {
    constructor(pos, radius) {
        super(pos, 0, radius, radius); // radius is saved as size

        this.type = ObjectType.LIGHT;

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

        this.pushToConstruc(construc, qSVG.circlePath(0, 0, sizeObj), "#bdeae489", "#333", '');
        this.pushToConstruc(construc, qSVG.circlePath(0, 0, sizeObj-2), "#ebf4f389", "#333", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 6, max: 60 };

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
            type: this.type
        }

        return obj;
    }
}

export class Light2 extends HouseObject {
    constructor(pos, width, length) {
        super(pos, 0, width, length);

        this.type = ObjectType.LIGHT2;

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

        // Outer Rectangle
        let xpos = sizeObj / 2.0;
        let ypos = thickObj / 2.0;
        this.pushToConstruc(construc, "M " + (-xpos) + "," + (-ypos) + " L " + (-xpos) + "," + ypos + " L " + xpos + "," +
                            ypos + " L " + xpos + "," + (-ypos) + " Z", "#bdeae489", "#333", '');
                            
        xpos = (sizeObj - 4) / 2.0;
        ypos = (thickObj - 4) / 2.0;
        this.pushToConstruc(construc, "M " + (-xpos) + "," + (-ypos) + " L " + (-xpos) + "," + ypos + " L " + xpos + "," +
                            ypos + " L " + xpos + "," + (-ypos) + " Z", "#ebf4f389", "#333", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 6, max: 120 };

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
            type: this.type
        }

        return obj;
    }
}
