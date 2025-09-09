import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class GasRange {
    static add_Internal(editor, parent, name, width, height, depth, gasRangeType, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'GasRange';
        group.userData.DBid = 'n/a';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Body
        let topTexture = textureHelper.get(gasRangeType, 1, 1);
        let frontTexture = textureHelper.get('WhitePlastic', 1, 1);
        let bottomTexture = textureHelper.get('WhitePlastic', 1, 1);
        let backTexture = textureHelper.get('WhitePlastic', 1, 1);
        let sideTextureL = textureHelper.get('WhitePlastic', 1, 1);
        let sideTextureR = textureHelper.get('WhitePlastic', 1, 1);

        const gasRange = new THREE.Mesh( new THREE.BoxGeometry(width, height, depth), [  
            new THREE.MeshStandardMaterial( { map: sideTextureR } ), new THREE.MeshStandardMaterial( { map: sideTextureL } ),
            new THREE.MeshStandardMaterial( { map: topTexture } ), new THREE.MeshStandardMaterial( { map: bottomTexture } ),
            new THREE.MeshStandardMaterial( { map: frontTexture } ), new THREE.MeshStandardMaterial( { map: backTexture } )
        ] );
        gasRange.name = name + "_Body";
        gasRange.position.x = 0.0;
        gasRange.position.y = height / 2.0;
        gasRange.position.z = 0.0;

        group.children.push( gasRange );
        gasRange.parent = group;

        editor.objectChanged( group );
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="gasRangeTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Gas Range</h1>
                        <p>Name : <input type="text" id="gasRangeName" name="gasRangeName" value="GasRange_1"> </p>

                        <h2>Gas Range size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="1.0">
                           Height : <input type="text" id="height" name="height" value="0.10">
                           Depth : <input type="text" id="depth" name="depth" value="0.40"></p>
                        <div class="clearfix"></div>
                        <h2>Gas Range Option</h2>
                        <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/GasRange2Burner.jpg" alt="GasRange2Burner" style="width:120px; height:160px;">
                                <br>
                                <input type="radio" id="GasRange2Burner" name="gasRangetype" " value="GasRange2Burner">2 Burners
                            </div>
                            <div class="gallery">
                                <img src="./images/GasRange3Burner.jpg" alt="GasRange3Burner" style="width:120px; height:160px;">
                                <br>
                                <input type="radio" id="GasRange3Burner" name="gasRangetype" " value="GasRange3Burner" checked>3 Burners
                            </div>
                            <div class="gallery">
                                <img src="./images/GasRange4Burner.jpg" alt="GasRange4Burner" style="width:120px; height:160px;">
                                <br>
                                <input type="radio" id="GasRange4Burner" name="gasRangetype" " value="GasRange4Burner">4 Burners
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

        const gasRangeTypeDialog = document.getElementById("gasRangeTypeDialog");
        const inputNameBox = document.getElementById("gasRangeName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");

        const confirmBtn = gasRangeTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        gasRangeTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // gasRangeTypeDialog.close(); // Have to send the select box value here.
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
            const gasRangetype = document.querySelector('input[name=gasRangetype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, gasRangetype, oldPos, oldRot);
        });

        gasRangeTypeDialog.showModal();
    }
}
