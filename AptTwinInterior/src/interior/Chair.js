import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Chair {
    // --- 의자 생성 함수 ---
    static add_Internal(editor, parent, name, width, height, depth, chairType, oldPos, oldRot, cushionColor) {
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Chair';

        if (oldPos != null) group.position.copy(oldPos);
        if (oldRot != null) group.rotation.copy(oldRot);

        editor.execute(new AddGroupCommand(editor, group, parent));

        // 좌석
        const seatHeight = 0.05;
        let seatTexture = textureHelper.get(chairType, 1, 1);
        const seatMaterial = new THREE.MeshStandardMaterial({ map: seatTexture });

        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(width, seatHeight, depth),
            seatMaterial
        );
        seat.name = name + "_Seat";
        seat.position.y = height + seatHeight / 2;
        group.add(seat);

        // 등받이: 상단 가로판 + 좌우 세로 기둥 2개
        const backrestHeight = 0.44;
        const backrestDepth = 0.05;

        // 상단 가로판
        const backrestTop = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.21, backrestDepth),
            seatMaterial
        );
        backrestTop.name = name + "_BackrestTop";
        backrestTop.position.y = height + seatHeight + backrestHeight - 0.025;
        backrestTop.position.z = -depth / 2 + backrestDepth / 2;
        group.add(backrestTop);

        // 중간 가로판
        const backrestMiddle = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.05, backrestDepth),
            seatMaterial
        );
        backrestMiddle.name = name + "_BackrestMiddle";
        // 상단과 중간 가로판 사이 간격: 0.2
        backrestMiddle.position.y = backrestTop.position.y - 0.2;
        backrestMiddle.position.z = -depth / 2 + backrestDepth / 2;
        group.add(backrestMiddle);

        // 아래 가로판
        const backrestBottom = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.05, backrestDepth),
            seatMaterial
        );
        backrestBottom.name = name + "_BackrestBottom";
        // 중간과 아래 가로판 사이 간격: 0.25 (gap 다르게 지정 가능)
        backrestBottom.position.y = backrestMiddle.position.y - 0.1;
        backrestBottom.position.z = -depth / 2 + backrestDepth / 2;
        group.add(backrestBottom);


        // 2. 좌우 세로 기둥
        const barHeight = backrestHeight - 0.05;
        const barWidth = 0.05;
        const barOffsetX = width / 2 - barWidth / 2;

        for (let i = 0; i < 2; i++) {
            const bar = new THREE.Mesh(
                new THREE.BoxGeometry(barWidth, barHeight, backrestDepth),
                seatMaterial
            );
            bar.name = name + "_BackrestBar" + (i + 1);
            bar.position.x = (i === 0) ? -barOffsetX : barOffsetX;
            bar.position.y = height + seatHeight + barHeight / 2;
            bar.position.z = -depth / 2 + backrestDepth / 2;
            group.add(bar);
        }
        // 좌석 쿠션
        const cushionHeight = 0.03; // 좌석 위로 올라온 높이

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

        seatCushion.position.y = height + seatHeight + cushionHeight / 2; // 좌석 위
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

                    <h2>Seat Cushion Color</h2>
                    <p>
                        <input type="radio" id="whiteCushion" name="cushionColor" value="white" checked> White
                        <input type="radio" id="blackCushion" name="cushionColor" value="black"> Black
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

            var parent = editor.selected;
            var oldPos = null;
            var oldRot = null;
            if (modify) {
                parent = editor.selected.parent;
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;
                editor.execute(new RemoveObjectCommand(editor, editor.selected));
            }

            var name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value); // 다리 길이
            const depth = parseFloat(depthBox.value);
            const chairType = 'Wood'; // 무조건 Wood
            const cushionColor = document.querySelector('input[name=cushionColor]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, parent, name, width, height, depth, chairType, oldPos, oldRot, cushionColor);
        });

        chairTypeDialog.showModal();
    }
}
