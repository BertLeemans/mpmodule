function decodeEntities(s) {
    var str, temp= document.createElement('p');
    temp.innerHTML= s;
    str= temp.textContent || temp.innerText;
    temp=null;
    return str;
}

function escapeRegExp(str) {
	var temp = encodeURIComponent( str );
	temp = temp.replace(/'/g, '%27');
	temp = temp.replace("(", '%28');
	temp = temp.replace(")", '%29');
	return temp;
}

var datetimeformat = {
	"timepicker":false,
	"format":"d-m-Y",	//format:'d.m.Y'
	"mask":true,
	"minDate": '-1970/01/01'
}

var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;

function createProgressIndicator() {
	$( '<div id="progressIndicator" class="progressIndicatorStyle"><img src="/module/images/ajax-loader.gif" /></div>' ).appendTo( "body" );
}

function closeProgressIndicator() {
	$("#progressIndicator").remove();
}

function tableScrollHeight(height) {
	if (!height) {
		var height = $(".content").height();
		height -= 110;
	}
	var tableHeight = $("#scrollArea table").height();
	if (height > tableHeight) {
		height = tableHeight;
	}

	$("#scrollArea").css('max-height', height);
}

function tableHeaderWidth() {
    	// rekening houden met scrollbar
	var widthScrollArea = $("#scrollArea").width();
	var widthContentArea = $("#contentArea").width();
	if (widthScrollArea != widthContentArea) {
		$(".clusterize_head").css('padding-right', widthScrollArea - widthContentArea);
		$(".clusterize_foot").css('padding-right', widthScrollArea - widthContentArea);
	}
}

function deleteFiles(file, index) {
	openRequest("<!--#4DSCRIPT/WEB_LANGUAGE/Zeker weten?-->", function () {
		$.ajax({
			type: 'DELETE',
			url: '/connector/html/sendContentData?session=' + sessionStorage.getItem("session") + '&location=' + $('#locationFiles').val() + '&id=' + $('#id').val() + '&filename=' + file,
			data: "{}",	//if this is not supplied this is not working on chrome and firefox
			success: function (files) {
				if (files.errornumber) {
					openAlert(files.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
				} else {
					$('#upload-table tr').remove('#files' + index);
					if ( typeof updateDocumentInfo == 'function' ) {
						preflightData.splice(index, 1);
						updateDocumentInfo();
					}
				}
			}
		});
	});
}

function openFiles (filename, type) {
	$.ajax({
		url: '/connector/html/getContentData?session=' + sessionStorage.getItem("session") + '&location=' + $('#locationFiles').val() + '&id=' + $('#id').val() + '&filename=' + filename + '&type=test',
		type: 'GET',
		success: function (files) {
			if (files.errornumber) {
				openAlert(files.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
			} else {
				switch (type) {
					case 'check':
						if (files.check) {
							var url = '/connector/html/getContentData?session=' + sessionStorage.getItem("session") + '&location=' + $('#locationFiles').val() + '&id=' + $('#id').val() + '&filename=' + filename + '&type=check';
							openPDF(url);
						} else {
							var temp = "<!--#4DSCRIPT/WEB_LANGUAGE/Rapport is nog niet klaar. Probeer het later nog eens.-->";
							if (files.progress) {
								temp += ("<br/><br/><!--#4DSCRIPT/WEB_LANGUAGE/Status:--> " + files.progress + "%");
							}
							openAlert(temp, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
						}
						break;
				}
			}
		}
	});
}

function updateFiles(index, file) {
	var url = '/connector/html/getContentData/' + escapeRegExp( file.filename ) + '?session=' + sessionStorage.getItem("session") + '&location=' + $('#locationFiles').val() + '&id=' + $('#id').val() + '&filename=' + escapeRegExp(file.filename);
	var temp = '<tr id="files' + index + '">';
	temp += '<td class="leading">' + formatDate(file.modifiedDate) + " " + formatTime(file.modifiedDate) + ':</td>';
		temp += '<td class="data">';
		temp += '<div style="float: left; display: inline;"><a href="#" onclick="javascript:openPDF(\'' + url + '\')" class="choice">' + file.filename + '</a></div>';
		temp += '<div style="float: right; display: inline;">' + formatNumber(file.size/1000) + ' kB</div>';
		if ((preferences.access.workflowReport) & (file.pdf)) {
			temp += '<div style="margin-right: 40px; float: right; display: inline;"><a href="#" onclick="javascript:openFiles(\'' + escapeRegExp(file.filename) + '\', \'check\');" class="choice"><!--#4DSCRIPT/WEB_LANGUAGE/Rapport--></a></div>';
		}
		temp += '</td>';
	temp += '<td class="trailing"><a href="#" class="choice deletefiles" onclick="javascript:deleteFiles(\'' + escapeRegExp(file.filename) + '\', ' + index + ');"><!--#4DSCRIPT/WEB_LANGUAGE/Wis--></a></td>';
	temp += '</tr>';
	$("#upload-table").append(temp);
	styleLinks(4);
}

function getCurrentFiles(callback) {
	if (preferences.access.uploadFiles) {
		$.getJSON('/connector/html/sendContentData?session=' + sessionStorage.getItem("session") + '&location=' + $("#locationFiles").val() + '&id=' + $('#id').val(), function (files) {
			if (files.errornumber) {
				openAlert(files.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
			} else {
				$.each(files, function (index, file) {
					updateFiles((index - 1), file)
				});
				if (callback) {
					callback();
				}
			}
		});
	} else {
		if (callback) {
			callback();
		}
	}
}

function initFileUpload(callback) {
	if (preferences.access.uploadFiles) {
		$('#fileupload-button').fileupload({			// init the upload tool:
			dataType: 'json',
			formData: [{name: 'session', value: sessionStorage.getItem("session")}, {name: 'location', value: $('#locationFiles').val()}, {name: 'id', value: $('#id').val()}],
			url: '/connector/html/sendContentData',
			done: function (e, data) {
				if (data.result.errornumber) {
					openAlert(data.result.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
				} else {
					if (data.result.filename) {
						updateFiles($("#upload-table tr[id^=files]").length, data.result);
						if (callback) {
							callback(data.result.filename);
						}
					}
				}
			},
			add: function (e, data) {
				if ((preferences.settings.files.mimetypes.indexOf(data.files[0].type) == -1) && (preferences.settings.files.mimetypes.length !=0)) {
					openAlert("<!--#4DSCRIPT/WEB_LANGUAGE/Ongeldige bestandstype:--> " + data.files[0].type, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
				} else if ((data.files[0].size > (preferences.settings.files.filesize * 1024 * 1024)) & (preferences.settings.files.filesize != 0)) {
					openAlert("<!--#4DSCRIPT/WEB_LANGUAGE/Bestand te groot. Maximaal--> " + preferences.settings.files.filesize + " MB!", "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
				} else if (($("tr[id='files']").length >= preferences.settings.files.filecount) & (preferences.settings.files.filecount != 0)) {
					openAlert("<!--#4DSCRIPT/WEB_LANGUAGE/Maximaal aantal bestanden is--> " + preferences.settings.files.filecount + ".", "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
				} else {
					jqXHR = data.submit();
				}
			},
			start: function (e, data) {
				$( "#fileupload-button").css('visibility', 'hidden');
				$( "#fileupload-button").css('width', '0px');

				$( "#fileupload-progressbar").progressbar({ value: 0 });
				$( "#fileupload-progressbar").height(18);
				$( ".progress-label").css('visibility', 'visible');
// creer een stop button
				$( "#fileupload-button").parent().parent().children(".trailing").html('<a href="#" onclick="javascript:jqXHR.abort();" class="choice"><!--#4DSCRIPT/WEB_LANGUAGE/Annuleer--></a>');
				styleLinks(4);
			},
			stop: function (e, data) {
				$( "#fileupload-progressbar").progressbar( "destroy");
				$( "#fileupload-progressbar").height(0);
				$( ".progress-label").css('visibility', 'hidden');

				$( "#fileupload-button").css('visibility', 'visible');
				$( "#fileupload-button").css('width', '');
// verwijder een stop button
				$( "#fileupload-button").parent().parent().children(".trailing").html('&nbsp;');
			},
			fail: function (e, data) {
				openAlert(e, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
			},
			progress: function (e, data) {
				var progress = parseInt(data.loaded / data.total * 100, 10);
				$("#fileupload-progressbar").progressbar( "option", "value", progress );
				$(".progress-label").text(progress + "%" );
			}
		});
		$( "#fileupload-progressbar").height(0);
		$( ".progress-label").css('visibility', 'hidden');
	} else {
		$("#upload-table").hide();
	}
}

function encodeMailTo (message) {
	var temp = encodeURI(message);
	temp = temp.replace(/&#39;/g,"%27");
	return temp;
}

function openAlert (message, title, callback) {
	if ( message == "no valid session found" ) {
		callback = function () { window.location.replace('/module/pages/index.shtm'); }
	}
	$('.tnr_modal').tnr_modal_box({
		title:title,
		description: message,
		callback: callback
	});
	$('.tnr_modal').click();
}

function openRequest (message, callback) {
	$('.tnr_modal').tnr_modal_box({
		title: "<!--#4DSCRIPT/WEB_LANGUAGE/Ja-->",
		extra: "<!--#4DSCRIPT/WEB_LANGUAGE/Nee-->",
		description: message,
		mode: 5,
		height : "150",
		width : "300",
		top: "40%",
		callback: callback
	});
	$('.tnr_modal').click();
}

function openSelect (title, list, callback) {
	$('.tnr_modal').tnr_modal_box({
		title:title,
		height : 400,
		width: 500,
		mode: 1,
		list: list,
		callback: callback
	});
	$('.tnr_modal').click();
}

function openComment (message, title, callback) {
	$('.tnr_modal').tnr_modal_box({
		title:title,
		description: message,
		extra: "<!--#4DSCRIPT/WEB_LANGUAGE/OK-->",
		height : 300,
		width: 500,
		mode: 7,
		callback: callback
	});
	$('.tnr_modal').click();
}

function openPDF(url) {
	$('.tnr_modal').tnr_modal_box({
		top: 25,
		height : windowHeight() - 40,
		width: windowWidth() - 100,
		mode: 2,
		description: url
	});
	$('.tnr_modal').click();
}

function openImageURL(url) {
	var maxWidth = windowWidth() - 90;
	var maxHeight = windowHeight() - 90;

	var html = '<div style="width: ' + maxWidth + 'px; height: ' + (maxHeight - 50) + 'px; overflow: scroll; display: block;"><img src="' + url + "&random=" +  Math.floor((Math.random() * 1000) + 1) + '" /></div>';

	var top = 25;
	$('.tnr_modal').tnr_modal_box({
		top: top,
		width: maxWidth + 50,
		height : maxHeight + 50,
		title: null,
		mode: 3,
		description: html
	});

	$('.tnr_modal').click();
}

function openImage(image) {
	var maxWidth = windowWidth() - 90;
	var maxHeight = windowHeight() - 90;
	var boxWidth = 0;
	var boxHeight = 0;

	boxWidth = image.width;
	boxHeight = image.height;
	if (boxWidth > maxWidth) {
		boxHeight = boxHeight * (maxWidth/boxWidth);
		boxWidth = maxWidth;
	}
	if (boxHeight > maxHeight) {
		boxWidth = boxWidth * (maxHeight/boxHeight);
		boxHeight = maxHeight;
	}
	var html = '<img width=\"' + boxWidth + 'px;\" height=\"' + boxHeight + 'px;\" style="margin-top:-25px;" src="/connector/html/getImage/' + image.id + '.jpg?session=' + sessionStorage.getItem("session") + '&type=' + image.type + '&id='+ image.id + '&width=' + boxWidth + '&height=' + boxHeight + '&random=' +  Math.floor((Math.random() * 1000) + 1) + '" />';

	var top = (maxHeight / 2) - (boxHeight / 2) + 25;
	$('.tnr_modal').tnr_modal_box({
		top: top,
		width: boxWidth + 50,
		height : boxHeight + 50,
		title: null,
		mode: 3,
		description: html
	});

	$('.tnr_modal').click();
}

function openTurn( element ) {
	var sub_job = job.sub_jobs[element];

	var maxWidth = windowWidth() - 90;
	var maxHeight = windowHeight() - 90;

	var boxWidth = 0;
	var boxHeight = 0;

	var maxImageWidth = 0;
	var maxImageHeight = 0;

	var imageWidth = 0;
	var imageHeight = 0;

	var factor = 1;
	$.each(sub_job.pageproof[0].pages, function(index, value) {
		if ( value.crop ) {
			factor = value.crop.x; //because a spread should be trunked
		}
		if (Math.round(value.width * factor) > maxImageWidth) {
			maxImageWidth = Math.round(value.width * factor);
		}
		if (value.height > maxImageHeight) {
			maxImageHeight = value.height;
		}
	});
	maxImageWidth *= 2;	//because a book contains always 2 pages

	var extraWidth = 0;
	var extraHeight = 0;
	factor = 1;
	if (((maxImageWidth + extraWidth) <= maxWidth) & ((maxImageHeight + extraHeight) <= maxHeight)) {
		imageWidth = maxImageWidth;
		imageHeight = maxImageHeight;
		boxWidth = maxImageWidth + extraWidth;
		boxHeight = maxImageHeight + extraHeight;
	} else {
		imageWidth = maxWidth - extraWidth;
		imageHeight = maxHeight - extraHeight;

		factor = imageWidth / maxImageWidth;
		if ((imageHeight / maxImageHeight) < factor) {
			factor = imageHeight / maxImageHeight;
		}
		imageWidth = maxImageWidth * factor;
		imageHeight = maxImageHeight * factor;

		boxWidth = imageWidth + extraWidth;
		boxHeight = imageHeight + extraHeight;
	}

	var link = [];
	if ( sub_job.pageproof.length > 1) {
		$.each(sub_job.pageproof, function(versionNumber, versionObject) {
			var temp = " (";
			$.each(sub_job.pageproof, function(index, value) {
				if ( index > 0 ) {
					temp +=  ", ";
				}
				if ( versionNumber == index ) {
					temp += value.version;
				} else {
					temp += "<a class=\"versionLink\" href=\"#\" onclick=\"javascript:{ ";
					temp += "$('.versions').hide(); $('#version" + index + "').show();";
					temp += " }\">" + value.version + "</a>";
				}
			});
			temp += ")";
			link.push( temp );
		});
	}
	var pagelinks = [];
	$.each(sub_job.pageproof, function(versionNumber, versionObject) {
		var temp = "";
		var maxPages = versionObject.pages.length;
		if ( maxPages > 8) {
			temp += "<a class=\"versionLink\" href=\"#\" onclick=\"javascript:$('#flipbook" + versionNumber + "').turn('page',1);\">" + "1" + "</a> ";
			for(var i=1; i < 8; i++) {
				temp += "<a class=\"versionLink\" href=\"#\" onclick=\"javascript:$('#flipbook" + versionNumber + "').turn('page'," + Math.round(i * maxPages / 8) + ");\">" + Math.round(i * maxPages / 8) + "</a> ";
			}
			temp += "<a class=\"versionLink\" href=\"#\" onclick=\"javascript:$('#flipbook" + versionNumber + "').turn('page'," + maxPages + ");\">" + maxPages + "</a>";
		}
		pagelinks.push( temp );
	});

	var html = "";
	$.each(sub_job.pageproof, function(versionNumber, versionObject) {
 		html += "<div class=\"versions\" id=\"version" + versionNumber + "\">";
		html += "<div style=\"height:30px; background-color: rgb(100,100,100);\"><div style=\"height: 7px;\"></div><span style=\"margin-left: 7px; color: rgb(255,255,255);\">" + sub_job.description;
		if ( sub_job.pageproof.length > 1) {
			html += link[versionNumber];
		}
		html += "</span>";
		html += "<span style=\"float: right; color: rgb(255,255,255)\">" + pagelinks[versionNumber] + "</span>";
		html += "</div><div style=\"height:10px;\"></div>";
		html += "<div class=\"flipbooks\" id=\"flipbook" + versionNumber + "\">";
		$.each(versionObject.pages, function(index, value) {
			var src = '/connector/html/getImage/' + escapeRegExp(value.document) + '?session=' + sessionStorage.getItem("session") + '&type=' + value.type + '&id='+ value.id + '&width=' + Math.round(imageWidth/2) + '&height=' + Math.round(imageHeight)  + '&filename=' + escapeRegExp(value.document);
			if ( value.crop ) {
				src += '&crop=' + escapeRegExp( JSON.stringify( value.crop ) );
			}
			html += "<div style=\"background-image:url(" + src + ");\"></div>";
		});
		html += "</div>";
 		html += "</div>";
	});

	var top = (maxHeight / 2) - (boxHeight / 2) + 25;
	$('.tnr_modal').tnr_modal_box({
		top: top,
		width: boxWidth + 50,
		height : boxHeight + 90,
		widthFlipBook : boxWidth,
		heightFlipBook : boxHeight,
		title: null,
		mode: 6,
		description: html
	});

	$('.tnr_modal').click();
}

function openCarousel( element ) {
	var sub_job = job.sub_jobs[element];

	var maxWidth = windowWidth() - 90;
	var maxHeight = windowHeight() - 90;

	var boxWidth = 0;
	var boxHeight = 0;

	var maxImageWidth = 0;
	var maxImageHeight = 0;

	var imageWidth = 0;
	var imageHeight = 0;

	$.each(sub_job.imposeproof, function(index, value) {
		if (value.width > maxImageWidth) {
			maxImageWidth = value.width;
		}
		if (value.height > maxImageHeight) {
			maxImageHeight = value.height;
		}
	});

	var extraWidth = 40;
	var extraHeight = 70;
	var factor = 1;
	if (((maxImageWidth + extraWidth) <= maxWidth) & ((maxImageHeight + extraHeight) <= maxHeight)) {
		imageWidth = maxImageWidth;
		imageHeight = maxImageHeight;
		boxWidth = maxImageWidth + extraWidth;
		boxHeight = maxImageHeight + extraHeight;
	} else {
		imageWidth = maxWidth - extraWidth;
		imageHeight = maxHeight - extraHeight;

		factor = imageWidth / maxImageWidth;
		if ((imageHeight / maxImageHeight) < factor) {
			factor = imageHeight / maxImageHeight;
		}
		imageWidth = maxImageWidth * factor;
		imageHeight = maxImageHeight * factor;

		boxWidth = imageWidth + extraWidth;
		boxHeight = imageHeight + extraHeight;
	}

	var html = "<ul class=\"bxslider\">";
	$.each(sub_job.imposeproof, function(index, value) {
		var src = '/connector/html/getImage/' + value.id + "_" + (index + 1) + '.jpg?session=' + sessionStorage.getItem("session") + '&type=' + value.type + '&id='+ value.id + '&width=' + Math.round(imageWidth) + '&height=' + Math.round(imageHeight)  + '&page=' + (index + 1);
		html += "<li><img title='" +  value.title + "' src='" + src + "' /></li>";
	});
	html += "</ul>"

	var top = (maxHeight / 2) - (boxHeight / 2) + 25;
	$('.tnr_modal').tnr_modal_box({
		top: top,
		width: boxWidth + 50,
		height : boxHeight + 50,
		title: sub_job.description,
		mode: 4,
		description: html
	});

	$('.tnr_modal').click();
}

function testValueFound (array, name, value) {
	var found = false;
	for(var i=0; i < array.length; i++) {
		if (array[i].name == name) {
			found = true;
			switch (typeof value) {
				case 'number':
					var found = parseInt(array[i].value);
					if ((found == value) | (isNaN(found))) {
						return true;
					}
					break;
				default:
					if (array[i].value == value) {
						return true;
					}
			}
		}
	}
	if (!found) { return true };
}

function getParameterFromURL(parameter) {
	var result = "";
	var temp = "";
	var array = document.URL.split("?");	//alleen de parameters over houden
	if (array.length == 2) {
		temp = array[1];
		temp = temp.replace("#", "");
		array = temp.split("&");	//splits alle parameters op
		for(var i=0; i < array.length; i++) {
			temp = array[i].split("=");
			if (temp[0] == parameter) {
				result = temp[1];
			}
		}
	}
	return result;
}

function validateEmail(value) {
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	return reg.test(value);
}

function removeFalseCharacters(testString) {
	testString.value = $.trim(testString.value);		// filter the spaces in front and at the back
}

function ColorLuminance(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}
function windowHeight () {
	var value = $(window).height();
	return value;
}

function windowWidth () {
	var value = $(window).width();
	return value;
}

function resizeUI() {
	var height = windowHeight();
	var width = windowWidth();

	var usedHeight = $('.header').height() + $('.logo').height() + $('.menubar').height() + $('.footer').height();
	$(".content").css( "height", height - usedHeight );
}

function makeColonAtEnd (value) {
	if (value.substring(value.length-1) != ":") {
		value += ":";
	}
	return value;
}

function preventClickTwice (button) {
	$(button).off("click");
	$(button).click(function(event) {
		openAlert("<!--#4DSCRIPT/WEB_LANGUAGE/Uw opdracht wordt verwerkt, even geduld a.u.b.-->", "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
		if (event.preventDefault) event.preventDefault();
		return false;
	});
}

function submitLineHandler (data, method, message) {
	data.push({name: 'session', value: sessionStorage.getItem("session")});
	$.ajax({
		dataType: 'json',
		data: data,
		url: '/connector/html/handleBufferLine',
		type: method,
		success: function (result) {
			if (result.errornumber) {
				openAlert(result.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
			} else {
				if (preferences.access.useShoppingcard) {
					if (preferences.active.shoppingcard) {
						window.location.replace('/module/pages/shoppingcard.shtm');
					} else {
						window.location.replace('/module/pages/main.shtm?message=succesNoShoppingCard');
					}
				} else {
					var lines = [];			//lines which should be processed futher
					lines.push(result.id);
					data = [];				//data for the resource
					data.push({name: 'session', value: sessionStorage.getItem("session")});
					data.push({name: 'lines', value: JSON.stringify(lines)});
					$.ajax({
						dataType: 'json',
						data: data,
						url: '/connector/html/submitBufferLines',
						type: "POST",
						success: function (result) {
							if (result.errornumber) {
								openAlert(result.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
							} else {
								window.location.replace('/module/pages/main.shtm?message=' + message);
							}
						}
					});
				}
			}
		}
	});
}

function checkSession(callback) {
	if (!sessionStorage.getItem("session")) {
		var session = getParameterFromURL('session');
		if (session != "") {
			sessionStorage.setItem('session', session);
			$.getJSON( "/connector/html/getUserStylesheets?session=" + session, function( data ) {
				sessionStorage.setItem('style', JSON.stringify(data));
				$.getJSON( "/connector/html/getUserPreferences?session=" + session, function( data ) {
					sessionStorage.setItem('preferences', JSON.stringify(data));
					preferences = JSON.parse(sessionStorage.getItem('preferences'));
					layouts = JSON.parse(sessionStorage.getItem('style'));
					if ( data.user.invalid ) {
						window.location.href = '/module/pages/index.shtm';
					} else {
						if (document.cookie.indexOf('language=') == -1) {
							document.cookie = "language=" + data.user.language_code;
							location.reload();
						}
						callback();
					}
				});
			});
		} else {
			sessionStorage.setItem( "redirect", window.location.href );
			window.location.href = '/module/pages/index.shtm';
		}
	} else {
		callback();
	}
}

function formatTime (value) {
	var date = new Date(value);
	var timeText = "";
	if (date.getTime()) {
		timeText = ("0" + date.getHours()).slice(-2) + ":" + ("0" + (date.getMinutes() + 1)).slice(-2);
	}
	return timeText;
}

function formatDate (value) {
	var date = new Date(value);
	var dateText = "";
	if (date.getTime()) {
		dateText = ("0" + date.getDate()).slice(-2) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear();
	}
	return dateText;
}

function formatCurrency (value) {
	return accounting.formatMoney(value, preferences.settings.currency.unit + " ", 2, ".", ",");
}

function formatCode (value) {
	return (value == 0) ? "" : value;
}

function formatNumber (value) {
	return accounting.formatMoney(value, "", 0, ".", ",");
}

function unformatNumber (value) {
	return accounting.unformat(value, ",")
}

function formatMeasurement (value) {
	return accounting.formatMoney(value, "", preferences.settings.measurement.rounding, ".", ",");
}

function unformatMeasurement (value) {
	return accounting.unformat(value, ",")
}

function unformatNumberSerializeArray( data, fields ) {
	$.each(fields, function (index, field) {
		for(var i=0; i < data.length; i++) {
			if (data[i].name == field) {
				data[i].value = unformatNumber( data[i].value );
			}
		}
	});
	return data;
}

function basicInit() {
	$.ajaxSetup({
    	headers: {
    		"cache-control": "no-cache"
    	}
	});

	if ($("#logoff")) {
		$("#logoff").click(function(){
			sessionStorage.removeItem("session");
			window.location.href = '/module/pages/index.shtm';
		});
	}
	if ($('.jq-menu')) {
		$('.jq-menu').jqsimplemenu();
	}

	preferences = JSON.parse(sessionStorage.getItem('preferences'));
	layouts = JSON.parse(sessionStorage.getItem('style'));
/* Compability issues */
	if (typeof Array.prototype.forEach != 'function') {
		Array.prototype.forEach = function(callback){
		  for (var i = 0; i < this.length; i++){
			callback.apply(this, [this[i], i, this]);
		  }
		};
	}
	if ( preferences ) {
		$.datetimepicker.setLocale( preferences.user.language_code );
	}
}

$( window ).resize(function() {
	resizeUI();
});

function styleScreen () {
	$("body").css( "background-color", layouts.styles[0].backcolor );

	$(".main").css( "background-color", layouts.styles[0].backcolor )
		.css( "font-family", layouts.styles[0].fontname )
		.css( "font-size", layouts.styles[0].fontsize )
		.css( "font-weight", layouts.styles[0].fontweight )
		.css( "font-style", layouts.styles[0].fontstyle )
		.css( "text-align", layouts.styles[0].fontalign )
		.css( "text-decoration", layouts.styles[0].fontdecoration )
		.css( "color", layouts.styles[0].fontcolor );

	$(".header").css( "background-color", layouts.styles[1].backcolor )
		.css( "height", layouts.styles[1].height )
		.css( "font-family", layouts.styles[1].fontname )
		.css( "font-size", layouts.styles[1].fontsize )
		.css( "font-weight", layouts.styles[1].fontweight )
		.css( "font-style", layouts.styles[1].fontstyle )
		.css( "text-align", layouts.styles[1].fontalign )
		.css( "text-decoration", layouts.styles[1].fontdecoration )
		.css( "color", layouts.styles[1].fontcolor );

	$(".logo").css( "background-color", layouts.styles[2].backcolor )
		.css( "height", layouts.styles[2].height )
		.css( "font-family", layouts.styles[2].fontname )
		.css( "font-size", layouts.styles[2].fontsize )
		.css( "font-weight", layouts.styles[2].fontweight )
		.css( "font-style", layouts.styles[2].fontstyle )
		.css( "text-align", layouts.styles[2].fontalign )
		.css( "text-decoration", layouts.styles[2].fontdecoration )
		.css( "color", layouts.styles[2].fontcolor );
	if (( layouts.logo.height ) && ( layouts.logo.width )) {
		$("#logo").attr( "src", layouts.logo.url );
	} else {
		$("#logo").attr( "src", "" );
	}

	$(".menubar").css( "background-color", layouts.styles[3].backcolor )
		.css( "height", layouts.styles[3].height )
		.css( "font-family", layouts.styles[3].fontname )
		.css( "font-size", layouts.styles[3].fontsize )
		.css( "font-weight", layouts.styles[3].fontweight )
		.css( "font-style", layouts.styles[3].fontstyle )
		.css( "text-align", layouts.styles[3].fontalign )
		.css( "text-decoration", layouts.styles[3].fontdecoration )
		.css( "color", layouts.styles[3].fontcolor );

	$(".content").css( "background-color", layouts.styles[4].backcolor )
		.css( "font-family", layouts.styles[4].fontname )
		.css( "font-size", layouts.styles[4].fontsize )
		.css( "color", layouts.styles[4].fontcolor );

	$(".styles").css( "width", (layouts.general.width - 200 - 100) );
	$(".nocolumn").css( "width", layouts.general.width);
	$(".chapter").css( "font-size", layouts.styles[4].fontsize + 8);

	$(".inputfields").css( "font-family", layouts.styles[4].fontname )
		.css( "font-size", layouts.styles[4].fontsize );

	$(".footer").css( "background-color", layouts.styles[5].backcolor )
		.css( "height", layouts.styles[5].height )
		.css( "font-family", layouts.styles[5].fontname )
		.css( "font-size", layouts.styles[5].fontsize )
		.css( "font-weight", layouts.styles[5].fontweight )
		.css( "font-style", layouts.styles[5].fontstyle )
		.css( "text-align", layouts.styles[5].fontalign )
		.css( "text-decoration", layouts.styles[5].fontdecoration )
		.css( "color", layouts.styles[5].fontcolor );

	$(".main").css( "width", layouts.general.width );

	resizeUI();
}

function styleLinks (position) {
	switch (position) {
		case 3:
			$("a.menu")
				.css( "background-color", layouts.styles[position].backcolor )
				.css( "font-family", layouts.styles[position].fontname )
				.css( "font-size", layouts.styles[position].fontsize )
				.css( "font-weight", layouts.styles[position].fontweight )
				.css( "font-style", layouts.styles[position].fontstyle )
				.css( "text-align", layouts.styles[position].fontalign )
				.css( "text-decoration", layouts.styles[position].fontdecoration )
				.css( "color", layouts.styles[position].fontcolor )
				.mouseenter(function(){
					$(this).css("color", layouts.styles[position].linkcolor);
				})
				.mouseleave(function(){
					$(this).css("color", layouts.styles[position].fontcolor);
				});
			$("li.menu")
				.css( "margin-left", "-1px")
				.css( "margin-top", "-1px")
				.css( "border-left", "1px solid " + layouts.styles[position].fontcolor)
				.css( "border-right", "1px solid " + layouts.styles[position].fontcolor)
				.css( "border-top", "1px solid " + layouts.styles[position].fontcolor);
			$("li.menu:last-child")
				.css( "border-bottom", "1px solid " + layouts.styles[position].fontcolor);
			break;
		case 4:
			$("a.choice")
				.css( "font-family", layouts.styles[position].fontname )
				.css( "font-size", layouts.styles[position].fontsize )
				.css( "font-weight", layouts.styles[position].fontweight )
				.css( "font-style", layouts.styles[position].fontstyle )
				.css( "text-align", layouts.styles[position].fontalign )
				.css( "text-decoration", layouts.styles[position].fontdecoration )
				.css( "color", layouts.styles[position].fontcolor )
				.mouseenter(function(){
					$(this).css("color", layouts.styles[position].linkcolor);
				})
				.mouseleave(function(){
					$(this).css("color", layouts.styles[position].fontcolor);
				});

			$("#grid tr.even")
				.css( "background-color", layouts.styles[position].altcolor )
				.mouseenter(function() {
					$(this).css("background", ColorLuminance(layouts.styles[position].altcolor, 0.2));
				})
				.mouseleave(function() {
     				$(this).css("background", layouts.styles[position].altcolor);
				});
			$("#grid tr.odd")
				.css( "background-color", layouts.styles[position].backcolor )
				.mouseenter(function() {
					$(this).css("background", ColorLuminance(layouts.styles[position].altcolor, 0.2));
				})
				.mouseleave(function() {
     				$(this).css("background", layouts.styles[position].backcolor);
				});

			$(".clusterize td, .clusterize_wrapper, .clusterize_head, .clusterize_foot").css( "border-color", layouts.styles[position].fontcolor );

			$("img.selectImage")
				.css("border", "3px solid " + layouts.styles[position].backcolor)
				.mouseenter(function() {
					$(this).css("border", "3px solid " + layouts.styles[position].linkcolor);
				})
				.mouseleave(function() {
					$(this).css("border", "3px solid " + layouts.styles[position].backcolor);
				});

			break;
		case 5:
			$("a.link")
				.css( "background-color", layouts.styles[position].backcolor )
				.css( "font-family", layouts.styles[position].fontname )
				.css( "font-size", layouts.styles[position].fontsize )
				.css( "font-weight", layouts.styles[position].fontweight )
				.css( "font-style", layouts.styles[position].fontstyle )
				.css( "text-align", layouts.styles[position].fontalign )
				.css( "text-decoration", layouts.styles[position].fontdecoration )
				.css( "color", layouts.styles[position].fontcolor )
				.mouseenter(function(){
					$(this).css("color", layouts.styles[position].linkcolor);
				})
				.mouseleave(function(){
					$(this).css("color", layouts.styles[position].fontcolor);
				});
			break;
	}
}

function setupImage(image) {
	$("#imageViewer").hide();
	$("#imageViewer").off();
	if (image) {
		$(".imageViewer").show();
		if (image.height) {
			$("#imageViewer").css('height', image.height);
		}
		if (image.width) {
			$("#imageViewer").css('width', image.width);
		}
		$("#imageViewer").attr('src', '/connector/html/getImage/' + image.id + '.jpg?session=' + sessionStorage.getItem("session") + '&type=' + image.type + '&id=' + image.id)
		.one('load', function() {
			var contentPosition = $(".content").position();
			var referencePosition = $("#remark").position();
			if ( image.reference ) {
				referencePosition = $("#" + image.reference).position();
			}

			var height = referencePosition.top - contentPosition.top - 20;
			var width = $(this).width() * (height / $(this).height());

			if (height > $(this).height()) {
				height = $(this).height();
				width = width = $(this).width();
			}

			var maxPreviewWidth = ($(".content").width() / 100 * $(".trailing").width()) * 2;
			
			if (width > maxPreviewWidth) {
				height = (height / width) * maxPreviewWidth;
				width = maxPreviewWidth;
			}

			var left = contentPosition.left + layouts.general.width - width - 12;
			var top = contentPosition.top + 10;

			$(".imageViewer").css('left', left);
			$(".imageViewer").css('top', top);
			$(".imageViewer").css('right', left + width);
			$(".imageViewer").css('bottom', top + height);

			$("#imageViewer").css('height', height);
			$("#imageViewer").css('width', width);

			$("#imageViewer").show();
		})
		.error(function() {
			$(".imageViewer").hide();
		})
		.each(function() {
			if(this.complete) $(this).load();
		})
		.on('click', function() {
			if (image.pdf) {
				var url = "/connector/html/getImage/" + image.id + ".pdf?session=" + sessionStorage.getItem("session") + "&type=" + image.type + "&id=" + image.id + "&pdf=" + image.pdf;
				openPDF(url);
			} else {
				openImage(image);
			}
		});
	} else {
		$(".imageViewer").hide();
	}
}

function removePriceColumn ( columnNames ) {
	if ( preferences.access.noPricesVisible ) {
		$.each(columnNames, function( column ) {
			var element = -1;
			$.each(tableSetup.fields, function( item ) {
				if ( tableSetup.fields[item].field == columnNames[column] ) {
					element = item;
				}
			});
			if ( element != -1 ) {
				tableSetup.fields.splice( element , 1);
			}
		});
	}
}

function fillTableContent(tableContent, data, start) {
	$.each(data, function(item) {
		var recordPosition = 0;
		var columnPosition = 1;

		var htmlNode = $.parseHTML(tableContent[item + start]);

		var recordID = data[item].id;
		if (data[item].type) {
			recordID += '\t' + data[item].type;
		}
		htmlNode[0].setAttribute("record", recordID);		

		for(var i=0; i < tableSetup.fields.length; i++) {
			if (tableSetup.fields[i].visible) {
				var fillAsText = false;
				if (tableSetup.fields[i].field) {
					if (tableSetup.fields[i].format) {
						tempFill = tableSetup.fields[i].format(data[item].record[recordPosition].data);
					} else {
						fillAsText = true;
						tempFill = data[item].record[recordPosition].data;
					}
					recordPosition ++;
				} else {
					tempFill = tableSetup.fields[i].format(data[item]);
				}

				if (tableSetup.fields[i].width) {
					htmlNode[0].childNodes[columnPosition-1].width = tableSetup.fields[i].width;
				}
				if ( fillAsText ) {
					htmlNode[0].childNodes[columnPosition-1].textContent = tempFill;
				} else {
					htmlNode[0].childNodes[columnPosition-1].innerHTML = tempFill;
				}

				columnPosition ++;
			} else {
				if (tableSetup.fields[i].field) {
					fieldPosition ++;
				}
			}
		}

		tableContent[item + start] = htmlNode[0].outerHTML;

	});

}

function fillTable(request, callback) {
	var tableData = {};
// fill the requested fields
	tableData.fields = [];
	for(var i=0; i < tableSetup.fields.length; i++) {
		if ( tableSetup.fields[i].field ) {
			tableData.fields.push(tableSetup.fields[i].field);
		}
	}
// set the sort order
	tableData.sorts = [];
	for(var i=0; i < tableSetup.sorting.length; i++) {
		var value = false;
		if(tableSetup.sorting[i].direction === "asc") {
			value = true;
		}
		var tempObj = {};
		tempObj[tableSetup.sorting[i].field] = value;
		tableData.sorts.push(tempObj);
	}
// set the filter order
	tableData.filter = [];
	if (tableSetup.distinct) {
		$.each(tableSetup.distinct, function(distinctItem) {
			if ($("#group" + distinctItem).val()) {
				var tempObj = {};
				tempObj[tableSetup.distinct[distinctItem]] = $("#group" + distinctItem).val();
				tableData.filter.push(tempObj);
			}
		});
	}
	if (($("#searchValue").val()) && ($("#searchValue").val() != "")) {
		var name = $("#searchSelect").val();
		var value = $("#searchValue").val();
		var tempObj = {};
		tempObj[name] = value;
		tableData.filter.push(tempObj);
	}
	if ( !$("#searchNoDate").is(':checked') ) {
		if (($("#searchStartDate").val()) && ($("#searchStartDate").val() != "")) {
			var tempObj = {};
			var name = "date";
			var value = $("#searchStartDate").val();
			tempObj[name] = value;
			var name = "comparison";
			var value = ">=";
			tempObj[name] = value;
			tableData.filter.push(tempObj);
		}
		if (($("#searchEndDate").val()) && ($("#searchEndDate").val() != "")) {
			var tempObj = {};
			var name = "date";
			var value = $("#searchEndDate").val();
			tempObj[name] = value;
			var name = "comparison";
			var value = "<";
			tempObj[name] = value;
			tableData.filter.push(tempObj);
		}
	}
// set the init function
	if (request.action == "init") {
		tableData.distinct = tableSetup.distinct;
	}
	$.ajax({
		url: "/connector/html/listTables",
		type: "POST",
		data: { session : sessionStorage.getItem("session"), table: tableSetup.table, page: 1, records: 500, data: JSON.stringify(tableData) },
		success: function(result) {			
			if (result.errornumber) {
				openAlert(result.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
			} else {
				if (request.action == "init") {
					if (result.distinct) {
						$.each(tableSetup.distinct, function(distinctItem) {
							var options = $("#group" + distinctItem);
							options.empty();
							options.append($("<option />").val(null).text("<!--#4DSCRIPT/WEB_LANGUAGE/Alle-->"));
							var distinctName = tableSetup.distinct[distinctItem];
							if (result.distinct[distinctName]) {
								$.each(result.distinct[distinctName], function(item) {
									if (result.distinct[distinctName][item] != "") {
										options.append($("<option />").val(result.distinct[distinctName][item]).text(result.distinct[distinctName][item]));
									}
								});
							}
						});
					}
					var options = $("#searchSelect");
					options.empty();
					for(var i=0; i < tableSetup.fields.length; i++) {
						if (tableSetup.fields[i].searchable) {
							options.append($("<option />").val(tableSetup.fields[i].field).text(tableSetup.fields[i].label));
						}
					}
				}

// fill the table
				var tempHeader = "";
				var tempFooter = "";

				var placeHolder = $("#gridPlaceHolder");
				placeHolder.empty();
				if (result.filterrecords == 0) {
					placeHolder.append("<div><!--#4DSCRIPT/WEB_LANGUAGE/Er zijn geen resultaten gevonden!!!--></div>");
				} else {
					var tempClass;
					var tempFill = "";

// draw the header
					if (tableSetup.header) {
						tempHeader += "<thead><tr>";
						for(var i=0; i < tableSetup.fields.length; i++) {
							if (tableSetup.fields[i].visible) {
								tempClass = tableSetup.fields[i].alignment;
								if (tableSetup.fields[i].sortable) {
									tempClass += " sort";
								}
								tempHeader += "<td class='" + tempClass + "'";
								if (tableSetup.fields[i].sortable) {
									tempHeader += " field='" + tableSetup.fields[i].field + "'";
								}

								if (tableSetup.fields[i].width) {
									tempHeader += " style='width: " + tableSetup.fields[i].width + ";'";
								}
								tempHeader += ">";

								if (typeof tableSetup.fields[i].label === "function") {
									tempHeader += tableSetup.fields[i].label();
								} else {
									tempHeader += tableSetup.fields[i].label;
								}
								if (tableSetup.sorting[0].field === tableSetup.fields[i].field) {
									if (tableSetup.sorting[0].direction === "asc") {
										tempHeader += " &#9650;"
									} else {
										tempHeader += " &#9660;"
									}
								}
								tempHeader += "</td>"
							}
						}
						tempHeader += "</tr></thead>";
					}

// draw the footer
					if (tableSetup.footer) {
						tempFooter += "<tfoot><tr>";
						for(var i=0; i < tableSetup.fields.length; i++) {
							if (tableSetup.fields[i].visible) {
								tempFooter += "<td class='" + tableSetup.fields[i].alignment + "'"
								if (tableSetup.fields[i].width) {
									tempFooter += " style='width: " + tableSetup.fields[i].width + ";'";
								}
								tempFooter +=">";
								switch (i) {
									case 0:
										tempFooter += formatNumber(result.filterrecords) + " <!--#4DSCRIPT/WEB_LANGUAGE/van--> " + formatNumber(result.totalrecords);
										break;
									case 4:
										if ((tableSetup.table == 0) && (tableSetup.fields[i].field == "vat")) {
											tempFooter += "<!--#4DSCRIPT/WEB_LANGUAGE/Exclusief:--><br /><!--#4DSCRIPT/WEB_LANGUAGE/BTW:--><br /><!--#4DSCRIPT/WEB_LANGUAGE/Inclusief:-->";
										}
										break;
									case 5:
										if ((tableSetup.table == 0) && (tableSetup.fields[i].field == "price")) {
											tempFooter += formatCurrency(bufferlines.exclusive) + "<br />" + formatCurrency(bufferlines.vat) + "<br />" + formatCurrency(bufferlines.inclusive);
										}
										if ( $("#group0").val() != "") {
											if ((tableSetup.table == 10) && (tableSetup.fields[i].field == "add")) {
												var tempTotal = 0;
												$.each(result.data, function(itemNumber) {
													tempTotal += result.data[itemNumber].record[5].data;
												});
												tempFooter += formatNumber(tempTotal);
											}
										}
										break;
									case 6:
										if ( $("#group0").val() != "") {
											if ((tableSetup.table == 10) && (tableSetup.fields[i].field == "subtract")) {
												var tempTotal = 0;
												$.each(result.data, function(itemNumber) {
													tempTotal += result.data[itemNumber].record[6].data;
												});
												tempFooter += formatNumber(tempTotal);
											}
										}
										break;
								}
								tempFooter += "</td>";
							}
						}
						tempFooter += "</tr></tfoot>";
					}

					tempFill += "<div class=\"clusterize\">";
					if (tempHeader!="") {
						tempFill += "  <table class=\"clusterize clusterize_head\" >" + tempHeader + "</table>";
					}
					tempFill += "  <div id=\"scrollArea\" class=\"clusterize-scroll\">";
					tempFill += "    <table class=\"clusterize\" id=\"grid\">";
					tempFill += "      <tbody id=\"contentArea\" class=\"clusterize-content\">";
					tempFill += "        <tr class=\"clusterize-no-data\">";
					tempFill += "          <td>Loading data…</td>";
					tempFill += "        </tr>";
					tempFill += "      </tbody>";
					tempFill += "    </table>";
					tempFill += "  </div>";
					if (tempFooter!="") {
						tempFill += "  <table class=\"clusterize clusterize_foot\" >"+tempFooter+"</table>";
					}
					tempFill += "</div>";

					placeHolder.append(tempFill);

// fill the body
					var tableContent = [];

					var tempLine = "";
					for(var i=0; i < tableSetup.fields.length; i++) {
						if (tableSetup.fields[i].visible) {
							tempLine += "<td class='" + tableSetup.fields[i].alignment + "'";

							if (tableSetup.fields[i].width) {
								tempLine += " style='width: " + tableSetup.fields[i].width + ";'";
							}

							tempLine += ">&nbsp;</td>";
						}
					}


					for(var j=0; j < result.filterrecords; j++) {
						tempFill = "";
						if (j == 0) {
							tempFill += "<tr class='first even' id='record_"+j+"'>";
						} else {
							tempFill += "<tr class='" + (j % 2 == 0 ? "even" : "odd") + "' id='record_"+j+"'>";
						}
						tempFill += tempLine;
						tempFill += "</tr>";
						tableContent.push(tempFill);
					}

					fillTableContent(tableContent, result.data, 0);

					var clusterize = new Clusterize({
						 rows: tableContent,
						 scrollId: 'scrollArea',
						 contentId: 'contentArea',
						 extra_row_data: tempLine,
						 callbacks: {
							clusterChanged: function() {
								styleLinks(4);
// setup single click
								$("#grid tr td .choice").click(function(event) {
//									event.preventDefault();
									event.stopPropagation();
								});

								$("#grid tr").click(function(event) {
									if (tableSetup.doubleClickHandler) {
										tableSetup.doubleClickHandler($(this).attr('record'));
									}
								});
							}
						}
					});


					for(var i=1; i < result.filterpages; i++) {
						$.ajax({
							url: "/connector/html/listTables",
							type: "POST",
							data: { session : sessionStorage.getItem("session"), table: tableSetup.table, page: (i + 1), records: 500, data: JSON.stringify(tableData) },
							success: function(result) {
								fillTableContent(tableContent, result.data, (result.currentpage - 1) * 500);
								clusterize.update(tableContent);
								styleLinks(4);
							}
						});
					}
// generate the table

					tableScrollHeight(tableSetup.height);
					tableHeaderWidth();
					styleLinks(4);
// setup sorting
					$("td.sort").click(function(event) {
						var temp = $(this).attr('field');
						if (temp == tableSetup.sorting[0].field) {
							if (tableSetup.sorting[0].direction === "asc") {
								tableSetup.sorting[0].direction = "desc";
							} else {
								tableSetup.sorting[0].direction = "asc";
							}
						} else {
							tableSetup.sorting[0].field = temp;
						}

						fillTable({"action": "sort"});
					});
// setup single click
					$("#grid tr td .choice").click(function(event) {
//						event.preventDefault();
						event.stopPropagation();
					});

					$("#grid tr").click(function(event) {
						if (tableSetup.doubleClickHandler) {
							tableSetup.doubleClickHandler($(this).attr('record'));
						}
					});
				}
// make visible
				if (request.action == "init") {
					$(".main").css( "visibility","visible");
					if (callback) {
						callback(result);
					}
				}
			}
		}
	});
}

function fillImage(request, callback) {
	var tableData = {};
// fill the requested fields
	tableData.fields = [];
	for(var i=0; i < imageSetup.fields.length; i++) {
		tableData.fields.push(imageSetup.fields[i].field);
	}
// set the sort order
	tableData.sorts = [];
	for(var i=0; i < imageSetup.sorting.length; i++) {
		var value = false;
		if(imageSetup.sorting[i].direction === "asc") {
			value = true;
		}
		var tempObj = {};
		tempObj[imageSetup.sorting[i].field] = value;
		tableData.sorts.push(tempObj);
	}
// set the filter order
	tableData.filter = [];
	if (imageSetup.distinct) {
		$.each(imageSetup.distinct, function(distinctItem) {
			if ($("#group" + distinctItem).val()) {
				var tempObj = {};
				tempObj[imageSetup.distinct[distinctItem]] = $("#group" + distinctItem).val();
				tableData.filter.push(tempObj);
			}
		});
	}
	if (($("#searchValue").val()) && ($("#searchValue").val() != "")) {
		var name = $("#searchSelect").val();
		var value = $("#searchValue").val();
		var tempObj = {};
		tempObj[name] = value;
		tableData.filter.push(tempObj);
	}
// set the init function
	if (request.action == "init") {
		tableData.distinct = imageSetup.distinct;
	}

	$.ajax({
		url: "/connector/html/listTables",
		type: "POST",
		data: { session : sessionStorage.getItem("session"), table: imageSetup.table, page: 1, records: 100, data: JSON.stringify(tableData) },
		success: function(result) {
			if (result.errornumber) {
				openAlert(result.errortext, "<!--#4DSCRIPT/WEB_LANGUAGE/Fout-->");
			} else {
				if (request.action == "init") {
					// setup distinct values
					if (result.distinct) {
						$.each(imageSetup.distinct, function(distinctItem) {
							var options = $("#group" + distinctItem);
							options.empty();
							options.append($("<option />").val(null).text("<!--#4DSCRIPT/WEB_LANGUAGE/Alle-->"));
							var distinctName = imageSetup.distinct[distinctItem];
							if (result.distinct[distinctName]) {
								$.each(result.distinct[distinctName], function(item) {
									if (result.distinct[distinctName][item] != "") {
										options.append($("<option />").val(result.distinct[distinctName][item]).text(result.distinct[distinctName][item]));
									}
								});
							}
						});
					}
					// setup search select
					var options = $("#searchSelect");
					options.empty();
					for(var i=0; i < imageSetup.fields.length; i++) {
						if (imageSetup.fields[i].searchable) {
							options.append($("<option />").val(imageSetup.fields[i].field).text(imageSetup.fields[i].label));
						}
					}
				}
				var defaultHeight = layouts.general.heightImage;
				var columns = layouts.general.columnsImage;
				var maxWidth = parseInt(($(".content").width() - 100) / columns);
				var maxHeight = 0;
				var rows = Math.floor(result.data.length / columns);
				if ((result.data.length % columns) != 0) {
					rows++;
				}
				var element = 0;
				$("#gridPlaceHolder").empty();
				if (result.filterrecords == 0) {
					$("#gridPlaceHolder").append("<div><!--#4DSCRIPT/WEB_LANGUAGE/Er zijn geen resultaten gevonden!!!--></div>");

					styleLinks(4);

					$(".main").css( "visibility","visible");
				} else {
					$("#gridPlaceHolder").append('<table id="image-table" class="content_table"></table>');
					for (var i=0; i < rows; i++) {
						$("#image-table").append('<tr class=\"imageRow' + i + '\"></tr>');
						for (var j=0; j < columns; j++) {
							$(".imageRow" + i).append('<td class=\"placeholderImage\" id=\"selectImage' + element + '\"></td>');
							if (element < result.data.length) {
								if (defaultHeight) {
									var imageWidth = maxWidth;
									var imageHeight = defaultHeight;
									maxHeight = defaultHeight;
									if (result.data[element].image) {
										var url = "/connector/html/getImage/" + result.data[element].id + ".jpg?session=" + sessionStorage.getItem("session") + "&type=" + imageSetup.image + "&id=" + result.data[element].id + "&width=" + imageWidth + "&height=" + imageHeight + "&background=" + encodeURIComponent( layouts.styles[4].backcolor );
										$("#selectImage" + element).append('<div class="specialImage"><img id=\"' + result.data[element].id + '\" title=\"' + result.data[element].record[0].data + '\" alt=\"' + result.data[element].record[0].data + '\" height=\"' + imageHeight + '\" width=\"' + imageWidth + '\" class=\"selectImage\" src=\"' + url + '\"/><h2><span>' + result.data[element].record[0].data + '</span></h2></div>');
									} else {
										var url = "/connector/html/getImage/nopicture.jpg?session=" + sessionStorage.getItem("session") + "&type=" + imageSetup.image + "&id=0&width=" + imageWidth + "&height=" + imageHeight + "&background=" + encodeURIComponent( layouts.styles[4].backcolor );
										$("#selectImage" + element).append('<div class="specialImage"><img id=\"' + result.data[element].id + '\" title=\"' + result.data[element].record[0].data + '\" alt=\"' + result.data[element].record[0].data + '\" height=\"' + imageHeight + '\" width=\"' + imageWidth + '\" class=\"selectImage\" src=\"' + url + '\"/><h2><span>' + result.data[element].record[0].data + '</span></h2></div>');
									}
								} else {
									if (result.data[element].image) {
										var factor = maxWidth / result.data[element].image.width;
										if ((maxWidth / result.data[element].image.height) < factor) {
											factor = maxWidth / result.data[element].image.height;
										}

										var imageWidth = Math.round(result.data[element].image.width * factor);
										var imageHeight = Math.round(result.data[element].image.height * factor);

										if (maxHeight < imageHeight) {
											maxHeight = imageHeight;
										}
									
										var url = "/connector/html/getImage/" + result.data[element].id + ".jpg?session=" + sessionStorage.getItem("session") + "&type=" + imageSetup.image + "&id=" + result.data[element].id + "&width=" + imageWidth + "&height=" + imageHeight;
										$("#selectImage" + element).append('<div class="specialImage"><img id=\"' + result.data[element].id + '\" title=\"' + result.data[element].record[0].data + '\" alt=\"' + result.data[element].record[0].data + '\" height=\"' + imageHeight + '\" width=\"' + imageWidth + '\" class=\"selectImage\" src=\"' + url + '\"/><h2><span>' + result.data[element].record[0].data + '</span></h2></div>');
									} else {
										if (maxHeight < (maxWidth/2)) {
											maxHeight = (maxWidth/2);
										}

										var url = "/connector/html/getImage/nopicture.jpg?session=" + sessionStorage.getItem("session") + "&type=" + imageSetup.image + "&id=0&width=" + (maxWidth/2) + "&height=" + (maxWidth/2);
										$("#selectImage" + element).append('<div class="specialImage"><img id=\"' + result.data[element].id + '\" title=\"' + result.data[element].record[0].data + '\" alt=\"' + result.data[element].record[0].data + '\" height=\"' + (maxWidth/2) + '\" width=\"' + (maxWidth/2) + '\" class=\"selectImage\" src=\"' + url + '\"/><h2><span>' + result.data[element].record[0].data + '</span></h2></div>');
									}
								}
							}
							element++;
						}
					}
					$(".placeholderImage").css('width', maxWidth);
					maxHeight += 50;
					$(".placeholderImage").css('height', maxHeight);
					$(".specialImage h2 span").css( "max-width", maxWidth);
				
					styleLinks(4);

					$(".main").css( "visibility","visible");

					$(".selectImage").click( function() {
						if (imageSetup.doubleClickHandler) {
							imageSetup.doubleClickHandler( this.id );
						}
					});
				}
			}
		}
	});
}