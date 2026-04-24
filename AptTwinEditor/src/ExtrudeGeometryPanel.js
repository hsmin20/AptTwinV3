import * as THREE from 'three';

import { UIDiv, UIRow, UIText, UIInput, UISelect, UIButton } from '../../src_common/libs/ui.js';
import { UITexture2 } from '../../src_common/libs/ui.three2.js';

import { SetGeometryCommand } from '../../src_common/commands/SetGeometryCommand.js';

import { SetMaterialCommand } from '../../src_common/commands/SetMaterialCommand.js';
import { SetMaterialMapCommand } from '../../src_common/commands/SetMaterialMapCommand.js';
import { SetMaterialOpaqueCommand } from '../../src_common/commands/SetMaterialOpaqueCommand.js';

import { showTextureImages } from './TextureDialog.js';
import { UIBoolean } from '../../src_common/libs/ui.three.js';

export class ExtrudeGeometryPanel {
    constructor( editor ) {
        this.editor = editor;

        this.container = new UIDiv();

        // height
        this.extrudeDimensionRow2 = new UIRow();

        var extrudeheighttitle = new UIText( 'height' ).setClass( 'Label' ).setWidth( '120px' );
        this.extrudeHeight = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        var extrudeDimensionChangedFunc = this.extrudeDimensionChanged.bind(this);
        this.extrudeHeight.onChange( extrudeDimensionChangedFunc );

        this.extrudeDimensionRow2.add(extrudeheighttitle, this.extrudeHeight);

        this.container.add( this.extrudeDimensionRow2 );

        // type
        this.extrudeMaterialClassRow = new UIRow();

        this.extrudeMaterialClassRow.add( new UIText( 'Type' ).setClass( 'Label' ) );
        this.materialClass = new UISelect().setWidth( '150px' ).setFontSize( '12px' );
        
        this.materialClass.setOptions( meshMaterialOptions );
        var materialTypeChangedFunc = this.materialTypeChanged.bind(this);
        this.materialClass.onChange( materialTypeChangedFunc );

        this.extrudeMaterialClassRow.add( this.materialClass );

        this.container.add( this.extrudeMaterialClassRow );

        // map
        this.extrudeMapRow = new UIRow();
        this.extrudeMapRow.add( new UIText( 'Map' ).setClass( 'Label' ) );

        var onMapChange = this.extrudeMapChanged.bind(this);
        this.extrudeMap = new UITexture2( showTextureImages );

        var removeMapButton = new UIButton( 'Remove' ).setWidth( '80px' ).setMarginLeft( '10px' ).setMarginRight( '10px' );
        removeMapButton.onClick( () => { this.mapRemoved(); });

        this.extrudeMap.onChange( onMapChange );
        this.extrudeMapRow.add( this.extrudeMap, removeMapButton );

        this.container.add( this.extrudeMapRow );

    }

    extrudeDimensionChanged() {
        // this.editor.execute( new SetGeometryCommand( this.editor, this.editor.selected, new THREE.ExtrudeGeometry(
            
        // ) ) );
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
    
    extrudeMapChanged( texture ) {
        let object = this.editor.selected;
        let material = object.material;

        if ( texture !== null ) {
            texture.colorSpace = THREE.SRGBColorSpace;
            material.needsUpdate = true;
        }

        const newMap = this.extrudeMap.getValue();

        this.editor.execute( new SetMaterialMapCommand( this.editor, object, 'map', newMap ) );

        this.updateUI();
    }

    mapRemoved( index ) {
        let object = this.editor.selected;

        const newMap = null;

        this.editor.execute( new SetMaterialMapCommand( this.editor, object, 'map', newMap ) );

        this.updateUI();
    }

    updateUI() {
        let object = this.editor.selected;

        const parameters = object.geometry.parameters;

        this.extrudeHeight.setValue( parameters.height );

        const material = object.material;

        this.materialClass.setValue( material.type );

        this.extrudeMap.setValue( material[ 'map' ] );
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