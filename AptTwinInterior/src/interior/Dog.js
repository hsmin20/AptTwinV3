import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Dog {
    static add_Internal(editor, name, dogtype, oldPos, oldRot) {
        if(dogtype == 'dog1' || dogtype == 'dog2') {
            this.addOldDog(editor, name, dogtype, oldPos, oldRot);
        } else {
            this.addClaudeDog(editor, name, dogtype, oldPos, oldRot);
        }
    }

    static addClaudeDog(editor, name, dogtype, oldPos, oldRot) {
        const dog = new ClaudeDog();
        const group = dog.getGroup();
        group.userData.isInterior = true;
        group.userData.interiorType = 'Dog';
        group.userData.DBid = 'n/a';
        group.userData.dogType = dogtype;

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getPet();
        editor.execute( new AddGroupCommand( editor, group, parent ) );
    }

    static addOldDog(editor, name, dogtype, oldPos, oldRot) {
        // Add a group first
        const group = new THREE.Group();
        group.name = name;
        group.userData.isInterior = true;
        group.userData.interiorType = 'Dog';
        group.userData.DBid = 'n/a';
        group.userData.dogType = dogtype;

        if(oldPos != null)
            group.position.copy(oldPos);
        if(oldRot != null)
            group.rotation.copy(oldRot);

        let parent = editor.getPet();
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
        const head_radius = 0.05;

        const height = leg_height + body_radius + head_radius;

        const body_length = 0.24;
        const bodygeometry = new THREE.CapsuleGeometry( body_radius, body_length, 8, 20 ); 
        const body = new THREE.Mesh( bodygeometry, bodymaterial );
        body.name = name + '_Body';
        body.position.y = leg_height + body_radius - height / 2.0;
        body.rotation.x = Math.PI / 2.0;

        group.add( body );
        body.parent = group;
        
        // Add a Head
        const head_length = 0.04;

        const head_group = new THREE.Group();
        head_group.name = name + '_headgroup';
        head_group.position.y = leg_height + body_radius * 2.0 + head_radius - height / 2.0;
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
        nose.position.y = head_length + 0.020;

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
            leg.position.y = leg_height / 2.0 - height / 2.0;
            leg.position.z = (i < 3) ? -offset_z : offset_z;

            group.children.push( leg );
            leg.parent = group;
        }

        // Add tail
        const tail_radius = 0.01;
        const tail_length = 0.1;

        const tail = new THREE.Mesh( new THREE.CapsuleGeometry( tail_radius, tail_length, 8, 20 ), bodymaterial );
        tail.name = name + "_tail";
        tail.position.y = body_radius * 2 - height / 2.0;
        tail.position.z = -body_length;
        tail.rotation.x = Math.PI / 2.4;

        group.children.push(tail);
        tail.parent = group;

        group.position.y =  height / 2.0;

        editor.objectChanged(group);
    }
    static add(editor, modify=false) {
        let _html = `
            <dialog id="DogTypeDialog">
            <form>
                <p>
                <label>
                    <h1>Add/Change a Dog</h1>
                        <p>Name : <input type="text" id="dogName" name="dogName" value="_NAME_"> </p>

                    <h2>Dog Type </h2>
                        <div style="display:flex; gap:20px;">
                        <div class="gallery">
                            <img src="./images/dog1.jpg" alt="dog1" style="width:160px; height:140px;">
                            <br>
                            <input type="radio" id="dog1" name="dogtype" value="dog1">Dog 1
                        </div>

                        <div class="gallery">
                            <img src="./images/dog2.jpg" alt="dog2" style="width:160px; height:140px;">
                            <br>
                            <input type="radio" id="dog2" name="dogtype" value="dog2">Dog 2
                        </div>

                        <div class="gallery">
                            <img src="./images/claudedog.jpg" alt="dog3" style="width:160px; height:140px;">
                            <br>
                            <input type="radio" id="dog3" name="dogtype" value="dog3">Claude Dog
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
        let name = 'Dog_1';
        let dogtype = 'dog1';
        if(modify && editor.selected) {
            name = editor.selected.name;
            dogtype = editor.selected.userData.dogType;
        }

        _html = _html.replace('_NAME_', name);
        
        const origin = 'value="' + dogtype + '"';
        const replaced = 'value="' + dogtype + '" checked';
        _html = _html.replace(origin, replaced);

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

// ---------- Shared materials ----------
const defaultMaterials = {
  fur: new THREE.MeshStandardMaterial({ color: 0xc98a4b, roughness: 0.85 }),
  furDark: new THREE.MeshStandardMaterial({ color: 0x7a4d26, roughness: 0.85 }),
  nose: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 }),
  eye: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 }),
};

// ---------- Dog class ----------
// Builds a simple, stylized dog out of primitive geometries and exposes an
// update() method for a gentle idle animation (tail wag + breathing).
class ClaudeDog {
    constructor({ position = { x: 0, y: 0, z: 0 }, materials = {}, scale = 0.55 } = {}) {
        this.materials = { ...defaultMaterials, ...materials };
        this.group = new THREE.Group();
        this.group.position.set(position.x, position.y, position.z);
        this.group.scale.setScalar(scale);

        this._phaseOffset = Math.random() * Math.PI * 2;

        this._buildLegs();
        this._buildBody();
        this._buildHead();
        this._buildTail();
    }

    getGroup() {
        return this.group;
    }

    _addMesh(geometry, material, x, y, z, parent = this.group) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }

    _buildLegs() {
        const m = this.materials;
        const legHeight = 0.34;
        const positions = [
            [0.16, 0.32],   // front-right
            [-0.16, 0.32],  // front-left
            [0.16, -0.32],  // back-right
            [-0.16, -0.32], // back-left
        ];
        positions.forEach(([x, z]) => {
            this._addMesh(new THREE.CylinderGeometry(0.055, 0.05, legHeight, 10), m.fur, x, legHeight / 2, z);
            // Paw
            this._addMesh(new THREE.SphereGeometry(0.06, 10, 10), m.furDark, x, 0.03, z);
        });
    }

    _buildBody() {
        const m = this.materials;
        const body = this._addMesh(new THREE.SphereGeometry(0.32, 20, 16), m.fur, 0, 0.55, 0);
        body.scale.set(1.0, 0.85, 1.55);
    }

    _buildHead() {
        const m = this.materials;

        // Neck (bridges body to head)
        const neck = this._addMesh(new THREE.CylinderGeometry(0.13, 0.17, 0.22, 12), m.fur, 0, 0.78, 0.48);
        neck.rotation.x = -0.5;

        // Head
        this._addMesh(new THREE.SphereGeometry(0.22, 18, 16), m.fur, 0, 0.92, 0.66);

        // Snout
        const snout = this._addMesh(new THREE.CylinderGeometry(0.09, 0.12, 0.26, 12), m.fur, 0, 0.86, 0.88);
        snout.rotation.x = Math.PI / 2;

        // Nose
        this._addMesh(new THREE.SphereGeometry(0.045, 10, 10), m.nose, 0, 0.865, 1.005);

        // Eyes
        [-1, 1].forEach((side) => {
            this._addMesh(new THREE.SphereGeometry(0.028, 10, 10), m.eye, side * 0.095, 0.96, 0.84);
        });

        // Ears: floppy, attached at the top sides of the head, hanging down
        [-1, 1].forEach((side) => {
            const ear = this._addMesh(new THREE.SphereGeometry(0.1, 12, 12), m.furDark, side * 0.19, 1.0, 0.62, this.group);
            ear.scale.set(0.5, 1.3, 0.9);
            ear.rotation.z = side * 0.55;
            ear.rotation.x = 0.15;
        });
    }

    _buildTail() {
        const m = this.materials;
        this.tail = new THREE.Group();
        this.tail.position.set(0, 0.68, -0.55);
        this.tail.rotation.x = -0.7; // angled up and back

        this._addMesh(new THREE.CylinderGeometry(0.055, 0.025, 0.42, 10), m.fur, 0, 0.12, 0.1, this.tail);
        this.group.add(this.tail);
        }

        addTo(scene) {
        scene.add(this.group);
        return this;
    }

    // Gentle idle animation: tail wag + subtle breathing bob
    update(t) {
        const phased = t + this._phaseOffset;
        if (this.tail) this.tail.rotation.z = Math.sin(phased * 4) * 0.4;
        this.group.position.y = this.group.position.y; // placeholder (kept for future bob use)
        this.group.scale.y = 1 + Math.sin(phased * 1.8) * 0.01; // subtle breathing
    }
}