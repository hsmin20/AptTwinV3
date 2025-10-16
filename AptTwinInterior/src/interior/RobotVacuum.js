import * as THREE from 'three';
import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';
import { textureHelper } from '../../../src_common/TextureHelper.js';

export class RobotVacuum {
    static add_Internal(editor, name, radius, height, depth, vacuumType, oldPos, oldRot) {
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'RobotVacuum';
        group.userData.DBid = 'n/a';

        if(oldPos) group.position.copy(oldPos);
        if(oldRot) group.rotation.copy(oldRot);

        let parent = editor.getHomeAppliance();
        editor.execute(new AddGroupCommand(editor, group, parent));

        // Cleaner
        const cleanerTexture = textureHelper.get('Vacuum', 1, 1);
        const cleaner_height = 0.1;
        const cleaner = new THREE.Mesh( new THREE.CylinderGeometry(radius, radius, cleaner_height), new THREE.MeshStandardMaterial({ map: cleanerTexture }));
        cleaner.name = '_cleaner';
        cleaner.position.y = cleaner_height / 2.0 + 0.02;
        cleaner.rotation.y = Math.PI / -2.0;

        group.add(cleaner);
        cleaner.parent = group;

        if(vacuumType == 'robotVacuum2') {
            // Station
            const thin_depth = 0.01;
            const stationTexture = textureHelper.get('WhitePlastic', 1, 1);

            const part1Height = height - cleaner_height - (thin_depth * 3);
            const stationPart1 = new THREE.Mesh(new THREE.BoxGeometry(radius*1.8, part1Height, depth), new THREE.MeshStandardMaterial({ map: stationTexture }));
            stationPart1.name = name + "_StationPart1";
            stationPart1.position.y = part1Height / 2.0 + cleaner_height + (thin_depth * 3);
            stationPart1.position.z = -radius / 2.0;

            const part2Height = cleaner_height + thin_depth * 2;
            const stationPart2 = new THREE.Mesh(new THREE.BoxGeometry(radius*1.8, part2Height, thin_depth), new THREE.MeshStandardMaterial({ map: stationTexture }));
            stationPart2.name = name + "_StationPart2";
            stationPart2.position.y = part2Height / 2.0 + thin_depth;
            stationPart2.position.z = -(depth + radius) / 2.0 + thin_depth / 2.0;

            const part3Height = thin_depth;
            const part3Depth = depth * 1.5;
            const stationPart3 = new THREE.Mesh(new THREE.BoxGeometry(radius*1.8, part3Height, part3Depth), new THREE.MeshStandardMaterial({ map: stationTexture }));
            stationPart3.name = name + "_StationPart3";
            stationPart3.position.y = part3Height / 2.0;
            stationPart3.position.z = (part3Depth - radius - depth) / 2.0;
            
            group.add(stationPart1);
            stationPart1.parent = group;
            group.add(stationPart2);
            stationPart2.parent = group;
            group.add(stationPart3);
            stationPart3.parent = group;
        }

        editor.objectChanged(group);
    }

    static add(editor, modify=false) {
        const _html = `
            <dialog id="RobotVacuumDialog">
            <form>
                <label>
                    <h1>Add/Change a Robot Vacuum Cleaner</h1>
                    <p>Name : <input type="text" id="robotVacuumName" name="robotVacuumName" value="RobotVacuum_1"> </p>

                    <h2>Robot Vacuum Cleaner Size (m)</h2>
                    <p>
                        Radius : <input type="text" id="radius" value="0.175">
                        Height (Station) : <input type="text" id="height" value="0.5">
                        Depth (Station) : <input type="text" id="depth" value="0.23">
                    </p>

                    <h2>Robot Vacuum Cleaner Type</h2>
                      <div style="display:flex; gap:20px;">
                            <div class="gallery">
                                <img src="./images/robotVacuum1.jpg" alt="robotVacuum1" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="robotVacuum1" name="vacuumType" value="robotVacuum1" checked>Cleaner
                            </div>

                            <div class="gallery">
                                <img src="./images/robotVacuum2.jpg" alt="robotVacuum2" style="width:160px; height:140px;">
                                <br>
                                <input type="radio" id="robotVacuum2" name="vacuumType" value="robotVacuum2">with Station
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

        const robotVacuumTypeDialog = document.getElementById("RobotVacuumDialog");
        const inputNameBox = document.getElementById("robotVacuumName");
        const radiushBox = document.getElementById("radius");
        const heightBox = document.getElementById("height");
         const depthBox = document.getElementById("depth");
        const confirmBtn = robotVacuumTypeDialog.querySelector("#confirmBtn");

        robotVacuumTypeDialog.addEventListener("close", () => {
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
            const radius = parseFloat(radiushBox.value);
            const height = parseFloat(heightBox.value);
            const depth = parseFloat(depthBox.value);
            const vacuumType = document.querySelector('input[name=vacuumType]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, name, radius, height, depth, vacuumType, oldPos, oldRot);
        });

        robotVacuumTypeDialog.showModal();
    }
}
