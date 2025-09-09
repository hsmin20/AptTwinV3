import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class TV {
    static add_Internal(editor, parent, name, tvsize, tvtype, oldPos, oldRot) {
             // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'TV';
        group.userData.DBid = 'n/a';
        
        group.position.y = 1.0;

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        const depth = 0.02;
        // Add a box (16:9 size)
        const inchToMeter = 0.0254;
        const theta = Math.atan(9 / 16);
        const width = tvsize * inchToMeter * Math.cos(theta);
        const height = tvsize * inchToMeter * Math.sin(theta);

        const tvTexture = textureHelper.get('TV', 1, 1);
        const backTexture = textureHelper.get('BlackMetal', 5, 4);
        const sideTexture = textureHelper.get('BlackMetal', 1, 4);

        const tvFrame = new THREE.Mesh( new THREE.BoxGeometry(width, height, depth), [  
            new THREE.MeshStandardMaterial( { map: sideTexture} ), new THREE.MeshStandardMaterial( { map: sideTexture} ),
            new THREE.MeshStandardMaterial( { map: sideTexture} ), new THREE.MeshStandardMaterial( { map: sideTexture} ),
            new THREE.MeshStandardMaterial( { map: tvTexture} ), new THREE.MeshStandardMaterial( { map: backTexture} )
        ] );
        tvFrame.name = name + "_Frame";
        tvFrame.position.x = 0.0;
        tvFrame.position.y = 0.0;
        tvFrame.position.z = 0.0;

        group.children.push( tvFrame );
        tvFrame.parent = group;

        if(tvtype == 'StandTV') {
            //  add 4 legs
            const radius = 0.01;
            const length = 0.1;
            const offset_x = 0.1;
            const offset_y = (length / 2) * Math.sin(Math.PI / 4.0);
            for(let i=1; i<=4; i++) {
                const leg = new THREE.Mesh( new THREE.CylinderGeometry(radius, radius, length), new THREE.MeshStandardMaterial( { map: sideTexture} ));
                leg.name = name + "_leg" + i;
                leg.position.x = i < 3 ? width / 2.0 - offset_x : -(width / 2.0 - offset_x);
                leg.position.y = -(height / 2.0 + offset_y);
                leg.position.z = (i % 2 == 0) ? -offset_y : offset_y;
                leg.rotation.x = (i % 2 == 0) ? Math.PI / 4.0 : -(Math.PI / 4.0);

                group.children.push( leg );
                leg.parent = group;
            }
        }

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="tvTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a TV</h1>
                        <p>Name : <input type="text" id="tvName" name="tvName" value="TV_1"> </p>

                        <h2>TV size </h2>
                        <p><input type="radio" id="40inch" name="tvsize" value="40">40"
                            <input type="radio" id="50inch" name="tvsize" value="50">50"
                            <input type="radio" id="55inch" name="tvsize" value="55">55"
                            <input type="radio" id="60inch" name="tvsize" value="60">60"
                            <input type="radio" id="65inch" name="tvsize" value="65">65"
                            <input type="radio" id="70inch" name="tvsize" value="70" checked>70"
                            <input type="radio" id="75inch" name="tvsize" value="75">75"
                            <input type="radio" id="85inch" name="tvsize" value="85">85"</p>
                        <div class="clearfix"></div>
                        <h2>Stand Type </h2>
                        <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/TV_Stand.JPG" alt="StandTV" style="width:150px; height:120px;">
                                <br>
                                <input type="radio" id="StandTV" name="tvtype" value="StandTV" checked>Stand TV
                            </div>

                            <div class="gallery">
                                <img src="./images/TV_Wall.JPG" alt="WallTV" style="width:150px; height:120px;">
                                <br>
                                <input type="radio" id="WallTV" name="tvtype" value="WallTV">Wall TV
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

        const tvTypeDialog = document.getElementById("tvTypeDialog");
        const inputNameBox = document.getElementById("tvName");

        const confirmBtn = tvTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        tvTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // tvTypeDialog.close(); // Have to send the select box value here.
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
            const tvsize = parseInt(document.querySelector('input[name=tvsize]:checked').value);
            const tvtype = document.querySelector('input[name=tvtype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, tvsize, tvtype, oldPos, oldRot);
        });

        tvTypeDialog.showModal();
    }
                    
}
            
