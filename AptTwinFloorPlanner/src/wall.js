import { qSVG } from './qSVG.js';

export class Wall {
    constructor(start, end, type, thick, color="#666666") {
        this.thick = thick;
        this.start = start;
        this.end = end;
        this.type = type;
        this.parent = null;
        this.child = null;
        this.angle = 0;
        this.equations = {};
        this.coords = [];
        this.backUp = false;

        this.color = color;
    }

    createEquation() {
        return qSVG.createEquation(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    fillGraph(way) {
        var wallGraph = qSVG.create('none', 'path', {
            d: way,
            stroke: "none",
            fill: this.color,
            "stroke-width": 1,
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter",
            "stroke-miterlimit": 4,
            "fill-rule": "nonzero"
        });

        this.graph = wallGraph;
    }

    toJson() {
        let obj = {
            start: {
                x: this.start.x,
                y: this.start.y
            },
            end: {
                x: this.end.x,
                y: this.end.y
            },
            type: this.type,
            thick: this.thick,
            color: this.color
        }

        return obj;
    }
}
