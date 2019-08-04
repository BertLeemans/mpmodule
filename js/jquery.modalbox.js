/**
 * JQuery Plugin for a modal box
 * Will create a simple modal box with all HTML and styling
 * 
 * http://www.paulund.co.uk/how-to-create-a-simple-modal-box-with-jquery
 *
 */

(function($){

	// Defining our jQuery plugin

	$.fn.tnr_modal_box = function(prop){

		// Default parameters
		
		var options = $.extend({
			height : "250",
			width : "500",
			extra:"JQuery Modal Box Demo",
			title:"JQuery Modal Box Demo",
			description: "Example of how to create a modal box.",
			top: "20%",
			left: "30%",
			mode: 0,
			list: [],
			callback: null
		},prop);
				
		//Click event on element

		return this.click(function(e){
			add_block_page();
			add_popup_box();
			add_styles();
			
			$('.tnr_modal_box').fadeIn();
			//Focus the selectbox
			if ((options.mode == 1) | (options.mode == 7)) {
				$("#tnr_select_box").focus();
			}
		});

		/**
		 * Add styles to the html markup
		 */
		 function add_styles(){
		 	var calculated_width = (windowWidth() / 2) - (options.width / 2);
			$('.tnr_modal_box').css({ 
				'position':'absolute', 
				'left': calculated_width + 'px',
				'top':options.top,
				'display':'none',
				'height': options.height + 'px',
				'width': options.width + 'px',
				'border':'1px solid #fff',
				'box-shadow': '0px 2px 7px #292929',
				'-moz-box-shadow': '0px 2px 7px #292929',
				'-webkit-box-shadow': '0px 2px 7px #292929',
				'border-radius':'10px',
				'-moz-border-radius':'10px',
				'-webkit-border-radius':'10px',
				'background': '#f2f2f2', 
				'z-index':'99',
			});
			$('.tnr_modal_close').css({
				'position':'relative',
				'top':'-25px',
				'left':'20px',
				'float':'right',
				'display':'block',
				'height':'50px',
				'width':'50px',
				'background': 'url(/Module/images/close.png) no-repeat',
			});
			$('.tnr_block_page').css({
				'position':'absolute',
				'top':'0',
				'left':'0',
				'background-color':'rgba(0,0,0,0.6)',
				'height':'100%',
				'width':'100%',
				'z-index':'98'
			});
			$('.tnr_inner_modal_box').css({
				'background-color':'#fff',
				'height':(options.height - 50) + 'px',
				'width':(options.width - 50) + 'px',
				'padding':'10px',
				'margin':'15px',
				'border-radius':'10px',
				'-moz-border-radius':'10px',
				'-webkit-border-radius':'10px'
			});
			
			function cssButton() {
				$('.tnr_request_button').css({
					'background': '#d2d2d2',
					'background-image': '-webkit-linear-gradient(top, #d2d2d2, #474747)',
					'background-image': '-moz-linear-gradient(top, #d2d2d2, #474747)',
					'background-image': '-ms-linear-gradient(top, #d2d2d2, #474747)',
					'background-image': '-o-linear-gradient(top, #d2d2d2, #474747)',
					'background-image': 'linear-gradient(to bottom, #d2d2d2, #474747)',
					'-webkit-border-radius': 7,
					'-moz-border-radius': 7,
					'border-radius': '7px',
					'font-family': 'Arial',
					'color': '#ffffff',
					'font-size': '12px',
					'padding': '5px 10px 5px 10px',
					'text-decoration': 'none',
					'margin-left': '10px',
					'width': '50px'
				});
			}
			cssButton();
			
			$('.tnr_request_button').hover( function() {
				$(this).css({
					'background': '#474747',
					'background-image': '-webkit-linear-gradient(top, #474747, #d2d2d2)',
					'background-image': '-moz-linear-gradient(top, #474747, #d2d2d2)',
					'background-image': '-ms-linear-gradient(top, #474747, #d2d2d2)',
					'background-image': '-o-linear-gradient(top, #474747, #d2d2d2)',
					'background-image': 'linear-gradient(to bottom, #474747, #d2d2d2)',
					'text-decoration': 'none'
				})}, function() {
					cssButton();
			});
		}
		
		 /**
		  * Create the block page div
		  */
		 function add_block_page(){
			var block_page = $('<div class="tnr_block_page"></div>');
			
			$(block_page).appendTo('body');
		}
		 	
		 /**
		  * Creates the modal box
		  */
		function add_popup_box(){
			var pop_up = $('<div class="tnr_modal_box"><a href="#" class="tnr_modal_close"></a><div class="tnr_inner_modal_box"></div></div>');
			$(pop_up).appendTo('.tnr_block_page');
						
			switch (options.mode) {
				case 1:
					if (iOS) {
						options.height = 200;
						var temp = '<select id="tnr_select_box" style="width: 450px;">';
					} else {
						var temp = '<select id="tnr_select_box" size=50 style="height: 290px; width: 450px;">';
					}
					for(var i=0; i < options.list.length; i++) {
						if (i == 0) {
							temp += '<option selected>';
						} else {
							temp += '<option>';
						}
						temp += options.list[i] + '</option>';
					}
					temp += '</select>';
					if (iOS) {
						temp += '<div style="position:absolute; bottom:30px; right:30px;"><button class="tnr_request_button" id="tnr_select_button">Select</button>';
					}
					
					$(".tnr_inner_modal_box").append('<h2>' + options.title + '</h2>' + temp);
					$("#tnr_select_box")
						.dblclick( function () {
							$('.tnr_modal_box').fadeOut().remove();
							$('.tnr_block_page').fadeOut().remove();				 
							$('.tnr_modal').unbind('click');
							
							if (options.callback) {
								options.callback(this.selectedIndex);
							}
						})
						.keyup(function(event){
							var keycode = (event.keyCode ? event.keyCode : event.which);
							if ( keycode == 13 ) {
								event.preventDefault();

								$('.tnr_modal_box').parent().fadeOut().remove();
								$('.tnr_block_page').fadeOut().remove();
								$('.tnr_modal').unbind('click');

								if (options.callback) {
									options.callback(this.selectedIndex);
								}
							}
						});

					$("#tnr_select_button")
						.click( function () {
							var position = $("#tnr_select_box").prop('selectedIndex');
							$('.tnr_modal_box').fadeOut().remove();
							$('.tnr_block_page').fadeOut().remove();				 
							$('.tnr_modal').unbind('click');
							
							if (options.callback) {
								options.callback( position );
							}
						});

					break;
				case 2:
					createProgressIndicator();
					$(".tnr_inner_modal_box").append('<iframe id=\"iframe_modal_box\" style=\"width: ' + (options.width - 55) + 'px; height: ' + (options.height - 90) + 'px;\" src="' + options.description + '" onload="closeProgressIndicator();"/>');
					break;
				case 3:
					$(".tnr_inner_modal_box").append(options.description);
					break;
				case 4:
					$(".tnr_inner_modal_box").append(options.description);
					var slider = $('.bxslider').bxSlider({
						captions: true,
						infiniteLoop: false,
						hideControlOnEnd: true,
						startSlide: 0
					});
					$('.tnr_inner_modal_box img').wrap('<span style="display:inline-block"></span>').css('display', 'block').parent().zoom( { "on": "click", "magnify": 2 });
					$('.bx-caption span').prepend( "<b>" + options.title + "</b> | " );
					break;
				case 5:
					$(".tnr_inner_modal_box").append('<p>' + options.description + '</p><div style="position:absolute; bottom:30px; right:30px;"><button class="tnr_request_button" id="tnr_request_no">' + options.extra + '</button><button class="tnr_request_button" id="tnr_request_yes">' + options.title + '</button></div>');
					$('.tnr_inner_modal_box button').css("right", '0px');
					$("#tnr_request_yes").click( function () {
							$('.tnr_modal_box').fadeOut().remove();
							$('.tnr_block_page').fadeOut().remove();				 
							$('.tnr_modal').unbind('click');
							if (options.callback) {
								options.callback();
							}
					}).keyup(function(event){
							var keycode = (event.keyCode ? event.keyCode : event.which);
							if ( keycode == 13 ) {
								event.preventDefault();

								$('.tnr_modal_box').fadeOut().remove();
								$('.tnr_block_page').fadeOut().remove();				 
								$('.tnr_modal').unbind('click');

								if (options.callback) {
									options.callback();
								}
							}
					});
					$("#tnr_request_no").click( function () {
							$('.tnr_modal_box').fadeOut().remove();
							$('.tnr_block_page').fadeOut().remove();				 
							$('.tnr_modal').unbind('click');
					});
					break;
				case 6:
					$(".tnr_inner_modal_box").append(options.description);
					$(".flipbooks").each ( function( index, value ) {
						$("#flipbook" + index ).turn({ width: (options.widthFlipBook), height: (options.heightFlipBook)});
					});
					$('.versions').hide();
					$('#version0').show();
					break;
				case 7:
					var temp = "<p>" +options.description + "</p><textarea id=\"tnr_select_box\" rows=\"8\" cols=\"60\"></textarea><div style=\"position:absolute; bottom:30px; right:30px;\"><button class=\"tnr_request_button\" id=\"tnr_request_yes\">" + options.extra + "</button></div>";
					$(".tnr_inner_modal_box").append('<h2>' + options.title + '</h2>' + temp);
					$("#tnr_request_yes").click( function () {
							var comment = $("#tnr_select_box").val();
							
							$('.tnr_modal_box').fadeOut().remove();
							$('.tnr_block_page').fadeOut().remove();				 
							$('.tnr_modal').unbind('click');
							if (options.callback) {
								options.callback( comment );
							}
					}).keyup(function(event){
							var keycode = (event.keyCode ? event.keyCode : event.which);
							if ( keycode == 13 ) {
								event.preventDefault();

								var comment = $("#tnr_select_box").val();
	
								$('.tnr_modal_box').fadeOut().remove();
								$('.tnr_block_page').fadeOut().remove();				 
								$('.tnr_modal').unbind('click');

								if (options.callback) {
									options.callback( comment );
								}
							}
					});
					break;
				default:
					if (options.title) {
						$(".tnr_inner_modal_box").append('<h2>' + options.title + '</h2><p style="height: 150px; overflow: auto;">' + options.description + '</p>');
					} else {
						$(".tnr_inner_modal_box").append('<p style="height: 150px; overflow: auto;">' +options.description + '</p>');
					}
			}
			
			$('.tnr_modal_box').css("font-family", layouts.styles[4].fontname)
				.css( "font-size", layouts.styles[4].fontsize );
							 
			$('.tnr_modal_close').click(function(){
				$('.tnr_modal_box').parent().fadeOut().remove();
				$('.tnr_block_page').fadeOut().remove();				 
				$('.tnr_modal').unbind('click');

				if (options.mode === 0) {
					if (options.callback) {
						options.callback();
					}
				}
				if (options.mode === 2) {
					closeProgressIndicator();
				}
			});

			$(document).keyup(function(event){
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if ( keycode == 27 ) {
					event.preventDefault();

					$('.tnr_modal_box').parent().fadeOut().remove();
					$('.tnr_block_page').fadeOut().remove();
					$('.tnr_modal').unbind('click');

					if (options.mode === 0) {
						if (options.callback) {
							options.callback();
						}
					}
					if (options.mode === 2) {
						closeProgressIndicator();
					}
				}				 
			});
		}
		return this;
	};
	
})(jQuery);
