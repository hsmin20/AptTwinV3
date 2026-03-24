import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

var keyDownFunc;
var keyUpFunc;
var moveFunc;
var clickFunc;
var dlbClickFunc;

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
    WALKING_SPEED = 50.0; // m/s
    RUNNING_SPEED = 90.0; // m/s
    STANDING_POSITION_Y = 1.5; // m
    CROUCHING_POSITION_Y = 0.9; // m

    constructor(player, camera, scene) {
        this.player = player;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.canJump = false;
        this.gravity = true;
        this.crouch = false;
        this.isStanding = false;
        this.shiftKeyPressed = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.standingPos = this.STANDING_POSITION_Y;
        this.crouchingPos = this.CROUCHING_POSITION_Y;

        this.init(camera, scene);

        this.firstTime = true;
    }

    onKeyDown(event) {
        if (event.shiftKey)
            this.shiftKeyPressed = true;
        else
            this.shiftKeyPressed = false;

        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
            case 'Space':
                if(this.gravity == true) {
                    if ( this.canJump === true ) 
                        this.velocity.y += 5.5;
                    this.canJump = false;
                } else {
                    this.moveUp = true;
                }
                break;
            case 'KeyC':
                if(this.gravity == true) {
                    this.crouch = !this.crouch;
                    if(!this.crouch && this.canJump == true) {
                        this.velocity.y += 10;
                        this.isStanding = true;
                    }
                } else {
                    this.moveDown = true;
                }
                break;
            case 'KeyG':
                this.gravity = !this.gravity;
                break;
            default:
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
            case 'Space':
                if(!this.gravity)
                    this.moveUp = false;
                break;
            case 'KeyC':
                if(!this.gravity)
                    this.moveDown = false;
                break;
        }
    }

    onMouseMove(event) {
        event.preventDefault();

        this.player.setRaycasterPosDir();
        // this.applicationManager.handleSelectedObj();
    }

    onMouseClick(event) {
        if ( event.clientY < 32 )
             return;

        if(this.controls.isLocked == false)
            this.controls.lock();

        event.preventDefault();

        this.player.setRaycasterPosDir();
        this.player.handleMouseClick();

        if(this.firstTime)
            this.firstTime = false;
    }

    init(camera, scene) {
        this.controls = new PointerLockControls(camera, document.body);
    //	document.addEventListener('click', function () { this.controls.lock(); });
        scene.add(this.controls.object);

        keyDownFunc = this.onKeyDown.bind(this);
        keyUpFunc = this.onKeyUp.bind(this);
        moveFunc = this.onMouseMove.bind(this);
        clickFunc = this.onMouseClick.bind(this);

        document.addEventListener('keydown', keyDownFunc);
        document.addEventListener('keyup', keyUpFunc);
        document.addEventListener('mousemove', moveFunc);
        document.addEventListener('click',clickFunc);
        document.addEventListener('dblclick', dlbClickFunc);
    }

    dispose() {
        document.removeEventListener('keydown', keyDownFunc);
        document.removeEventListener('keyup', keyUpFunc);
        document.removeEventListener('mousemove', moveFunc);
        document.removeEventListener('click', clickFunc);

        this.controls.unlock();
        this.controls.dispose();
    }

    run(delta) {
        if(this.controls.isLocked === true) {
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
    
            if(this.gravity) {
                this.velocity.y -= 9.8 * 3.0 * delta;
            } else {
                this.velocity.y = 0;
            }
    
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.y = Number(this.moveUp) - Number(this.moveDown);
            this.direction.normalize(); // this ensures consistent movements in all directions
            var SPEED = this.shiftKeyPressed ? this.RUNNING_SPEED : this.WALKING_SPEED;
            if ( this.moveForward || this.moveBackward ) 
                this.velocity.z -= this.direction.z * SPEED * delta;
            if ( this.moveLeft || this.moveRight ) 
                this.velocity.x -= this.direction.x * SPEED * delta;
            if(!this.gravity) {
                if ( this.moveUp || this.moveDown ) 
                    this.velocity.y += this.direction.y * this.RUNNING_SPEED * delta;
            }

            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            this.controls.object.position.y += (this.velocity.y * delta); // new behavior

            if(this.player.detectCollison()) {
                this.controls.moveRight(this.velocity.x * delta);
                this.controls.moveForward(this.velocity.z * delta);
                this.controls.object.position.y -= (this.velocity.y * delta); // new behavior
            }

            if(this.gravity) {
                var MY_POSITION = this.crouch ? this.crouchingPos : this.standingPos;
                var curPosY = this.controls.object.position.y;
                if(this.isStanding) {
                    if(curPosY > MY_POSITION) {
                        this.velocity.y = 0;
                        this.controls.object.position.y = MY_POSITION;
                        this.canJump = true;
                        this.isStanding = false;
                    }
                } else {
                    if(curPosY <= MY_POSITION) {
                        this.velocity.y = 0;
                        this.controls.object.position.y = MY_POSITION;
                        this.canJump = true;
                    }
                }
            }
        }
    }
}