import * as THREE from 'three';
import { SerializableReflector } from '../../../src_common/SerializableReflector.js';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class DressingTable {
    static add_Internal(editor, parent, name, width, height, depth, mirrorheight, texturetype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'DressingTable';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Mirror Frame
        const thickness = 0.01;
        let panelTexture = textureHelper.get(texturetype, 2, 3);

        const mirrorFrame = new THREE.Mesh( new THREE.BoxGeometry(width, mirrorheight, thickness), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        mirrorFrame.name = name + "_Frame";
        mirrorFrame.position.x = 0.0;
        mirrorFrame.position.y = height + (mirrorheight / 2.0);
        mirrorFrame.position.z = -( depth - thickness ) / 2.0;

        group.children.push( mirrorFrame );
        mirrorFrame.parent = group;

        // Add a Mirror
        const mirror = new SerializableReflector(new THREE.PlaneGeometry(width-thickness, mirrorheight-thickness), {
            color: new THREE.Color(0x7f7f7f),
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
        })

        mirror.name = name + "_Mirror";
        mirror.position.y = height + (mirrorheight / 2.0);
        mirror.position.z = -( depth / 2.0) + thickness + 0.001;
        
        group.children.push( mirror );
        mirror.parent = group;

        // Add a Panel
        const panelHeight = 0.2;
        let drawerTexture = textureHelper.get('DrawerDoorFront', 1, 1);
        const tablePanel = new THREE.Mesh( new THREE.BoxGeometry(width, panelHeight, depth), [  
                            new THREE.MeshStandardMaterial( { map: panelTexture } ), new THREE.MeshStandardMaterial( { map: panelTexture } ),
                            new THREE.MeshStandardMaterial( { map: panelTexture } ), new THREE.MeshStandardMaterial( { map: panelTexture } ),
                            new THREE.MeshStandardMaterial( { map: drawerTexture } ), new THREE.MeshStandardMaterial( { map: panelTexture } )
                        ] );

        tablePanel.name = name + "_Panel";
        tablePanel.position.x = 0.0;
        tablePanel.position.y = height - (panelHeight / 2.0);
        tablePanel.position.z = 0.0;

        group.children.push( tablePanel );
        tablePanel.parent = group;

        // // Add 4 legs
        const leg_width = 0.05;
        const leg_height = height - panelHeight;
        const offset_x = width / 2.0 - (leg_width / 2.0);
        const offset_z = depth / 2.0 - (leg_width / 2.0);

        for(let i=1; i<=4; i++) {
            const leg = new THREE.Mesh( new THREE.BoxGeometry(leg_width, leg_height, leg_width), new THREE.MeshStandardMaterial( { map: panelTexture} ));
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = leg_height / 2.0;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        editor.objectChanged(group);        
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="DressingTableTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Dressing Table</h1>
                        <p>Name : <input type="text" id="tableName" name="tableName" value="DressingTable_1"> </p>

                    <h2>Table Size (m)</h2>
                     <p>Width : <input type="text" id="width" name="width" value="0.8">
                           Height : <input type="text" id="height" name="height" value="0.75">
                           Depth : <input type="text" id="depth" name="depth" value="0.468"></p>
                    <div class="clearfix"></div>
                    <h2>Mirror Size (m)</h2>
                    <p>Height : <input type="text" id="mirrorheight" name="height" value="0.6"></p>
                    <div class="clearfix"></div>
                        <h2>Table Type </h2>
                        <p><input type="radio" id="wood1" name="texturetype" value="Wood" checked>Wood
                           <input type="radio" id="wood2" name="texturetype" value="WhitePlastic">White</p>
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

        const DressingTableTypeDialog = document.getElementById("DressingTableTypeDialog");
        const inputNameBox = document.getElementById("tableName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const mirrorHeightBox = document.getElementById("mirrorheight");

        const confirmBtn = DressingTableTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        DressingTableTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            // DressingTableTypeDialog.close(); // Have to send the select box value here.
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
            const mirrorheight = parseFloat(mirrorHeightBox.value);
            const texturetype = document.querySelector('input[name=texturetype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, mirrorheight, texturetype, oldPos, oldRot)
        });

        DressingTableTypeDialog.showModal();
    }
}