import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Bookshelf {
    static add_Internal(editor, name, width, height, depth, noOfLayers, frametype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Bookshelf';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute(new AddGroupCommand(editor, group, parent));

        // ===== 패널 재질 선택 =====
        let panelTexture;
        if (frametype === "Wood") {
            panelTexture = textureHelper.get('Wood', 4, 6);
        } else if (frametype === "WhitePlastic") {
            panelTexture = textureHelper.get('WhitePlastic', 1, 1);
        } else {
            panelTexture = textureHelper.get('Wood', 4, 6); // 기본 Wood
        }

        const panelDepth = 0.01;

        // Add Top & Bottom
        const topPanel = new THREE.Mesh(
            new THREE.BoxGeometry(width, panelDepth, depth),
            new THREE.MeshStandardMaterial({ map: panelTexture })
        );
        topPanel.name = name + "_TopPanel";
        topPanel.position.set(0, height - panelDepth / 2, 0);
        group.add(topPanel);

        const bottomPanel = new THREE.Mesh(
            new THREE.BoxGeometry(width, panelDepth, depth),
            new THREE.MeshStandardMaterial({ map: panelTexture })
        );
        bottomPanel.name = name + "_BottomPanel";
        bottomPanel.position.set(0, panelDepth / 2, 0);
        group.add(bottomPanel);

        // Add Left & Right
        const leftPanel = new THREE.Mesh(
            new THREE.BoxGeometry(panelDepth, height, depth),
            new THREE.MeshStandardMaterial({ map: panelTexture })
        );
        leftPanel.name = name + "_LeftPanel";
        leftPanel.position.set(-(width - panelDepth) / 2, height / 2, 0);
        group.add(leftPanel);

        const rightPanel = new THREE.Mesh(
            new THREE.BoxGeometry(panelDepth, height, depth),
            new THREE.MeshStandardMaterial({ map: panelTexture })
        );
        rightPanel.name = name + "_RightPanel";
        rightPanel.position.set((width - panelDepth) / 2, height / 2, 0);
        group.add(rightPanel);

        // Add Back
        const backPanel = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, panelDepth),
            new THREE.MeshStandardMaterial({ map: panelTexture })
        );
        backPanel.name = name + "_BackPanel";
        backPanel.position.set(0, height / 2, -(depth - panelDepth) / 2);
        group.add(backPanel);

        // Add Layers
        const layer_width = width - (panelDepth * 2);
        const height_inside = height - (panelDepth * 2);
        const one_layer_height = height_inside / noOfLayers;
        let cur_height = one_layer_height;
        for (let i = 1; i <= noOfLayers; i++) {
            const layer = new THREE.Mesh(
                new THREE.BoxGeometry(layer_width, panelDepth, depth),
                new THREE.MeshStandardMaterial({ map: panelTexture })
            );
            layer.name = name + "_layer" + i;
            layer.position.set(0, cur_height, 0);
            group.add(layer);
            cur_height += one_layer_height;
        }

        editor.objectChanged(group);
    }

    static add(editor, modify = false) {
        const _html = `
            <dialog id="bookshelfTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Bookshelf</h1>
                        <p>Name : <input type="text" id="bookshelfName" name="bookshelfName" value="Bookshelf_1"> </p>

                        <h2>Desk size </h2>
                        <p>Width : <input type="text" id="width" name="width" value="0.57">
                           Height : <input type="text" id="height" name="height" value="1.5">
                           Depth : <input type="text" id="depth" name="depth" value="0.3"></p>

                        <div class="clearfix"></div>
                        <h2>No of Layers</h2>
                        <p>Name : <input type="text" id="layers" name="layers" value="4">
                        </p>

                        <div class="clearfix"></div>
                        <h2>Material</h2>
                            <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/Bookself_Wood.JPG" alt="wood" style="width:120px; height:170px;">
                                <br>
                                <input type="radio" id="wood" name="frametype" value="Wood" checked>Wood
                            </div>

                            <div class="gallery">
                                <img src="./images/Bookself_White.JPG" alt="whitePlastic" style="width:120px; height:170px;">
                                <br>
                                <input type="radio" id="whitePlastic" name="frametype" value="WhitePlastic">White
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

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog);

        const bookshelfTypeDialog = document.getElementById("bookshelfTypeDialog");
        const inputNameBox = document.getElementById("bookshelfName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const layersBox = document.getElementById("layers");

        const confirmBtn = bookshelfTypeDialog.querySelector("#confirmBtn");

        bookshelfTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog);
        });

        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault();

            var oldPos = null;
            var oldRot = null;
            if(modify) {
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;

                editor.execute(new RemoveObjectCommand(editor, editor.selected));
            }

            var name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const noOfLayers = parseInt(layersBox.value);
            const frametype = document.querySelector('input[name=frametype]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, name, width, height, depth, noOfLayers, frametype, oldPos, oldRot);
        });

        bookshelfTypeDialog.showModal();
    }
}
