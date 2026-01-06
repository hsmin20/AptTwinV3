import * as THREE from 'three';
import { UIPanel, UIRow, UIHorizontalRule } from '../../src_common/libs/ui.js';

import { RemoveObjectCommand } from '../../src_common/commands/RemoveObjectCommand.js';

import { RoomBuilder } from './RoomBuilder.js';


export class MenubarEdit {
    constructor( editor ) {
        const self = this;
        const editorscope = editor;

        this.roomBuilder = editor.roomBuilder;

        this.container = new UIPanel();
        this.container.setClass( 'menu' );

        const title = new UIPanel();
        title.setClass( 'title' );
        title.setTextContent( 'Edit' );
        this.container.add( title );

        const options = new UIPanel();
        options.setClass( 'options' );
        this.container.add( options );

        let option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Env Light' );
        option.onClick( function () {
            self.addTHREELight(editorscope);
        } );
        options.add( option );

        // option = new UIRow();
        // option.setClass( 'option' );
        // option.setTextContent( 'Add a Room' );
        // option.onClick( function () {
        //     self.addRoom(editorscope);
        // } );
        // options.add( option );

        // option = new UIRow();
        // option.setClass( 'option' );
        // option.setTextContent( 'Add a Plane' );
        // option.onClick( function () {
        //     self.addFloor(editorscope);
        // } );
        // options.add( option );

        options.add( new UIHorizontalRule() );

        // Room
        // const roomSubmenuTitle = new UIRow().setTextContent( 'Room' ).addClass( 'option' ).addClass( 'submenu-title' );
        // roomSubmenuTitle.onMouseOver( function () {
        //     const { top, right } = roomSubmenuTitle.dom.getBoundingClientRect();
        //     const { paddingTop } = getComputedStyle( this.dom );
        //     roomSubmenu.setLeft( right + 'px' );
        //     roomSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
        //     roomSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
        //     roomSubmenu.setDisplay( 'block' );
        // } );
        // roomSubmenuTitle.onMouseOut( function () {
        //     roomSubmenu.setDisplay( 'none' );
        // } );
        // options.add( roomSubmenuTitle );

        // const roomSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        // roomSubmenuTitle.add( roomSubmenu );

        // option = new UIRow();
        // option.setClass( 'option' );
        // option.setTextContent( 'Add a Wall' );
        // option.onClick( function () {
        //     if(editorscope.selected == null) {
        //         alert('Select an item first');
        //         return;
        //     }

        //     if(editorscope.selected.type != 'Group') {
        //         alert('Select a Group');
        //         return;
        //     }
        //     self.addWall(editorscope);
        // } );
        // roomSubmenu.add( option );

        // option = new UIRow();
        // option.setClass( 'option' );
        // option.setTextContent( 'Add a Light' );
        // option.onClick( function () {
        //     if(editorscope.selected == null) {
        //         alert('Select an item first');
        //         return;
        //     }

        //     if(editorscope.selected.type != 'Group') {
        //         alert('Select a Group');
        //         return;
        //     }
        //     self.addLight(editorscope);
        // } );
        // roomSubmenu.add( option );

        // options.add( new UIHorizontalRule() );

        // Bathroom
        const bathroomSubmenuTitle = new UIRow().setTextContent( 'Bathroom' ).addClass( 'option' ).addClass( 'submenu-title' );
        bathroomSubmenuTitle.onMouseOver( function () {
            const { top, right } = bathroomSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            bathroomSubmenu.setLeft( right + 'px' );
            bathroomSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            bathroomSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            bathroomSubmenu.setDisplay( 'block' );
        } );
        bathroomSubmenuTitle.onMouseOut( function () {
            bathroomSubmenu.setDisplay( 'none' );
        } );
        options.add( bathroomSubmenuTitle );

        const bathroomSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        bathroomSubmenuTitle.add( bathroomSubmenu );


        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Bathtub' );
        option.onClick( function () {
            // if(editorscope.selected == null) {
            //     alert('Select an item first');
            //     return;
            // }
            // if(!editorscope.selected.name.toLowerCase().includes('bathroom')) {
            //     alert('Select a Bathroom first');
            //     return;
            // }

            self.addBathtub(editorscope);
        } );
        bathroomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Sink' );
        option.onClick( function () {
            // if(editorscope.selected == null) {
            //     alert('Select an item first');
            //     return;
            // }
            // if(!editorscope.selected.name.toLowerCase().includes('bathroom')) {
            //     alert('Select a Bathroom first');
            //     return;
            // }

            self.addBathroomSink(editorscope);
        } );
        bathroomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Toilet' );
        option.onClick( function () {
            // if(editorscope.selected == null) {
            //     alert('Select an item first');
            //     return;
            // }
            // if(!editorscope.selected.name.toLowerCase().includes('bathroom')) {
            //     alert('Select a Bathroom first');
            //     return;
            // }

            self.addToilet(editorscope);
        } );
        bathroomSubmenu.add( option );

        options.add( new UIHorizontalRule() );

        // Kitchen
        const kitchenSubmenuTitle = new UIRow().setTextContent( 'Kitchen' ).addClass( 'option' ).addClass( 'submenu-title' );
        kitchenSubmenuTitle.onMouseOver( function () {
            const { top, right } = kitchenSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            kitchenSubmenu.setLeft( right + 'px' );
            kitchenSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            kitchenSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            kitchenSubmenu.setDisplay( 'block' );

        } );
        kitchenSubmenuTitle.onMouseOut( function () {

            kitchenSubmenu.setDisplay( 'none' );

        } );
        options.add( kitchenSubmenuTitle );

        const kitchenSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        kitchenSubmenuTitle.add( kitchenSubmenu );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Sink or Range' );
        option.onClick( function () {
            // if(editorscope.selected == null) {
            //     alert('Select an item first');
            //     return;
            // }
            // if(!editorscope.selected.name.toLowerCase().includes('kitchen')) {
            //     alert('Select a Kitchen first');
            //     return;
            // }

            self.addKitchenSink(editorscope);
        } );
        kitchenSubmenu.add( option );

        options.add( new UIHorizontalRule() );

        // Split
        // const splitSubmenuTitle = new UIRow().setTextContent( 'Split' ).addClass( 'option' ).addClass( 'submenu-title' );
        // splitSubmenuTitle.onMouseOver( function () {
        //     const { top, right } = splitSubmenuTitle.dom.getBoundingClientRect();
        //     const { paddingTop } = getComputedStyle( this.dom );
        //     splitSubmenu.setLeft( right + 'px' );
        //     splitSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
        //     splitSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
        //     splitSubmenu.setDisplay( 'block' );

        // } );
        // splitSubmenuTitle.onMouseOut( function () {

        //     splitSubmenu.setDisplay( 'none' );

        // } );
        // options.add( splitSubmenuTitle );

        // const splitSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        // splitSubmenuTitle.add( splitSubmenu );

        // option = new UIRow();
        // option.setClass( 'option' );
        // option.setTextContent( 'Vertically' );
        // option.onClick( function () {
        //     if(editorscope.selected == null) {
        //         alert('Select an item first');
        //         return;
        //     }
        //     if(!editorscope.selected.isMesh) {
        //         alert('Select a Mesh with Box Geometry');
        //         return;
        //     }

        //     self.splitVertically(editorscope);
        // } );
        // splitSubmenu.add( option );

        // option = new UIRow();
        // option.setClass( 'option' );
        // option.setTextContent( 'Horizontally' );
        // option.onClick( function () {
        //     if(editorscope.selected == null) {
        //         alert('Select an item first');
        //         return;
        //     }
        //     if(!editorscope.selected.isMesh) {
        //         alert('Select a Mesh with Box Geometry');
        //         return;
        //     }

        //     self.splitHorizontally(editorscope);
        // } );
        // splitSubmenu.add( option );

        // options.add( new UIHorizontalRule() );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Remove' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if (confirm('Are you sure you want to remove this item?')) {
                const object = editorscope.selected;
                if ( object !== null && object.parent !== null ) {
                    editorscope.execute( new RemoveObjectCommand( editorscope, object ) );
                }  
            }
        } );
        options.add( option );
    }

    addTHREELight(editor) {
        const _html = `
            <dialog id="addLightDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add a THREE Light</h1>
                        <p>Name : <input type="text" id="lightName" name="lightName" value="mylight"> </p>
                        <p><input type="radio" id="Ambient" name="light" value="Ambient" checked>Ambient</p>
                        <p><input type="radio" id="Directional" name="light" value="Directional">Directional</p>
                        <p><input type="radio" id="Hemisphere" name="light" value="Hemisphere">Hemisphere</p>
                        <p><input type="radio" id="Point" name="light" value="Point">Point</p>
                        <p><input type="radio" id="RectArea" name="light" value="RectArea">RectArea</p>
                        <p><input type="radio" id="Spot" name="light" value="Spot">Spot</p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addLightDialog = document.getElementById("addLightDialog");
        const confirmBtn = addLightDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addLightDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            const name = document.getElementById("lightName").value;
            var lighttype = document.querySelector('input[name=light]:checked').value;
            document.body.removeChild(dialog)
            
            this.roomBuilder.addTHREELight(name, lighttype);
        });

        addLightDialog.showModal();
    }

    addRoom(editor) {
        const _html = `
            <dialog id="addRoomDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add a Room, Kitchen, etc.</h1>
                        <p>Name : <input type="text" id="partName" name="partName" value="Room1"> </p>
                        <p>Width : <input type="text" id="partWidth" name="partWidth" value="3.7"> </p>
                        <p>Length : <input type="text" id="partLength" name="partLength" value="2.7"> </p>
                        <p>Height : <input type="text" id="partHeight" name="partHeight" value="2.3"> </p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addRoomDialog = document.getElementById("addRoomDialog");
        const inputNameBox = document.getElementById("partName");
        const inputWidthBox = document.getElementById("partWidth");
        const inputLengthBox = document.getElementById("partLength");
        const inputHeightBox = document.getElementById("partHeight");
        const confirmBtn = addRoomDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addRoomDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            var name = inputNameBox.value;
            var width = parseFloat(inputWidthBox.value);
            var length = parseFloat(inputLengthBox.value);
            var height = parseFloat(inputHeightBox.value);

            document.body.removeChild(dialog)
            
            // addRoomDialog.close(); // Have to send the select box value here.
            this.roomBuilder.addRoom(name, width, length, height);
        });

        addRoomDialog.showModal();
    }

    addWall(editor) {
        const _html = `
            <dialog id="addWallDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add a Wall</h1>
                        <p>Name : <input type="text" id="partName" name="partName" value="Wall"> </p>
                        <p>Position x : <input type="text" id="partX" name="partX" value="0.0" size="3"> 
                                    y : <input type="text" id="partY" name="partY" value="0.0" size="3"> 
                                    z : <input type="text" id="partZ" name="partZ" value="0.0"  size="3"> </p>
                        <p>Rotation rx : <input type="text" id="partRX" name="partRX" value="0.0" size="3"> 
                                    ry : <input type="text" id="partRY" name="partRY" value="0.0" size="3"> 
                                    rz : <input type="text" id="partRZ" name="partRZ" value="0.0"  size="3"> </p>
                        <p>Width : <input type="text" id="partWidth" name="partWidth" value="3.7"> </p>
                        <p>Height : <input type="text" id="partHeight" name="partHeight" value="2.3"> </p>
                        <p>Depth : <input type="text" id="partDepth" name="partDepth" value="0.2" > </p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addWallDialog = document.getElementById("addWallDialog");
        const inputNameBox = document.getElementById("partName");

        const inputXBox = document.getElementById("partX");
        const inputYBox = document.getElementById("partY");
        const inputZBox = document.getElementById("partZ");

        const inputRXBox = document.getElementById("partRX");
        const inputRYBox = document.getElementById("partRY");
        const inputRZBox = document.getElementById("partRZ");

        const inputWidthBox = document.getElementById("partWidth");
        const inputHeightBox = document.getElementById("partHeight");
        const inputDepthBox = document.getElementById("partDepth");
        
        const confirmBtn = addWallDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addWallDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            var name = inputNameBox.value;
            var x = parseFloat(inputXBox.value);
            var y = parseFloat(inputYBox.value);
            var z = parseFloat(inputZBox.value);
            var rx = parseFloat(inputRXBox.value);
            var ry = parseFloat(inputRYBox.value);
            var rz = parseFloat(inputRZBox.value);
            var width = parseFloat(inputWidthBox.value);
            var height = parseFloat(inputHeightBox.value);
            var depth = parseFloat(inputDepthBox.value);

            document.body.removeChild(dialog)
            
            // addRoomDialog.close(); // Have to send the select box value here.
            var parent = editor.selected;
            this.roomBuilder.addWall(name, x, y, z, rx, ry, rz, width, height, depth, parent);
        });

        addWallDialog.showModal();
    }

    addLight(editor) {
        const _html = `
            <dialog id="lightTypeDialog">
            <form>
                <p>
                <label>
                    <h2>Add a Light</h2>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./textures/light1.jpg" alt="light1" width="60" height="40">
                        <input type="radio" name="lighttype" id="light1" value="Light1" checked/>Type 1
                    </div>
                    </div>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./textures/light2.jpg" alt="light2" width="60" height="40">
                        <input type="radio" name="lighttype" id="light2" value="Light2"/>Type 2
                    </div>
                    </div>
                    <div class="responsive">
                    <div class="gallery">
                        <img src="./textures/light3.jpg" alt="light3" width="60" height="40">
                        <input type="radio" name="lighttype" id="light3" value="Light3"/>Type 3
                    </div>
                </label>
                </p>
                <div class="clearfix"></div>
                <p>Color : <input type="text" id="color" name="color" value="0xFFFFFF"></p>
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

        const lightTypeDialog = document.getElementById("lightTypeDialog");

        const colorBox = document.getElementById("color");

        const confirmBtn = lightTypeDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        lightTypeDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form
            
            // lightTypeDialog.close(); // Have to send the select box value here.
            var parent = editor.selected;
            const lighttype = document.querySelector('input[name=lighttype]:checked').value;
            const color = parseInt(colorBox.value);

            document.body.removeChild(dialog)
            
            this.roomBuilder.addLightLampInRoom(parent, lighttype, color);
        });

        lightTypeDialog.showModal();
    }

    addFloor(editor) {
        const parent = editor.selected;

        if (!parent) {
            alert("Floor를 추가하려면 먼저 Room을 선택하세요.");
            return; // parent 없으면 다이얼로그도 안 띄움
        }

        // parent가 존재하면 기존 다이얼로그 생성 코드 실행
        const _html = `
            <dialog id="addFloorDialog">
                <form>
                    <p>
                        <label>
                            <h1>Add a Floor</h1>
                            <p>Width : <input type="text" id="floorWidth" name="floorWidth" value="5.0"> </p>
                            <p>Length : <input type="text" id="floorLength" name="floorLength" value="7.0"> </p>
                        </label>
                    </p>
                    <div>
                        <button value="cancel" formmethod="dialog">Cancel</button>
                        <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
        `;

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog);

        const addFloorDialog = document.getElementById("addFloorDialog");
        const inputWidthBox = document.getElementById("floorWidth");
        const inputLengthBox = document.getElementById("floorLength");
        const confirmBtn = addFloorDialog.querySelector("#confirmBtn");

        // Close dialog and remove from DOM
        addFloorDialog.addEventListener("close", () => {
            document.body.removeChild(dialog);
        });

        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault();

            const width = parseFloat(inputWidthBox.value);
            const length = parseFloat(inputLengthBox.value);

            document.body.removeChild(dialog);

            // roomBuilder.addFloor 메서드 호출
            this.roomBuilder.addFloor(parent, width, length);
        });

        addFloorDialog.showModal();
    }

    addBathtub(editor) {
        const _html = `
            <dialog id="addBathtubDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add a Bathtub.</h1>
                        <p>Width is a longer side, Length is a shorter side. Use it with rotation later.</p>
                        <p>Width : <input type="text" id="bathtubWidth" name="bathtubWidth" value="1.2"> </p>
                        <p>Length : <input type="text" id="bathtubLength" name="bathtubLength" value="0.5"> </p>
                        <p>Height : <input type="text" id="bathtubHeight" name="bathtubHeight" value="0.8"> </p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addBathtubDialog = document.getElementById("addBathtubDialog");
        const bathtubWidthBox = document.getElementById("bathtubWidth");
        const bathtubLengthBox = document.getElementById("bathtubLength");
        const bathtubHeightBox = document.getElementById("bathtubHeight");
        const confirmBtn = addBathtubDialog.querySelector("#confirmBtn");

        let editorscope = editor;

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addBathtubDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            // var object = editor.selected;
            var width = parseFloat(bathtubWidthBox.value);
            var length = parseFloat(bathtubLengthBox.value);
            var height = parseFloat(bathtubHeightBox.value);

            document.body.removeChild(dialog)
            
            // addBathtubDialog.close(); // Have to send the select box value here.
            this.roomBuilder.addBathtub(/*object,*/ width, length, height);
        });

        addBathtubDialog.showModal();
    }

    addBathroomSink(editor) {
        this.roomBuilder.addBathroomSink(editor.selected);
    }

    addToilet(editor) {
        this.roomBuilder.addToilet(editor.selected);
    }

    addKitchenSink(editor) {
        const _html = `
            <dialog id="addKitchenSinkDialog">
                <form>
                    <p>
                    <label>
                        <h1>Add a Kitchen Sink.</h1>
                        <p>Name : <input type="text" id="name" name="name" value="KitchenSink"> </p>
                        <p>Width is a longer side, Length is a shorter side. Use it with rotation later.</p>
                        <p>Width : <input type="text" id="width" name="width" value="2.5"> </p>
                        <p>Length : <input type="text" id="length" name="length" value="0.8"> </p>
                        <p>Height : <input type="text" id="height" name="height" value="1.0"> </p>
                    </label>
                    </p>
                    <div>
                    <button value="cancel" formmethod="dialog">Cancel</button>
                    <button id="confirmBtn" value="default">Add</button>
                    </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const addKitchenSinkDialog = document.getElementById("addKitchenSinkDialog");
        const inputNameBox = document.getElementById("name");
        const widthBox = document.getElementById("width");
        const lengthBox = document.getElementById("length");
        const heightBox = document.getElementById("height");
        const confirmBtn = addKitchenSinkDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        addKitchenSinkDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            var name = inputNameBox.value;;
            var object = editor.selected;
            var width = parseFloat(widthBox.value);
            var length = parseFloat(lengthBox.value);
            var height = parseFloat(heightBox.value);

            document.body.removeChild(dialog)
            
            // addKitchenSinkDialog.close(); // Have to send the select box value here.
            this.roomBuilder.addKitchenSink(object, name, width, length, height);
        });

        addKitchenSinkDialog.showModal();
    }

    splitVertically(editor) {
        const _html = `
            <dialog id="splitWallVDialog">
                <form>
                <p>
                <label>
                    <h1>Split a Wall Vertically</h1>
                    <h2>North Wall is the basis and other walls are rotated clockwise.</h2>
                </label>
                </p>
                <p>
                <label for="howmany">Split to </label>
                <select name="howmany" id="howmany" >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                </p>
                <p id="lw1">Left width 1 : <input type="text" id="leftWidth1" name="leftWidth1" value="0.5"> </p>
                <p id="lw2">Left width 2 : <input type="text" id="leftWidth2" name="leftWidth2" value="1.0"> </p>
                <p id="lw3">Left width 3 : <input type="text" id="leftWidth3" name="leftWidth3" value="1.0"> </p>
                <p id="lw4">Left width 4 : <input type="text" id="leftWidth4" name="leftWidth4" value="1.0"> </p>

                <div>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Confirm</button>
                </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const splitWallVDialog = document.getElementById("splitWallVDialog");

        const howmanySelect = document.getElementById("howmany");
        const leftWidth1Box = document.getElementById("lw1");
        const leftWidth2Box = document.getElementById("lw2");
        const leftWidth3Box = document.getElementById("lw3");
        const leftWidth4Box = document.getElementById("lw4");
        const boxes = [];
        boxes.push(leftWidth1Box, leftWidth2Box, leftWidth3Box, leftWidth4Box);
        const confirmBtn = splitWallVDialog.querySelector("#confirmBtn");

        leftWidth2Box.style.visibility = "hidden";
        leftWidth3Box.style.visibility = "hidden";
        leftWidth4Box.style.visibility = "hidden";

        howmanySelect.addEventListener("change", (event) => {
            const num = parseInt(howmanySelect.value);

            if(num == 2) {
                leftWidth2Box.style.visibility = "hidden";
                leftWidth3Box.style.visibility = "hidden";
                leftWidth4Box.style.visibility = "hidden";
            } else if(num == 3) {
                leftWidth2Box.style.visibility = "visible";
                leftWidth3Box.style.visibility = "hidden";
                leftWidth4Box.style.visibility = "hidden";
            } else if(num == 4) {
                leftWidth2Box.style.visibility = "visible";
                leftWidth3Box.style.visibility = "visible";
                leftWidth4Box.style.visibility = "hidden";
            } else if(num == 5) {
                leftWidth2Box.style.visibility = "visible";
                leftWidth3Box.style.visibility = "visible";
                leftWidth4Box.style.visibility = "visible";
            }
        });

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        splitWallVDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            let object = editor.selected;

            const num = parseInt(howmanySelect.value);
            var leftWidth1 = parseFloat(document.getElementById("leftWidth1").value);
            var leftWidth2 = parseFloat(document.getElementById("leftWidth2").value);
            var leftWidth3 = parseFloat(document.getElementById("leftWidth3").value);
            var leftWidth4 = parseFloat(document.getElementById("leftWidth4").value);

            document.body.removeChild(dialog)
            
            // splitWallVDialog.close(); // Have to send the select box value here.
            this.roomBuilder.splitWallVertically(object, num, [ leftWidth1, leftWidth2, leftWidth3, leftWidth4 ]);
        });

        splitWallVDialog.showModal();
    }

    splitHorizontally(editor) {
        const _html = `
            <dialog id="splitWallHDialog">
                <form>
                <p>
                <label>
                    <h1>Split a Wall Horizontally (from Bottom)</h1>
                    <h2>North Wall is the basis and other walls are rotated clockwise.</h2>
                </label>
                </p>
                <p>
                <label for="howmany">Split to </label>
                <select name="howmany" id="howmany" >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                </p>
                <p id="bh1">Bottom height 1 : <input type="text" id="bottomHeight1" name="bottomHeight1" value="0.5"> </p>
                <p id="bh2">Bottom height 2 : <input type="text" id="bottomHeight2" name="bottomHeight2" value="1.0"> </p>
                <p id="bh3">Bottom height 3 : <input type="text" id="bottomHeight3" name="bottomHeight3" value="1.0"> </p>
                <p id="bh4">Bottom height 4 : <input type="text" id="bottomHeight4" name="bottomHeight4" value="1.0"> </p>

                <div>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Confirm</button>
                </div>
                </form>
            </dialog>
    `

        const dom = new DOMParser().parseFromString(_html, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const splitWallHDialog = document.getElementById("splitWallHDialog");

        const howmanySelect = document.getElementById("howmany");
        const bottomHeight1Box = document.getElementById("bh1");
        const bottomHeight2Box = document.getElementById("bh2");
        const bottomHeight3Box = document.getElementById("bh3");
        const bottomHeight4Box = document.getElementById("bh4");
        const boxes = [];
        boxes.push(bottomHeight1Box, bottomHeight2Box, bottomHeight3Box, bottomHeight4Box);
        const confirmBtn = splitWallHDialog.querySelector("#confirmBtn");

        bottomHeight2Box.style.visibility = "hidden";
        bottomHeight3Box.style.visibility = "hidden";
        bottomHeight4Box.style.visibility = "hidden";

        howmanySelect.addEventListener("change", (event) => {
            const num = parseInt(howmanySelect.value);

            if(num == 2) {
                bottomHeight2Box.style.visibility = "hidden";
                bottomHeight3Box.style.visibility = "hidden";
                bottomHeight4Box.style.visibility = "hidden";
            } else if(num == 3) {
                bottomHeight2Box.style.visibility = "visible";
                bottomHeight3Box.style.visibility = "hidden";
                bottomHeight4Box.style.visibility = "hidden";
            } else if(num == 4) {
                bottomHeight2Box.style.visibility = "visible";
                bottomHeight3Box.style.visibility = "visible";
                bottomHeight4Box.style.visibility = "hidden";
            } else if(num == 5) {
                bottomHeight2Box.style.visibility = "visible";
                bottomHeight3Box.style.visibility = "visible";
                bottomHeight4Box.style.visibility = "visible";
            }
        });

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        splitWallHDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            let object = editor.selected;

            const num = parseInt(howmanySelect.value);
            var bottomHeight1 = parseFloat(document.getElementById("bottomHeight1").value);
            var bottomHeight2 = parseFloat(document.getElementById("bottomHeight2").value);
            var bottomHeight3 = parseFloat(document.getElementById("bottomHeight3").value);
            var bottomHeight4 = parseFloat(document.getElementById("bottomHeight4").value);

            document.body.removeChild(dialog)
            
            // splitWallHDialog.close(); // Have to send the select box value here.
            this.roomBuilder.splitWallHorizontally(object, num, [ bottomHeight1, bottomHeight2, bottomHeight3, bottomHeight4 ]);
        });

        splitWallHDialog.showModal();
    }

}
