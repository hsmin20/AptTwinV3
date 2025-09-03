import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Desk {
    static add_Internal(editor, parent, name, width, height, depth, desktype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Desk';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Panel
        const deskHeight = 0.05;

        let panelTexture = textureHelper.get(desktype, 1, 1);

        let material = new THREE.MeshStandardMaterial( { map: panelTexture} );
        if(desktype == 'Glass') {
            material.transparent = true;
            material.opacity = 0.8;
        }

        const deskPanel = new THREE.Mesh( new THREE.BoxGeometry(width, deskHeight, depth), material );
        deskPanel.name = name + "_Panel";
        deskPanel.position.x = 0.0;
        deskPanel.position.y = height + (deskHeight / 2.0);
        deskPanel.position.z = 0.0;

        group.children.push( deskPanel );
        deskPanel.parent = group;

        // Add side legs
        const leg_width = 0.05;
        const offset_x = width / 2.0 - (leg_width / 2.0);
    
        const legTexture = textureHelper.get('BlackMetal', 1, 4);
        for(let i=1; i<=2; i++) {
            const leg = new THREE.Mesh( new THREE.BoxGeometry(leg_width, height, depth), new THREE.MeshStandardMaterial( { map: legTexture} ));
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = height / 2.0;
            leg.position.z = 0.0;

            group.children.push( leg );
            leg.parent = group;
        }

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="deskTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Desk</h1>
                        <p>Name : <input type="text" id="deskName" name="deskName" value="Desk_1"> </p>

                        <h2>Desk size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="1.4">
                           Height : <input type="text" id="height" name="height" value="0.8">
                           Depth : <input type="text" id="depth" name="depth" value="0.72"></p>
                        <div class="clearfix"></div>
                        <h2>Desk Type </h2>
                        <p>
                        <input type="radio" id="wood" name="desktype" value="Wood" checked>Wood
                        <input type="radio" id="glass" name="desktype" value="Glass">Glass
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

        const deskTypeDialog = document.getElementById("deskTypeDialog");
        const inputNameBox = document.getElementById("deskName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");

        const confirmBtn = deskTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        deskTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // deskTypeDialog.close(); // Have to send the select box value here.
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
            const desktype = document.querySelector('input[name=desktype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, desktype, oldPos, oldRot);
        });

        deskTypeDialog.showModal();
    }
}
