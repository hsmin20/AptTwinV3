import * as THREE from 'three';
import { UIPanel, UIRow, UIHorizontalRule } from '../../src_common/libs/ui.js';
import { SetValueCommand } from '../../src_common/commands/SetValueCommand.js';

export class MenubarTools {
    constructor( editor ) {
        this.editor = editor;

        this.container = new UIPanel();
        this.container.setClass( 'menu' );

        const title = new UIPanel();
        title.setClass( 'title' );
        title.setTextContent( 'Tools' );
        this.container.add( title );

        const options = new UIPanel();
        options.setClass( 'options' );
        this.container.add( options );

        // Additional Information
        let option = new UIRow().setTextContent( 'Additional Info' ).setClass( 'option' );
        option.onClick( async () => {
            this.addAdditionalInfo();
        } );
        options.add( option );

        options.add( new UIHorizontalRule() );

        // Upload
        option = new UIRow().setTextContent( 'Upload to DB' ).setClass( 'option' );
        option.onClick( async () => {
            let data = editor.toJSON2();
            const userId = localStorage.getItem("userid");
            const urlParams = new URL(location.href).searchParams;
            const model_id = urlParams.get('model_id');
            let house_id = urlParams.get('house_id');
            if(house_id == null) {
                house_id = localStorage.getItem("house_id");
            }

            const url = './upload_model.php?tblname=Houses&userId=' + userId + '&model_id=' + model_id + '&house_id=' + house_id;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                } );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const newID = await response.text();

                if(house_id == null) {
                    localStorage.setItem("house_id", newID);
                    alert("New House is uploaded.");
                } else {
                    alert("House is Updated");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error uploading data to Database');
            }
        } );
        options.add( option );

        // Download
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Download(&override) from DB' );
        option.onClick( async () => {
            const urlParams = new URL(location.href).searchParams;
            let house_id = urlParams.get('house_id');
            if(house_id == null) {
                house_id = localStorage.getItem("house_id");
            }
            if(house_id == null) {
                alert('No House ID exists');
                return;
            }
            try {
                const response = await fetch('./download_model.php?tblname=Houses&house_id=' + house_id);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                editor.clear();
                editor.fromJSON( data );

                alert('Done downloading');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } );
        options.add( option );

        options.add( new UIHorizontalRule() );

        // Player
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Go to Player' );
        option.onClick( () => {
            window.location.href = './player.html';
        } );
        options.add( option );
    }

    addAdditionalInfo() {
        let _html = `
            <dialog id="addAdditionalInfoDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add Additional Information</h1>
                        <p>Name(별명) : <input type="text" id="nickName" name="nickName" value="NICKNAME"> </p>
                        <p>비고(참고) : <input type="text" id="comment2" name="comment2" value="COMMENT2"> </p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const nickName = this.editor.scene.userData.nickName;
        if(nickName == undefined)
            _html = _html.replace('NICKNAME', '');
        else
            _html = _html.replace('NICKNAME', nickName);
        const comment2 = this.editor.scene.userData.comment2;
        if(comment2 == undefined)
             _html = _html.replace('COMMENT2', '');
        else
            _html = _html.replace('COMMENT2', comment2);

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addAdditionalInfoDialog = document.getElementById("addAdditionalInfoDialog");
        const confirmBtn = addAdditionalInfoDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addAdditionalInfoDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            const nickName = document.getElementById("nickName").value;
            const comment2 = document.getElementById("comment2").value;
            document.body.removeChild(dialog)
            
            // temporary obj for userData
            var obj = new THREE.Object3D();
            obj.userData.nickName = nickName;
            obj.userData.comment2 = comment2;

            const userData = obj.userData;
            const object = this.editor.scene;

            if ( JSON.stringify( object.userData ) != JSON.stringify( userData ) ) {
                this.editor.execute( new SetValueCommand( this.editor, object, 'userData', userData ) );
            }
        });

        addAdditionalInfoDialog.showModal();
    }
}
