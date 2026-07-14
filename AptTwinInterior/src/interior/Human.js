import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

const defaultMaterials = {
  skin: new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0x3b6ea5, roughness: 0.7 }),
  pants: new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.7 }),
  dress: new THREE.MeshStandardMaterial({ color: 0xd6558c, roughness: 0.7 }),
  shoe: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x3b2415, roughness: 0.8 }),
  eyeWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  pupil: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 }),
  mouth: new THREE.MeshStandardMaterial({ color: 0x7a3b3b, roughness: 0.6 }),
};

// Helper to create + position a mesh under a given parent (defaults to the root group)
function _addMesh(geometry, material, x, y, z, parent) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}

export class Human {
    static add(editor, sex) {
        if(sex == 1)
            Male.add_Internal(editor);
        else
            Female.add_Internal(editor);
    }
}

// Created by Claude.ai
export class Male {
	static add_Internal(editor) {
		// Add a group first
		const group = new THREE.Group();
		group.name = "Psycho";
        group.userData.isInterior = true;
        group.userData.interiorType = 'Human';
		
		let parent = editor.getHuman();
        editor.execute( new AddGroupCommand( editor, group, parent ) );
		
		let position = { x: 0, y: 0, z: 0 };
		let scale = 0.5;
        
        group.position.set(position.x, position.y, position.z);
        group.scale.setScalar(scale);

        this._buildHead(group);
        this._buildFace(group);
        this._buildBody(group);
        this._buildArms(group);
        this._buildLegs(group);
    }

    static _buildHead(group) {
        const m = defaultMaterials;
        _addMesh(new THREE.SphereGeometry(0.35, 24, 24), m.skin, 0, 3.15, 0, group);
        // Hair cap
        _addMesh(new THREE.SphereGeometry(0.37, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2), m.hair, 0, 3.25, 0, group);
        // Neck
        _addMesh(new THREE.CylinderGeometry(0.1, 0.12, 0.15, 12), m.skin, 0, 2.75, 0, group);
    }

    static _buildFace(group) {
        const m = defaultMaterials;

        // Eyes: white + pupil, mirrored left/right
        [-1, 1].forEach((side) => {
            const eyeX = side * 0.12;
            _addMesh(new THREE.SphereGeometry(0.055, 12, 12), m.eyeWhite, eyeX, 3.22, 0.31, group);
            _addMesh(new THREE.SphereGeometry(0.025, 8, 8), m.pupil, eyeX, 3.22, 0.355, group);
        });

        // Nose: small cone pointing forward
        const nose = _addMesh(new THREE.ConeGeometry(0.045, 0.12, 10), m.skin, 0, 3.14, 0.34, group);
        nose.rotation.x = Math.PI / 2;

        // Mouth: thin curved smile, bulging outward toward the viewer
        const mouth = _addMesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16, Math.PI), m.mouth, 0, 3.0, 0.315, group);
        mouth.rotation.x = Math.PI / 2;
    }

    static _buildBody(group) {
        const m = defaultMaterials;
        // Torso
        _addMesh(new THREE.CylinderGeometry(0.4, 0.32, 1.0, 16), m.shirt, 0, 2.2, 0, group);
        // Hips
        _addMesh(new THREE.CylinderGeometry(0.32, 0.28, 0.3, 16), m.pants, 0, 1.6, 0, group);
    }

    static _createArm(sideSign) {
        const m = defaultMaterials;
        const arm = new THREE.Group();
        arm.position.set(sideSign * 0.5, 2.6, 0);

        _addMesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 12), m.shirt, 0, -0.275, 0, arm);

        const lowerArmGroup = new THREE.Group();
        lowerArmGroup.position.set(0, -0.55, 0);
        arm.add(lowerArmGroup);

        _addMesh(new THREE.CylinderGeometry(0.075, 0.065, 0.5, 12), m.skin, 0, -0.25, 0, lowerArmGroup);
        _addMesh(new THREE.SphereGeometry(0.08, 12, 12), m.skin, 0, -0.55, 0, lowerArmGroup);

        arm.rotation.z = sideSign * 0.15;
        return arm;
    }

    static _buildArms(group) {
        const leftArm = this._createArm(-1);
        const rightArm = this._createArm(1);
        group.add(leftArm, rightArm);
    }

    static _createLeg(sideSign) {
        const m = defaultMaterials;
        const leg = new THREE.Group();
        leg.position.set(sideSign * 0.17, 1.45, 0);

        _addMesh(new THREE.CylinderGeometry(0.13, 0.11, 0.75, 12), m.pants, 0, -0.375, 0, leg);

        const lowerLegGroup = new THREE.Group();
        lowerLegGroup.position.set(0, -0.75, 0);
        leg.add(lowerLegGroup);

        _addMesh(new THREE.CylinderGeometry(0.1, 0.09, 0.7, 12), m.skin, 0, -0.35, 0, lowerLegGroup);
        _addMesh(new THREE.BoxGeometry(0.16, 0.12, 0.3), m.shoe, 0, -0.72, 0.06, lowerLegGroup);

        return leg;
    }

    static _buildLegs(group) {
        const leftLeg = this._createLeg(-1);
        const rightLeg = this._createLeg(1);
        group.add(leftLeg, rightLeg);
    }

}

export class Female {
    static add_Internal(editor) {
        // Add a group first
		const group = new THREE.Group();
		group.name = "Psychee";
        group.userData.isInterior = true;
        group.userData.interiorType = 'Human';
		
		let parent = editor.getHuman();
        editor.execute( new AddGroupCommand( editor, group, parent ) );
		
		let position = { x: 0, y: 0, z: 0 };
		let scale = 0.5;
        
        group.position.set(position.x, position.y, position.z);
        group.scale.setScalar(scale);

        this._buildHead(group);
        this._buildFace(group);
        this._buildHair(group);
        this._buildBody(group);
        this._buildArms(group);
        this._buildLegs(group);
    }

    static _buildHead(group) {
        const m = defaultMaterials;
        _addMesh(new THREE.SphereGeometry(0.33, 24, 24), m.skin, 0, 3.15, 0, group);
        _addMesh(new THREE.CylinderGeometry(0.09, 0.11, 0.14, 12), m.skin, 0, 2.86, 0, group);
    }

    static _buildFace(group) {
        const m = defaultMaterials;

        [-1, 1].forEach((side) => {
            const eyeX = side * 0.115;
            _addMesh(new THREE.SphereGeometry(0.052, 12, 12), m.eyeWhite, eyeX, 3.2, 0.29, group);
            _addMesh(new THREE.SphereGeometry(0.024, 8, 8), m.pupil, eyeX, 3.2, 0.335, group);
        });

        const nose = _addMesh(new THREE.ConeGeometry(0.035, 0.09, 10), m.skin, 0, 3.13, 0.32, group);
        nose.rotation.x = Math.PI / 2;

        const mouth = _addMesh(new THREE.TorusGeometry(0.055, 0.008, 8, 16, Math.PI), m.mouth, 0, 3.0, 0.305, group);
        mouth.rotation.x = Math.PI / 2;
    }

    static _buildHair(group) {
        const m = defaultMaterials;

        // 1. Dome: stops well above eye height (eyes are at y=3.2)
        const dome = _addMesh(
            new THREE.SphereGeometry(0.35, 24, 20, 0, Math.PI * 2, 0, Math.PI * (80 / 180)),
            m.hair, 0, 3.28, 0, group
        );

        // 2. Back length: a chain of gradually tapering, overlapping spheres —
        // wide near the head, narrowing toward the tip — so it reads as flowing
        // hair rather than a single round lump. Stays well behind the face
        // (front reaches only to about z=-0.02 to 0.04, far short of z≈0.3
        // where the eyes/nose/mouth sit).
        const strand = [
            { y: 3.16, z: -0.20, r: 0.29, sy: 1.15, sz: 0.82 },
            { y: 2.88, z: -0.23, r: 0.24, sy: 1.2, sz: 0.8 },
            { y: 2.60, z: -0.245, r: 0.18, sy: 1.25, sz: 0.78 },
            { y: 2.35, z: -0.23, r: 0.11, sy: 1.2, sz: 0.75 },
        ];
        strand.forEach(({ y, z, r, sy, sz }) => {
            const seg = _addMesh(new THREE.SphereGeometry(r, 16, 14), m.hair, 0, y, z, group);
            seg.scale.set(1.0, sy, sz);
        });
    }

   static _buildBody(group) {
        const m = defaultMaterials;
        _addMesh(new THREE.CylinderGeometry(0.3, 0.28, 0.85, 16), m.dress, 0, 2.32, 0, group);
        _addMesh(new THREE.CylinderGeometry(0.28, 0.48, 0.5, 20), m.dress, 0, 1.72, 0, group);
    }

    static _createArm(group, sideSign) {
        const m = defaultMaterials;
        const arm = new THREE.Group();
        arm.position.set(sideSign * 0.42, 2.55, 0);

        _addMesh(new THREE.CylinderGeometry(0.075, 0.065, 0.48, 12), m.dress, 0, -0.24, 0, arm);

        const lowerArmGroup = new THREE.Group();
        lowerArmGroup.position.set(0, -0.48, 0);
        arm.add(lowerArmGroup);

        _addMesh(new THREE.CylinderGeometry(0.06, 0.052, 0.42, 12), m.skin, 0, -0.21, 0, lowerArmGroup);
        _addMesh(new THREE.SphereGeometry(0.065, 12, 12), m.skin, 0, -0.45, 0, lowerArmGroup);

        arm.rotation.z = sideSign * 0.17;
        return arm;
    }

    static _buildArms(group) {
        const leftArm = this._createArm(group, -1);
        const rightArm = this._createArm(group, 1);
        group.add(leftArm, rightArm);
    }

    static _createLeg(group, sideSign) {
        const m = defaultMaterials;
        const leg = new THREE.Group();
        leg.position.set(sideSign * 0.15, 1.47, 0);

        // Bare thigh (the skirt covers most of it visually)
        _addMesh(new THREE.CylinderGeometry(0.075, 0.065, 0.5, 12), m.skin, 0, -0.25, 0, leg);

        const lowerLegGroup = new THREE.Group();
        lowerLegGroup.position.set(0, -0.5, 0);
        leg.add(lowerLegGroup);

        _addMesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 12), m.skin, 0, -0.225, 0, lowerLegGroup);
        _addMesh(new THREE.BoxGeometry(0.11, 0.08, 0.2), m.shoe, 0, -0.47, 0.035, lowerLegGroup);

        return leg;
    }

    static _buildLegs(group) {
        const leftLeg = this._createLeg(group, -1);
        const rightLeg = this._createLeg(group, 1);
        group.add(leftLeg, rightLeg);
    }
}

