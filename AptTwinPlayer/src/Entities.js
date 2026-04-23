import * as THREE from 'three';

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

class Door {
    constructor(object) {
        this.object = object;
        const geometry = object.geometry;
        const parameters = geometry.parameters;
        this.width = parameters.width;

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

        this.buildPhysicsBody(this.object.position, this.object.quaternion, parameters);
    }

    buildPhysicsBody(pos, quat, parameters) {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( parameters.x * 0.5, parameters.y * 0.5, parameters.z * 0.5 ) );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        this.body = new Ammo.btRigidBody( rbInfo );

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
}

class Window {
    constructor(object) {
        this.object = object;
        const geometry = object.geometry;
        const parameters = geometry.parameters;
        this.width = parameters.width;

        this.state = CLOSED;
        this.moved = 0;
        this.openDir = object.userData.openDir;
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
        const screen = new THREE.PlaneGeometry(width-0.02, height-0.02);
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
            this.position.y = this.height / 2.0;
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
    constructor(scene) {
        this.scene = scene;

        this.arRigidBodies = [];

        this.arGroup = [];
        this.arAnimEntity = [];
        this.arAnimObj = [];
        this.mapClickable = new Map();

        this.mapUpdatable = new Multimap();

        this.mapMovable = new Map();

        this.tmpTrans = new Ammo.btTransform();

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
                        scope.mapUpdatable.set(DBid, door);
                    }
                } else if(type == 'window') {
                    let window = new Window(object);
                    scope.arAnimEntity.push(window);
                    scope.arAnimObj.push(object);
                    scope.mapClickable.set(object, window);

                    const DBid = object.userData.DBid;
                    if(DBid != undefined) {
                        scope.mapUpdatable.set(DBid, window);
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

    isClickable(obj) {
        const entity = this.mapClickable.get(obj);
        if(entity != null) {
            return true;
        } else {
            return false;
        }
    }

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

    updateRigidBodies() {
        for(let i=0; i<this.arRigidBodies.length; i++) {
            let rigidBody = this.arRigidBodies[ i ];
            let objAmmo = rigidBody.physicsBody;
            let ms = objAmmo.getMotionState();
            if ( ms ) {
                ms.getWorldTransform( tmpTrans );
                let p = tmpTrans.getOrigin();
                let q = tmpTrans.getRotation();
                rigidBody.position.set( p.x(), p.y(), p.z() );
                rigidBody.quaternion.set( q.x(), q.y(), q.z(), q.w() );
            }
        }
    }
}
