import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class CoffeeTable {
    static add_Internal(editor, name, width, height, depth, coffeeTabletype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'CoffeeTable';
        group.userData.width = width;
        group.userData.height = height;
        group.userData.depth = depth;
        group.userData.coffeeTableType = coffeeTabletype;

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // totalHeight = height + panelHeight
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
        tablePanel.position.y = height / 2.0;
        tablePanel.position.z = 0.0;

        group.children.push( tablePanel );
        tablePanel.parent = group;

        // Add 4 legs
        const leg_width = 0.03;
        const offset_x = width / 2.0 - (leg_width / 2.0) - 0.01;
        const offset_z = depth / 2.0 - (leg_width / 2.0) - 0.01;

        const legTexture = textureHelper.get('Wood', 1, 4);
        for(let i=1; i<=4; i++) {
            const leg = new THREE.Mesh( new THREE.BoxGeometry(leg_width, height, leg_width), 
                                        new THREE.MeshStandardMaterial( { map: legTexture} ));
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = 0.0; //-panelHeight / 2.0;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        group.position.y = (height + 0) / 2.0;

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        let _html = `
            <dialog id="coffeeTableTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Coffee Table</h1>
                        <p>Name : <input type="text" id="coffeeTableName" name="coffeeTableName" value="_NAME_"> </p>

                        <h2>Coffee Table size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="_WIDTH_">
                           Height : <input type="text" id="height" name="height" value="_HEIGHT_">
                           Depth : <input type="text" id="depth" name="depth" value="_DEPTH_"></p>
                        <div class="clearfix"></div>
                        <h2>Coffee Table Option</h2>
                         <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/CoffeTable_Wood.jpg" alt="wood" style="width:200px; height:120px;">
                                <br>
                                <input type="radio" id="wood" name="coffeeTableType" value="Wood">Wood
                            </div>

                            <div class="gallery">
                                <img src="./images/CoffeTable_Glass.jpg" alt="glass" style="width:200px; height:120px;">
                                <br>
                                <input type="radio" id="glass" name="coffeeTableType" value="Glass">Glass
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
        `;

        let name = 'CoffeeTable_1';
        let width = '0.686';
        let height = '0.292';
        let depth = '0.264';
        let coffeeTableType = 'Wood';
        if(modify && editor.selected) {
            name = editor.selected.name;
            width = editor.selected.userData.width;
            height = editor.selected.userData.height;
            depth = editor.selected.userData.depth;
            coffeeTableType = editor.selected.userData.coffeeTableType;
        }

        _html = _html.replace('_NAME_', name);
        _html = _html.replace('_WIDTH_', width);
        _html = _html.replace('_HEIGHT_', height);
        _html = _html.replace('_DEPTH_', depth);

        const origin = 'value="' + coffeeTableType + '"';
        const replaced = 'value="' + coffeeTableType + '" checked';
        _html = _html.replace(origin, replaced);

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
            var oldPos = null;
            var oldRot = null;
            if(modify) {
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;

                editor.execute( new RemoveObjectCommand( editor, editor.selected ) );
            }

            var name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const coffeeTabletype = document.querySelector('input[name=coffeeTableType]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, name, width, height, depth, coffeeTabletype, oldPos, oldRot);
        });

        coffeeTableTypeDialog.showModal();
    }
}
