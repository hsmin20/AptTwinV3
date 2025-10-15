import { UIPanel } from '../../src_common/libs/ui.js';

import { MenubarFile } from './Menubar.File.js';
import { MenubarEdit } from './Menubar.Edit.js';
import { MenubarTools } from './Menubar.Tools.js';
import { MenubarHelp } from '../../src_common/Menubar.Help.js';
import { MenubarSample } from './Menubar.Sample.js';

export class Menubar {
    constructor( editor, isSample ) {
        this.container = new UIPanel();
        this.container.setId( 'menubar' );

        if(isSample) {
            this.container.add( new MenubarFile( editor ).container );
            this.container.add( new MenubarSample( editor ).container );
        } else {
            this.container.add( new MenubarFile( editor ).container );
            this.container.add( new MenubarEdit( editor ).container );
            this.container.add( new MenubarTools( editor ).container );
            this.container.add( new MenubarHelp( editor ).container );
        }
    }
}

