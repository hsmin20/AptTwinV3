import * as THREE from 'three';

import { AddGroupCommand } from '../../src_common/commands/AddGroupCommand.js';
import { AddObjectCommand } from '../../src_common/commands/AddObjectCommand.js';
import { RemoveObjectCommand } from '../../src_common/commands/RemoveObjectCommand.js';
import { textureHelper } from '../../src_common/TextureHelper.js';

const offset = 0.001; // 1mm. needed for cope with 'z-fighting'

export class RoomBuilder {
    constructor( editor ) {
        this.editor = editor;
    }

    addTHREELight(name, type) {
        if(type == 'Ambient') {
            var ambientLight = new THREE.AmbientLight ();
            ambientLight.name = name;

    		this.editor.execute( new AddObjectCommand( this.editor, ambientLight ) );
        }
    }

    addRoom(name, width, length, height) {
        // Add a group first
        const group = new THREE.Group();
		group.name = name;

        this.editor.execute( new AddGroupCommand( this.editor, group ) );

        const depth = 0.2;
        // Add 4 box for room
        const northWall = new THREE.Mesh( new THREE.BoxGeometry(width-offset, height, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        northWall.name = name + "_NorthWall";
        northWall.position.x = 0.0;
        northWall.position.y = height / 2.0;
        northWall.position.z = -(length - depth) / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, northWall, group ) );
        group.children.push( northWall );
		northWall.parent = group;

        const eastWall = new THREE.Mesh( new THREE.BoxGeometry(length-offset, height, depth),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        eastWall.name = name + "_EastWall";
        eastWall.position.x = (width - depth) / 2.0;
        eastWall.position.y = height / 2.0;
        eastWall.position.z = 0.0;
        eastWall.rotation.y = -Math.PI / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, eastWall, group ) );
        group.children.push( eastWall );
		eastWall.parent = group;

        const southWall = new THREE.Mesh( new THREE.BoxGeometry(width-offset, height, depth),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        southWall.name = name + "_SouthWall";
        southWall.position.x = 0.0;
        southWall.position.y = height / 2.0;
        southWall.position.z = (length - depth) / 2.0;
        southWall.rotation.y = Math.PI;

        // this.editor.execute( new AddObjectCommand( this.editor, southWall, group ) );
        group.children.push( southWall );
		southWall.parent = group;

        const westWall = new THREE.Mesh( new THREE.BoxGeometry(length-offset, height, depth),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        westWall.name = name + "_WestWall";
        westWall.position.x = -(width - depth) / 2.0;
        westWall.position.y = height / 2.0;
        westWall.position.z = 0.0;
        westWall.rotation.y = Math.PI / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, westWall, group ) );
        group.children.push( westWall );
		westWall.parent = group;

        // Floor
        const floor = new THREE.Mesh( new THREE.PlaneGeometry(width, length), new THREE.MeshStandardMaterial() );
        floor.name = name + "_Floor";
        floor.position.x = 0.0;
        floor.position.y = -0.005;
        floor.rotation.x = -Math.PI / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, floor, group ) );
        group.children.push( floor );
		floor.parent = group;

         // Ceiling
        const ceiling = new THREE.Mesh( new THREE.PlaneGeometry(width, length), new THREE.MeshStandardMaterial() );
        ceiling.name = name + "_Ceiling";
        ceiling.position.x = 0.0;
        ceiling.position.y = 2.3;
        ceiling.rotation.x = Math.PI / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, ceiling, group ) );
        group.children.push( ceiling );
		ceiling.parent = group;

        this.editor.objectChanged(group);
    }

    addWall(name, x, y, z, rx, ry, rz, width, height, depth, parent) {
        const offset = 0.001; // 1mm. needed for cope with 'z-fighting'

        // Add a box for room
        const newWall = new THREE.Mesh( new THREE.BoxGeometry(width-offset, height, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        newWall.name = name + "_NewWall";
        newWall.position.x = x;
        newWall.position.y = y;
        newWall.position.z = z;
        newWall.rotation.x = rx;
        newWall.rotation.y = ry;
        newWall.rotation.z = rz;

        this.editor.execute( new AddObjectCommand( this.editor, newWall, parent ) );
    }

    addLightLamp(parent, lighttype, color) {
         // Add a group first
        const group = new THREE.Group();
		group.name = parent.name + '_light';
        group.userData.type = 'light';
        group.userData.DBid = 'n/a';

        this.editor.execute( new AddGroupCommand( this.editor, group, parent ) );

        const texture = textureHelper.get(lighttype, 1, 1);

        const y_pos = 2.28;
        const name = lighttype + '_new';

        let light_new;
        let width = 0.2;
        let length = 0.2;
        if(lighttype == 'Light1') {
            width = 0.8;
            length = 0.3;
            
            light_new = new THREE.Mesh( new THREE.PlaneGeometry(width, length), new THREE.MeshStandardMaterial( { map: texture} ));
        } else if(lighttype == 'Light2') {
            width = 0.8;
            length = 0.8;

            light_new = new THREE.Mesh( new THREE.PlaneGeometry(width, length), new THREE.MeshStandardMaterial( { map: texture} ));
        } else if(lighttype == 'Light3') {
            const radius = 0.2;

            light_new = new THREE.Mesh( new THREE.CircleGeometry(radius, 32), new THREE.MeshStandardMaterial( { map: texture} ));
        }

        light_new.name = name;
        light_new.position.y = y_pos;
        light_new.rotation.x = Math.PI / 2.0;

        group.children.push( light_new );
        light_new.parent = group;

        this.addLight(name+'_source', 0, y_pos, 0, width, length, color, group);

        this.editor.objectChanged(group);
    }

    addLight(name, xpos, ypos, zpos, width, height, color, parent) {
        // const dlight = new THREE.DirectionalLight(color, 1);
        // dlight.name = name + '_directional';
		// dlight.position.set(xpos, ypos-0.1, zpos);
		// dlight.castShadow = false; // if true, makes it too slow
        // dlight.visible = false;
        
        // parent.children.push( dlight );
		// dlight.parent = parent;

        const light = new THREE.RectAreaLight(color, 1, width, height);
        light.name = name + '_rectarea';
        light.rotation.x = Math.PI * -1.5;
		light.position.set(xpos, ypos-0.2, zpos);
		light.castShadow = false; // if true, makes it too slow
        light.visible = false;
        
        parent.children.push( light );
		light.parent = parent;
    }

    splitWallVertically(object, num, leftWidths) {
        let x = object.position.x;
        let y = object.position.y;
        let z = object.position.z;
        let ry = object.rotation.y;

        let name = object.name;

        const parameters = object.geometry.parameters;
        let width = parameters.width;
        let height = parameters.height;
        let depth = parameters.depth;

        let parent = object.parent;

        this.editor.execute( new RemoveObjectCommand( this.editor, object ) );

        const group = new THREE.Group();
		group.name = name;
        group.position.x = x;
        group.position.y = 0.0;
        group.position.z = z;
        group.rotation.y = ry;

        this.editor.execute( new AddGroupCommand( this.editor, group, parent ) );

        // Add walls
        var totalLeftWidth = 0;
        for(let i=0; i<num-1; i++) {
            const leftwidth = leftWidths[i];

            const wall = new THREE.Mesh( new THREE.BoxGeometry(leftwidth, height, depth), [  
                new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
                new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
            ] );
            wall.name = name + "_" + (i + 1);
            wall.position.x = - (width/2.0) + totalLeftWidth + (leftwidth/2.0);
            wall.position.y = y;
            wall.position.z = 0.0;

            this.editor.execute( new AddObjectCommand( this.editor, wall, group ) );

            totalLeftWidth += leftwidth;
        }

        var rightGap = width - totalLeftWidth;
        const rightWall = new THREE.Mesh( new THREE.BoxGeometry(rightGap, height, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        rightWall.name = name + "_r";
        rightWall.position.x = totalLeftWidth - ( width - rightGap ) / 2.0;
        rightWall.position.y = y;
        rightWall.position.z = 0.0;

        this.editor.execute( new AddObjectCommand( this.editor, rightWall, group ) );
    }

    splitWallHorizontally(object, num, topHeights) {
        let x = object.position.x;
        let y = object.position.y;
        let z = object.position.z;
        let ry = object.rotation.y;

        let name = object.name;

        const parameters = object.geometry.parameters;
        let width = parameters.width;
        let height = parameters.height;
        let depth = parameters.depth;

        let parent = object.parent;

        this.editor.execute( new RemoveObjectCommand( this.editor, object ) );

        const group = new THREE.Group();
		group.name = name;
        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.y = ry;

        this.editor.execute( new AddGroupCommand( this.editor, group, parent ) );

        // Add walls
        var totalTopHeight = 0;
        for(let i=0; i<num-1; i++) {
            const topHeight = topHeights[i];

            const wall = new THREE.Mesh( new THREE.BoxGeometry(width, topHeight, depth), [  
                new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
                new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
            ] );
            wall.name = name + "_" + (i + 1);
            wall.position.x = 0.0;
            wall.position.y = - (height/2.0) + totalTopHeight + (topHeight/2.0);
            wall.position.z = 0.0;

            this.editor.execute( new AddObjectCommand( this.editor, wall, group ) );

            totalTopHeight += topHeight;
        }

        var heightGap = height - totalTopHeight;
        const bottomWall = new THREE.Mesh( new THREE.BoxGeometry(width, heightGap, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        bottomWall.name = name + "_b";
        bottomWall.position.x = 0.0;
        bottomWall.position.y = totalTopHeight - ( height - heightGap ) / 2.0;
        bottomWall.position.z = 0.0;

        this.editor.execute( new AddObjectCommand( this.editor, bottomWall, group ) );
    }

    addBathtub(parent, width, length, height) {
        // Add four sides, making horizontal basis
        const offset = 0.0001; // 1mm. needed for cope with 'z-fighting'

        // Add a group first
        const group = new THREE.Group();
		const bathtubName = parent.name + "_bathtub";
        group.name = bathtubName;

        this.editor.execute( new AddGroupCommand( this.editor, group, parent ) );

        const depth = 0.1;
        // Add 4 box for bathtub
        const northWall = new THREE.Mesh( new THREE.BoxGeometry(width-offset, height, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        northWall.name = bathtubName + "_NorthSide";
        northWall.position.x = 0.0;
        northWall.position.y = height / 2.0;
        northWall.position.z = -(length - depth) / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, northWall, group ) );
        group.children.push( northWall );
		northWall.parent = group;

        const eastWall = new THREE.Mesh( new THREE.BoxGeometry(length-offset, height, depth),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        eastWall.name = bathtubName + "_EastSide";
        eastWall.position.x = (width - depth) / 2.0;
        eastWall.position.y = height / 2.0;
        eastWall.position.z = 0.0;
        eastWall.rotation.y = -Math.PI / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, eastWall, group ) );
        group.children.push( eastWall );
		eastWall.parent = group;

        const southWall = new THREE.Mesh( new THREE.BoxGeometry(width-offset, height, depth),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        southWall.name = bathtubName + "_SouthSide";
        southWall.position.x = 0.0;
        southWall.position.y = height / 2.0;
        southWall.position.z = (length - depth) / 2.0;
        southWall.rotation.y = Math.PI;

        // this.editor.execute( new AddObjectCommand( this.editor, southWall, group ) );
        group.children.push( southWall );
		southWall.parent = group;

        const west_depth = depth * 2;
        const westWall = new THREE.Mesh( new THREE.BoxGeometry(length-offset, height, west_depth),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );

        westWall.name = bathtubName + "_WestSide";
        westWall.position.x = -(width - west_depth) / 2.0;
        westWall.position.y = height / 2.0;
        westWall.position.z = 0.0;
        westWall.rotation.y = Math.PI / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, westWall, group ) );
        group.children.push( westWall );
		westWall.parent = group;

        // Consider changing to PlaneGeometry later
        const floor_height = 0.1;
        const floor = new THREE.Mesh( new THREE.BoxGeometry(width, floor_height, length),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        floor.name = bathtubName + "_Floor";
        floor.position.x = 0.0;
        floor.position.y = floor_height / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, floor, group ) );
        group.children.push( floor );
		floor.parent = group;

        this.editor.objectChanged(group);
    }

    addBathroomSink(parent) {
        // Add a group first
        const group = new THREE.Group();
		const bathroomSinkName = parent.name + "_sink";
        group.name = bathroomSinkName;

        this.editor.execute( new AddGroupCommand( this.editor, group, parent ) );

        const con = new THREE.Mesh( new THREE.ConeGeometry(0.3, 0.3, 8, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial( {color: 0xffffff, side : THREE.DoubleSide} ) );
        con.name = bathroomSinkName + "_con";
        con.position.y = 1.0;
        con.rotation.z = Math.PI;
        
        group.children.push( con );
        con.parent = group;

        const stand = new THREE.Mesh( new THREE.BoxGeometry(0.6, 0.3, 0.1), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        stand.name = bathroomSinkName + "_stand";
        stand.position.y = 1.0;
        stand.position.x = 0.05;
        stand.rotation.y = Math.PI / 2.0;

        group.children.push( stand );
        stand.parent = group;

        this.editor.objectChanged(group);
    }

    addToilet(parent) {
        // Add a group first
        const group = new THREE.Group();
		const bathroomSinkName = parent.name + "_toilet";
        group.name = bathroomSinkName;

        this.editor.execute( new AddGroupCommand( this.editor, group, parent ) );

        const cyl = new THREE.Mesh( new THREE.CylinderGeometry(0.1, 0.2, 0.6, 20, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial( {color: 0xffffff, side : THREE.DoubleSide} ) );
        cyl.name = bathroomSinkName + "_cyl";
        cyl.position.y = 0.6;
        cyl.rotation.z = Math.PI;
        
        group.children.push( cyl );
        cyl.parent = group;

        const stand = new THREE.Mesh( new THREE.BoxGeometry(0.6, 0.8, 0.1), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        stand.name = bathroomSinkName + "_stand";
        stand.position.y = 0.7;
        stand.position.x = 0.05;
        stand.rotation.y = Math.PI / 2.0;

        group.children.push( stand );
        stand.parent = group;

        const bottom = new THREE.Mesh( new THREE.BoxGeometry(0.3, 0.3, 0.3), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        bottom.name = bathroomSinkName + "_bottom";
        bottom.position.y = 0.15;
        bottom.position.x = -0.05;

        group.children.push( bottom );
        bottom.parent = group;

        this.editor.objectChanged(group);
    }

    addKitchenSink(parent, name, width, length, height) {
        const group = new THREE.Group();
        group.name = name;

        this.editor.execute( new AddGroupCommand( this.editor, group, parent ) );


        const depth = 0.1;

        const upPanel = new THREE.Mesh( new THREE.BoxGeometry(width-offset, depth, length), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        upPanel.name = name + "_sinkUpPanel";
        upPanel.position.y = height + 0.05;
        upPanel.position.x = 0.0;

        this.editor.execute( new AddObjectCommand( this.editor, upPanel, group ) );
        upPanel.parent = group;

        const front = new THREE.Mesh( new THREE.BoxGeometry(width, height, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        front.name = name + "_sinkFront";
        front.position.y = height / 2.0;
        front.position.z = (length - depth) / 2.0;

        this.editor.execute( new AddObjectCommand( this.editor, front, group ) );
        front.parent = group;

        const east = new THREE.Mesh( new THREE.BoxGeometry(length-offset, height, depth), [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        east.name = name + "_sinkEast";
        east.position.x = (width - depth) / 2.0;
        east.position.y = height / 2.0;
        east.position.z = 0.0;
        east.rotation.y = -Math.PI / 2.0;

        this.editor.execute( new AddObjectCommand( this.editor, east, group ) );
        east.parent = group;

        const west = new THREE.Mesh( new THREE.BoxGeometry(length-offset, height, depth),  [  
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(),
            new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial(), new THREE.MeshStandardMaterial()
        ] );
        west.name = name + "_sinkWest";
        west.position.x = -(width - depth) / 2.0;
        west.position.y = height / 2.0;
        west.position.z = 0.0;
        west.rotation.y = Math.PI / 2.0;

        // this.editor.execute( new AddObjectCommand( this.editor, west, group ) );
        group.children.push( west );
		west.parent = group;

        this.editor.objectChanged(group)
    }

    addPlane(parent, type, width, height, xrotation) {
        let name = 'Ceiling';
        if(type == 'floor')
            name = 'Floor';
        const plane = new THREE.Mesh( new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial() );
        plane.name = name;
        plane.position.x = 0.0;
        if(type == 'floor') {
            plane.position.y = -0.01;
            plane.rotation.x = -Math.PI / 2.0;
        } else {
            plane.position.y = 2.3;
            plane.rotation.x = Math.PI / 2.0;
        }
        plane.position.z = 0.0;

        this.editor.execute( new AddObjectCommand( this.editor, plane, parent ) );
		plane.parent = parent;

        this.editor.objectChanged(plane)
    }

    addFloor(parent, width, length, yPosition = -0.005) {
        if (!parent) {
            console.warn("addFloor 호출 시 parent가 null입니다. Floor는 생성되지 않습니다.");
            return; // parent가 없으면 floor 생성하지 않고 종료
        }

        // Floor 생성
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(width, length),
            undefined // material은 editor에서 자동 선택되도록
        );

        // 이름은 parent 이름을 참고하거나 기본 "Floor"
        const parentName = parent.name ? parent.name : "Room";
        floor.name = parentName + "_Floor";

        // 위치 설정
        floor.position.set(0, yPosition, 0);
        floor.rotation.x = -Math.PI / 2;

        // 씬에 추가
        this.editor.execute(new AddObjectCommand(this.editor, floor, parent));
        floor.parent = parent;

        this.editor.execute(new AddObjectCommand(this.editor, floor, this.editor.scene));

    }

}
