import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Bookshelf {
    static add_Internal(editor, parent, name, width, height, depth, noOfLayers, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Bookshelf';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add Top & Bottom
        const panelDepth = 0.01;
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
        const layer_width = width - (panelDepth  * 2);
        const height_inside = height - (panelDepth * 2);
        const one_layer_height = height_inside / noOfLayers;
        let cur_height = one_layer_height;
        for(let i=1; i<=noOfLayers; i++) {
            const layer = new THREE.Mesh( new THREE.BoxGeometry(layer_width, panelDepth, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ));
            layer.name = name + "_layer" + i;
            layer.position.x = 0.0;
            layer.position.y = cur_height;
            layer.position.z = 0.0;

            group.children.push( layer );
            layer.parent = group;

            cur_height += one_layer_height;
        }

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="bookshelfTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Bookshelf</h1>
                        <p>Name : <input type="text" id="bookshelfName" name="bookshelfName" value="Bookshelf_1"> </p>

                        <h2>Desk size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="0.57">
                           Height : <input type="text" id="height" name="height" value="1.5">
                           Depth : <input type="text" id="depth" name="depth" value="0.3"></p>
                        <div class="clearfix"></div>
                        <h2>No of Layers</h2>
                        <p>Name : <input type="text" id="layers" name="layers" value="4">
                        </p>
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

        const bookshelfTypeDialog = document.getElementById("bookshelfTypeDialog");
        const inputNameBox = document.getElementById("bookshelfName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const layersBox = document.getElementById("layers");

        const confirmBtn = bookshelfTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        bookshelfTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // bookshelfTypeDialog.close(); // Have to send the select box value here.
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
            const noOfLayers = parseInt(layersBox.value);

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, noOfLayers, oldPos, oldRot);
        });

        bookshelfTypeDialog.showModal();
    }
}