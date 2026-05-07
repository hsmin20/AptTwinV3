import * as THREE from 'three';
import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';
import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Chair {
    // --- 의자 생성 함수 ---
    static add_Internal(editor, name, width, height, depth, chairType, oldPos, oldRot, chairColor) {
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Chair';

        if (oldPos != null) group.position.copy(oldPos);
        if (oldRot != null) group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute(new AddGroupCommand(editor, group, parent));

        // 재질 결정
        const texture = chairColor === 'black' ? textureHelper.get('BlackFabric', 1, 1) : textureHelper.get('Fabric', 1, 1);
        const material = new THREE.MeshStandardMaterial({ map: texture });

        const seatHeight = 0.05;
        const backrestHeight = 0.44;
        const totalHeight = height + seatHeight + backrestHeight + 0.025;

        // 좌석
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(width, seatHeight, depth),
            material
        );
        seat.name = name + "_Seat";
        seat.position.y = height + seatHeight / 2 - (totalHeight / 2.0);
        group.add(seat);

        // 등받이: 상단 가로판 + 좌우 세로 기둥 2개
        const backrestDepth = 0.05;

        const backrestTop = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.21, backrestDepth),
            material
        );
        backrestTop.name = name + "_BackrestTop";
        backrestTop.position.y = height + seatHeight + backrestHeight - 0.025 - (totalHeight / 2.0);
        backrestTop.position.z = -depth / 2 + backrestDepth / 2;
        group.add(backrestTop);

        const backrestMiddle = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.05, backrestDepth),
            material
        );
        backrestMiddle.name = name + "_BackrestMiddle";
        backrestMiddle.position.y = backrestTop.position.y - 0.2 - (totalHeight / 2.0);
        backrestMiddle.position.z = -depth / 2 + backrestDepth / 2;
        group.add(backrestMiddle);

        const backrestBottom = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.05, backrestDepth),
            material
        );
        backrestBottom.name = name + "_BackrestBottom";
        backrestBottom.position.y = backrestTop.position.y - 0.2 - (totalHeight / 2.0);
        backrestBottom.position.z = depth / 2 - backrestDepth / 2;
        group.add(backrestBottom);

        // 좌우 세로 기둥
        const barHeight = backrestHeight - 0.05;
        const barWidth = 0.05;
        const barOffsetX = width / 2 - barWidth / 2;

        for (let i = 0; i < 2; i++) {
            const bar = new THREE.Mesh(
                new THREE.BoxGeometry(barWidth, barHeight, backrestDepth),
                material
            );
            bar.name = name + "_BackrestBar" + (i + 1);
            bar.position.x = (i === 0) ? -barOffsetX : barOffsetX;
            bar.position.y = height + seatHeight + barHeight / 2 - (totalHeight / 2.0);
            bar.position.z = -depth / 2 + backrestDepth / 2;
            group.add(bar);
        }

        // 다리
        const legWidth = 0.05;
        const offsetX = width / 2 - legWidth / 2;
        const offsetZ = depth / 2 - legWidth / 2;

        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(legWidth, height, legWidth),
                material
            );
            leg.name = name + "_Leg" + (i + 1);
            leg.position.x = (i % 2 === 0) ? -offsetX : offsetX;
            leg.position.z = (i < 2) ? -offsetZ : offsetZ;
            leg.position.y = height / 2 - (totalHeight / 2.0);
            group.add(leg);
        }

        group.position.y = totalHeight / 2.0;

        editor.objectChanged(group);
    }

    // --- UI 함수 ---
    static add(editor, modify = false) {
        const _html = `
            <dialog id="chairTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Chair</h1>
                    <p>Name : <input type="text" id="chairName" name="chairName" value="Chair_1"> </p>

                    <h2>Chair size </h2>
                    <p>Width : <input type="text" id="width" name="width" value="0.48">
                    Leg Height : <input type="text" id="height" name="height" value="0.47">
                    Depth : <input type="text" id="depth" name="depth" value="0.44"></p>
                    <div class="clearfix"></div>

                    <h2>Chair Color</h2>
                      <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/Chair_White.JPG" alt="white" style="width:120px; height:140px;">
                                <br>
                                <input type="radio" id="white" name="chairColor" value="white" checked>White
                            </div>

                            <div class="gallery">
                                <img src="./images/Chair_Black.JPG" alt="black" style="width:120px; height:140px;">
                                <br>
                                <input type="radio" id="black" name="chairColor" value="black">Black
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

        const chairTypeDialog = document.getElementById("chairTypeDialog");
        const inputNameBox = document.getElementById("chairName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const confirmBtn = chairTypeDialog.querySelector("#confirmBtn");

        chairTypeDialog.addEventListener("close", () => {
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
            const chairType = 'Wood'; // 무조건 Wood
            const chairColor = document.querySelector('input[name=chairColor]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, name, width, height, depth, chairType, oldPos, oldRot, chairColor);
        });

        chairTypeDialog.showModal();
    }
}
