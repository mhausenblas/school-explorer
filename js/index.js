/*
 * @category  UI interaction
 * @package   
 * @author    Michael Hausenblas <michael.hausenblas@deri.org>
 * @copyright Public Domain
 * @license   
 * @link      http://deri.ie/
 */


var SE = { // School Explorer
	
	C: { // constant values
		nearBase: "near?center=" //such as near?center=53.2895,-9.0820&religion=Catholic&gender=Gender_Boys
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
			$.getJSON(SE.C.nearBase + lat + "," + lng, function(data, textStatus){
				if(data) {
					var b = "";
					var rows = data.data;
					b += "<div>POI:</div>";
					for(i in rows) {
						var row = rows[i];
						b += "<div>";
						b += "<a href='" + row["school"].value + "'>" + row["label"].value + "</a>";
						b += "</div>";
					}
					$("#school_map").html(b);
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
	}
	
	
	
};


$(document).ready(function(){
	if ($("#form_search")) {
		SE.handleInteraction();
	}
});
