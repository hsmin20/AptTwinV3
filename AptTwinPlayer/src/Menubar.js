import { startDataUpdates, stopDataUpdates, changeView } from './AptTwinPlayer.js';

class MenubarTools {
    constructor(player) {
        this.dom = document.createElement( 'div' );
        this.dom.className = 'menu';

        const title = document.createElement( 'div' );
        title.className = 'title';
        title.textContent = 'Tools';
        this.dom.appendChild( title );

        const options = document.createElement( 'div' );
        options.className = 'options';
        this.dom.appendChild( options );

        // Update from DB
        let option = document.createElement( 'div' );
        option.className = 'option';
        option.textContent = 'Update from DB';
        option.addEventListener( 'click', async () => {
            try {
                const response = await fetch('./download_model.php?tblname=ModelHouse&userid=hsmin');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                player.loadScene(data);

                player.initControl();
                player.animate();

                alert('Done downloading');
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } );
        options.appendChild( option );

        // Import
        const form = document.createElement( 'form' );
        form.style.display = 'none';
        document.body.appendChild( form );

        const fileInput = document.createElement( 'input' );
        fileInput.multiple = false;
        fileInput.type = 'file';
        fileInput.accetp = '.json';
        fileInput.addEventListener( 'change', async function () {
            const file = fileInput.files[ 0 ];
            if ( file === undefined ) return;

            try {
                const data = JSON.parse( await file.text() );

                player.loadScene(data);

                player.initControl();
                player.animate();
            } catch ( e ) {
                alert( 'Failed To Open Project' );
                console.error( e );
            } finally {
                form.reset();
            }
        } );
        form.appendChild( fileInput );

        // Update from File
        option = document.createElement( 'div' );
        option.className = 'option';
        option.textContent = 'Update from File';
        option.addEventListener( 'click', () => {
            fileInput.click();
        } );
        options.appendChild( option );

        var horizontalRule = document.createElement( 'hr' );
        horizontalRule.className = 'HorizontalRule';
        options.appendChild( horizontalRule );

        // Go to others
        option = document.createElement( 'div' );
        option.className = 'option';
        option.textContent = 'Go to Editor';
        option.addEventListener( 'click', () => {
            window.location.href = './editor.html';
        } );
        options.appendChild( option );

        option = document.createElement( 'div' );
        option.className = 'option';
        option.textContent = 'Go to Interior';
        option.addEventListener( 'click', () => {
            window.location.href = './interior.html';
        } );
        options.appendChild( option );
    }
}

class MenubarUpdate {
    constructor(player) {
        this.dom = document.createElement( 'div' );
        this.dom.className = 'menu';

        const title = document.createElement( 'div' );
        title.className = 'title';
        title.textContent = 'Update';

        title.addEventListener( 'click', function () {
            // player.updating = !player.updating;
            // if(player.updating) {
            //     startDataUpdates(10000);
            //     alert('House update started')
            // } else {
            //     stopDataUpdates();
            //     alert('House update stopped')
            // }
            player.restUpdater.fetchDataFromHAAndUpdateScene();
        } );
        this.dom.appendChild( title );
    }
}

class MenubarView {
    viewStyle = 0;

    constructor(player) {
        this.dom = document.createElement( 'div' );
        this.dom.className = 'menu';

        var scope = this;
        const title = document.createElement( 'div' );
        title.className = 'title';
        title.textContent = 'View';
        title.addEventListener( 'click', function () {
            scope.viewStyle == 0 ? scope.viewStyle = 1 : scope.viewStyle = 0;
            changeView(scope.viewStyle);
        } );
        this.dom.appendChild( title );
    }
}

class MenubarHelp {
    constructor(player) {
        this.dom = document.createElement( 'div' );
        this.dom.className = 'menu';

        const title = document.createElement( 'div' );
        title.className = 'title';
        title.textContent = 'Help';
        title.addEventListener( 'click', function () {
            window.open( 'https://threejs.org', '_blank' );
        } );
        this.dom.appendChild( title );
    }
}

export class Menubar {
    constructor( player ) {
        this.dom = document.createElement( 'div' );
        this.dom.className = 'Panel';
        this.dom.id = 'menubar';

        this.dom.appendChild( new MenubarTools(player).dom );
        this.dom.appendChild( new MenubarUpdate(player).dom );
        this.dom.appendChild( new MenubarView(player).dom );
        this.dom.appendChild( new MenubarHelp(player).dom );
    }
}

