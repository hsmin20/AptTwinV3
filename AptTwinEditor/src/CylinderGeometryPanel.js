import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInput, UIButton } from '../../src_common/libs/ui.js';

import { SetGeometryCommand } from '../../src_common/commands/SetGeometryCommand.js';
import { SetMaterialMapCommand } from '../../src_common/commands/SetMaterialMapCommand.js';
import { showTextureImages } from './TextureDialog.js';

import { UIBoolean } from '../../src_common/libs/ui.three.js';
import { UITexture2 } from '../../src_common/libs/ui.three2.js';

export class CylinderGeometryPanel {
    constructor( editor ) {
        this.editor = editor;

        this.container = new UIDiv();

        // parameters
        this.cylinderParametersRow1 = new UIRow();
        this.cylinderParametersRow2 = new UIRow();
        this.cylinderParametersRow3 = new UIRow();
        this.cylinderParametersRow4 = new UIRow();
        this.cylinderParametersRow5 = new UIRow();
        this.cylinderParametersRow6 = new UIRow();
        this.cylinderParametersRow7 = new UIRow();
        this.cylinderParametersRow8 = new UIRow();

        var radiusToptitle = new UIText( 'radius top' ).setClass( 'Label' ).setWidth( '120px' );
        this.radiusTop = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var radiusBottomtitle = new UIText( 'radius bottom' ).setClass( 'Label' ).setWidth( '120px' );
        this.radiusBottom = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var heighttitle = new UIText( 'height' ).setClass( 'Label' ).setWidth( '120px' );
        this.height = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var radialSegmentstitle = new UIText( 'radial segments' ).setClass( 'Label' ).setWidth( '120px' );
        this.radialSegments = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var heightSegmentstitle = new UIText( 'height segments' ).setClass( 'Label' ).setWidth( '120px' );
        this.heightSegments = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var openEndedtitle = new UIText( 'open ended' ).setClass( 'Label' ).setWidth( '120px' );
        this.openEnded = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var thetaStarttitle = new UIText( 'theta start' ).setClass( 'Label' ).setWidth( '120px' );
        this.thetaStart  = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var thetaLengthtitle = new UIText( 'theta length' ).setClass( 'Label' ).setWidth( '120px' );
        this.thetaLength = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        var cylinderDimensionChangedFunc = this.cylinderDimensionChanged.bind(this);
        this.radiusTop.onChange( cylinderDimensionChangedFunc );
        this.radiusBottom.onChange( cylinderDimensionChangedFunc );
        this.height.onChange( cylinderDimensionChangedFunc );
        this.radialSegments.onChange( cylinderDimensionChangedFunc );
        this.heightSegments.onChange( cylinderDimensionChangedFunc );
        this.openEnded.onChange( cylinderDimensionChangedFunc );
        this.thetaStart.onChange( cylinderDimensionChangedFunc );
        this.thetaLength.onChange( cylinderDimensionChangedFunc );

        this.cylinderParametersRow1.add(radiusToptitle, this.radiusTop);
        this.cylinderParametersRow2.add(radiusBottomtitle, this.radiusBottom);
        this.cylinderParametersRow3.add(heighttitle, this.height);
        this.cylinderParametersRow4.add(radialSegmentstitle, this.radialSegments);
        this.cylinderParametersRow5.add(heightSegmentstitle, this.heightSegments); 
        this.cylinderParametersRow6.add(openEndedtitle, this.openEnded);
        this.cylinderParametersRow7.add(thetaStarttitle, this.thetaStart);
        this.cylinderParametersRow8.add(thetaLengthtitle, this.thetaLength);

        this.container.add( this.cylinderParametersRow1, this.cylinderParametersRow2, this.cylinderParametersRow3, this.cylinderParametersRow4 );
        this.container.add( this.cylinderParametersRow5, this.cylinderParametersRow6, this.cylinderParametersRow7, this.cylinderParametersRow8 );

        // map
        this.cylinderMapRow = new UIRow();
        this.cylinderMapRow.add( new UIText( 'Map' ).setClass( 'Label' ) );

        var onMapChange = this.cylinderMapChanged.bind(this);
        this.cylinderMap = new UITexture2( showTextureImages );

        var removeMapButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        removeMapButton.onClick( () => { this.mapRemoved(); });

        this.cylinderMap.onChange( onMapChange );
        this.cylinderMapRow.add( this.cylinderMap, removeMapButton );

        this.container.add( this.cylinderMapRow );
    }

	cylinderDimensionChanged() {
        var object = new THREE.CylinderGeometry(
            this.radiusTop.getValue(), this.radiusBottom.getValue(), this.height.getValue(), 32,
            1, this.openEnded.getValue(), this.thetaStart.getValue(), this.thetaLength.getValue()
            // 0.8, 1.0, 1.0, 20, 1, true, 0, Math.PI * 2 / 3
        );
        this.editor.execute( new SetGeometryCommand( this.editor, this.editor.selected, object ) );

        this.updateUI();
    }

    cylinderMapChanged( texture ) {
        let object = this.editor.selected;
        let material = object.material;

        if ( texture !== null ) {
            texture.colorSpace = THREE.SRGBColorSpace;
            material.needsUpdate = true;
        }

        const newMap = this.cylinderMap.getValue();

        this.editor.execute( new SetMaterialMapCommand( this.editor, object, 'map', newMap ) );

        this.updateUI();
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

        this.radiusTop.setValue( parameters.radiusTop );
        this.radiusBottom.setValue( parameters.radiusBottom );
        this.height.setValue( parameters.height );
        this.radialSegments.setValue( parameters.radialSegments );
        this.heightSegments.setValue( parameters.heightSegments );
        this.openEnded.setValue( parameters.openEnded );
        this.thetaStart.setValue( parameters.thetaStart );
        this.thetaLength.setValue( parameters.thetaLength );

        const material = object.material;

        this.cylinderMap.setValue( material[ 'map' ] );
    }    
}
