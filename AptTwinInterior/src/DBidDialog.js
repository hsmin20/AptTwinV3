import { saveState } from "./AptTwinInterior";

function createLights(editor) {
    let lightArray = [];
    const scene = editor.scene;
    scene.traverse(function(object) {
        if(object.userData.DBid != undefined && object.userData.type != undefined) {
            if(object.userData.type == 'light') {
                lightArray.push(object);
            }
        }
    });

    let _html = `<p><label>
                <h2>Add a DB id for Lights</h2>
                `;

    for(let i=0; i<lightArray.length; i++) {
        const light = lightArray[i];
        const name = light.name;
        const uuid = light.uuid;
        const dbid = light.userData.DBid;

        const __html = `<p>` + name + `
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="3"></p> 
        `;

        _html += __html;
    }

    _html += `</label></p>`;

    return _html;
}

function createDoors(editor) {
    let doorArray = [];
    const scene = editor.scene;
    scene.traverse(function(object) {
        if (object.userData.DBid != undefined && object.userData.type != undefined) {
            if(object.userData.type == 'door') {
                doorArray.push(object);
            }
        }
    });

    let _html = `<p><label>
                <h2>Add a DB id for Doors</h2>
                `;

    for(let i=0; i<doorArray.length; i++) {
        const door = doorArray[i];
        const name = door.name;
        const uuid = door.uuid;
        const dbid = door.userData.DBid;

        const __html = `<p>` + name + `
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="3"></p> 
        `;

        _html += __html;
    }

    _html += `</label></p>`;

    return _html;
}

function createWindows(editor) {
    let windowArray = [];
    const scene = editor.scene;
    scene.traverse(function(object) {
        if (object.userData.DBid != undefined && object.userData.type != undefined) {
            if(object.userData.type == 'window') {
                windowArray.push(object);
            }
        }
    });

    let _html = `<p><label>
                <h2>Add a DB id for Windows</h2>
                `;

    for(let i=0; i<windowArray.length; i++) {
        const window = windowArray[i];
        const name = window.name;
        const uuid = window.uuid;
        const dbid = window.userData.DBid;

        const __html = `<p>` + name + `
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="3"></p> 
        `;

        _html += __html;
    }

    _html += `</label></p>`;

    return _html;
}

function createUtils(editor) {
    let utilArray = [];
    const scene = editor.scene;
    scene.traverse(function(object) {
        if (object.userData.DBid != undefined) {
            if(object.userData.interiorType != undefined) {
                utilArray.push(object);
            }
        }
    });

    let _html = `<p><label>
                <h2>Add a DB id for Utils</h2>
                `;

    for(let i=0; i<utilArray.length; i++) {
        const util = utilArray[i];
        const name = util.name;
        const uuid = util.uuid;
        const dbid = util.userData.DBid;

        const __html = `<p>` + name + `
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="3"></p> 
        `;

        _html += __html;
    }

    _html += `</label></p>`;

    return _html;
}


function createDialog(editor, type) {
    let _html = `
        <dialog id="DBidConnectionDialog">
            <form id="DBidForm">
        `;

    let _html2 = `
                
                <div class="clearfix"></div>
                <div style="padding:6px;">
                <p>
                <button value="cancel" formmethod="dialog">Cancel</button>
                <button id="confirmBtn" value="default">Apply</button>
                </p>
                </div>
            </form>
        </dialog>
    `
    if(type == 'lights') {
        let lightsHtml = createLights(editor);
        return _html + lightsHtml + _html2;
    } else if(type == 'doors') {
        let doorsHtml = createDoors(editor);
        return _html + doorsHtml + _html2;
    } else if(type == 'windows') {
        let windowsHtml = createWindows(editor);
        return _html + windowsHtml + _html2;
    } else {
        let utilsHtml = createUtils(editor);
        return _html + utilsHtml + _html2;
    }
}

export function showDBidConnection( editor, type ) {
    const _html = createDialog(editor, type);

    const dom = new DOMParser().parseFromString(_html, 'text/html');
    const dialog = dom.querySelector("dialog");
    document.body.appendChild(dialog)

    const dBidConnectionDialog = document.getElementById("DBidConnectionDialog");
    const confirmBtn = dBidConnectionDialog.querySelector("#confirmBtn");

    // let editorscope = editor;
    var elements = document.querySelectorAll('#DBidForm input');

    // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
    dBidConnectionDialog.addEventListener("close", (e) => {
        document.body.removeChild(dialog)
    });

    // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
    confirmBtn.addEventListener("click", (event) => {
        event.preventDefault(); // We don't want to submit this fake form

        for (var i = 0; i < elements.length; i++) {
            const element = elements[i];
            const uuid = element.id;

            const obj = editor.scene.getObjectByProperty( 'uuid' , uuid );

            const value = element.value;
            obj.userData.DBid = value;
        }

        saveState();

        document.body.removeChild(dialog)
    });

    dBidConnectionDialog.showModal();
}
