/*
 * @category  UI interaction
 * @package   
 * @author    Michael Hausenblas <michael.hausenblas@deri.org>
 * @copyright Public Domain
 * @license   
 * @link      http://deri.ie/
 */


var SE = { // School Explorer
	
	C : { // constant SE-wide values
		DEBUG : true,
		
		NEAR_API_BASE : "near?center=", // such as near?center=53.2895,-9.0820&religion=Catholic&gender=Gender_Boys
		ENROLMENT_API_BASE : "enrolment?school_id=", // such as enrolment?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K
		INFO_API_BASE : "info?school_id=", // such as info?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K
		
		DEFAULT_ZOOM_FACTOR : 13, // the default zoom factor on map init ( 7 ~ all Ireland, 10 - 12 ~ county-level, > 12 ~ village-level)

		LEGEND_ELEMENT_ID : "school_legend", // the @id of the legend, such as in <div id='school_legend'></div>
		MAP_ELEMENT_ID : "school_map", // the @id of the map
		DETAILS_ELEMENT_ID : "school_details", // the @id of the details
		CONTAINER_ELEMENT_ID : "content", // the @id of the map and details container
		ADDRESS_FIELD_ID : "address", // the @id of the address input field
		RELIGION_FIELD_ID : "religion", // the @id of the religion input field
		GENDER_FIELD_ID : "gender", // the @id of the gender input field
		FINDSCHOOL_BTN_ID : "find_school", // the @id of the 'find school' button
		MARKER_DYNAM_ID : "dynam", // the @id of the canvas we draw the dynamic markers in
	},
	
	G : { // SE-wide values
		smap : undefined, // the google.maps.Map object
		smapWidth : 0.75, // the preferred width of the map
		smapHeight : 1, // the preferred height of the map
		genderCCodes : { 'boys' : '#11f', 'girls' : '#f6f', 'mixed' : '#fff' },
		religionCCodes : { 'catholic' : '#ff3', 'others' : '#fff' },
		iwlist : {}, // associative array (school ID -> info window)*
		chartAPI : undefined, // the jgcharts object http://www.maxb.net/scripts/jgcharts
	},
	
	
	go : function(){
		SE.G.chartAPI = new jGCharts.Api(); 
		$("input:text:visible:first").focus(); // set focus to the first input field which should be the address field
		SE.initLegend();
		SE.handleInteraction();
	},
	
	initLegend : function(){
		var buf = ["<div class='sublegend'><h2>Gender</h2>"];
		$.each(SE.G.genderCCodes, function(index, val){
			buf.push("<div style='background:" + SE.G.genderCCodes[index] +";'>" + index + "</div>");	
		});
		buf.push("</div><div class='sublegend'><h2>Religion</h2>");
		$.each(SE.G.religionCCodes, function(index, val){
			buf.push("<div style='background:" + SE.G.religionCCodes[index] +";'>" + index + "</div>");	
		});
		buf.push("</div>");
		$('#' + SE.C.LEGEND_ELEMENT_ID).html(buf.join(""));
	},
	
	handleInteraction : function(){
		// on window resize, fit map
		$(window).resize(function() { 
			$('#' + SE.C.MAP_ELEMENT_ID).width($('#' + SE.C.CONTAINER_ELEMENT_ID).width() * SE.G.smapWidth);
		});
		
		
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
		
		//TODO: filter based on religion and/or gender
		
	},
	
	showSchools  : function() {
		var a = $('#' + SE.C.ADDRESS_FIELD_ID).val();
		var r = $('#' + SE.C.RELIGION_FIELD_ID).val();
		var g = $('#' + SE.C.GENDER_FIELD_ID).val();
		
		$('#' + SE.C.LEGEND_ELEMENT_ID).slideDown("slow");// show the legend
		
		SE.position2Address(a, function(lat, lng){
			if(SE.C.DEBUG){
				console.log("For address [" + a + "] I found the following location: [" + lat + "," + lng + "]");
				console.log("You asked for: religion: [" + r + "] and gender: [" + g + "]");				
			}
			// now, get the schools around this address
			$.getJSON(SE.buildNearSchoolsURI(lat, lng, r, g), function(data, textStatus){
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
	
	// for example: near?center=53.289,-9.0820&religion=Catholic&gender=Gender_Boys
	buildNearSchoolsURI : function(lat, lng, religion, gender){
		return (religion == "") ? SE.C.NEAR_API_BASE + lat + "," + lng + "&gender=" + gender : SE.C.NEAR_API_BASE + lat + "," + lng + "&religion=" + religion + "&gender=" + gender;
	},
	
	position2Address : function(address, callback){
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
	
	initMap : function(mapCenterLat, mapCenterLng) {
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
		
		// mark 'home', that is the location of the address the user entered
		new google.maps.Marker({
			position: new google.maps.LatLng(mapCenterLat, mapCenterLng),
			map: SE.G.smap,
			title: $('#' + SE.C.ADDRESS_FIELD_ID).val() + " (home)"
		});
		
		// make map fit in the container
		$('#' + SE.C.MAP_ELEMENT_ID).width($('#' + SE.C.CONTAINER_ELEMENT_ID).width() * SE.G.smapWidth);
	},
	
	addSchoolMarker : function(school){
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(school["lat"].value, school["long"].value),
			map: SE.G.smap,
			icon: new google.maps.MarkerImage(SE.drawMarker(school["label"].value, school["religion"].value, school["gender"].value)),
			title: school["label"].value
		});
		
		google.maps.event.addListener(marker, "click", function() {
			SE.renderSchool(school, function(iwcontent){
				SE.G.iwlist[school["school"].value] = SE.addSchoolInfo(marker, iwcontent); // remember info windows indexed by school ID
			});
		});
	},
	
	renderSchool : function(school, callback){
		var buf = ["<div class='school_info'>"];
		var reli = school["religion"].value;
		buf.push("<h2>" + school["label"].value + "</h2>");
		buf.push("<div class='summary'>");
		buf.push("<span class='head'>Address:</span> " + school["address1"].value + " " + school["address2"].value + ", " + school["region"].value + " | ");
		buf.push("<span class='head'>Religion:</span> " + reli.substring(reli.lastIndexOf('/') + 1).toLowerCase() + " | ");
		buf.push("<span class='head'>Gender:</span> " + school["gender"].value);
		buf.push("</div>"); // EO summary
		SE.renderSchoolEnrolment(school["school"].value, buf, callback); // render the enrollment stats
	},
	
	addSchoolInfo : function(marker, iwcontent){
		var infowindow = new google.maps.InfoWindow({
		    content: iwcontent
		});
		infowindow.open(SE.G.smap, marker);
		return infowindow;
	},
		
	drawMarker : function(name, religion, gender){
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
	
	getGenderCoding : function(gender){
		//TODO: replace with globals
		if(gender.indexOf('Boys') > 0) return '#11f'; // boys-only is blue
		if(gender.indexOf('Girls') > 0) return '#f6f'; // girls-only is pink
		return '#fff'; // mixed is white
	},
	
	getReligionCoding : function(religion){
		//TODO: replace with globals
		if(religion.indexOf('Catholic') > 0) return '#ff3'; // catholic is yellow
		return '#fff'; // all others are white
	},
	
	renderSchoolEnrolment : function(schoolID, buf, callback){
		buf.push("<div class='enrolment'><h3>Enrolment</h3>");
		var xdata = [], ydata = [];
		
		// fill the chart's data via API
		$.getJSON(SE.C.ENROLMENT_API_BASE + encodeURIComponent(schoolID), function(data) {
			$.each(data.data, function(i, grade){
				xdata.push(SE.cleangrades(grade.schoolGrade.value)); // TODO: replace w/ label once API offers it
				ydata.push(parseInt(grade.numberOfStudents.value));
			});
			if(SE.C.DEBUG){
				console.log("Got enrolment data: [" + xdata + " / "+ ydata + "]");
			}
			buf.push($('<div>').html($('<img>').attr('src', SE.G.chartAPI.make({ 
				data : ydata,  
				legend : ['no. children'], 
				axis_labels : xdata, 
				size : '400x200', 
				bar_width : 30,
				type : 'bvg', 
				colors : ['009933']
			}))).html());
			buf.push("</div>"); // EO enrolment
			buf.push("</div>"); // EO school_info 
			callback(buf.join(""));
		});
	},
	
	cleangrades : function(grade) {
		grade = grade.substring(grade.lastIndexOf("/"));
		if(grade.indexOf('FirstYear') > 0) return "1st";
		if(grade.indexOf('SecondYear') > 0) return "2nd";
		if(grade.indexOf('ThirdYear') > 0) return "3rd";
		if(grade.indexOf('All_Excluding_TY') > 0) return "other";
	}
};

$(document).ready(function(){
	if ($("#form_search")) {
		SE.go();
		// $('#' + SE.C.DETAILS_ELEMENT_ID).html("<div style='background: #303030; padding: 1em;'><img src='" + SE.drawMarker("test school", "http://data-gov.ie/ReligiousCharacter/Catholic", "http://education.data.gov.uk/ontology/school#Gender_Boys") + "' alt='test'/></div>");
		//$('#' + SE.C.DETAILS_ELEMENT_ID).html(SE.renderSchoolEnrolment("http://data-gov.ie/school/62210K"));
	}
});
