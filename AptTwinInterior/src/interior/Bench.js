import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Bench {
        // --- 벤치 생성 함수 ---
    static add_Internal(editor, name, width, height, depth, benchType, oldPos, oldRot, cushionColor) {
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Bench';

        if (oldPos != null) group.position.copy(oldPos);
        if (oldRot != null) group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute(new AddGroupCommand(editor, group, parent));

        // 좌석
        const seatHeight = 0.05;
        const seatTexture = textureHelper.get('Wood', 1, 1);
        const seatMaterial = new THREE.MeshStandardMaterial({ map: seatTexture });

        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(width, seatHeight, depth),
            seatMaterial
        );
        seat.name = name + "_Seat";
        seat.position.y = height + seatHeight / 2;
        group.add(seat);

        // 좌석 쿠션
        const cushionHeight = 0.03;
        let cushionMaterial;
        if (cushionColor === 'black') {
            const blackFabricTexture = textureHelper.get('BlackFabric', 1, 1); 
            cushionMaterial = new THREE.MeshStandardMaterial({ map: blackFabricTexture });
        } else {
            cushionMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        }

        const seatCushion = new THREE.Mesh(
            new THREE.BoxGeometry(width, cushionHeight, depth),
            cushionMaterial
        );
        seatCushion.position.y = height + seatHeight + cushionHeight / 2;
        seatCushion.position.z = 0;
        group.add(seatCushion);

        // 다리
        const legWidth = 0.05;
        const offsetX = width / 2 - legWidth / 2;
        const offsetZ = depth / 2 - legWidth / 2;
        const legTexture = textureHelper.get('Wood', 1, 4);

        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(legWidth, height, legWidth),
                new THREE.MeshStandardMaterial({ map: legTexture })
            );
            leg.name = name + "_Leg" + (i + 1);
            leg.position.x = (i % 2 === 0) ? -offsetX : offsetX;
            leg.position.z = (i < 2) ? -offsetZ : offsetZ;
            leg.position.y = height / 2;
            group.add(leg);
        }

        editor.objectChanged(group);
    }

    static add(editor, modify = false) {
        const _html = `
            <dialog id="benchTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Bench</h1>
                    <p>Name : <input type="text" id="benchName" name="benchName" value="Bench_1"> </p>

                    <h2>Bench size </h2>
                    <p>Width : <input type="text" id="width" name="width" value="1.2">
                    Leg Height : <input type="text" id="height" name="height" value="0.47">
                    Depth : <input type="text" id="depth" name="depth" value="0.4"></p>
                    <div class="clearfix"></div>

                    <h2>Seat Cushion Color</h2>
                      <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/Bench_White.JPG" alt="white" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="white" name="cushionColor" value="white" checked>White
                            </div>

                            <div class="gallery">
                                <img src="./images/Bench_Black.JPG" alt="black" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="black" name="cushionColor" value="black">Black
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

        const benchTypeDialog = document.getElementById("benchTypeDialog");
        const inputNameBox = document.getElementById("benchName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const confirmBtn = benchTypeDialog.querySelector("#confirmBtn");

        benchTypeDialog.addEventListener("close", () => {
            document.body.removeChild(dialog);
        });

        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault();

            var oldPos = null;
            var oldRot = null;
            if (modify) {
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;
                editor.execute(new RemoveObjectCommand(editor, editor.selected));
            }

            var name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const benchType = 'Wood'; // 무조건 Wood
            const cushionColor = document.querySelector('input[name=cushionColor]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, name, width, height, depth, benchType, oldPos, oldRot, cushionColor);
        });

        benchTypeDialog.showModal();
    }
}
