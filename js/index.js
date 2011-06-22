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
		DEFAULT_ZOOM_FACTOR : 13, // the default zoom factor on map init ( 7 ~ all Ireland, 10 - 12 ~ county-level, > 12 ~ village-level)
		// the following are the SE API URI query bases:
		nearBase: "near?center=" //such as near?center=53.2895,-9.0820&religion=Catholic&gender=Gender_Boys
	},
	
	G: { // SE-wide values
		smap : undefined,
		smapWidth : 0.9, // the preferred width of the map
		smapHeight : 2, // the preferred height of the map
	},
	
	handleInteraction: function(){
		// the search button has been hit, show nearby schools
		$("#find_school").click(function(){
			SE.showSchools();
		});
		$("#find_school").mousedown(function(){
			$(this).removeClass('submit');
		});
		$("#find_school").mouseup(function(){
			$(this).addClass('submit');
		});
		
		// the ENTER key has been hit in the address field, show nearby schools
		$("#address").keypress(function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if (code == 13) {
				SE.showSchools();
			}
		});
	},
	
	showSchools: function() {
		var a = $("#address").val();
		SE.position2Address(a, function(lat, lng){
			console.log("For address [" + a + "] I found the following location: [" + lat + "," + lng + "]");
			
			// create the map centered on the location of the address
			SE.initMap(lat, lng);
			
			// now, get the schools around this address
			$.getJSON(SE.C.nearBase + lat + "," + lng, function(data, textStatus){
				if(data) {
					var b = "";
					var rows = data.data;
					b += "<div>All:</div>";
					for(i in rows) {
						var row = rows[i];
						b += "<div>";
						b += "<a href='" + row["school"].value + "'>" + row["label"].value + "</a>";
						b += "</div>";
						SE.addSchoolMarker(row);
					}
					$("#school_details").html(b);
				}
			});
		});
	},
	
	position2Address: function(address, callback){
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': address, 'region': 'ie'}, function(data, status) {
			if(status == google.maps.GeocoderStatus.OK) {  
				var location = data[0].geometry.location;
				var lat = location.lat();
				var lng = location.lng();
				
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
		SE.G.smap = new google.maps.Map(document.getElementById("school_map"), mapOptions);
		
		// make map fit
		$("#school_map").width($("#content").width()*SE.G.smapWidth);
		$("#school_map").height($("#content").height()*SE.G.smapHeight);
	},
	
	addSchoolMarker: function(school){
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(school["lat"].value, school["long"].value),
			map: SE.G.smap,
			//icon: mImage, // TODO: color dependent on religion + gender
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
	}
	
		
};

$(document).ready(function(){
	if ($("#form_search")) {
		SE.handleInteraction();
	}
});
