import * as THREE from 'three';

import { UIPanel, UIRow, UIInput, UICheckbox, UITextArea, UIText, UISelect, UIButton } from '../../src_common/libs/ui.js';
import { UIBoolean } from '../../src_common/libs/ui.three.js';

import { SetPositionCommand } from '../../src_common/commands/SetPositionCommand.js';
import { SetRotationCommand } from '../../src_common/commands/SetRotationCommand.js';
import { SetValueCommand } from '../../src_common/commands/SetValueCommand.js';

import { TV } from './interior/TV.js';
import { Sofa } from './interior/Sofa.js';
import { Bed } from './interior/Bed.js';
import { Refrigerator } from './interior/Refrigerator.js';
import { Desk } from './interior/Desk.js';
import { DiningTable } from './interior/DiningTable.js';
import { Bookshelf } from './interior/Bookshelf.js';
import { CoffeeTable } from './interior/CoffeeTable.js';
import { Wardrobe } from './interior/Wardrobe.js';
import { WashingMachine } from './interior/WashingMachine.js';
import { TVTable } from './interior/TVTable.js';
import { Wall } from './interior/Wall.js';
import { DressingTable } from './interior/DressingTable.js';
import { Chair } from './interior/Chair.js';
import { Bench } from './interior/Bench.js';
import { OfficeChair } from './interior/OfficeChair.js';
import { AirConditioner } from './interior/AirConditioner.js';
import { GasRange } from './interior/GasRange.js';
import { RobotVacuum } from './interior/RobotVacuum.js';
import { Dog } from './interior/Dog.js';
import { Cat } from './interior/Cat.js';

export class SidebarObject {
    constructor(editor) {
        this.editor = editor;

        this.container = new UIPanel();
        this.container.setBorderTop( '0' );
        this.container.setPaddingTop( '20px' );

        const objectTypeRow = new UIRow();
        this.objectType = new UIText();

        objectTypeRow.add( new UIText( 'Type' ).setClass( 'Label' ) );
        objectTypeRow.add( this.objectType );

        this.container.add( objectTypeRow );

        // name
        const objectNameRow = new UIRow();
        this.objectName = new UIInput().setWidth( '240px' ).setFontSize( '12px' );
        var nameUpdatedFunc = this.objectNameUpdated.bind(this);
        this.objectName.onChange( nameUpdatedFunc );

        objectNameRow.add( new UIText( 'Name' ).setClass( 'Label' ) );
        objectNameRow.add( this.objectName );

        this.container.add( objectNameRow );

        // position
        this.xRow = new UIRow();
        this.yRow = new UIRow();
        this.zRow = new UIRow();

        var xtitle = new UIText( 'x position' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectPositionX = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var ytitle = new UIText( 'y position' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectPositionY = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var ztitle = new UIText( 'z position' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectPositionZ = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        this.xRow.add(xtitle, this.objectPositionX);
        this.yRow.add(ytitle, this.objectPositionY);
        this.zRow.add(ztitle, this.objectPositionZ);

        var positionUpdatedFunc = this.objectPositionUpdated.bind(this);
        this.objectPositionX.onChange( positionUpdatedFunc );
        this.objectPositionY.onChange( positionUpdatedFunc );
        this.objectPositionZ.onChange( positionUpdatedFunc );

        this.container.add( this.xRow );
        this.container.add( this.yRow );
        this.container.add( this.zRow );

        // rotation
        this.rxRow = new UIRow();
        this.ryRow = new UIRow();
        this.rzRow = new UIRow();

        var rxtitle = new UIText( 'x rotation' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectRotationX = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var rytitle = new UIText( 'y rotation' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectRotationY = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var rztitle = new UIText( 'z rotation' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectRotationZ = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        this.rxRow.add(rxtitle, this.objectRotationX);
        this.ryRow.add(rytitle, this.objectRotationY);
        this.rzRow.add(rztitle, this.objectRotationZ);

        var rotationUpdatedFunc = this.objectRotationUpdated.bind(this);
        this.objectRotationX.onChange( rotationUpdatedFunc );
        this.objectRotationY.onChange( rotationUpdatedFunc );
        this.objectRotationZ.onChange( rotationUpdatedFunc );

        this.container.add( this.rxRow );
        this.container.add( this.ryRow );
        this.container.add( this.rzRow );

        // visible
        const objectVisibleRow = new UIRow();
        this.objectVisible = new UICheckbox();
        var visibleUpdatedFunc = this.objectVisibleUpdated.bind(this);
        this.objectVisible.onChange( visibleUpdatedFunc );

        objectVisibleRow.add( new UIText( 'Visible' ).setClass( 'Label' ) );
        objectVisibleRow.add( this.objectVisible );

        this.container.add( objectVisibleRow );

        // modify
        this.objectUserDataRow = new UIRow();
        const modifyButton = new UIButton( 'Modify' );
        modifyButton.setWidth( '80px' );
        modifyButton.setMarginLeft( '10px' );
        modifyButton.setMarginRight( '10px' );
        modifyButton.onClick( () => {
            const type = this.editor.selected.userData.interiorType;
            if(type =='TVTable') {
                TVTable.add(editor, true);
            } else if(type == 'Wall') {
                Wall.add(editor);
            } else if(type == 'Bed') {
                Bed.add(editor, true);
            } else if(type == 'Refrigerator') {
                Refrigerator.add(editor, true);
            } else if(type == 'Desk') {
                Desk.add(editor, true);
            } else if(type == 'Bookshelf') {
                Bookshelf.add(editor, true);
            } else if(type == 'DiningTable') {
                DiningTable.add(editor, true);
            } else if(type == 'Wardrobe') {
                Wardrobe.add(editor, true);
            } else if(type == 'Sofa') {
                Sofa.add(editor, true);
            } else if(type == 'WashingMachine') {
                WashingMachine.add(editor, true);
            } else if(type == 'CoffeeTable') {
                CoffeeTable.add(editor, true);
            } else if(type == 'TV') {
                TV.add(editor, true);
            } else if(type == 'DressingTable') {
                DressingTable.add(editor, true);
            } else if(type == 'Bench') {
                Bench.add(editor, true);
            } else if(type == 'Chair') {
                Chair.add(editor, true);
            } else if(type == 'OfficeChair') {
                OfficeChair.add(editor, true);
            } else if(type == 'AirConditioner') {
                AirConditioner.add(editor, true);
            } else if(type == 'GasRange') {
                GasRange.add(editor, true);
            } else if(type == 'RobotVacuum') {
                RobotVacuum.add(editor, true);
            } else if(type == 'Dog') {
                Dog.add(editor, true);
            }  else if(type == 'Cat') {
                Cat.add(editor, true);
            } else {
                alert('No Modification applicable');
            }
        } );

        this.objectUserDataRow.add( modifyButton );

        this.container.add( this.objectUserDataRow );
    }

    objectNameUpdated() {
        this.editor.execute( new SetValueCommand( this.editor, this.editor.selected, 'name', this.objectName.getValue() ) );
    }

    objectVisibleUpdated() {
        if ( this.editor.selected.visible !== this.objectVisible.getValue() ) {
            this.editor.execute( new SetValueCommand( this.editor, this.editor.selected, 'visible', this.objectVisible.getValue() ) );
		}
    }

    objectPositionUpdated() {
        const newPosition = new THREE.Vector3( this.objectPositionX.getValue(), this.objectPositionY.getValue(), this.objectPositionZ.getValue() );
        this.editor.execute( new SetPositionCommand( this.editor, this.editor.selected, newPosition ) );
    }

    objectRotationUpdated() {
        const D2R = THREE.MathUtils.DEG2RAD;
        const newRotation = new THREE.Euler( this.objectRotationX.getValue() *D2R, this.objectRotationY.getValue() * D2R, this.objectRotationZ.getValue() * D2R );
        this.editor.execute( new SetRotationCommand( this.editor, this.editor.selected, newRotation ) );
    }
    
    updateUI( object ) {
		this.objectType.setValue( object.userData.interiorType );

		this.objectName.setValue( object.name );

		this.objectPositionX.setValue( object.position.x );
		this.objectPositionY.setValue( object.position.y );
		this.objectPositionZ.setValue( object.position.z );

		this.objectRotationX.setValue( object.rotation.x * THREE.MathUtils.RAD2DEG );
		this.objectRotationY.setValue( object.rotation.y * THREE.MathUtils.RAD2DEG );
		this.objectRotationZ.setValue( object.rotation.z * THREE.MathUtils.RAD2DEG );

		this.objectVisible.setValue( object.visible );

        if ( object.userData.interiorType == 'Wall' ) {
            this.xRow.setDisplay( 'none' );
            this.yRow.setDisplay( 'none' );
            this.zRow.setDisplay( 'none' );
			this.rxRow.setDisplay( 'none' );
            this.ryRow.setDisplay( 'none' );
            this.rzRow.setDisplay( 'none' );
		} else {
            this.xRow.setDisplay( '' );
            this.yRow.setDisplay( '' );
            this.zRow.setDisplay( '' );
			this.rxRow.setDisplay( '' );
            this.ryRow.setDisplay( '' );
            this.rzRow.setDisplay( '' );
		}
	}

    addDoorUserData(sidebarObject, object) {
        const _html = `
            <dialog id="addDoorUserDataDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add User Data for Door</h1>
                        <p>Pivot Position </p>
                        <p><input type="radio" id="left" name="pivotDir" value="left" checked>Left</p>
                        <p><input type="radio" id="right" name="pivotDir" value="right">Right</p>

                        <p>Open Direction </p>
                        <p><input type="radio" id="inward" name="openDir" value="inward" checked>Inward</p>
                        <p><input type="radio" id="outward" name="openDir" value="outward">Outward</p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addDoorUserDataDialog = document.getElementById("addDoorUserDataDialog");
        const confirmBtn = addDoorUserDataDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addDoorUserDataDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            var pivotDir = document.querySelector('input[name=pivotDir]:checked').value;
            var openDir = document.querySelector('input[name=openDir]:checked').value;
            document.body.removeChild(dialog)
            
            object.userData.type = 'door';
            object.userData.pivotDir = pivotDir;
            object.userData.openDir = openDir;
            sidebarObject.updateUI(object);
        });

        addDoorUserDataDialog.showModal();
    }

    addWindowUserData(sidebarObject, object) {
        const _html = `
            <dialog id="addWindowUserDataDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add User Data for Window</h1>
                        <p>Open Direction </p>
                        <p><input type="radio" id="toRight" name="openDir" value="=>" checked>=></p>
                        <p><input type="radio" id="toLeft" name="openDir" value="<="><=</p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addWindowUserDataDialog = document.getElementById("addWindowUserDataDialog");
        const confirmBtn = addWindowUserDataDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addWindowUserDataDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            var openDir = document.querySelector('input[name=openDir]:checked').value;
            document.body.removeChild(dialog)
            
            object.userData.type = 'window';
            object.userData.openDir = openDir;
            sidebarObject.updateUI(object);
        });

        addWindowUserDataDialog.showModal();
    }
}