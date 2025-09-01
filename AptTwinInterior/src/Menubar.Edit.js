import * as THREE from 'three';
import { UIPanel, UIRow, UIHorizontalRule } from '../../src_common/libs/ui.js';

import { RemoveObjectCommand } from '../../src_common/commands/RemoveObjectCommand.js';

import { TV } from './interior/TV.js';
import { Sofa } from './interior/Sofa.js';
import { Bed } from './interior/Bed.js';
import { Refrigerator } from './interior/Refrigerator.js';
import { Desk } from './interior/Desk.js';
import { DiningTable } from './interior/DiningTable.js';
import { Bookshelf } from './interior/Bookshelf.js';
import { CoffeeTable } from './interior/CoffeeTable.js';
import { Wardrobe } from './interior/Wardrobe.js';
import { WashingMachine } from './interior/WashingMachine.js';
import { TVTable } from './interior/TVTable.js';
import { DressingTable } from './interior/DressingTable.js';
import { Chair } from './interior/Chair.js';
import { Bench } from './interior/Bench.js';
import { OfficeChair } from './interior/OfficeChair.js';
import { AirConditioner } from './interior/AirConditioner.js';


export class MenubarEdit {
    constructor( editor ) {
        const self = this;
        const editorscope = editor;

        this.container = new UIPanel();
        this.container.setClass( 'menu' );

        const title = new UIPanel();
        title.setClass( 'title' );
        title.setTextContent( 'Edit' );
        this.container.add( title );

        const options = new UIPanel();
        options.setClass( 'options' );
        this.container.add( options );

        // Room
        const roomSubmenuTitle = new UIRow().setTextContent( 'Room' ).addClass( 'option' ).addClass( 'submenu-title' );
        roomSubmenuTitle.onMouseOver( function () {
            const { top, right } = roomSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            roomSubmenu.setLeft( right + 'px' );
            roomSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            roomSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            roomSubmenu.setDisplay( 'block' );
        } );
        roomSubmenuTitle.onMouseOut( function () {
            roomSubmenu.setDisplay( 'none' );
        } );
        options.add( roomSubmenuTitle );

        const roomSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        roomSubmenuTitle.add( roomSubmenu );

        let option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a TV' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            TV.add(editorscope);
        } );
        roomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Bed' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            Bed.add(editorscope);
        } );
        roomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Desk' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            Desk.add(editorscope);
        } );
        roomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Office Chair' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            OfficeChair.add(editorscope);
        } );
        roomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Bookshelf' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            Bookshelf.add(editorscope);
        } );
        roomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Wardrobe' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            Wardrobe.add(editorscope);
        } );
        roomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Dressing Table' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            DressingTable.add(editorscope);
        } );
        roomSubmenu.add( option );

        // LivingRoom
        const livingroomSubmenuTitle = new UIRow().setTextContent( 'Living Room' ).addClass( 'option' ).addClass( 'submenu-title' );
        livingroomSubmenuTitle.onMouseOver( function () {
            const { top, right } = livingroomSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            livingroomSubmenu.setLeft( right + 'px' );
            livingroomSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            livingroomSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            livingroomSubmenu.setDisplay( 'block' );
        } );
        livingroomSubmenuTitle.onMouseOut( function () {
            livingroomSubmenu.setDisplay( 'none' );
        } );
        options.add( livingroomSubmenuTitle );

        const livingroomSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        livingroomSubmenuTitle.add( livingroomSubmenu );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Sofa' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            Sofa.add(editorscope);
        } );
        livingroomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Coffee Table' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            CoffeeTable.add(editorscope);
        } );
        livingroomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a TV' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            roomInterior.addTV(editorscope);
        } );
        livingroomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a TV table' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            TVTable.add(editorscope);
        } );
        livingroomSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Air-Conditioner' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }
            AirConditioner.add(editorscope);
        } );
        livingroomSubmenu.add( option );

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
        option.setTextContent( 'Add a Refrigerator' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }
             if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }

            Refrigerator.add(editorscope);
        } );
        kitchenSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Dining Table' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }
          if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }

            DiningTable.add(editorscope);
        } );
        kitchenSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Washing Machine' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }
          if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }

            WashingMachine.add(editorscope);
        } );
        kitchenSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Chair' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }
          if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }

            Chair.add(editorscope);
        } );

        kitchenSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Add a Bench' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }
          if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }

            Bench.add(editorscope);
        } );
        kitchenSubmenu.add( option );



        //============================Horizontal

        options.add( new UIHorizontalRule() );

        // Remove
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

    }
    

