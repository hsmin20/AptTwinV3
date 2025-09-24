import * as THREE from 'three';

import { UIPanel, UIRow, UIInput, UICheckbox, UITextArea, UIText, UIButton } from '../../src_common/libs/ui.js';
import { UIBoolean } from '../../src_common/libs/ui.three.js';

import { SetValueCommand } from '../../src_common/commands/SetValueCommand.js';
import { SetPositionCommand } from '../../src_common/commands/SetPositionCommand.js';
import { SetRotationCommand } from '../../src_common/commands/SetRotationCommand.js';

export class SidebarObject {
    constructor(editor) {
        this.editor = editor;

        this.container = new UIPanel();
        this.container.setBorderTop( '0' );
        this.container.setPaddingTop( '20px' );
        // this.container.setDisplay( 'none' );

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
        const xRow = new UIRow();
        const yRow = new UIRow();
        const zRow = new UIRow();

        var xtitle = new UIText( 'x position' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectPositionX = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var ytitle = new UIText( 'y position' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectPositionY = new UIInput().setWidth( '100px' ).setFontSize( '12px' );
        var ztitle = new UIText( 'z position' ).setClass( 'Label' ).setWidth( '120px' );
        this.objectPositionZ = new UIInput().setWidth( '100px' ).setFontSize( '12px' );

        xRow.add(xtitle, this.objectPositionX);
        yRow.add(ytitle, this.objectPositionY);
        zRow.add(ztitle, this.objectPositionZ);

        var positionUpdatedFunc = this.objectPositionUpdated.bind(this);
        this.objectPositionX.onChange( positionUpdatedFunc );
        this.objectPositionY.onChange( positionUpdatedFunc );
        this.objectPositionZ.onChange( positionUpdatedFunc );

        this.container.add( xRow );
        this.container.add( yRow );
        this.container.add( zRow );

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

        // shadow
        this.objectShadowRow = new UIRow();
        this.objectShadowRow.add( new UIText( 'Shadow' ).setClass( 'Label' ) );

        this.objectCastShadow = new UIBoolean( false, 'Cast' );
        this.objectShadowRow.add( this.objectCastShadow );
        this.objectReceiveShadow = new UIBoolean( false, 'Receive' );
        this.objectShadowRow.add( this.objectReceiveShadow );

        var shadowUpdatedFunc = this.objectShadowUpdated.bind(this);
        this.objectCastShadow.onChange( shadowUpdatedFunc );
        this.objectReceiveShadow.onChange( shadowUpdatedFunc );

        this.container.add( this.objectShadowRow );

        // visible
        const objectVisibleRow = new UIRow();
        this.objectVisible = new UICheckbox();
        var visibleUpdatedFunc = this.objectVisibleUpdated.bind(this);
        this.objectVisible.onChange( visibleUpdatedFunc );

        objectVisibleRow.add( new UIText( 'Visible' ).setClass( 'Label' ) );
        objectVisibleRow.add( this.objectVisible );

        this.container.add( objectVisibleRow );

        // user data
        this.objectUserDataRow = new UIRow();
        this.objectUserData = new UITextArea().setWidth( '250px' ).setHeight( '60px' ).setFontSize( '12px' );

        var userDataChangedFunc = this.userDataChanged.bind(this);
        this.objectUserData.onChange( userDataChangedFunc );

        // this.objectUserDataRow.add( new UIText( 'User Data' ).setClass( 'Label' ) );

        const addUserDataButton = new UIButton( 'User Data' );
        addUserDataButton.setWidth( '80px' );
        addUserDataButton.setMarginLeft( '10px' );
        addUserDataButton.setMarginRight( '10px' );
        addUserDataButton.onClick( () => {
            if(editor.selected == editor.scene) {
                this.addModelHouseInfo();
                return;
            }
            const name = this.editor.selected.name.toLowerCase();
            if(name.includes('door')) {
                this.addDoorUserData();
            } else if(name.includes('window')) {
                this.addWindowUserData();
            } else {
                alert('No User Data applicable');
            }
        } );

        this.objectUserDataRow.add( addUserDataButton );
        this.objectUserDataRow.add( this.objectUserData );

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

    objectShadowUpdated() {
        if ( this.editor.selected.castShadow !== undefined && this.editor.selected.castShadow !== this.objectCastShadow.getValue() ) {
            this.editor.execute( new SetValueCommand( this.editor, this.editor.selected, 'castShadow', this.objectCastShadow.getValue() ) );
        }
        if ( this.editor.selected.receiveShadow !== this.objectReceiveShadow.getValue() ) {
            if ( this.editor.selected.material !== undefined )
                 this.editor.selected.material.needsUpdate = true;
            this.editor.execute( new SetValueCommand( this.editor, this.editor.selected, 'receiveShadow', this.objectReceiveShadow.getValue() ) );
        }
    }

    userDataChanged() {
        let object = this.editor.selected;
        try {
            const userData = JSON.parse( this.objectUserData.getValue() );
            if ( JSON.stringify( object.userData ) != JSON.stringify( userData ) ) {
                this.editor.execute( new SetValueCommand( this.editor, object, 'userData', userData ) );
            }
        } catch ( exception ) {
            console.warn( exception );
        }
    }
    
    updateUI( object ) {
		this.objectType.setValue( object.type );

		this.objectName.setValue( object.name );

		this.objectPositionX.setValue( object.position.x );
		this.objectPositionY.setValue( object.position.y );
		this.objectPositionZ.setValue( object.position.z );

		this.objectRotationX.setValue( object.rotation.x * THREE.MathUtils.RAD2DEG );
		this.objectRotationY.setValue( object.rotation.y * THREE.MathUtils.RAD2DEG );
		this.objectRotationZ.setValue( object.rotation.z * THREE.MathUtils.RAD2DEG );

        if ( object.castShadow !== undefined ) {
			this.objectCastShadow.setValue( object.castShadow );
		}
		if ( object.receiveShadow !== undefined ) {
			this.objectReceiveShadow.setValue( object.receiveShadow );
		}

		this.objectVisible.setValue( object.visible );

        if ( object.isLight ) {
			this.rxRow.setDisplay( 'none' );
            this.ryRow.setDisplay( 'none' );
            this.rzRow.setDisplay( 'none' );
            this.objectReceiveShadow.setDisplay( 'none' );
		} else {
			this.rxRow.setDisplay( '' );
            this.ryRow.setDisplay( '' );
            this.rzRow.setDisplay( '' );
		}

		if ( object.isAmbientLight || object.isHemisphereLight ) {
			this.objectShadowRow.setDisplay( 'none' );
		}

        try {
            this.objectUserData.setValue( JSON.stringify( object.userData, null, '  ' ) );
        } catch ( error ) {
            console.log( error );
        }
	}

    addDoorUserData() {
        const _html = `
            <dialog id="addDoorUserDataDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add User Data for Door</h1>
                        <p>* Pivot Position </p>
                        <p><input type="radio" id="left" name="pivotDir" value="left" checked>Left</p>
                        <p><input type="radio" id="right" name="pivotDir" value="right">Right</p>

                        <p>* Open Direction </p>
                        <p><input type="radio" id="inward" name="openDir" value="inward" checked>Inward</p>
                        <p><input type="radio" id="outward" name="openDir" value="outward">Outward</p>

                        <p>* Update state from DB </p>
                        <p>Use DBid<input type="checkbox" id="updateable" name="updateable"></p>
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
            var updateable = document.getElementById("updateable").checked;
            document.body.removeChild(dialog)

            // temporary obj for userData
            var obj = new THREE.Object3D();
            obj.userData.type = 'door';
            obj.userData.pivotDir = pivotDir;
            obj.userData.openDir = openDir;
            if(updateable)
                obj.userData.DBid = 'n/a';

            const userData = obj.userData;
            const object = this.editor.selected;

            if ( JSON.stringify( object.userData ) != JSON.stringify( userData ) ) {
                this.editor.execute( new SetValueCommand( this.editor, object, 'userData', userData ) );
            }
        });

        addDoorUserDataDialog.showModal();
    }

    addWindowUserData() {
        const _html = `
            <dialog id="addWindowUserDataDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add User Data for Window</h1>
                        <p>* Open Direction </p>
                        <p><input type="radio" id="toRight" name="openDir" value="=>" checked>=></p>
                        <p><input type="radio" id="toLeft" name="openDir" value="<="><=</p>

                        <p>* Update state from DB </p>
                        <p>Use DBid<input type="checkbox" id="updateable" name="updateable"></p>
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
            var updateable = document.getElementById("updateable").checked;
            document.body.removeChild(dialog)
            
            // temporary obj for userData
            var obj = new THREE.Object3D();
            obj.userData.type = 'window';
            obj.userData.openDir = openDir;
            if(updateable)
                obj.userData.DBid = 'n/a';

            const userData = obj.userData;
            const object = this.editor.selected;

            if ( JSON.stringify( object.userData ) != JSON.stringify( userData ) ) {
                this.editor.execute( new SetValueCommand( this.editor, object, 'userData', userData ) );
            }
        });

        addWindowUserDataDialog.showModal();
    }

    addModelHouseInfo() {
        var _html = `
            <dialog id="addModelHouseInfoDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add/Modify Model House Information</h1>
                        <p>* 아파트 정보</p>
                        <p>단지이름 : <input type="text" id="complexName" name="complexName" value="COMPLEX_NAME"> </p>
                        <p>평형(m2) : <input type="text" id="size" name="size" value="SIZE"> </p>
                        <p>타입 : <input type="text" id="type" name="type" value="TYPE"> </p>
                        <p>건설사 : <input type="text" id="companyName" name="companyName" value="COMPANY_NAME"> </p>
                        <p>주소 : <input type="text" id="address" name="address" value="ADDRESS"> </p>
                        <p>비고 : <input type="text" id="comment" name="comment" value="COMMENT"> </p>
                        
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `
        const complexName = this.editor.scene.userData.complexName;
        if(complexName == undefined)
            _html = _html.replace('COMPLEX_NAME', '');
        else
            _html = _html.replace('COMPLEX_NAME', complexName);
        const size = this.editor.scene.userData.size;
        if(size == undefined)
            _html = _html.replace('SIZE', '');
        else
            _html = _html.replace('SIZE', size);
         const type = this.editor.scene.userData.type;
        if(type == undefined)
            _html = _html.replace('TYPE', '');
        else
            _html = _html.replace('TYPE', type);
        const companyName = this.editor.scene.userData.companyName;
        if(companyName == undefined)
            _html = _html.replace('COMPANY_NAME', '');
        else
            _html = _html.replace('COMPANY_NAME', companyName);
        const address = this.editor.scene.userData.address;
        if(address == undefined)
            _html = _html.replace('ADDRESS', '');
        else
            _html = _html.replace('ADDRESS', address);
        const comment = this.editor.scene.userData.comment;
        if(comment == undefined)
             _html = _html.replace('COMMENT', '');
        else
            _html = _html.replace('COMMENT', comment);

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addModelHouseInfoDialog = document.getElementById("addModelHouseInfoDialog");
        const confirmBtn = addModelHouseInfoDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addModelHouseInfoDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            const complexName = document.getElementById("complexName").value;
            const size = document.getElementById("size").value;
            const type = document.getElementById("type").value;
            const companyName = document.getElementById("companyName").value;
            const address = document.getElementById("address").value;
            
            const comment = document.getElementById("comment").value;

            document.body.removeChild(dialog)
            
            // temporary obj for userData
            var obj = new THREE.Object3D();
            obj.userData.complexName = complexName;
            obj.userData.size = size;
            obj.userData.type = type;
            obj.userData.companyName = companyName;
            obj.userData.address = address;
            obj.userData.comment = comment;

            const userData = obj.userData;
            const object = this.editor.selected;

            if ( JSON.stringify( object.userData ) != JSON.stringify( userData ) ) {
                this.editor.execute( new SetValueCommand( this.editor, object, 'userData', userData ) );
            }
        });

        addModelHouseInfoDialog.showModal();
    }
}