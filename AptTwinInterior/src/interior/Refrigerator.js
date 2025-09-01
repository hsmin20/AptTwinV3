import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Refrigerator {
    static add_Internal(editor, parent, name, width, height, depth, doortype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Refrigerator';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Body
        const doorDepth = 0.1;
        const bodyDepth = depth - doorDepth;

        const fridgeInsideTexture = textureHelper.get('FridgeInside', 1, 1);
        const fridgeInside2Texture = textureHelper.get('FridgeInside2', 1, 1);
        const freezerInsideTexture = textureHelper.get('FreezerInside', 1, 1);

        const shinyTexture = textureHelper.get('Shiny', 1, 2);
        const fridgeBody = new THREE.Mesh( new THREE.BoxGeometry(width, height, bodyDepth), [  
            new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
            new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
            new THREE.MeshStandardMaterial( { map: fridgeInsideTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} )
        ] );
        fridgeBody.name = name + "_Body";
        fridgeBody.position.x = 0.0;
        fridgeBody.position.y = height / 2.0;
        fridgeBody.position.z = 0.0;

        group.children.push( fridgeBody );
        fridgeBody.parent = group;

        // Add doors
        const doorRTexture = textureHelper.get('FridgeDoorR', 1, 1);
        const doorLTexture = textureHelper.get('FridgeDoorL', 1, 1);

        const doorGroup = new THREE.Group();
        doorGroup.name = name + "_DoorGroup";
        doorGroup.position.x = 0.0;
        doorGroup.position.y = 0.0;
        doorGroup.position.z = (bodyDepth + doorDepth) / 2.0;

        group.children.push( doorGroup );
        doorGroup.parent = group;

        if(doortype == 'topFreezer') {
            const freezerHeight = height / 3.0;
            const freezerDoor = new THREE.Mesh( new THREE.BoxGeometry(width, freezerHeight, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorRTexture} ), new THREE.MeshStandardMaterial( { map: freezerInsideTexture} )
            ] );
            freezerDoor.name = name + "_FreezerDoor";
            freezerDoor.position.x = 0.0;
            freezerDoor.position.y = height - (freezerHeight / 2.0);
            freezerDoor.position.z = 0.0;
            freezerDoor.userData.type = 'door';
            freezerDoor.userData.pivotDir = 'right';
            freezerDoor.userData.openDir = 'inward';

            doorGroup.children.push( freezerDoor );
            freezerDoor.parent = doorGroup;

            const fridgeHeight = height - freezerHeight;
            const fridgerDoor = new THREE.Mesh( new THREE.BoxGeometry(width, fridgeHeight, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorRTexture} ), new THREE.MeshStandardMaterial( { map: fridgeInside2Texture} )
            ] );
            fridgerDoor.name = name + "_FridgerDoor";
            fridgerDoor.position.x = 0.0;
            fridgerDoor.position.y = fridgeHeight / 2.0;
            fridgerDoor.position.z = 0.0;
            fridgerDoor.userData.type = 'door';
            fridgerDoor.userData.pivotDir = 'right';
            fridgerDoor.userData.openDir = 'inward';

            doorGroup.children.push( fridgerDoor );
            fridgerDoor.parent = doorGroup;
        } else if(doortype == 'sideBySide') {
            const halfWidth = width / 2.0;
            const leftDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, height, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorLTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} )
            ] );
            leftDoor.name = name + "_LeftDoor";
            leftDoor.position.x = -halfWidth / 2.0;
            leftDoor.position.y = height / 2.0;
            leftDoor.position.z = (bodyDepth + doorDepth) / 2.0;
            leftDoor.userData.pivotDir = 'left';
            leftDoor.userData.openDir = 'inward';

            doorGroup.children.push( leftDoor );
            leftDoor.parent = doorGroup;

            const rightDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, height, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorRTexture} ), new THREE.MeshStandardMaterial( { map: fridgeInside2Texture} )
            ] );
            rightDoor.name = name + "_RightDoor";
            rightDoor.position.x = halfWidth / 2.0;
            rightDoor.position.y = height / 2.0;
            rightDoor.position.z = (bodyDepth + doorDepth) / 2.0;
            rightDoor.userData.type = 'door';
            rightDoor.userData.pivotDir = 'right';
            rightDoor.userData.openDir = 'inward';

            doorGroup.children.push( rightDoor );
            rightDoor.parent = doorGroup;

        } else if(doortype == 'fourDoors') {
            const topHeight = height * 3.0 / 5.0;
            const halfWidth = width / 2.0;
            const leftTopDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, topHeight, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorLTexture} ), new THREE.MeshStandardMaterial( { map: fridgeInside2Texture} )
            ] );
            leftTopDoor.name = name + "_LeftTopDoor";
            leftTopDoor.position.x = -halfWidth / 2.0;
            leftTopDoor.position.y = height - (topHeight / 2.0);
            leftTopDoor.position.z = (bodyDepth + doorDepth) / 2.0;
            leftTopDoor.userData.type = 'door';
            leftTopDoor.userData.pivotDir = 'left';
            leftTopDoor.userData.openDir = 'inward';

            doorGroup.children.push( leftTopDoor );
            leftTopDoor.parent = doorGroup;

            const bottomHeight = height - topHeight;
            const leftBottomDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, bottomHeight, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorLTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} )
            ] );
            leftBottomDoor.name = name + "_LeftBottomDoor";
            leftBottomDoor.position.x = -halfWidth / 2.0;
            leftBottomDoor.position.y = bottomHeight / 2.0;
            leftBottomDoor.position.z = (bodyDepth + doorDepth) / 2.0;
            leftBottomDoor.userData.type = 'door';
            leftBottomDoor.userData.pivotDir = 'left';
            leftBottomDoor.userData.openDir = 'inward';

            doorGroup.children.push( leftBottomDoor );
            leftBottomDoor.parent = doorGroup;

            const rightTopDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, topHeight, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorRTexture} ), new THREE.MeshStandardMaterial( { map: fridgeInside2Texture} )
            ] );
            rightTopDoor.name = name + "_RightTopDoor";
            rightTopDoor.position.x = halfWidth / 2.0;
            rightTopDoor.position.y = height - (topHeight / 2.0);
            rightTopDoor.position.z = (bodyDepth + doorDepth) / 2.0;
            rightTopDoor.userData.type = 'door';
            rightTopDoor.userData.pivotDir = 'right';
            rightTopDoor.userData.openDir = 'inward';

            doorGroup.children.push( rightTopDoor );
            rightTopDoor.parent = doorGroup;

            const rightBottomDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, bottomHeight, doorDepth), [  
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
                new THREE.MeshStandardMaterial( { map: doorRTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} )
            ] );
            rightBottomDoor.name = name + "_RightBottomDoor";
            rightBottomDoor.position.x = halfWidth / 2.0;
            rightBottomDoor.position.y = bottomHeight / 2.0;
            rightBottomDoor.position.z = (bodyDepth + doorDepth) / 2.0;
            rightBottomDoor.userData.type = 'door';
            rightBottomDoor.userData.pivotDir = 'right';
            rightBottomDoor.userData.openDir = 'inward';

            doorGroup.children.push( rightBottomDoor );
            rightBottomDoor.parent = doorGroup;
        }

        editor.objectChanged(group);
    }
    static add(editor, modify=false) {
        const _html = `
            <dialog id="refrigeratorTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Refrigerator</h1>
                        <p>Name : <input type="text" id="refrigeratorName" name="refrigeratorName" value="Refrigerator_1"> </p>

                        <h2>Refrigerator size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="0.912">
                           Height : <input type="text" id="height" name="height" value="1.87">
                           Depth : <input type="text" id="depth" name="depth" value="0.93"></p>
                        <div class="clearfix"></div>
                        <h2>Door Type </h2>
                        <div class="responsive">
                        <div class="gallery">
                            <img src="./images/topFreezer.jpg" alt="topFreezer" width="60" height="60">
                            <input type="radio" id="topFreezer" name="doortype" value="topFreezer">Top Freezer
                        </div>
                        </div>
                        <div class="responsive">
                        <div class="gallery">
                            <img src="./images/sideBySide.jpg" alt="sideBySide" width="60" height="60">
                            <input type="radio" id="sideBySide" name="doortype" value="sideBySide"/>Side By Side
                        </div>
                        </div>
                        <div class="responsive">
                        <div class="gallery">
                            <img src="./images/4doorFridge.jpg" alt="fourDoors" width="60" height="60">
                            <input type="radio" id="fourDoors" name="doortype" value="fourDoors" checked>4 Doors
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

        const refrigeratorTypeDialog = document.getElementById("refrigeratorTypeDialog");
        const inputNameBox = document.getElementById("refrigeratorName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");

        const confirmBtn = refrigeratorTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        refrigeratorTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // refrigeratorTypeDialog.close(); // Have to send the select box value here.
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
            const doortype = document.querySelector('input[name=doortype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, doortype, oldPos, oldRot);
        });

        refrigeratorTypeDialog.showModal();
    }
                    
}
            
