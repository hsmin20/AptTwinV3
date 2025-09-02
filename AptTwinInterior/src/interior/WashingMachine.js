import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class WashingMachine {
    static add_Internal(editor, parent, name, width, height, depth, washingMachinetype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'WashingMachine';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Body
        let topTexture = null;
        let frontTexture = null;
        if(washingMachinetype == 'drum') {
            topTexture = textureHelper.get('WhitePlastic', 1, 1);
            frontTexture = textureHelper.get('DrumMachineFront', 1, 1);
        } else {
            topTexture = textureHelper.get('TopLoading', 1, 1);
            frontTexture = textureHelper.get('WhitePlastic', 1, 1);
        }
        let bottomTexture = textureHelper.get('WhitePlastic', 1, 1);
        let backTexture = textureHelper.get('WashingMachineBack', 1, 1);
        let sideTextureL = textureHelper.get('WashingMachineLeft', 1, 1);
        let sideTextureR = textureHelper.get('WashingMachineRight', 1, 1);

        const washingMachine = new THREE.Mesh( new THREE.BoxGeometry(width, height, depth), [  
            new THREE.MeshStandardMaterial( { map: sideTextureR } ), new THREE.MeshStandardMaterial( { map: sideTextureL } ),
            new THREE.MeshStandardMaterial( { map: topTexture } ), new THREE.MeshStandardMaterial( { map: bottomTexture } ),
            new THREE.MeshStandardMaterial( { map: frontTexture } ), new THREE.MeshStandardMaterial( { map: backTexture } )
        ] );
        washingMachine.name = name + "_Body";
        washingMachine.position.x = 0.0;
        washingMachine.position.y = height / 2.0;
        washingMachine.position.z = 0.0;

        group.children.push( washingMachine );
        washingMachine.parent = group;

        editor.objectChanged( group );
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="washingMachineTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Washing Machine</h1>
                        <p>Name : <input type="text" id="washingMachineName" name="washingMachineName" value="WashingMachine_1"> </p>

                        <h2>Desk size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="0.686">
                           Height : <input type="text" id="height" name="height" value="0.892">
                           Depth : <input type="text" id="depth" name="depth" value="0.864"></p>
                        <div class="clearfix"></div>
                        <h2>Washing Machine Option</h2>
                        <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/drummachine_front.jpg" alt="drum" style="width:120px; height:160px;">
                                <br>
                                <input type="radio" id="drum" name="name="washingMachinetype" " value="drum">drum
                            </div>

                            <div class="gallery">
                                <img src="./images/topLoading.jpg" alt="topload" style="width:120px; height:160px;">
                                <br>
                                <input type="radio" id="topload" name="name="washingMachinetype" " value="topload">topload
                            </div>
                        </div>
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

        const washingMachineTypeDialog = document.getElementById("washingMachineTypeDialog");
        const inputNameBox = document.getElementById("washingMachineName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");

        const confirmBtn = washingMachineTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        washingMachineTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // washingMachineTypeDialog.close(); // Have to send the select box value here.
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
           const washingMachinetype = document.querySelector('input[name=washingMachinetype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, washingMachinetype, oldPos, oldRot);
        });

        washingMachineTypeDialog.showModal();
    }
}
