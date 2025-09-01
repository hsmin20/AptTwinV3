import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Wardrobe {
    static add_Internal(editor, parent, name, width, height, depth, wardrobetype, noOfDrawers, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Wardrobe';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add Top & Bottom
        const panelDepth = 0.01;
        let panelTexture = textureHelper.get('WhiteWood', 4, 6);

        const topPanel = new THREE.Mesh( new THREE.BoxGeometry(width, panelDepth, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        topPanel.name = name + "_TopPanel";
        topPanel.position.x = 0.0;
        topPanel.position.y = height - (panelDepth / 2.0);
        topPanel.position.z = 0.0;

        group.children.push( topPanel );
        topPanel.parent = group;

        const bottomPanel = new THREE.Mesh( new THREE.BoxGeometry(width, panelDepth, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        bottomPanel.name = name + "_BottomPanel";
        bottomPanel.position.x = 0.0;
        bottomPanel.position.y = panelDepth / 2.0;
        bottomPanel.position.z = 0.0;

        group.children.push( bottomPanel );
        bottomPanel.parent = group;

        // Add Left & Right
        const leftPanel = new THREE.Mesh( new THREE.BoxGeometry(panelDepth, height, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        leftPanel.name = name + "_LeftPanel";
        leftPanel.position.x = -(width - panelDepth) / 2.0;
        leftPanel.position.y = height / 2.0;
        leftPanel.position.z = 0.0;

        group.children.push( leftPanel );
        leftPanel.parent = group;

        const rightPanel = new THREE.Mesh( new THREE.BoxGeometry(panelDepth, height, depth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        rightPanel.name = name + "_RightPanel";
        rightPanel.position.x = (width - panelDepth) / 2.0;
        rightPanel.position.y = height / 2.0;
        rightPanel.position.z = 0.0;

        group.children.push( rightPanel );
        rightPanel.parent = group;

        // Add Back
        const backPanel = new THREE.Mesh( new THREE.BoxGeometry(width, height, panelDepth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
        backPanel.name = name + "_BackPanel";
        backPanel.position.x = 0.0;
        backPanel.position.y = height / 2.0;
        backPanel.position.z = -(depth - panelDepth) / 2.0;

        group.children.push( backPanel );
        backPanel.parent = group;

        // Add a pole
        const shinyTexture = textureHelper.get('Shiny', 10, 1);

        const radius = 0.02;
        const pole_length = width - (panelDepth * 2);
        const offset_y = radius * 6;
        
        const pole = new THREE.Mesh( new THREE.CylinderGeometry(radius, radius, pole_length), new THREE.MeshStandardMaterial( { map: shinyTexture} ));
        pole.name = name + "_pole";
        pole.position.x = 0.0;
        pole.position.y = (height - offset_y);
        pole.position.z = 0.0;
        pole.rotation.z = Math.PI / 2.0;

        group.children.push( pole );
        pole.parent = group;

        // Add 2 doors
        const doorDepth = 0.03;
        
        const doorGroup = new THREE.Group();
        doorGroup.name = 'DoorGroup';
        doorGroup.position.x = 0;
        doorGroup.position.y = 0;
        doorGroup.position.z = (depth + doorDepth) / 2.0;

        group.children.push( doorGroup );
        doorGroup.parent = group;

        const doorRTexture = textureHelper.get('DrawerDoorRight', 1, 1);
        const doorLTexture = textureHelper.get('DrawerDoorLeft', 1, 1);

        let door_height = height;
        let pos_y = height / 2.0;
        if(wardrobetype == 'drawer') {
            door_height = height * 2.0 / 3.0;
            pos_y = door_height;
        }

        const bodyDepth = depth - doorDepth;
        const halfWidth = width / 2.0;
        const leftDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, door_height, doorDepth), [  
            new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
            new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
            new THREE.MeshStandardMaterial( { map: doorLTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} )
        ] );
        leftDoor.name = name + "_LeftDoor";
        leftDoor.position.x = -halfWidth / 2.0;
        leftDoor.position.y = pos_y;
        leftDoor.position.z = 0.0;
        leftDoor.userData.type = 'door';
        leftDoor.userData.pivotDir = 'left';
        leftDoor.userData.openDir = 'inward';

        doorGroup.children.push( leftDoor );
        leftDoor.parent = doorGroup;

        const rightDoor = new THREE.Mesh( new THREE.BoxGeometry(halfWidth, door_height, doorDepth), [  
            new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
            new THREE.MeshStandardMaterial( { map: shinyTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} ),
            new THREE.MeshStandardMaterial( { map: doorRTexture} ), new THREE.MeshStandardMaterial( { map: shinyTexture} )
        ] );
        rightDoor.name = name + "_RightDoor";
        rightDoor.position.x = halfWidth / 2.0;
        rightDoor.position.y = pos_y;
        rightDoor.position.z = 0.0;
        rightDoor.userData.type = 'door';
        rightDoor.userData.pivotDir = 'right';
        rightDoor.userData.openDir = 'inward';

        doorGroup.children.push( rightDoor );
        rightDoor.parent = doorGroup;

        // Add drawers
        if(wardrobetype == 'drawer') {
            const bottomPanel2 = new THREE.Mesh( new THREE.BoxGeometry(width, panelDepth, depth-panelDepth), new THREE.MeshStandardMaterial( { map: panelTexture} ) );
            bottomPanel2.name = name + "_BottomPanel2";
            bottomPanel2.position.x = 0.0;
            bottomPanel2.position.y = height / 3.0 + panelDepth / 2.0;
            bottomPanel2.position.z = 0.0;

            group.children.push( bottomPanel2 );
            bottomPanel2.parent = group;

            const drawersTotalHeight = height / 3.0;
            const oneDrawerHeight = drawersTotalHeight / noOfDrawers;
            const drawerWidth = width - (panelDepth * 2);
            let pos_y = oneDrawerHeight / 2.0;

            const drawerInsideTexture = textureHelper.get('DrawerInside', 1, 1);
            const drawerDoorTexture = textureHelper.get('DrawerDoorFront', 1, 1);

            for(let i=1; i<=noOfDrawers; i++) {
                const drawer = new THREE.Mesh( new THREE.BoxGeometry(drawerWidth, oneDrawerHeight, depth), [  
                            new THREE.MeshStandardMaterial( { map: panelTexture } ), new THREE.MeshStandardMaterial( { map: panelTexture } ),
                            new THREE.MeshStandardMaterial( { map: drawerInsideTexture } ), new THREE.MeshStandardMaterial( { map: panelTexture } ),
                            new THREE.MeshStandardMaterial( { map: drawerDoorTexture } ), new THREE.MeshStandardMaterial( { map: panelTexture } )
                        ] );
                drawer.name = 'drawer' + i;
                drawer.userData.type = 'drawer';
                drawer.position.x = 0.0;
                drawer.position.y = pos_y;
                drawer.position.z = 0.0;


                group.children.push( drawer );
                drawer.parent = group;

                pos_y += oneDrawerHeight;
            }
        }

        editor.objectChanged( group );
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="wardrobeTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Wardrobe</h1>
                        <p>Name : <input type="text" id="wardrobeName" name="wardrobeName" value="Wardrobe_1"> </p>

                        <h2>Wardrobe size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="0.95">
                           Height : <input type="text" id="height" name="height" value="2.06">
                           Depth : <input type="text" id="depth" name="depth" value="0.6"></p>
                        <div class="clearfix"></div>
                        <h2>Wardrobe Option</h2>
                        <p><input type="radio" id="long" name="wardrobetype" value="long" checked>Long
                           <input type="radio" id="drawer" name="wardrobetype" value="drawer">With Drawer
                           <p>No of Drawers : <input type="text" id="noOfDrawers" name="noOfDrawers" value="3"> </p>
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

        const wardrobeTypeDialog = document.getElementById("wardrobeTypeDialog");
        const inputNameBox = document.getElementById("wardrobeName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const noOfDrawersBox = document.getElementById("noOfDrawers");

        const confirmBtn = wardrobeTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        wardrobeTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // wardrobeTypeDialog.close(); // Have to send the select box value here.
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
            const wardrobetype = document.querySelector('input[name=wardrobetype]:checked').value;
            const noOfDrawers = parseInt(noOfDrawersBox.value);

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, parent, name, width, height, depth, wardrobetype, noOfDrawers, oldPos, oldRot);
        });

        wardrobeTypeDialog.showModal();
    }
}