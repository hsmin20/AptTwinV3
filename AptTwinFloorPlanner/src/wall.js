import { qSVG } from './qSVG.js';

export const WallType = { NEW: 0, NORMAL: 1, FLOOR: 2, FLOOR2: 3, FLOOR3: 4, FLOOR4: 5, FLOOR5: 6, DOOR: 7, DOOR2: 8, WINDOW: 9, 
                            WINDOW2: 10, BATHTUB: 11, TOILET: 12, BATHSINK: 13, KITCHENSINK: 14 };

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
