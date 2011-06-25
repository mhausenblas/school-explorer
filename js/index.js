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
		AGEGROUPS_API_BASE : "agegroups?school_id=", // such as agegroups?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F63000E
		INFO_API_BASE : "info?school_id=", // such as info?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K

		MAX_SCHOOL_LISTING : 10, // determines how many schools are rendered below the map
		MAP_TYPE : google.maps.MapTypeId.ROADMAP, // the type of the map, see http://code.google.com/apis/maps/documentation/javascript/reference.html#MapTypeId

		CONTAINER_ELEMENT_ID : "content", // the @id of the map and details container
		RESULT_ELEMENT_ID : "school_results", // the @id of the legend
		LEGEND_ELEMENT_ID : "school_legend", // the @id of the legend
		MAP_ELEMENT_ID : "school_map", // the @id of the map
		DETAILS_ELEMENT_ID : "school_details", // the @id of the details
		SCHOOL_LIST_ITEM_CLASS : "school_lst", // the @class of a school listing element 
		ADDRESS_FIELD_ID : "address", // the @id of the address input field
		RELIGION_FIELD_ID : "religion", // the @id of the religion input field
		GENDER_FIELD_ID : "gender", // the @id of the gender input field
		FINDSCHOOL_BTN_ID : "find_school", // the @id of the 'find school' button
		SHOW_MORE_SCHOOLS : "show_more_schools", // the @id of the 'show more schools' element
		STOP_BOUNCE : "stop_bounce", // the @id of the 'show more schools' element
		
		MARKER_DYNAM_ID : "dynam", // the @id of the canvas we draw the dynamic markers in
	},
	
	G : { // SE-wide values
		smap : null, // the google.maps.Map object
		smapWidth : 0.9, // the preferred width of the map
		smapHeight : 1, // the preferred height of the map
		selectedZoomFactor : 11, // keeps track of the selected zoom factor ( 7 ~ all Ireland, 10 - 12 ~ county-level, > 12 ~ village-level)
		genderCCodes : { 'boys' : '#11f', 'girls' : '#f6f', 'mixed' : '#fff' },
		religionCCodes : { 'catholic' : '#ff3', 'others' : '#fff' },
		mlist : {}, // 'associative' array (school ID -> marker)*
		iwlist : {}, // 'associative' array (school ID -> info window)*
		vlist : [], //  array of 'visited' schools (schoolID)*
		chartAPI : null, // the jgcharts object http://www.maxb.net/scripts/jgcharts
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
		
		// show the hidden school infos ...
		$('#' + SE.C.SHOW_MORE_SCHOOLS).live('click', function(){
			$('.school_lst.hidden').each(function(index) {
				$(this).removeClass('hidden');
			});
			$(this).html("");
		});
		
		// expand school listing item at click and let the associated marker bounce 
		$('.' + SE.C.SCHOOL_LIST_ITEM_CLASS).live('click', function(){
			var schoolID = $(this).attr('about');
			var el =  $(this);
			// stop bouncing of all markers and start bouncing of associated marker:
			$.each(SE.G.mlist, function(sID, marker){
 				marker.setAnimation(null);
    		});
			SE.G.mlist[schoolID].setAnimation(google.maps.Animation.BOUNCE);
			
			if($.inArray(schoolID, SE.G.vlist) < 0 ) { // not yet visited
				// get school's enrolments:
				$.getJSON(SE.C.ENROLMENT_API_BASE + encodeURIComponent(schoolID), function(data) { 
					var total = 0;
					$.each(data.data, function(i, grade){
						total = total + parseInt(grade.numberOfStudents.value);
					});
					el.append("<div>" + total + " pupils</div>");
					SE.G.vlist.push(schoolID); // mark school visited
				});
			}
		});
		// reset animated marker
		$('#' + SE.C.STOP_BOUNCE).live('click', function(){
			$.each(SE.G.mlist, function(sID, marker){
 				marker.setAnimation(null);
    		});
		});
		
		//TODO: fix issue with re-opening info window - seems that ATM a info window can only be opend once (reset iwlist[] maybe?)
	},
	
	showSchools  : function() {
		var a = $('#' + SE.C.ADDRESS_FIELD_ID).val();
		var r = $('#' + SE.C.RELIGION_FIELD_ID).val();
		var g = $('#' + SE.C.GENDER_FIELD_ID).val();
		
		$('#' + SE.C.LEGEND_ELEMENT_ID).slideDown("slow"); // show the legend
		
 		SE.position2Address(a, function(lat, lng){ // get the location from address and show the 'nearby' schools
			if(SE.C.DEBUG){
				console.log("For address [" + a + "] I found the following location: [" + lat + "," + lng + "]");
				console.log("You asked for: religion: [" + r + "] and gender: [" + g + "]");
			}
			
			// now, get the schools around this address
			$.getJSON(SE.buildNearSchoolsURI(lat, lng, r, g), function(data, textStatus){
				if(data.data) {
					var buf = [""];
					var rows = data.data;
					
					// if we already have a map, remeber the zoom factor
					if(SE.G.smap) SE.G.selectedZoomFactor = SE.G.smap.getZoom();
					
					// create the map centered on the location of the address
					SE.initMap(lat, lng);
					
					buf.push("<div id='ctrl'><span id='stop_bounce'>Reset animation ...</span><span id='show_more_schools'>More schools ...</span></div>");
					for(i in rows) {
						var row = rows[i];
						var schoolSymbol = SE.drawMarker(row["label"].value, row["religion"].value, row["gender"].value);
						
						if(i < SE.C.MAX_SCHOOL_LISTING) {
							buf.push("<div class='school_lst' about='"+row["school"].value+ "'>");
							buf.push("<img src='" + schoolSymbol +"' alt='school symbol'/><a href='" + row["school"].value + "'>" + row["label"].value + "</a>");
							buf.push("</div>");
						}
						else {
							buf.push("<div class='school_lst hidden'>");
							buf.push("<img src='" + schoolSymbol +"' alt='school symbol'/><a href='" + row["school"].value + "'>" + row["label"].value + "</a>");
							buf.push("</div>");	
						}
						SE.addSchoolMarker(row, schoolSymbol);
					}
					$('#' + SE.C.DETAILS_ELEMENT_ID).html(buf.join(""));
					// $('#' + SE.C.RESULT_ELEMENT_ID).prepend("<h2>Details</h2>");
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
			zoom: SE.G.selectedZoomFactor,
			center: new google.maps.LatLng(mapCenterLat, mapCenterLng),
			mapTypeId: SE.C.MAP_TYPE,
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
		
		// make map fit in the container and set in focus
		$('#' + SE.C.MAP_ELEMENT_ID).width($('#' + SE.C.CONTAINER_ELEMENT_ID).width() * SE.G.smapWidth);
		$.scrollTo('#' + SE.C.RESULT_ELEMENT_ID, {duration : 1000});
	},
	
	addSchoolMarker : function(school, schoolSymbol){
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(school["lat"].value, school["long"].value),
			map: SE.G.smap,
			icon: new google.maps.MarkerImage(schoolSymbol),
			title: school["label"].value
		});
		
		SE.G.mlist[school["school"].value] = marker; // remember marker indexed by school ID
		google.maps.event.addListener(marker, "click", function() {
			SE.renderSchool(school, function(iwcontent){
				SE.G.iwlist[school["school"].value] = SE.addSchoolInfo(school["school"].value, marker, iwcontent); // remember info windows indexed by school ID
			});
		});
	},
	
	renderSchool : function(school, callback){
		var buf = ["<div class='school_info'>"];
		var reli = school["religion"].value;
		buf.push("<h2>" + school["label"].value + "</h2>");
		buf.push("<div class='summary'>");
		buf.push("<span class='head'>Address:</span> " + school["address1"].value + " " + school["address2"].value + ", " + school["region_label"].value + " | ");
		buf.push("<span class='head'>Religion:</span> " + reli.substring(reli.lastIndexOf('/') + 1).toLowerCase() + " | "); // should also be religion_label
		buf.push("<span class='head'>Gender:</span> " + school["gender_label"].value.toLowerCase());
		buf.push("</div>"); // EO summary
		
		callback(buf.join("")); // immediatly render what we have so far as rendering the stats might take a bit
		
		SE.renderStats(school["school"].value, buf, callback); // render the enrollment stats
	},
	
	addSchoolInfo : function(schoolID, marker, iwcontent){
		var infowindow = null;
		
		if(schoolID in SE.G.iwlist){ // the info window has already be created just updated content
			infowindow = SE.G.iwlist[schoolID];
			infowindow.setContent(iwcontent);
		}
		else {
			infowindow = new google.maps.InfoWindow();
			infowindow.setContent(iwcontent);
			infowindow.open(SE.G.smap, marker);
		}
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
		if(gender.indexOf('Boys') > 0) return SE.G.genderCCodes['boys'];
		if(gender.indexOf('Girls') > 0) return SE.G.genderCCodes['girls'];
		return SE.G.genderCCodes['mixed'];
	},
	
	getReligionCoding : function(religion){
		if(religion.indexOf('catholic') > 0) return SE.G.religionCCodes['catholic']; // catholic is yellow
		return SE.G.religionCCodes['others']; // all others are white
	},
	
	renderStats : function(schoolID, buf, callback){
		buf.push("<div class='enrolment'>");
		var xdata = [], ydata = [];
		var total = 0;
		
		// fill the chart's data via API
		$.getJSON(SE.C.ENROLMENT_API_BASE + encodeURIComponent(schoolID), function(data) { // get school's enrolments
			$.each(data.data, function(i, grade){
				xdata.push(SE.cleangrades(grade.schoolGrade.value)); // TODO: replace w/ label once API offers it
				ydata.push(parseInt(grade.numberOfStudents.value));
				total = total + parseInt(grade.numberOfStudents.value);
			});
			if(SE.C.DEBUG){
				console.log("Got enrolment data: [" + xdata + " / "+ ydata + "]");
			}
			buf.push($('<div>').html($('<img>').attr('src', SE.G.chartAPI.make({ 
				data : ydata,
				title : 'Enrolment',
				title_color : '111', 
				title_size : 12,
				legend : ['pupils'], 
				axis_labels : xdata,
				size : '220x150', 
				type : 'bvg', 
				colors : ['009933']
			}))).html());
			buf.push("Total: " +  total + " pupils</div>"); // EO enrolment
			
			callback(buf.join("")); // immediatly render what we have so far 
			
			xdata.length = 0; ydata.length = 0; // empty the data arrays
			
			buf.push("<div class='agegroups'>");
			$.getJSON(SE.C.AGEGROUPS_API_BASE + encodeURIComponent(schoolID), function(data) { // get age groups near the school
				if(data.data.length > 0){
					$.each(data.data, function(i, agegroup){
						xdata.push(agegroup.age_label.value + 'y');
						ydata.push(parseInt(agegroup.population.value));
					});
					if(SE.C.DEBUG){
						console.log("Got age group data: [" + xdata + " / "+ ydata + "]");
					}
					SE.G.chartAPI = new jGCharts.Api(); // need to reset it, otherwise remembers the previous settings
					buf.push($('<div>').html($('<img>').attr('src', SE.G.chartAPI.make({ 
						data : ydata,
						title       : 'Demographics',
						title_color : '111', 
						title_size  : 12,
						legend :  ['age'], 
						axis_labels : xdata, 
						size : '240x150', 
						type : 'bvg',
						colors : ['003399']
					}))).html());
					buf.push("</div>"); // EO age groups
				}
				else {
					buf.push("No demographics available for this area, sorry ...</div>"); // EO age groups
				}
				buf.push("<div class='school_more'><a href='"+ schoolID +"' target='_new'>More ...</a></div>");
				buf.push("</div>"); // EO school_info 
				callback(buf.join(""));
			});
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
