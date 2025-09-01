import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class TVTable {

    static add_Internal(editor, parent, name, width, height, depth, tvTabletype, noOfLayers, door, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'TVTable';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add Top & Bottom
        const panelDepth = 0.02;
        let panelTexture = textureHelper.get('Wood', 4, 6);

        const topPanel = new THREE.Mesh( new THREE.BoxGeometry(width, panelDepth, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        topPanel.name = name + "_TopPanel";
        topPanel.position.x = 0.0;
        topPanel.position.y = height - (panelDepth / 2.0);
        topPanel.position.z = 0.0;

        group.children.push( topPanel );
        topPanel.parent = group;

        const bottomPanel = new THREE.Mesh( new THREE.BoxGeometry(width, panelDepth, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        bottomPanel.name = name + "_BottomPanel";
        bottomPanel.position.x = 0.0;
        bottomPanel.position.y = panelDepth / 2.0;
        bottomPanel.position.z = 0.0;

        group.children.push( bottomPanel );
        bottomPanel.parent = group;

        // Add Left & Right
        const leftPanel = new THREE.Mesh( new THREE.BoxGeometry(panelDepth, height, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        leftPanel.name = name + "_LeftPanel";
        leftPanel.position.x = -(width - panelDepth) / 2.0;
        leftPanel.position.y = height / 2.0;
        leftPanel.position.z = 0.0;

        group.children.push( leftPanel );
        leftPanel.parent = group;

        const rightPanel = new THREE.Mesh( new THREE.BoxGeometry(panelDepth, height, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        rightPanel.name = name + "_RightPanel";
        rightPanel.position.x = (width - panelDepth) / 2.0;
        rightPanel.position.y = height / 2.0;
        rightPanel.position.z = 0.0;

        group.children.push( rightPanel );
        rightPanel.parent = group;

        // Add Back
        const backPanel = new THREE.Mesh( new THREE.BoxGeometry(width, height, panelDepth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        backPanel.name = name + "_BackPanel";
        backPanel.position.x = 0.0;
        backPanel.position.y = height / 2.0;
        backPanel.position.z = -(depth - panelDepth) / 2.0;

        group.children.push( backPanel );
        backPanel.parent = group;

        // Add Layers
        const height_inside = height - (panelDepth * 2);
        const width_inside = width - (panelDepth * 2);
        const one_layer_width = width_inside / noOfLayers;
        let cur_x = -(width_inside / 2.0) + one_layer_width;
        for(let i=1; i<noOfLayers; i++) {
            const layer = new THREE.Mesh( new THREE.BoxGeometry(panelDepth, height_inside, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ));
            layer.name = name + "_layer" + i;
            layer.position.x = cur_x;
            layer.position.y = panelDepth + height_inside / 2.0;
            layer.position.z = 0.0;

            group.children.push( layer );
            layer.parent = group;

            cur_x += one_layer_width;
        }
        // Add Doors or Drawers
        if(door) {
            let doorLTexture = textureHelper.get('GlassDoorLeft', 1, 1);
            let doorRTexture = textureHelper.get('GlassDoorRight', 1, 1);
            let drawerTexture = textureHelper.get('DrawerDoorFront', 1, 1);
            cur_x = -(width_inside / 2.0) + (one_layer_width / 2.0);
            for(let i=1; i<=noOfLayers; i++) {
                let doorTexture = doorRTexture;
                if(i == noOfLayers) {
                    doorTexture = doorLTexture;
                }
                if(i > 1 && i < noOfLayers) {
                    doorTexture = drawerTexture;
                }
                let material = new THREE.MeshStandardMaterial( { map: doorTexture} );
                if(i == 1 || i == noOfLayers) {
                    material.transparent = true;
                    material.opacity = 0.8;
                }
                const door = new THREE.Mesh( new THREE.BoxGeometry(one_layer_width, height_inside, panelDepth), material);
                door.name = name + "_door" + i;
                door.position.x = cur_x;
                door.position.y = panelDepth + height_inside / 2.0;
                door.position.z = depth / 2.0;

                group.children.push( door );
                door.parent = group;

                cur_x += one_layer_width;
            }
        }

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="tvTableTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a TV Table</h1>
                        <p>Name : <input type="text" id="tvTableName" name="tvTableName" value="TVTable_1"> </p>

                        <h2>TV Table size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="2.5">
                           Height : <input type="text" id="height" name="height" value="0.5">
                           Depth : <input type="text" id="depth" name="depth" value="0.5"></p>
                        <div class="clearfix"></div>
                        <h2>TV Table Option</h2>
                        <p><input type="radio" id="wood" name="tvTabletype" value="Wood" checked>Wood
                           <input type="radio" id="glass" name="tvTabletype" value="Glass">Glass
                        </p>
                        <h2>No of Layers</h2>
                        <p>Name : <input type="text" id="layers" name="layers" value="4"></p>
                        <h2>Drawer Type</h2>
                        <p>Name : <input type="checkbox" id="door" name="door" checked><label for="door">Door</label></p>
                </label>
                </p>
                <div>
                <p>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Apply</button>
                </p>
                </div>
            </form>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const tvTableTypeDialog = document.getElementById("tvTableTypeDialog");
        const inputNameBox = document.getElementById("tvTableName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const layersBox = document.getElementById("layers");

        const confirmBtn = tvTableTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        tvTableTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // tvTableTypeDialog.close(); // Have to send the select box value here.
            var parent = editor.selected;
            var oldPos = null;
            var oldRot = null;
            if(modify) {
                parent = editor.selected.parent;
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;

                editor.execute( new RemoveObjectCommand( editor, editor.selected ) );
            }

            var name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const tvTabletype = document.querySelector('input[name=tvTabletype]:checked').value;
            const noOfLayers = parseInt(layersBox.value);
            const door = document.getElementById("door").checked;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, tvTabletype, noOfLayers, door, oldPos, oldRot);
        });

        tvTableTypeDialog.showModal();
    }
}