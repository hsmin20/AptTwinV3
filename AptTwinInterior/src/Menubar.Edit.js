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
import { GasRange } from './interior/GasRange.js';

import { showDBidConnection } from './DBidDialog.js';

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

        // Funiture
        const funitureSubmenuTitle = new UIRow().setTextContent( 'Funiture' ).addClass( 'option' ).addClass( 'submenu-title' );
        funitureSubmenuTitle.onMouseOver( function () {
            const { top, right } = funitureSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            funitureSubmenu.setLeft( right + 'px' );
            funitureSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            funitureSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            funitureSubmenu.setDisplay( 'block' );
        } );
        funitureSubmenuTitle.onMouseOut( function () {
            funitureSubmenu.setDisplay( 'none' );
        } );
        options.add( funitureSubmenuTitle );

        const funitureSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        funitureSubmenuTitle.add( funitureSubmenu );

        let option = new UIRow();
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Bed' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Desk' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Office Chair' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Bookshelf' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Wardrobe' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Sofa' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Coffee Table' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'TV table' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Chair' );
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

        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Bench' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Dining Table' );
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
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Dressing Table' );
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
        funitureSubmenu.add( option );

        // Kitchen
        const applicanceSubmenuTitle = new UIRow().setTextContent( 'Home applicances' ).addClass( 'option' ).addClass( 'submenu-title' );
        applicanceSubmenuTitle.onMouseOver( function () {
            const { top, right } = applicanceSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            applicanceSubmenu.setLeft( right + 'px' );
            applicanceSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            applicanceSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            applicanceSubmenu.setDisplay( 'block' );

        } );
        applicanceSubmenuTitle.onMouseOut( function () {
            applicanceSubmenu.setDisplay( 'none' );
        } );
        options.add( applicanceSubmenuTitle );

        const applicanceSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        applicanceSubmenuTitle.add( applicanceSubmenu );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Refrigerator' );
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
        applicanceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'TV' );
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
        applicanceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Air-Conditioner' );
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
        applicanceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Washing Machine' );
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
        applicanceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Gas Range' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }
          if(editorscope.selected.type != 'Group') {
                alert('Select a Group');
                return;
            }

            GasRange.add(editorscope);
        } );
        applicanceSubmenu.add( option );

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

        options.add( new UIHorizontalRule() );

         // DB id
        const DBidSubmenuTitle = new UIRow().setTextContent( 'Connect DB id' ).addClass( 'option' ).addClass( 'submenu-title' );
        DBidSubmenuTitle.onMouseOver( function () {
            const { top, right } = DBidSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            DBidSubmenu.setLeft( right + 'px' );
            DBidSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            DBidSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            DBidSubmenu.setDisplay( 'block' );
        } );
        DBidSubmenuTitle.onMouseOut( function () {
            DBidSubmenu.setDisplay( 'none' );
        } );
        options.add( DBidSubmenuTitle );

        const DBidSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        DBidSubmenuTitle.add( DBidSubmenu );

        // Door DB id
        option = new UIRow();
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Lights' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'lights');
        } );
        DBidSubmenu.add( option );

        option = new UIRow();
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Doors' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'doors');
        } );
        DBidSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Windows' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'windows');
        } );
        DBidSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Utils' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'utils');
        } );
        DBidSubmenu.add( option );
    }
}
