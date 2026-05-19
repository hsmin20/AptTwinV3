import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GasRangeFlame } from './GasRangeFlame.js';
import { textureHelper } from '../../src_common/TextureHelper.js';

const Y_AXIS_VECTOR = new THREE.Vector3(0, 1, 0);

const CLOSED = 0;
const OPENED = 2;
const OPENING = 1;
const CLOSING = 3;

function rotateAroundWorldAxis(obj, point, axis, angle) {
	var q = new THREE.Quaternion();
	q.setFromAxisAngle(axis, angle);

	obj.applyQuaternion(q);

	obj.position.sub(point);
	obj.position.applyQuaternion(q);
	obj.position.add(point);
}

class Light {
    constructor(object) {
        object.traverse((child) => {
            if (child.isLight) {
                this.light = child;
            }
        });
    }

    update(state) {
        const LIGHT_ON_ILLUMINANCE = 400; // check later
        if(state > LIGHT_ON_ILLUMINANCE)
            this.light.visible = true;
        else
            this.light.visible = false;
    }
}

class PhsyicsObject {
    constructor(object, physicsWorld) {
        // object is actually a group 
        this.obj = object;

        const clone = object.clone();
        clone.rotation.x = 0;
        clone.rotation.y = 0;
        clone.rotation.z = 0;
        const box = new THREE.Box3().setFromObject(clone, true);
        const size = new THREE.Vector3();
        box.getSize(size)

        const groupmass = size.x * size.y * size.z * 70000;

		const shape = new CANNON.Box(new CANNON.Vec3(size.x/2.0, size.y/2.0, size.z/2.0));
		this.body = new CANNON.Body({ mass: groupmass })
		this.body.addShape(shape);

        const pos = this.obj.position;
        const qua = this.obj.quaternion;

		this.body.position.x = pos.x;
		this.body.position.y = pos.y;
		this.body.position.z = pos.z;

		this.body.quaternion.x = qua.x;
		this.body.quaternion.y = qua.y;
		this.body.quaternion.z = qua.z;
		this.body.quaternion.w = qua.w;

        physicsWorld.addBody(this.body);
    }

    updateToPhysicsBody() {
        this.obj.position.set(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        )

        this.obj.quaternion.set(
            this.body.quaternion.x,
            this.body.quaternion.y,
            this.body.quaternion.z,
            this.body.quaternion.w
        )
    }
}

class PlaneWall {
    constructor(object, physicsWorld) {
        this.object = object;
        this.physicsWorld = physicsWorld;

        const geometry = object.geometry;
        const parameters = geometry.parameters;
        const width = parameters.width;
        const height = parameters.height;
        const depth = 0.0001;

        this.buildPhysicsBody(width, depth, height);
    }

    buildPhysicsBody(width, depth, height) {
        const shape = new CANNON.Box(new CANNON.Vec3(width/2.0, height/2.0, depth));
		this.body = new CANNON.Body({ mass: 0 })
		this.body.addShape(shape);

        const pos = new THREE.Vector3();
        const qua = new THREE.Quaternion();
        this.object.getWorldPosition(pos);
        this.object.getWorldQuaternion(qua);

		this.body.position.x = pos.x;
		this.body.position.y = pos.y;
		this.body.position.z = pos.z;

		this.body.quaternion.x = qua.x;
		this.body.quaternion.y = qua.y;
		this.body.quaternion.z = qua.z;
		this.body.quaternion.w = qua.w;

        this.physicsWorld.addBody(this.body);
    }

    updateToPhysicsBody() {}
}

class ExtrudeWall {
    constructor(object, physicsWorld) {
        this.object = object;
        this.physicsWorld = physicsWorld;

        const width = object.userData.width;
        const depth = object.userData.depth;
        const height = object.userData.height;

        const centerx = object.userData.centerx;
        const centerz = object.userData.centerz;

        this.buildPhysicsBody(width, depth, height, centerx, centerz);
    }

    buildPhysicsBody(width, depth, height, centerx, centerz) {
        const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5 * width, 0.5 * height, 0.5 * depth))
        const cubeBody = new CANNON.Body({ mass: 0 })
        cubeBody.addShape(cubeShape)
        cubeBody.position.x = centerx;
        cubeBody.position.y = 0.5 * height;
        cubeBody.position.z = centerz;

        // const theta = Math.atan(depth/width);
        // const euler = new THREE.Euler(0, theta, 0);
        // const quaternion = new THREE.Quaternion().setFromEuler(euler);

        // cubeBody.quaternion.x = quaternion.x;
		// cubeBody.quaternion.y = quaternion.y;
		// cubeBody.quaternion.z = quaternion.z;
		// cubeBody.quaternion.w = quaternion.w;
        
        this.physicsWorld.addBody(cubeBody)
    }

    updateToPhysicsBody() {}
}

class Door {
    constructor(object, physicsWorld, type) {
        this.object = object;

        const geometry = object.geometry;
        const parameters = geometry.parameters;
        this.width = parameters.width;
        const height = parameters.height;
        const depth = parameters.depth;

        this.state = CLOSED;
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

        // build physics body
		const shape = new CANNON.Box(new CANNON.Vec3(this.width/2.0, height/2.0, depth/2.0));
		this.body = new CANNON.Body({ mass: 0 })
		this.body.addShape(shape);

        const pos = new THREE.Vector3();
        const qua = new THREE.Quaternion();
        this.object.getWorldPosition(pos);
        this.object.getWorldQuaternion(qua);

		this.body.position.x = pos.x;
		this.body.position.y = pos.y;
		this.body.position.z = pos.z;

		this.body.quaternion.x = qua.x;
		this.body.quaternion.y = qua.y;
		this.body.quaternion.z = qua.z;
		this.body.quaternion.w = qua.w;

        if(type == 'door')
            physicsWorld.addBody(this.body);
    }

    click() {
        if(this.state == OPENING || this.state == CLOSING)
            return;

        this.rotated = 0;
        if(this.state == CLOSED) {
            let xoffset = this.hingex * this.width/2;
            if(this.pivotDir == "left")
                xoffset *= -1;

            this.pivotPos = new THREE.Vector3(this.object.position.x+xoffset, this.object.position.y, 0);
            this.state = OPENING;
        }
        if(this.state == OPENED) {
            let offset = -1;
            if(this.ccw)
                offset = 1;

            let xoffset = 0; //this.hingez * this.width/2 * offset;
            let zoffset = this.hingex * this.width/2 * -offset;

            this.pivotPos = new THREE.Vector3(this.object.position.x+xoffset, this.object.position.y, 0);
            this.state = CLOSING;
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
                this.state = OPENED;
		} else if(this.state == CLOSING) {
            this.rotateAroundAxis(this.pivotPos, -angle);
            this.rotated += angle;

            if(Math.abs(this.rotated) >=90)
                this.state = CLOSED;
        }
	}

    rotateAroundAxis(pp, angle) {
		var pt = pp;
        rotateAroundWorldAxis(this.object, pt, Y_AXIS_VECTOR, angle * Math.PI / 180.0);
	}

    update(state) {
        if(state == 'off' && this.state == OPENED)
            this.click();
        if(state == 'on' && this.state == CLOSED)
            this.click();
    }

    updateToPhysicsBody() {
        // Here, mesh is copied to physics body! This is reverse!!
        const pos = new THREE.Vector3();
        const qua = new THREE.Quaternion();
        this.object.getWorldPosition(pos);
        this.object.getWorldQuaternion(qua);

		this.body.position.x = pos.x;
		this.body.position.y = pos.y;
		this.body.position.z = pos.z;

		this.body.quaternion.x = qua.x;
		this.body.quaternion.y = qua.y;
		this.body.quaternion.z = qua.z;
		this.body.quaternion.w = qua.w;
    }
}

class Window {
    constructor(object, physicsWorld) {
        this.object = object;

        const geometry = object.geometry;
        const parameters = geometry.parameters;
        this.width = parameters.width;
        const height = parameters.height;
        const depth = parameters.depth;

        this.state = CLOSED;
        this.moved = 0;
        this.openDir = object.userData.openDir;

        // build physics body
		const shape = new CANNON.Box(new CANNON.Vec3(this.width/2.0, height/2.0, depth/2.0));
		this.body = new CANNON.Body({ mass: 0 })
		this.body.addShape(shape);

        const pos = new THREE.Vector3();
        const qua = new THREE.Quaternion();
        this.object.getWorldPosition(pos);
        this.object.getWorldQuaternion(qua);

		this.body.position.x = pos.x;
		this.body.position.y = pos.y;
		this.body.position.z = pos.z;

		this.body.quaternion.x = qua.x;
		this.body.quaternion.y = qua.y;
		this.body.quaternion.z = qua.z;
		this.body.quaternion.w = qua.w;

        physicsWorld.addBody(this.body);
    }

    click() {
        if(this.state == OPENING || this.state == CLOSING)
            return;

        this.moved = 0;
        if(this.state == CLOSED) {
            this.state = OPENING;
        } else if(this.state == OPENED) {
            this.state = CLOSING; // 3 is closing
        }
    }

    run(timeElapsed) {
        if(this.state == OPENING) {
            if(this.openDir == "=>") {
                this.object.position.x = Number(this.object.position.x) + 0.02;
            } else if(this.openDir == "<=")
                this.object.position.x -= 0.02;

            this.moved +=  0.02;
            if(this.moved >= this.width) {
                this.state = OPENED; // 2 is opened
            }
        } else if(this.state == CLOSING) {
            if(this.openDir == "=>")
                this.object.position.x -= 0.02;
            else if(this.openDir == "<=")
                this.object.position.x += 0.02;

            this.moved += 0.02;
            if(this.moved >= this.width) {
                this.state = CLOSED;
            }
        }
	}

    update(state) {
        if(state == 'off' && this.state == OPENED)
            this.click();
        if(state == 'on' && this.state == CLOSED)
            this.click();
    }

    updateToPhysicsBody() {
        // Here, mesh is copied to physics body! This is reverse!!
        const pos = new THREE.Vector3();
        const qua = new THREE.Quaternion();
        this.object.getWorldPosition(pos);
        this.object.getWorldQuaternion(qua);

		this.body.position.x = pos.x;
		this.body.position.y = pos.y;
		this.body.position.z = pos.z;

		this.body.quaternion.x = qua.x;
		this.body.quaternion.y = qua.y;
		this.body.quaternion.z = qua.z;
		this.body.quaternion.w = qua.w;
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
            this.state = 1; // 1 is HouseObject
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
        videoElement.muted = true;
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
        const screen = new THREE.PlaneGeometry(width-0.02, height-0.04);
        // const videoScreen = new THREE.Mesh(screen, videoMaterial);
        super(screen, videoMaterial);

        this.video = videoElement;

        this.name = 'video';
        this.depth = depth;
    }

    update(state) {
        if(state > 80) {
            this.position.z = this.depth / 2.0 + 0.001;
            this.video.play();
        } else {
            this.position.z = 0.0;
            this.video.pause();
        }
    }
}

class WashingMachine extends THREE.Mesh {
    ANGLE = Math.PI * 2 / 36;

    constructor(type, width, height, depth) {
        // Create Cylinder for animation
        const radius = (width / 2.0) - 0.1;
        const cyl_height = 0.01; // small number

        const geometry = new THREE.CylinderGeometry(radius, radius, cyl_height);
        let tubTexture = textureHelper.get('Laundry', 1, 1);
        const material = new THREE.MeshStandardMaterial( { map: tubTexture} );

        super(geometry, material);

        this.type = type;
        this.height = height;
        this.depth = depth;

        if(this.type == 0) {
            this.position.y = 0.0; //this.height / 2.0;
            this.rotation.x = Math.PI / 2.0;
        }

        this.running = false;
    }

    update(state) {
        let num = Number(state);
        if(num > 10 && !this.running) {
            this.running = true;
            if(this.type == 0) {
                this.position.z = this.depth / 2.0;
            } else {
                this.position.y = this.height;
            }
        } 
        if(num < 10 && this.running) {
            this.running = false;
            if(this.type == 0) {
                this.position.z = 0.0;
            } else {
                this.position.y = this.height/2.0;
            }
        }
    }

    run(timeElapsed) {
        if(this.running) {
            this.rotation.y += this.ANGLE;

            if(this.rotation.y > Math.PI)
                this.rotation.y = 0;
        }
    }
}

class MovingVaccuum {
    constructor(object) {
        this.object = object.getObjectByName('_cleaner');

        this.state = 0; // 0 is stopped
        this.moved = 0;
    }

    update(posx, posz, roty) {
        this.object.position.x = posx;
        this.object.position.z = posz;
        this.object.rotation.y = roty;
	}
}

class MovingObject {
    constructor(object) {
        this.object = object;

        this.state = 0; // 0 is stopped
        this.moved = 0;
    }

    update(posx, posz, roty) {
        this.object.position.x = posx;
        this.object.position.z = posz;
        this.object.rotation.y = roty;
	}
}

class Multimap {
    constructor() {
        // The underlying data store is a Map where keys map to an array of values
        this.map = new Map();
    }

    // Associates the specified value with the specified key
    set(key, value) {
        if (!this.map.has(key)) {
            this.map.set(key, []);
        }
        this.map.get(key).push(value);
    }

    // Returns a reference to the array of values associated with the given key
    get(key) {
        // Return an empty array if the key is not found, to prevent errors
        return this.map.get(key) || [];
    }

    // Checks if the multimap contains the specified key
    has(key) {
        return this.map.has(key);
    }
}

export class EntityManager {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.arPhysicsObj = [];

        this.arAnimEntity = [];
        this.arAnimObj = [];
        this.mapClickable = new Map();

        this.mapUpdatable = new Multimap();

        this.mapMovable = new Map();

        this.build();
    }

    build() {
        var scope = this;
        this.scene.traverse(function(object) {
            if ( object.userData.type != undefined) {
                let type = object.userData.type;
                if(type == 'planeWall') {
                    let wall = new PlaneWall(object, scope.physicsWorld);
                } else if(type == 'extrudeWall') {
                    let wall = new ExtrudeWall(object, scope.physicsWorld);
                } else if(type == 'door' || type == 'ref_door') {
                    let door = new Door(object, scope.physicsWorld, type);
                    scope.arPhysicsObj.push(door);
                    scope.arAnimEntity.push(door);
                    scope.arAnimObj.push(object);
                    scope.mapClickable.set(object, door);

                    const DBid = object.userData.DBid;
                    if(DBid != undefined) {
                        scope.mapUpdatable.set(DBid, door);
                    }
                } else if(type == 'window') {
                    let window = new Window(object, scope.physicsWorld);

                    if(object.userData.openDir != undefined) {
                        scope.arPhysicsObj.push(window);
                        scope.arAnimEntity.push(window);
                        scope.arAnimObj.push(object);
                        scope.mapClickable.set(object, window);

                        const DBid = object.userData.DBid;
                        if(DBid != undefined) {
                            scope.mapUpdatable.set(DBid, window);
                        }
                    }
                } else if(type == 'light') {
                    let light = new Light(object);

                    const DBid = object.userData.DBid;
                    if(DBid != undefined) {
                        scope.mapUpdatable.set(DBid, light);
                    }
                } else if(type == 'drawer') {
                    let drawer = new Drawer(object);
                    scope.arAnimEntity.push(drawer);
                    scope.arAnimObj.push(object);
                    scope.mapClickable.set(object, drawer);
                }
            }

            if(object.userData?.isInterior == true) {
                let wallAttached = false;
                if(object.userData.interiorType == 'TV' && object.userData.tvType === 'WallTV') {
                    // No physics-based object
                    wallAttached = true;
                } 
                if(object.userData.interiorType == 'AirConditioner' && object.userData.acType === 'WallAC') {
                    wallAttached = true;
                }
                
                if(wallAttached == false) {
                    // This is a normal physics-based object
                    let physicsObj = new PhsyicsObject(object, scope.physicsWorld);

                    scope.arPhysicsObj.push(physicsObj);
                }
            }

            if(object.userData?.interiorType == 'GasRange') {
                const height = object.children[0].geometry.parameters.height;
                const flame = new GasRangeFlame(object.name+'flame', 0.25, height, -0.04, 0.05, object);
                scope.arAnimEntity.push(flame);

                const DBid = object.userData.DBid;
                if(DBid != undefined) {
                    scope.mapUpdatable.set(DBid, flame);
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
                    scope.mapUpdatable.set(DBid, tv);
                }
            }

            if(object.userData?.interiorType == 'WashingMachine1' || object.userData?.interiorType == 'WashingMachine2') {
                const width = object.children[0].geometry.parameters.width;
                const height = object.children[0].geometry.parameters.height;
                const depth = object.children[0].geometry.parameters.depth;
                let type = 0; // Drum type
                if(object.userData?.interiorType == 'WashingMachine2') {
                    type = 1; // Top Loading
                }

                const washingMachine = new WashingMachine(type, width, height, depth);
                object.add(washingMachine);
                scope.arAnimEntity.push(washingMachine);

                const DBid = object.userData.DBid;
                if(DBid != undefined) {
                    scope.mapUpdatable.set(DBid, washingMachine);
                }
            }

            if(object.userData?.interiorType != undefined) {
                const it = object.userData.interiorType;
                if(it == 'Cat' || it == 'Dog') {
                    const movable = new MovingObject(object);
                    // object.add(movable);

                    const DBid = object.userData.DBid;
                    if(DBid != undefined) {
                        scope.mapMovable.set(DBid, movable);
                    }
                }
            }

            if(object.userData?.interiorType == 'RobotVacuum') {
                const movable = new MovingVaccuum(object);
                // object.add(movable);

                const DBid = object.userData.DBid;
                if(DBid != undefined) {
                    scope.mapMovable.set(DBid, movable);
                }
            }
        });
    }

    intersectObjects(raycaster) {
        return raycaster.intersectObjects(this.arAnimObj);
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
        for(let obj of this.arAnimEntity) {
            obj.run(delta);
        }

        for(let obj of this.arPhysicsObj) {
            obj.updateToPhysicsBody();
        }
    }

    isClickable(obj) {
        const entity = this.mapClickable.get(obj);
        if(entity != null) {
            return true;
        } else {
            return false;
        }
    }

    // Home Assistant REST data
    updateScene(data) {
        let last_position_name = null;
        for (const item of data) {
            const entity_id = item.entity_id;
            const state = item.state;
            const dev_class = item.attributes.device_class;
            if(state == 'unknown')
                continue;

            if(dev_class == 'motion' && state == 'on') {
                const index = entity_id.indexOf('.') + 1;
                last_position_name = entity_id.substring(index);
            }

            const objs = this.mapUpdatable.get(entity_id);
            for(let i=0; i<objs.length; i++) {
                const obj = objs[i];
                obj.update(state);
            }
        }

        if(last_position_name != null) {
            let posx = 0;
            let posz = 0;
            let roty = Math.random() * 360;
            const target_name = last_position_name + '_floor';
            // get the floor of the same name of last_position
            this.scene.traverse(function (child) {
                if(child.name === target_name) {
                    const worldPosition = new THREE.Vector3();
                    child.getWorldPosition(worldPosition);
                    posx = worldPosition.x;
                    posz = worldPosition.z;
                }
            });

            for (const obj of this.mapMovable.values()) {
                obj.update(posx, posz, roty);
            }

            last_position_name = null;
        }
    }

    updateEntity(entity_id, dev_class, state) {
        const objs = this.mapUpdatable.get(entity_id);
        for(let i=0; i<objs.length; i++) {
            const obj = objs[i];
            obj.update(state);
        }

        if(dev_class == 'motion' && state == 'on') {
            const index = entity_id.indexOf('.') + 1;
            let last_position_name = entity_id.substring(index);

            let posx = 0;
            let posz = 0;
            let roty = Math.random() * 360;
            const target_name = last_position_name + '_floor';
            // get the floor of the same name of last_position
            this.scene.traverse(function (child) {
                if(child.name === target_name) {
                    const worldPosition = new THREE.Vector3();
                    child.getWorldPosition(worldPosition);
                    posx = worldPosition.x;
                    posz = worldPosition.z;
                }
            });

            for (const obj of this.mapMovable.values()) {
                obj.update(posx, posz, roty);
            }
        }
    }
}
