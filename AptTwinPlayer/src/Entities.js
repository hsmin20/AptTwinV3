import * as THREE from 'three';

import { GasRangeFlame } from './GasRangeFlame.js';

const Y_AXIS_VECTOR = new THREE.Vector3(0, 1, 0);

function rotateAroundWorldAxis(obj, point, axis, angle) {
	var q = new THREE.Quaternion();
	q.setFromAxisAngle(axis, angle);

	obj.applyQuaternion(q);

	obj.position.sub(point);
	obj.position.applyQuaternion(q);
	obj.position.add(point);
}

class Door {
    constructor(object) {
        this.object = object;
        const geometry = object.geometry;
        const parameters = geometry.parameters;
        this.width = parameters.width;

        this.state = 0; // 0 is closed
        this.pivotPos = new THREE.Vector3();

        this.pivotDir = object.userData.pivotDir;
        let openDir = object.userData.openDir;

        if(this.pivotDir == "left" && openDir == "inward")
            this.ccw = false;
        else if(this.pivotDir == "left" && openDir == "outward")
            this.ccw = true;
        else if(this.pivotDir == "right" && openDir == "inward")
            this.ccw = true;
        else if(this.pivotDir == "right" && openDir == "outward")
            this.ccw = false;

            this.hingex = 1;

        let xoffset = this.hingex * this.width/2;
        this.pivotPos = new THREE.Vector3(this.object.position.x+xoffset, this.object.position.y, 0);

        this.rotated = 0;
    }

    click() {
        if(this.state == 1 || this.state == 3)
            return;

        this.rotated = 0;
        if(this.state == 0) {
            let xoffset = this.hingex * this.width/2;
            if(this.pivotDir == "left")
                xoffset *= -1;

            this.pivotPos = new THREE.Vector3(this.object.position.x+xoffset, this.object.position.y, 0);
            this.state = 1; // 1 is opening
        }
        if(this.state == 2) {
            let offset = -1;
            if(this.ccw)
                offset = 1;

            let xoffset = 0; //this.hingez * this.width/2 * offset;
            let zoffset = this.hingex * this.width/2 * -offset;

            this.pivotPos = new THREE.Vector3(this.object.position.x+xoffset, this.object.position.y, 0);
            this.state = 3; // 3 is closing
        }
    }

    run(timeElapsed) {
        let angle = 2;
        if(this.ccw == false)
            angle = -2;
		if(this.state == 1) {
            this.rotateAroundAxis(this.pivotPos, angle);
            this.rotated += angle;

            if(Math.abs(this.rotated) >=90)
                this.state = 2; // 2 is opened
		} else if(this.state == 3) {
            this.rotateAroundAxis(this.pivotPos, -angle);
            this.rotated += angle;

            if(Math.abs(this.rotated) >=90)
                this.state = 0;
            
        }
	}

    rotateAroundAxis(pp, angle) {
		var pt = pp;
		rotateAroundWorldAxis(this.object, pt, Y_AXIS_VECTOR, angle * Math.PI / 180.0);
	}

    update(state) {
        this.click();
    }
}

class Window {
    constructor(object) {
        this.object = object;
        const geometry = object.geometry;
        const parameters = geometry.parameters;
        this.width = parameters.width;

        this.state = 0; // 0 is closed
        this.moved = 0;
        this.openDir = object.userData.openDir;
    }

    click() {
        if(this.state == 1 || this.state == 3)
            return;

        this.moved = 0;
        if(this.state == 0) {
            this.state = 1; // 1 is opening
        } else if(this.state == 2) {
            this.state = 3; // 3 is closing
        }
    }

    run(timeElapsed) {
        if(this.state == 1) {
            if(this.openDir == "=>") {
                this.object.position.x = Number(this.object.position.x) + 0.02;
            } else if(this.openDir == "<=")
                this.object.position.x -= 0.02;

            this.moved +=  0.02;
            if(this.moved >= this.width) {
                this.state = 2; // 2 is opened
            }
        } else if(this.state == 3) {
            if(this.openDir == "=>")
                this.object.position.x -= 0.02;
            else if(this.openDir == "<=")
                this.object.position.x += 0.02;

            this.moved += 0.02;
            if(this.moved >= this.width) {
                this.state = 0;
            }
        }
	}

    update(state) {
        this.click();
    }
}

class Drawer {
    constructor(object) {
        this.object = object;
        const geometry = object.geometry;
        const parameters = geometry.parameters;
        this.depth = parameters.depth;

        this.state = 0; // 0 is closed
        this.moved = 0;
    }

    click() {
        if(this.state == 1 || this.state == 3)
            return;

        this.moved = 0;
        if(this.state == 0) {
            this.state = 1; // 1 is opening
        } else if(this.state == 2) {
            this.state = 3; // 3 is closing
        }
    }

    run(timeElapsed) {
        if(this.state == 1) {
            this.object.position.z += 0.02;

            this.moved +=  0.02;
            if(this.moved >= this.depth) {
                this.state = 2; // 2 is opened
            }
        } else if(this.state == 3) {
            this.object.position.z -= 0.02;

            this.moved += 0.02;
            if(this.moved >= this.depth) {
                this.state = 0;
            }
        }
	}
}

class TV extends THREE.Mesh {
    constructor(width, height, depth) {
        const videoElement = document.createElement("video");
        videoElement.src = "./videos/big_buck_bunny.mp4";
        videoElement.style="display: none;";
        videoElement.loop = true;
        videoElement.playsinline = true;

        //Create your video texture:
        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTexture.needsUpdate = true;
        const videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.FrontSide,
            toneMapped: false,
        });
        videoMaterial.needsUpdate = true;

        //Create screen
        const screen = new THREE.PlaneGeometry(width-0.02, height-0.02);
        // const videoScreen = new THREE.Mesh(screen, videoMaterial);
        super(screen, videoMaterial);

        this.video = videoElement;

        this.name = 'video';
        this.depth = depth;
    }

    update(state) {
        if(state) {
            this.position.z = this.depth / 2.0 + 0.001;
            this.video.play();
            this.playing = true;
        } else {
            this.position.z = 0.0;
            this.video.pause();
            this.playing = false;
        }
    }
}

export class EntityManager {
    constructor(scene) {
        this.scene = scene;

        this.arGroup = [];
        this.arAnimEntity = [];
        this.arAnimObj = [];
        this.mapClickable = new Map();

        this.mapUpdateble = new Map();

        this.build();
    }

    build() {
        var scope = this;
        this.scene.traverse(function(object) {
            if(object.parent == scope.scene && object.type == 'Group') {
                scope.arGroup.push(object);
            }
            if (object.userData.type != undefined) {
                let type = object.userData.type;
                if(type == 'door') {
                    let door = new Door(object);
                    scope.arAnimEntity.push(door);
                    scope.arAnimObj.push(object);
                    scope.mapClickable.set(object, door);

                    const DBid = object.userData.DBid;
                    if(DBid != undefined) {
                        scope.mapUpdateble.set('door'+DBid, door);
                    }
                } else if(type == 'window') {
                    let window = new Window(object);
                    scope.arAnimEntity.push(window);
                    scope.arAnimObj.push(object);
                    scope.mapClickable.set(object, window);

                    const DBid = object.userData.DBid;
                    if(DBid != undefined) {
                        scope.mapUpdateble.set('window'+DBid, window);
                    }
                } else if(type == 'drawer') {
                    let drawer = new Drawer(object);
                    scope.arAnimEntity.push(drawer);
                    scope.arAnimObj.push(object);
                    scope.mapClickable.set(object, drawer);
                }
            }

            if(object.userData?.interiorType == 'GasRange') {
                const height = object.children[0].geometry.parameters.height;
                const flame = new GasRangeFlame(object.name+'flame', 0.25, height, -0.04, 0.05, object);
                scope.arAnimEntity.push(flame);

                const DBid = object.userData.DBid;
                if(DBid != undefined) {
                    scope.mapUpdateble.set('util'+DBid, flame);
                }
            }

            if(object.userData?.interiorType == 'TV') {
                const width = object.children[0].geometry.parameters.width;
                const height = object.children[0].geometry.parameters.height;
                const depth = object.children[0].geometry.parameters.depth;

                const tv = new TV(width, height, depth);
                object.add(tv);

                const DBid = object.userData.DBid;
                if(DBid != undefined) {
                    scope.mapUpdateble.set('util'+DBid, tv);
                }
            }
        });
    }

    intersectObjects(raycaster) {
        return raycaster.intersectObjects(this.arGroup);
    }

    handleMouseClick(raycaster) {
        let intersects = raycaster.intersectObjects(this.arAnimObj);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            const entity = this.mapClickable.get(obj);
            entity.click();
        }
	}

    run(delta) {
        for(let i=0; i<this.arAnimEntity.length; i++) {
            let object = this.arAnimEntity[i];
            object.run(delta);
        }
    }

    update(data) {
        const MAX_NUM = 32;
        const lights = data['light'];
        for(let i=0; i<MAX_NUM; i++) {
            const id = 'light' + i
            const val = (lights >> i) & 1;
            const obj = this.mapUpdateble.get(id);
            if(obj != undefined)
                obj.update(val);
        }
        const doors = data['door'];
        for(let i=0; i<MAX_NUM; i++) {
            const id = 'door' + i
            const val = (doors >> i) & 1;
            const obj = this.mapUpdateble.get(id);
            if(obj != undefined)
                obj.update(val);
        }
        const windows = data['window'];
        for(let i=0; i<MAX_NUM; i++) {
            const id = 'window' + i
            const val = (windows >> i) & 1;
            const obj = this.mapUpdateble.get(id);
            if(obj != undefined)
                obj.update(val);
        }
        const utils = data['util'];
        for(let i=0; i<MAX_NUM; i++) {
            const id = 'util' + i
            const val = (utils >> i) & 1;
            const obj = this.mapUpdateble.get(id);
            if(obj != undefined)
                obj.update(val);
        }
    }
}
