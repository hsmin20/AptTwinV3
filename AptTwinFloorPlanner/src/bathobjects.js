import { Opening } from "./opening.js";
import { WallType } from "./wall.js";
import { qSVG } from "./qSVG.js";

export class Bathtub extends Opening {
    constructor(pos, angle, angleSign, size, thick) {
        super(pos, angle, size, thick);

        this.angleSign = angleSign;

        this.type = WallType.BATHTUB;

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

        let xpos = sizeObj / 2.0;
        let ypos = thickObj / 2.0;
        this.pushToConstruc(construc, "M " + (-xpos) + "," + (-ypos) + " L " + (-xpos) + "," + ypos + " L " + xpos + "," +
                            ypos + " L " + xpos + "," + (-ypos) + " Z", "none", "#000", '');

        xpos = sizeObj / 4.0;
        ypos = thickObj / 4.0;
        const rad = thickObj / 4.0;;
        this.pushToConstruc(construc, "M " + (-xpos) + "," + (-ypos) + " L " + xpos + "," + (-ypos) + 
                            " A " + rad + "," + rad + ", 0, 0, 1, " + xpos + "," + ypos + 
                            " L " + (-xpos) + "," + ypos + " A " + rad + "," + rad + ", 0, 0, 1, " + (-xpos) + "," + (-ypos) + 
                            " Z", "none", "#000", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 40, max: 200 };

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
            thick: this.thick,
            type: this.type
        }

        return obj;
    }
}

export class Toilet extends Opening {
    constructor(pos, angle, angleSign, size, thick) {
        super(pos, angle, size, thick);

        this.angleSign = angleSign;

        this.type = WallType.TOILET;

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

        let xpos = sizeObj / 2.0;
        let ypos = thickObj / 2.0;
        this.pushToConstruc(construc, "M " + -xpos + "," + ypos + " L " + -xpos + "," + -ypos + " A " + xpos + "," + xpos + ", 0, 0, 1, "
                             + xpos + "," + -ypos + " L " + xpos + "," + ypos + " Z", "none", "#000", '');

        xpos = sizeObj / 4.0;
        ypos = thickObj / 4.0;
        this.pushToConstruc(construc, "M " + -xpos + "," + ypos + " L " + -xpos + "," + -ypos + " A " + xpos + "," + xpos + ", 0, 0, 1, "
                             + xpos + "," + -ypos + " L " + xpos + "," + ypos + " Z", "none", "#000", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 40, max: 200 };

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
            thick: this.thick,
            type: this.type
        }

        return obj;
    }
}

export class Bathsink extends Opening {
    constructor(pos, angle, angleSign, size, thick) {
        super(pos, angle, size, thick);

        this.angleSign = angleSign;

        this.type = WallType.BATHSINK;

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

        let xpos = sizeObj / 2.0;
        let ypos = thickObj / 2.0;
        this.pushToConstruc(construc, "M " + (-xpos) + "," + (-ypos) + " L " + (-xpos) + "," + ypos + " L " + xpos + "," +
                            ypos + " L " + xpos + "," + (-ypos) + " Z", "none", "#000", '');

        xpos = sizeObj / 3.0;
        ypos = thickObj / 3.0;
        this.pushToConstruc(construc, "M " + (-xpos) + "," + (-ypos) + " L " + (-xpos) + "," + ypos + " L " + xpos + "," +
                            ypos + " L " + xpos + "," + (-ypos) + " Z", "none", "#000", '');

        this.pushToConstruc(construc, qSVG.circlePath(0, 3, 2), "#fff", "#333", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 40, max: 200 };

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
            thick: this.thick,
            type: this.type
        }

        return obj;
    }
}

export class Kitchensink extends Opening {
    constructor(pos, angle, angleSign, size, thick) {
        super(pos, angle, size, thick);

        this.angleSign = angleSign;

        this.type = WallType.KITCHENSINK;

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
                            ypos + " L " + xpos + "," + (-ypos) + " Z", "none", "#000", '');

        const xoffset = 6;
        let yoffset = 6;
        const endx = -sizeObj / 6.0 - (xoffset);
        for(let i=0; i<5; i++) {
            this.pushToConstruc(construc, "M " + (-xpos+ xoffset) + "," + (-ypos+yoffset) + " L " + endx + "," + (-ypos+yoffset) + " Z", "none", "#000", '');
            yoffset += 6
        }

        // Sink
        const offset = 3;

        const sinkWidth = sizeObj / 3.0 - (offset * 2);
        const sinkLength = thickObj * 3 / 4;
        xpos = sinkWidth / 2.0;
        ypos = sinkLength / 2.0;
        this.pushToConstruc(construc, "M " + (-xpos) + "," + (-ypos) + " L " + (-xpos) + "," + ypos + " L " + xpos + "," +
                            ypos + " L " + xpos + "," + (-ypos) + " Z", "none", "#000", '');

        this.pushToConstruc(construc, qSVG.circlePath(0, 3, 2), "#fff", "#333", '');

        // Gas Range
        const rangeWidth = sizeObj / 3.0 - (offset * 2);
        const rangeLength = thickObj * 3 / 4;
        const xcenter = rangeWidth + offset;
        xpos = rangeWidth / 2.0;
        ypos = rangeLength / 2.0;
        this.pushToConstruc(construc, "M " + (xcenter-xpos) + "," + (-ypos) + " L " + (xcenter-xpos) + "," + ypos + " L " + (xcenter+xpos) + "," +
                            ypos + " L " + (xcenter+xpos) + "," + (-ypos) + " Z", "none", "#000", '');

        this.pushToConstruc(construc, qSVG.circlePath(xcenter-7, 0, 6), "#fff", "#333", '');
        // this.pushToConstruc(construc, qSVG.circlePath(xcenter, 0, 1), "none", "#333", '');
        // this.pushToConstruc(construc, "m " + (xcenter+2) + ",-3 " + (xcenter+5) + ",-8 " + (xcenter+3) + ",2", "none", "#333", '');
        // this.pushToConstruc(construc, "m -2,3 -5,8 -3,-2", "none", "#333", '');

        this.pushToConstruc(construc, qSVG.circlePath(xcenter+7, 0, 6), "#fff", "#333", '');
        // this.pushToConstruc(construc, qSVG.circlePath(xcenter, 0, 1), "none", "#333", '');

        construc.params.resize = true;
        construc.params.resizeLimit.width = { min: 40, max: 200 };

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
            thick: this.thick,
            type: this.type
        }

        return obj;
    }
}