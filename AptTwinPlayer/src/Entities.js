import * as THREE from 'three';

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
        let angle = 1;
        if(this.ccw == false)
            angle = -1;
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
                this.object.position.x = Number(this.object.position.x) + 0.01;
            } else if(this.openDir == "<=")
                this.object.position.x -= 0.01;

            this.moved +=  0.01;
            if(this.moved >= this.width) {
                this.state = 2; // 2 is opened
            }
        } else if(this.state == 3) {
            if(this.openDir == "=>")
                this.object.position.x -= 0.01;
            else if(this.openDir == "<=")
                this.object.position.x += 0.01;

            this.moved += 0.01;
            if(this.moved >= this.width) {
                this.state = 0;
            }
        }
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
        this.moved = 0;
        if(this.state == 0) {
            this.state = 1; // 1 is opening
        } else if(this.state == 2) {
            this.state = 3; // 3 is closing
        }
    }

    run(timeElapsed) {
        if(this.state == 1) {
            this.object.position.z += 0.01;

            this.moved +=  0.01;
            if(this.moved >= this.depth) {
                this.state = 2; // 2 is opened
            }
        } else if(this.state == 3) {
            this.object.position.z -= 0.01;

            this.moved += 0.01;
            if(this.moved >= this.depth) {
                this.state = 0;
            }
        }
	}
}

export class EntityManager {
    constructor(scene) {
        this.scene = scene;

        this.arGroup = [];
        this.arAnimEntity = [];
        this.arAnimObj = [];
        this.map = new Map();

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
                    scope.map.set(object, door);
                } else if(type == 'window') {
                    let window = new Window(object);
                    scope.arAnimEntity.push(window);
                    scope.arAnimObj.push(object);
                    scope.map.set(object, window);
                } else if(type == 'drawer') {
                    let drawer = new Drawer(object);
                    scope.arAnimEntity.push(drawer);
                    scope.arAnimObj.push(object);
                    scope.map.set(object, drawer);
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
            const entity = this.map.get(obj);
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

    }
}
