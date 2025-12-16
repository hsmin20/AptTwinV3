import { qSVG } from './qSVG.js';

export const WallType = { NEW: 0, NORMAL: 1, FLOOR: 2, DOOR: 3, WINDOW: 4, WINDOW2: 5 };

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

function getRandomColor() {
    var letters = 'ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 6)];
    }
    return color;
}

export class Floor {
    constructor(start, end, color=undefined) {
        this.start = start;
        this.end = end;
        this.type = WallType.FLOOR;
        if (color == undefined)
            this.color = getRandomColor();
        else
            this.color = color;
    }

    createEquation() {
        return qSVG.createEquation(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    fillGraph() {
        var floorGraph = qSVG.create('none', 'rect', {
            x: this.start.x,
            y: this.start.y,
            width: this.end.x - this.start.x,
            height: this.end.y - this.start.y,
            "fill": this.color,
            "fill-opacity": 0.9,
            "stroke": "transparent",
            "stroke-width": 1,
            "stroke-opacity": 0.7,
            stroke: "#9fb2e2"
        });

        this.graph = floorGraph;
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
            color: this.color
        }

        return obj;
    }
}