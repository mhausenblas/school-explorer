/*
 * @category  UI interaction
 * @package   
 * @author    Sarven Capadisli <sarven.capadisli@deri.org>
 * @copyright 2010 Digital Enterprise Research Institute
 * @license   
 * @link      http://deri.org/
 */


var SE = { // School Explorer
	
	C: { // constant values
		infoAPI: "info?location=" //such as info?location=53.2744122,-9.0490632
	},
	
	showSchools: function() {
		$("#form_submit").click(function(){ // the search button has been hit, show nearby schools
			var a = $("#address").val();
			SE.position2Address(a, function(lat, lng){
				console.log("For address [" + a + "] I found the following location: [" + lat + "," + lng + "]");
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
		SE.showSchools();
	}
});
