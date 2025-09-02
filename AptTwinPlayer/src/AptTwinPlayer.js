import * as THREE from 'three';

import { Player } from './Player.js';
import { Menubar } from './Menubar.js';

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

async function loadDataFromDB(tblname, userid) {
    const url = './download_model.php?tblname=' + tblname + '&userid=' + userid;
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

player.storage.init(onSuccessStorage);

let g_intervalId;

async function fetchDataAndUpdateScene() {
    try {
        const response = await fetch('./process.php?tblname=LotteCastle_105_1505');
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

function startDataUpdates(intervalMs) {
    g_intervalId = setInterval(fetchDataAndUpdateScene, intervalMs);
}

function stopDataUpdates() {
    clearInterval(g_intervalId);
}
