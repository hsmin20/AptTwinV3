import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Sofa {
    static add_Internal(editor, name, width, height, depth, sofatype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Sofa';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute( new AddGroupCommand( editor, group, parent ) );

        const frameTexture = textureHelper.get('Wood', 4, 4);

        const frameheight = 0.08;
        const cushion_height = 0.15;
        const leg_height = 0.1;
        const totalHeight = frameheight + cushion_height + height + leg_height;
        
        // Add a bottom
        const sofaFrame = new THREE.Mesh( new THREE.BoxGeometry(width, frameheight, depth),
                                            new THREE.MeshStandardMaterial( { map: frameTexture} ) );
        sofaFrame.name = name + "_Frame";
        sofaFrame.position.x = 0.0;
        sofaFrame.position.y = frameheight / 2.0 + leg_height - (totalHeight / 2.0);
        sofaFrame.position.z = 0.0;

        group.children.push( sofaFrame );
        sofaFrame.parent = group;

        const cushionTexture = textureHelper.get(sofatype, 2, 2);
        // Add cushion & back panel
        const offset = 0.001;
        const noOfCushion = width > 2.3 ? 3 : 2;
        let cushion_width = width / noOfCushion;
        const backDepth = 0.1;
        let start_x = noOfCushion == 2 ? -0.5 * cushion_width : -1 * cushion_width;
        for(let i=1; i<=noOfCushion; i++) {
            const cushion = new THREE.Mesh( new THREE.BoxGeometry(cushion_width-offset, cushion_height, depth),
                                            new THREE.MeshStandardMaterial( { map: cushionTexture} ));
            cushion.name = name + "_cushion" + i;
            cushion.position.x = start_x;
            cushion.position.y = frameheight + cushion_height / 2.0 + leg_height - (totalHeight / 2.0);
            cushion.position.z = 0.0;

            group.children.push( cushion );
            cushion.parent = group;

            const backFrame = new THREE.Mesh( new THREE.BoxGeometry(cushion_width-offset, height, backDepth),
                                            new THREE.MeshStandardMaterial( { map: cushionTexture} ) );
            backFrame.name = name + "_BackFrame" + i;
            backFrame.position.x = start_x;
            backFrame.position.y = frameheight + cushion_height / 2.0 + height / 2.0 + leg_height - (totalHeight / 2.0);
            backFrame.position.z = -depth / 2.0;
            backFrame.rotation.x = -Math.PI / 8.0

            group.children.push( backFrame );
            backFrame.parent = group;

            start_x += cushion_width;
        }

        // Add arm-rest
        const radius = 0.14;
        for(let i=1; i<=2; i++) {
            const armrest = new THREE.Mesh( new THREE.CylinderGeometry(radius, radius, depth), 
                                            new THREE.MeshStandardMaterial( { map: cushionTexture} ));
            armrest.name = name + "_armrest" + i;
            armrest.position.x = (i % 2 == 0) ? -width / 2.0 : width / 2.0;
            armrest.position.y = frameheight + radius + leg_height - (totalHeight / 2.0);
            armrest.position.z = 0.0;
            armrest.rotation.x = Math.PI / 2.0;

            group.children.push( armrest );
            armrest.parent = group;
        }

        // Add 4 legs
        const leg_width = 0.05;
        const offset_x = width / 2.0 - (leg_width / 2.0);
        const offset_z = depth / 2.0 - (leg_width / 2.0);

        const legTexture = textureHelper.get('Wood', 1, 4);
        for(let i=1; i<=4; i++) {
            const leg = new THREE.Mesh( new THREE.BoxGeometry(leg_width, leg_height, leg_width), 
                                        new THREE.MeshStandardMaterial( { map: legTexture} ));
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = -leg_height / 2.0 + leg_height - (totalHeight / 2.0);
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }


        group.position.y = totalHeight / 2.0;

        editor.objectChanged(group);

    }
         
    static add(editor, modify=false) {
        const _html = `
            <dialog id="sofaTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Sofa</h1>
                        <p>Name : <input type="text" id="sofaName" name="sofaName" value="Sofa_1"> </p>

                        <h2>Sofa size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="1.4">
                           Height : <input type="text" id="height" name="height" value="0.4">
                           Depth : <input type="text" id="depth" name="depth" value="0.72"></p>
                        <div class="clearfix"></div>
                        <h2>Sofa Type </h2>
                        <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/Sofa_Fabric.JPG" alt="fabric" style="width:200px; height:120px;">
                                <br>
                                <input type="radio" id="fabric" name="sofatype" value="Fabric" checked>Fabric
                            </div>

                            <div class="gallery">
                                <img src="./images/Sofa_Leather.JPG" alt="leather" style="width:200px; height:120px;">
                                <br>
                                <input type="radio" id="leather" name="sofatype" value="Leather">Leather
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

        const sofaTypeDialog = document.getElementById("sofaTypeDialog");
        const inputNameBox = document.getElementById("sofaName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");

        const confirmBtn = sofaTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        sofaTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // sofaTypeDialog.close(); // Have to send the select box value here.
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
            const sofatype = document.querySelector('input[name=sofatype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, name, width, height, depth, sofatype, oldPos, oldRot);
        });

        sofaTypeDialog.showModal();
    }
                    
}
            
