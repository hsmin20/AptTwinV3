import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInput, UIButton } from '../../src_common/libs/ui.js';
import { UITexture2 } from '../../src_common/libs/ui.three2.js';

import { SetGeometryCommand } from '../../src_common/commands/SetGeometryCommand.js';

import { SetMaterialMapCommand } from '../../src_common/commands/SetMaterialMapCommand.js';
import { SetMaterialOpaqueCommand } from '../../src_common/commands/SetMaterialOpaqueCommand.js';

import { showTextureImages } from './TextureDialog.js';
import { UIBoolean } from '../../src_common/libs/ui.three.js';

export class PlaneGeometryPanel {
    constructor( editor, object ) {

	    this.editor = editor;

        this.container = new UIDiv();

        // width, height
        const planeDimensionRow1 = new UIRow();
        const planeDimensionRow2 = new UIRow();

        var planewidthtitle = new UIText( 'width' ).setClass( 'Label' ).setWidth( '120px' );
        this.planeWidth = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var planeheighttitle = new UIText( 'height' ).setClass( 'Label' ).setWidth( '120px' );
        this.planeHeight = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        var planeDimensionChangedFunc = this.planeDimensionChanged.bind(this);
        this.planeWidth.onChange( planeDimensionChangedFunc );
        this.planeHeight.onChange( planeDimensionChangedFunc );

        planeDimensionRow1.add(planewidthtitle, this.planeWidth);
        planeDimensionRow2.add(planeheighttitle, this.planeHeight);

        this.container.add( planeDimensionRow1, planeDimensionRow2 );

        // map
        this.planeMapRow = new UIRow();
        this.planeMapRow.add( new UIText( 'Map' ).setClass( 'Label' ) );

        var onMapChange = this.planeMapChanged.bind(this);
        var onOpacityChangedFunc = this.opacityChanged.bind(this);

        this.planeMap = new UITexture2( showTextureImages );
        var planeOpacityTitle = new UIText( 'opacity' ).setClass( 'Label' ).setWidth( '50px' );
        this.planeOpacity = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var removeMapButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        this.planeOpacity.onChange( onOpacityChangedFunc );
        removeMapButton.onClick( () => { this.mapRemoved(); });

        this.planeMap.onChange( onMapChange );
        this.planeMapRow.add( this.planeMap, planeOpacityTitle, this.planeOpacity, removeMapButton );

        this.container.add( this.planeMapRow );
    }

    planeDimensionChanged() {
        this.editor.execute( new SetGeometryCommand( this.editor, this.editor.selected, new THREE.PlaneGeometry(
            this.planeWidth.getValue(), this.planeHeight.getValue()
        ) ) );
    }
    
    planeMapChanged( texture ) {
        let object = this.editor.selected;
        let material = object.material;

        if ( texture !== null ) {
            texture.colorSpace = THREE.SRGBColorSpace;
            material.needsUpdate = true;
        }

        const newMap = this.planeMap.getValue();

        this.editor.execute( new SetMaterialMapCommand( this.editor, object, 'map', newMap ) );
    }

    opacityChanged() {
        let currentObject = this.editor.selected;

        const newOpacity = this.planeOpacity.getValue();

        this.editor.execute( new SetMaterialOpaqueCommand( this.editor, currentObject, newOpacity ) );        
    }

    mapRemoved() {
        let object = this.editor.selected;

        const newMap = null;

        this.editor.execute( new SetMaterialMapCommand( this.editor, object, 'map', newMap ) );

        this.updateUI();
    }

    updateUI() {
        let object = this.editor.selected;

        const parameters = object.geometry.parameters;

        this.planeWidth.setValue( parameters.width );
        this.planeHeight.setValue( parameters.height );

        const material = object.material;

        this.planeMap.setValue( material[ 'map' ] );
        this.planeOpacity.setValue( material.transparent );
    } 
}
