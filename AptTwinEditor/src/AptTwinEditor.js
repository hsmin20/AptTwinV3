import { Editor } from './Editor.js';
import { Viewport } from './Viewport.js';
import { Sidebar } from './Sidebar.js';
import { Menubar } from './Menubar.js';

const urlParams = new URL(location.href).searchParams;
let model_id = urlParams.get('model_id');
if(model_id == undefined)
    model_id = -1;
let house_id = urlParams.get('house_id');
if(house_id == undefined)
    house_id = -1;

const editor = new Editor('Apartment');

const viewport = new Viewport(editor);
document.body.appendChild(viewport.container.dom);

editor.setViewport(viewport);

viewport.createRenderer();
viewport.render();

const sidebar = new Sidebar( editor, viewport );
document.body.appendChild(sidebar.container.dom);

const menubar = new Menubar( editor );
document.body.appendChild( menubar.container.dom );

function onSuccessStorage() {
    editor.storage.get( async function ( state ) {
        if ( state !== undefined ) {
            await editor.fromJSON( state );
        }

        const selected = editor.selected;
        if ( selected !== undefined ) {
            editor.selectByUuid( selected );
        }

    } );
}

let timeoutID;
export function saveState() {

    clearTimeout( timeoutID );

    timeoutID = setTimeout( function () {

        timeoutID = setTimeout( function () {
            editor.storage.set( editor.toJSON2() );

        }, 100 );

    }, 1000 );

}

function onWindowResize() {
    viewport.windowResize();
}

window.addEventListener( 'resize', onWindowResize );

if(model_id != -1 || house_id != -1) {
    editor.storage.init(function() {});
    try {
        let targetURL = "";
        if(house_id != -1) { // House has precedence
            targetURL = './download_model.php?tblname=Houses&house_id=' + house_id;
        } else {
            targetURL = './download_model.php?tblname=ModelHouses&model_id=' + model_id;
        }

        const response = await fetch(targetURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        editor.clear();
        editor.fromJSON( data );
    } catch (error) {
        console.error('Error fetching data:', error);
    }
} else {
    editor.storage.init(onSuccessStorage);
}