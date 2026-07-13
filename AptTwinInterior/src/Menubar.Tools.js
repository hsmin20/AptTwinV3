import * as THREE from 'three';
import { UIPanel, UIRow, UIHorizontalRule } from '../../src_common/libs/ui.js';
import { SetValueCommand } from '../../src_common/commands/SetValueCommand.js';
import { saveState } from './AptTwinInterior.js';

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

        // Upload
        let option = new UIRow().setTextContent( 'Upload to DB' ).setClass( 'option' );
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

        // Start Position
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Set a Starting Point with selected Human' );
        option.onClick( () => {
            const human = editor.selected;
            if ( human !== undefined && human.userData.interiorType == "Human") {
                human.userData.thisIsMe = true;
                
                saveState();

                alert("Start Point Saved");
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
}
