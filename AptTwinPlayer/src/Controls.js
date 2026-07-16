import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

var keyDownFunc;
var keyUpFunc;
var moveFunc;
var clickFunc;
var dlbClickFunc;
var lockChangeFunc;

export class OrbitalControl {
   
    constructor(player, camera, renderer) {
        this.player = player;

        this.init(camera, renderer);
    }

    onMouseClick(event) {
        event.preventDefault();
    
        this.player.setRaycasterPosDir();
        this.player.handleMouseClick();
    }

    onDblclick(event) {
        event.preventDefault();
    }

    init(camera, renderer) {
        this.controls = new OrbitControls(camera, renderer.domElement);
        this.controls.maxPolarAngle = Math.PI / 2 - 0.01;
    
        clickFunc = this.onMouseClick.bind(this);
        dlbClickFunc = this.onDblclick.bind(this);
        // keyDownFunc = this.onKeyDown.bind(this);
        
        document.addEventListener('click', clickFunc);
        document.addEventListener('dblclick', dlbClickFunc);
        // document.addEventListener('keydown', keyDownFunc);
    }

    dispose() {
        document.removeEventListener('click', clickFunc);
        document.removeEventListener('dblclick', dlbClickFunc);
        // document.removeEventListener('keydown', keyDownFunc);

        this.controls.dispose();
    }

    run(delta) {
        this.controls.update();
    }
}

export class FreeLookControl {
    constructor(player, playerBody) {
        this.player = player;

        this.keys = {};
        this.yaw = 0;
        this.pitch = 0;
        this.onGround = false;
        this.locked = false;

        this.playerBody = playerBody;

        keyDownFunc = this.onKeyDown.bind(this);
        keyUpFunc = this.onKeyUp.bind(this);
        moveFunc = this.onMouseMove.bind(this);
        clickFunc = this.onMouseClick.bind(this);
        lockChangeFunc = this.onPointerLockChange.bind(this);

        document.addEventListener('keydown', keyDownFunc);
        document.addEventListener('keyup',   keyUpFunc);
        document.addEventListener('mousemove', moveFunc);
        document.addEventListener('click', clickFunc);
        document.addEventListener('pointerlockchange', lockChangeFunc);
    }

    onKeyDown(event) {
        this.keys[event.code] = true;
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    onMouseMove(event) {
        event.preventDefault();

        if (!this.locked) 
            return;
        this.yaw   -= event.movementX * 0.001;
        this.pitch -= event.movementY * 0.001;
        this.pitch  = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, this.pitch));

        this.player.setRaycasterPosDir();
        this.player.handleSelectedObj();
    }

    onMouseClick(event) {
        event.preventDefault();

        if (!this.locked) {
            this.player.renderer.domElement.requestPointerLock();
            this.locked = true;
            return;
        }

        this.player.setRaycasterPosDir();
        this.player.handleMouseClick();
    }

    onPointerLockChange(event) {
        this.locked = document.pointerLockElement === this.player.renderer.domElement;
    }

    dispose() {
        document.removeEventListener('keydown', keyDownFunc);
        document.removeEventListener('keyup', keyUpFunc);
        document.removeEventListener('mousemove', moveFunc);
        document.removeEventListener('click', clickFunc);
        document.removeEventListener('pointerlockchange', lockChangeFunc);
    }

    run(delta) {
        // Ground re-check (fallback)
        if (this.playerBody.position.y < 1.6) {
            this.playerBody.position.y = 1.6;
            this.playerBody.velocity.y = 0;
            this.onGround = true;
        }

        // Movement
        const moveDir = new THREE.Vector3();
        if (this.keys['KeyW'] || this.keys['ArrowUp'])   
            moveDir.z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown'])  
            moveDir.z += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft'])  
            moveDir.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) 
            moveDir.x += 1;
        moveDir.normalize();

        const speed = 6;
        const flat = new THREE.Vector3(
            Math.sin(this.yaw) * moveDir.z + Math.cos(this.yaw) * moveDir.x, 
            0, 
            Math.cos(this.yaw) * moveDir.z - Math.sin(this.yaw) * moveDir.x
        );
        this.playerBody.velocity.x = flat.x * speed;
        this.playerBody.velocity.z = flat.z * speed;

        // Jump
        if (this.keys['Space'] && this.onGround) {
            this.playerBody.velocity.y = 6;
            this.onGround = false;
        }

        return [ this.yaw, this.pitch ];
    }
}
