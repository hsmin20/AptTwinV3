import { Storage } from './storage.js';
import { Util, METER } from './util.js';
import { qSVG } from './qSVG.js';
import { Wall, WallType } from './wall.js';
import { Floor } from './floor.js';
import { Door, Door2, Hinge } from './door.js';
import { Window, Window2 } from './window.js';
import { Socle } from './opening.js';
import { Bathtub, Toilet, Bathsink, Kitchensink } from './bathobjects.js';

const Action = { NONE: 0, CLICKED: 1, MOVE: 2 };
export const Mode = { SELECT: 0, DRAW_WALL: 1, BIND: 2, EDIT: 3, CUT: 4, DRAW_FLOOR: 5, DRAW_FLOOR2: 6,DRAW_FLOOR3: 7, DRAW_FLOOR4: 8, DRAW_FLOOR5: 9,
                        ADD_DOOR: 10, ADD_DOOR2: 11, ADD_WINDOW: 12, ADD_WINDOW2: 13, OBJECT: 14, EDIT_DOOR: 15, EDIT_WINDOW: 16, EDIT_FLOOR: 17,
                        ADD_BATHTUB: 18, ADD_TOILET: 19, ADD_BATHSINK: 20, ADD_KITCHENSINK: 21 };
const Binder = { NODE: 0, SEGMENT: 1, RECTNODE: 2, OBJECT: 3, NONE: 4 };
const Magnetic = { NONE: 0, HOR: 1, VER: 2 };
const Drag = { OFF: 0, ON: 1 };
const Grid_Snap = { OFF: 0, ON: 1 };
const Thickness = { WALL: 10, INNERWALL: 5, DOOR: 3, WINDOW: 2 }; // 10 -> 0.2m, and so on. 5, 3, 2 are the best?
export const Color = { WALL:"#666666", DOOR: "#b08307", WINDOW: "#6f7ced" };
const Side = { UP: 0, DOWN: 1 };

const BIND_CIRCLE_DISTANCE = 8;
const RADIUS_CIRCLE_BINDER = 8;

let timeoutID;

export let g_factor = 1;
export let g_offset;

export let g_originX_viewbox = 0;
export let g_originY_viewbox = 0;

export class Editor {
    constructor() {
        this.action = Action.NONE;
        this.mode = Mode.SELECT;

        this.floorplannerElement = document.getElementById('floorplanner');
        this.width_viewbox = this.floorplannerElement.clientWidth;
        this.height_viewbox = this.floorplannerElement.clientHeight;
        this.ratio_viewbox = this.height_viewbox / this.width_viewbox;
        
        g_offset = this.floorplannerElement.getBoundingClientRect();

        this.original_width = this.width_viewbox;

        this.grid = 10;

        this.grid_snap = Grid_Snap.OFF;

        this.pox = 0;
        this.poy = 0;

        this.curx = 0;
        this.cury = 0;

        this.arWalls = [];
        this.arFloors = [];
        this.arDoors = [];
        this.arWindows = [];
        this.arBathObjects = [];

        this.arWallListRun = [];

        this.wallEndConstruc = null;

        this.drag = Drag.OFF;

        this.lineconstruc = null;
        this.linetemp = null;
        this.lengthText = null;

        // this.circleBinder = null;
        this.magnetic = Magnetic.NONE;

        this.equation1 = null;
        this.equation2 = null;
        this.equation3 = null;
        this.equationsObj = [];

        this.zoom = 9;

        this.storage = new Storage();
        var onSuccessFunc = this.onSuccessStorage.bind(this);
        this.storage.init(onSuccessFunc);

        let mouseupFunc = this._MOUSEUP.bind(this);
        document.querySelector('#floorplanner').addEventListener("mouseup", mouseupFunc);
        let mousemoveFunc = this._MOUSEMOVE.bind(this);
        document.querySelector('#floorplanner').addEventListener("mousemove", mousemoveFunc);
        let mousedownFunc = this._MOUSEDOWN.bind(this);
        document.querySelector('#floorplanner').addEventListener("mousedown", mousedownFunc, true);

        var resizeFunc = this.resize.bind(this);
        window.addEventListener('resize', resizeFunc);

        this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();this.zoomIn();
        this.resize();
    }

    calcul_snap(event, state) {
        let eX = 0;
        let eY = 0;
        if (event.touches) {
            let touches = event.changedTouches;
            eX = touches[0].pageX;
            eY = touches[0].pageY;
        } else {
            eX = event.pageX;
            eY = event.pageY;
        }
        const x_mouse = (eX * g_factor) - (g_offset.left * g_factor) + g_originX_viewbox;
        const y_mouse = (eY * g_factor) - (g_offset.top * g_factor) + g_originY_viewbox;

        let x_grid = 0;
        let y_grid = 0;
        if (state === Grid_Snap.ON) {
            x_grid = Math.round(x_mouse / this.grid) * this.grid;
            y_grid = Math.round(y_mouse / this.grid) * this.grid;
        }
        if (state === Grid_Snap.OFF) {
            x_grid = x_mouse;
            y_grid = y_mouse;
        }
        return {
            x: x_grid,
            y: y_grid,
            xMouse: x_mouse,
            yMouse: y_mouse
        };
    }

    cursor(tool) {
        if (tool === 'grab') 
            tool = "url('https://wiki.openmrs.org/s/en_GB/7502/b9217199c27dd617c8d51f6186067d7767c5001b/_/images/icons/emoticons/add.png') 8 8, auto";
        if (tool === 'scissor') 
            tool = "url('https://maxcdn.icons8.com/windows10/PNG/64/Hands/hand_scissors-64.png'), auto";
        if (tool === 'trash') 
            tool = "url('https://cdn4.iconfinder.com/data/icons/common-toolbar/36/Cancel-32.png'), auto";
        if (tool === 'validation') 
            tool = "url('https://images.fatguymedia.com/wp-content/uploads/2015/09/check.png'), auto";
        this.floorplannerElement.style.cursor = tool;
    }

    resize() {
        let svgElm = document.querySelector('svg');
        svgElm.setAttribute('viewBox', g_originX_viewbox + ' ' + g_originY_viewbox + ' ' + this.width_viewbox + ' ' + this.height_viewbox);
    }

    // changeToWall() {
    //     if(this.binder != null) {
    //         let wall = this.binder.wall;
    //         wall.thick = Thickness.WALL;
    //         wall.color = Color.WALL;

    //         this._computeWalls();

    //         wall.graph.setAttribute('fill', Color.WALL);
    //         wall.type = WallType.NORMAL;

    //         this.saveState();
    //     }
    // }

    changeDoorHinge() {
        if(this.binder.obj != null) {
            let objTarget = this.binder.obj;
            if(objTarget.type != WallType.DOOR) {
                alert('Not a Door');
                return;
            }
            let hingeStatus = objTarget.hinge; // normal - reverse
            if (hingeStatus === Hinge.NORMAL) {
                objTarget.hinge = Hinge.REVERSE;
            } else { 
                objTarget.hinge = Hinge.NORMAL;
            }
            objTarget.update();

            this.saveState();
        }
    }

    changeWidth() {
        var widthSlider = document.getElementById('doorWindowWidth');

        let sliderValue = widthSlider.value;
        let objTarget = this.binder.obj;
        let wallBindArray = this._rayCastingWalls( {x:objTarget.x, y:objTarget.y} );
        if (wallBindArray.length < 1) {
            alert('No Wall binded');
            return;
        }

        let wallBind = wallBindArray[wallBindArray.length - 1];
        
        let limits = Util.limitObj(wallBind.equations.base, sliderValue, { x:objTarget.x, y:objTarget.y} );
        if (qSVG.btwn(limits[1].x, wallBind.start.x, wallBind.end.x) && qSVG.btwn(limits[1].y, wallBind.start.y, wallBind.end.y) &&
                qSVG.btwn(limits[0].x, wallBind.start.x, wallBind.end.x) && qSVG.btwn(limits[0].y, wallBind.start.y, wallBind.end.y)) {
            objTarget.size = sliderValue;
            objTarget.limit = limits;
            objTarget.update();
            this.binder.size = sliderValue;
            this.binder.limit = limits;
            this.binder.update();
            document.getElementById("doorWindowWidthVal").textContent = (sliderValue / METER).toFixed(2);
        }
        this._showInsideSize(wallBind);
    }

    deleteSome() {
        if(this.mode == Mode.EDIT) {
            this.deleteWall();
        } else if(this.mode == Mode.EDIT_DOOR) {
            this.deleteDoor();
        } else if(this.mode == Mode.EDIT_WINDOW) {
            this.deleteWindow();
        } else if(this.mode == Mode.EDIT_FLOOR) {
            this.deleteFloor();
        } else if(this.mode == Mode.EDIT_OBJECT) {
            this.deleteObject();
        }
    }

    deleteWall() {
        if(this.binder != null) {
            const userResponse = confirm("Do you want to delete this wall?");

            if (userResponse == false)
                return;
            
            let wall = this.binder.wall;
            for (let k in this.arWalls) {
                if (Util.isObjectsEquals(this.arWalls[k].child, wall)) {
                    this.arWalls[k].child = null;
                }
                if (Util.isObjectsEquals(this.arWalls[k].parent, wall)) {
                    this.arWalls[k].parent = null;
                }
            }
            this.arWalls.splice(this.arWalls.indexOf(wall), 1);

            wall.graph.remove();
            this.binder.graph.remove();
            this._computeWalls();

            this._showBothWallSizes();
            this.mode = Mode.SELECT;

            this.saveState();
        }
    }

    deleteFloor() {
        if(this.binder != null) {
            const userResponse = confirm("Do you want to delete this floor?");

            if (userResponse == false)
                return;
            
            let wall = this.binder.wall;
            if(wall.type >= WallType.FLOOR && wall.type <= WallType.FLOOR5) {
                this.arFloors.splice(this.arFloors.indexOf(wall), 1);

                wall.graph.remove();
                this.binder.graph.remove();
                this._computeFloors();

                this.mode = Mode.SELECT;

                this.saveState();
            }
        }
    }

    deleteDoor() {
        if(this.binder.obj != null) {
            const userResponse = confirm("Do you want to delete this door?");

            if (userResponse == false)
                return;

            let obj = this.binder.obj;
            obj.graph.remove();

            this.arDoors.splice(this.arDoors.indexOf(obj), 1);
            
            this.binder.graph.remove();
            delete this.binder;
            
            this._showBothWallSizes();
            this.mode = Mode.SELECT;

            this.saveState();
        }
    }

    deleteWindow() {
        if(this.binder.obj != null) {
            const userResponse = confirm("Do you want to delete this window?");

            if (userResponse == false)
                return;

            let obj = this.binder.obj;
            obj.graph.remove();

            this.arWindows.splice(this.arWindows.indexOf(obj), 1);
            
            this.binder.graph.remove();
            delete this.binder;
            
            this._showBothWallSizes();
            this.mode = Mode.SELECT;

            this.saveState();
        }
    }

    deleteObject() {
        if(this.binder.obj != null) {
            const userResponse = confirm("Do you want to delete this object?");

            if (userResponse == false)
                return;

            let obj = this.binder.obj;
            obj.graph.remove();

            this.arBathObjects.splice(this.arBathObjects.indexOf(obj), 1);
            
            this.binder.graph.remove();
            delete this.binder;
            
            this.mode = Mode.SELECT;

            this.saveState();
        }
    }

    remove_duplicates(arr) {
        var ret_arr = [];
        for (var i = 0; i < arr.length; i++) {
            let wall = arr[i];
            let start = wall.start;
            let end = wall.end;

            var found = false;
            for(var j=0; j<ret_arr.length; j++) {
                let wall2 = ret_arr[j];
                let start2 = wall2.start;
                let end2 = wall2.end;

                if(start.x == start2.x && start.y == start2.y && end.x == end2.x && end.y == end2.y) {
                    console.log("Duplicate found");
                    found = true;
                }
            }
            if(found == false) {
                ret_arr.push(wall);
            }
        }

        return ret_arr;
    }

    

    // Assuming wall has only 1 door or window
    splitWall(wall, containedObjArray) {
        let distObj = [];
        for(let i=0; i<containedObjArray.length; i++) {
            const obj = containedObjArray[i];

            const x = obj.x;
            const y = obj.y;

            const distanceFromStartSquare = (wall.start.x - x) * (wall.start.x - x) + (wall.start.y - y) * (wall.start.y - y);

            distObj.push( { 'obj': obj, 'dist': distanceFromStartSquare });
        }

        distObj.sort((a, b) => a.dist - b.dist);

        let splits = [];

        let startX = wall.coords[0].x;
        let startY = wall.coords[0].y;
        let startX2 = wall.coords[1].x;
        let startY2 = wall.coords[1].y;

        let endX = wall.coords[2].x;
        let endY = wall.coords[2].y;
        let endX2 = wall.coords[3].x;
        let endY2 = wall.coords[3].y;

        for(let i=0; i<distObj.length; i++) {
            const obj = distObj[i].obj;
            const x = obj.x;
            const y = obj.y;
            const size = obj.size;
            const thick = obj.thick;
            let angle = obj.angle;
            if(angle == 180)
                angle = 0;
            else if(angle == 90)
                angle = 270;
            
            if((angle % 90) != 0) {
                if(angle > 180)
                    angle -= 180;
            }

            const angleRadian = -(angle) * (Math.PI / 180);

            let coords = [{ x: -size / 2, y: -thick / 2 }, { x: -size / 2, y: thick / 2 }, { x: size / 2, y: -thick / 2 }, { x: size / 2, y: thick / 2 }];
            const leftTopX = (coords[0].y * Math.sin(angleRadian) + coords[0].x * Math.cos(angleRadian)) + x;
            const leftTopY = (coords[0].y * Math.cos(angleRadian) - coords[0].x * Math.sin(angleRadian)) + y;
            const leftBottomX = (coords[1].y * Math.sin(angleRadian) + coords[1].x * Math.cos(angleRadian)) + x;
            const leftBottomY = (coords[1].y * Math.cos(angleRadian) - coords[1].x * Math.sin(angleRadian)) + y;

            const newCoords1 = [{x:startX, y:startY}, {x:startX2, y:startY2}, {x:leftBottomX, y:leftBottomY}, {x:leftTopX, y:leftTopY}];
            splits.push(newCoords1);

            const rightTopX = (coords[2].y * Math.sin(angleRadian) + coords[3].x * Math.cos(angleRadian)) + x;
            const rightTopY = (coords[2].y * Math.cos(angleRadian) - coords[3].x * Math.sin(angleRadian)) + y;
            const rightBottomX = (coords[3].y * Math.sin(angleRadian) + coords[2].x * Math.cos(angleRadian)) + x;
            const rightBottomY = (coords[3].y * Math.cos(angleRadian) - coords[2].x * Math.sin(angleRadian)) + y;

            startX = rightTopX;
            startY = rightTopY;
            startX2 = rightBottomX;
            startY2 = rightBottomY;

            if(i == (distObj.length -1)) {
                const newCoords2 = [{x:startX, y:startY}, {x:startX2, y:startY2}, {x:endX, y:endY}, {x:endX2, y:endY2}];
                splits.push(newCoords2);
            }
        }

        return splits;
    }

    _getRealWallsArray() {
        let realWallsArray = [];

        for(let i=0; i<this.arWalls.length; i++) {
            let containedObjArray = [];
            
            let wall = this.arWalls[i];
            
            for(let j=0; j<this.arDoors.length; j++) {
                let door = this.arDoors[j];

                if(Util.containsPoint(wall.coords, door.x, door.y)) {
                    containedObjArray.push( door );
                }
            }

            for(let j=0; j<this.arWindows.length; j++) {
                let window = this.arWindows[j];

                if(Util.containsPoint(wall.coords, window.x, window.y)) {
                    containedObjArray.push( window );
                }
            }

            if(containedObjArray.length > 0) {
                let splits = this.splitWall(wall, containedObjArray);
                for(let k=0; k<splits.length; k++) {
                    realWallsArray.push(splits[k]);
                }
            } else {
                realWallsArray.push(wall.coords);
            }
        }

        return realWallsArray;
    }

    export() {
        // Get center to correct all the coordinates
        var minX = -1, minY = -1, maxX = -1, maxY = -1;
        for (var i = 0; i < this.arWalls.length; i++) {
            var px = this.arWalls[i].start.x;
            var py = this.arWalls[i].start.y;
            if (!i || px < minX) minX = px;
            if (!i || py < minY) minY = py;
            if (!i || px > maxX) maxX = px;
            if (!i || py > maxY) maxY = py;
            var px = this.arWalls[i].end.x;
            var py = this.arWalls[i].end.y;
            if (!i || px < minX) minX = px;
            if (!i || py < minY) minY = py;
            if (!i || px > maxX) maxX = px;
            if (!i || py > maxY) maxY = py;
        }

        const centerX = minX + (maxX - minX) / 2.0; 
        const centerY = minY + (maxY - minY) / 2.0;

        // We have center points so change coordinates according to that
        var elementArray = [];

        const realWallCoordsArray = this._getRealWallsArray();
        for(let k in realWallCoordsArray) {
            let coords = realWallCoordsArray[k];

            const x1 = (coords[0].x - centerX) / METER;
            const z1 = (coords[0].y - centerY) / METER;
            const x2 = (coords[1].x - centerX) / METER;
            const z2 = (coords[1].y - centerY) / METER;
            const x3 = (coords[2].x - centerX) / METER;
            const z3 = (coords[2].y - centerY) / METER;
            const x4 = (coords[3].x - centerX) / METER;
            const z4 = (coords[3].y - centerY) / METER;
            
            var arCoords = { 'type': WallType.NORMAL, 'x1': x1, 'z1': z1, 'x2': x2, 'z2': z2, 'x3': x3, 'z3': z3, 'x4': x4, 'z4': z4 };
            elementArray.push(arCoords);
        }
        for(let k in this.arFloors) {
            let floor = this.arFloors[k];

            const type = floor.type;
            const x1 = (floor.start.x - centerX) / METER;
            const z1 = (floor.start.y - centerY) / METER;
            const x2 = (floor.end.x - centerX) / METER;
            const z2 = (floor.end.y - centerY) / METER;

            

            var arCoords = { 'type': type, 'x1': x1, 'z1': z1, 'x2': x2, 'z2': z2 };

            elementArray.push(arCoords);
        }

        for(let k in this.arDoors) {
            let door = this.arDoors[k];

            const type = door.type;
            const x = (door.x - centerX) / METER;
            const z = (door.y - centerY) / METER;
            const angle = door.angle;
            const angleSign = door.angleSign;
            const size = door.size / METER;
            const hinge = door.hinge;
            const thick = door.thick / METER;

            var arCoords = {  'type': type, 'x': x, 'z': z, 'angle': angle, 'angleSign': angleSign, 'size': size, 'hinge': hinge, 'thick': thick };

            elementArray.push(arCoords);
        }

        for(let k in this.arWindows) {
            let window = this.arWindows[k];

            const type = window.type;
            const x = (window.x - centerX) / METER;
            const z = (window.y - centerY) / METER;
            const angle = window.angle;
            const size = window.size / METER;
            const thick = window.thick / METER;

            var arCoords = {  'type': type, 'x': x, 'z': z, 'angle': angle, 'size': size, 'thick': thick };

            elementArray.push(arCoords);
        }

         for(let k in this.arBathObjects) {
            let obj = this.arBathObjects[k];

            const type = obj.type;
            const x = (obj.x - centerX) / METER;
            const z = (obj.y - centerY) / METER;
            const angle = obj.angle;
            const size = obj.size / METER;
            const thick = obj.thick / METER;

            var arCoords = {  'type': type, 'x': x, 'z': z, 'angle': angle, 'size': size, 'thick': thick };

            elementArray.push(arCoords);
        }

        let data = JSON.stringify(elementArray);

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        let url = window.URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
        a.href = url;
        a.download = "2dcoords.json";
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    saveState() {
        let scope = this;
        clearTimeout( timeoutID );
        timeoutID = setTimeout( function () {
            timeoutID = setTimeout( function () {
                scope.storage.set( scope.toJson() );
            }, 100 );
        }, 1000 );
    }

    onSuccessStorage() {
        let scope = this;
        this.storage.get( async function ( state ) {
            if ( state !== undefined ) {
                await scope.fromJson( state );
            }
        } );
    }

    toJson() {
        let elementArray = [];
        for(let i=0; i<this.arWalls.length; i++) {
            let wall = this.arWalls[i];

            let str = wall.toJson();
            elementArray.push(str);
        }

        for(let i=0; i<this.arFloors.length; i++) {
            let floor = this.arFloors[i];

            let str = floor.toJson();
            elementArray.push(str);
        }

        for(let i=0; i<this.arDoors.length; i++) {
            let door = this.arDoors[i];

            let str = door.toJson();
            elementArray.push(str);
        }

        for(let i=0; i<this.arWindows.length; i++) {
            let window = this.arWindows[i];

            let str = window.toJson();
            elementArray.push(str);
        }

        for(let i=0; i<this.arBathObjects.length; i++) {
            let obj = this.arBathObjects[i];

            let str = obj.toJson();
            elementArray.push(str);
        }

        let data = JSON.stringify(elementArray);
        return data;
    }

    save() {
        let data = this.toJson();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        let url = window.URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.style = "display: none";
        document.body.appendChild(a);
        a.href = url;
        a.download = "floorplanner.json";
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    async fromJson ( json ) {
		this.empty();

        const elementArray = JSON.parse(json);
        for(let i=0; i<elementArray.length; i++) {
            let element = elementArray[i];

            if(element.type == WallType.NORMAL) {
                let wall = new Wall(element.start, element.end, element.type, element.thick, element.color);
                this.arWalls.push(wall);
            } else if(element.type >= WallType.FLOOR && element.type <= WallType.FLOOR5) {
                let floor = new Floor(element.start, element.end, element.type);
                this.arFloors.push(floor);
            } else if(element.type == WallType.DOOR) {
                let door = new Door(element.pos, element.angle, element.angleSign, element.size, element.hinge, element.thick);
                door.update();
                this.arDoors.push(door);
            } else if(element.type == WallType.DOOR2) {
                let door = new Door2(element.pos, element.angle, element.angleSign, element.size, element.hinge, element.thick);
                door.update();
                this.arDoors.push(door);
            } else if(element.type == WallType.WINDOW) {
                let window = new Window(element.pos, element.angle, element.size, element.thick);
                window.update();
                this.arWindows.push(window);
            } else if(element.type == WallType.WINDOW2) {
                let window = new Window2(element.pos, element.angle, element.size, element.thick);
                window.update();
                this.arWindows.push(window);
            } else if(element.type == WallType.BATHTUB) {
                let bathtub = new Bathtub(element.pos, element.angle, element.angleSign, element.size, element.thick);
                bathtub.update();
                this.arBathObjects.push(bathtub);
            } else if(element.type == WallType.TOILET) {
                let bathtub = new Toilet(element.pos, element.angle, element.angleSign, element.size, element.thick);
                bathtub.update();
                this.arBathObjects.push(bathtub);
            } else if(element.type == WallType.BATHSINK) {
                let bathtub = new Bathsink(element.pos, element.angle, element.angleSign, element.size, element.thick);
                bathtub.update();
                this.arBathObjects.push(bathtub);
            } else if(element.type == WallType.KITCHENSINK) {
                let bathtub = new Kitchensink(element.pos, element.angle, element.angleSign, element.size, element.thick);
                bathtub.update();
                this.arBathObjects.push(bathtub);
            }
        }

        this._computeWalls();
        this._computeFloors();
        this._computeDoors();
        this._computeWindows();
        this._computeBathObjects();

        this.saveState();
	}

    load() {
        const form = document.createElement( 'form' );
        form.style.display = 'none';
        document.body.appendChild( form );

        const fileInput = document.createElement( 'input' );
        fileInput.multiple = false;
        fileInput.type = 'file';
        fileInput.accetp = '.json';

        let scope = this;
        fileInput.addEventListener( 'change', async function () {
            const file = fileInput.files[ 0 ];
            if ( file === undefined ) return;

            try {
                const json = JSON.parse( await file.text() );

                scope.fromJson(json);
            } catch ( e ) {
                alert( 'Failed To Open Project' );
                console.error( e );
            } finally {
                form.reset();
            }
        } );
        form.appendChild( fileInput );
        fileInput.click();
    }

    empty() {
        this.arWalls = [];
        this.arFloors = [];
        this.arDoors = [];
        this.arWindows = [];
        this.arBathObjects = [];

        this._computeWalls();
        this._computeFloors();
        this._computeDoors();
        this._computeWindows();
        this._computeBathObjects();

        var boxRib = document.getElementById('boxRib');
        while (boxRib.firstChild) {
            boxRib.removeChild(boxRib.firstChild);
        }

        var boxScale = document.getElementById('boxScale');
        while (boxScale.firstChild) {
            boxScale.removeChild(boxScale.firstChild);
        }
    }

    zoomIn() {
        if(this.zoom >= 24)
            return;
        
        const xmove = 50;
        this.zoom++;
        
        this.width_viewbox -= xmove;
        this.height_viewbox = this.width_viewbox * this.ratio_viewbox;

        g_originX_viewbox = g_originX_viewbox + (xmove / 2);
        g_originY_viewbox = g_originY_viewbox + (xmove / 2 * this.ratio_viewbox);

        g_factor = this.width_viewbox / this.original_width;
     
        this.resize();
    }

    zoomOut() {
        if(this.zoom < 2)
            return;
        
        const xmove = 50;
        this.zoom--;
        
        this.width_viewbox += xmove;
        this.height_viewbox = this.width_viewbox * this.ratio_viewbox;

        g_originX_viewbox = g_originX_viewbox - (xmove / 2);
        g_originY_viewbox = g_originY_viewbox - (xmove / 2 * this.ratio_viewbox);

        g_factor = this.width_viewbox / this.original_width;
     
        this.resize();
    }

    zoomReset() {
        this.zoom = 9;
        
        g_originX_viewbox = 0;
        g_originY_viewbox = 0;
        this.width_viewbox = this.original_width;
        this.height_viewbox = this.original_width * this.ratio_viewbox;
        g_factor = 1;

        this.resize();
    }

    _mouseDownNode() {
        var node = this.binder.data;
        this.pox = node.x;
        this.poy = node.y;
        var nodeControl = { x: this.pox, y: this.poy };

        // DETERMINATE DISTANCE OF OPPOSED NODE ON EDGE(s) PARENT(s) OF THIS NODE !!!! NODE 1 -- NODE 2 SYSTE% :-(
        this.arWallListRun = [];
        for (var ee = this.arWalls.length-1; ee>=0; ee--) { // SEARCH MOST YOUNG WALL COORDS IN NODE BINDER
            if (Util.isObjectsEquals(this.arWalls[ee].start, nodeControl) || Util.isObjectsEquals(this.arWalls[ee].end, nodeControl)) {
                this.arWallListRun.push(this.arWalls[ee]);
                break;
            }
        }
        if (this.arWallListRun[0].child != null) {
            if (Util.isObjectsEquals(this.arWallListRun[0].child.start, nodeControl) || Util.isObjectsEquals(this.arWallListRun[0].child.end, nodeControl)) 
                this.arWallListRun.push(this.arWallListRun[0].child);
        }
        if (this.arWallListRun[0].parent != null) {
            if (Util.isObjectsEquals(this.arWallListRun[0].parent.start, nodeControl) || Util.isObjectsEquals(this.arWallListRun[0].parent.end, nodeControl))
                this.arWallListRun.push(this.arWallListRun[0].parent);
        }

        this.magnetic = Magnetic.NONE;

        this.action = Action.CLICKED;
    }

    _handleSegmentParent(wall) {
        if (wall.parent != null) {
            this.equation1 = wall.parent.createEquation();
            var angle12 = qSVG.angleBetweenEquations(this.equation1.A, this.equation2.A);
            if (angle12 < 20 || angle12 > 160) {
                var found = true;
                for (var k in this.arWalls) {
                    if (qSVG.rayCasting(wall.start, this.arWalls[k].coords) && !Util.isObjectsEquals(this.arWalls[k], wall.parent) && !Util.isObjectsEquals(this.arWalls[k], wall)) {
                        if (wall.parent.parent != null && Util.isObjectsEquals(wall, wall.parent.parent))
                            wall.parent.parent = null;
                        if (wall.parent.child != null && Util.isObjectsEquals(wall, wall.parent.child)) 
                            wall.parent.child = null;
                        wall.parent = null;
                        found = false;
                        break;
                    }
                }
                if (found) {
                    var newWall;
                    if (Util.isObjectsEquals(wall.parent.end, wall.start)) {
                        newWall = new Wall(wall.parent.end, wall.start, WallType.NORMAL, wall.thick);
                        this.arWalls.push(newWall);
                        newWall.parent = wall.parent;
                        newWall.child = wall;
                        wall.parent.child = newWall;
                        wall.parent = newWall;
                        this.equation1 = qSVG.perpendicularEquation(this.equation2, wall.start.x, wall.start.y);
                    }
                    else if (Util.isObjectsEquals(wall.parent.start, wall.start)) {
                        newWall = new Wall(wall.parent.start, wall.start, WallType.NORMAL, wall.thick);
                        this.arWalls.push(newWall);
                        newWall.parent = wall.parent;
                        newWall.child = wall;
                        wall.parent.parent = newWall;
                        wall.parent = newWall;
                        this.equation1 = qSVG.perpendicularEquation(this.equation2, wall.start.x, wall.start.y);
                    }
                }
            }
        } else {
            var foundEq = false;
            for (var k in this.arWalls) {
                if (qSVG.rayCasting(wall.start, this.arWalls[k].coords) 
                    && !Util.isObjectsEquals(this.arWalls[k].coords, wall.coords)) {
                    var angleFollow = qSVG.angleBetweenEquations(this.arWalls[k].equations.base.A, this.equation2.A);
                    if (angleFollow < 20 || angleFollow > 160)
                            break;

                    this.equation1 = this.arWalls[k].createEquation();
                    this.equation1.follow = this.arWalls[k];
                    this.equation1.backUp = {
                        coords: this.arWalls[k].coords,
                        start: this.arWalls[k].start,
                        end: this.arWalls[k].end,
                        child: this.arWalls[k].child,
                        parent: this.arWalls[k].parent
                    };
                    foundEq = true;
                    break;
                }
            }
            if (!foundEq) 
                this.equation1 = qSVG.perpendicularEquation(this.equation2, wall.start.x, wall.start.y);
        }
    }

    _handleSegmentChild(wall) {
        if (wall.child != null) {
            this.equation3 = wall.child.createEquation();
            var angle23 = qSVG.angleBetweenEquations(this.equation3.A, this.equation2.A);
            if (angle23 < 20 || angle23 > 160) {
                var found = true;
                for (var k in this.arWalls) {
                    if (qSVG.rayCasting(wall.end, this.arWalls[k].coords) && !Util.isObjectsEquals(this.arWalls[k], wall.child)
                         && !Util.isObjectsEquals(this.arWalls[k], wall)) {
                        if (wall.child.parent != null && Util.isObjectsEquals(wall, wall.child.parent)) 
                            wall.child.parent = null;
                        if (wall.child.child != null && Util.isObjectsEquals(wall, wall.child.child)) 
                            wall.child.child = null;
                        
                        wall.child = null;
                        found = false;
                        break;
                    }
                }
                if (found) {
                    if (Util.isObjectsEquals(wall.child.start, wall.end)) {
                        var newWall = new Wall(wall.end, wall.child.start, WallType.NORMAL, wall.thick);
                        this.arWalls.push(newWall);
                        newWall.parent = wall;
                        newWall.child = wall.child;
                        wall.child.parent = newWall;
                        wall.child = newWall;
                        this.equation3 = qSVG.perpendicularEquation(this.equation2, wall.end.x, wall.end.y);
                    }
                    else if (Util.isObjectsEquals(wall.child.end, wall.end)) {
                        var newWall = new Wall(wall.end, wall.child.end, WallType.NORMAL, wall.thick);
                        this.arWalls.push(newWall);
                        newWall.parent = wall;
                        newWall.child = wall.child;
                        wall.child.child = newWall;
                        wall.child = newWall;
                        this.equation3 = qSVG.perpendicularEquation(this.equation2, wall.end.x, wall.end.y);
                    }
                }
            }
        } else {
            var foundEq = false;
            for (var k in this.arWalls) {
                if (qSVG.rayCasting(wall.end, this.arWalls[k].coords) && !Util.isObjectsEquals(this.arWalls[k].coords, wall.coords)) {
                    var angleFollow = qSVG.angleBetweenEquations(this.arWalls[k].equations.base.A, this.equation2.A);
                    if (angleFollow < 20 || angleFollow > 160)
                        break;

                    this.equation3 = this.arWalls[k].createEquation();
                    this.equation3.follow = this.arWalls[k];
                    this.equation3.backUp = {
                        coords: this.arWalls[k].coords,
                        start: this.arWalls[k].start,
                        end: this.arWalls[k].end,
                        child: this.arWalls[k].child,
                        parent: this.arWalls[k].parent
                    };
                    foundEq = true;
                    break;
                }
            }
            if (!foundEq) 
                this.equation3 = qSVG.perpendicularEquation(this.equation2, wall.end.x, wall.end.y);
        }
    }

    _mouseDownSegment() {
        var wall = this.binder.wall;
        this.binder.before = this.binder.wall.start;
        this.equation2 = wall.createEquation();

        this._handleSegmentParent(wall);

        this._handleSegmentChild(wall);

        this.equationFollowers = [];
        for (var k in this.arWalls) {
            if (this.arWalls[k].child == null && qSVG.rayCasting(this.arWalls[k].end, wall.coords) 
                && !Util.isObjectsEquals(wall, this.arWalls[k])) {
                this.equationFollowers.push({
                    wall: this.arWalls[k],
                    eq: this.arWalls[k].createEquation(),
                    type: "end"
                });
            }
            if (this.arWalls[k].parent == null && qSVG.rayCasting(this.arWalls[k].start, wall.coords) 
                && !Util.isObjectsEquals(wall, this.arWalls[k])) {
                this.equationFollowers.push({
                    wall: this.arWalls[k],
                    eq: this.arWalls[k].createEquation(),
                    type: "start"
                });
            }
        }

        this.action = Action.CLICKED;
    }

     _mouseDownRect() {
        // var floor = this.binder.wall;

        // this.pox = floor.start.x;
        // this.poy = floor.start.y;

        // // this.binder.graph.remove();
        // // delete this.binder;

        // // this.binder = qSVG.create('boxBind', 'circle', {
        // //             id: "circlebinder",
        // //             class: "circle_css_2",
        // //             cx: floor.end.x,
        // //             cy: floor.end.y,
        // //             r: RADIUS_CIRCLE_BINDER
        // //         });
        // // this.binder.data = floor;

        // this._createTempRect();

        this.mode = Mode.EDIT_FLOOR;
        this.binder.type = Binder.RECTNODE;
    }

     _mouseDownRectNode() {
        if(this.binder != null) {
            var floor = this.binder.data;
            this.pox = floor.start.x;
            this.poy = floor.start.y;
            // var nodeControl = { x: this.pox, y: this.poy };

            this.magnetic = Magnetic.NONE;

            this.mode = Mode.EDIT_FLOOR;

            this.action = Action.CLICKED;
        }
    }

    _MOUSEDOWN(event) {
        event.preventDefault();

        if (this.mode == Mode.SELECT) {
            if (this.binder != null) {
                this.mode = Mode.BIND;
                // INIT FOR HELP BINDER NODE MOVING H V (MOUSE DOWN)
                if (this.binder.type == Binder.NODE) {
                    this._mouseDownNode();
                } else if (this.binder.type == Binder.SEGMENT) {
                    this._mouseDownSegment();
                } else if (this.binder.type == Binder.RECT) {
                    this._mouseDownRect();
                } else if (this.binder.type == Binder.RECTNODE) {
                    this._mouseDownRectNode();
                } else if (this.binder.type == Binder.OBJECT) {
                    this.action = Action.CLICKED;
                }
            } else {
                this.action = Action.NONE;
                this.drag = Drag.ON;
                const snap = this.calcul_snap(event, this.grid_snap);
                this.pox = snap.xMouse;
                this.poy = snap.yMouse;
            }
        } else if (this.mode == Mode.DRAW_WALL || (this.mode >= Mode.DRAW_FLOOR && this.mode <= Mode.DRAW_FLOOR5)) {
            if (this.action == Action.NONE) {
                const snap = this.calcul_snap(event, this.grid_snap);
                this.pox = snap.x;
                this.poy = snap.y;
                this.wallStartConstruc = Util.nearWall(this.arWalls, snap, 12);
                if (this.wallStartConstruc != null) { // TO SNAP SEGMENT TO FINALIZE X2Y2
                    this.pox = this.wallStartConstruc.x;
                    this.poy = this.wallStartConstruc.y;
                }
            }
            this.action = Action.CLICKED;
        } else if (this.mode == Mode.EDIT) {
            if (this.binder != null && (this.binder.type == Binder.SEGMENT || this.binder.type == Binder.RECT)) {
                if (this.binder.graph != null) 
                    this.binder.graph.remove();
                delete this.binder;

                this.mode = Mode.SELECT;
            }
        } else if (this.mode == Mode.EDIT_DOOR || this.mode == Mode.EDIT_WINDOW) {
            this.action = Action.CLICKED;

            this.mode = Mode.SELECT;

            this.saveState();
        }
    }

    _checkDoor(snap) {
        var objTarget = null;
        for (var i = 0; i < this.arDoors.length; i++) {
            const door = this.arDoors[i];
            var realBboxCoords = door.coords;
            if (qSVG.rayCasting(snap, realBboxCoords)) {
                objTarget = door;
            }
        }

        return objTarget;
    }

    _checkWindow(snap) {
        var objTarget = null;
        for (var i = 0; i < this.arWindows.length; i++) {
            const window = this.arWindows[i];
            var realBboxCoords = window.coords;
            if (qSVG.rayCasting(snap, realBboxCoords)) {
                objTarget = window;
            }
        }

        return objTarget;
    }

    _checkObject(snap) {
        var objTarget = null;
        for (var i = 0; i < this.arBathObjects.length; i++) {
            const obj = this.arBathObjects[i];
            var realBboxCoords = obj.coords;
            if (qSVG.rayCasting(snap, realBboxCoords)) {
                objTarget = obj;
            }
        }

        return objTarget;
    }

    _handleBinderObject(objTarget, event) {
        if (objTarget !== null) {
            // if (this.binder != null && this.binder.type != Binder.OBJECT) {
            //     this.binder.graph.remove();
            //     delete this.binder;
            //     this.cursor('default');
            // }

            if (this.binder == null) {
                var wallList = this._rayCastingWall(objTarget);
                if (wallList.length > 0) { 
                    this._showInsideSize(wallList); // inWallRib(wallList);
                }
                var thickObj = wallList.length > 0 ? wallList.thick : objTarget.thick;
                var sizeObj = objTarget.size;

                this.binder = new Socle({x: objTarget.x, y: objTarget.y }, objTarget.angle, sizeObj, thickObj, objTarget.type);
                this.binder.update();

                this.binder.oldXY = { x: objTarget.x, y: objTarget.y }; // FOR OBJECT MENU

                var boxBind = document.getElementById('boxBind');
                boxBind.appendChild(this.binder.graph);
            } else {
                if(this.binder.graph.children != undefined) {
                    if (event.target == this.binder.graph.children[0]) {
                        this.cursor('move');
                        this.binder.graph.children[0].setAttribute("class", "circle_css_2");
                        this.binder.type = Binder.OBJECT;
                        this.binder.obj = objTarget;
                    }
                    else {
                        this.cursor('default');
                        this.binder.graph.children[0].setAttribute("class", "circle_css");
                        this.binder.type = Binder.NONE;
                    }
                }
            }
        } else {
            if (this.binder != null) {
                if (this.binder.graph != null)
                    this.binder.graph.remove();

                if (this.binder.type == Binder.NODE)
                    this.binder.remove();

                delete this.binder;
                
                this.cursor('default');
                this._showBothWallSizes(); // rib();
            }
        }

        return objTarget;
    }

    _bindNode(snap) {
        // BIND CIRCLE IF nearNode and GROUP ALL SAME XY SEG POINTS
        var wallNode = Util.nearWallNode(this.arWalls, snap, BIND_CIRCLE_DISTANCE);
        if (wallNode != null) {
            if (this.binder == null || this.binder.type == Binder.NODE) {
                this.binder = qSVG.create('boxBind', 'circle', {
                    id: "circlebinder",
                    class: "circle_css_2",
                    cx: wallNode.x,
                    cy: wallNode.y,
                    r: RADIUS_CIRCLE_BINDER
                });
                this.binder.data = wallNode;
                this.binder.type = Binder.NODE;
            }
            this.cursor('move');

            return true;
        } else {
            if (this.binder != null && this.binder.type == Binder.NODE) {
                this.binder.remove();
                delete this.binder;
                
                var boxBind = document.getElementById('boxBind');
                while (boxBind.firstChild) {
                    boxBind.removeChild(boxBind.firstChild);
                }

                this.cursor('default');
                
                this._showBothWallSizes(); // rib in homrRough
            }

            return false;
        }
    }

    _rayCastingWall(snap) {
        var wallList = [];
        for (var i = 0; i < this.arWalls.length; i++) {
            var polygon = [];
            for (var pp = 0; pp < 4; pp++) {
                polygon.push({ x: this.arWalls[i].coords[pp].x, y: this.arWalls[i].coords[pp].y }); // FOR Z
            }
            if (qSVG.rayCasting(snap, polygon)) {
                wallList.push(this.arWalls[i]); // Return EDGES Index
            }
        }

        if (wallList.length == 1) 
            return wallList[0];
        else 
            return wallList;
    }

    _rayCastingWalls(snap) {
        var wallList = [];
        for (var i = 0; i < this.arWalls.length; i++) {
            var polygon = [];
            for (var pp = 0; pp < 4; pp++) {
                polygon.push({ x: this.arWalls[i].coords[pp].x, y: this.arWalls[i].coords[pp].y }); // FOR Z
            }
            if (qSVG.rayCasting(snap, polygon)) {
                wallList.push(this.arWalls[i]); // Return EDGES Index
            }
        }
        return wallList;
    }

    _bindSegment(snap) {
        let wallBind = this._rayCastingWalls(snap);
        if (wallBind.length > 0) {
            let finalWall = wallBind[wallBind.length - 1];

            if (finalWall && this.binder == null) {
                this.binder = {};
                this.binder.wall = finalWall;

                var line = qSVG.create('none', 'line', {
                    x1: this.binder.wall.start.x, 
                    y1: this.binder.wall.start.y, 
                    x2: this.binder.wall.end.x, 
                    y2: this.binder.wall.end.y,
                    "stroke-width": 5,
                    stroke: "#5cba79"
                });
                var ball1 = qSVG.create('none', 'circle', {
                    class: "circle_css",
                    cx: this.binder.wall.start.x,
                    cy: this.binder.wall.start.y,
                    r: RADIUS_CIRCLE_BINDER / 1.8
                });
                var ball2 = qSVG.create('none', 'circle', {
                    class: "circle_css",
                    cx: this.binder.wall.end.x, 
                    cy: this.binder.wall.end.y,
                    r: RADIUS_CIRCLE_BINDER / 1.8
                });
                this.binder.graph = qSVG.create('none', 'g');
                this.binder.graph.appendChild(line);
                this.binder.graph.appendChild(ball1);
                this.binder.graph.appendChild(ball2);

                var boxBind = document.getElementById('boxBind');
                boxBind.appendChild(this.binder.graph);

                this.binder.type = Binder.SEGMENT;
                this.cursor('pointer');
            }
        } else {
            if (this.binder != null && this.binder.type == Binder.SEGMENT) {
                this.binder.graph.remove();
                delete this.binder;
                
                var boxBind = document.getElementById('boxBind');
                while (boxBind.firstChild) {
                    boxBind.removeChild(boxBind.firstChild);
                }

                this.cursor('default');
                
                this._showBothWallSizes(); // rib in homrRough
            }
        }
    }

    _bindRect(snap) {
        var floor = Util.getInsideFloor(this.arFloors, snap);
        if (floor != null) {
            if(this.binder != null) {
                if(this.binder.graph != null)
                    this.binder.graph.remove();
                else
                    this.binder.remove();
                delete this.binder;

                var boxBind = document.getElementById('boxBind');
                while (boxBind.firstChild) {
                    boxBind.removeChild(boxBind.firstChild);
                }
            }

            this.binder = {};
            this.binder.wall = floor;

            var rect = qSVG.create('none', 'rect', {
                x: floor.start.x,
                y: floor.start.y,
                width: floor.end.x - floor.start.x,
                height: floor.end.y - floor.start.y,
                "fill": '#a9fc03',
                "fill-opacity": 0.9,
                "stroke": "transparent",
                "stroke-width": 1,
                "stroke-opacity": 0.7,
                stroke: "#9fb2e2"
            });

            this.binder.graph = qSVG.create('none', 'g');
            this.binder.graph.appendChild(rect);

            var boxBind = document.getElementById('boxBind');
            boxBind.appendChild(this.binder.graph);

            this.binder.type = Binder.RECT;
            this.cursor('pointer');
        } else {
            if (this.binder != null && this.binder.type == Binder.RECT) {
                this.binder.graph.remove();
                delete this.binder;
                
                var boxBind = document.getElementById('boxBind');
                while (boxBind.firstChild) {
                    boxBind.removeChild(boxBind.firstChild);
                }

                this.cursor('default');
                
                this._showBothWallSizes(); // rib in homrRough
            }
        }
    }

    _moveScreen(xmove, ymove) {
        g_originX_viewbox -= xmove;
        g_originY_viewbox -= ymove;

        this.resize();
    }

    _handleMouseMoveSelect(event, snap) {
        let obj = this._checkDoor(snap);
        if(obj == null)
            obj = this._checkWindow(snap);
        if(obj == null)
            obj = this._checkObject(snap);

        var objTarget = this._handleBinderObject(obj, event);
        if(objTarget != null)
            return;

        this._bindNode(snap);

        this._bindSegment(snap);

        // this._bindRect(snap);

        
    }

    _handleMouseHovering(snap) {
        this.cursor('grab');
        this.pox = snap.x;
        this.poy = snap.y;

        var helpConstruc = Util.intersection(this.arWalls, snap, 25);
        if (helpConstruc != null) {
            if (helpConstruc.distance < 10) {
                this.pox = helpConstruc.x;
                this.poy = helpConstruc.y;

                this.cursor('grab');
            } else {
                this.cursor('crosshair');
            }
        }

        var wallNode = Util.nearWallNode(this.arWalls, snap, BIND_CIRCLE_DISTANCE);
        if (wallNode != null) {
            this.pox = wallNode.x;
            this.poy = wallNode.y;
            this.cursor('grab');
            // if (typeof (binder) == 'undefined') {
            if(this.binder == null) {
                this.binder = qSVG.create('boxBind', 'circle', {
                    id: "circlebinder",
                    class: "circle_css_2",
                    cx: wallNode.x,
                    cy: wallNode.y,
                    r: RADIUS_CIRCLE_BINDER / 1.5
                });
            }
            Util.intersectionOff();
        } else {
            if (helpConstruc == null) 
                this.cursor('crosshair');
            // if (typeof (binder) != "undefined") {
            if(this.binder != null) {
                if (this.binder.graph) 
                    this.binder.graph.remove();
                else { 
                    this.binder.remove();
                    delete this.binder;
                }
            }
        }
    }
    
    _drawHelpLine() {
        var fltt = qSVG.angle(this.pox, this.poy, this.curx, this.cury);
        var flt = Math.abs(fltt.deg);
        var coeff = fltt.deg / flt; // -45 -> -1     45 -> 1
        var phi = this.poy - (coeff * this.pox);
        var Xdiag = (this.cury - phi) / coeff;
        // if (typeof (binder) == 'undefined') {
        if(this.binder == null) {
            // HELP FOR H LINE
            var found = false;
            if (flt < 15 && Math.abs(this.poy - this.cury) < 25) {
                this.cury = this.poy;
                found = true;
            } // HELP FOR V LINE
            if (flt > 75 && Math.abs(this.pox - this.curx) < 25) {
                this.curx = this.pox;
                found = true;
            } // HELP FOR DIAG LINE
            if (flt < 55 && flt > 35 && Math.abs(Xdiag - this.curx) < 20) {
                this.curx = Xdiag;
                found = true;
            }
            if (found) {
                // if(this.lineconstruc != null) // Why this doesn't work?
                var lineconstruc = document.getElementById('line_construc');
                if(lineconstruc != null)
                    lineconstruc.setAttribute("stroke-opacity", '0.7');
            } else {
                // if(this.lineconstruc != null)
                var lineconstruc = document.getElementById('line_construc');
                if(lineconstruc != null)
                    lineconstruc.setAttribute("stroke-opacity", '0.7');
            }
        }
    }
    
    _handleLineBinder(snap) {
        var wallNode = Util.nearWallNode(this.arWalls, snap, BIND_CIRCLE_DISTANCE);
        if (wallNode != null) {
            // if (typeof (binder) == 'undefined') {
            if(this.binder == null) {
                this.binder = qSVG.create('boxBind', 'circle', {
                    id: "circlebinder",
                    class: "circle_css_2",
                    cx: wallNode.x,
                    cy: wallNode.y,
                    r: RADIUS_CIRCLE_BINDER / 1.5
                });
            }

            var lineconstruc = document.getElementById('line_construc');
            lineconstruc.setAttribute( 'x2', wallNode.x );
            lineconstruc.setAttribute( 'y2', wallNode.y );

            this.curx = wallNode.x;
            this.cury = wallNode.y;
            // this.wallEndConstruc = true;
            Util.intersectionOff();
            if (wallNode.bestWall == (this.arWalls.length - 1)) { // && document.getElementById("multi").checked) {
                this.cursor('validation');
            }
            else {
                this.cursor('grab');
            }
        } else {
            if(this.binder != null) {
                if(this.binder.graph != null)
                    this.binder.graph.remove();
                else
                    this.binder.remove();
                delete this.binder;
            }
            if (this.wallEndConstruc === null) 
                this.cursor('crosshair');
        }
    }

    _handleRectBinder(snap) {
        var wallNode = Util.nearWallNode(this.arWalls, snap, BIND_CIRCLE_DISTANCE);
        if (wallNode != null) {
            // if (typeof (binder) == 'undefined') {
            if(this.binder == null) {
                this.binder = qSVG.create('boxBind', 'circle', {
                    id: "circlebinder",
                    class: "circle_css_2",
                    cx: wallNode.x,
                    cy: wallNode.y,
                    r: RADIUS_CIRCLE_BINDER / 1.5
                });
            }

            var rectconstruc = document.getElementById('rect_construc');
            rectconstruc.setAttribute( 'x2', wallNode.x );
            rectconstruc.setAttribute( 'y2', wallNode.y );

            this.curx = wallNode.x;
            this.cury = wallNode.y;
            // this.wallEndConstruc = true;
            Util.intersectionOff();
            if (wallNode.bestWall == (this.arWalls.length - 1)) { // && document.getElementById("multi").checked) {
                this.cursor('validation');
            }
            else {
                this.cursor('grab');
            }
        } else {
            if(this.binder != null) {
                if(this.binder.graph != null)
                    this.binder.graph.remove();
                else
                    this.binder.remove();
                delete this.binder;
            }
            if (this.wallEndConstruc === null) 
                this.cursor('crosshair');
        }
    }
    
    _showWallSize() {
        var startText = qSVG.middle(this.pox, this.poy, this.curx, this.cury);
        var angleText = qSVG.angle(this.pox, this.poy, this.curx, this.cury);
        var valueText = ((qSVG.measure({
                x: this.pox,
                y: this.poy
            }, {
                x: this.curx,
                y: this.cury
            })) / 60).toFixed(2);

        if(this.lengthText == null) {
            this.lengthText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this.lengthText.setAttributeNS(null, 'x', startText.x);
            this.lengthText.setAttributeNS(null, 'y', (startText.y) - 15);
            this.lengthText.setAttributeNS(null, 'text-anchor', 'middle');
            this.lengthText.setAttributeNS(null, 'stroke', 'none');
            this.lengthText.setAttributeNS(null, 'stroke-width', '0.6px');
            this.lengthText.setAttributeNS(null, 'fill', '#777777');
            this.lengthText.textContent = valueText + 'm';

            var boxBind = document.getElementById('boxBind');
            boxBind.appendChild(this.lengthText);
        } else {
            this.lengthText.setAttributeNS(null, 'x', startText.x);
            this.lengthText.setAttributeNS(null, 'y', (startText.y) - 15);
            this.lengthText.setAttribute("transform", "rotate(" + angleText.deg + " " + startText.x + "," + startText.y + ")");
            this.lengthText.textContent = valueText + ' m';

            if (valueText < 0.1) {
                this.lengthText.textContent = "";
            }
        }
    }
    
    _handleMouseMoveDrawWall(snap) {
        this.curx = snap.x;
        this.cury = snap.y;
        const starter = Math.abs(Math.abs(this.pox - snap.x) + Math.abs(this.poy - snap.y));

        if(this.lineconstruc == null) {
            var wallNode = Util.nearWallNode(this.arWalls, snap, BIND_CIRCLE_DISTANCE);
            if (wallNode != null) {
                this.pox = wallNode.x;
                this.poy = wallNode.y;
                this.wallStartConstruc = null;
                if (wallNode.bestWall == this.arWalls.length - 1) {
                    this.cursor('validation');
                }
                else {
                    this.cursor('grab');
                }
            } else {
                this.cursor('crosshair');
            }
        }

        if (starter > this.grid) {
            if(this.lineconstruc == null) {
                this._createTempLine();
            } else { 
                // lines and binders are created
                this._handleTempLine(snap);
                this._showWallSize();
            }
        }
    }

    _handleMouseMoveDrawFloor(snap) {
        this.curx = snap.x;
        this.cury = snap.y;
        const starter = Math.abs(Math.abs(this.pox - snap.x) + Math.abs(this.poy - snap.y));

        if(this.rectconstruc == null) {
            var wallNode = Util.nearWallNode(this.arWalls, snap, BIND_CIRCLE_DISTANCE);
            if (wallNode != null) {
                this.pox = wallNode.x;
                this.poy = wallNode.y;
                this.wallStartConstruc = null;
                if (wallNode.bestWall == this.arWalls.length - 1) {
                    this.cursor('validation');
                }
                else {
                    this.cursor('grab');
                }
            } else {
                this.cursor('crosshair');
            }
        }

        if (starter > this.grid) {
            if(this.rectconstruc == null) {
                this._createTempRect();
            } else { 
                // lines and binders are created
                this._handleTempRect(snap);
            }
        }
    }

     _handleMouseMoveAddDoorWindow(snap) {
        let wallSelect = Util.nearWall(this.arWalls, snap);
        if (wallSelect != null) {
            var wall = wallSelect.wall;
            if (this.binder == null) {
                if(this.mode == Mode.ADD_DOOR) {
                    const door_width = 48; // 60 / METER = 1m, 48 -> 0.8m
                    this.binder = new Door({x:wallSelect.x, y:wallSelect.y}, 0, 0, door_width, Hinge.NORMAL, wall.thick);
                } else if(this.mode == Mode.ADD_DOOR2) {
                    const door_width = 60; // 60 / METER = 1m, 48 -> 0.8m
                    this.binder = new Door2({x:wallSelect.x, y:wallSelect.y}, 0, 0, door_width, Hinge.NORMAL, wall.thick);
                } else if(this.mode == Mode.ADD_WINDOW) {
                    const window_width = 120; // 2m
                    this.binder = new Window({x:wallSelect.x, y:wallSelect.y}, 0, window_width, wall.thick);
                } else if(this.mode == Mode.ADD_WINDOW2) {
                    const window_width2 = 180; // 3m
                    this.binder = new Window2({x:wallSelect.x, y:wallSelect.y}, 0, window_width2, wall.thick);
                }

                var angleWall = qSVG.angleDeg(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
                var v1 = qSVG.vectorXY({ x: wall.start.x, y: wall.start.y }, { x: wall.end.x, y: wall.end.y });
                var v2 = qSVG.vectorXY({ x: wall.end.x, y: wall.end.y }, snap);
                var newAngle = qSVG.vectorDeter(v1, v2);
                if (Math.sign(newAngle) == 1) {
                    angleWall += 180;
                    this.binder.angleSign = 1;
                }
                var startCoords = qSVG.middle(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
                this.binder.x = startCoords.x;
                this.binder.y = startCoords.y;
                this.binder.angle = angleWall % 360;
                
                this.binder.update();

                var boxBind = document.getElementById('boxBind');
                boxBind.appendChild(this.binder.graph);
            } else {
                var angleWall = qSVG.angleDeg(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
                var v1 = qSVG.vectorXY({ x: wall.start.x, y: wall.start.y }, { x: wall.end.x, y: wall.end.y });
                var v2 = qSVG.vectorXY({ x: wall.end.x, y: wall.end.y }, snap);
                var newAngle = qSVG.vectorDeter(v1, v2);
                this.binder.angleSign = 0;
                if (Math.sign(newAngle) == 1) {
                    this.binder.angleSign = 1;
                    angleWall += 180;
                }

                var limits = Util.limitObj(wall.equations.base, this.binder.size, wallSelect);
                if (qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[0].y, wall.start.y, wall.end.y) && qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)) {
                    this.binder.x = wallSelect.x;
                    this.binder.y = wallSelect.y;
                    this.binder.angle = angleWall % 360;
                    this.binder.thick = wall.thick;
                    this.binder.limit = limits;
                    this.binder.update();
                }

                if ((wallSelect.x == wall.start.x && wallSelect.y == wall.start.y) || (wallSelect.x == wall.end.x && wallSelect.y == wall.end.y)) {
                    if (qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[0].y, wall.start.y, wall.end.y)) {
                        this.binder.x = limits[0].x;
                        this.binder.y = limits[0].y;
                    }
                    if (qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)) {
                        this.binder.x = limits[1].x;
                        this.binder.y = limits[1].y;
                    }
                    this.binder.limit = limits;
                    this.binder.angle = angleWall;
                    this.binder.thick = wall.thick;
                   
                    this.binder.update();
                }
            }
        } else {
            if (this.binder != null) {
                this.binder.graph.remove();
                delete this.binder;
            }
        }
    }

    _handleMouseMoveAddBathObject(snap) {
        let wallSelect = Util.nearWall(this.arWalls, snap);
        if (wallSelect != null) {
            var wall = wallSelect.wall;
            if (this.binder == null) {
                if(this.mode == Mode.ADD_BATHTUB) {
                    const width = 96; // 1.6m
                    const length = 36; // 0.6m;
                    this.binder = new Bathtub({x:wallSelect.x, y:wallSelect.y}, 0, 0, width, length);
                } else if(this.mode == Mode.ADD_TOILET) {
                    const width = 24; // 0.4m
                    const length = 18; // 0.3m
                    this.binder = new Toilet({x:wallSelect.x, y:wallSelect.y}, 0, 0, width, length);
                } else if(this.mode == Mode.ADD_BATHSINK) {
                    const width = 30; // 0.5m
                    const length = 24; // 0.4m
                    this.binder = new Bathsink({x:wallSelect.x, y:wallSelect.y}, 0, 0, width, length);
                } else if(this.mode == Mode.ADD_KITCHENSINK) {
                    const width = 132; // 2.2m
                    const length = 30; // 0.5m
                    this.binder = new Kitchensink({x:wallSelect.x, y:wallSelect.y}, 0, 0, width, length);
                }

                var angleWall = qSVG.angleDeg(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
                var v1 = qSVG.vectorXY({ x: wall.start.x, y: wall.start.y }, { x: wall.end.x, y: wall.end.y });
                var v2 = qSVG.vectorXY({ x: wall.end.x, y: wall.end.y }, snap);
                var newAngle = qSVG.vectorDeter(v1, v2);
                if (Math.sign(newAngle) == 1) {
                    angleWall += 180;
                    this.binder.angleSign = 1;
                }
                var startCoords = qSVG.middle(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
                this.binder.x = startCoords.x;
                this.binder.y = startCoords.y;
                this.binder.angle = angleWall % 360;
                
                this.binder.update();

                var boxBind = document.getElementById('boxBind');
                boxBind.appendChild(this.binder.graph);
            } else {
                var angleWall = qSVG.angleDeg(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
                var v1 = qSVG.vectorXY({ x: wall.start.x, y: wall.start.y }, { x: wall.end.x, y: wall.end.y });
                var v2 = qSVG.vectorXY({ x: wall.end.x, y: wall.end.y }, snap);
                var newAngle = qSVG.vectorDeter(v1, v2);
                this.binder.angleSign = 0;
                if (Math.sign(newAngle) == 1) {
                    this.binder.angleSign = 1;
                    angleWall += 180;
                }

                var offset = (wall.thick + this.binder.thick) / 2.0;

                var limits = Util.limitObj(wall.equations.base, this.binder.size, wallSelect);
                if (qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[0].y, wall.start.y, wall.end.y) && qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)) {
                    this.binder.x = wallSelect.x;
                    this.binder.y = wallSelect.y;
                    this.binder.angle = angleWall % 360;

                    if(this.binder.angle == 0)
                        this.binder.y -= offset;
                    else if(this.binder.angle == 180)
                        this.binder.y += offset;
                    else if(this.binder.angle == 90)
                        this.binder.x += offset;
                    else if(this.binder.angle == 270)
                        this.binder.x -= offset;

                    this.binder.limit = limits;
                    this.binder.update();
                }

                if ((wallSelect.x == wall.start.x && wallSelect.y == wall.start.y) || (wallSelect.x == wall.end.x && wallSelect.y == wall.end.y)) {
                    if (qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[0].y, wall.start.y, wall.end.y)) {
                        this.binder.x = limits[0].x;
                        this.binder.y = limits[0].y;
                    }
                    if (qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)) {
                        this.binder.x = limits[1].x;
                        this.binder.y = limits[1].y;
                    }
                    this.binder.limit = limits;
                    this.binder.angle = angleWall;
                   
                    this.binder.update();
                }
            }
        } else {
            if (this.binder != null) {
                this.binder.graph.remove();
                delete this.binder;
            }
        }
    }

    _handleMouseMoveNode(snap) {
        var coords = snap;
        var magnetic = Magnetic.NONE;
        const BINDER_DISTANCE = 5;
        for (var k in this.arWallListRun) {
            if (Util.isObjectsEquals(this.arWallListRun[k].end, this.binder.data)) {
                if (Math.abs(this.arWallListRun[k].start.x - snap.x) < BINDER_DISTANCE) { 
                    coords.x = this.arWallListRun[k].start.x; 
                    magnetic = Magnetic.HOR; 
                }
                if (Math.abs(this.arWallListRun[k].start.y - snap.y) < BINDER_DISTANCE) { 
                    coords.y = this.arWallListRun[k].start.y; 
                    magnetic = Magnetic.VER; 
                }
            }
            if (Util.isObjectsEquals(this.arWallListRun[k].start, this.binder.data)) {
                if (Math.abs(this.arWallListRun[k].end.x - snap.x) < BINDER_DISTANCE) { 
                    coords.x = this.arWallListRun[k].end.x; 
                    magnetic = Magnetic.HOR; 
                }
                if (Math.abs(this.arWallListRun[k].end.y - snap.y) < BINDER_DISTANCE) { 
                    coords.y = this.arWallListRun[k].end.y; 
                    magnetic = Magnetic.VER; 
                }
            }
        }

        const nodeMove = Util.nearWallNode(this.arWalls, snap, BINDER_DISTANCE, this.arWallListRun);
        var coords;
        if (nodeMove != null) {
            coords.x = nodeMove.x;
            coords.y = nodeMove.y;

            var circleBinder = document.getElementById('circlebinder');
            circleBinder.setAttribute('class', 'circleGum');
            circleBinder.setAttribute('cx', coords.x);
            circleBinder.setAttribute('cy', coords.y);

            this.cursor('grab');
        } else {
            if (magnetic != Magnetic.NONE) {
                if (magnetic == Magnetic.HOR) 
                    snap.x = coords.x;
                else 
                    snap.y = coords.y;
            }

            var helpConstruc = Util.intersection(this.arWalls, snap, BINDER_DISTANCE, this.arWallListRun);
            if (helpConstruc != null) {
                coords.x = helpConstruc.x;
                coords.y = helpConstruc.y;
                snap.x = helpConstruc.x;
                snap.y = helpConstruc.y;
                if (magnetic != Magnetic.NONE) {
                    if (magnetic == Magnetic.NOR) 
                        snap.x = coords.x;
                    else 
                        snap.y = coords.y;
                }
                this.cursor('grab');
            } else {
                this.cursor('move');
            }
            this.binder.remove()
        }
        for (var k in this.arWallListRun) {
            if (Util.isObjectsEquals(this.arWallListRun[k].start, this.binder.data)) {
                this.arWallListRun[k].start.x = coords.x;
                this.arWallListRun[k].start.y = coords.y;
            }
            if (Util.isObjectsEquals(this.arWallListRun[k].end, this.binder.data)) {
                this.arWallListRun[k].end.x = coords.x;
                this.arWallListRun[k].end.y = coords.y;
            }
        }

        this.binder.data = coords;
        this._computeWalls(); // UPDATE FALSE
    }

    _handleMouseMoveSegment(snap) {
        if (this.equation2.A == 'v') { 
            this.equation2.B = snap.x; 
        } else if (this.equation2.A == 'h') { 
            this.equation2.B = snap.y; 
        } else { 
            this.equation2.B = snap.y - (snap.x * this.equation2.A); 
        }

        var intersection1 = qSVG.intersectionOfEquations(this.equation1, this.equation2, "obj");
        var intersection2 = qSVG.intersectionOfEquations(this.equation2, this.equation3, "obj");
        // var intersection3 = qSVG.intersectionOfEquations(equation1, equation3, "obj");

        if (this.binder.wall.parent != null) {
            if (Util.isObjectsEquals(this.binder.wall.parent.end, this.binder.wall.start)) 
                this.binder.wall.parent.end = intersection1;
            else if (Util.isObjectsEquals(this.binder.wall.parent.start, this.binder.wall.start)) 
                this.binder.wall.parent.start = intersection1;
            else 
                this.binder.wall.parent.end = intersection1;
        }

        if (this.binder.wall.child != null) {
            if (Util.isObjectsEquals(this.binder.wall.child.start, this.binder.wall.end)) 
                this.binder.wall.child.start = intersection2;
            else if (Util.isObjectsEquals(this.binder.wall.child.end, this.binder.wall.end)) 
                this.binder.wall.child.end = intersection2;
            else 
                this.binder.wall.child.start = intersection2;
        }

        this.binder.wall.start = intersection1;
        this.binder.wall.end = intersection2;
        this.binder.graph.remove()

        // THE EQ FOLLOWED BY eq (PARENT EQ1 --- CHILD EQ3)
        if (this.equation1.follow != undefined) {
            if (!qSVG.rayCasting(intersection1, this.equation1.backUp.coords)) { // IF OUT OF WALL FOLLOWED
                var distanceFromStart = qSVG.gap(this.equation1.backUp.start, intersection1);
                var distanceFromEnd = qSVG.gap(this.equation1.backUp.end, intersection1);
                if (distanceFromStart > distanceFromEnd) { // NEAR FROM End
                    this.equation1.follow.end = intersection1;
                } else {
                    this.equation1.follow.start = intersection1;
                }
            } else {
                this.equation1.follow.end = this.equation1.backUp.end;
                this.equation1.follow.start = this.equation1.backUp.start;
            }
        }
        if (this.equation3.follow != undefined) {
            if (!qSVG.rayCasting(intersection2, this.equation3.backUp.coords)) { // IF OUT OF WALL FOLLOWED
                var distanceFromStart = qSVG.gap(this.equation3.backUp.start, intersection2);
                var distanceFromEnd = qSVG.gap(this.equation3.backUp.end, intersection2);
                if (distanceFromStart > distanceFromEnd) { // NEAR FROM End
                    this.equation3.follow.end = intersection2;
                } else {
                    this.equation3.follow.start = intersection2;
                }
            } else {
                this.equation3.follow.end = this.equation3.backUp.end;
                this.equation3.follow.start = this.equation3.backUp.start;
            }
        }

        // EQ FOLLOWERS WALL MOVING
        for (var i = 0; i < this.equationFollowers.length; i++) {
            var intersectionFollowers = qSVG.intersectionOfEquations(this.equationFollowers[i].eq, this.equation2, "obj");
            if (qSVG.btwn(intersectionFollowers.x, this.binder.wall.start.x, this.binder.wall.end.x, 'round') 
                && qSVG.btwn(intersectionFollowers.y, this.binder.wall.start.y, this.binder.wall.end.y, 'round')) {
                var size = qSVG.measure(this.equationFollowers[i].wall.start, this.equationFollowers[i].wall.end);
                if (this.equationFollowers[i].type == "start") {
                    this.equationFollowers[i].wall.start = intersectionFollowers;
                    if (size < 5) {
                        if (this.equationFollowers[i].wall.child == null) {
                            this.arWalls.splice(this.arWalls.indexOf(this.equationFollowers[i].wall), 1);
                            this.equationFollowers.splice(i, 1);
                        }
                    }
                }
                if (this.equationFollowers[i].type == "end") {
                    this.equationFollowers[i].wall.end = intersectionFollowers;
                    if (size < 5) {
                        if (this.equationFollowers[i].wall.parent == null) {
                            this.arWalls.splice(this.arWalls.indexOf(this.equationFollowers[i].wall), 1);
                            this.equationFollowers.splice(i, 1);
                        }
                    }
                }
            }
        }
        // WALL COMPUTING, BLOCK FAMILY OF BINDERWALL IF NULL (START OR END) !!!!!
        this._computeWalls();
        // let Rooms = qSVG.polygonize(this.arWalls);

        // OBJDATA(s) FOLLOW 90° EDGE SELECTED
        // for (var rp = 0; rp < this.equationsObj.length; rp++) {
        //     var objTarget = this.equationsObj[rp].obj;
        //     var intersectionObj = qSVG.intersectionOfEquations(equationsObj[rp].eq, this.equation2);
        //     // NEW COORDS OBJDATA[o]
        //     objTarget.x = intersectionObj[0];
        //     objTarget.y = intersectionObj[1];
        //     var limits = Util.limitObj(equation2, objTarget.size, objTarget);
        //     if (qSVG.btwn(limits[0].x, this.binder.wall.start.x, this.binder.wall.end.x) 
        //         && qSVG.btwn(limits[0].y, this.binder.wall.start.y, this.binder.wall.end.y) 
        //         && qSVG.btwn(limits[1].x, this.binder.wall.start.x, this.binder.wall.end.x)
        //         && qSVG.btwn(limits[1].y, this.binder.wall.start.y, this.binder.wall.end.y)) {
        //         objTarget.limit = limits;
        //         objTarget.update();
        //     }
        // }
        this.floorplannerElement.style.cursor = 'pointer';
    }

    _handleMouseMoveRect(snap) {

    }

    _handleMouseMoveRectNode(snap) {
        // this.curx = snap.x;
        // this.cury = snap.y;
        // const starter = Math.abs(Math.abs(this.pox - snap.x) + Math.abs(this.poy - snap.y));

        // if(this.rectconstruc == null) {
        //     var wallNode = Util.nearWallNode(this.arWalls, snap, BIND_CIRCLE_DISTANCE);
        //     if (wallNode != null) {
        //         this.pox = wallNode.x;
        //         this.poy = wallNode.y;
        //         this.wallStartConstruc = null;
        //         if (wallNode.bestWall == this.arWalls.length - 1) {
        //             this.cursor('validation');
        //         }
        //         else {
        //             this.cursor('grab');
        //         }
        //     } else {
        //         this.cursor('crosshair');
        //     }
        // }

        // if (starter > this.grid) {
        //     if(this.rectconstruc == null) {
        //         this._createTempRect();
        //     } 
        //     // else { 
        //     //     // lines and binders are created
        //     //     this._handleTempRect(snap);
        //     // }
        // }
    }

    _handleMouseMoveObject(snap) {
        let wallSelect = Util.nearWall(this.arWalls, snap);
        if (wallSelect != null) {
            this._showInsideSize(wallSelect.wall);

            var objTarget = this.binder.obj;
            var wall = wallSelect.wall;
            var angleWall = qSVG.angleDeg(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
            var v1 = qSVG.vectorXY({ x: wall.start.x, y: wall.start.y }, { x: wall.end.x, y: wall.end.y });
            var v2 = qSVG.vectorXY({ x: wall.end.x, y: wall.end.y }, snap);
            var newAngle = qSVG.vectorDeter(v1, v2);

            this.binder.angleSign = 0;
            objTarget.angleSign = 0;
            if (Math.sign(newAngle) == 1) {
                angleWall += 180;
                this.binder.angleSign = 1;
                objTarget.angleSign = 1;
            }

            var limits = Util.limitObj(wall.equations.base, this.binder.size, wallSelect);
            if (qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[0].y, wall.start.y, wall.end.y) && qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)) {
                this.binder.x = wallSelect.x;
                this.binder.y = wallSelect.y;
                this.binder.angle = angleWall % 360;
                objTarget.x = wallSelect.x;
                objTarget.y = wallSelect.y;
                objTarget.angle = angleWall % 360;
                objTarget.limit = limits;

                if(objTarget.type >= WallType.BATHTUB && objTarget.type <= WallType.KITCHENSINK) {
                    var offset = (wall.thick + this.binder.thick) / 2.0;

                    if(this.binder.angle == 0) {
                        this.binder.y -= offset;
                        objTarget.y -= offset;
                    } else if(this.binder.angle == 180) {
                        this.binder.y += offset;
                        objTarget.y += offset;
                    } else if(this.binder.angle == 90) {
                        this.binder.x += offset;
                        objTarget.x += offset;
                    } else if(this.binder.angle == 270) {
                        this.binder.x -= offset;
                        objTarget.x -= offset;
                    }
                } else {
                    this.binder.thick = wall.thick;
                    objTarget.thick = wall.thick;
                }

                this.binder.update();
                objTarget.update();
            }

            if ((wallSelect.x == wall.start.x && wallSelect.y == wall.start.y) || (wallSelect.x == wall.end.x && wallSelect.y == wall.end.y)) {
                if (qSVG.btwn(limits[0].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[0].y, wall.start.y, wall.end.y)) {
                    this.binder.x = limits[0].x;
                    this.binder.y = limits[0].y;
                    objTarget.x = limits[0].x;
                    objTarget.y = limits[0].y;
                    objTarget.limit = limits;
                }
                if (qSVG.btwn(limits[1].x, wall.start.x, wall.end.x) && qSVG.btwn(limits[1].y, wall.start.y, wall.end.y)) {
                    this.binder.x = limits[1].x;
                    this.binder.y = limits[1].y;
                    objTarget.x = limits[1].x;
                    objTarget.y = limits[1].y;
                    objTarget.limit = limits;
                }

                this.binder.angle = angleWall % 360;
                objTarget.angle = angleWall % 360;
                if(objTarget.type <= WallType.BATHTUB || objTarget.type >= WallType.KITCHENSINK) {
                    this.binder.thick = wall.thick;
                    objTarget.thick = wall.thick;
                }
                this.binder.update();
                objTarget.update();
            }
        }
    }

    _showPreWallSizes(start, end, node) {
        const shift = 10;

        const wall = node.wall;
        const angle = wall.angle;
        const dStart = Math.sqrt(Math.pow(wall.start.x - node.x, 2) + Math.pow(wall.start.y - node.y, 2)) / METER;
        const dEnd = Math.sqrt(Math.pow(wall.end.x - node.x, 2) + Math.pow(wall.end.y - node.y, 2)) / METER;

        let sizeText = [];
        var boxRib = document.getElementById('boxRib');
        while (boxRib.firstChild) {
            boxRib.removeChild(boxRib.firstChild);
        }

        let angleText = angle * (180 / Math.PI);
        let shiftValue = -shift;
        if (angleText > 90 || angleText < -89) {
            angleText -= 180;
        }

        for(let n=0; n<2; n++) {
            let valueText = (n == 0) ? dStart : dEnd;

            sizeText[n] = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            let startText = (n == 0) ? qSVG.middle(wall.start.x, wall.start.y, node.x, node.y) : 
                        qSVG.middle(wall.end.x, wall.end.y, node.x, node.y);

            sizeText[n].setAttributeNS(null, 'x', startText.x);
            sizeText[n].setAttributeNS(null, 'y', startText.y + shiftValue);
            sizeText[n].setAttributeNS(null, 'text-anchor', 'middle');
            sizeText[n].setAttributeNS(null, 'font-family', 'roboto');
            sizeText[n].setAttributeNS(null, 'stroke', '#ffffff');
            sizeText[n].textContent = valueText.toFixed(2);
            if (sizeText[n].textContent < 1) {
                sizeText[n].setAttributeNS(null, 'font-size', '0.8em');
                sizeText[n].textContent = sizeText[n].textContent.substring(1, sizeText[n].textContent.length);
            } else sizeText[n].setAttributeNS(null, 'font-size', '0.8em');
            sizeText[n].setAttributeNS(null, 'stroke-width', '0.2px');
            sizeText[n].setAttributeNS(null, 'fill', '#555555');
            sizeText[n].setAttribute("transform", "rotate(" + angleText + " " + startText.x + "," + startText.y + ")");

            boxRib.appendChild(sizeText[n]);
        }
    }

    _handleMouseMoveCut(snap) {
        if (this.binder === undefined) {            
            let addNode = Util.nearWall(this.arWalls, snap, 30);
            if (addNode != null) {
                var x2 = addNode.wall.end.x;
                var y2 = addNode.wall.end.y;
                var x1 = addNode.wall.start.x;
                var y1 = addNode.wall.start.y;
                var angleWall = qSVG.angle(x1, y1, x2, y2);
                this.binder = qSVG.create('boxBind', 'path', {
                    id: "circlebinder",
                    d: "M-20,-10 L-13,0 L-20,10 Z M-13,0 L13,0 M13,0 L20,-10 L20,10 Z",
                    stroke: "#5cba79",
                    fill: "#5cba79",
                    "stroke-width": "1.5px"
                });
                this.binder.setAttribute("transform", 
                    "translate(" + (addNode.x) + "," + (addNode.y) + ") rotate(" + (angleWall.deg + 90) + ",0,0)");
                this.binder.data = addNode;
                this.binder.x1 = x1;
                this.binder.x2 = x2;
                this.binder.y1 = y1;
                this.binder.y2 = y2;
            }
        } else {
            let addNode = Util.nearWall(this.arWalls, snap, 30);
            if (addNode != null) {
                if (Object.keys(addNode).length > 0) {
                    var x2 = addNode.wall.end.x;
                    var y2 = addNode.wall.end.y;
                    var x1 = addNode.wall.start.x;
                    var y1 = addNode.wall.start.y;
                    var angleWall = qSVG.angle(x1, y1, x2, y2);
                    this.binder.setAttribute("transform", 
                        "translate(" + (addNode.x) + "," + (addNode.y) + ") rotate(" + (angleWall.deg + 90) + ",0,0)");
                    this.binder.data = addNode;

                    this._showPreWallSizes({ x:x1, y:y1}, { x:x2, y:y2}, addNode);
                }
                else {
                    if(this.binder != null) {
                        if(this.binder.graph != null)
                            this.binder.graph.remove();
                        else
                            this.binder.remove();
                        delete this.binder;
                    }
                }
            } else {
                if(this.binder != null) {
                    if(this.binder.graph != null)
                        this.binder.graph.remove();
                    else
                        this.binder.remove();
                    delete this.binder;
                }
            }
        }
    }

    _MOUSEMOVE(event) {
        event.preventDefault();

        let snap = this.calcul_snap(event, this.grid_snap);

        if (this.mode == Mode.SELECT) {
            if(this.drag == Drag.ON) {
                const distX = (snap.xMouse - this.pox) * g_factor;
                const distY = (snap.yMouse - this.poy) * g_factor;
                this._moveScreen(distX, distY);
            } else {
                this._handleMouseMoveSelect(event, snap);
            }
        }

        if (this.mode == Mode.DRAW_WALL || (this.mode >= Mode.DRAW_FLOOR && this.mode <= Mode.DRAW_FLOOR5)) {
            if(this.action == Action.NONE) {
                this._handleMouseHovering(snap);
            } else if(this.action == Action.CLICKED) {
                if(this.mode == Mode.DRAW_WALL) {
                    this._handleMouseMoveDrawWall(snap);
                } else {
                    this._handleMouseMoveDrawFloor(snap);
                }
            }
        }

        if (this.mode == Mode.ADD_DOOR || this.mode == Mode.ADD_DOOR2 || this.mode == Mode.ADD_WINDOW || this.mode == Mode.ADD_WINDOW2) {
            this._handleMouseMoveAddDoorWindow(snap);
        }

        if (this.mode == Mode.ADD_BATHTUB || this.mode == Mode.ADD_TOILET || this.mode == Mode.ADD_BATHSINK || this.mode == Mode.ADD_KITCHENSINK) {
            this._handleMouseMoveAddBathObject(snap);
        }

        if (this.mode == Mode.BIND && this.action == Action.CLICKED) {
            if (this.binder.type == Binder.NODE) {
                this._handleMouseMoveNode(snap);
            } else if(this.binder.type == Binder.SEGMENT) {
                this._handleMouseMoveSegment(snap);
            } else if(this.binder.type == Binder.RECT) {
                this._handleMouseMoveRect(snap);
            } else if(this.binder.type == Binder.OBJECT) {
                this._handleMouseMoveObject(snap);
            }

            if (this.binder.type != Binder.OBJECT && this.binder.type != Binder.SEGMENT)
                this._showBothWallSizes(); // rib();
        }

        if(this.mode == Mode.EDIT_FLOOR && this.action == Action.CLICKED) {
            this._handleMouseMoveRectNode(snap);
        }

        if (this.mode == Mode.CUT) {
            this._handleMouseMoveCut(snap);
        }
    }
    
    _getWallNode(coords, except = false) {
        var nodes = [];
        for (var k in this.arWalls) {
            if (!Util.isObjectsEquals(this.arWalls[k], except)) {
                if (Util.isObjectsEquals(this.arWalls[k].start, coords)) {
                    nodes.push({ wall: this.arWalls[k], type: "start" });
                }
                if (Util.isObjectsEquals(this.arWalls[k].end, coords)) {
                    nodes.push({ wall: this.arWalls[k], type: "end" });
                }
            }
        }
        
        return nodes;
    }

    _correctParent(wall) {
        var previousWallStart = 0;
        var previousWallEnd = 0;

        if (wall.parent != null) {
            if (Util.isObjectsEquals(wall.parent.start, wall.start)) {
                var previousWall = wall.parent;
                previousWallStart = previousWall.end;
                previousWallEnd = previousWall.start;
            }
            if (Util.isObjectsEquals(wall.parent.end, wall.start)) {
                var previousWall = wall.parent;
                previousWallStart = previousWall.start;
                previousWallEnd = previousWall.end;
            }
        }
        else {
            var S = this._getWallNode(wall.start, wall);
            for (var k in S) {
                var eqInter = qSVG.createEquation(S[k].wall.start.x, S[k].wall.start.y, S[k].wall.end.x, S[k].wall.end.y)
                var angleInter = 90; // TO PASS TEST
                if (this.action == Action.MOVE) {
                    angleInter = qSVG.angleBetweenEquations(eqInter.A, this.equation2.A);
                }
                if (S[k].type == 'start' && S[k].wall.parent == null && angleInter > 20 && angleInter < 160) {
                    wall.parent = S[k].wall;
                    S[k].wall.parent = wall;
                    var previousWall = wall.parent;
                    previousWallStart = previousWall.end;
                    previousWallEnd = previousWall.start;
                }
                if (S[k].type == 'end' && S[k].wall.child == null && angleInter > 20 && angleInter < 160) {
                    wall.parent = S[k].wall;
                    S[k].wall.child = wall;
                    var previousWall = wall.parent;
                    previousWallStart = previousWall.start;
                    previousWallEnd = previousWall.end;
                }
            }
        }

        return { Start: previousWallStart, End: previousWallEnd };
    }

    _correctChild(wall) {
        var nextWallStart = 0;
        var nextWallEnd = 0;

        if (wall.child != null) {
            if (Util.isObjectsEquals(wall.child.end, wall.end)) {
                var nextWall = wall.child;
                nextWallStart = nextWall.end;
                nextWallEnd = nextWall.start;
            }
            else {
                var nextWall = wall.child;
                nextWallStart = nextWall.start;
                nextWallEnd = nextWall.end;
            }
        }
        else {
            var E = this._getWallNode(wall.end, wall);
            for (var k in E) {
                var eqInter = qSVG.createEquation(E[k].wall.start.x, E[k].wall.start.y, E[k].wall.end.x, E[k].wall.end.y)
                var angleInter = 90; // TO PASS TEST
                if (this.action == Action.MOVE) {
                    angleInter = qSVG.angleBetweenEquations(eqInter.A, this.equation2.A);
                }
                if (E[k].type == 'end' && E[k].wall.child == null && angleInter > 20 && angleInter < 160) {
                    wall.child = E[k].wall;
                    E[k].wall.child = wall;
                    var nextWall = wall.child;
                    nextWallStart = nextWall.end;
                    nextWallEnd = nextWall.start;
                }
                if (E[k].type == 'start' && E[k].wall.parent == null && angleInter > 20 && angleInter < 160) {
                    wall.child = E[k].wall;
                    E[k].wall.parent = wall;
                    var nextWall = wall.child;
                    nextWallStart = nextWall.start;
                    nextWallEnd = nextWall.end;
                }
            }
        }

        return { Start: nextWallStart, End: nextWallEnd };
    }

    _startWall(wall, wallThickX, wallThickY, eqWallUp, eqWallDw, previousWall, angleWall) {
        let dWay = "";

        if (wall.parent == null) {
            var eqP = qSVG.perpendicularEquation(eqWallUp, wall.start.x, wall.start.y);
            var interUp = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
            var interDw = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");
            wall.coords = [interUp, interDw];
            dWay = "M" + interUp.x + "," + interUp.y + " L" + interDw.x + "," + interDw.y + " ";
        } else {
            var parentWall = wall.parent;

            var eqP = qSVG.perpendicularEquation(eqWallUp, wall.start.x, wall.start.y);
            var anglePreviousWall = Math.atan2(previousWall.End.y - previousWall.Start.y, previousWall.End.x - previousWall.Start.x);
            var previousWallThickX = (parentWall.thick / 2) * Math.sin(anglePreviousWall);
            var previousWallThickY = (parentWall.thick / 2) * Math.cos(anglePreviousWall);
            var eqPreviousWallUp = qSVG.createEquation(previousWall.Start.x + previousWallThickX, previousWall.Start.y - previousWallThickY, previousWall.End.x + previousWallThickX, previousWall.End.y - previousWallThickY);
            var eqPreviousWallDw = qSVG.createEquation(previousWall.Start.x - previousWallThickX, previousWall.Start.y + previousWallThickY, previousWall.End.x - previousWallThickX, previousWall.End.y + previousWallThickY);
            if (Math.abs(anglePreviousWall - angleWall) > 0.09) {
                var interUp = qSVG.intersectionOfEquations(eqWallUp, eqPreviousWallUp, "object");
                var interDw = qSVG.intersectionOfEquations(eqWallDw, eqPreviousWallDw, "object");

                if (eqWallUp.A == eqPreviousWallUp.A) {
                    interUp = { x: wall.start.x + wallThickX, y: wall.start.y - wallThickY };
                    interDw = { x: wall.start.x - wallThickX, y: wall.start.y + wallThickY };
                }

                var miter = qSVG.gap(interUp, { x: previousWall.End.x, y: previousWall.End.y });
                if (miter > 1000) {
                    var interUp = qSVG.intersectionOfEquations(eqP, eqWallUp, "object");
                    var interDw = qSVG.intersectionOfEquations(eqP, eqWallDw, "object");
                }
            }
            if (Math.abs(anglePreviousWall - angleWall) <= 0.09) {
                var interUp = qSVG.intersectionOfEquations(eqP, eqWallUp, "object");
                var interDw = qSVG.intersectionOfEquations(eqP, eqWallDw, "object");
            }
            wall.coords = [interUp, interDw];
            dWay = "M" + interUp.x + "," + interUp.y + " L" + interDw.x + "," + interDw.y + " ";
        }

        return dWay;
    }

    _endWall(wall, wallThickX, wallThickY, eqWallUp, eqWallDw, nextWall, angleWall) {
        let dWay = "";

        if (wall.child == null) {
            var eqP = qSVG.perpendicularEquation(eqWallUp, wall.end.x, wall.end.y);
            var interUp = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
            var interDw = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");
            wall.coords.push(interDw, interUp);
            dWay = dWay + "L" + interDw.x + "," + interDw.y + " L" + interUp.x + "," + interUp.y + " Z";
        } else {
            var childWall = wall.child;

            var eqP = qSVG.perpendicularEquation(eqWallUp, wall.end.x, wall.end.y);
            var angleNextWall = Math.atan2(nextWall.End.y - nextWall.Start.y, nextWall.End.x - nextWall.Start.x);
            var nextWallThickX = (childWall.thick / 2) * Math.sin(angleNextWall);
            var nextWallThickY = (childWall.thick / 2) * Math.cos(angleNextWall);
            var eqNextWallUp = qSVG.createEquation(nextWall.Start.x + nextWallThickX, nextWall.Start.y - nextWallThickY, nextWall.End.x + nextWallThickX, nextWall.End.y - nextWallThickY);
            var eqNextWallDw = qSVG.createEquation(nextWall.Start.x - nextWallThickX, nextWall.Start.y + nextWallThickY, nextWall.End.x - nextWallThickX, nextWall.End.y + nextWallThickY);
            if (Math.abs(angleNextWall - angleWall) > 0.09) {
                var interUp = qSVG.intersectionOfEquations(eqWallUp, eqNextWallUp, "object");
                var interDw = qSVG.intersectionOfEquations(eqWallDw, eqNextWallDw, "object");

                if (eqWallUp.A == eqNextWallUp.A) {
                    interUp = { x: wall.end.x + wallThickX, y: wall.end.y - wallThickY };
                    interDw = { x: wall.end.x - wallThickX, y: wall.end.y + wallThickY };
                }

                var miter = qSVG.gap(interUp, { x: nextWall.Start.x, y: nextWall.Start.y });
                if (miter > 1000) {
                    var interUp = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
                    var interDw = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");
                }
            }
            if (Math.abs(angleNextWall - angleWall) <= 0.09) {
                var interUp = qSVG.intersectionOfEquations(eqWallUp, eqP, "object");
                var interDw = qSVG.intersectionOfEquations(eqWallDw, eqP, "object");
            }

            wall.coords.push(interDw, interUp);
            dWay = dWay + "L" + interDw.x + "," + interDw.y + " L" + interUp.x + "," + interUp.y + " Z";
        }

        return dWay;
    }

    _computeWalls() {
        // remove all first
        var boxWall = document.getElementById('boxWall');
        while (boxWall.firstChild) {
            boxWall.removeChild(boxWall.firstChild);
        }

        // check if parent/child is the same with each wall
        for (var vertice = 0; vertice < this.arWalls.length; vertice++) {
            var wall = this.arWalls[vertice];
            if (wall.parent != null) {
                if (!Util.isObjectsEquals(wall.parent.start, wall.start) && !Util.isObjectsEquals(wall.parent.end, wall.start)) {
                    wall.parent = null;
                }
            }
            if (wall.child != null) {
                if (!Util.isObjectsEquals(wall.child.start, wall.end) && !Util.isObjectsEquals(wall.child.end, wall.end)) {
                    wall.child = null;
                }
            }
        }

        for (var vertice = 0; vertice < this.arWalls.length; vertice++) {
            var wall = this.arWalls[vertice];

            let previousWall = this._correctParent(wall);
            let nextWall = this._correctChild(wall);

            var angleWall = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
            wall.angle = angleWall;
            var wallThickX = (wall.thick / 2) * Math.sin(angleWall);
            var wallThickY = (wall.thick / 2) * Math.cos(angleWall);
            var eqWallUp = qSVG.createEquation(wall.start.x + wallThickX, wall.start.y - wallThickY, wall.end.x + wallThickX, wall.end.y - wallThickY);
            var eqWallDw = qSVG.createEquation(wall.start.x - wallThickX, wall.start.y + wallThickY, wall.end.x - wallThickX, wall.end.y + wallThickY);
            var eqWallBase = qSVG.createEquation(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
            wall.equations = { up: eqWallUp, down: eqWallDw, base: eqWallBase };

            // WALL STARTED
            var dWay = this._startWall(wall, wallThickX, wallThickY, eqWallUp, eqWallDw, previousWall, angleWall);

            // WALL FINISHED
            dWay += this._endWall(wall, wallThickX, wallThickY, eqWallUp, eqWallDw, nextWall, angleWall);

            wall.fillGraph(dWay);
           
            boxWall.appendChild(wall.graph);
        }

        this.saveState();
    }

    _computeFloors() {
        // remove all first
        var boxFloor = document.getElementById('boxFloor');
        while (boxFloor.firstChild) {
            boxFloor.removeChild(boxFloor.firstChild);
        }

        // check if parent/child is the same with each wall
        for (var vertice = 0; vertice < this.arFloors.length; vertice++) {
            var floor = this.arFloors[vertice];
            floor.fillGraph();
            boxFloor.appendChild(floor.graph);
        }

        this.saveState();
    }

    _computeDoors() {
        // remove all first
        var boxDoor = document.getElementById('boxDoor');
        while (boxDoor.firstChild) {
            boxDoor.removeChild(boxDoor.firstChild);
        }

        for (var vertice = 0; vertice < this.arDoors.length; vertice++) {
            var door = this.arDoors[vertice];
            boxDoor.appendChild(door.graph);
        }

        this.saveState();
    }

    _computeWindows() {
        // remove all first
        var boxWindow = document.getElementById('boxWindow');
        while (boxWindow.firstChild) {
            boxWindow.removeChild(boxWindow.firstChild);
        }

        for (var vertice = 0; vertice < this.arWindows.length; vertice++) {
            var window = this.arWindows[vertice];
            boxWindow.appendChild(window.graph);
        }

        this.saveState();
    }

    _computeBathObjects() {
        // remove all first
        var boxObject = document.getElementById('boxObject');
        while (boxObject.firstChild) {
            boxObject.removeChild(boxObject.firstChild);
        }

        for (var vertice = 0; vertice < this.arBathObjects.length; vertice++) {
            var obj = this.arBathObjects[vertice];
            boxObject.appendChild(obj.graph);
        }

        this.saveState();
    }

    _createTempLine() {
        // var ws = (this.mode == Mode.PARTITION) ? 20 : 10;
        var ws = 2;

        this.lineconstruc = qSVG.create("boxBind", "line", {
            id: "line_construc",
            x1: this.pox,
            y1: this.poy,
            x2: this.curx,
            y2: this.cury,
            "stroke-width": ws,
            "stroke-linecap": "butt",
            "stroke-opacity": 0.7,
            stroke: "#9fb2e2"
        });

        this.linetemp = qSVG.create("boxBind", "line", {
            id: "linetemp",
            x1: this.pox,
            y1: this.poy,
            x2: this.curx,
            y2: this.cury,
            "stroke": "transparent",
            "stroke-width": 0.5,
            "stroke-opacity": "0.9"
        });
    }

    _handleTempLine(snap) {
        var linetemp = document.getElementById('linetemp');
        if(linetemp != null) {
            linetemp.setAttribute( 'x2', this.curx );
            linetemp.setAttribute( 'y2', this.cury );
        }

        var helpConstrucEnd = Util.intersection(this.arWalls, snap, 10);
        if (helpConstrucEnd != null) {
            this.curx = helpConstrucEnd.x;
            this.cury = helpConstrucEnd.y;
        }

        this.wallEndConstruc = Util.nearWall(this.arWalls, snap, 12)
        if (this.wallEndConstruc != null) { // TO SNAP SEGMENT TO FINALIZE X2Y2
            this.curx = this.wallEndConstruc.x;
            this.cury = this.wallEndConstruc.y;
            this.cursor('grab');
        } else {
            this.cursor('crosshair');
        }

        // nearNode helped to attach the end of the construc line
        this._handleLineBinder(snap);

        // LINETEMP AND LITLLE SNAPPING FOR HELP TO CONSTRUC ANGLE 0 90 45 *****************************************
        this._drawHelpLine();

        var lineconstruc = document.getElementById('line_construc');
        if(lineconstruc != null) {
            lineconstruc.setAttribute('x2', this.curx);
            lineconstruc.setAttribute('y2', this.cury);
        }
    }

    _createTempRect() {
        this.rectconstruc = qSVG.create("boxBind", "rect", {
            id: "rect_construc",
            x: this.pox,
            y: this.poy,
            width: this.curx - this.pox,
            height: this.cury - this.poy,
            "fill": "#dce5f3ff",
            "fill-opacity": 0.9,
            "stroke": "transparent",
            "stroke-width": 1,
            "stroke-opacity": 0.7,
            stroke: "#9fb2e2"
        });

        this.recttemp = qSVG.create("boxBind", "rect", {
            id: "recttemp",
            x: this.pox,
            y: this.poy,
            width: this.curx - this.pox,
            height: this.cury - this.poy,
            "fill": "#dce5f3ff",
            "fill-opacity": 0.9,
            "stroke": "transparent",
            "stroke-width": 0.5,
            "stroke-opacity": "0.9"
        });
    }

    _handleTempRect(snap) {
        var recttemp = document.getElementById('recttemp');
        if(recttemp != null) {
            recttemp.setAttribute( 'width', this.curx - this.pox );
            recttemp.setAttribute( 'height', this.cury - this.poy );
            // recttemp.setAttribute( 'x', this.pox );
            // recttemp.setAttribute( 'y', this.poy );
        }

        var helpConstrucEnd = Util.intersection(this.arWalls, snap, 10);
        if (helpConstrucEnd != null) {
            this.curx = helpConstrucEnd.x;
            this.cury = helpConstrucEnd.y;
        }

        this.wallEndConstruc = Util.nearWall(this.arWalls, snap, 12)
        if (this.wallEndConstruc != null) { // TO SNAP SEGMENT TO FINALIZE X2Y2
            this.curx = this.wallEndConstruc.x;
            this.cury = this.wallEndConstruc.y;
            this.cursor('grab');
        } else {
            this.cursor('crosshair');
        }

        // nearNode helped to attach the end of the construc line
        this._handleRectBinder(snap);

        var rectconstruc = document.getElementById('rect_construc');
        if(rectconstruc != null) {
            // rectconstruc.setAttribute('x', this.pox);
            // rectconstruc.setAttribute('y', this.poy);
            rectconstruc.setAttribute( 'width', this.curx - this.pox );
            rectconstruc.setAttribute( 'height', this.cury - this.poy );
        }
    }

    _handleMouseUpDrawWall(event) {
        if(this.linetemp != null)
            this.linetemp.remove();
        Util.intersectionOff();

        var check_size = qSVG.measure({ x: this.curx, y: this.cury }, { x: this.pox, y: this.poy });
        check_size = check_size / METER;
        
        if (this.lineconstruc != null && check_size > 0.1) {
            var sizeWall = Thickness.WALL;

            var startPos = { x: this.pox, y: this.poy };
            var endPos = { x: this.curx, y: this.cury };

            var eq = qSVG.createEquation(this.pox, this.poy, this.curx, this.cury);
            if(eq.A == 'h') {
                if(startPos.x > endPos.x) {
                    startPos = { x: this.curx, y: this.cury };
                    endPos = { x: this.pox, y: this.poy };
                }
            } else if(eq.A == 'v') {
                if(startPos.y < endPos.y) {
                    startPos = { x: this.curx, y: this.cury };
                    endPos = { x: this.pox, y: this.poy };
                }
            } else {
                if(startPos.x > endPos.x && startPos.y > endPos.y) {
                    startPos = { x: this.curx, y: this.cury };
                    endPos = { x: this.pox, y: this.poy };
                }
            }

            var wall = new Wall(startPos, endPos, WallType.NORMAL, sizeWall);
            this.arWalls.push(wall);
            this._computeWalls();

            this.action = Action.NONE;

            this.lineconstruc.remove();
            delete this.lineconstruc;
            this.lineconstruc = null;

            if(this.lengthText != null) {
                this.lengthText.remove();
                this.lengthText = null;
            }

            if (this.wallEndConstruc != null) 
                this.action = Action.NONE;
            
            this.pox = this.curx;
            this.poy = this.cury;
        } else {
            this.action = Action.NONE;
            if(this.binder != null) {
                this.binder.graph.remove();
                delete this.binder;
            }
            const snap = this.calcul_snap(event, this.grid_snap);
            this.pox = snap.x;
            this.poy = snap.y;
        }
    }

    _handleMouseUpDrawFloor(event) {
        if(this.recttemp != null)
            this.recttemp.remove();
        Util.intersectionOff();

        var check_size = qSVG.measure({ x: this.curx, y: this.cury }, { x: this.pox, y: this.poy });
        check_size = check_size / METER;
        
        if (this.rectconstruc != null && check_size > 0.2) {
            const x1 = this.pox < this.curx ? this.pox : this.curx;
            const x2 = this.pox < this.curx ? this.curx : this.pox;
            const y1 = this.poy < this.cury ? this.poy : this.cury;
            const y2 = this.poy < this.cury ? this.cury : this.poy;

            var floor = new Floor( { x: x1, y: y1 }, { x: x2, y: y2 }, this.mode-3 );
            this.arFloors.push(floor);
            this._computeFloors();

            this.action = Action.NONE;

            this.rectconstruc.remove();
            delete this.rectconstruc;
            this.rectconstruc = null;

            // if(this.lengthText != null) {
            //     this.lengthText.remove();
            //     this.lengthText = null;
            // }

            if (this.wallEndConstruc != null) 
                this.action = Action.NONE;
            
            this.pox = this.curx;
            this.poy = this.cury;
        } else {
            this.action = Action.NONE;
            if(this.binder != null) {
                if(this.binder.graph != null)
                    this.binder.graph.remove();
                else
                    this.binder.remove();
                delete this.binder;
            }
            const snap = this.calcul_snap(event, this.grid_snap);
            this.pox = snap.x;
            this.poy = snap.y;
        }
    }

    _handleMouseUpEditFloor(event) {
        if(this.action == Action.NONE) {
            this.action = Action.CLICKED;
            return;
        }

        if(this.recttemp != null)
            this.recttemp.remove();
        Util.intersectionOff();

        var check_size = qSVG.measure({ x: this.curx, y: this.cury }, { x: this.pox, y: this.poy });
        check_size = check_size / METER;
        
        if (this.rectconstruc != null && check_size > 0.2) {
            let floor = this.binder.wall;
            floor.end.x = this.curx;
            floor.end.y = this.cury;

            this._computeFloors();

            this.action = Action.NONE;
            this.mode = Mode.SELECT;

            this.rectconstruc.remove();
            delete this.rectconstruc;
        } else {
            this.action = Action.NONE;
            if(this.binder != null) {
                if(this.binder.graph != null)
                    this.binder.graph.remove();
                else
                    this.binder.remove();
                delete this.binder;
            }
            const snap = this.calcul_snap(event, this.grid_snap);
            this.pox = snap.x;
            this.poy = snap.y;
        }
    }

    _handleMouseUpAddDoor(event) {
        if (this.binder != null) {
            this.arDoors.push(this.binder);

            var boxDoor = document.getElementById('boxDoor');
            boxDoor.appendChild(this.arDoors[this.arDoors.length-1].graph);
            // boxDoor.appendChild(this.binder.graph);

            // this.binder.graph.remove();
            delete this.binder;

            this.saveState();
        }
    }

    _handleMouseUpAddWindow(event) {
        if (this.binder != null) {
            this.arWindows.push(this.binder);

            var boxWindow = document.getElementById('boxWindow');
            boxWindow.appendChild(this.arWindows[this.arWindows.length-1].graph);
            // boxDoor.appendChild(this.binder.graph);

            // this.binder.graph.remove();
            delete this.binder;

            this.saveState();
        }
    }

    _handleMouseUpAddBathObject(event) {
        if (this.binder != null) {
            this.arBathObjects.push(this.binder);

            var boxObject = document.getElementById('boxObject');
            boxObject.appendChild(this.arBathObjects[this.arBathObjects.length-1].graph);

            // this.binder.graph.remove();
            delete this.binder;

            this.saveState();
        }
    }

    _handleMouseUpBind() {
        this.action = Action.NONE;
        // construc = 0; // CONSTRUC 0 TO FREE BINDER GROUP NODE WALL MOVING
        if (this.binder != null) {
            // fonc_button('select_mode');
            this.mode = Mode.SELECT;
            Util.intersectionOff();

            if (this.binder.type == Binder.NODE) {

            } else if (this.binder.type == Binder.SEGMENT) {
                if (this.binder.wall.start == this.binder.before) {
                    this.mode = Mode.EDIT;
                }
            } else if (this.binder.type == Binder.RECT) {
                this.mode = Mode.EDIT;
            } else if (this.binder.type == Binder.OBJECT) {
                const resizeLimitMin = this.binder.obj.params.resizeLimit.width.min / METER;
                const resizeLimitMax = this.binder.obj.params.resizeLimit.width.max / METER;
                document.getElementById('doorWindowWidth').setAttribute('min', this.binder.obj.params.resizeLimit.width.min);
                document.getElementById('doorWindowWidth').setAttribute('max', this.binder.obj.params.resizeLimit.width.max);
                document.getElementById('doorWindowWidthScale').textContent = resizeLimitMin + "-" + resizeLimitMax;
                document.getElementById("doorWindowWidth").value = this.binder.obj.size;
                document.getElementById("doorWindowWidthVal").textContent = (this.binder.obj.size / METER).toFixed(2);

                if(this.binder.prototype == WallType.DOOR)
                    this.mode = Mode.EDIT_DOOR;
                else if (this.binder.prototype == WallType.WINDOW || this.binder.prototype == WallType.WINDOW2)
                    this.mode = Mode.EDIT_WINDOW;
                else if (this.binder.prototype >= WallType.BATHTUB && this.binder.prototype <= WallType.KITCHENSINK)
                    this.mode = Mode.EDIT_OBJECT;
            }

            if (this.mode == Mode.BIND) {
                this.binder.remove();
                delete this.binder;
            }

            this.saveState();
        }
    }

    _handleMouseUpRect(snap) {
        this.action = Action.NONE;
        if (this.binder != null) {
            this.mode = Mode.SELECT;

            var floor = this.binder.wall;
        }
    }

    _handleMouseUpCut() {
        if (this.binder != undefined) {
            const start = { x: this.binder.data.x, y: this.binder.data.y };
            const end = this.binder.data.wall.end;
            const thick = this.binder.data.wall.thick;
            var newWall = new Wall(start, end, WallType.NORMAL, thick);

            this.arWalls.push(newWall);
            this.binder.data.wall.end = { x: this.binder.data.x, y: this.binder.data.y };
            this.binder.remove();
            delete this.binder;
            this._computeWalls();
        }
        
        // this.mode = Mode.SELECT;
    }

    _showOuterArrows() {
        var minX, minY, maxX, maxY;
        for (var i = 0; i < this.arWalls.length; i++) {
            var px = this.arWalls[i].start.x;
            var py = this.arWalls[i].start.y;
            if (!i || px < minX) minX = px;
            if (!i || py < minY) minY = py;
            if (!i || px > maxX) maxX = px;
            if (!i || py > maxY) maxY = py;
            var px = this.arWalls[i].end.x;
            var py = this.arWalls[i].end.y;
            if (!i || px < minX) minX = px;
            if (!i || py < minY) minY = py;
            if (!i || px > maxX) maxX = px;
            if (!i || py > maxY) maxY = py;
        }
        var width = maxX - minX;
        var height = maxY - minY;

        var labelWidth = ((maxX - minX) / METER).toFixed(2);
        var labelHeight = ((maxY - minY) / METER).toFixed(2);

        var sideRight = 'm' + (maxX + 40) + ',' + minY;
        sideRight = sideRight + ' l60,0 m-40,10 l10,-10 l10,10 m-10,-10';
        sideRight = sideRight + ' l0,' + height;
        sideRight = sideRight + ' m-30,0 l60,0 m-40,-10 l10,10 l10,-10';

        sideRight = sideRight + 'M' + (minX) + ',' + (minY - 40);
        sideRight = sideRight + ' l0,-60 m10,40 l-10,-10 l10,-10 m-10,10';
        sideRight = sideRight + ' l' + width + ',0';
        sideRight = sideRight + ' m0,30 l0,-60 m-10,40 l10,-10 l-10,-10';

        var boxScale = document.getElementById('boxScale');
        while (boxScale.firstChild) {
            boxScale.removeChild(boxScale.firstChild);
        }

        qSVG.create('boxScale', 'path', {
            d: sideRight,
            stroke: "#555",
            fill: "none",
            "stroke-width": 0.3,
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter",
            "stroke-miterlimit": 4,
            "fill-rule": "nonzero"
        });

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttributeNS(null, 'x', (maxX + 70));
        text.setAttributeNS(null, 'y', ((maxY + minY) / 2) + 35);
        text.setAttributeNS(null, 'fill', '#555');
        text.setAttributeNS(null, 'text-anchor', 'middle');
        text.setAttributeNS(null, 'font-size', '0.8em');
        text.textContent = labelHeight + ' m';
        text.setAttribute("transform", "rotate(270 " + (maxX + 70) + "," + (maxY + minY) / 2 + ")");
        
        boxScale.appendChild(text);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttributeNS(null, 'x', (maxX + minX) / 2);
        text.setAttributeNS(null, 'y', (minY - 95));
        text.setAttributeNS(null, 'fill', '#555');
        text.setAttributeNS(null, 'text-anchor', 'middle');
        text.setAttributeNS(null, 'font-size', '0.8em');
        text.textContent = labelWidth + ' m';
        
        boxScale.appendChild(text);
    }

    _MOUSEUP(event) {
        this.drag = Drag.OFF;
        this.cursor('default');

        if (this.mode == Mode.SELECT) {
            if (this.binder != null) {
                this.binder.graph.remove();
                delete this.binder;
            }
        }

        if (this.mode == Mode.DRAW_WALL) {
            this._handleMouseUpDrawWall(event);
        }

        if ((this.mode >= Mode.DRAW_FLOOR && this.mode <= Mode.DRAW_FLOOR5)) {
            this._handleMouseUpDrawFloor(event);
        }

        if (this.mode == Mode.ADD_DOOR || this.mode == Mode.ADD_DOOR2) {
            this._handleMouseUpAddDoor(event);
        }

        if (this.mode == Mode.ADD_WINDOW || this.mode == Mode.ADD_WINDOW2) {
            this._handleMouseUpAddWindow(event);
        }

        if (this.mode == Mode.ADD_BATHTUB || this.mode == Mode.ADD_TOILET || this.mode == Mode.ADD_BATHSINK ||this.mode == Mode.ADD_KITCHENSINK) {
            this._handleMouseUpAddBathObject(event);
        }

        if (this.mode == Mode.BIND) {
            this._handleMouseUpBind();
        }

        if (this.mode == Mode.CUT) {
            this._handleMouseUpCut();
        }

        if (this.mode == Mode.EDIT_FLOOR) {
            // this._handleMouseUpEditFloor(event);
        }

        this._showOuterArrows();
        this._showBothWallSizes(); // rib in homrRough
    }

    _pushToRibMaster(ribMaster, firstIndex, secondIndex, wallIndex, crossEdge, side, coords, distance) {
        ribMaster[firstIndex][secondIndex].push({
            wallIndex: wallIndex,
            crossEdge: crossEdge,
            side: side,
            coords: coords,
            distance: distance
        });
    }

    objFromWall(wall) {
        var objList = [];
        for (var i = 0; i<this.arDoors.length; i++) {
            let door = this.arDoors[i]
            var eq = qSVG.createEquation(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
            var search = qSVG.nearPointOnEquation(eq, door);
            if (search.distance < 0.01 && qSVG.btwn(door.x, wall.start.x, wall.end.x) && qSVG.btwn(door.y, wall.start.y, wall.end.y))
                objList.push(door);
        }

        for (var i = 0; i<this.arWindows.length; i++) {
            let window = this.arWindows[i]
            var eq = qSVG.createEquation(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
            var search = qSVG.nearPointOnEquation(eq, window);
            if (search.distance < 0.01 && qSVG.btwn(window.x, wall.start.x, wall.end.x) && qSVG.btwn(window.y, wall.start.y, wall.end.y))
                objList.push(window);
        }

        for (var i = 0; i<this.arBathObjects.length; i++) {
            let obj = this.arBathObjects[i]
            var eq = qSVG.createEquation(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
            var search = qSVG.nearPointOnEquation(eq, obj);
            if (search.distance < 0.01 && qSVG.btwn(obj.x, wall.start.x, wall.end.x) && qSVG.btwn(obj.y, wall.start.y, wall.end.y))
                objList.push(obj);
        }

        return objList;
    }

    _showInsideSize(wall) {
        var boxRib = document.getElementById('boxRib');
        while (boxRib.firstChild) {
            boxRib.removeChild(boxRib.firstChild);
        }

        let ribMaster = [];
        ribMaster.push([]);
        ribMaster.push([]);
        
        let distance;
        let angleTextValue = wall.angle * (180 / Math.PI);
        let objWall = this.objFromWall(wall); // LIST OBJ ON EDGE
        if (objWall.length == 0) 
            return;

        ribMaster[0].push({ wall: wall, crossObj: false, side: Side.UP, coords: wall.coords[0], distance: 0 });
        ribMaster[1].push({ wall: wall, crossObj: false, side: Side.DOWN, coords: wall.coords[1], distance: 0 });

        let objTarget = null
        for (let ob in objWall) {
            objTarget = objWall[ob];
            
            var limits = Util.limitObj(wall.equations.base, objTarget.size, objTarget);

            objTarget.up = [
                qSVG.nearPointOnEquation(wall.equations.up, limits[0]),
                qSVG.nearPointOnEquation(wall.equations.up, limits[1])
            ];
            objTarget.down = [
                qSVG.nearPointOnEquation(wall.equations.down, limits[0]),
                qSVG.nearPointOnEquation(wall.equations.down, limits[1])
            ];

            distance = qSVG.measure(wall.coords[0], objTarget.up[0]) / METER;
            ribMaster[0].push({
                wall: objTarget,
                crossObj: ob,
                side: Side.UP,
                coords: objTarget.up[0],
                distance: distance.toFixed(2)
            });
            distance = qSVG.measure(wall.coords[0], objTarget.up[1]) / METER;
            ribMaster[0].push({
                wall: objTarget,
                crossObj: ob,
                side: Side.UP,
                coords: objTarget.up[1],
                distance: distance.toFixed(2)
            });
            distance = qSVG.measure(wall.coords[1], objTarget.down[0]) / METER;
            ribMaster[1].push({
                wall: objTarget,
                crossObj: ob,
                side: Side.DOWN,
                coords: objTarget.down[0],
                distance: distance.toFixed(2)
            });
            distance = qSVG.measure(wall.coords[1], objTarget.down[1]) / METER;
            ribMaster[1].push({
                wall: objTarget,
                crossObj: ob,
                side: Side.DOWN,
                coords: objTarget.down[1],
                distance: distance.toFixed(2)
            });
        }
        
        distance = qSVG.measure(wall.coords[0], wall.coords[3]) / METER;
        ribMaster[0].push({ wall: objTarget, crossObj: false, side: Side.UP, coords: wall.coords[3], distance: distance });
        distance = qSVG.measure(wall.coords[1], wall.coords[2]) / METER;
        ribMaster[1].push({ wall: objTarget, crossObj: false, side: Side.DOWN, coords: wall.coords[2], distance: distance });
        ribMaster[0].sort(function (a, b) {
            return (a.distance - b.distance).toFixed(2);
        });
        ribMaster[1].sort(function (a, b) {
            return (a.distance - b.distance).toFixed(2);
        });

        let sizeText = [];
        for (let t in ribMaster) {
            for (let n = 1; n < ribMaster[t].length; n++) {
                let found = true;
                let shift = -5;
                let valueText = Math.abs(ribMaster[t][n - 1].distance - ribMaster[t][n].distance);
                let angleText = angleTextValue;

                if (found) {
                    if (ribMaster[t][n - 1].side === Side.DOWN) {
                        shift = -shift + 10;
                    }
                    if (angleText > 89 || angleText < -89) {
                        angleText -= 180;
                        if (ribMaster[t][n - 1].side === Side.DOWN) {
                            shift = -5;
                        } else {
                            shift = -shift + 10;
                        }
                    }

                    sizeText[n] = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    let startText = qSVG.middle(ribMaster[t][n - 1].coords.x, ribMaster[t][n - 1].coords.y, 
                                                ribMaster[t][n].coords.x, ribMaster[t][n].coords.y);
                    sizeText[n].setAttributeNS(null, 'x', startText.x);
                    sizeText[n].setAttributeNS(null, 'y', (startText.y) + shift);
                    sizeText[n].setAttributeNS(null, 'text-anchor', 'middle');
                    sizeText[n].setAttributeNS(null, 'font-family', 'roboto');
                    sizeText[n].setAttributeNS(null, 'stroke', '#ffffff');
                    sizeText[n].textContent = valueText.toFixed(2);
                    if (sizeText[n].textContent < 1) {
                        sizeText[n].setAttributeNS(null, 'font-size', '0.8em');
                        sizeText[n].textContent = sizeText[n].textContent.substring(1, sizeText[n].textContent.length);
                    } else 
                        sizeText[n].setAttributeNS(null, 'font-size', '1em');
                    sizeText[n].setAttributeNS(null, 'stroke-width', '0.27px');
                    sizeText[n].setAttributeNS(null, 'fill', '#666666');
                    sizeText[n].setAttribute("transform", "rotate(" + angleText + " " + startText.x + "," + (startText.y) + ")");

                    boxRib.appendChild(sizeText[n]);
                }
            }
        }
    }

    _showBothWallSizes() {
        // return false;
        let ribMaster = [];
        ribMaster.push([]); // 2d
        ribMaster.push([]);

        for (let i in this.arWalls) {
            if (this.arWalls[i].equations.base) {
                ribMaster[0].push([]); // 3d
                this._pushToRibMaster(ribMaster, 0, i, i, i, 'up', this.arWalls[i].coords[0], 0);
                ribMaster[1].push([]);
                this._pushToRibMaster(ribMaster, 1, i, i, i, 'down', this.arWalls[i].coords[1], 0);

                for (let p in this.arWalls) {
                    if (i != p && this.arWalls[p].equations.base) {
                        let cross = qSVG.intersectionOfEquations(this.arWalls[i].equations.base, this.arWalls[p].equations.base, "object");
                        if (qSVG.btwn(cross.x, this.arWalls[i].start.x, this.arWalls[i].end.x, 'round') &&
                            qSVG.btwn(cross.y, this.arWalls[i].start.y, this.arWalls[i].end.y, 'round')) {

                            let inter = qSVG.intersectionOfEquations(this.arWalls[i].equations.up, this.arWalls[p].equations.up, "object");
                            if (qSVG.btwn(inter.x, this.arWalls[i].coords[0].x, this.arWalls[i].coords[3].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[i].coords[0].y, this.arWalls[i].coords[3].y, 'round') &&
                                qSVG.btwn(inter.x, this.arWalls[p].coords[0].x, this.arWalls[p].coords[3].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[p].coords[0].y, this.arWalls[p].coords[3].y, 'round')) {
                                let distance = qSVG.measure(this.arWalls[i].coords[0], inter) / METER;
                                this._pushToRibMaster(ribMaster, 0, i, i, p, 'up', inter, distance.toFixed(2));
                            }

                            inter = qSVG.intersectionOfEquations(this.arWalls[i].equations.up, this.arWalls[p].equations.down, "object");
                            if (qSVG.btwn(inter.x, this.arWalls[i].coords[0].x, this.arWalls[i].coords[3].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[i].coords[0].y, this.arWalls[i].coords[3].y, 'round') &&
                                qSVG.btwn(inter.x, this.arWalls[p].coords[1].x, this.arWalls[p].coords[2].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[p].coords[1].y, this.arWalls[p].coords[2].y, 'round')) {
                                let distance = qSVG.measure(this.arWalls[i].coords[0], inter) / METER;
                                this._pushToRibMaster(ribMaster, 0, i, i, p, 'up', inter, distance.toFixed(2));
                            }

                            inter = qSVG.intersectionOfEquations(this.arWalls[i].equations.down, this.arWalls[p].equations.up, "object");
                            if (qSVG.btwn(inter.x, this.arWalls[i].coords[1].x, this.arWalls[i].coords[2].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[i].coords[1].y, this.arWalls[i].coords[2].y, 'round') &&
                                qSVG.btwn(inter.x, this.arWalls[p].coords[0].x, this.arWalls[p].coords[3].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[p].coords[0].y, this.arWalls[p].coords[3].y, 'round')) {
                                let distance = qSVG.measure(this.arWalls[i].coords[1], inter) / METER;
                                this._pushToRibMaster(ribMaster, 1, i, i, p, 'down', inter, distance.toFixed(2));
                            }

                            inter = qSVG.intersectionOfEquations(this.arWalls[i].equations.down, this.arWalls[p].equations.down, "object");
                            if (qSVG.btwn(inter.x, this.arWalls[i].coords[1].x, this.arWalls[i].coords[2].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[i].coords[1].y, this.arWalls[i].coords[2].y, 'round') &&
                                qSVG.btwn(inter.x, this.arWalls[p].coords[1].x, this.arWalls[p].coords[2].x, 'round') &&
                                qSVG.btwn(inter.y, this.arWalls[p].coords[1].y, this.arWalls[p].coords[2].y, 'round')) {
                                let distance = qSVG.measure(this.arWalls[i].coords[1], inter) / METER;
                                this._pushToRibMaster(ribMaster, 1, i, i, p, 'down', inter, distance.toFixed(2));
                            }
                        }
                    }
                }
                let distance = qSVG.measure(this.arWalls[i].coords[0], this.arWalls[i].coords[3]) / METER;
                this._pushToRibMaster(ribMaster, 0, i, i, i, 'up', this.arWalls[i].coords[3], distance.toFixed(2));

                distance = qSVG.measure(this.arWalls[i].coords[1], this.arWalls[i].coords[2]) / METER;
                this._pushToRibMaster(ribMaster, 1, i, i, i, 'down', this.arWalls[i].coords[2], distance.toFixed(2));
            }
        }

        for (let a in ribMaster[0]) {
            ribMaster[0][a].sort(function (a, b) {
                return (a.distance - b.distance).toFixed(2);
            });
        }
        for (let a in ribMaster[1]) {
            ribMaster[1][a].sort(function (a, b) {
                return (a.distance - b.distance).toFixed(2);
            });
        }

        let sizeText = [];
        var boxRib = document.getElementById('boxRib');
        while (boxRib.firstChild) {
            boxRib.removeChild(boxRib.firstChild);
        }
        
        const shift = 5;
        for (let t in ribMaster) {
            for (let a in ribMaster[t]) {
                for (let n = 1; n < ribMaster[t][a].length; n++) {
                    if (ribMaster[t][a][n - 1].wallIndex === ribMaster[t][a][n].wallIndex) {
                        // let edge = ribMaster[t][a][n].wallIndex;
                        let found = true;
                        let valueText = Math.abs(ribMaster[t][a][n - 1].distance - ribMaster[t][a][n].distance);
                        // CLEAR TOO LITTLE VALUE
                        if (valueText < 0.15) {
                            found = false;
                        }
                        // CLEAR (thick) BETWEEN CROSS EDGE
                        if (found && ribMaster[t][a][n - 1].crossEdge === ribMaster[t][a][n].crossEdge && ribMaster[t][a][n].crossEdge !=
                            ribMaster[t][a][n].wallIndex) {
                            found = false;
                        }
                        // CLEAR START INTO EDGE
                        if (found && ribMaster[t][a].length > 2 && n === 1) {
                            let polygon = [];
                            for (let pp = 0; pp < 4; pp++) {
                                polygon.push({
                                    x: this.arWalls[ribMaster[t][a][n].crossEdge].coords[pp].x,
                                    y: this.arWalls[ribMaster[t][a][n].crossEdge].coords[pp].y
                                }); // FOR Z
                            }
                            if (qSVG.rayCasting(ribMaster[t][a][0].coords, polygon)) {
                                found = false;
                            }
                        }
                        // CLEAR END INTO EDGE
                        if (found && ribMaster[t][a].length > 2 && n === ribMaster[t][a].length - 1) {
                            let polygon = [];
                            for (let pp = 0; pp < 4; pp++) {
                                polygon.push({
                                    x: this.arWalls[ribMaster[t][a][n - 1].crossEdge].coords[pp].x,
                                    y: this.arWalls[ribMaster[t][a][n - 1].crossEdge].coords[pp].y
                                }); // FOR Z
                            }
                            if (qSVG.rayCasting(ribMaster[t][a][ribMaster[t][a].length - 1].coords, polygon)) {
                                found = false;
                            }
                        }

                        if (found) {
                            let angleText = this.arWalls[ribMaster[t][a][n].wallIndex].angle * (180 / Math.PI);
                            let shiftValue = -shift;
                            if (ribMaster[t][a][n - 1].side === 'down') {
                                shiftValue = -shiftValue + 10;
                            }
                            if (angleText > 90 || angleText < -89) {
                                angleText -= 180;
                                if (ribMaster[t][a][n - 1].side === 'down') {
                                    shiftValue = -shift;
                                } else shiftValue = -shiftValue + 10;
                            }
                            sizeText[n] = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                            let startText = qSVG.middle(ribMaster[t][a][n - 1].coords.x, ribMaster[t][a][n - 1].coords.y, ribMaster[t][a][n].coords.x,
                                ribMaster[t][a][n].coords.y);
                            sizeText[n].setAttributeNS(null, 'x', startText.x);
                            sizeText[n].setAttributeNS(null, 'y', (startText.y) + (shiftValue));
                            sizeText[n].setAttributeNS(null, 'text-anchor', 'middle');
                            sizeText[n].setAttributeNS(null, 'font-family', 'roboto');
                            sizeText[n].setAttributeNS(null, 'stroke', '#ffffff');
                            sizeText[n].textContent = valueText.toFixed(2);
                            if (sizeText[n].textContent < 1) {
                                sizeText[n].setAttributeNS(null, 'font-size', '0.8em');
                                sizeText[n].textContent = sizeText[n].textContent.substring(1, sizeText[n].textContent.length);
                            } else sizeText[n].setAttributeNS(null, 'font-size', '0.8em');
                            sizeText[n].setAttributeNS(null, 'stroke-width', '0.2px');
                            sizeText[n].setAttributeNS(null, 'fill', '#555555');
                            sizeText[n].setAttribute("transform", "rotate(" + angleText + " " + startText.x + "," + (startText.y) + ")");

                            boxRib.appendChild(sizeText[n]);
                        }
                    }
                }
            }
        }
    }
}
