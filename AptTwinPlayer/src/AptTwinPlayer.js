import * as THREE from 'three';

import { Player } from './Player.js';
import { Menubar } from './Menubar.js';

const urlParams = new URL(location.href).searchParams;
let isSample = urlParams.get('sample');
if(isSample == undefined)
    isSample = false;
let house_id = urlParams.get('house_id');
if(house_id == undefined)
    house_id = -1;

const player = new Player();

const menubar = new Menubar(player);
document.body.appendChild( menubar.dom );

function loadDataFromFile(filename) {
    var loader = new THREE.FileLoader();
    loader.load( filename, function ( text ) {
        const data = JSON.parse( text );
        
        player.loadScene(data);

        if(!player.isMobile())
            player.addCrosshair();
        
        player.initControl();
        player.animate();
    } );
}

function onSuccessStorage() {
    player.storage.get( async function ( data ) {
        if ( data !== undefined ) {
            player.loadScene(data);
        }

        if(!player.isMobile())
            player.addCrosshair();
        
        player.initControl();
        player.animate();
    } );
}

let timeoutID;
export function saveState() {

    clearTimeout( timeoutID );

    timeoutID = setTimeout( function () {

        timeoutID = setTimeout( function () {
            player.storage.set( player.toJSON2() );

        }, 100 );

    }, 1000 );

}

if(isSample|| house_id != -1) {
    player.storage.init(function() {});
    try {
        if(isSample) {
            house_id = 105;
        }
        const url = './download_model.php?tblname=Houses&house_id=' + house_id;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        player.loadScene(data);

        if(!player.isMobile())
            player.addCrosshair();

        player.initControl();
        player.animate();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
} else {
    player.storage.init(onSuccessStorage);
}

export function changeView(style) {
    player.changeView(style);
}
