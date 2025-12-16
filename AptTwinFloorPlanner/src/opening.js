import { qSVG } from './qSVG.js';
import { METER } from './util.js';
import { g_factor, g_offset, g_originX_viewbox, g_originY_viewbox } from './editor.js';

export class Opening {
    constructor(pos, angle, size, thick) {
        this.x = pos.x;
        this.y = pos.y;
        this.angle = angle;
        this.size = size;
        this.thick = thick;

        this.graph = qSVG.create('none', 'g');
        this.scale = { x: 1, y: 1 };

        this.limit = [];
    }

    create() {
        this.width = (this.size / METER).toFixed(2);
        this.height = (this.thick / METER).toFixed(2);

        let cc = this._calculate(this.size, this.thick);

        for (var tt = 0; tt < cc.length; tt++) {
            let blank = qSVG.create('none', 'path', {
                    d: cc[tt].path,
                    "stroke-width": 1,
                    fill: cc[tt].fill,
                    stroke: cc[tt].stroke,
                    'stroke-dasharray': cc[tt].strokeDashArray,
                    opacity: cc[tt].opacity
                });
            this.graph.appendChild(blank);
        }
        
        var bbox = this.graph.getBoundingClientRect();
        bbox.x = (bbox.x * g_factor) - (g_offset.left * g_factor) + g_originX_viewbox;
        bbox.y = (bbox.y * g_factor) - (g_offset.top * g_factor) + g_originY_viewbox;
        bbox.origin = { x: this.x, y: this.y };
        this.bbox = bbox;
        this.coords = [{ x: -this.size / 2, y: -this.thick / 2 }, { x: this.size / 2, y: -this.thick / 2 }, { x: this.size / 2, y: this.thick / 2 }, { x: -this.size / 2, y: this.thick / 2 }];
        
        // if (family == "byObject") 
        //     this.family = cc.family;

        this.params = cc.params; // (bindBox, move, resize, rotate)
        if(cc.params.width)
            this.size = cc.params.width;
        if(cc.params.height)
            this.thick = cc.params.height;
    }

    pushToConstruc(construc, path, fill, stroke, strokeDashArray, opacity = 1) {
        construc.push({
            'path': path,
            'fill': fill,
            'stroke': stroke,
            'strokeDashArray': strokeDashArray,
            'opacity': opacity
        });
    }

    update() {
        this.width = (this.size / METER).toFixed(2);
        this.height = (this.thick / METER).toFixed(2);

        let cc = this._calculate(this.size, this.thick);
        for (var tt = 0; tt < cc.length; tt++) {
            if (cc[tt].path) {
                this.graph.children[tt].setAttribute("d", cc[tt].path);
            }
        }

        const hingeStatus = (this.hinge == undefined) ? 1 : this.hinge;

        this.graph.setAttribute("transform", "translate(" + (this.x) + "," + (this.y) + ") rotate(" + this.angle + ",0,0) scale(" + hingeStatus + ", 1)" );
        var bbox = this.graph.getBoundingClientRect();
        bbox.x = (bbox.x * g_factor) - (g_offset.left * g_factor) + g_originX_viewbox;
        bbox.y = (bbox.y * g_factor) - (g_offset.top * g_factor) + g_originY_viewbox;
        bbox.origin = { x: this.x, y: this.y };
        this.bbox = bbox;

        // if (this.class == "text" && this.angle == 0) {
        //     this.coords = [
        //         { x: this.bbox.x, y: this.bbox.y }, { x: this.bbox.x + this.bbox.width, y: this.bbox.y }, { x: this.bbox.x + this.bbox.width, y: this.bbox.y + this.bbox.height }, { x: this.bbox.x, y: this.bbox.y + this.bbox.height }
        //     ];
        //     this.size = this.bbox.width;
        //     this.thick = this.bbox.height;
        // }

        var angleRadian = -(this.angle) * (Math.PI / 180);
        this.coords = [{ x: -this.size / 2, y: -this.thick / 2 }, { x: this.size / 2, y: -this.thick / 2 }, 
                            { x: this.size / 2, y: this.thick / 2 }, { x: -this.size / 2, y: this.thick / 2 }];
        var newRealBbox = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
        newRealBbox[0].x = (this.coords[0].y * Math.sin(angleRadian) + this.coords[0].x * Math.cos(angleRadian)) + this.x;
        newRealBbox[1].x = (this.coords[1].y * Math.sin(angleRadian) + this.coords[1].x * Math.cos(angleRadian)) + this.x;
        newRealBbox[2].x = (this.coords[2].y * Math.sin(angleRadian) + this.coords[2].x * Math.cos(angleRadian)) + this.x;
        newRealBbox[3].x = (this.coords[3].y * Math.sin(angleRadian) + this.coords[3].x * Math.cos(angleRadian)) + this.x;
        newRealBbox[0].y = (this.coords[0].y * Math.cos(angleRadian) - this.coords[0].x * Math.sin(angleRadian)) + this.y;
        newRealBbox[1].y = (this.coords[1].y * Math.cos(angleRadian) - this.coords[1].x * Math.sin(angleRadian)) + this.y;
        newRealBbox[2].y = (this.coords[2].y * Math.cos(angleRadian) - this.coords[2].x * Math.sin(angleRadian)) + this.y;
        newRealBbox[3].y = (this.coords[3].y * Math.cos(angleRadian) - this.coords[3].x * Math.sin(angleRadian)) + this.y;
        this.coords = newRealBbox;
    }
}

export class Socle extends Opening {
    constructor(pos, angle, size, thick, type) {
        super(pos, angle, size, thick);

        this.graph = qSVG.create('none', 'g');
        this.scale = { x: 1, y: 1 };

        this.prototype = type;

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

        this.pushToConstruc(construc, "M " + (-sizeObj / 2) + "," + (-thickObj / 2) + " L " + (-sizeObj / 2) + "," +
            thickObj / 2 + " L " + sizeObj / 2 + "," + thickObj / 2 + " L " + sizeObj / 2 + "," + (-thickObj / 2) +
            " Z", "#5cba79", "#5cba79", '');

        return construc;
    }
}