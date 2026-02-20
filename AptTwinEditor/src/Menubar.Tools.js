import * as THREE from 'three';
import { UIPanel, UIRow, UIHorizontalRule } from '../../src_common/libs/ui.js';

export class MenubarTools {
    constructor( editor ) {
        this.container = new UIPanel();
        this.container.setClass( 'menu' );

        const title = new UIPanel();
        title.setClass( 'title' );
        title.setTextContent( 'Tools' );
        this.container.add( title );

        const options = new UIPanel();
        options.setClass( 'options' );
        this.container.add( options );

        //Recent Model
        

        // Upload
        let option = new UIRow().setTextContent( 'Upload to DB' ).setClass( 'option' );
        option.onClick( async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const model_id = urlParams.get('model_id');

            if(model_id == undefined) {
                alert('No model id! cannot upload!');
                return;
            }
            
            const url = './update_modeldata.php?model_id=' + model_id; 

            let data = editor.toJSON2();

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

                alert('Done uploading');
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error uploading data to Database');
            }
        } );
        options.add( option );

        // Download
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Download from DB' );
        option.onClick( async () => {
            try {
                const response = await fetch('./download_model.php?tblname=ModelHouses');
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

        // Import and Construct 2D floor planner model
        const form = document.createElement( 'form' );
        form.style.display = 'none';
        document.body.appendChild( form );

        const fileInput = document.createElement( 'input' );
        fileInput.multiple = false;
        fileInput.type = 'file';
        fileInput.accetp = '.json';
        fileInput.addEventListener( 'change', async function () {
            const file = fileInput.files[ 0 ];
            if ( file === undefined )
                return;

            try {
                const json = JSON.parse( await file.text() );

                editor.clear();
                editor.constructFrom2DJSON( json );
            } catch ( e ) {
                alert( 'Failed To Open Project' );
                console.error( e );
            } finally {
                form.reset();
            }
        } );
        form.appendChild( fileInput );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Construct from 2D planner' );
        option.onClick( function () {

            fileInput.click();

        } );
        options.add( option );

        options.add( new UIHorizontalRule() );

        // Player
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Go to Interior' );
        option.onClick( () => {
            window.location.href = './interior.html';
        } );
        options.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Go to Player' );
        option.onClick( () => {
            window.location.href = './player.html';
        } );
        options.add( option );
    }
}
