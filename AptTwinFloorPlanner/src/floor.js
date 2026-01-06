import { ObjectType } from "./houseobject.js";
import { qSVG } from './qSVG.js';

export class Floor {
    constructor(start, end, type) {
        this.start = start;
        this.end = end;
        this.type = type;
        if (type == ObjectType.FLOOR) // Room floor
            this.color = '#d1cba0ff';
        else if(type == ObjectType.FLOOR2) // Livingroom floor
            this.color = '#e4ae30bd';
        else if(type == ObjectType.FLOOR3) // Bathroom floor
            this.color = '#a2f8fab1';
        else if(type == ObjectType.FLOOR4) // Veranda floor
            this.color = '#f5eb82b1';
        else if(type == ObjectType.FLOOR5) // Storage floor
            this.color = '#f3f7f0f9';
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
            stroke: "#d1cba0ff"
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