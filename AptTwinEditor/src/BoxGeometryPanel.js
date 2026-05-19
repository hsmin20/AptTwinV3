import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInput, UISelect, UIButton } from '../../src_common/libs/ui.js';
import { UITexture2 } from '../../src_common/libs/ui.three2.js';

import { SetGeometryCommand } from '../../src_common/commands/SetGeometryCommand.js';

import { SetMaterialCommand } from '../../src_common/commands/SetMaterialCommand.js';
import { SetMaterialMapCommand } from '../../src_common/commands/SetMaterialMapCommand.js';
import { SetMaterialOpaqueCommand } from '../../src_common/commands/SetMaterialOpaqueCommand.js';

import { setNamesAndRepeats, showTextureImagesByIndex0, showTextureImagesByIndex1, showTextureImagesByIndex2, 
        showTextureImagesByIndex3, showTextureImagesByIndex4, showTextureImagesByIndex5 } from './TextureDialog.js';
import { UIBoolean } from '../../src_common/libs/ui.three.js';

export class BoxGeometryPanel {
    constructor( editor ) {
        this.editor = editor;

        this.container = new UIDiv();

        // width, height, depth
        this.boxDimensionRow1 = new UIRow();
        this.boxDimensionRow2 = new UIRow();
        this.boxDimensionRow3 = new UIRow();
        // this.boxDimensionRow.add( new UIText( 'Dimension' ).setClass( 'Label' ) );

        var boxwidthtitle = new UIText( 'width' ).setClass( 'Label' ).setWidth( '120px' );
        this.boxWidth = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var boxheighttitle = new UIText( 'height' ).setClass( 'Label' ).setWidth( '120px' );
        this.boxHeight = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var boxdepthtitle = new UIText( 'depth' ).setClass( 'Label' ).setWidth( '120px' );
        this.boxDepth = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        var boxDimensionChangedFunc = this.boxDimensionChanged.bind(this);
        this.boxWidth.onChange( boxDimensionChangedFunc );
        this.boxHeight.onChange( boxDimensionChangedFunc );
        this.boxDepth.onChange( boxDimensionChangedFunc );

        this.boxDimensionRow1.add(boxwidthtitle, this.boxWidth);
        this.boxDimensionRow2.add(boxheighttitle, this.boxHeight);
        this.boxDimensionRow3.add(boxdepthtitle, this.boxDepth);

        this.container.add( this.boxDimensionRow1, this.boxDimensionRow2, this.boxDimensionRow3 );

        // type
        this.boxMaterialClassRow = new UIRow();

        this.boxMaterialClassRow.add( new UIText( 'Type' ).setClass( 'Label' ) );
        this.materialClass = new UISelect().setWidth( '150px' ).setFontSize( '12px' );
        
        this.materialClass.setOptions( meshMaterialOptions );
        var materialTypeChangedFunc = this.materialTypeChanged.bind(this);
        this.materialClass.onChange( materialTypeChangedFunc );

        this.boxMaterialClassRow.add( this.materialClass );

        this.container.add( this.boxMaterialClassRow );

        // map
        const leftRow = new UIRow();
        const rightRow = new UIRow();
        const topRow = new UIRow();
        const bottomRow = new UIRow();
        const insideRow = new UIRow();
        const outsideRow = new UIRow();

        var onMapChangedFunc = this.boxMapChanged.bind(this);
        var onOpacityChangedFunc = this.opacityChanged.bind(this);

        var lefttitle = new UIText( 'Left Map' ).setClass( 'Label' ).setWidth( '120px' );
        this.leftMap = new UITexture2( showTextureImagesByIndex0 ).onChange( onMapChangedFunc );
        var leftopacityTitle = new UIText( 'opacity' ).setClass( 'Label' ).setWidth( '50px' );
        this.leftOpacity = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var removeLeftButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        this.leftOpacity.onChange( onOpacityChangedFunc );
        removeLeftButton.onClick( () => { this.boxMapRemoved(0); });

        var righttitle = new UIText( 'Right Map' ).setClass( 'Label' ).setWidth( '120px' );
        this.rightMap = new UITexture2( showTextureImagesByIndex1 ).onChange( onMapChangedFunc );
        var rightopacityTitle = new UIText( 'opacity' ).setClass( 'Label' ).setWidth( '50px' );
        this.rightOpacity = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var removeRightButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        this.rightOpacity.onChange( onOpacityChangedFunc );
        removeRightButton.onClick( () => { this.boxMapRemoved(1); });

        var toptitle = new UIText( 'Top Map' ).setClass( 'Label' ).setWidth( '120px' );
        this.topMap = new UITexture2( showTextureImagesByIndex2 ).onChange( onMapChangedFunc );
        var topopacityTitle = new UIText( 'opacity' ).setClass( 'Label' ).setWidth( '50px' );
        this.topOpacity = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var removeTopButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        this.topOpacity.onChange( onOpacityChangedFunc );
        removeTopButton.onClick( () => { this.boxMapRemoved(2); });

        var bottomtitle = new UIText( 'Bottom Map' ).setClass( 'Label' ).setWidth( '120px' );
        this.bottomMap = new UITexture2( showTextureImagesByIndex3 ).onChange( onMapChangedFunc );
        var bottomopacityTitle = new UIText( 'opacity' ).setClass( 'Label' ).setWidth( '50px' );
        this.bottomOpacity = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var removeBottomButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        this.bottomOpacity.onChange( onOpacityChangedFunc );
        removeBottomButton.onClick( () => { this.boxMapRemoved(3); });

        var insidetitle = new UIText( 'Inside Map' ).setClass( 'Label' ).setWidth( '120px' );
        this.insideMap = new UITexture2( showTextureImagesByIndex4 ).onChange( onMapChangedFunc );
        var insideopacityTitle = new UIText( 'opacity' ).setClass( 'Label' ).setWidth( '50px' );
        this.insideOpacity = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var removeInsideButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        this.insideOpacity.onChange( onOpacityChangedFunc );
        removeInsideButton.onClick( () => { this.boxMapRemoved(4); });

        var outsidetitle = new UIText( 'Outside Map' ).setClass( 'Label' ).setWidth( '120px' );
        this.outsideMap = new UITexture2( showTextureImagesByIndex5 ).onChange( onMapChangedFunc );
        var outsideopacityTitle = new UIText( 'opacity' ).setClass( 'Label' ).setWidth( '50px' );
        this.outsideOpacity = new UIBoolean().setWidth( '100px' ).setFontSize( '12px' );
        var removeOutsideButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        this.outsideOpacity.onChange( onOpacityChangedFunc );
        removeOutsideButton.onClick( () => { this.boxMapRemoved(5); });

        this.boxMaps = [];
        this.boxMaps.push( this.leftMap, this.rightMap, this.topMap, this.bottomMap, this.insideMap, this.outsideMap );
        this.opacities = [];
        this.opacities.push( this.leftOpacity, this.rightOpacity, this.topOpacity, this.bottomOpacity, this.insideOpacity, this.outsideOpacity );

        leftRow.add(lefttitle, this.leftMap, leftopacityTitle, this.leftOpacity, removeLeftButton);
        rightRow.add(righttitle, this.rightMap, rightopacityTitle, this.rightOpacity, removeRightButton);
        topRow.add(toptitle, this.topMap, topopacityTitle, this.topOpacity, removeTopButton);
        bottomRow.add(bottomtitle, this.bottomMap, bottomopacityTitle, this.bottomOpacity, removeBottomButton);
        insideRow.add(insidetitle, this.insideMap, insideopacityTitle, this.insideOpacity, removeInsideButton);
        outsideRow.add(outsidetitle, this.outsideMap, outsideopacityTitle, this.outsideOpacity, removeOutsideButton);

        this.container.add( leftRow );
        this.container.add( rightRow );
        this.container.add( topRow );
        this.container.add( bottomRow );
        this.container.add( insideRow );
        this.container.add( outsideRow );
    }

    boxDimensionChanged() {
        this.editor.execute( new SetGeometryCommand( this.editor, this.editor.selected, new THREE.BoxGeometry(
            this.boxWidth.getValue(), this.boxHeight.getValue(), this.boxDepth.getValue()
        ) ) );
    }

    opacityChanged() {
        let currentObject = this.editor.selected;

        const newOpacities = [];
        for(let i=0; i<6; i++)
            newOpacities.push( this.opacities[i].getValue() );

        this.editor.execute( new SetMaterialOpaqueCommand( this.editor, currentObject, newOpacities ) );        
    }

    materialTypeChanged() {
        let currentObject = this.editor.selected;
        let material = currentObject.material;

        if ( material ) {
            if ( material.type !== this.materialClass.getValue() ) {
                material = new materialClasses[ this.materialClass.getValue() ](); // eg, new THREE.MeshBasicMaterial()

                if ( material.type === 'RawShaderMaterial' ) {
                    material.vertexShader = vertexShaderVariables + material.vertexShader;
                }

                if ( Array.isArray( material ) ) {
                    // don't remove the entire multi-material. just the material of the selected slot
                    this.editor.removeMaterial( material[ 0 ] );
                } else {
                    this.editor.removeMaterial( material );
                }

                this.editor.execute( new SetMaterialCommand( this.editor, currentObject, material, 0 ), 'SetMaterial' + ': ' + this.materialClass.getValue() );
                this.editor.addMaterial( material );
            }

            this.updateUI(currentObject);
        }
    }
    
    boxMapChanged( texture ) {
        let object = this.editor.selected;
        let materials = object.material;

        if ( texture !== null ) {
            texture.colorSpace = THREE.SRGBColorSpace;
            materials.needsUpdate = true;
        }

        const newMaps = [];
        for(let i=0; i<6; i++)
            newMaps.push( this.boxMaps[i].getValue() );

        this.editor.execute( new SetMaterialMapCommand( this.editor, object, 'map', newMaps ) );
        
        this.updateUI();
    }

    boxMapRemoved( index ) {
        let object = this.editor.selected;

        const newMaps = [];
        for(let i=0; i<6; i++) {
            if(i == index)
                newMaps.push(null);
            else
                newMaps.push( this.boxMaps[i].getValue() );
        }

        this.editor.execute( new SetMaterialMapCommand( this.editor, object, 'map', newMaps ) );

         this.updateUI();
    }

    updateUI() {
        let object = this.editor.selected;

        const parameters = object.geometry.parameters;

        this.boxWidth.setValue( parameters.width );
        this.boxHeight.setValue( parameters.height );
        this.boxDepth.setValue( parameters.depth );

        const materials = object.material;
        if(!Array.isArray(materials))
            return;

        this.materialClass.setValue( materials[0].type );

        for(let i=0; i<materials.length; i++) {
            const map = materials[i].map;
            if(map != null) {
                const name = map.name.substring(0, map.name.indexOf("_"));
                const repeatx = map.repeat.x;
                const repeaty = map.repeat.y;

                setNamesAndRepeats(i, name, repeatx, repeaty); // To show them in showTextureImage Dialog
            }
        }

        for(let i=0; i<6; i++) {
            this.boxMaps[i].setValue( materials[i][ 'map' ] );
            this.opacities[i].setValue( materials[i].transparent );
        }
    }    
}

const materialClasses = {
	'LineBasicMaterial': THREE.LineBasicMaterial,
	'LineDashedMaterial': THREE.LineDashedMaterial,
	'MeshBasicMaterial': THREE.MeshBasicMaterial,
	'MeshDepthMaterial': THREE.MeshDepthMaterial,
	'MeshNormalMaterial': THREE.MeshNormalMaterial,
	'MeshLambertMaterial': THREE.MeshLambertMaterial,
	'MeshMatcapMaterial': THREE.MeshMatcapMaterial,
	'MeshPhongMaterial': THREE.MeshPhongMaterial,
	'MeshToonMaterial': THREE.MeshToonMaterial,
	'MeshStandardMaterial': THREE.MeshStandardMaterial,
	'RawShaderMaterial': THREE.RawShaderMaterial,
	'ShaderMaterial': THREE.ShaderMaterial,
	'ShadowMaterial': THREE.ShadowMaterial,
	'SpriteMaterial': THREE.SpriteMaterial,
	'PointsMaterial': THREE.PointsMaterial
};

const meshMaterialOptions = {
    'MeshBasicMaterial': 'MeshBasicMaterial',
    'MeshDepthMaterial': 'MeshDepthMaterial',
    'MeshNormalMaterial': 'MeshNormalMaterial',
    'MeshLambertMaterial': 'MeshLambertMaterial',
    'MeshMatcapMaterial': 'MeshMatcapMaterial',
    'MeshPhongMaterial': 'MeshPhongMaterial',
    'MeshToonMaterial': 'MeshToonMaterial',
    'MeshStandardMaterial': 'MeshStandardMaterial',
    'MeshPhysicalMaterial': 'MeshPhysicalMaterial',
    'RawShaderMaterial': 'RawShaderMaterial',
    'ShaderMaterial': 'ShaderMaterial',
    'ShadowMaterial': 'ShadowMaterial'
};