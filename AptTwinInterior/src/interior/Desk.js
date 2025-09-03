import * as THREE from 'three';
import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';
import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Desk {
    static add_Internal(editor, parent, name, width, height, depth, deskMaterial, oldPos, oldRot) {
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Desk';

        if(oldPos) group.position.copy(oldPos);
        if(oldRot) group.rotation.copy(oldRot);

        editor.execute(new AddGroupCommand(editor, group, parent));

        // 재질 결정
        let material;
        if (deskMaterial === 'Black') {
            material = new THREE.MeshStandardMaterial({ color: 0x000000 });
        } else if (deskMaterial === 'White') {
            const whiteTexture = textureHelper.get('WhitePlastic', 1, 1);
            material = new THREE.MeshStandardMaterial({ map: whiteTexture });
        } else { // Wood
            const woodTexture = textureHelper.get('Wood', 2, 3);
            material = new THREE.MeshStandardMaterial({ map: woodTexture });
        }

        // 상판
        const panelHeight = 0.05;
        const deskPanel = new THREE.Mesh(new THREE.BoxGeometry(width, panelHeight, depth), material);
        deskPanel.name = name + "_Panel";
        deskPanel.position.y = height + panelHeight / 2;
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
            leg.position.y = height / 2;
            group.add(leg);
        }

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="DeskTypeDialog">
            <form>
                <label>
                    <h1>Add/Change a Desk</h1>
                    <p>Name : <input type="text" id="deskName" name="deskName" value="Desk_1"> </p>

                    <h2>Desk Size (m)</h2>
                    <p>
                        Width : <input type="text" id="width" value="1.2">
                        Height : <input type="text" id="height" value="0.75">
                        Depth : <input type="text" id="depth" value="0.6">
                    </p>

                    <h2>Desk Material</h2>
                      <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/Desk_White.JPG" alt="white" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="white" name="deskMaterial" value="white" checked>White
                            </div>

                            <div class="gallery">
                                <img src="./images/Desk_Black.JPG" alt="black" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="black" name="deskMaterial" value="black">Black
                            </div>
                              <div class="gallery">
                                <img src="./images/Desk_Wood.JPG" alt="wood" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="wood" name="deskMaterial" value="Wood">Wood
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
            </dialog>
        `;

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

            let parent = editor.selected;
            let oldPos = null;
            let oldRot = null;

            if(modify && editor.selected) {
                parent = editor.selected.parent;
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;
                editor.execute(new RemoveObjectCommand(editor, editor.selected));
            }

            const name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const deskMaterial = document.querySelector('input[name=deskMaterial]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, parent, name, width, height, depth, deskMaterial, oldPos, oldRot);
        });

        DeskTypeDialog.showModal();
    }
}
