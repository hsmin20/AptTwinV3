import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class CoffeeTable {
    static add_Internal(editor, parent, name, width, height, depth, coffeeTabletype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'CoffeeTable';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Panel
        const panelHeight = 0.05;
        let panelTexture = textureHelper.get(coffeeTabletype, 1, 1);

        const material = new THREE.MeshStandardMaterial( { map: panelTexture} );
        if(coffeeTabletype == 'Glass') {
            material.transparent = true;
            material.opacity = 0.6;
        }

        const tablePanel = new THREE.Mesh( new THREE.BoxGeometry(width, panelHeight, depth), material );
        tablePanel.name = name + "_Panel";
        tablePanel.position.x = 0.0;
        tablePanel.position.y = height + (panelHeight / 2.0);
        tablePanel.position.z = 0.0;

        group.children.push( tablePanel );
        tablePanel.parent = group;

        // Add 4 legs
        const leg_width = 0.03;
        const offset_x = width / 2.0 - (leg_width / 2.0) - 0.01;
        const offset_z = depth / 2.0 - (leg_width / 2.0) - 0.01;

        const legTexture = textureHelper.get('Wood', 1, 4);
        for(let i=1; i<=4; i++) {
            const leg = new THREE.Mesh( new THREE.BoxGeometry(leg_width, height, leg_width), new THREE.MeshStandardMaterial( { map: legTexture} ));
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = height / 2.0;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="coffeeTableTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Coffee Table</h1>
                        <p>Name : <input type="text" id="coffeeTableName" name="coffeeTableName" value="CoffeeTable_1"> </p>

                        <h2>Coffee Table size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="0.686">
                           Height : <input type="text" id="height" name="height" value="0.292">
                           Depth : <input type="text" id="depth" name="depth" value="0.264"></p>
                        <div class="clearfix"></div>
                        <h2>Coffee Table Option</h2>
                        <p><input type="radio" id="wood" name="coffeeTabletype" value="Wood" checked>Wood
                           <input type="radio" id="glass" name="coffeeTabletype" value="Glass">Glass
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

        const coffeeTableTypeDialog = document.getElementById("coffeeTableTypeDialog");
        const inputNameBox = document.getElementById("coffeeTableName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");

        const confirmBtn = coffeeTableTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        coffeeTableTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // coffeeTableTypeDialog.close(); // Have to send the select box value here.
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
           const coffeeTabletype = document.querySelector('input[name=coffeeTabletype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, coffeeTabletype, oldPos, oldRot);
        });

        coffeeTableTypeDialog.showModal();
    }
}
