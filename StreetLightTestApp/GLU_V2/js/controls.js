var stored = {};

function RGB_beacon(color) {
	var object;
	var action_url = "/bacnet_write_js";
	var newBeaconColor;
	if (color == "red" || color == "Red" || color == "RED") {
		object = {
			"ref": "binary_output|3|192.168.3.23|47808",
			"value": "1"
		};
		newBeaconColor = "red";
	}
	if (color == "blue" || color == "Blue" || color == "BLUE") {
		object = {
			"ref": "binary_output|6|192.168.3.23|47808",
			"value": "1"
		};
		newBeaconColor = "blue";
	}
	if (color == "green" || color == "Green" || color == "GREEN") {
		object = {
			"ref": "binary_output|0|192.168.3.23|47808",
			"value": "1"
		};
		newBeaconColor = "green";
	}

	var svg = document.getElementById("lamp-svg");
	var svgDoc = svg.contentDocument;
	var beacon = svgDoc.getElementById("beaconObject");
	var oldBeaconColor = beacon.getAttributeNS(null, 'class');


	//console.log("Outputting Data");
	//console.log("svg class: " + JSON.stringify(svg.getAttributeNS(null, 'class')));
	//console.log("old beacon class: " + oldBeaconColor);

	beacon.setAttributeNS(null, 'class', newBeaconColor);

	//console.log("new beacon class: " + beacon.getAttributeNS(null, 'class'));


	$.ajax({
		type: 'POST',
		url: action_url,
		data: JSON.stringify(object),
		success: function() {
			window.alert('Success');
		},
		contentType: "application/json",
		dataType: 'json'
	});

}

function connect() {
	stored.IP = document.getElementById("IPaddress").value;
	window.alert('Now connected to ' + stored.IP);
	window.setInterval(luminosityPoller, 500);
}

function disconnect() {
	if (stored.IP == null)
		window.alert('Disconnected');
	else {
		window.alert('Disconnected from ' + stored.IP);
		stored.IP = null;
	}

}

function streetLightControl(lumins) { // class takes an integer value for the parameter for dimming percentage
	var elem; // declare variable to hold value of dimming percentage pulled from HTML form

	if (lumins == null) { // if no parameter provided, use value obtained from web form
		elem = document.getElementById("dimming").value;
	}
	if (lumins) //else, if a parameter is provided, use that number rather than getting from webform
		elem = lumins;

	if (stored.IP == null) {
		window.alert("Not currently connected");
		return;
	} else {
		if (elem > 100 || elem < 0) {
			window.alert("Value must be between 0-100"); // error checking for legitimate dimming value (0-100%)
		} else {
			var object = {}; // declare array object to hold JSON body data
			var action_url = "/bacnet_write_js"; //API function used in JSON request

			object.ref = 'analog_output|0|' + stored.IP + '|47808'; // which BACnet device and point to command
			object.value = elem; //pass the value obtained for dimming percentage obtained earlier to JSON body

			$.ajax({
				type: 'POST',
				url: action_url,
				data: JSON.stringify(object),
				success: function() {
					window.alert('Success');
				},
				contentType: "application/json",
				dataType: 'json'
			});
		}
	}
}

function stopAutoTest() {
	var action_url = "/bacnet_write";
	var object = {
		"object_type": "analog_value",
		"instance": "1",
		"priority": "8",
		"ip_address": "192.168.3.162:0.0.0.0.0.21:5",
		"value": "0"
	};

	$.ajax({
		type: 'POST',
		url: action_url,
		data: JSON.stringify(object),
		contentType: "application/json",
		dataType: 'json',
		success: function(data) {
			window.alert('Success');
		},
		failure: function() {
			window.alert('error in JSON');
		}
	});
	RGB_beacon('Green');

}


function startAutoTest() {
	if (stored.IP == null) {
		window.alert("Not currently connected");
		return;
	} else {
		var option;
		if (document.getElementById("option1").checked) {
			option = "1";
		} else if (document.getElementById("option2").checked) {
			option = "2";



		} else option = "0";
		var action_url = "/bacnet_write";
		var object = {
			"object_type": "analog_value",
			"instance": "1"
		};
		object.value = option;
		object.priority = "8";
		object.ip_address = "192.168.3.162:0.0.0.0.0.21:5";


		console.log(JSON.stringify(object));


		$.ajax({
			type: 'POST',
			url: action_url,
			data: JSON.stringify(object),
			success: function() {
				window.alert('Success');
			},
			contentType: "application/json",
			dataType: 'json'
		});
		window.setTimeout(stopAutoTest(),60000);
	}
}

function increaseStreetLightDimming() {
	if (stored.IP == null) {
		window.alert("Not currently connected");
		return;
	} else {
		var action_url = "/bacnet_read_point_array_js";
		var object = {
			"point_array": ["analog_output|0|" + stored.IP + "|47808"]
		};
		$.ajax({
			type: 'POST',
			url: action_url,
			data: JSON.stringify(object),
			contentType: "application/json",
			dataType: 'json',
			success: function(data) {
				var response = JSON.stringify(data);
				response = response.split('\"');
				var lumins = response[5];
				window.alert('Increasing luminosity from ' + lumins + '% to ' + (lumins * 1.0 + 10.0) + '%');
				streetLightControl((lumins * 1.0 + 10.0));
			},
			failure: function() {
				window.alert('error in JSON');
			}
		});

	}
}

function decreaseStreetLightDimming() {
	if (stored.IP == null) {
		window.alert("Not currently connected");
		return;
	} else {
		var action_url = "/bacnet_read_point_array_js";
		var object = {
			"point_array": ["analog_output|0|192.168.3.36|47808"]
		};
		$.ajax({
			type: 'POST',
			url: action_url,
			data: JSON.stringify(object),
			contentType: "application/json",
			dataType: 'json',
			success: function(data) {
				var response = JSON.stringify(data);
				response = response.split('\"');
				var lumins = response[5];
				window.alert('Decreasing luminosity from ' + lumins + '% to ' + (lumins * 1.0 - 10.0) + '%');
				streetLightControl((lumins * 1.0 - 10.0));
			},
			failure: function() {
				window.alert('error in JSON');
			}
		});

	}
}

function luminosityPoller() {
	var action_url = "/bacnet_read_point_array_js";
	var object = {
		"point_array": ["analog_output|0|" + stored.IP + "|47808"]
	};
	$.ajax({
		type: 'POST',
		url: action_url,
		data: JSON.stringify(object),
		contentType: "application/json",
		dataType: 'json',
		success: function(data) {
			var response = JSON.stringify(data);
			response = response.split('\"');
			var lumins = response[5];
			//console.log("current lumins: " + lumins);
			updateLightIcon(lumins);

		},
		failure: function() {

			window.alert('error in JSON');
		}
	});

}

function updateLightIcon(lumins) {
	var svg = document.getElementById("lamp-svg");
	var svgDoc = svg.contentDocument;
	//console.log("Outputting Data");
	var bulbObject;

	if (1 <= lumins && lumins <= 20) { // set to 1 for production
		for (i = 0; i <= 5; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55');
		}
		for (i = 6; i <= 29; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55off');
		}
	}

	if (21 <= lumins && lumins <= 40) { // set to 1 for production
		for (i = 0; i <= 11; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55');
		}
		for (i = 12; i <= 29; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55off');
		}
	}

	if (41 <= lumins && lumins <= 60) { // set to 1 for production
		for (i = 0; i <= 17; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55');
		}
		for (i = 18; i <= 29; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55off');
		}
	}

	if (61 <= lumins && lumins <= 80) { // set to 1 for production
		for (i = 0; i <= 23; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55');
		}
		for (i = 24; i <= 29; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55off');
		}
	}

	if (81 <= lumins && lumins <= 100) { // set to 1 for production
		for (i = 0; i <= 29; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55');
		}
	}


	if (lumins == 0) { // set to 1 for production
		for (i = 0; i <= 29; i = i + 1) {
			bulbObject = svgDoc.getElementById("BulbColor_" + i + "_");
			bulbObject.setAttributeNS(null, 'class', 'st55off');
		}
	}

}

function panelConfigBuildPost(path) {
	window.alert('Submitted!');
	var panelname = document.getElementById("panel_name_selector").value;
	panelname = panelname.replace(/\s/g, '');
	var actiontype = document.getElementById("action_type_selector").value;
	var object = {
		"panel_name": panelname,
	};
	var action_url = "";
	if (actiontype == "start_panel") {
		action_url = '../../start_panel';
	}
	if (actiontype == "stop_panel") {
		action_url = '../../stop_panel';
	}
	if (actiontype == "restart_panel") {
		action_url = '../../restart_panel';
	}
	if (action_url != "") {
		$.ajax({
			type: 'POST',
			url: action_url,
			data: JSON.stringify(object),
			success: function() {
				window.alert('Success');
			},
			contentType: "application/json",
			dataType: 'json'
		});
	}
}

function updatePanelList(panel_list) {
	var panelListSelector = document.getElementById("panel_name_selector");
	for (var j = 0; j < panelListSelector.length; j++) {
		panelListSelector.remove(j);
	}
	for (var i = 0; i < panel_list.length; i++) {
		var option = document.createElement("option");
		option.text = panel_list[i];
		panelListSelector.add(option);
	}
}

function panelListRefresh() {
	$.ajax({
		type: 'GET',
		url: '../../panel_list',
		success: function(data) {
			updatePanelList(data.panel_list);
		},
		contentType: "application/json",
		dataType: 'json'
	});
}