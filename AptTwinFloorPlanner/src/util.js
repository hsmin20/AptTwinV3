import { qSVG } from './qSVG.js';

export const METER = 60;

export class Util {
    static lineIntersectionP = null;

    static _nearVertice(arWalls, snap, range = 10000) {
        var bestDistance = Infinity;
        var bestVertice;
        for (var i = 0; i < arWalls.length; i++) {
            var distance1 = qSVG.gap(snap, { x: arWalls[i].start.x, y: arWalls[i].start.y });
            var distance2 = qSVG.gap(snap, { x: arWalls[i].end.x, y: arWalls[i].end.y });
            if (distance1 < distance2 && distance1 < bestDistance) {
                bestDistance = distance1;
                bestVertice = { number: arWalls[i], x: arWalls[i].start.x, y: arWalls[i].start.y, distance: Math.sqrt(bestDistance) };
            }
            if (distance2 < distance1 && distance2 < bestDistance) {
                bestDistance = distance2;
                bestVertice = { number: arWalls[i], x: arWalls[i].end.x, y: arWalls[i].end.y, distance: Math.sqrt(bestDistance) };
            }
        }
        if (bestDistance < range * range) 
            return bestVertice;
        else 
            return false;
    }

    static nearWall(arWalls, snap, range = Infinity) {
        if (arWalls.length == 0) 
            return null;

        var wallDistance = Infinity;
        var wallSelected = {};
        var result;
        for (var i=0; i<arWalls.length; i++) {
            var eq = qSVG.createEquation(arWalls[i].start.x, arWalls[i].start.y, arWalls[i].end.x, arWalls[i].end.y);
            result = qSVG.nearPointOnEquation(eq, snap);
            if (result.distance < wallDistance && qSVG.btwn(result.x, arWalls[i].start.x, arWalls[i].end.x)
                 && qSVG.btwn(result.y, arWalls[i].start.y, arWalls[i].end.y)) {
                wallDistance = result.distance;
                wallSelected = { wall: arWalls[i], x: result.x, y: result.y, distance: result.distance };
            }
        }

        var vv = this._nearVertice(arWalls, snap);
        if (vv.distance < wallDistance) {
            wallDistance = vv.distance;
            wallSelected = { wall: vv.number, x: vv.x, y: vv.y, distance: vv.distance };
        }

        if (wallDistance <= range)  {
            if(Object.keys(wallSelected).length === 0)
                return null;
            else
                return wallSelected;
        } else 
            return null;
    }

    static nearWallNode(arWalls, snap, range = Infinity, except = ['']) {
        var best;
        var bestWall;
        var bestDistance = Infinity;
        for (var k = 0; k < arWalls.length; k++) {
            if (except.indexOf(arWalls[k]) == -1) {
                var scanStart = arWalls[k].start;
                var scanEnd = arWalls[k].end;
                var scanDistance = qSVG.measure(scanStart, snap);
                if (scanDistance < bestDistance) {
                    best = scanStart;
                    bestDistance = scanDistance;
                    bestWall = k;
                }
                scanDistance = qSVG.measure(scanEnd, snap);
                if (scanDistance < bestDistance) {
                    best = scanEnd;
                    bestDistance = scanDistance;
                    bestWall = k;
                }
            }
        }

        if (bestDistance <= range) {
            return ({
                x: best.x,
                y: best.y,
                bestWall: bestWall
            });
        } else {
            return null;
        }
    }

    static insideFloor(floor, snap) {
        if(floor.start.x < snap.x && floor.end.x > snap.x && floor.start.y < snap.y && floor.end.y > snap.y) {
            return true;
        } else {
            return false;
        }
    }

    static getInsideFloor(arFloors, snap) {
        for(let i=0; i<arFloors.length; i++) {
            var floor = arFloors[i];
            if(floor.start.x < snap.x && floor.end.x > snap.x && floor.start.y < snap.y && floor.end.y > snap.y) {
                return floor;
            } 
        }
        return null;
    }

    static _setBestEqPoint(bestEqPoint, distance, index, x, y, x1, y1, x2, y2, way) {
        bestEqPoint.distance = distance;
        bestEqPoint.node = index;
        bestEqPoint.x = x;
        bestEqPoint.y = y;
        bestEqPoint.x1 = x1;
        bestEqPoint.y1 = y1;
        bestEqPoint.x2 = x2;
        bestEqPoint.y2 = y2;
        bestEqPoint.way = way;
    }

    static intersection(arWalls, snap, range = Infinity, except = ['']) {
        // ORANGE LINES 90° NEAR SEGMENT
        let bestEqPoint = {};
        let equation = {};

        bestEqPoint.distance = range;

        Util.intersectionOff();

        this.lineIntersectionP = qSVG.create("boxBind", "path", { // ORANGE TEMP LINE FOR ANGLE 0 90 45 -+
            d: "",
            "stroke": "transparent",
            "stroke-width": 0.5,
            "stroke-opacity": "1",
            fill: "none"
        });

        for (let index = 0; index < arWalls.length; index++) {
            if (except.indexOf(arWalls[index]) === -1) {
                let x1 = arWalls[index].start.x;
                let y1 = arWalls[index].start.y;
                let x2 = arWalls[index].end.x;
                let y2 = arWalls[index].end.y;

                // EQUATION 90° of segment nf/nf-1 at X2/Y2 Point
                if (Math.abs(y2 - y1) === 0) {
                    equation.C = 'v'; // C/D equation 90° Coef = -1/E
                    equation.D = x1;
                    equation.E = 'h'; // E/F equation Segment
                    equation.F = y1;
                    equation.G = 'v'; // G/H equation 90° Coef = -1/E
                    equation.H = x2;
                    equation.I = 'h'; // I/J equation Segment
                    equation.J = y2;
                } else if (Math.abs(x2 - x1) === 0) {
                    equation.C = 'h'; // C/D equation 90° Coef = -1/E
                    equation.D = y1;
                    equation.E = 'v'; // E/F equation Segment
                    equation.F = x1;
                    equation.G = 'h'; // G/H equation 90° Coef = -1/E
                    equation.H = y2;
                    equation.I = 'v'; // I/J equation Segment
                    equation.J = x2;
                } else {
                    equation.C = (x1 - x2) / (y2 - y1);
                    equation.D = y1 - (x1 * equation.C);
                    equation.E = (y2 - y1) / (x2 - x1);
                    equation.F = y1 - (x1 * equation.E);
                    equation.G = (x1 - x2) / (y2 - y1);
                    equation.H = y2 - (x2 * equation.C);
                    equation.I = (y2 - y1) / (x2 - x1);
                    equation.J = y2 - (x2 * equation.E);
                }
                equation.A = equation.C;
                equation.B = equation.D;
                var eq = qSVG.nearPointOnEquation(equation, snap);
                if (eq.distance < bestEqPoint.distance) {
                    this._setBestEqPoint(bestEqPoint, eq.distance, index, eq.x, eq.y, x1, y1, x2, y2, 1);
                }
                equation.A = equation.E;
                equation.B = equation.F;
                eq = qSVG.nearPointOnEquation(equation, snap);
                if (eq.distance < bestEqPoint.distance) {
                    this._setBestEqPoint(bestEqPoint, eq.distance, index, eq.x, eq.y, x1, y1, x2, y2, 1);
                }
                equation.A = equation.G;
                equation.B = equation.H;
                eq = qSVG.nearPointOnEquation(equation, snap);
                if (eq.distance < bestEqPoint.distance) {
                    this._setBestEqPoint(bestEqPoint, eq.distance, index, eq.x, eq.y, x1, y1, x2, y2, 2);
                }
                equation.A = equation.I;
                equation.B = equation.J;
                eq = qSVG.nearPointOnEquation(equation, snap);
                if (eq.distance < bestEqPoint.distance) {
                    this._setBestEqPoint(bestEqPoint, eq.distance, index, eq.x, eq.y, x1, y1, x2, y2, 2);
                }
            }
        }

        if (bestEqPoint.distance < range) {
            if (bestEqPoint.way === 2) {
                var path = "M" + bestEqPoint.x1 + "," + bestEqPoint.y1 + " L" + bestEqPoint.x2 + "," + bestEqPoint.y2 + " L" + bestEqPoint.x + "," + bestEqPoint.y;
                this.lineIntersectionP.setAttribute('d',  path);
                this.lineIntersectionP.setAttribute("stroke", "#d7ac57");
            } else {
                var path = "M" + bestEqPoint.x2 + "," + bestEqPoint.y2 + " L" + bestEqPoint.x1 + "," + bestEqPoint.y1 + " L" + bestEqPoint.x + "," + bestEqPoint.y;
                this.lineIntersectionP.setAttribute('d', path);
                this.lineIntersectionP.setAttribute("stroke", "#d7ac57");
            }
            return ({
                x: bestEqPoint.x,
                y: bestEqPoint.y,
                wall: arWalls[bestEqPoint.node],
                distance: bestEqPoint.distance
            });
        } else {
            return null;
        }
    }

    static intersectionOff() {
        // if (typeof (this.lineIntersectionP) != 'undefined') {
        if (this.lineIntersectionP != null) {
            this.lineIntersectionP.remove();
            this.lineIntersectionP = null;
            // delete this.lineIntersectionP;
        }
    }

    static isObjectsEquals(a, b) {
        let isOK = true;
        for (let prop in a) {
            if (a[prop] !== b[prop]) {
                isOK = false;
                break;
            }
        }
        return isOK;
    }

    static limitObj(equation, size, coords) {
        let Px = coords.x;
        let Py = coords.y;
        let Aq = equation.A;
        let Bq = equation.B;
        let pos1, pos2;
        if (Aq === 'v') {
            pos1 = { x: Px, y: Py - size / 2 };
            pos2 = { x: Px, y: Py + size / 2 };
        } else if (Aq === 'h') {
            pos1 = { x: Px - size / 2, y: Py };
            pos2 = { x: Px + size / 2, y: Py };
        } else {
            let A = 1 + Aq * Aq;
            let B = (-2 * Px) + (2 * Aq * Bq) + (-2 * Py * Aq);
            let C = (Px * Px) + (Bq * Bq) - (2 * Py * Bq) + (Py * Py) - (size * size) / 4; // -N
            let Delta = (B * B) - (4 * A * C);
            let posX1 = (-B - (Math.sqrt(Delta))) / (2 * A);
            let posX2 = (-B + (Math.sqrt(Delta))) / (2 * A);
            pos1 = { x: posX1, y: (Aq * posX1) + Bq };
            pos2 = { x: posX2, y: (Aq * posX2) + Bq };
        }
        return [pos1, pos2];
    }

    static area(x1, y1, x2, y2, x3, y3) { 
        return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0); 
    } 

    static containsPoint(coords, x, y) {
        const x1 = coords[0].x;
        const y1 = coords[0].y;
        const x2 = coords[1].x;
        const y2 = coords[1].y;
        const x3 = coords[2].x;
        const y3 = coords[2].y;
        const x4 = coords[3].x;
        const y4 = coords[3].y;

        /* Calculate area of rectangle ABCD */
        let A = this.area(x1, y1, x2, y2, x3, y3) + this.area(x1, y1, x4, y4, x3, y3); 
        let A1 = this.area(x, y, x1, y1, x2, y2); 
        let A2 = this.area(x, y, x2, y2, x3, y3); 
        let A3 = this.area(x, y, x3, y3, x4, y4); 
        let A4 = this.area(x, y, x1, y1, x4, y4); 

        const diff = Math.abs(A -(A1 + A2 + A3 + A4));

        if(diff < 0.0001)
            return true;
        else
            return false;
    }
}
