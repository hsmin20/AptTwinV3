import * as THREE from 'three';

import { UISpan } from './ui.js';

const textureCache = new Map();

export class UITexture2 extends UISpan {

	constructor( callback ) {

		super();

		const scope = this;

		const canvas = document.createElement( 'canvas' );
		canvas.width = 32;
		canvas.height = 16;
		canvas.style.cursor = 'pointer';
		canvas.style.marginRight = '5px';
		canvas.style.border = '1px solid #888';
		canvas.addEventListener( 'click', function () {
			callback(setTexture);
		} );

		this.dom.appendChild( canvas );

        function setTexture(texture) {
            const hash = texture.uuid;
            if ( textureCache.has( hash ) ) {
                const texture = textureCache.get( hash );
                scope.setValue( texture );
                if ( scope.onChangeCallback ) 
                    scope.onChangeCallback( texture );

            } else {
                textureCache.set( hash, texture );

                scope.setValue( texture );

                if ( scope.onChangeCallback ) 
                    scope.onChangeCallback( texture );
            }


            scope.setValue( texture );

            if ( scope.onChangeCallback ) scope.onChangeCallback( texture );
        }

		this.texture = null;
		this.onChangeCallback = null;
	}

	getValue() {
		return this.texture;
	}

	setValue( texture ) {
		const canvas = this.dom.children[ 0 ];
		const context = canvas.getContext( '2d' );

		// Seems like context can be null if the canvas is not visible
		if ( context ) {
			// Always clear the context before set new texture, because new texture may has transparency
			context.clearRect( 0, 0, canvas.width, canvas.height );
		}

		if ( texture !== null ) {
			const image = texture.image;
			if ( image !== undefined && image !== null && image.width > 0 ) {
				canvas.title = texture.name;
				const scale = canvas.width / image.width;
				if ( texture.isDataTexture || texture.isCompressedTexture ) {
					const canvas2 = renderToCanvas( texture );
					context.drawImage( canvas2, 0, 0, image.width * scale, image.height * scale );
				} else {
					context.drawImage( image, 0, 0, image.width * scale, image.height * scale );
				}
			} else {
				canvas.title = texture.name + ' (error)';
			}

		} else {
			canvas.title = 'empty';
		}
		this.texture = texture;
	}

	setColorSpace( colorSpace ) {
		const texture = this.getValue();
		if ( texture !== null ) {
			texture.colorSpace = colorSpace;
		}

		return this;
	}

	onChange( callback ) {
		this.onChangeCallback = callback;
		return this;
	}
}