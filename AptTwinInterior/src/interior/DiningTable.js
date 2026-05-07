import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class DiningTable {
    static add_Internal(editor, name, width, height, depth, texturetype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'DiningTable';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Panel
        const panelHeight = 0.05;
        let panelTexture = textureHelper.get(texturetype, 2, 3);

        const tablePanel = new THREE.Mesh( new THREE.BoxGeometry(width, panelHeight, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        tablePanel.name = name + "_Panel";
        tablePanel.position.x = 0.0;
        tablePanel.position.y = height / 2.0;
        tablePanel.position.z = 0.0;

        group.children.push( tablePanel );
        tablePanel.parent = group;

        // Add 4 legs
        const leg_width = 0.05;
        const offset_x = width / 2.0 - (leg_width / 2.0);
        const offset_z = depth / 2.0 - (leg_width / 2.0);

        const legTexture = textureHelper.get('Wood', 1, 4);
        for(let i=1; i<=4; i++) {
            const leg = new THREE.Mesh( new THREE.BoxGeometry(leg_width, height, leg_width), new THREE.MeshStandardMaterial( { map: legTexture} ));
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = -panelHeight / 2.0;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        group.position.y = (height + panelHeight) / 2.0;

        editor.objectChanged(group);
    }
    static add(editor, modify=false) {
        const _html = `
            <dialog id="DiningTableTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a DiningTable</h1>
                        <p>Name : <input type="text" id="tableName" name="tableName" value="Table_1"> </p>

                    <h2>Table Size (m)</h2>
                     <p>Width : <input type="text" id="width" name="width" value="1.4">
                           Height : <input type="text" id="height" name="height" value="0.8">
                           Depth : <input type="text" id="depth" name="depth" value="0.72"></p>
                    <div class="clearfix"></div>
                        <h2>Table Type </h2>
                         <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/DiningTable_Wood.JPG" alt="wood" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="wood" name="texturetype" value="Wood" checked>Wood
                            </div>

                            <div class="gallery">
                                <img src="./images/DiningTable_Marble.JPG" alt="marbel" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="marbel" name="texturetype" value="Marble">Marble
                            </div>
                        </div>
                        <div class="clearfix"></div>

                </label>
                </p>
                <div>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Apply</button>
                </div>
            </form>
            `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)


        const DiningTableTypeDialog = document.getElementById("DiningTableTypeDialog");
        const inputNameBox = document.getElementById("tableName");
        const widthDining = document.getElementById("width");
        const heightDining = document.getElementById("height");
        const depthDining = document.getElementById("depth");

        const confirmBtn = DiningTableTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        DiningTableTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            // DiningTableTypeDialog.close(); // Have to send the select box value here.
            var oldPos = null;
            var oldRot = null;
            if(modify) {
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;

                editor.execute( new RemoveObjectCommand( editor, editor.selected ) );
            }

            var name = inputNameBox.value;
            const width = parseFloat(widthDining.value);
            const height = parseFloat(heightDining.value);
            const depth = parseFloat(depthDining.value);
            const texturetype = document.querySelector('input[name=texturetype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, name, width, height, depth, texturetype, oldPos, oldRot)
        });

        DiningTableTypeDialog.showModal();
    }
}
