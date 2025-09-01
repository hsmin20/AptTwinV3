import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class AirConditioner {
    static add_Internal(editor, parent, name, width, height, depth, actype, oldPos, oldRot) {
        // 그룹 생성
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'AC';

        if (oldPos) group.position.copy(oldPos);
        if (oldRot) group.rotation.copy(oldRot);

        editor.execute(new AddGroupCommand(editor, group, parent));

        // ===== 본체 (직육면체) =====
        let body;

        if (actype === "StandAC") {
            const frontTexture = textureHelper.get('AC', 1, 1);      // 앞면
            const sideTexture = textureHelper.get('ACside', 1, 1);   // 나머지

            const bodyMaterialArray = [
                new THREE.MeshStandardMaterial({ map: sideTexture }), // right (+X)
                new THREE.MeshStandardMaterial({ map: sideTexture }), // left  (-X)
                new THREE.MeshStandardMaterial({ map: sideTexture }), // top   (+Y)
                new THREE.MeshStandardMaterial({ map: sideTexture }), // bottom(-Y)
                new THREE.MeshStandardMaterial({ map: frontTexture }),// front (+Z)
                new THREE.MeshStandardMaterial({ map: sideTexture })  // back  (-Z)
            ];

            body = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                bodyMaterialArray
            );
        } else if (actype === "Silver") {
            const greyPlasticTexture = textureHelper.get('GreyPlastic', 1, 1); 
            const bodyMaterial = new THREE.MeshStandardMaterial({ map: greyPlasticTexture });
            body = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                bodyMaterial
            );
        } else {
            // 기본 White 처리
            const whitePlasticTexture = textureHelper.get('WhitePlastic', 1, 1); 
            const bodyMaterial = new THREE.MeshStandardMaterial({ map: whitePlasticTexture });
            body = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth),
                bodyMaterial
            );
        }

        body.name = name + "_Body";
        body.position.y = height / 2;
        group.add(body);

        // ===== 받침대 =====
        const baseHeight = 0.05 * height;
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(width * 1.1, baseHeight, depth * 1.1),
            new THREE.MeshStandardMaterial({ color: 0xc0c0c0 })
        );
        base.name = name + "_Base";
        base.position.y = baseHeight / 2;
        group.add(base);

        editor.objectChanged(group);
    }


    static add(editor, modify = false) {
        const _html = `
            <dialog id="acTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change an Air Conditioner</h1>
                        <p>Name : <input type="text" id="acName" name="acName" value="AC_1"></p>

                        <h2>AC size</h2>
                        <p>Width : <input type="text" id="width"  value="0.35">
                           Height : <input type="text" id="height" value="1.80">
                           Depth : <input type="text" id="depth"  value="0.35"></p>

                        <div class="clearfix"></div>
                        <h2>AC Type</h2>
                        <p>
                          <input type="radio" id="StandAC"  name="actype" value="StandAC" checked>Stand AC
                          <input type="radio" id="silver" name="actype" value="Silver">Silver
                        </p>
                </label>
                </p>
                <div>
                  <p>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Apply</button>
                  </p>
                </div>
            </form>`;

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog);

        const acTypeDialog = document.getElementById("acTypeDialog");
        const inputNameBox = document.getElementById("acName");
        const widthBox  = document.getElementById("width");
        const heightBox = document.getElementById("height");
        const depthBox  = document.getElementById("depth");

        const confirmBtn = acTypeDialog.querySelector("#confirmBtn");

        acTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog);
        });

        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault();

            // Dialog.close(); // Have to send the select box value here.
            var parent = editor.selected;
            var oldPos = null;
            var oldRot = null;
            if(modify) {
                parent = editor.selected.parent;
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;

                editor.execute( new RemoveObjectCommand( editor, editor.selected ) );
            }

            const name   = inputNameBox.value;
            const width  = parseFloat(widthBox.value);
            const height = parseFloat(heightBox.value);
            const depth  = parseFloat(depthBox.value);
            const actype = document.querySelector('input[name=actype]:checked').value;

            document.body.removeChild(dialog);

            this.add_Internal(editor, parent, name, width, height, depth, actype, oldPos, oldRot);
        });

        acTypeDialog.showModal();
    }
}
