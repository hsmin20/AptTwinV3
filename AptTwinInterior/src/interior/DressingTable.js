import * as THREE from 'three';
import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';
import { textureHelper } from '../../../src_common/TextureHelper.js';

export class DressingTable {
    static add_Internal(editor, name, width, height, depth, mirrorheight, texturetype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'DressingTable';
        group.userData.width = width;
        group.userData.height = height;
        group.userData.depth = depth;
        group.userData.mirrorheight = mirrorheight;
        group.userData.tableType = texturetype;

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute( new AddGroupCommand( editor, group, parent ) );

        const halfTotalHeight = (height + mirrorheight) / 2.0;

        // Add a Mirror Frame
        const thickness = 0.01;
        let panelTexture = textureHelper.get(texturetype, 2, 3);

        const mirrorFrame = new THREE.Mesh( new THREE.BoxGeometry(width, mirrorheight, thickness), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        mirrorFrame.name = name + "_Frame";
        mirrorFrame.position.x = 0.0;
        mirrorFrame.position.y = height + (mirrorheight / 2.0) - halfTotalHeight;
        mirrorFrame.position.z = -( depth - thickness ) / 2.0;

        group.children.push( mirrorFrame );
        mirrorFrame.parent = group;

        // Add a Mirror
        // Reflector is way too slow...
        // const mirror = new SerializableReflector(new THREE.PlaneGeometry(width-thickness, mirrorheight-thickness), {
        //     color: new THREE.Color(0x7f7f7f),
        //     textureWidth: window.innerWidth * window.devicePixelRatio / 100,
        //     textureHeight: window.innerHeight * window.devicePixelRatio / 100,
        // })

        // Not sure how to use a CubeCamera
        // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, });
        // const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
        // const material = new THREE.MeshPhongMaterial({ envMap: cubeRenderTarget.texture, });

        let mirrorTexture = textureHelper.get('Mirror', 1, 1);
        const material = new THREE.MeshStandardMaterial( { map: mirrorTexture } );
        const mirror = new THREE.Mesh(new THREE.PlaneGeometry(width-thickness, mirrorheight-thickness), material);

        mirror.name = name + "_Mirror";
        mirror.position.y = height + (mirrorheight / 2.0) - halfTotalHeight;
        mirror.position.z = -( depth / 2.0) + thickness + 0.001;

        // mirror.add(cubeCamera);
        
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
        tablePanel.position.y = height - (panelHeight / 2.0) - halfTotalHeight;
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
            leg.position.y = leg_height / 2.0 - halfTotalHeight;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        group.position.y =  halfTotalHeight;

        editor.objectChanged(group);        
    }

    static add(editor, modify=false) {
        let _html = `
            <dialog id="DressingTableTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Dressing Table</h1>
                        <p>Name : <input type="text" id="tableName" name="tableName" value="_NAME_"> </p>

                    <h2>Table Size (m)</h2>
                     <p>Width : <input type="text" id="width" name="width" value="_WIDTH_">
                           Height : <input type="text" id="height" name="height" value="_HEIGHT_">
                           Depth : <input type="text" id="depth" name="depth" value="_DEPTH_"></p>
                    <div class="clearfix"></div>
                    <h2>Mirror Size (m)</h2>
                    <p>Height : <input type="text" id="mirrorheight" name="height" value="_MIRRORHEIGHT_"></p>
                    <div class="clearfix"></div>
                        <h2>Table Type </h2>
                            <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/DressingTable_Wood.JPG" alt="wood" style="width:140px; height:160px;">
                                <br>
                                <input type="radio" id="wood" name="texturetype" value="Wood">Wood
                            </div>

                            <div class="gallery">
                                <img src="./images/DressingTable_White.JPG" alt="WhitePlastic" style="width:140px; height:160px;">
                                <br>
                                <input type="radio" id="wood2" name="texturetype" value="WhitePlastic">White
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

        let name = 'DressingTable_1';
        let width = '0.8';
        let height = '0.75';
        let depth = '0.468';
        let mirrorheight = '1.2';
        let tableType = 'Wood';
        if(modify && editor.selected) {
            name = editor.selected.name;
            width = editor.selected.userData.width;
            height = editor.selected.userData.height;
            depth = editor.selected.userData.depth;
            mirrorheight = editor.selected.userData.mirrorheight;
            tableType = editor.selected.userData.tableType;
        }

        _html = _html.replace('_NAME_', name);
        _html = _html.replace('_WIDTH_', width);
        _html = _html.replace('_HEIGHT_', height);
        _html = _html.replace('_DEPTH_', depth);
        _html = _html.replace('_MIRRORHEIGHT_', mirrorheight);

        const origin = 'value="' + tableType + '"';
        const replaced = 'value="' + tableType + '" checked';
        _html = _html.replace(origin, replaced);

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
            const mirrorheight = parseFloat(mirrorHeightBox.value);
            const texturetype = document.querySelector('input[name=texturetype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, name, width, height, depth, mirrorheight, texturetype, oldPos, oldRot)
        });

        DressingTableTypeDialog.showModal();
    }
}