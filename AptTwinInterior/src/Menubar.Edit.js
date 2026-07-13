import * as THREE from 'three';
import { UIPanel, UIRow, UIHorizontalRule } from '../../src_common/libs/ui.js';

import { AddGroupCommand } from '../../src_common/commands/AddGroupCommand.js';
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
import { RobotVacuum } from './interior/RobotVacuum.js';
import { Dog } from './interior/Dog.js';
import { Cat } from './interior/Cat.js';
import { Human } from './interior/Human.js';

import { setDBConnection, showDBidConnection } from './DBidDialog.js';

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
            Bed.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Desk' );
        option.onClick( function () {
            Desk.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Office Chair' );
        option.onClick( function () {
            OfficeChair.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Bookshelf' );
        option.onClick( function () {
            Bookshelf.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Wardrobe' );
        option.onClick( function () {
            Wardrobe.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Sofa' );
        option.onClick( function () {
            Sofa.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Coffee Table' );
        option.onClick( function () {
            CoffeeTable.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'TV table' );
        option.onClick( function () {
            TVTable.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Chair' );
        option.onClick( function () {
            Chair.add(editorscope);
        } );

        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Bench' );
        option.onClick( function () {
            Bench.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Dining Table' );
        option.onClick( function () {
            DiningTable.add(editorscope);
        } );
        funitureSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Dressing Table' );
        option.onClick( function () {
            DressingTable.add(editorscope);
        } );
        funitureSubmenu.add( option );

        // Home appliances
        const applianceSubmenuTitle = new UIRow().setTextContent( 'Home appliances' ).addClass( 'option' ).addClass( 'submenu-title' );
        applianceSubmenuTitle.onMouseOver( function () {
            const { top, right } = applianceSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            applianceSubmenu.setLeft( right + 'px' );
            applianceSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            applianceSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            applianceSubmenu.setDisplay( 'block' );

        } );
        applianceSubmenuTitle.onMouseOut( function () {
            applianceSubmenu.setDisplay( 'none' );
        } );
        options.add( applianceSubmenuTitle );

        const applianceSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        applianceSubmenuTitle.add( applianceSubmenu );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Refrigerator' );
        option.onClick( function () {
            Refrigerator.add(editorscope);
        } );
        applianceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'TV' );
        option.onClick( function () {
            TV.add(editorscope);
        } );
        applianceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Air-Conditioner' );
        option.onClick( function () {
            AirConditioner.add(editorscope);
        } );
        applianceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Washing Machine' );
        option.onClick( function () {
            WashingMachine.add(editorscope);
        } );
        applianceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Gas Range' );
        option.onClick( function () {
            GasRange.add(editorscope);
        } );
        applianceSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Robot Vacuum' );
        option.onClick( function () {
            RobotVacuum.add(editorscope);
        } );
        applianceSubmenu.add( option );

        // Pets
        const petSubmenuTitle = new UIRow().setTextContent( 'Pets' ).addClass( 'option' ).addClass( 'submenu-title' );
        petSubmenuTitle.onMouseOver( function () {
            const { top, right } = petSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            petSubmenu.setLeft( right + 'px' );
            petSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            petSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            petSubmenu.setDisplay( 'block' );

        } );
        petSubmenuTitle.onMouseOut( function () {
            petSubmenu.setDisplay( 'none' );
        } );
        options.add( petSubmenuTitle );

        const petSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        petSubmenuTitle.add( petSubmenu );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Dog' );
        option.onClick( function () {
            Dog.add(editorscope);
        } );
        petSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Cat' );
        option.onClick( function () {
            Cat.add(editorscope);
        } );
        petSubmenu.add( option );

        // Humans
        const humanSubmenuTitle = new UIRow().setTextContent( 'Humans' ).addClass( 'option' ).addClass( 'submenu-title' );
        humanSubmenuTitle.onMouseOver( function () {
            const { top, right } = humanSubmenuTitle.dom.getBoundingClientRect();
            const { paddingTop } = getComputedStyle( this.dom );
            humanSubmenu.setLeft( right + 'px' );
            humanSubmenu.setTop( top - parseFloat( paddingTop ) + 'px' );
            humanSubmenu.setStyle( 'max-height', [ `calc( 100vh - ${top}px )` ] );
            humanSubmenu.setDisplay( 'block' );

        } );
        humanSubmenuTitle.onMouseOut( function () {
            humanSubmenu.setDisplay( 'none' );
        } );
        options.add( humanSubmenuTitle );

        const humanSubmenu = new UIPanel().setPosition( 'fixed' ).addClass( 'options' ).setDisplay( 'none' );
        humanSubmenuTitle.add( humanSubmenu );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Male' );
        option.onClick( function () {
            Human.add(editorscope, 1);
        } );
        humanSubmenu.add( option );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Female' );
        option.onClick( function () {
            Human.add(editorscope, -1);
        } );
        humanSubmenu.add( option );

        //============================Horizontal
        options.add( new UIHorizontalRule() );

        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Duplicate' );
        option.onClick( function () {
            if(editorscope.selected == null) {
                alert('Select an item first');
                return;
            }

            if (confirm('Are you sure you want to duplicate this item?')) {
                const object = editorscope.selected;
                if ( object !== null && object.parent !== null ) {
                    const clone = object.clone(true);
                    editorscope.execute( new AddGroupCommand( editorscope, clone, object.parent ) );
                }  
            }
        } );
        options.add( option );

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
        const DBidSubmenuTitle = new UIRow().setTextContent( 'Connect HA entity_id' ).addClass( 'option' ).addClass( 'submenu-title' );
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

        // DB info
        option = new UIRow();
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'HA Info' );
        option.onClick( function () {
            setDBConnection(editorscope);
        } );
        DBidSubmenu.add( option );

        DBidSubmenu.add( new UIHorizontalRule() );

        // Light DB id
        option = new UIRow();
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Lights' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'lights');
        } );
        DBidSubmenu.add( option );

        // Door DB id
        option = new UIRow();
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Doors' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'doors');
        } );
        DBidSubmenu.add( option );

        // Window DB id
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Windows' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'windows');
        } );
        DBidSubmenu.add( option );

        // Util DB id
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Utils' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'utils');
        } );
        DBidSubmenu.add( option );

        // Pet DB id
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Pets' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'pets');
        } );
        DBidSubmenu.add( option );

        // Floor id
        option = new UIRow();
        option.setClass( 'option' );
        option.setTextContent( 'Floors' );
        option.onClick( function () {
            showDBidConnection(editorscope, 'floors');
        } );
        DBidSubmenu.add( option );
    }
}
