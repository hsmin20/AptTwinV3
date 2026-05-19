import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInput, UIButton } from '../../src_common/libs/ui.js';
import { UITexture2 } from '../../src_common/libs/ui.three2.js';

import { SetGeometryCommand } from '../../src_common/commands/SetGeometryCommand.js';

import { SetMaterialMapCommand } from '../../src_common/commands/SetMaterialMapCommand.js';

import { setNameAndRepeat, showTextureImages } from './TextureDialog.js';
import { UIBoolean } from '../../src_common/libs/ui.three.js';

export class ConeGeometryPanel {
    constructor( editor ) {
        this.editor = editor;

        this.container = new UIDiv();

        // parameters
        this.coneParametersRow1 = new UIRow();
        this.coneParametersRow2 = new UIRow();
        this.coneParametersRow3 = new UIRow();
        this.coneParametersRow4 = new UIRow();
        this.coneParametersRow5 = new UIRow();
        this.coneParametersRow6 = new UIRow();
        this.coneParametersRow7 = new UIRow();

        var radiustitle = new UIText( 'radius' ).setClass( 'Label' ).setWidth( '120px' );
        this.radius = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
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

        var coneDimensionChangedFunc = this.coneDimensionChanged.bind(this);
        this.radius.onChange( coneDimensionChangedFunc );
        this.height.onChange( coneDimensionChangedFunc );
        this.radialSegments.onChange( coneDimensionChangedFunc );
        this.heightSegments.onChange( coneDimensionChangedFunc );
        this.openEnded.onChange( coneDimensionChangedFunc );
        this.thetaStart.onChange( coneDimensionChangedFunc );
        this.thetaLength.onChange( coneDimensionChangedFunc );

        this.coneParametersRow1.add(radiustitle, this.radius); 
        this.coneParametersRow2.add(heighttitle, this.height);
        this.coneParametersRow3.add(radialSegmentstitle, this.radialSegments);
        this.coneParametersRow4.add(heightSegmentstitle, this.heightSegments); 
        this.coneParametersRow5.add(openEndedtitle, this.openEnded);
        this.coneParametersRow6.add(thetaStarttitle, this.thetaStart);
        this.coneParametersRow7.add(thetaLengthtitle, this.thetaLength);

        this.container.add( this.coneParametersRow1, this.coneParametersRow2, this.coneParametersRow3, this.coneParametersRow4 );
        this.container.add( this.coneParametersRow5, this.coneParametersRow6, this.coneParametersRow7 );

        // map
        this.coneMapRow = new UIRow();
        this.coneMapRow.add( new UIText( 'Map' ).setClass( 'Label' ) );

        var onMapChange = this.coneMapChanged.bind(this);
        this.coneMap = new UITexture2( showTextureImages );

        var removeMapButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        removeMapButton.onClick( () => { this.mapRemoved(); });

        this.coneMap.onChange( onMapChange );
        this.coneMapRow.add( this.coneMap, removeMapButton );

        this.container.add( this.coneMapRow );
    }

    coneDimensionChanged() {
        this.editor.execute( new SetGeometryCommand( this.editor, this.editor.selected, new THREE.ConeGeometry(
            this.radius.getValue(), this.height.getValue(), this.radialSegments.getValue(), this.heightSegments.getValue(),
            this.openEnded.getValue(), this.thetaStart.getValue(), this.thetaLength.getValue()
        ) ) );
    }

    coneMapChanged( texture ) {
        let object = this.editor.selected;
        let material = object.material;

        if ( texture !== null ) {
            texture.colorSpace = THREE.SRGBColorSpace;
            material.needsUpdate = true;
        }

        const newMap = this.coneMap.getValue();

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

        this.radius.setValue( parameters.radius );
        this.height.setValue( parameters.height );
        this.radialSegments.setValue( parameters.radialSegments );
        this.heightSegments.setValue( parameters.heightSegments );
        this.openEnded.setValue( parameters.openEnded );
        this.thetaStart.setValue( parameters.thetaStart );
        this.thetaLength.setValue( parameters.thetaLength );

        const material = object.material;
        const map = material.map;
        const name = map.name.substring(0, map.name.indexOf("_"));
        const repeatx = map.repeat.x;
        const repeaty = map.repeat.y;

        setNameAndRepeat(name, repeatx, repeaty); // To show them in showTextureImage Dialog

        this.coneMap.setValue( material[ 'map' ] );
    }    
}
