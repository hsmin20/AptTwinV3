import * as THREE from 'three';
import { EntityManager } from './Entities';
import { FreeLookControl } from './Controls';
import { SerializableReflector } from '../../src_common/SerializableReflector.js';
import { Storage as _Storage } from '../../src_common/Storage.js';
import { textureHelper } from '../../src_common/TextureHelper.js';

import { saveState } from './AptTwinPlayer.js';

export class Player {
	constructor() {
        this.dom = document.createElement( 'div' );
        this.dom.className = 'Panel';
        this.dom.id = 'viewport';
        document.body.appendChild(this.dom);

        this.Y_UNIT_VECTOR = new THREE.Vector3(0, 1, 0);

        this.camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 1000 );
        this.scene = new THREE.Scene();

		this.camera_world_pos = new THREE.Vector3();
        this.camera_world_dir = new THREE.Vector3();

		this.prevTime = performance.now();

        this.mobile = true;
        try{ document.createEvent("TouchEvent"); }
		catch(e) { this.mobile = false; }

        this.storage = new _Storage();

		this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 2.0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, });

	    this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);

		// this.renderer.autoClear = false; // For HUD, uncomment this. This could be located in render loop to toggle
        // this.renderer.localClippingEnabled = true;
        
		this.dom.appendChild(this.renderer.domElement);    

        window.addEventListener('resize', this.onWindowResize.bind(this));
	}

    isMobile() {
        return this.mobile;
    }

    loadScene(data) {
        // Clear first
        this.scene.clear();

        var loader = new THREE.ObjectLoader(); // A loader for loading a JSON resource
		this.camera = loader.parse( data.camera );
        this.setScene( loader.parse( data.scene ) );

        if(!this.mobile) {
            this.camera.position.set(5.2, 1.5, -4.2);
            this.camera.lookAt(new THREE.Vector3(0, 1.2, 0));
        }

		this.entityManager = new EntityManager(this.scene);
	}

    toJSON () {
        return {
            metadata: {},
            camera: this.camera.toJSON(),
            scene: this.scene.toJSON()
        };
    }

    toJSON2 () {
        let json =  {
            metadata: {},
            camera: this.camera.toJSON(),
            scene: this.scene.toJSON()
        };

        let textures = json.scene.textures;
        let images = json.scene.images;
        if(textures == undefined || images == undefined)
            return json;

        // replace base64 encoded image to file path
        textures.forEach(function(texture) {
            const imageUUID = texture.image;

            const name = texture.name;
            const index = name.indexOf("_");
            const textureName = name.substring(0, index);
            const imagePath = textureHelper.getFilepath(textureName);

            images.forEach(function(image) {
                const uuid = image.uuid;
                if(imageUUID == uuid && imagePath != undefined) {
                    image.url = imagePath;
                }
            });
        });

        // remove duplicate entries in images
        let imageMap = new Map();
        let uuidArray = [];
        images.forEach(function(image) {
            const uuid = image.uuid;
            const url = image.url;
            if(imageMap.has(url)) {
                const theUUID = imageMap.get(url);
                textures.forEach(function(texture) {
                    const imageUUID = texture.image;
                    if(imageUUID == uuid) {
                        texture.image = theUUID;
                    }
                });

                uuidArray.push(uuid);
            } else {
                imageMap.set(url, uuid);
            }
        });

        for(let i=0; i<uuidArray.length; i++) {
            const uuid = uuidArray[i];

            let index = images.findIndex(image => image.uuid === uuid);
            if (index !== -1) {
                images.splice(index, 1);
            }
        }

        return json;
    }

    setScene(scene) {
		this.scene.uuid = scene.uuid;
		this.scene.name = scene.name;

		this.scene.background = scene.background;
		this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		// avoid render per object
		while ( scene.children.length > 0 ) {
			this.addObject( scene.children[ 0 ], null, false );
		}
	}

    addObject( object, parent, refresh=true ) {
        var scope = this;
		object.traverse( function ( child ) {
            if (child.userData?.isReflector) {
                const restored = SerializableReflector.fromJSON(child);
                restored.position.copy(child.position);
                restored.rotation.copy(child.rotation);
                restored.scale.copy(child.scale);
                if (child.parent) {
                    child.parent.add(restored);
                    child.parent.remove(child);
                }
            }
		} );

		if ( parent == null || parent === undefined ) {
			this.scene.add( object );
		} else {
			parent.children.push( object );
			object.parent = parent;
		}

        // saveState();
	}

	render(delta=0) {
		// Normal Scene
        this.renderer.setViewport( 0, 0, this.dom.offsetWidth, this.dom.offsetHeight );
        this.renderer.render(this.scene, this.camera);
	}

	setRaycasterPosDir() {
		this.camera.getWorldPosition(this.camera_world_pos);
        this.camera.getWorldDirection(this.camera_world_dir);
		this.raycaster.set(this.camera_world_pos, this.camera_world_dir);
	}

    handleMouseClick() {
		this.entityManager.handleMouseClick(this.raycaster);
	}

	initLight() {
		// ambient light
		var ambientLight = new THREE.AmbientLight (0xFFFFFF, 1)

		this.scene.add(ambientLight)
	}

	animate() {
		requestAnimationFrame(this.animate.bind(this));

		const time = performance.now();
        const delta = (time - this.prevTime) / 1000;

        this.control.run(delta);

        this.entityManager.run(delta);

		this.render(delta);

		this.prevTime = time;
	}

	addCrosshair() {
		var material = new THREE.LineBasicMaterial({ color: 0xAAFFAA });

		// crosshair size
		var x = 0.01, y = 0.01;

		var geometry = new THREE.BufferGeometry();

		const vertices = [];
		vertices.push(0); vertices.push(y); vertices.push(0);
		vertices.push(0); vertices.push(-y); vertices.push(0);
		vertices.push(0); vertices.push(0); vertices.push(0);
		vertices.push(x); vertices.push(0); vertices.push(0);
		vertices.push(-x); vertices.push(0); vertices.push(0);
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

		var crosshair = new THREE.Line( geometry, material );

		// place it in the center
		var crosshairPercentX = 50;
		var crosshairPercentY = 50;
		var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
		var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

		crosshair.position.x = crosshairPositionX * this.camera.aspect;
		crosshair.position.y = crosshairPositionY;

		crosshair.position.z = -0.3;

		this.camera.add( crosshair );
	}

	initControl() {
    	this.control = new FreeLookControl(this, this.camera, this.scene);

	}
	
    processKeyboard(keycode) {
        // this.entityManager.processKeyboard(keycode);
    }

    detectCollison() {
        const DISTANCE = 0.15;
        // Forward
        this.setRaycasterPosDir();
        var intersectedObjects = this.entityManager.intersectObjects(this.raycaster);
        if (intersectedObjects.length > 0 && intersectedObjects[0].distance < DISTANCE) {
            return true;
        }

        // Left
        this.camera_world_dir.applyAxisAngle(this.Y_UNIT_VECTOR, Math.PI / 2);
        this.raycaster.set(this.camera_world_pos, this.camera_world_dir);
        intersectedObjects = this.entityManager.intersectObjects(this.raycaster);
        if (intersectedObjects.length > 0 && intersectedObjects[0].distance < DISTANCE) {
            return true;
        }

        // Backward
        this.camera_world_dir.applyAxisAngle(this.Y_UNIT_VECTOR, Math.PI / 2);
        this.raycaster.set(this.camera_world_pos, this.camera_world_dir);
        intersectedObjects = this.entityManager.intersectObjects(this.raycaster);
        if (intersectedObjects.length > 0 && intersectedObjects[0].distance < DISTANCE) {
            return true;
        }

        // Right
        this.camera_world_dir.applyAxisAngle(this.Y_UNIT_VECTOR, Math.PI / 2);
        this.raycaster.set(this.camera_world_pos, this.camera_world_dir);
        intersectedObjects = this.entityManager.intersectObjects(this.raycaster);
        if (intersectedObjects.length > 0 && intersectedObjects[0].distance < DISTANCE) {
            return true;
        }

        return false
    }

	onWindowResize() {
        this.camera.aspect = this.dom.offsetWidth / this.dom.offsetHeight;
		this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
	}

    updateScene(data) {       
        this.entityManager.update(data); 
    }
}
