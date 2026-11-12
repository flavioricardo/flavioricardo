/**
 * Supreme Button module — image and video lightboxes (Magnific Popup).
 *
 * Uses native DOM APIs for traversal and events. Magnific Popup is a jQuery
 * plugin; initialization goes through jQuery only where required.
 */
( function () {
	'use strict';

	function getJQuery() {
		return typeof window !== 'undefined' && window.jQuery
			? window.jQuery
			: null;
	}

	/**
	 * @param {string} url
	 * @returns {string|null}
	 */
	function dailymotionIdFromUrl( url ) {
		var m = url.match(
			/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/
		);
		if ( m !== null ) {
			if ( m[ 4 ] !== undefined ) {
				return m[ 4 ];
			}
			return m[ 2 ];
		}
		return null;
	}

	var IFRAME_MARKUP =
		'<div class="mfp-iframe-scaler dsm-video-popup">' +
		'<div class="mfp-close"></div>' +
		'<iframe class="mfp-iframe" frameborder="0" allowfullscreen allow="autoplay"></iframe>' +
		'</div>';

	var IFRAME_PATTERNS = {
		youtube: {
			index: 'youtube.com/',
			id: 'v=',
			src: '//www.youtube.com/embed/%id%?autoplay=1&rel=0',
		},
		youtu_be: {
			index: 'youtu.be',
			id: '/',
			src: '//www.youtube.com/embed/%id%?autoplay=1&rel=0',
		},
		vimeo: {
			index: 'vimeo.com/',
			id: '/',
			src: '//player.vimeo.com/video/%id%?autoplay=1',
		},
		dailymotion: {
			index: 'dailymotion.com',
			id: dailymotionIdFromUrl,
			src: 'https://www.dailymotion.com/embed/video/%id%',
		},
	};

	function bindImageLightbox( $, anchor, imageUrlAttr, lightboxClass ) {
		var imageUrl = anchor.getAttribute( imageUrlAttr );
		var orderClass = anchor.getAttribute( 'data-order-class' ) || '';

		if ( ! imageUrl ) {
			return;
		}

		anchor.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			$.magnificPopup.open( {
				type: 'image',
				items: {
					src: imageUrl,
				},
				removalDelay: 500,
				mainClass: 'mfp-fade',
				callbacks: {
					open: function () {
						this.container.addClass(
							orderClass + ' ' + lightboxClass
						);
					},
				},
			} );
		} );
	}

	function bindVideoLightbox( $, anchor, lightboxClass ) {
		var orderClass = anchor.getAttribute( 'data-order-class' ) || '';

		$( anchor ).magnificPopup( {
			type: 'iframe',
			removalDelay: 500,
			iframe: {
				markup: IFRAME_MARKUP,
				patterns: IFRAME_PATTERNS,
				srcAction: 'iframe_src',
			},
			mainClass: 'dsm-video-popup-wrap mfp-fade',
			callbacks: {
				open: function () {
					this.container.addClass(
						orderClass + ' ' + lightboxClass
					);
				},
			},
		} );
	}

	function init() {
		var $ = getJQuery();
		if ( ! $ || ! $.magnificPopup ) {
			return;
		}

		var wrappers = document.querySelectorAll(
			'.et_pb_button_module_wrappers'
		);

		Array.prototype.forEach.call( wrappers, function ( wrap ) {
			Array.prototype.forEach.call(
				wrap.querySelectorAll( 'a.et_pb_button_one.dsm-image-lightbox' ),
				function ( a ) {
					bindImageLightbox(
						$,
						a,
						'data-button-one-image-url',
						'dsm-lightbox-button-one'
					);
				}
			);

			Array.prototype.forEach.call(
				wrap.querySelectorAll( 'a.et_pb_button_two.dsm-image-lightbox' ),
				function ( a ) {
					bindImageLightbox(
						$,
						a,
						'data-button-two-image-url',
						'dsm-lightbox-button-two'
					);
				}
			);

			Array.prototype.forEach.call(
				wrap.querySelectorAll( 'a.et_pb_button_one.dsm-video-lightbox' ),
				function ( a ) {
					bindVideoLightbox( $, a, 'dsm-lightbox-button-one' );
				}
			);

			Array.prototype.forEach.call(
				wrap.querySelectorAll( 'a.et_pb_button_two.dsm-video-lightbox' ),
				function ( a ) {
					bindVideoLightbox( $, a, 'dsm-lightbox-button-two' );
				}
			);
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
