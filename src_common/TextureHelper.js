import * as THREE from 'three';

class TextureHelper {
	constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.mapTexture = new Map();
        this.mapImage = new Map();

        this.allMap = new Map([
            ['Floor', './textures/floor.jpg'], ['Ceiling', './textures/ceiling.jpg'], ['Window', './textures/window.jpg'],
            ['SmallWindow', './textures/swindow.jpg'], ['InternalWindow', './textures/internalWindow.jpg'], ['RoomFloor', './textures/roomfloor.jpg'],
            ['Wallpaper1', './textures/wallpaper1.jpg'], ['PointWall', './textures/pointwall.jpg'], ['Tile', './textures/tile.jpg'],
            ['KitchenTile', './textures/kitchentile1.jpg'], ['DoorLeft', './textures/doorL.jpg'], ['DoorRight', './textures/doorR.jpg'],
            ['FrontDoorLeft', './textures/frontdoorL.jpg'], ['FrontDoorRight', './textures/frontdoorR.jpg'], ['Wood', './textures/wood.jpg'],
            ['Mattress', './textures/mattress.jpg'], ['Concrete', './textures/concrete.jpg'], ['GlassDoorLeft', './textures/glassDoorL.jpg'],
            ['GlassDoorRight', './textures/glassDoorR.jpg'], ['PinkPlastic', './textures/pinkPlastic.jpg'], ['PointWall2', './textures/pointwall2.jpg'],
            ['BalconyTile', './textures/balconytile.jpg'], ['KitchenSink', './textures/KitchenSink.jpg'], ['Marble', './textures/marble.jpg'],
            ['DrawerDoorLeft', './textures/drawerDoorL.jpg'], ['DrawerDoorRight', './textures/drawerDoorR.jpg'], ['GasRange2Burner', './textures/2burnerGasRange.jpg'],
            ['GasRange3Burner', './textures/3burnerGasRange.jpg'], ['GasRange4Burner', './textures/4burnerGasRange.jpg'],
            ['Light1', './textures/light1.jpg'], ['Light2', './textures/light2.jpg'], ['Light3', './textures/light3.jpg'], 
            ['BlackMetal', './textures/blackmetal.jpg'], ['TV', './textures/tv.jpg'], ['FridgeInside', './textures/fridgeInternal.jpg'], 
            ['FridgeInside2', './textures/fridgeInternal2.jpg'], ['FreezerInside', './textures/freezerInternal.jpg'], ['Black', './textures/black.jpg'],
            ['FridgeDoorL', './textures/fridgeDoorL.jpg'], ['FridgeDoorR', './textures/fridgeDoorR.jpg'], ['Shiny', './textures/shiny.jpg'],
            ['Glass', './textures/glass.jpg'], ['WhiteWood', './textures/whitewood.jpg'], ['WhitePlastic', './textures/whitePlastic.jpg'], 
            ['DrawerDoorFront', './textures/drawerFront.jpg'], ['DrumMachineFront', './textures/drummachine_front.jpg'], ['WashingMachineBack', './textures/drummachine_back.jpg'], 
            ['WashingMachineLeft', './textures/drummachine_left.jpg'], ['WashingMachineRight', './textures/drummachine_right.jpg'], ['TopLoading', './textures/topLoading.jpg'], 
            ['Leather', './textures/leather.jpg'], ['Fabric', './textures/wool.jpg'], ['BlackFabric', './textures/blackfarbic.jpg'],
            ['GreyPlastic', './textures/greyPlastic.jpg'], ['AC', './textures/AC.jpg'], ['ACside', './textures/ACside.jpg'], 
            ['DrawerInside', './textures/drawerInside.jpg'],['WallAC', './textures/WallAC.jpg'], ['Fire', './textures/Fire.png'],
            ['Laundry', './textures/laundry.jpg'], ['Vacuum', './textures/vacuum.jpg'], ['Skin1', './textures/skin1.jpg'], ['Hand', './textures/hand.png'],
            ['Skin2', './textures/skin2.jpg'], ['Skin3', './textures/skin3.jpg'], ['Skin4', './textures/skin4.jpg'], ['Mirror', './textures/mirror.jpg'],
            ['CityView', './backgrounds/cityview.jpg'], ['Downtown', './backgrounds/downtown.jpg'], ['Romania', './backgrounds/romania.jpg']
            
        ]);
	}

    getFilepath(name) {
        return this.allMap.get(name);
    }
	
	get(name, repeatX, repeatY) {
        let textureName = name + "_" + repeatX + "_" + repeatY;
        if(this.mapTexture.has(textureName))
            return this.mapTexture.get(textureName);

        let texture;
        if(this.mapImage.has(name)) {
            texture = this.mapImage.get(name).clone();
        } else {
            texture = this.textureLoader.load(this.allMap.get(name));
        }

        this.mapImage.set(name, texture);

        texture.name = textureName;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        this.mapTexture.set(textureName, texture);

        return texture;
	}
}

export const textureHelper = new TextureHelper();