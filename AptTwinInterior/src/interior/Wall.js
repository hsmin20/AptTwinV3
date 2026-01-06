import * as THREE from 'three';

import { SetMaterialMapCommand } from '../../../src_common/commands/SetMaterialMapCommand.js';

import { textureHelper } from '../../../src_common/TextureHelper.js';

export class Wall {

    static add_Internal(editor, ObjectType, whichside) {
        let object = editor.selected;
        let materials = object.material;

        let index = 4;
        if(whichside == 'outside') {
            index = 5;
        }

        let newMaps = [];
        for(let i=0; i<6; i++) {
            if(i != index) {
                newMaps.push(materials[i]['map'] );
            } else {
                const repeatX = materials[i]['map'].repeat.x;
                const repeatY = materials[i]['map'].repeat.y;

                const texture = textureHelper.get(ObjectType, repeatX, repeatY);
                if ( texture !== null ) {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    materials.needsUpdate = true;
                }

                materials[index].dispose();
                newMaps.push(texture);
            }
        }

        editor.execute( new SetMaterialMapCommand( editor, object, 'map', newMaps ) );
        
        editor.objectChanged( object );
    }

    static add(editor) {
        const _html = `
            <dialog id="ObjectTypeDialog">
            <form>
                <p>
                <label>
                    <h2>Wallpaper Type</h2>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./textures/wallpaper1.jpg" alt="wallpaper1" width="60" height="40">
                        <input type="radio" name="ObjectType" id="wallpaper1" value="Wallpaper1" checked/>Type 1
                    </div>
                    </div>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./textures/pointwall.jpg" alt="pointwall" width="60" height="40">
                        <input type="radio" name="ObjectType" id="pointwall" value="PointWall"/>Type 2
                    </div>
                    </div>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./textures/pointwall2.jpg" alt="pointwall2" width="60" height="40">
                        <input type="radio" name="ObjectType" id="pointwall2" value="PointWall2"/>Type 3
                    </div>
                    </div>
                </label>
                </p>
                <div class="clearfix"></div>
                <p>
                <label>
                    <h2>Which side</h2>
                    <div class="responsive">
                    <div class="gallery">
                        <input type="radio" name="whichside" id="inside" value="inside" checked/>inside
                    </div>
                    </div>
                    <div class="responsive">
                    <div class="gallery">
                        <input type="radio" name="whichside" id="outside" value="outside"/>outside
                    </div>
                    </div>
                </label>
                <div class="clearfix"></div>
                <div>
                <p>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Apply</button>
                </p>
                </div>
            </form>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const ObjectTypeDialog = document.getElementById("ObjectTypeDialog");

        const confirmBtn = ObjectTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        ObjectTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // ObjectTypeDialog.close(); // Have to send the select box value here.
            const ObjectType = document.querySelector('input[name=ObjectType]:checked').value;
            const whichside = document.querySelector('input[name=whichside]:checked').value;

            document.body.removeChild(dialog)
            
            this.add_Internal(editor, ObjectType, whichside);
        });

        ObjectTypeDialog.showModal();
    }

}