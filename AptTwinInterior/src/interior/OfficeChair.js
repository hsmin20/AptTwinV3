import * as THREE from 'three';
import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';
import { textureHelper } from '../../../src_common/TextureHelper.js';

function rotateAroundWorldAxis( obj, point, axis, angle ) {
	var q = new THREE.Quaternion();
	q.setFromAxisAngle( axis, angle );

	obj.applyQuaternion( q );

	obj.position.sub( point );
	obj.position.applyQuaternion( q );
	obj.position.add( point );
}

export class OfficeChair {
    // --- 오피스체어 내부 생성 ---
    static add_Internal(editor, parent, name, width, height, depth, oldPos, oldRot, cushionColor) {
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'OfficeChair';

        if (oldPos) group.position.copy(oldPos);
        if (oldRot) group.rotation.copy(oldRot);

        editor.execute(new AddGroupCommand(editor, group, parent));

        // ====== 좌석 ======
        const cushionHeight = 0.08;
        const seatMaterial = cushionColor === 'black'
            ? new THREE.MeshStandardMaterial({ color: 0x000000 })
            : new THREE.MeshStandardMaterial({ color: 0xffffff });

        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(width, cushionHeight, depth),
            seatMaterial
        );
        seat.name = name + "_Seat";
        seat.position.y = height + cushionHeight / 2;
        group.add(seat);

        // ====== 등받이 ======
        const backrestHeight = 0.9;
        const backrestDepth = 0.04;
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(width * 0.9, backrestHeight, backrestDepth),
            new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.9 })
        );
        backrest.name = name + "_Backrest";
        backrest.position.set(0, height + cushionHeight + backrestHeight / 2, -depth * 0.5);
        backrest.rotation.x = -Math.PI / 16.0;
        group.add(backrest);

        // ====== 팔걸이 ======
        const armHeight = 0.2;
        const armY = height + cushionHeight - cushionHeight;
        const armWidth = 0.04;
        const armDepth = depth * 0.8;
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

        const leftArm = new THREE.Mesh(
            new THREE.TorusGeometry(armHeight, armWidth, 12, 48, Math.PI),
            armMaterial
        );
        leftArm.name = name + "_LeftArm";
        leftArm.position.set(-width / 2 - armWidth / 2, armY, 0);
        leftArm.rotation.y = Math.PI / 2.0;
        group.add(leftArm);

        const rightArm = leftArm.clone();
        rightArm.name = name + "_RightArm";
        rightArm.position.x = width / 2 + armWidth / 2;
        rightArm.rotation.y = Math.PI / 2.0;
        group.add(rightArm);

        // ====== 중심 기둥 ======
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const centerLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, height * 2 / 3.0, 16),
            legMaterial
        );
        centerLeg.name = name + "_CenterLeg";
        centerLeg.position.y = height * 3 / 4;
        group.add(centerLeg);

        // ====== 다리 + 바퀴 ======
        const wheelRadius = 0.07; 
        const wheelThickness = 0.05;
        const legLength = 0.3;

        const legGeometry = new THREE.BoxGeometry(0.05, 0.05, legLength);
        // legGeometry.translate(0, 0, legLength/2); // 중심을 한쪽 끝으로 이동

        const theta = Math.PI / 8.0;
        const yaxis = new THREE.Vector3(0, 1, 0).normalize(); 
        const origin = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;

            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.name = name + "_leg" + i;
            leg.position.x = 0;
            leg.position.y = wheelRadius + legLength * Math.sin(theta);
            leg.position.z = legLength * Math.cos(theta) / 2.0; // 그룹 기준점
            leg.rotation.x = theta; 
            rotateAroundWorldAxis(leg, origin, yaxis, angle);

            group.add(leg);
            leg.parent = group;
            
            // 바퀴: 다리 끝
            // Z축 기준으로 cylinder 생성
            const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 10);   
            let wheel = new THREE.Mesh(wheelGeo, legMaterial);
            wheel.name = name + "_wheel" + i;
            wheel.position.x = 0;
            wheel.position.y = wheelRadius;
            wheel.position.z = legLength * Math.cos(theta);
            wheel.rotation.z = Math.PI / 2;
            rotateAroundWorldAxis(wheel, origin, yaxis, angle);

            group.add(wheel);
            wheel.parent = group;
        }

        editor.objectChanged(group);
    }

    // --- UI ---
    static add(editor, modify = false) {
        const _html = `
            <dialog id="officeChairDialog">
            <form>
                <h1>Add/Change an Office Chair</h1>
                <p>Name : <input type="text" id="chairName" name="chairName" value="OfficeChair_1"> </p>
                <h2>Chair size</h2>
                <p>Width : <input type="text" id="width" name="width" value="0.5">
                Leg Height : <input type="text" id="height" name="height" value="0.5">
                Depth : <input type="text" id="depth" name="depth" value="0.5"></p>
                <h2>Seat Cushion Color</h2>
                    <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/OfficeChair_White.JPG" alt="white" style="width:140px; height:120px;">
                                <br>
                                <input type="radio" id="white" name="cushionColor" value="white">White
                            </div>

                            <div class="gallery">
                                <img src="./images/OfficeChair_Black.JPG" alt="black" style="width:140px; height:120px;">
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
            </dialog>
        `;

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog);

        const officeChairDialog = document.getElementById("officeChairDialog");
        const inputNameBox = document.getElementById("chairName");
        const widthBox = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox = document.getElementById("depth");
        const confirmBtn = officeChairDialog.querySelector("#confirmBtn");

        officeChairDialog.addEventListener("close", () => {
            document.body.removeChild(dialog);
        });

        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault();

            let parent = editor.selected || editor.scene;
            let oldPos = null;
            let oldRot = null;

            if (modify && editor.selected) {
                parent = editor.selected.parent;
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;
                editor.execute(new RemoveObjectCommand(editor, editor.selected));
            }

            const name = inputNameBox.value;
            const width = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const cushionColor = document.querySelector('input[name=cushionColor]:checked').value;

            officeChairDialog.close();

            this.add_Internal(editor, parent, name, width, height, depth, oldPos, oldRot, cushionColor);
        });

        officeChairDialog.showModal();
    }
}
