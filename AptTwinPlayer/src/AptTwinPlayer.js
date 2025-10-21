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
            player.loadScene(data);;
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
            house_id = 47;
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

        // startDataUpdates(10000);
        // player.updating = true;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
} else {
    player.storage.init(onSuccessStorage);
}

let g_intervalId;

async function fetchDataAndUpdateScene() {
    const urlParams = new URL(location.href).searchParams;
    let house_id = urlParams.get('house_id');
    if(house_id == undefined) {
        console.log('No House ID exists');
        return;
    }

    try {
        const response = await fetch('./process.php?tblname=HouseState&house_id=' + house_id);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        player.updateScene(data);

    } catch (error) {
        console.error('Error fetching data:', error);
        // Handle the error appropriately, e.g., display an error message or retry the request
    }
}

export function startDataUpdates(intervalMs) {
    g_intervalId = setInterval(fetchDataAndUpdateScene, intervalMs);
}

export function stopDataUpdates() {
    clearInterval(g_intervalId);
}

export function changeView() {
    player.changeView();
}