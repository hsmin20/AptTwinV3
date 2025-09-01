import * as THREE from 'three';

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export class Selector {
	constructor( editor ) {
		this.editor = editor;
	}

    intersectionDetected(intersects) {
        if ( intersects.length > 0 ) {
            const object = intersects[ 0 ].object;
            this.select( object );
        } else {
            this.select( null );
        }
    }

	getIntersects( raycaster ) {
		const objects = [];

		this.editor.scene.traverseVisible( function ( child ) {
			objects.push( child );
		} );

		return raycaster.intersectObjects( objects, false );
	}

	getPointerIntersects( point, camera ) {
		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return this.getIntersects( raycaster );
	}

	select( object ) {
		if ( this.editor.selected === object ) 
            return;

		// let uuid = null;
		// if ( object !== null ) {
		// 	uuid = object.uuid;
		// }

		this.editor.selected = object;

        this.editor.onSelected( object );
	}

	deselect() {
		this.select( null );
	}
}
