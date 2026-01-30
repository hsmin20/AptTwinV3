import { saveState } from "./AptTwinInterior";

function createAssignDialog(devices) {
    let _html = `
        <dialog id="AssignDialog">
            <form id="AssignForm">
        `;

    let assignHtml = `<h1>Assign a Device</h1>`;
    for(let i=0; i<devices.length; i++) {
        const device = devices[i];
        let checked = i == 0 ? `checked` : ``;
        const oneAssign = `
            <p><input type="radio" id="device" name="device" value="` + device.entity_id + `" ` + checked + `>` + device.attributes.friendly_name + `</p>
        
        `;
        assignHtml += oneAssign;
    }

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
        `;

    return _html + assignHtml + _html2;
}

async function assign(uuid, device_cls) {
    try {
        const api_url = 'http://dahantech.iptime.org:8123/api/states';
        const access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZTZiNGQ4NTRmMWM0ZmJjOTc4OTM2ZmNjN2UzZjIyYSIsImlhdCI6MTc2OTY2MjA0MywiZXhwIjoyMDg1MDIyMDQzfQ.6sZjJJLz84b_DggjMYv24qNRO-H_3_cUnTU_beJ8EW4'; 

        const response = await fetch(api_url, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // console.log(JSON.stringify(data, null, 2));

        const filtered = [];
        for (const item of data) {
            const dev_cls = item.attributes.device_class;
            if(dev_cls == undefined)
                continue;

            if(dev_cls == device_cls) {
                filtered.push(item);
                continue;
            }
        }

        if (filtered.length == 0) {
            alert('No assignable devices');
            return;
        }

        const assignHtml = createAssignDialog(filtered);

        const dom = new DOMParser().parseFromString(assignHtml, 'text/html');
        const dialog = dom.querySelector("dialog");
        document.body.appendChild(dialog)

        const assignDialog = document.getElementById("AssignDialog");
        const confirmBtn = assignDialog.querySelector("#confirmBtn");

        // "Cancel" button closes the dialog without submitting because of [formmethod="dialog"], triggering a close event.
        assignDialog.addEventListener("close", (e) => {
            document.body.removeChild(dialog)
        });

        // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event.
        confirmBtn.addEventListener("click", (event) => {
            event.preventDefault(); // We don't want to submit this fake form

            var device_id = document.querySelector('input[name=device]:checked').value;
            const mappedIDText = document.getElementById(uuid);

            mappedIDText.value = device_id;

            document.body.removeChild(dialog)
        });

        assignDialog.showModal();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

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
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="40">
        <button  id="assignBtn" value="` + uuid + `" type="button">Assign</button></p> 
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
                <h2>Add a Home Assistant entity_id for Doors</h2>
                `;

    for(let i=0; i<doorArray.length; i++) {
        const door = doorArray[i];
        const name = door.name;
        const uuid = door.uuid;
        const dbid = door.userData.DBid;

        const __html = `<p>` + name + `
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="40">
        <button  id="assignBtn" value="` + uuid + `" type="button">Assign</button></p> 
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
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="40">
        <button  id="assignBtn" value="` + uuid + `" type="button">Assign</button></p> 
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
                const it = object.userData.interiorType;
                if(it != 'RobotVacuum' && it != 'Dog' && it != 'Cat')
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
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="40">
        <button  id="assignBtn" value="` + uuid + `" type="button">Assign</button></p> 
        `;

        _html += __html;
    }

    _html += `</label></p>`;

    return _html;
}

function createPets(editor) {
    let petArray = [];
    const scene = editor.scene;
    scene.traverse(function(object) {
        if (object.userData.DBid != undefined) {
            if(object.userData.interiorType != undefined) {
                const it = object.userData.interiorType;
                if(it == 'RobotVacuum' || it == 'Dog' || it == 'Cat')
                    petArray.push(object);
            }
        }
    });

    let _html = `<p><label>
                <h2>Add a DB id for Pets</h2>
                `;

    for(let i=0; i<petArray.length; i++) {
        const pet = petArray[i];
        const name = pet.name;
        const uuid = pet.uuid;
        const dbid = pet.userData.DBid;

        const __html = `<p>` + name + `
        <input type="text" id="` + uuid + `" name="` + name + `" value="` + dbid + `" size="40">
        <button  id="assignBtn" value="` + uuid + `" type="button">Assign</button></p>  
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
    } else if(type == 'utils') {
        let utilsHtml = createUtils(editor);
        return _html + utilsHtml + _html2;
    } else if(type == 'pets') {
        let petsHtml = createPets(editor);
        return _html + petsHtml + _html2;
    }
}

export function showDBidConnection( editor, type ) {
    const _html = createDialog(editor, type);

    const dom = new DOMParser().parseFromString(_html, 'text/html');
    const dialog = dom.querySelector("dialog");
    document.body.appendChild(dialog)

    const dBidConnectionDialog = document.getElementById("DBidConnectionDialog");
    const confirmBtn = dBidConnectionDialog.querySelector("#confirmBtn");

    const assigBtns = dBidConnectionDialog.querySelectorAll("#assignBtn");
    assigBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const map = new Map([
                ['doors', 'opening'],
                ['windows', 'opening'],
                ['lights', 'illuminance']
            ]);

            assign(btn.value, map.get(type));
        });
    });

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
