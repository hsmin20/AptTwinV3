import * as THREE from 'three';

import { AddGroupCommand } from '../../../src_common/commands/AddGroupCommand.js';
import { RemoveObjectCommand } from '../../../src_common/commands/RemoveObjectCommand.js';

const defaultMaterials = {
  skin: new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0x3b6ea5, roughness: 0.7 }),
  pants: new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.7 }),
  shoe: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x3b2415, roughness: 0.8 }),
  eyeWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  pupil: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 }),
  mouth: new THREE.MeshStandardMaterial({ color: 0x7a3b3b, roughness: 0.6 }),
};

// Created by Claude.ai
export class Human {
	// Helper to create + position a mesh under a given parent (defaults to the root group)
	static _addMesh(geometry, material, x, y, z, parent) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }
	
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
        this._addMesh(new THREE.SphereGeometry(0.35, 24, 24), m.skin, 0, 3.15, 0, group);
        // Hair cap
        this._addMesh(new THREE.SphereGeometry(0.37, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2), m.hair, 0, 3.25, 0, group);
        // Neck
        this._addMesh(new THREE.CylinderGeometry(0.1, 0.12, 0.15, 12), m.skin, 0, 2.75, 0, group);
    }

    static _buildFace(group) {
        const m = defaultMaterials;

        // Eyes: white + pupil, mirrored left/right
        [-1, 1].forEach((side) => {
            const eyeX = side * 0.12;
            this._addMesh(new THREE.SphereGeometry(0.055, 12, 12), m.eyeWhite, eyeX, 3.22, 0.31, group);
            this._addMesh(new THREE.SphereGeometry(0.025, 8, 8), m.pupil, eyeX, 3.22, 0.355, group);
        });

        // Nose: small cone pointing forward
        const nose = this._addMesh(new THREE.ConeGeometry(0.045, 0.12, 10), m.skin, 0, 3.14, 0.34, group);
        nose.rotation.x = Math.PI / 2;

        // Mouth: thin curved smile, bulging outward toward the viewer
        const mouth = this._addMesh(new THREE.TorusGeometry(0.09, 0.015, 8, 16, Math.PI), m.mouth, 0, 3.0, 0.315, group);
        mouth.rotation.x = Math.PI / 2;
    }

    static _buildBody(group) {
        const m = defaultMaterials;
        // Torso
        this._addMesh(new THREE.CylinderGeometry(0.4, 0.32, 1.0, 16), m.shirt, 0, 2.2, 0, group);
        // Hips
        this._addMesh(new THREE.CylinderGeometry(0.32, 0.28, 0.3, 16), m.pants, 0, 1.6, 0, group);
    }

    static _createArm(sideSign) {
        const m = defaultMaterials;
        const arm = new THREE.Group();
        arm.position.set(sideSign * 0.5, 2.6, 0);

        this._addMesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 12), m.shirt, 0, -0.275, 0, arm);

        const lowerArmGroup = new THREE.Group();
        lowerArmGroup.position.set(0, -0.55, 0);
        arm.add(lowerArmGroup);

        this._addMesh(new THREE.CylinderGeometry(0.075, 0.065, 0.5, 12), m.skin, 0, -0.25, 0, lowerArmGroup);
        this._addMesh(new THREE.SphereGeometry(0.08, 12, 12), m.skin, 0, -0.55, 0, lowerArmGroup);

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

        this._addMesh(new THREE.CylinderGeometry(0.13, 0.11, 0.75, 12), m.pants, 0, -0.375, 0, leg);

        const lowerLegGroup = new THREE.Group();
        lowerLegGroup.position.set(0, -0.75, 0);
        leg.add(lowerLegGroup);

        this._addMesh(new THREE.CylinderGeometry(0.1, 0.09, 0.7, 12), m.skin, 0, -0.35, 0, lowerLegGroup);
        this._addMesh(new THREE.BoxGeometry(0.16, 0.12, 0.3), m.shoe, 0, -0.72, 0.06, lowerLegGroup);

        return leg;
    }

    static _buildLegs(group) {
        const leftLeg = this._createLeg(-1);
        const rightLeg = this._createLeg(1);
        group.add(leftLeg, rightLeg);
    }

    static add(editor, sex) {
        this.add_Internal(editor);
    }
}