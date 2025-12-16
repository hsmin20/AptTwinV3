import { Editor, Mode } from './editor.js';


function createSVG() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('id', 'floorplanner');
    svg.setAttribute('viewBox', '0 0 900 500');
    svg.setAttribute('preserveAspectRatio', 'xMidYMin slice');
    svg.setAttribute("style", "z-index:2;margin:0;padding:0;width:100vw;height:100vh;position:absolute;top:0;left:0;right:0;bottom:0");

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'smallGrid');
    pattern.setAttribute('width', '60');
    pattern.setAttribute('height', '60');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    defs.appendChild(pattern);

    var pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', 'M 60 0 L 0 0 0 60'); 
    pathElement.setAttribute('stroke', '#777');
    pathElement.setAttribute('stroke-width', '0.25');
    pathElement.setAttribute('fill', 'none');
    pattern.appendChild(pathElement);

    pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', '180');
    pattern.setAttribute('height', '180');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    defs.appendChild(pattern);

    var rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectElement.setAttribute('width', '180');
    rectElement.setAttribute('height', '180');
    rectElement.setAttribute('fill', 'url(#smallGrid)');
    pattern.appendChild(rectElement);

    pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', 'M 200 10 L 200 0 L 190 0 M 0 10 L 0 0 L 10 0 M 0 190 L 0 200 L 10 200 M 190 200 L 200 200 L 200 190'); 
    pathElement.setAttribute('stroke', '#999');
    pathElement.setAttribute('stroke-width', '0.8');
    pathElement.setAttribute('fill', 'none');
    pattern.appendChild(pathElement);

    svg.appendChild(defs);

    return svg;
}

function createGroups(svg) {
    var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxGrid");

    var rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectElement.setAttribute('width', '8000');
    rectElement.setAttribute('height', '5000');
    rectElement.setAttribute('x', '-3500');
    rectElement.setAttribute('y', '-2000');
    rectElement.setAttribute('fill', 'url(#grid)');
    group.appendChild(rectElement);

    svg.appendChild(group);

    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxWall");
    svg.appendChild(group);

    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxFloor");
    svg.appendChild(group);

    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxDoor");
    svg.appendChild(group);

    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxWindow");
    svg.appendChild(group);

    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxBind");
    svg.appendChild(group);

    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxRib");
    svg.appendChild(group);

    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("id", "boxScale");
    svg.appendChild(group);
}

function handleMouseInLeftPanel(editor) {
    if (editor.mode == Mode.DRAW_WALL && editor.action == Action.CLICKED) {
        editor.action = Action.NONE;
        if (editor.binder != null) {
            editor.binder.remove();
            delete editor.binder;
        }

        if(editor.linetemp != null) {
            editor.linetemp.remove();
        }
        if(editor.lineconstruc != null) {
            editor.lineconstruc.remove();
            editor.lineconstruc = null;
            editor.lengthText.remove();
            editor.lengthText = null;
            delete editor.lengthText;
        }
    }
}

function handleButtonClick(editor) {
    var sb = document.getElementById("select");
    sb.onclick = function() { editor.mode = Mode.SELECT; }
    var dwb = document.getElementById("drawwall");
    dwb.onclick = function() { editor.mode = Mode.DRAW_WALL; }
    var dfb = document.getElementById("drawfloor");
    dfb.onclick = function() { editor.mode = Mode.DRAW_FLOOR; }
    var ddb = document.getElementById("drawdoor");
    ddb.onclick = function() { editor.mode = Mode.ADD_DOOR; }
    var dwb2 = document.getElementById("drawwindow");
    dwb2.onclick = function() { editor.mode = Mode.ADD_WINDOW; }
    var dwb4 = document.getElementById("drawwindow2");
    dwb4.onclick = function() { editor.mode = Mode.ADD_WINDOW2; }
    var cb = document.getElementById("cut");
    cb.onclick = function() { editor.mode = Mode.CUT; }

    var deleteFunc = editor.deleteSome.bind(editor);
    var deteteBtn = document.getElementById('delete');
    deteteBtn.onclick = deleteFunc;

    // var changetowallFunc = editor.changeToWall.bind(editor);
    // var changetowallBtn = document.getElementById('changetowall');
    // changetowallBtn.onclick = changetowallFunc;

    var changeDoorHingeFunc = editor.changeDoorHinge.bind(editor);
    var changedoorhingeBtn = document.getElementById('changedoorhinge');
    changedoorhingeBtn.onclick = changeDoorHingeFunc;

    // var changetowindowFunc = editor.changeToWindow.bind(editor);
    // var changetowindowBtn = document.getElementById('changetowindow');
    // changetowindowBtn.onclick = changetowindowFunc;

    var changeWidthFunc = editor.changeWidth.bind(editor);
    var widthSlider = document.getElementById('doorWindowWidth');
    widthSlider.addEventListener('input', changeWidthFunc);

    var exportFunc = editor.export.bind(editor);
    var exportBtn = document.getElementById('export');
    exportBtn.onclick = exportFunc;

    var saveFunc = editor.save.bind(editor);
    var saveBtn = document.getElementById('save');
    saveBtn.onclick = saveFunc;

    var loadFunc = editor.load.bind(editor);
    var loadBtn = document.getElementById('load');
    loadBtn.onclick = loadFunc;

    var emptyFunc = editor.empty.bind(editor);
    var emptyBtn = document.getElementById('empty');
    emptyBtn.onclick = emptyFunc;

    var zoominFunc = editor.zoomIn.bind(editor);
    var zoominBtn = document.getElementById('zoomin');
    zoominBtn.onclick = zoominFunc;

    var zoomoutFunc = editor.zoomOut.bind(editor);
    var zoomoutBtn = document.getElementById('zoomout');
    zoomoutBtn.onclick = zoomoutFunc;

    var zoomresetFunc = editor.zoomReset.bind(editor);
    var zoomrestBtn = document.getElementById('reset');
    zoomrestBtn.onclick = zoomresetFunc;

    var savestateFunc = editor.saveState.bind(editor);
    var savestateBtn = document.getElementById('savestate');
    savestateBtn.onclick = savestateFunc;

    var leftPanel = document.getElementById('panel');
    leftPanel.addEventListener('mousemove', handleMouseInLeftPanel);
}

let svg = createSVG();
createGroups(svg);

document.body.appendChild(svg);

const editor = new Editor();

handleButtonClick(editor);