$(function() {
	$(".button-collapse").sideNav();
	$(document).ready(function() {
		$('select').material_select();
	});

	var query = {
		queryType : "getMultimediaobjects"
	};
	
	var query2 = {
		queryType : "getSegments",
		multimediaobjectId : "110"
	};

	$(document).ready(function() {
		oboerequest(JSON.stringify(query));
		oboerequest(JSON.stringify(query2));
	});
	

	$('#search-button').click(function() {
		$("#graph").empty();
		//console.log($('#visualization').val());
		var value = $('#visualization').val();
		switch (value) {
		case "sunburst":
			sunburst();
			break;
		case "streamgraph":
			streamgraph();
			break;
		case "raindrops":
			raindrops();
			break;
		case "forceDirectedGraph":
			forceDirectedGraph();
			break;
		default:
			break;
		}
	});

});

function oboerequest(query, noContext) {
	searchRunning = true;
	//showProgress(0);
	if (noContext === undefined) {
		noContext = false;
	}
	try {
		var headers = {
			'Content-Type' : 'application/x-www-form-urlencoded'
		};
		oboe({
			url : cineastHost, //see config.js
			method : 'POST',
			body : "query=" + query,
			headers : headers
		}).done(function(data) {
			console.log(data);
			console.log(data.array[0]);
			searchRunning = false;
			
			switch(Object.keys(data.array[0])[0]) {
				case "multimediaobjects":
					console.log(data.array[0].multimediaobjects.length);
					console.log("mObj");
					for (var i = 0; i < data.array[0].multimediaobjects.length; i++) {
						$("#movie").append('<option value="' +  data.array[0].multimediaobjects[i] + '">Movie ' + i + '</option>');
					}
					$('select').material_select();
					break;
				case "segments":
					console.log("seg");
					break;
				default:
					console.log(data.array[0]);
					break;
			}
		}).fail(function(data) {
			console.log("FAIL");
			console.log(data);
			//hideProgress();
			searchRunning = false;
		});
	} catch(e) {
		console.warn(e.message + " | " + e.lineNumber);
	}

}
