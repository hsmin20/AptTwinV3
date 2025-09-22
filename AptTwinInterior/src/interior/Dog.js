import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Dog {
    static add_Internal(editor, name, dogtype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Dog';
        group.userData.DBid = 'n/a';

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getFurniture();
        editor.execute( new AddGroupCommand( editor, group, parent ) );

        // Add a Body
        let boydTexture;
        if(dogtype == 'dog1')
            boydTexture = textureHelper.get('Skin1', 1, 1); 
        else {
            boydTexture = textureHelper.get('Skin2', 1, 1); 
        }
        const bodymaterial = new THREE.MeshBasicMaterial( {map: boydTexture} );

        const leg_height = 0.08;

        const body_radius = 0.08;
        const body_length = 0.24;
        const bodygeometry = new THREE.CapsuleGeometry( body_radius, body_length, 8, 20 ); 
        const body = new THREE.Mesh( bodygeometry, bodymaterial );
        body.name = name + '_Body';
        body.position.y = leg_height + body_radius;
        body.rotation.x = Math.PI / 2.0;

        group.add( body );
        body.parent = group;
        
        // Add a Head
        const head_radius = 0.05;
        const head_length = 0.04;

        const head_group = new THREE.Group();
        head_group.name = name + '_headgroup';
        head_group.position.y = leg_height + body_radius * 2.0 + head_radius;
        head_group.position.z = body_length / 1.7;
        head_group.rotation.x = Math.PI / 2.3;

        const head = new THREE.Mesh( new THREE.CapsuleGeometry( head_radius, head_length, 8, 20 ), bodymaterial );
        head.name = name + "_Head";

        const eyematerial = new THREE.MeshBasicMaterial( {color: 0x000000} );
        const eye_radius = 0.01;

        const left_eye = new THREE.Mesh(new THREE.SphereGeometry(eye_radius), eyematerial);
        left_eye.name = name + '_LeftEye';
        const right_eye = new THREE.Mesh(new THREE.SphereGeometry(eye_radius), eyematerial);
        right_eye.name = name + '_RightEye';
        left_eye.position.x = head_radius * 2 / 3;
        right_eye.position.x = -head_radius * 2 / 3;
        left_eye.position.y = head_radius * 1.1;
        right_eye.position.y = head_radius * 1.1;
        left_eye.position.z = -head_length / 3 ;
        right_eye.position.z = -head_length / 3;

        const nosematerial = new THREE.MeshBasicMaterial( {color:0x21130d} );
        const nose = new THREE.Mesh(new THREE.SphereGeometry(eye_radius * 2), nosematerial);
        nose.name = name + '_Nose';
        nose.position.y = head_length + 0.02;

        const earmaterial = new THREE.MeshBasicMaterial( {color: 0x873e23,side: THREE.DoubleSide} );
        const ear_width = 0.07;
        const ear_height = 0.05;
        const left_ear = new THREE.Mesh(new THREE.PlaneGeometry(ear_width, ear_height), earmaterial);
        left_ear.name = name + '_LeftEar';
        const right_ear = new THREE.Mesh(new THREE.PlaneGeometry(ear_width, ear_height), earmaterial);
        right_ear.name = name + '_RightEar';
        left_ear.position.x = head_radius;
        right_ear.position.x = -head_radius;
        left_ear.position.y = -head_radius / 2;
        right_ear.position.y = -head_radius / 2;
        // left_ear.position.z = -ear_width / 4;
        // right_ear.position.z = -ear_width / 4;
        left_ear.rotation.y = Math.PI / 2.0;
        right_ear.rotation.y = Math.PI / 2.0;

        head_group.children.push( head );
        head.parent = head_group;
        head_group.children.push(left_eye);
        left_eye.parent = head_group;
        head_group.children.push(right_eye);
        right_eye.parent = head_group;
        head_group.children.push(nose);
        nose.parent = head_group;
        head_group.children.push(left_ear);
        left_ear.parent = head_group;
        head_group.children.push(right_ear);
        right_ear.parent = head_group;
        
        group.children.push(head_group);
        head_group.parent = group;

        // Add 4 legs
        const leg_radius = 0.02;
        const offset_x = body_radius - leg_radius;
        const offset_z = body_length / 2.0 - leg_radius;

        for(let i=1; i<=4; i++) {
            const leg = new THREE.Mesh( new THREE.CapsuleGeometry( leg_radius, leg_height, 8, 20 ), bodymaterial );
            leg.name = name + "_leg" + i;
            leg.position.x = (i % 2 == 0) ? offset_x : -offset_x;
            leg.position.y = leg_height / 2.0;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        // Add tail
        const tail_radius = 0.01;
        const tail_length = 0.1;

        const tail = new THREE.Mesh( new THREE.CapsuleGeometry( tail_radius, tail_length, 8, 20 ), bodymaterial );
        tail.name = name + "_tail";
        tail.position.y = body_radius * 2;
        tail.position.z = -body_length;
        tail.rotation.x = Math.PI / 2.4;

        group.children.push(tail);
        tail.parent = group;

        editor.objectChanged(group);
    }
    static add(editor, modify=false) {
        const _html = `
            <dialog id="DogTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Dog</h1>
                        <p>Name : <input type="text" id="dogName" name="dogName" value="Dog_1"> </p>

                    <h2>Dog Type </h2>
                        <div style="display:flex; gap:20px;">
                        <div class="gallery">
                            <img src="./images/dog1.jpg" alt="dog1" style="width:160px; height:140px;">
                            <br>
                            <input type="radio" id="dog1" name="dogtype" value="dog1" checked>Dog 1
                        </div>

                        <div class="gallery">
                            <img src="./images/dog2.jpg" alt="dog2" style="width:160px; height:140px;">
                            <br>
                            <input type="radio" id="dog2" name="dogtype" value="dog2">Dog 2
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
            `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const dogTypeDialog = document.getElementById("DogTypeDialog");
        const inputNameBox = document.getElementById("dogName");

        const confirmBtn = dogTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        dogTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            // dogTypeDialog.close(); // Have to send the select box value here.
            var oldPos = null;
            var oldRot = null;
            if(modify) {
                oldPos = editor.selected.position;
                oldRot = editor.selected.rotation;

                editor.execute( new RemoveObjectCommand( editor, editor.selected ) );
            }

            var name = inputNameBox.value;
            const dogtype = document.querySelector('input[name=dogtype]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, name, dogtype, oldPos, oldRot)
        });

        dogTypeDialog.showModal();
    }
}
