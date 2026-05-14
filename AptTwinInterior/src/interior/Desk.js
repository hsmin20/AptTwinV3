import * as THREE from 'three';
import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';
import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Desk {
    static add_Internal(editor, name, width, height, depth, deskMaterial, deskType, oldPos, oldRot) {
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Desk';
        group.userData.name = name;
        group.userData.width = width;
        group.userData.height = height;
        group.userData.depth = depth;
        group.userData.deskMaterial = deskMaterial;
        group.userData.deskType = deskType;

        if(oldPos) group.position.copy(oldPos);
        if(oldRot) group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute(new AddGroupCommand(editor, group, parent));

        // 재질 결정
        let material;
        if (deskMaterial === 'black') {
            material = new THREE.MeshStandardMaterial({ color: 0x000000 });
        } else if (deskMaterial === 'white') {
            const whiteTexture = textureHelper.get('WhiteWood', 2, 3);
            material = new THREE.MeshStandardMaterial({ map: whiteTexture });
        } else { // Wood
            const woodTexture = textureHelper.get('Wood', 2, 3);
            material = new THREE.MeshStandardMaterial({ map: woodTexture });
        }

        // 상판
        let panelMaterial;
        if(deskType == 'Wood') {
            const woodTexture = textureHelper.get('Wood', 1, 1);
            panelMaterial = new THREE.MeshStandardMaterial({ map: woodTexture });
        } else {
            // glass
            const glassTexture = textureHelper.get('Glass', 1, 1);
            panelMaterial = new THREE.MeshStandardMaterial({ map: glassTexture });
        }
        const panelHeight = 0.05;
       
        const deskPanel = new THREE.Mesh(new THREE.BoxGeometry(width, panelHeight, depth), panelMaterial);
        deskPanel.name = name + "_Panel";
        deskPanel.position.y = height / 2;
        group.add(deskPanel);

        // 다리
        const legWidth = 0.05;
        const offsetX = width / 2 - legWidth / 2;
        const offsetZ = depth / 2 - legWidth / 2;

        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(legWidth, height, legWidth), material);
            leg.name = name + "_Leg" + (i + 1);
            leg.position.x = (i % 2 === 0) ? -offsetX : offsetX;
            leg.position.z = (i < 2) ? -offsetZ : offsetZ;
            leg.position.y = -panelHeight / 2;
            group.add(leg);
        }

        group.position.y = (height + panelHeight) / 2;

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        let _html = `
            <dialog id="DeskTypeDialog">
            <form>
                <label>
                    <h1>Add/Change a Desk</h1>
                    <p>Name : <input type="text" id="deskName" name="deskName" value="_NAME_"> </p>

                    <h2>Desk Size (m)</h2>
                    <p>
                        Width : <input type="text" id="width" value="_WIDTH_">
                        Height : <input type="text" id="height" value="_HEIGHT_">
                        Depth : <input type="text" id="depth" value="_DEPTH_">
                    </p>

                    <h2>Desk Material</h2>
                      <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/Desk_White.JPG" alt="white" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="white" name="deskMaterial" value="white" _CHECKED1_>White
                            </div>

                            <div class="gallery">
                                <img src="./images/Desk_Black.JPG" alt="black" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="black" name="deskMaterial" value="black" _CHECKED2_>Black
                            </div>
                              <div class="gallery">
                                <img src="./images/Desk_Wood.JPG" alt="wood" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="wood" name="deskMaterial" value="wood" _CHECKED3_>Wood
                            </div>
                        </div>
                        <div class="clearfix"></div>
                        <h2>Desk Type </h2>
                        <p>
                        <input type="radio" id="wood" name="desktype" value="Wood" _CHECKED4_>Wood
                        <input type="radio" id="glass" name="desktype" value="Glass" _CHECKED5_>Glass
                        </p>
                </label>
                </p>
                <div>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Apply</button>
                </div>
            </form>
            </dialog>
        `;

        if(modify && editor.selected) {
            const name = editor.selected.userData.name;
            const width = editor.selected.userData.width;
            const height = editor.selected.userData.height;
            const depth = editor.selected.userData.depth;
            const deskMaterial = editor.selected.userData.deskMaterial;
            const deskType = editor.selected.userData.deskType;

            _html = _html.replace('_NAME_', name);
            _html = _html.replace('_WIDTH_', width);
            _html = _html.replace('_HEIGHT_', height);
            _html = _html.replace('_DEPTH_', depth);
            if(deskMaterial == 'white') {
                _html = _html.replace('_CHECKED1_', 'checked');
                _html = _html.replace('_CHECKED2_', '');
                _html = _html.replace('_CHECKED3_', '');
            } else if(deskMaterial == 'black') {
                _html = _html.replace('_CHECKED1_', '');
                _html = _html.replace('_CHECKED2_', 'checked');
                _html = _html.replace('_CHECKED3_', '');
            } if(deskMaterial == 'wood') {
                _html = _html.replace('_CHECKED1_', '');
                _html = _html.replace('_CHECKED2_', '');
                _html = _html.replace('_CHECKED3_', 'checked');
            }
            if(deskType == 'Wood') {
                _html = _html.replace('_CHECKED4_', 'checked');
                _html = _html.replace('_CHECKED5_', '');
            } else if(deskType == 'Glass') {
                _html = _html.replace('_CHECKED4_', '');
                _html = _html.replace('_CHECKED5_', 'checked');
            }
        } else {
            _html = _html.replace('_NAME_', 'Desk_1');
            _html = _html.replace('_WIDTH_', '1.2');
            _html = _html.replace('_HEIGHT_', '1.0');
            _html = _html.replace('_DEPTH_', '0.75');
            _html = _html.replace('_CHECKED1_', '');
            _html = _html.replace('_CHECKED2_', '');
            _html = _html.replace('_CHECKED3_', 'checked');
            _html = _html.replace('_CHECKED4_', 'checked');
            _html = _html.replace('_CHECKED5_', '');
        }

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog);

        const DeskTypeDialog = document.getElementById("DeskTypeDialog");
        const inputNameBox = document.getElementById("deskName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const confirmBtn = DeskTypeDialog.querySelector("#confirmBtn");

        DeskTypeDialog.addEventListener("close", () => {
            document.body.removeChild(dialog);
        });

        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault();

            let oldPos = null;
            let oldRot = null;

            if(modify && editor.selected) {
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;
                editor.execute(new RemoveObjectCommand(editor, editor.selected));
            }

            const name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const deskMaterial = document.querySelector('input[name=deskMaterial]:checked').value;
            const deskType = document.querySelector('input[name=desktype]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, name, width, height, depth, deskMaterial, deskType, oldPos, oldRot);
        });

        DeskTypeDialog.showModal();
    }
}
