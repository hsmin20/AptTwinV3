import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class TVTable {

    static add_Internal(editor, name, width, height, depth, tvTabletype, noOfLayers, door, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'TVTable';
        group.userData.width = width;
        group.userData.height = height;
        group.userData.depth = depth;
        group.userData.tvTabletype = tvTabletype;
        group.userData.noOfLayers = noOfLayers;
        group.userData.door = door;

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // const totalHeight = panelDepth + height
        // Panel 두께
        const panelDepth = 0.02;

        // 선택된 재질 가져오기
        let panelTexture;
        if (tvTabletype === "Wood") {
            panelTexture = textureHelper.get('Wood', 4, 6);
        } else {
            panelTexture = textureHelper.get('WhitePlastic', 4, 6);
        }

        // 상판
        const topPanel = new THREE.Mesh( 
            new THREE.BoxGeometry(width, panelDepth, depth), 
            new THREE.MeshStandardMaterial( { map: panelTexture} ) 
        );
        topPanel.name = name + "_TopPanel";
        topPanel.position.set(0, height / 2.0 - panelDepth, 0);
        group.add(topPanel);

        // 하판
        const bottomPanel = new THREE.Mesh( 
            new THREE.BoxGeometry(width, panelDepth, depth), 
            new THREE.MeshStandardMaterial( { map: panelTexture} ) 
        );
        bottomPanel.name = name + "_BottomPanel";
        bottomPanel.position.set(0, -height / 2.0, 0);
        group.add(bottomPanel);

        // 좌/우 패널
        const leftPanel = new THREE.Mesh( 
            new THREE.BoxGeometry(panelDepth, height, depth), 
            new THREE.MeshStandardMaterial( { map: panelTexture} ) 
        );
        leftPanel.name = name + "_LeftPanel";
        leftPanel.position.set(-(width - panelDepth) / 2.0, -panelDepth / 2.0, 0);
        group.add(leftPanel);

        const rightPanel = new THREE.Mesh( 
            new THREE.BoxGeometry(panelDepth, height, depth), 
            new THREE.MeshStandardMaterial( { map: panelTexture} ) 
        );
        rightPanel.name = name + "_RightPanel";
        rightPanel.position.set((width - panelDepth) / 2.0, -panelDepth / 2.0, 0);
        group.add(rightPanel);

        // 뒷판
        const backPanel = new THREE.Mesh( 
            new THREE.BoxGeometry(width, height, panelDepth), 
            new THREE.MeshStandardMaterial( { map: panelTexture} ) 
        );
        backPanel.name = name + "_BackPanel";
        backPanel.position.set(0, -panelDepth / 2.0, -(depth - panelDepth) / 2.0);
        group.add(backPanel);

        // 내부 구획
        const height_inside = height - (panelDepth * 2);
        const width_inside = width - (panelDepth * 2);
        const one_layer_width = width_inside / noOfLayers;
        let cur_x = -(width_inside / 2.0) + one_layer_width;
        for(let i=1; i<noOfLayers; i++) {
            const layer = new THREE.Mesh( 
                new THREE.BoxGeometry(panelDepth, height_inside, depth), 
                new THREE.MeshStandardMaterial( { map: panelTexture} ) 
            );
            layer.name = name + "_layer" + i;
            layer.position.set(cur_x, panelDepth / 2.0 + height_inside / 2.0 - height / 2.0, 0);
            group.add(layer);

            cur_x += one_layer_width;
        }

        // 서랍 (손잡이 포함)
        if(door) {
            let drawerTexture;
            if (tvTabletype === "Wood") {
                drawerTexture = textureHelper.get('Wood', 2, 2);
            } else {
                drawerTexture = textureHelper.get('WhitePlastic', 2, 2);
            }

            cur_x = -(width_inside / 2.0) + (one_layer_width / 2.0);
            for(let i=1; i<=noOfLayers; i++) {
                const drawerFront = new THREE.Mesh(
                    new THREE.BoxGeometry(one_layer_width, height_inside, panelDepth),
                    new THREE.MeshStandardMaterial({ map: drawerTexture })
                );
                drawerFront.name = name + "_drawer" + i;
                drawerFront.position.set(cur_x, panelDepth / 2.0 + height_inside / 2.0 - height / 2.0, depth / 2.0);
                group.add(drawerFront);

                // 손잡이 (Metal 고정)
                const handle = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 0.1, 16),
                    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0, roughness: 0.3 })
                );
                handle.rotation.z = Math.PI / 2;
                handle.name = name + "_drawer" + i + "_handle";
                handle.position.set(cur_x, -panelDepth / 2.0, depth / 2.0 + 0.05);
                group.add(handle);

                cur_x += one_layer_width;
            }
        }

        group.position.y = height / 2.0;

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        let _html = `
            <dialog id="tvTableTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a TV Table</h1>
                        <p>Name : <input type="text" id="tvTableName" name="tvTableName" value="_NAME_"> </p>

                        <h2>TV Table size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="_WIDTH_">
                           Height : <input type="text" id="height" name="height" value="_HEIGHT_">
                           Depth : <input type="text" id="depth" name="depth" value="_DEPTH_"></p>
                        <div class="clearfix"></div>
                        <h2>TV Table Option</h2>
                        <p><input type="radio" id="wood" name="tvTabletype" value="Wood">Wood
                           <input type="radio" id="white" name="tvTabletype" value="White">White
                        </p>
                        <h2>No of Layers</h2>
                        <p>Name : <input type="text" id="layers" name="layers" value="_NOOFLAYERS_"></p>
                        <h2>Drawer Type</h2>
                        <p>Name : <input type="checkbox" id="door" name="door"><label for="door">Drawer</label></p>
                </label>
                </p>
                <div>
                <p>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Apply</button>
                </p>
                </div>
            </form>
        `;

        let name = 'TVTable_1';
        let width = '2.5';
        let height = '0.5';
        let depth = '0.5';
        let tvTabletype = 'Wood';
        let noOfLayers = '4';
        let door = true;
        if(modify && editor.selected) {
            name = editor.selected.name;
            width = editor.selected.userData.width;
            height = editor.selected.userData.height;
            depth = editor.selected.userData.depth;
            tvTabletype = editor.selected.userData.tvTabletype;
            noOfLayers = editor.selected.userData.noOfLayers;
            door = editor.selected.userData.door;
        }

        _html = _html.replace('_NAME_', name);
        _html = _html.replace('_WIDTH_', width);
        _html = _html.replace('_HEIGHT_', height);
        _html = _html.replace('_DEPTH_', depth);
        _html = _html.replace('_NOOFLAYERS_', noOfLayers);

        const origin = 'value="' + tvTabletype + '"';
        const replaced = 'value="' + tvTabletype + '" checked';
        _html = _html.replace(origin, replaced);

        if(door) {
            const origin = 'name="door"';
            const replaced = 'name="door" checked';
            _html = _html.replace(origin, replaced);
        }

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const tvTableTypeDialog = document.getElementById("tvTableTypeDialog");
        const inputNameBox = document.getElementById("tvTableName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const layersBox = document.getElementById("layers");

        const confirmBtn = tvTableTypeDialog.querySelector("#confirmBtn");

        tvTableTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault();
            
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
            const tvTabletype = document.querySelector('input[name=tvTabletype]:checked').value;
            const noOfLayers = parseInt(layersBox.value);
            const door = document.getElementById("door").checked;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, name, width, height, depth, tvTabletype, noOfLayers, door, oldPos, oldRot);
        });

        tvTableTypeDialog.showModal();
    }
}
