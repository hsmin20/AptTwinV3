import * as THREE from 'three';

import { History as _History } from '../../src_common/History.js';
import { Storage as _Storage } from '../../src_common/Storage.js';
import { Selector } from './Selector.js';

import { RemoveObjectCommand } from '../../src_common/commands/RemoveObjectCommand.js';
import { AddGroupCommand } from '../../src_common/commands/AddGroupCommand.js';
import { SetValueCommand } from '../../src_common/commands/SetValueCommand.js';

import { saveState } from './AptTwinEditor.js';

import { textureHelper } from '../../src_common/TextureHelper.js';
import { RoomBuilder } from './RoomBuilder.js';

const ObjectType = { NEW: 0, WALL: 1, FLOOR: 2, FLOOR2: 3, FLOOR3: 4, FLOOR4: 5, FLOOR5: 6, DOOR: 7, DOOR2: 8, WINDOW: 9, 
                            WINDOW2: 10, BATHTUB: 11, TOILET: 12, BATHSINK: 13, KITCHENSINK: 14, LIGHT: 15, LIGHT2: 16 };
const Hinge = { NORMAL: 0, REVERSE: 1 };
const HEIGHT = 2.3;

var _DEFAULT_CAMERA = new THREE.PerspectiveCamera( 50, 1, 0.1, 1000 );
_DEFAULT_CAMERA.name = 'Camera';
_DEFAULT_CAMERA.position.set( 0, 5, 10 );
_DEFAULT_CAMERA.lookAt( new THREE.Vector3() );

export class Editor {
    constructor(scene_name) {
        this.camera = _DEFAULT_CAMERA.clone();

        this.scene = new THREE.Scene();
	    this.scene.name = scene_name;

        // separate scene for selection box
        this.sceneHelpers = new THREE.Scene();
	    this.sceneHelpers.add( new THREE.HemisphereLight( 0xffffff, 0x888888, 2 ) );

        // this.mixer = new THREE.AnimationMixer( this.scene );

        this.selected = null;

        this.history = new _History( this );
        this.selector = new Selector( this );
        this.storage = new _Storage();

        this.geometries = {};
        this.materials = {};
        this.textures = {};

        this.roomBuilder = new RoomBuilder(this);

        this.materialsRefCounter = new Map();

        let keyDownFunc = this.keyDown.bind(this);
        document.addEventListener( 'keydown', keyDownFunc);
    }

    setViewport(viewport) {
        this.viewport = viewport;
    }

    setSidebar(sidebar) {
        this.sidebar = sidebar;
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
			if ( child.geometry !== undefined ) 
                scope.addGeometry( child.geometry );
			
            if ( child.material !== undefined ) 
                scope.addMaterial( child.material );
		} );

		if ( parent == null || parent === undefined ) {
			this.scene.add( object );
		} else {
			parent.children.push( object );
			object.parent = parent;
		}

        saveState();

        if(refresh) {
            this.sidebar.refreshUI();
            this.viewport.render();
        }
	}

    addGeometry( geometry ) {
		this.geometries[ geometry.uuid ] = geometry;
	}

    addMaterial( material ) {
		if ( Array.isArray( material ) ) {
			for ( var i = 0, l = material.length; i < l; i ++ ) {
				this.addMaterialToRefCounter( material[ i ] );
			}
		} else {
			this.addMaterialToRefCounter( material );
		}
	}

    addMaterialToRefCounter( material ) {
		var materialsRefCounter = this.materialsRefCounter;
		var count = materialsRefCounter.get( material );
		if ( count === undefined ) {
			materialsRefCounter.set( material, 1 );
			this.materials[ material.uuid ] = material;
		} else {
			count ++;
			materialsRefCounter.set( material, count );
		}
	}

    removeObject( object ) {
		if ( object.parent === null ) return; // avoid deleting the camera or scene

		var scope = this;
		object.traverse( function ( child ) {
			if ( child.material !== undefined ) 
                scope.removeMaterial( child.material );
		} );

		object.parent.remove( object );

        saveState();
        this.sidebar.refreshUI();
        this.viewport.render();
	}

    removeMaterial( material ) {
		if ( Array.isArray( material ) ) {
			for ( var i = 0, l = material.length; i < l; i ++ ) {
				this.removeMaterialFromRefCounter( material[ i ] );
			}
		} else {
			this.removeMaterialFromRefCounter( material );
		}
	}

	removeMaterialFromRefCounter( material ) {
		var materialsRefCounter = this.materialsRefCounter;
		var count = materialsRefCounter.get( material );
		count --;
		if ( count === 0 ) {
			materialsRefCounter.delete( material );
			delete this.materials[ material.uuid ];
		} else {
			materialsRefCounter.set( material, count );
		}
	}

    clear() {
        this.storage.clear();

        this.camera.copy( _DEFAULT_CAMERA );

        this.scene.name = 'Scene';
		this.scene.background = null;

		var objects = this.scene.children;

		while ( objects.length > 0 ) {
			this.removeObject( objects[ 0 ] );
		}

		this.geometries = {};
		this.materials = {};
		this.textures = {};
		// this.scripts = {};

		this.materialsRefCounter.clear();

		this.deselect();
    }

    // Recent version has a bug exporting Camera so it's commented
    async fromJSON ( json ) {
		var loader = new THREE.ObjectLoader(); // A loader for loading a JSON resource
		// var camera = await loader.parseAsync( json.camera );

		// copy all properties, including uuid
		// this.camera.copy( camera );
		// this.camera.uuid = camera.uuid;

		this.setScene( await loader.parseAsync( json.scene ) );

        saveState();
        this.sidebar.refreshUI();
        this.viewport.render();
	}

    toJSON () {
		return {
			metadata: {},
			camera: this.camera.toJSON(),
			scene: this.scene.toJSON()
		};
	}

    
    _createWallPlane(x1, z1, x2, z2, index) {
        let whichSide = THREE.FrontSide;

        let dx = x2 - x1;
        let dz = z2 - z1;
        let rotY = Math.atan2(dz, dx) * -1;

        const width = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));

        const repeatX = Math.round(width * 2);
        const repeatY = Math.round(HEIGHT * 2);
        const wallTexture  = textureHelper.get('Wallpaper1', repeatX, repeatY);

        let mesh = new THREE.Mesh( new THREE.PlaneGeometry(width, HEIGHT), new THREE.MeshStandardMaterial({ map: wallTexture, side: whichSide }) );
        mesh.name = "new_mesh_" + index;
        mesh.position.x = x1 + dx / 2.0;
        mesh.position.y = HEIGHT / 2.0;
        mesh.position.z = z1 + dz / 2.0;
        mesh.rotation.y = rotY;

        return mesh;
    }

    _createWallPlane2(x1, z1, x2, z2, index, height) {
        let whichSide = THREE.FrontSide;

        let dx = x2 - x1;
        let dz = z2 - z1;
        let rotY = Math.atan2(dz, dx) * -1;

        const width = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));

        const repeatX = Math.round(width * 2);
        const repeatY = Math.round(height * 2);
        const wallTexture  = textureHelper.get('Wallpaper1', repeatX, repeatY);

        let mesh = new THREE.Mesh( new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: wallTexture, side: whichSide }) );
        mesh.name = "new_mesh_" + index;
        mesh.position.x = x1 + dx / 2.0;
        mesh.position.y = -(HEIGHT - height) / 2.0;
        mesh.position.z = z1 + dz / 2.0;
        mesh.rotation.y = rotY;

        return mesh;
    }

    constructWallFrom2DJSON(element, i) {
        const group = new THREE.Group();
        group.name = "newWallGroup_" + i;

        this.execute( new AddGroupCommand( this, group ) );

        let posArray = [];
        posArray.push({ x: element.x1, z: element.z1 });
        posArray.push({ x: element.x2, z: element.z2 });
        posArray.push({ x: element.x3, z: element.z3 });
        posArray.push({ x: element.x4, z: element.z4 });

        for(let k=0; k<posArray.length; k++) {
            const pos1 = posArray[k];
            const pos2 = posArray[(k + 1) % posArray.length];

            let mesh = this._createWallPlane(pos1.x, pos1.z, pos2.x, pos2.z, i);
            group.children.push( mesh );
            mesh.parent = group;
        }

        this.objectChanged(group);
    }

    constructDoorFrom2DJSON(element, i) {
        const group = new THREE.Group();
        group.name = "newDoorGroup_" + i;

        this.execute( new AddGroupCommand( this, group ) );

        const x = element.x;
        const z = element.z;
        const angle = element.angle;
        // const angleSign = element.angleSign;
        const width = element.size;
        const hinge = element.hinge;
        // const thick = element.thick; // not used

        const type = element.type;

        const pivotDir = (hinge == hinge.NORMAL) ? 'left' : 'right';
        const openDir = 'outward'; // (angle > 180) ? 'inward' : 'outward'; //(angleSign == 0) ? 'outward' : 'inward';

        group.position.x = x;
        group.position.y = HEIGHT / 2.0;
        group.position.z = z;
        group.rotation.y = (Math.PI / 180) * angle * -1;

        let doorLTexture  = null;
        let doorRTexture = null;

        if(type == ObjectType.DOOR) {
            const doorLeftTexture = (hinge == Hinge.NORMAL) ? 'DoorLeft' : 'DoorRight';
            const doorRightTexture = (hinge == Hinge.NORMAL) ? 'DoorRight' : 'DoorLeft';
            doorLTexture  = textureHelper.get(doorLeftTexture, 1, 1);
            doorRTexture = textureHelper.get(doorRightTexture, 1, 1);
        } else if(type == ObjectType.DOOR2) {
            const doorLeftTexture = (hinge == Hinge.NORMAL) ? 'FrontDoorLeft' : 'FrontDoorRight';
            const doorRightTexture = (hinge == Hinge.NORMAL) ? 'FrontDoorRight' : 'FrontDoorLeft';
            doorLTexture  = textureHelper.get(doorLeftTexture, 1, 1);
            doorRTexture = textureHelper.get(doorRightTexture, 1, 1);
        }

        const depth = 0.1;
        const door = new THREE.Mesh( new THREE.BoxGeometry(width, HEIGHT, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial( { map: doorRTexture } ), 
            new THREE.MeshStandardMaterial( { map: doorLTexture } )
        ] );
        door.name = "Door_" + i;

        var obj = new THREE.Object3D();
        obj.userData.type = 'door';
        obj.userData.pivotDir = pivotDir;
        obj.userData.openDir = openDir;
        obj.userData.DBid = 'n/a';
        const userData = obj.userData;

        if ( JSON.stringify( door.userData ) != JSON.stringify( userData ) ) {
            this.execute( new SetValueCommand( this, door, 'userData', userData ) );
        }
        
        group.children.push( door );
        door.parent = group;
    }

    constructWindowFrom2DJSON(element, i) {
        const group = new THREE.Group();
        group.name = "newWindowGroup_" + i;

        this.execute( new AddGroupCommand( this, group ) );

        const x = element.x;
        const z = element.z;
        const angle = element.angle;
        const width = element.size;
        const thick = element.thick;
        const height = element.height;

        group.position.x = x;
        group.position.y = HEIGHT / 2.0;
        group.position.z = z;
        group.rotation.y = (Math.PI / 180) * angle * -1;

        const windowTexture = textureHelper.get('Window', 1, 1);
        const frameTexture = textureHelper.get('Black', 1, 1);

        const depth = 0.1;
        const leftWindow = new THREE.Mesh( new THREE.BoxGeometry(width/2.0, height, depth), [  
            new THREE.MeshStandardMaterial(  ), new THREE.MeshStandardMaterial({ map: frameTexture}), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial( { map: frameTexture} ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } )
        ] );
        leftWindow.name = "Window_left";
        leftWindow.position.x = -(width / 4.0);
        leftWindow.position.y = (HEIGHT - height) / 2.0;
        leftWindow.position.z = -(depth / 2.0);

        var obj = new THREE.Object3D();
        obj.userData.type = 'window';
        obj.userData.openDir = '=>';
        obj.userData.DBid = 'n/a';
        const userData = obj.userData;

        if ( JSON.stringify( leftWindow.userData ) != JSON.stringify( userData ) ) {
            this.execute( new SetValueCommand( this, leftWindow, 'userData', userData ) );
        }
        
        group.children.push( leftWindow );
        leftWindow.parent = group;

        const rightWindow = new THREE.Mesh( new THREE.BoxGeometry(width/2.0, height, depth), [  
            new THREE.MeshStandardMaterial( { map: frameTexture} ), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial( { map: frameTexture} ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } )
        ] );
        rightWindow.name = "Window_right";
        rightWindow.position.x = width / 4.0;
        rightWindow.position.y = (HEIGHT - height) / 2.0;
        rightWindow.position.z = depth / 2.0;

        var obj2 = new THREE.Object3D();
        obj2.userData.type = 'window';
        obj2.userData.openDir = '<=';
        obj2.userData.DBid = 'n/a';
        const userData2 = obj2.userData;

        if ( JSON.stringify( rightWindow.userData ) != JSON.stringify( userData2 ) ) {
            this.execute( new SetValueCommand( this, rightWindow, 'userData', userData2 ) );
        }
        
        group.children.push( rightWindow );
        rightWindow.parent = group;

        if(height != HEIGHT) {
            // Window height is smaller than wall height so make a bottom wall
            const wall_height = HEIGHT - height;

            let posArray = [];
            posArray.push({ x: -width / 2.0, z: -thick / 2.0 });
            posArray.push({ x: -width / 2.0, z: thick / 2.0 });
            posArray.push({ x: width / 2.0, z: thick / 2.0 });
            posArray.push({ x: width / 2.0, z: -thick / 2.0 });

            for(let k=0; k<posArray.length; k++) {
                const pos1 = posArray[k];
                const pos2 = posArray[(k + 1) % posArray.length];

                let mesh = this._createWallPlane2(pos1.x, pos1.z, pos2.x, pos2.z, i, wall_height);
                group.children.push( mesh );
                mesh.parent = group;
            }

            // Finally, we need to make a roof for this wall
            let whichSide = THREE.FrontSide;
            let rotX = Math.PI / 2.0 * -1;

            const repeatX = Math.round(width * 2);
            const repeatY = Math.round(thick * 2);
            const wallTexture  = textureHelper.get('Wallpaper1', repeatX, repeatY);

            let roof = new THREE.Mesh( new THREE.PlaneGeometry(width, thick), new THREE.MeshStandardMaterial({ map: wallTexture, side: whichSide }) );
            roof.name = "new_mesh_roof";
            roof.position.x = 0;
            roof.position.y = -height + (HEIGHT / 2.0);
            roof.position.z = 0;
            roof.rotation.x = rotX;

            group.children.push( roof );
            roof.parent = group;
        }
    }

    constructWindow2From2DJSON(element, i) {
        const group = new THREE.Group();
        group.name = "newWindow2Group_" + i;

        this.execute( new AddGroupCommand( this, group ) );

        const x = element.x;
        const z = element.z;
        const angle = element.angle;
        const width = element.size;
        const thick = element.thick; // not used
        const height = element.height;

        group.position.x = x;
        group.position.y = HEIGHT / 2.0;
        group.position.z = z;
        group.rotation.y = (Math.PI / 180) * angle * -1;

        const windowTexture = textureHelper.get('Window', 1, 1);
        const frameTexture = textureHelper.get('Black', 1, 1);

        const depth = 0.1;

        // Left Window 2
        const leftWindow2 = new THREE.Mesh( new THREE.BoxGeometry(width/4.0, height, depth), [  
            new THREE.MeshStandardMaterial(  ), new THREE.MeshStandardMaterial({ map: frameTexture}), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial( { map: frameTexture} ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } )
        ] );
        leftWindow2.name = "Window_left2";
        leftWindow2.position.x = -(width * 3 / 8.0);
        leftWindow2.position.y = (HEIGHT - height) / 2.0;
        leftWindow2.position.z = -(depth / 2.0);

        var obj = new THREE.Object3D();
        obj.userData.type = 'window';
        obj.userData.openDir = '=>';
        obj.userData.DBid = 'n/a';
        const userData = obj.userData;

        if ( JSON.stringify( leftWindow2.userData ) != JSON.stringify( userData ) ) {
            this.execute( new SetValueCommand( this, leftWindow2, 'userData', userData ) );
        }
        
        group.children.push( leftWindow2 );
        leftWindow2.parent = group;

        // Left Window 1
        const leftWindow = new THREE.Mesh( new THREE.BoxGeometry(width/4.0, height, depth), [  
            new THREE.MeshStandardMaterial(  ), new THREE.MeshStandardMaterial({ map: frameTexture}), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial( { map: frameTexture} ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } )
        ] );
        leftWindow.name = "Window_left2";
        leftWindow.position.x = -(width / 8.0);
        leftWindow.position.y = (HEIGHT - height) / 2.0;
        leftWindow.position.z = depth / 2.0;

        group.children.push( leftWindow );
        leftWindow.parent = group;

        // Right Window 1
        const rightWindow = new THREE.Mesh( new THREE.BoxGeometry(width/4.0, height, depth), [  
            new THREE.MeshStandardMaterial( { map: frameTexture} ), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial( { map: frameTexture} ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } )
        ] );
        rightWindow.name = "Window_right";
        rightWindow.position.x = width / 8.0;
        rightWindow.position.y = (HEIGHT - height) / 2.0;
        rightWindow.position.z = depth / 2.0;

        group.children.push( rightWindow );
        rightWindow.parent = group;

        // Right Window 2
        const rightWindow2 = new THREE.Mesh( new THREE.BoxGeometry(width/4.0, height, depth), [  
            new THREE.MeshStandardMaterial( { map: frameTexture} ), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial( { map: frameTexture} ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } ), 
            new THREE.MeshStandardMaterial( { map: windowTexture, transparent: true, opacity: 0.8 } )
        ] );
        rightWindow2.name = "Window_right";
        rightWindow2.position.x = width * 3 / 8.0;
        rightWindow2.position.y = (HEIGHT - height) / 2.0;
        rightWindow2.position.z = -(depth / 2.0);

        var obj2 = new THREE.Object3D();
        obj2.userData.type = 'window';
        obj2.userData.openDir = '<=';
        obj2.userData.DBid = 'n/a';
        const userData2 = obj2.userData;

        if ( JSON.stringify( rightWindow2.userData ) != JSON.stringify( userData2 ) ) {
            this.execute( new SetValueCommand( this, rightWindow2, 'userData', userData2 ) );
        }
        
        group.children.push( rightWindow2 );
        rightWindow2.parent = group;

        if(height != HEIGHT) {
            // Window height is smaller than wall height so make a bottom wall
            const wall_height = HEIGHT - height;

            let posArray = [];
            posArray.push({ x: -width / 2.0, z: -thick / 2.0 });
            posArray.push({ x: -width / 2.0, z: thick / 2.0 });
            posArray.push({ x: width / 2.0, z: thick / 2.0 });
            posArray.push({ x: width / 2.0, z: -thick / 2.0 });

            for(let k=0; k<posArray.length; k++) {
                const pos1 = posArray[k];
                const pos2 = posArray[(k + 1) % posArray.length];

                let mesh = this._createWallPlane2(pos1.x, pos1.z, pos2.x, pos2.z, i, wall_height);
                group.children.push( mesh );
                mesh.parent = group;
            }

            // Finally, we need to make a roof for this wall
            let whichSide = THREE.FrontSide;
            let rotX = Math.PI / 2.0 * -1;

            const repeatX = Math.round(width * 2);
            const repeatY = Math.round(thick * 2);
            const wallTexture  = textureHelper.get('Wallpaper1', repeatX, repeatY);

            let roof = new THREE.Mesh( new THREE.PlaneGeometry(width, thick), new THREE.MeshStandardMaterial({ map: wallTexture, side: whichSide }) );
            roof.name = "new_mesh_roof";
            roof.position.x = 0;
            roof.position.y = -height + (HEIGHT / 2.0);
            roof.position.z = 0;
            roof.rotation.x = rotX;

            group.children.push( roof );
            roof.parent = group;
        }
    }

    constructFloorFrom2DJSON(element, i) {
        const group = new THREE.Group();
        group.name = "newFloorCeilingGroup_" + i;

        this.execute( new AddGroupCommand( this, group ) );

        const x1 = element.x1;
        const x2 = element.x2;
        const z1 = element.z1;
        const z2 = element.z2;

        let dx = x2 - x1;
        let dz = z2 - z1;
        let width = dx;
        let height = dz;

        const repeatX = Math.round(width * 2);
        const repeatY = Math.round(height * 2);
        let floorTexture = null;
        if(element.type == ObjectType.FLOOR) // Room
            floorTexture = textureHelper.get('RoomFloor', repeatX, repeatY);
        else if(element.type == ObjectType.FLOOR2) // Livingroom
            floorTexture = textureHelper.get('Floor', repeatX, repeatY);
        else if(element.type == ObjectType.FLOOR3) // Bathroom
            floorTexture = textureHelper.get('Tile', repeatX, repeatY);
        else if(element.type == ObjectType.FLOOR4) // Veranda
            floorTexture = textureHelper.get('BalconyTile', repeatX, repeatY);
        else if(element.type == ObjectType.FLOOR5) // Cement
            floorTexture = textureHelper.get('Concrete', repeatX, repeatY);

        let mesh = new THREE.Mesh( new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: floorTexture, side: THREE.BackSide }) );
        mesh.name = "new_mesh_1_" + i;
        mesh.position.x = x1 + dx / 2.0;
        mesh.position.y = 0;
        mesh.position.z = z1 + dz / 2.0;
        mesh.rotation.x = Math.PI / 2.0;
        group.children.push( mesh );
        mesh.parent = group;

        let ceilingTexture  = textureHelper.get('Ceiling', repeatX, repeatY);
        if(element.type == ObjectType.FLOOR3) // Bathroom
            ceilingTexture = textureHelper.get('Tile', repeatX, repeatY);

        mesh = new THREE.Mesh( new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: ceilingTexture, side: THREE.FrontSide }) );
        mesh.name = "new_mesh_1_" + i;
        mesh.position.x = x1 + dx / 2.0;
        mesh.position.y = HEIGHT;
        mesh.position.z = z1 + dz / 2.0;
        mesh.rotation.x = Math.PI / 2.0;
        group.children.push( mesh );
        mesh.parent = group;
    }

    constructBathtubFrom2DJSON(element, i) {
        const width = element.size;
        const length = element.thick;
        const height = 1.2;

        const xpos = element.x;
        const zpos = element.z;
        const angle = element.angle;

        this.roomBuilder.addBathtub(null, width, length, height, xpos, zpos, angle);
    }

    constructToiletFrom2DJSON(element, i) {
        const width = element.size;
        const length = element.thick;
        const height = 1.2;

        const xpos = element.x;
        const zpos = element.z;
        const angle = (element.angle - 270) * - 1;

        var toiletGroup = this.roomBuilder.addToilet(null, xpos, zpos, angle);
    }

    constructBathsinkFrom2DJSON(element, i) {
        const width = element.size;
        const length = element.thick;
        const height = 1.2;

        const xpos = element.x;
        const zpos = element.z;
        const angle = (element.angle - 270) * -1;

        this.roomBuilder.addBathroomSink(null, xpos, zpos, angle);
    }

    constructKitchensinkFrom2DJSON(element, i) {
        const width = element.size;
        const length = element.thick;
        const height = 1.2;

        const xpos = element.x;
        const zpos = element.z;
        const angle = (element.angle - 180) * -1;

        this.roomBuilder.addKitchenSink(null, 'KitchenSink', width, length, height, xpos, zpos, angle);
    }

    constructLightFrom2DJSON(element, i) {
        const type = element.type;

        const width = element.size;
        const length = element.thick;

        const xpos = element.x;
        const ypos = HEIGHT - 0.02;
        const zpos = element.z;
        // const angle = element.angle - 180;

        let lightType = 'Light1';
        if(width == length)
            lightType = 'Light2';
        if(type == ObjectType.LIGHT)
            lightType = 'Light3';

        this.roomBuilder.addLightLamp(null, lightType, xpos, ypos, zpos, width, length);
    }

    constructFrom2DJSON( json ) {
        this.roomBuilder.addTHREELight('AmbientLight', 'Ambient');

        const elementArray = JSON.parse(json);

        for(let i=0; i<elementArray.length; i++) {
            let element = elementArray[i];
            // console.log('{' + element.x1 + ':' + element.z1 + ',' + element.x2 + ':' + element.z2 + ',' + element.x3 + ':' + element.z3 + ',' + element.x4 + ':' + element.z4);
            const type = element.type;
            if(type == ObjectType.WALL) {
                this.constructWallFrom2DJSON(element, i);
            } else if(type == ObjectType.DOOR || type == ObjectType.DOOR2) {
                this.constructDoorFrom2DJSON(element, i);
            } else if(type == ObjectType.WINDOW) {
                this.constructWindowFrom2DJSON(element, i);                
            } else if(type == ObjectType.WINDOW2) {
                this.constructWindow2From2DJSON(element, i);
            } else if(type >= ObjectType.FLOOR && type <= ObjectType.FLOOR5) {
                this.constructFloorFrom2DJSON(element, i);
            } else if(type == ObjectType.BATHTUB) {
                this.constructBathtubFrom2DJSON(element, i);
            } else if(type == ObjectType.TOILET) {
                this.constructToiletFrom2DJSON(element, i);
            } else if(type == ObjectType.BATHSINK) {
                this.constructBathsinkFrom2DJSON(element, i);
            } else if(type == ObjectType.KITCHENSINK) {
                this.constructKitchensinkFrom2DJSON(element, i);
            } else if(type == ObjectType.LIGHT || type == ObjectType.LIGHT2) {
                this.constructLightFrom2DJSON(element, i);
            }
        }
    }
	
	replaceImageToFilepath(textures, images) {
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
    }

    removeDuplicate(textures, images) {
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
    }

    // Recent version has a bug exporting Camera so it's commented
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
        this.replaceImageToFilepath(textures, images);

        // remove duplicate entries in images
        this.removeDuplicate(textures, images);

        return json;
	}

    execute( cmd, optionalName ) {
		this.history.execute( cmd, optionalName );
	}

    undo() {
		this.history.undo();
	}

	redo() {
		this.history.redo();
	}

    keyDown( event ) {
        if(event.key.toLowerCase() == undefined)
            return;
        
		switch ( event.key.toLowerCase() ) {
			case 'delete':
				const object = this.selected;
				if ( object === null || object.type == 'Scene' ) return;

                if (confirm('Are you sure you want to remove this item?')) {
                    const parent = object.parent;
                    if ( parent !== null ) 
                        this.execute( new RemoveObjectCommand( this, object ) );
                }

				break;
			case 'z':
				if ( event.ctrlKey ) {
					event.preventDefault(); // Prevent browser specific hotkeys
					this.undo();
				}

				break;
            case 'y':
				if ( event.ctrlKey ) {
					event.preventDefault(); // Prevent browser specific hotkeys
					this.redo();
				}

				break;
		}
	}

    select( object ) {
		this.selector.select( object );

        this.onSelected( object );
	}

    onSelected( object ) {
        this.sidebar.onObjectSelected( object );
        this.viewport.onObjectSelected( object );
    }

    selectById( id ) {
		this.select( this.scene.getObjectById( id ) );
	}

	selectByUuid( uuid ) {
		var scope = this;
		this.scene.traverse( function ( child ) {
			if ( child.uuid === uuid ) {
				scope.select( child );
			}
		} );
	}

    deselect() {
		this.selector.deselect();
	}

    objectChanged( object ) {
        saveState();
        this.sidebar.refreshUI( object );
        // this.viewport.onObjectChanged( object );
        this.viewport.onObjectSelected( object );
    }
}