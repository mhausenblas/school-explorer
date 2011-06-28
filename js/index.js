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
		
		SCHOOL_DATA_NS_URI : "http://data-gov.ie/school/", // the school data name space
		
		SCHOOL_LISTING_MODE : "SCHOOL LISTING", // render a list of schools; a particular school can be selected
		SCHOOL_DETAIL_MODE : "SCHOOL DETAIL", // render one school (note: requires the school URI, such as http://data-gov.ie/school/63000E) 
		
		BASE_URI : "school", // such as http://school-explorer.data-gov.ie/school on the server
		NEAR_API_BASE : "near?center=", // such as near?center=53.2895,-9.0820&religion=Catholic&gender=Gender_Boys
		ENROLMENT_API_BASE : "enrolment?school_id=", // such as enrolment?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K
		AGEGROUPS_API_BASE : "agegroups?school_id=", // such as agegroups?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F63000E
		INFO_API_BASE : "info?school_id=", // such as info?school_id=http%3A%2F%2Fdata-gov.ie%2Fschool%2F62210K
		NEARBY_API_BASE : "lgd_lookup?center=", // such as lgd_lookup?center=53.7724,-7.1632&radius=1000
		
		LINKEDGEODATA_API_BASE : "http://browser.linkedgeodata.org/?", // such as http://browser.linkedgeodata.org/?lat=53.289191332462&lon=-9.0729670467386&zoom=15

		MAX_SCHOOL_LISTING : 10, // determines how many schools are rendered below the map
		MAP_TYPE : google.maps.MapTypeId.ROADMAP, // the type of the map, see http://code.google.com/apis/maps/documentation/javascript/reference.html#MapTypeId

		CONTAINER_ELEMENT_ID : "content", // the @id of the overall container incl. the heading
		CONTAINER_INNER_ELEMENT_ID : "content_inner", // the @id of the inner container
		SCHOOLS_OVERVIEW_ELEMENT_ID : "schools_overview", // the @id of the school overview container
		RESULT_ELEMENT_ID : "school_results", // the @id of the legend
		LEGEND_ELEMENT_ID : "school_legend", // the @id of the legend
		MAP_ELEMENT_ID : "school_map", // the @id of the map
		SCHOOL_CONTEXT_ELEMENT_ID : "school_context", // the @id of the school context element (container for SV map and nearby)
		SV_MAP_ELEMENT_ID : "school_sv_map", // the @id of the SV map
		NEARBY_ELEMENT_ID : "school_nearby", // the @id of the nearby element
		NEARBY_SLIDER_ELEMENT_ID : "school_nearby_slider", // the @id of the nearby slider
		NEARBY_RADIUS_ELEMENT_ID : "school_nearby_radius", // the @id of the nearby radius
		SCHOOL_INFO_ELEMENT_CLASS : "school_info", // the @class of a school info window
		DEFAULT_SEARCH_RADIUS : 80, // default ...
		MIN_SEARCH_RADIUS : 50, // ... min ...
		MAX_SEARCH_RADIUS : 2000, // ... max radius for the search
		DETAILS_ELEMENT_ID : "school_details", // the @id of the details
		SCHOOL_LIST_ITEM_CLASS : "school_lst", // the @class of a school listing element 
		EXPAND_SCHOOL : "expand_school", // the @class of a 'expand school' element
		ADDRESS_FIELD_ID : "address", // the @id of the address input field
		RELIGION_FIELD_ID : "religion", // the @id of the religion input field
		GENDER_FIELD_ID : "gender", // the @id of the gender input field
		FINDSCHOOL_BTN_ID : "find_school", // the @id of the 'find school' button
		SHOW_MORE_SCHOOLS : "show_more_schools", // the @class of the 'show more schools' element
		CLOSE_ALL_INFO_WINDOW : "close_iw", // the @id of the 'close info window' element
		STOP_BOUNCE : "stop_bounce", // the @id of the 'stop bouncing' element
		SHOW_NEARBY : "show_nearby", // the @class of a show nearby element
		
		MARKER_DYNAM_ID : "dynam", // the @id of the canvas we draw the dynamic markers in
	},
	
	G : { // SE-wide values
		smap : null, // the google.maps.Map object
		smapWidth : 0.9, // the preferred width of the map
		smapHeight : 1, // the preferred height of the map
		selectedZoomFactor : 11, // keeps track of the selected zoom factor ( 7 ~ all Ireland, 10 - 12 ~ county-level, > 12 ~ village-level)
		genderCCodes : { 'boys' : '#11f', 'girls' : '#f6f', 'mixed' : '#fff' },
		religionCCodes : { 'catholic' : '#ff3', 'others' : '#fff' },
		slist : {}, // 'associative' array (school ID -> school)*
		mlist : {}, // 'associative' array (school ID -> marker)*
		iwlist : {}, // 'associative' array (school ID -> info window)*
		vlist : [], //  array of 'visited' schools (schoolID)*
		chartAPI : null, // the jgcharts object http://www.maxb.net/scripts/jgcharts
		contextRadius : 500, // in m ... used for querying the LGD POIs
		currentSchoolID : null // selected school
	},
	
	
	// add general overview stats/diagram based on:
	// http://en.wikipedia.org/wiki/Category:Schools_in_the_Republic_of_Ireland and
	// http://en.wikipedia.org/wiki/National_school_%28Ireland%29
	
	// static rendering of schools and some examples ...
	renderSchoolOverview : function(){
		var tmp = $('<div id="' + SE.C.SCHOOLS_OVERVIEW_ELEMENT_ID +  '"/>');
		var tmpf = $('<div style="float:left;"/>');
		
		tmp.append('<h3>Overview</h3>');
		
		SE.G.chartAPI = new jGCharts.Api();
		
		// http://en.wikipedia.org/wiki/National_school_%28Ireland%29
		tmpf.append($('<img>').attr('src', SE.G.chartAPI.make({ 
			data : [3032, 183, 40, 14, 5, 2, 1, 1, 1, 1 ],
			title       : 'National schools in Ireland (2007)',
			title_color : '111', 
			title_size  : 14,
			legend :  ['number of schools'], 
			axis_labels : ["Catholic", "Church of Ireland", "Multi-denominational", "Presbyterian", "Inter-denominational", "Muslim", "Methodist", "Jewish", "Jehovah's Witnesses", "Quaker"], 
			size : '400x130', 
			type : 'p3',
			colors : ['339900']
		})));

		tmp.append(tmpf);tmpf = $('<div style="float:left; margin: 0 1em 0 0;"/>');
		// http://www.education.ie/servlet/blobservlet/stat_web_stats_09_10.pdf
		tmpf.append($('<img>').attr('src', SE.G.chartAPI.make({ 
			data : [31709, 13228, 8335, 3630, 610],
			title       : 'Teachers First and Second level (2009/2010)',
			title_color : '111', 
			title_size  : 14,
			legend :  ['Number of Teachers'], 
			axis_labels : ["Primary Teachers", "2nd level - Secondary", "2nd level - Vocational", "2nd level - Community", "2nd level - Comprehensive"], 
			size : '400x130', 
			type : 'p3',
			colors : ['003399']
		})));
		tmp.append(tmpf);
		
		tmp.append('<div style="clear:left; padding:2em; text-align:center; color: #a0a0a0;">&diams;</div><h3>Examples</h3>');
		// Galway, catholic, mixed:
		tmp.append('<div class="example_school"><a href="school#63000E" target="_blank"><img src="../img/ex1.png" alt="picture of Presentation Secondary School"/></a><p>Presentation Secondary School, Galway</p></div>');
		// Dublin, catholic, girls: - TODO: check why this is not working ....
		tmp.append('<div class="example_school"><a href="school#60890C" target="_blank"><img src="../img/ex2.png" alt="picture of St Louis High School"/></a><p>St Louis High School, Dublin 6</p></div>');
		
		$('#' + SE.C.CONTAINER_INNER_ELEMENT_ID).prepend(tmp);
		
	},
		
	// TODO: make legend filter-able
	
	go : function(){
		SE.G.chartAPI = new jGCharts.Api(); 
		$("input:text:visible:first").focus(); // set focus to the first input field which should be the address field
		SE.initSchoolContext();
		SE.initLegend();
		
		if(SE.G.currentMode == SE.C.SCHOOL_DETAIL_MODE){
			SE.handleSchoolDetailMode();
			}
		
		SE.handleInteraction();
	},
	
	initSchoolContext : function(){
		$('#' + SE.C.NEARBY_SLIDER_ELEMENT_ID).slider({
				value: SE.C.DEFAULT_SEARCH_RADIUS,
				min: SE.C.MIN_SEARCH_RADIUS,
				max: SE.C.MAX_SEARCH_RADIUS,
				slide: function(event, ui) {
					SE.G.contextRadius =  ui.value; // get the current selected slider value (== search radius for nearby POIs in meter)
					$('#' + SE.C.NEARBY_RADIUS_ELEMENT_ID).html("<h3>Nearby</h3>Showing nearby things closer than <strong>" + ui.value + "m</strong>:");
				},
				change: function(event, ui) {
					if(SE.G.currentSchoolID){ // update context of current selected school
						SE.showSchoolContext(SE.G.currentSchoolID);
					}
				}	
		});
		$('#' + SE.C.NEARBY_RADIUS_ELEMENT_ID).html("<h3>Nearby</h3>Showing nearby things closer than <strong>" + SE.C.DEFAULT_SEARCH_RADIUS + "m</strong>:");
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
	
	handleSchoolDetailMode : function(){
		$('#' + SE.C.SCHOOLS_OVERVIEW_ELEMENT_ID).slideUp("slow");
		$('#' + SE.C.LEGEND_ELEMENT_ID).slideDown("slow"); // show the legend
		$.getJSON(SE.C.INFO_API_BASE + encodeURIComponent(SE.G.currentSchoolID), function(data, textStatus){
			if(data.data) {
				var school =  data.data[0];
				var schoolID = school["school"].value;
				var targetr = "Any";
				var targetg = "Mixed";
				
				$('#' + SE.C.ADDRESS_FIELD_ID).val(school["address1"].value + ", " + school["address2"].value);
				
				// TODO: implement this proerply - should translate the school["religion"].value and school["gender"].value to <select> values:
				switch(school["religion"].value){
					case "http://data-gov.ie/school-religion/catholic":
						targetr = "Catholic";
						break;
				}
				switch(school["gender"].value){
					case "http://education.data.gov.uk/ontology/school#Gender_Boys":
						targetg = "Boys";
						break;
					case "http://education.data.gov.uk/ontology/school#Gender_Girls":
						targetg = "Girls";
						break;
				}
				
				// get schools around the selected school
				$.getJSON(SE.buildNearSchoolsURI(school["lat"].value, school["long"].value, "", "Gender_Mixed"), function(data, textStatus){
					if(data.data) {
						var buf = [""];
						var rows = data.data;
						// create the map centered on the location of the selected school
						SE.initMap(school["lat"].value, school["long"].value);

						buf.push("<div id='ctrl'><span id='close_iw'>Close info windows on map</span><span id='stop_bounce'>Stop bouncing</span><span id='show_more_schools'>More schools ...</span></div>");
						for(i in rows) {
							var row = rows[i];
							var schoolSymbol = SE.drawMarker(row["label"].value, row["religion"].value, row["gender"].value);
							SE.G.slist[row["school"].value] = row; // set up school look-up table
							if(i < SE.C.MAX_SCHOOL_LISTING) {
								buf.push("<div class='school_lst' about='" + row["school"].value + "'>");
							}
							else {
								buf.push("<div class='school_lst hidden' about='" + row["school"].value + "'>");
							}
							buf.push("<img src='" + schoolSymbol +"' alt='school symbol'/>" + row["label"].value.substring(0, 14) + "... <div class='expand_school'>More ...</div>");
							buf.push("</div>");
							SE.addSchoolMarker(row, schoolSymbol);
						}
						$('#' + SE.C.DETAILS_ELEMENT_ID).html(buf.join(""));
						
						// now, activate the selected school
						$('#' + SE.C.STOP_BOUNCE).show();
						// show the context of the school (street view and nearby POIs)
						SE.showSchoolContext(schoolID);
						SE.G.mlist[schoolID].setAnimation(google.maps.Animation.BOUNCE);
						// activate associated info window via school look-up table
						SE.renderSchool(SE.G.slist[schoolID], function(iwcontent){
							var s = SE.G.slist[schoolID];
							SE.G.iwlist[s["school"].value] = SE.addSchoolInfo(s["school"].value, SE.G.mlist[schoolID], iwcontent); // remember info windows indexed by school ID
						});
						
					}
				});
			}
		});
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
			// we're at the top, so scroll to the bottom
			$.scrollTo('#' + SE.C.DETAILS_ELEMENT_ID, {duration : 500});
		});
		
		// expand school listing item, let the associated marker bounce and show context
		$('.' + SE.C.SCHOOL_LIST_ITEM_CLASS).live('click', function(){
			var schoolID = $(this).attr('about');
			var el = $(this);
			SE.G.currentSchoolID = schoolID;
			
			// show 'stop bouncing'
			$('#' + SE.C.STOP_BOUNCE).show();
			
			// we're potentially far away, hence scroll back to top
			$.scrollTo('#' + SE.C.RESULT_ELEMENT_ID, {duration : 500});
			
			// show the context of the school (street view and nearby POIs)
			SE.showSchoolContext(schoolID);
			
			// stop bouncing of all markers and start bouncing of associated marker:
			$.each(SE.G.mlist, function(sID, marker){
 				marker.setAnimation(null);
    		});
			SE.G.mlist[schoolID].setAnimation(google.maps.Animation.BOUNCE);
			
			// activate associated info window via school look-up table
			SE.renderSchool(SE.G.slist[schoolID], function(iwcontent){
				var s = SE.G.slist[schoolID];
				SE.G.iwlist[s["school"].value] = SE.addSchoolInfo(s["school"].value, SE.G.mlist[schoolID], iwcontent); // remember info windows indexed by school ID
			});
			
			// handle first time visit via listing
			if($.inArray(schoolID, SE.G.vlist) < 0 ) { // school has not yet been visited via listing
				// get school's enrolments and display totals as well as mark school listing item as visited
				$.getJSON(SE.C.ENROLMENT_API_BASE + encodeURIComponent(schoolID), function(data) { 
					var total = 0;
					$.each(data.data, function(i, grade){
						total = total + parseInt(grade.numberOfStudents.value);
					});
					// replace  'More ...' with details about school
					$('.' + SE.C.EXPAND_SCHOOL, el).html("<div>Pupils: " + total + "</div>");
					$('.' + SE.C.EXPAND_SCHOOL, el).css('font-size', '8pt');
					// mark school visited:
					el.css('background-image', 'url(../img/seen.png)');
					el.css('background-position', 'top right');
					el.css('background-repeat', 'no-repeat');
					el.css('color', '#aeaeae');
					el.css('box-shadow', 'none');
					SE.G.vlist.push(schoolID);  // add school to visited list
				});
			}
		});

		// stop bouncing button
		$('#' + SE.C.STOP_BOUNCE).live('click', function(){
			$.each(SE.G.mlist, function(sID, marker){
 				marker.setAnimation(null);
    		});
			$(this).hide();
		});
		
		$('#' + SE.C.CLOSE_ALL_INFO_WINDOW).live('click', function(){
			$.each(SE.G.iwlist, function(sID, infowindow){
 				infowindow.close();
    		});
			// and also stop the bouncing ...
			$.each(SE.G.mlist, function(sID, marker){
 				marker.setAnimation(null);
    		});
			$(this).hide();
			SE.hideSchoolContext();
		});
	},
	
	showSchools : function() {
		var a = $('#' + SE.C.ADDRESS_FIELD_ID).val();
		var r = $('#' + SE.C.RELIGION_FIELD_ID).val();
		var g = $('#' + SE.C.GENDER_FIELD_ID).val();
				
		$('#' + SE.C.SCHOOLS_OVERVIEW_ELEMENT_ID).slideUp("slow");
		$('#' + SE.C.LEGEND_ELEMENT_ID).slideDown("slow"); // show the legend
		
		SE.hideSchoolContext(); // make sure the previous school context is reset
		
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
					
					buf.push("<div id='ctrl'><span id='close_iw'>Close info windows on map</span><span id='stop_bounce'>Stop bouncing</span><span id='show_more_schools'>More schools ...</span></div>");
					for(i in rows) {
						var row = rows[i];
						var schoolSymbol = SE.drawMarker(row["label"].value, row["religion"].value, row["gender"].value);

						SE.G.slist[row["school"].value] = row; // set up school look-up table
						
						if(i < SE.C.MAX_SCHOOL_LISTING) {
							buf.push("<div class='school_lst' about='" + row["school"].value + "'>");
						}
						else {
							buf.push("<div class='school_lst hidden' about='" + row["school"].value + "'>");
						}
						buf.push("<img src='" + schoolSymbol +"' alt='school symbol'/>" + row["label"].value.substring(0, 14) + "... <div class='expand_school'>More ...</div>");
						buf.push("</div>");
						SE.addSchoolMarker(row, schoolSymbol);
					}
					$('#' + SE.C.DETAILS_ELEMENT_ID).html(buf.join(""));
				}
			});
		});
	},
	
	showSchoolContext : function(schoolID){
		var schoolLoc = new google.maps.LatLng(SE.G.slist[schoolID]["lat"].value, SE.G.slist[schoolID]["long"].value);
		SE.renderSchoolOnSV(SE.C.SV_MAP_ELEMENT_ID, schoolLoc);
		SE.nearbyBusy();
		$('#' +  SE.C.SCHOOL_CONTEXT_ELEMENT_ID).show();
		$('#' + SE.C.NEARBY_RADIUS_ELEMENT_ID).show();
		$('#' + SE.C.NEARBY_SLIDER_ELEMENT_ID).show();
		// now trigger LGD look-up and make the school listing fit:
		SE.renderSchoolNearby(SE.C.NEARBY_ELEMENT_ID, SE.G.slist[schoolID]["lat"].value, SE.G.slist[schoolID]["long"].value, SE.G.contextRadius);
		$('#' +  SE.C.DETAILS_ELEMENT_ID).css("width", "68%");
	},
	
	hideSchoolContext : function(){
		$('#' +  SE.C.SCHOOL_CONTEXT_ELEMENT_ID).slideUp();
		$('#' +  SE.C.DETAILS_ELEMENT_ID).css("width", "100%");
	},
	
	nearbyBusy : function(){
		$('#' + SE.C.NEARBY_ELEMENT_ID).html("<div id='nearby_busy'><img src='../img/busy.gif' alt='busy'/><div>Retrieving data from <a href='http://linkedgeodata.org/About' target='_blank'>LinkedGeoData</a> ...</div></div>");
	},

	// for example: near?center=53.289,-9.0820&religion=Catholic&gender=Gender_Boys
	buildNearSchoolsURI : function(lat, lng, religion, gender){
		return (religion == "") ? SE.C.NEAR_API_BASE + lat + "," + lng + "&gender=" + gender : SE.C.NEAR_API_BASE + lat + "," + lng + "&religion=" + religion + "&gender=" + gender;
	},
	
	// for example: lgd_lookup?center=53.274795076024,-9.0540373672574&radius=1000
	buildNearPOIURI : function(lat, lng, radius){
		return SE.C.NEARBY_API_BASE + lat + "," + lng + "&radius=" + radius;
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
			icon: new google.maps.MarkerImage('../img/home.png'),
			title: $('#' + SE.C.ADDRESS_FIELD_ID).val()
		});
		
		// make map fit in the container and set in focus
		$('#' + SE.C.MAP_ELEMENT_ID).width($('#' + SE.C.CONTAINER_ELEMENT_ID).width() * SE.G.smapWidth);
		$.scrollTo('#' + SE.C.RESULT_ELEMENT_ID, {duration : 1000});
	},
	
	renderSchoolOnSV : function(elemID, centerLoc){
		// TODO: if no SV is available, show something else (?)
		var schoolpano = new google.maps.StreetViewPanorama(document.getElementById(elemID), {
			position : centerLoc,
			pov: {
				heading : 100,
				pitch : 0,
				zoom : 1
			},
			panControl : false,
			addressControl: false,
			scrollwheel : false,
			zoomControl : false
		});
		schoolpano.setVisible(true);
		$('#' + elemID).slideDown('slow');
	},

	renderSchoolNearby : function(elemID, lat, lng){
		// now, get the schools nearby things via LinkedGeoData
		$.getJSON(SE.buildNearPOIURI(lat, lng, SE.G.contextRadius), function(data, textStatus){
			if(data.data) {
				var buf = [""];
				var rows = data.data;

				buf.push("<div class='nearby_pois'>");
				if(rows.length > 0){
					buf.push("<ul>");
					for(i in rows) {
						var row = rows[i];
						var poiType = "";

						buf.push("<li><a href='" + row["poi"].value +"' target='_blank'>" + row["poi_label"].value + "</a>");
						if(row["poi_type"]) {
							poiType = row["poi_type"].value;
							buf.push(" a <a href='" + poiType +"' target='_blank'>" + poiType.substring(poiType.lastIndexOf("/") + 1).toLowerCase() + "</a>");
						}
						if(row["sameas"].value) {
							buf.push(", see also <a href='" + row["sameas"].value +"' target='_blank'>DBpedia</a>");
							if(SE.C.DEBUG){
								console.log("For location: [" + lat + "," + lng + "] I found :" + row["sameas"].value);
							}
						}
						buf.push("</li>");
					}
					buf.push("</ul></div>");
				}
				else{
					buf.push("<p>Sorry, didn't find anything nearby ...</p></div>");
				}
				$('#' + elemID).html(buf.join(""));
				$('#' + elemID).slideDown('slow');
			}
			else {
				buf.push("<div class='nearby_pois'><p>Sorry, didn't find anything nearby ...</p></div>");
				$('#' + elemID).html(buf.join(""));
				$('#' + elemID).slideDown('slow');
			}
		});
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
			SE.showSchoolContext(school["school"].value);
		});
	},
	
	renderSchool : function(school, callback){
		var buf = ["<div class='school_info'>"];
		
		SE.setSchoolURI(school["school"].value);
		
		buf.push("<h2>" + school["label"].value + "</h2>");
		buf.push("<div class='summary'>");
		buf.push("<span class='head'>Address:</span> " + school["address1"].value);
		if(school["address2"]) buf.push(" " + school["address2"].value);
		if(school["region_label"]) buf.push(", " + school["region_label"].value + " | ");
		else buf.push(" | ");

		if(school["religion_label"]) buf.push("<span class='head'>Religion:</span> " + school["religion_label"].value.toLowerCase() + " | ");
		if(school["gender_label"]) buf.push("<span class='head'>Gender:</span> " + school["gender_label"].value.toLowerCase());
		buf.push("</div>"); // EO summary
		
		callback(buf.join("")); // immediatly render what we have so far as rendering the stats might take a bit
		
		SE.renderStats(school, buf, callback); // render the enrollment stats
	},
	
	setSchoolURI : function(schoolID){
		var currentURL = document.URL;
		currentURL = currentURL.substring(0, currentURL.indexOf("#"));
		window.location = currentURL + "#" + schoolID.substring(schoolID.lastIndexOf("/") + 1 );
	},
	
	determineRenderMode : function(){
		var currentURL = document.URL;
		var hashPos = currentURL.indexOf("#");
		var schoolID = "";
		
		if(hashPos >= 0 && currentURL.substring(hashPos + 1) != ""){ // trigger single school rendering for a hash URI such as http://school-explorer.data-gov.ie/school#63000E
			SE.G.currentMode = SE.C.SCHOOL_DETAIL_MODE;
			schoolID = currentURL.substring(hashPos + 1); // extract the school identifier, resulting in 63000E
			SE.G.currentSchoolID = SE.C.SCHOOL_DATA_NS_URI + schoolID;  // assemble school URI, resulting in  http://data-gov.ie/school/63000E
		}
		else{ // trigger school listing
			SE.G.currentMode = SE.C.SCHOOL_LISTING_MODE;
			window.location = SE.C.BASE_URI + "#";
			SE.renderSchoolOverview(); // show some overview stats and examples
		}
		if(SE.C.DEBUG) console.log("School explorer opening in " + SE.G.currentMode + " mode ..."); 
	},
	
	addSchoolInfo : function(schoolID, marker, iwcontent){
		var infowindow = null;
		
		if(schoolID in SE.G.iwlist){ // the info window has already be created just updated content
			infowindow = SE.G.iwlist[schoolID];
		}
		else {
			infowindow = new google.maps.InfoWindow();
		}
		infowindow.setContent(iwcontent);
		infowindow.open(SE.G.smap, marker);
		$('#' + SE.C.CLOSE_ALL_INFO_WINDOW).show();
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
	
	renderStats : function(school, buf, callback){
		buf.push("<div class='enrolment'>");
		var xdata = [], ydata = [];
		var total = 0;
		var totalCalculated = 0;
		var totalGirls = 0;
		var totalBoys = 0;
		var schoolID = school["school"].value;
		
		// fill the two charts with data via API
		$.getJSON(SE.C.ENROLMENT_API_BASE + encodeURIComponent(schoolID), function(data) { // get school's enrolments
			$.each(data.data, function(i, grade){
				var g = SE.cleangrades(grade.numberOfStudentsURI.value, grade.schoolGrade.value);
				if(g){ // we have a valid grade (exluding totals such as boys, girls, etc.)
					xdata.push(g);
					ydata.push(parseInt(grade.numberOfStudents.value));
					totalCalculated = totalCalculated + parseInt(grade.numberOfStudents.value);
				}
				else{ // extracting totals
					if(grade.numberOfStudentsURI.value == "http://data-gov.ie/number-of-students") total = parseInt(grade.numberOfStudents.value);
					if(grade.numberOfStudentsURI.value == "http://data-gov.ie/number-of-girl-students") totalGirls = parseInt(grade.numberOfStudents.value);
					if(grade.numberOfStudentsURI.value == "http://data-gov.ie/number-of-boy-students") totalBoys = parseInt(grade.numberOfStudents.value);
				}
			});
			if(SE.C.DEBUG){
				console.log("Got enrolment data: [" + xdata + " / "+ ydata + "]");
			}
			buf.push($('<div />').html($('<img style="margin: 0 10px 10px 0">').attr('src', SE.G.chartAPI.make({ 
				data : ydata,
				title : 'Enrolment',
				title_color : '111', 
				title_size : 12,
				legend : ['pupils'], 
				axis_labels : xdata,
				size : '240x150', 
				type : 'bvg', 
				colors : ['009933'],
				bar_width : 25,
				// bar_spacing : 15
			}))).html());
			buf.push("<div class='chart_more'>Total: " +  total + " (" + totalCalculated +") | Girls: "  +  totalGirls + " | Boys: " +  totalBoys + "</div>");
			buf.push("<div class='chart_more'>Year: 2010 | Source: <a href='http://www.education.ie/' target='_blank'>Dept. of Education</a></div>"); //  TODO: check if the year is correct

			buf.push("</div>"); // EO enrolment
			
			callback(buf.join("")); // immediatly render what we have so far 
			
			xdata.length = 0; ydata.length = 0; // empty the data arrays
			
			buf.push("<div class='agegroups'>");
			$.getJSON(SE.C.AGEGROUPS_API_BASE + encodeURIComponent(schoolID), function(data) { // get age groups near the school
				if(data.data.length > 0){
					totalCalculated = 0;
					$.each(data.data, function(i, agegroup){
						xdata.push(agegroup.age_label.value + 'y');
						ydata.push(parseInt(agegroup.population.value));
						totalCalculated = totalCalculated + parseInt(agegroup.population.value);
					});
					if(SE.C.DEBUG){
						console.log("Got age group data: [" + xdata + " / "+ ydata + "]");
					}
					SE.G.chartAPI = new jGCharts.Api(); // need to reset it, otherwise remembers the previous settings
					buf.push($('<div />').append($('<img style="margin: 0 0 10px 0">').attr('src', SE.G.chartAPI.make({ 
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
					buf.push("<div class='chart_more'>Total: " + totalCalculated + "</div>");
					buf.push("<div class='chart_more'>Year: 2006 | Source: <a href='http://cso.ie/' target='_blank'>CSO</a>, Census</div>");
					
					buf.push("</div>"); // EO age groups
				}
				else {
					buf.push("<p class='no_stats'>No demographics available for this area, sorry ...</p></div>"); // EO age groups
				}
				buf.push("<div class='school_more'><a href='"+ schoolID +"' target='_new' title='The underlying data about the school'>Source Data</a></div>");
				buf.push("</div>"); // EO school_info 
				callback(buf.join(""));
			});
		});
	},
	
	cleangrades : function(gradeURI, grade) {
		if(gradeURI.indexOf('st-') > 0 | gradeURI.indexOf('nd-')  > 0 | gradeURI.indexOf('rd-')  > 0 | gradeURI.indexOf('th-')  > 0) {
			grade = grade.replace(/number of (.+) year students/i, "$1");
		}
		else {
			grade = null;
		}
		return grade;
	}
};

$(document).ready(function(){
	if ($("#form_search")) {
		SE.determineRenderMode(); // check what kind of mode we're supposed to operate in
		SE.go(); // start interaction
		
		// TESTS:
		// SE.initSVMap("school_details", new google.maps.LatLng(53.289,-9.082));
		// $('#' + SE.C.DETAILS_ELEMENT_ID).html("<div style='background: #303030; padding: 1em;'><img src='" + SE.drawMarker("test school", "http://data-gov.ie/ReligiousCharacter/Catholic", "http://education.data.gov.uk/ontology/school#Gender_Boys") + "' alt='test'/></div>");
		// $('#' + SE.C.DETAILS_ELEMENT_ID).html(SE.renderSchoolEnrolment("http://data-gov.ie/school/62210K"));
	}
});
