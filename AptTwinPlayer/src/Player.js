import * as THREE from 'three';
import { EntityManager } from './Entities';
import { FreeLookControl } from './Controls';
import { Storage as _Storage } from '../../src_common/Storage.js';
import { textureHelper } from '../../src_common/TextureHelper.js';

import { HAWebSocket, HARestAPI } from './Updater.js';

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

        this.webSockerUpdater = new HAWebSocket(this);
        this.restUpdater = new HARestAPI(this);

        this.updating = false;
        
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
		// this.camera = loader.parse( data.camera );
        this.setScene( loader.parse( data.scene ) );

        if(!this.mobile) {
            this.camera.position.set(5.2, 1.5, -5.2);
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
            // camera: this.camera.toJSON(),
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
        const cameraMin = 0.00025;
        const cursorSize = 1;
        const cursorThickness = 1.5;
        const cursorGeometry = new THREE.RingGeometry(
            cursorSize * cameraMin,
            cursorSize * cameraMin * cursorThickness,
        );
        const cursorMaterial = new THREE.MeshBasicMaterial({ color: "white" });
        this.crosshair = new THREE.Mesh(cursorGeometry, cursorMaterial);

		this.crosshair.position.z = -0.1;

        this.camera.add( this.crosshair );

        ///////////////////////////////////////////
        const handTexture = textureHelper.get('Hand', 1, 1);
        const handMaterial = new THREE.MeshBasicMaterial({
            map: handTexture,
            transparent: true
        });
        const handGeometry = new THREE.PlaneGeometry(0.003, 0.003);
        this.handMesh = new THREE.Mesh(handGeometry, handMaterial);

        this.handMesh.position.z = -0.1;
        this.camera.add(this.handMesh);
        this.handMesh.visible = false;
	}

	initControl() {
    	this.control = new FreeLookControl(this, this.camera, this.scene);
	}

    detectCollison() {
        const DISTANCE = 0.15;
        const DISTANCE2 = 2.0;
        // Forward
        this.setRaycasterPosDir();
        var intersectedObjects = this.entityManager.intersectObjects(this.raycaster);
        if (intersectedObjects.length > 0 && intersectedObjects[0].distance < DISTANCE2 && this.entityManager.isClickable(intersectedObjects[0].object)) {
            this.handMesh.visible = true;
            this.crosshair.visible = false;
        } else {
            this.handMesh.visible = false;
            this.crosshair.visible = true;
        }
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

    changeView() {
        this.control.gravity = !this.control.gravity;

        const curPos = this.camera.position;
        const BIRDEYEVIEW_HEIGHT = 15;

        if(!this.control.gravity) {
            this.camera.position.set(curPos.x, BIRDEYEVIEW_HEIGHT, curPos.z);
            this.camera.lookAt(this.scene.position);
        }
    }

	onWindowResize() {
        this.camera.aspect = this.dom.offsetWidth / this.dom.offsetHeight;
		this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight);
	}

    // Home Assistant REST data
    updateScene(data) {       
        this.entityManager.updateScene(data); 
    }

    // Home Assistant WebSocket data
    updateEntity(data) {
        const entity_id = data.entity_id;
        const dev_class = data.new_state.attributes.device_class;
        const new_state = data.new_state.state;

        this.entityManager.updateEntity(entity_id, dev_class, new_state);
    }
}
