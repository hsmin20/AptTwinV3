import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInput, UIButton } from '../../src_common/libs/ui.js';

import { UITexture2 } from '../../src_common/libs/ui.three2.js';

import { SetGeometryCommand } from '../../src_common/commands/SetGeometryCommand.js';
import { SetMaterialMapCommand } from '../../src_common/commands/SetMaterialMapCommand.js';

import { setNameAndRepeat, showTextureImages } from './TextureDialog.js';

export class CircleGeometryPanel {
    constructor( editor ) {
        this.editor = editor;
        this.container = new UIDiv();

        // parameters
        this.circleParametersRow1 = new UIRow();
        this.circleParametersRow2 = new UIRow();
        this.circleParametersRow3 = new UIRow();
        this.circleParametersRow4 = new UIRow();

        var radiustitle = new UIText( 'radius' ).setClass( 'Label' ).setWidth( '120px' );
        this.radius = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var segmentstitle = new UIText( 'segments' ).setClass( 'Label' ).setWidth( '120px' );
        this.segments = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var thetaStarttitle = new UIText( 'theta start' ).setClass( 'Label' ).setWidth( '120px' );
        this.thetaStart  = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var thetaLengthtitle = new UIText( 'theta length' ).setClass( 'Label' ).setWidth( '120px' );
        this.thetaLength = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        var circleDimensionChangedFunc = this.circleDimensionChanged.bind(this);
        this.radius.onChange( circleDimensionChangedFunc );
        this.segments.onChange( circleDimensionChangedFunc );
        this.thetaStart.onChange( circleDimensionChangedFunc );
        this.thetaLength.onChange( circleDimensionChangedFunc );

        this.circleParametersRow1.add(radiustitle, this.radius); 
        this.circleParametersRow2.add(segmentstitle, this.segments);
        this.circleParametersRow3.add(thetaStarttitle, this.thetaStart);
        this.circleParametersRow4.add(thetaLengthtitle, this.thetaLength); 

        this.container.add( this.circleParametersRow1, this.circleParametersRow2, this.circleParametersRow3, this.circleParametersRow4 );

        // map
        this.circleMapRow = new UIRow();
        this.circleMapRow.add( new UIText( 'Map' ).setClass( 'Label' ) );

        var onMapChange = this.circleMapChanged.bind(this);
        this.circleMap = new UITexture2( showTextureImages );

        var removeMapButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        removeMapButton.onClick( () => { this.mapRemoved(); });

        this.circleMap.onChange( onMapChange );
        this.circleMapRow.add( this.circleMap, removeMapButton );

        this.container.add( this.circleMapRow );
    }

    circleDimensionChanged() {
        this.editor.execute( new SetGeometryCommand( this.editor, this.editor.selected, new THREE.CircleGeometry(
            this.radius.getValue(), this.segments.getValue(), this.thetaStart.getValue(), this.thetaLength.getValue()
        ) ) );
    }

    circleMapChanged( texture ) {
        let object = this.editor.selected;
        let material = object.material;

        if ( texture !== null ) {
            texture.colorSpace = THREE.SRGBColorSpace;
            material.needsUpdate = true;
        }

        const newMap = this.circleMap.getValue();

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
        this.segments.setValue( parameters.segments );
        this.thetaStart.setValue( parameters.thetaStart );
        this.thetaLength.setValue( parameters.thetaLength );

        const material = object.material;
        const map = material.map;
        const name = map.name.substring(0, map.name.indexOf("_"));
        const repeatx = map.repeat.x;
        const repeaty = map.repeat.y;

        setNameAndRepeat(name, repeatx, repeaty); // To show them in showTextureImage Dialog

        this.circleMap.setValue( material[ 'map' ] );
    }
}
