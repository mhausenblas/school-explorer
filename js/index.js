/*
 * @category  UI interaction
 * @package   
 * @author    Michael Hausenblas <michael.hausenblas@deri.org>
 * @copyright Public Domain
 * @license   
 * @link      http://deri.ie/
 */


var SE = { // School Explorer
	
	C: { // constant SE-wide values
		NEAR_API_BASE: "near?center=", //such as near?center=53.2895,-9.0820&religion=Catholic&gender=Gender_Boys
		
		DEFAULT_ZOOM_FACTOR : 13, // the default zoom factor on map init ( 7 ~ all Ireland, 10 - 12 ~ county-level, > 12 ~ village-level)
		MAP_ELEMENT_ID: "school_map", // the @id of the map, such as in <div id='school_map'></div>
		DETAILS_ELEMENT_ID: "school_details", // the @id of the details, such as in <div id='school_details'></div>
		CONTAINER_ELEMENT_ID: "content", // the @id of the map and details container, such as in <div id='content'>...</div>
		ADDRESS_FIELD_ID : "address", // the @id of the address input field
		FINDSCHOOL_BTN_ID : "find_school", // the @id of the 'find school' button
		MARKER_DYNAM_ID : "dynam" // the @id of the canvas we draw the dynamic markers in
	},
	
	G: { // SE-wide values
		smap : undefined, // the google.maps.Map object
		smapWidth : 0.9, // the preferred width of the map
		smapHeight : 2, // the preferred height of the map
	},
	
	handleInteraction: function(){
		// the search button has been hit, show nearby schools
		$('#' + SE.C.FINDSCHOOL_BTN_ID).click(function(){
			SE.showSchools();
		});
		$('#' + SE.C.FINDSCHOOL_BTN_ID).mousedown(function(){
			$(this).removeClass('submit');
		});
		$('#' + SE.C.FINDSCHOOL_BTN_ID).mouseup(function(){
			$(this).addClass('submit');
		});
		
		// the ENTER key has been hit in the address field, show nearby schools
		$('#' + SE.C.ADDRESS_FIELD_ID).keypress(function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if (code == 13) {
				SE.showSchools();
			}
		});
	},
	
	showSchools: function() {
		var a = $('#' + SE.C.ADDRESS_FIELD_ID).val();
		SE.position2Address(a, function(lat, lng){
			console.log("For address [" + a + "] I found the following location: [" + lat + "," + lng + "]");
						
			// now, get the schools around this address
			$.getJSON(SE.C.NEAR_API_BASE + lat + "," + lng, function(data, textStatus){
				if(data) {
					var b = "";
					var rows = data.data;
					
					// create the map centered on the location of the address
					SE.initMap(lat, lng);
					// cheap dump of all nearby schools -  TODO: make the school listing pretty
					b += "<div>All:</div>";
					for(i in rows) {
						var row = rows[i];
						b += "<div>";
						b += "<a href='" + row["school"].value + "'>" + row["label"].value + "</a>";
						b += "</div>";
						SE.addSchoolMarker(row);
					}
					$('#' + SE.C.DETAILS_ELEMENT_ID).html(b);
				}
			});
		});
	},
	
	position2Address: function(address, callback){
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': address, 'region': 'ie'}, function(data, status) {
			if(status == google.maps.GeocoderStatus.OK) {  
				var location = data[0].geometry.location,
					lat = location.lat(),
					lng = location.lng();
				if(location) { // we have both values
					callback(lat, lng);
				}
			}
			else {
				alert("Sorry, I didn't find the address you've provided. Try again, please ...");
			}
		});
	},
	
	initMap: function(mapCenterLat, mapCenterLng) {
		var mapOptions = { 
			zoom: SE.C.DEFAULT_ZOOM_FACTOR,
			center: new google.maps.LatLng(mapCenterLat, mapCenterLng),
			mapTypeId: google.maps.MapTypeId.HYBRID,
			overviewMapControl: true,
			overviewMapControlOptions: {
				position: google.maps.ControlPosition.BOTTOM_RIGHT,
				opened: true
			}
		};
		// create the map with options from above
		SE.G.smap = new google.maps.Map(document.getElementById(SE.C.MAP_ELEMENT_ID), mapOptions);
		
		// make map fit in the container
		$('#' + SE.C.MAP_ELEMENT_ID).width($('#' + SE.C.CONTAINER_ELEMENT_ID).width() * SE.G.smapWidth);
		$('#' + SE.C.MAP_ELEMENT_ID).height($('#' + SE.C.CONTAINER_ELEMENT_ID).height() * SE.G.smapHeight);
	},
	
	addSchoolMarker: function(school){
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(school["lat"].value, school["long"].value),
			map: SE.G.smap,
			icon: new google.maps.MarkerImage(SE.drawMarker(school["label"].value, school["religion"].value, school["gender"].value)),
			title: school["label"].value
		});
		
		google.maps.event.addListener(marker, "click", function() {
			SE.addSchoolInfo(marker, school);
		});
	},
	
	addSchoolInfo: function(marker, school){
		var infowindow = new google.maps.InfoWindow({
		    content: school["label"].value + " " + school["address1"].value + " " + school["address2"].value
		});
		infowindow.open(SE.G.smap, marker);
	},
	
	drawMarker: function(name, religion, gender){
		// see also http://www.html5canvastutorials.com/
		var canvas = document.getElementById(SE.C.MARKER_DYNAM_ID); // our scribble board
		var context = canvas.getContext('2d');
		var topLeftCornerX = 0,
			topLeftCornerY = 0,
			width = 40,
			height = 20; // container dimensions

		context.lineWidth = 1;
		context.strokeStyle = "#000";
		context.fillStyle = '#000';

		// create the container
		context.beginPath();
		context.rect(topLeftCornerX, topLeftCornerY, width, height);
		context.fill();
		context.stroke();

		// create the pin
		context.beginPath();
		context.moveTo(20, 60);
		context.lineTo(20, 21);
		context.fill();
		context.lineWidth = 2;
		context.stroke();
		
		// create the color-coded indicators for gender
		topLeftCornerX = 2;
		topLeftCornerY = 2;
		width = 5;
		height = 16;
		context.beginPath();
		context.rect(topLeftCornerX, topLeftCornerY, width, height);
		context.fillStyle = SE.getGenderCoding(gender);
		context.fill();

		// create the color-coded indicators for religion
		topLeftCornerX = 9;
		topLeftCornerY = 2;
		width = 5;
		height = 16;
		context.beginPath();
		context.rect(topLeftCornerX, topLeftCornerY, width, height);
		context.fillStyle = SE.getReligionCoding(religion);
		context.fill();

		// display a bit of the school name
		context.fillStyle = '#fff';
		context.font = "6pt Arial";
		context.fillText(name.substring(0, 5), 16, 8);
		context.fillText(name.substring(5, 8) + ' ...', 16, 16);

		return canvas.toDataURL("image/png");
	},
	
	getGenderCoding: function(gender){
		if(gender.indexOf('Boys') > 0) return '#11f'; // boys-only is blue
		if(gender.indexOf('Girls') > 0) return '#f6f'; // girls-only is pink
		return '#fff'; // mixed is white
	},
	
	getReligionCoding: function(religion){
		if(religion.indexOf('Catholic') > 0) return '#ff3'; // catholic is yellow
		return '#fff'; // all others are white
	}
	

};

$(document).ready(function(){
	if ($("#form_search")) {
		SE.handleInteraction();
		// $('#' + SE.C.DETAILS_ELEMENT_ID).html("<div style='background: #303030; padding: 1em;'><img src='" + SE.drawMarker("test school", "http://data-gov.ie/ReligiousCharacter/Catholic", "http://education.data.gov.uk/ontology/school#Gender_Boys") + "' alt='test'/></div>");
	}
});
