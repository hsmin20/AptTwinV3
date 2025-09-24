import { UIPanel } from '../../src_common/libs/ui.js';

import { MenubarFile } from '../../src_common/Menubar.File.js';
import { MenubarEdit } from './Menubar.Edit.js';
import { MenubarTools } from './Menubar.Tools.js';
import { MenubarHelp } from '../../src_common/Menubar.Help.js';

export class Menubar {
    constructor( editor ) {
        this.container = new UIPanel();
        this.container.setId( 'menubar' );

        this.container.add( new MenubarFile( editor ).container );
        this.container.add( new MenubarEdit( editor ).container );
        this.container.add( new MenubarTools( editor ).container );
        this.container.add( new MenubarHelp( editor ).container );
    }
}

