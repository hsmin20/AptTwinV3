import * as THREE from 'three';

import { UIPanel, UIRow, UIText, UISpan, UITextArea } from '../../src_common/libs/ui.js';

import { BoxGeometryPanel } from './BoxGeometryPanel.js';
import { ConeGeometryPanel } from './ConeGeometryPanel.js';
import { CylinderGeometryPanel } from './CylinderGeometryPanel.js';
import { PlaneGeometryPanel } from './PlaneGeometryPanel.js';
import { CircleGeometryPanel } from './CircleGeometryPanel.js';
import { ExtrudeGeometryPanel } from './ExtrudeGeometryPanel.js';

export class SidebarGeometry {
    constructor( editor ) {
        this.editor = editor;

        this.container = new UIPanel();
        this.container.setBorderTop( '0' );
        this.container.setDisplay( 'none' );
        this.container.setPaddingTop( '20px' );

        this.currentGeometryType = null;

        // type

        const geometryTypeRow = new UIRow();
        this.geometryType = new UIText();

        geometryTypeRow.add( new UIText( 'Type' ).setClass( 'Label' ) );
        geometryTypeRow.add( this.geometryType );

        this.container.add( geometryTypeRow );

        // parameters
        this.parameters = new UISpan();
        this.container.add( this.parameters );

        this.build();
    }

	async build() {
		const object = this.editor.selected;

		if ( object && object.geometry ) {
			const geometry = object.geometry;

			this.container.setDisplay( 'block' );

			this.geometryType.setValue( geometry.type );

			if ( this.currentGeometryType !== geometry.type ) {
				this.parameters.clear();

				// const { GeometryParametersPanel } = await import( `./Sidebar${ geometry.type }.js` );

                if(geometry.type == 'BoxGeometry') {
                    this.geometryPanel = new BoxGeometryPanel( this.editor );
                } else if(geometry.type == 'ConeGeometry') {
                    this.geometryPanel = new ConeGeometryPanel( this.editor );
                } else if(geometry.type == 'CylinderGeometry') {
                    this.geometryPanel = new CylinderGeometryPanel( this.editor );
                } else if(geometry.type == 'PlaneGeometry') {
                    this.geometryPanel = new PlaneGeometryPanel( this.editor );
                } else if(geometry.type == 'CircleGeometry') {
                    this.geometryPanel = new CircleGeometryPanel( this.editor );
                } else if(geometry.type == 'ExtrudeGeometry') {
                    this.geometryPanel = new ExtrudeGeometryPanel( this.editor );
                }

				this.parameters.add( this.geometryPanel.container );

				this.currentGeometryType = geometry.type;
			}
		} else {
            this.currentGeometryType = null;
			this.container.setDisplay( 'none' );
		}
	}

	updateUI() {
		// this.currentGeometryType = null;
		this.build();
        if(this.currentGeometryType != null)
            this.geometryPanel.updateUI();
	}
}
