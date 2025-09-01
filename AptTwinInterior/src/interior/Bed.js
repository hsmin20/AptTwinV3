import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Bed {
    static add_Internal(editor, parent, name, bedsize, bedtype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Bed';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        const depth = 2.0; // 2m
        let width = 1.1; // single
        if(bedsize == 'supersingle')
            width = 1.1;
        else if(bedsize == 'double')
            width = 1.4;
        else if(bedsize == 'queen')
            width = 1.5;
        else if(bedsize == 'king')
            width = 1.6;
        else if(bedsize == 'largeking')
            width = 1.8;

        let frameTexture = null;
        if(bedtype == 'metal')
            frameTexture = textureHelper.get('BlackMetal', 4, 4);
        else
            frameTexture = textureHelper.get('Wood', 4, 4);

        // add a frame
        const frameheight = 0.2;
        const bedFrame = new THREE.Mesh( new THREE.BoxGeometry(width, frameheight, depth),
            new THREE.MeshStandardMaterial( { map: frameTexture} ) );
        bedFrame.name = name + "_Frame";
        bedFrame.position.x = 0.0;
        bedFrame.position.y = frameheight / 2.0;
        bedFrame.position.z = 0.0;

        group.children.push( bedFrame );
        bedFrame.parent = group;

        // add a head
        const headheight = 0.8;
        const headdepth = 0.05;
        const bedHead = new THREE.Mesh( new THREE.BoxGeometry(width, headheight, headdepth),
            new THREE.MeshStandardMaterial( { map: frameTexture} ) );
        bedHead.name = name + "_Head";
        bedHead.position.x = 0.0;
        bedHead.position.y = headheight / 2.0;
        bedHead.position.z = (depth + headdepth) / 2.0 ;

        group.children.push( bedHead );
        bedHead.parent = group;

        //  add 4 legs
        const radius = 0.02;
        const leg_length = 0.2;

        const offset_x = width / 2.0 - radius;
        const offset_z = depth / 2.0 - radius;

        for(let i=1; i<=4; i++) {
            const leg = new THREE.Mesh( new THREE.CylinderGeometry(radius, radius, leg_length), new THREE.MeshStandardMaterial( { map: frameTexture} ));
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = -leg_length / 2.0;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        // add a mattress
        const mattressTexture = textureHelper.get('Mattress', 2, 4);

        const mattressheight = 0.2;
        const mattress = new THREE.Mesh( new THREE.BoxGeometry(width, mattressheight, depth),
            new THREE.MeshStandardMaterial( { map: mattressTexture} ) );
        mattress.name = name + "_mattress";
        mattress.position.x = 0.0;
        mattress.position.y = frameheight + mattressheight / 2.0;
        mattress.position.z = 0.0;

        group.children.push( mattress );
        mattress.parent = group;

        group.position.y = leg_length;

        editor.objectChanged(group);
    }
         
    static add(editor, modify=false) {
        const _html = `
            <dialog id="bedTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Bed</h1>
                        <p>Name : <input type="text" id="bedName" name="bedName" value="Bed_1"> </p>

                        <h2>Bed size </h2>
                        <p><input type="radio" id="single" name="bedsize" value="single">Single
                           <input type="radio" id="supersingle" name="bedsize" value="supersingle">Super Single
                           <input type="radio" id="double" name="bedsize" value="double">Double
                           <input type="radio" id="queen" name="bedsize" value="queen" checked>Queen
                           <input type="radio" id="king" name="bedsize" value="king">King
                           <input type="radio" id="largeking" name="bedsize" value="largeking">Large King</p>
                        <div class="clearfix"></div>
                        <h2>Frame Type </h2>
                        <p><input type="radio" id="wood" name="frametype" value="wood" checked>wood
                           <input type="radio" id="metal" name="frametype" value="metal">metal</p>
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

        const bedTypeDialog = document.getElementById("bedTypeDialog");
        const inputNameBox = document.getElementById("bedName");

        const confirmBtn = bedTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        bedTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // bedTypeDialog.close(); // Have to send the select box value here.
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
            const bedsize = document.querySelector('input[name=bedsize]:checked').value;
            const frametype = document.querySelector('input[name=frametype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, bedsize, frametype, oldPos, oldRot);
        });

        bedTypeDialog.showModal();
    }
                    
}
            
