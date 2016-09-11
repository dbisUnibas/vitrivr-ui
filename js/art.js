$(function() {
	$(".button-collapse").sideNav();
	$(document).ready(function() {
		$('select').material_select();
	});

	var queryMultimediaObjects = {
		queryType : "getMultimediaobjects"
	};

	/*var queryVisualizationCategories = {
	 queryType : "getVisualizationCategories"
	 };*/

	var queryVisualizations = {
		queryType : "getVisualizations"
	};

	$(document).ready(function() {
		oboerequest(JSON.stringify(queryMultimediaObjects));
		//oboerequest(JSON.stringify(queryVisualizationCategories));
		
	});

	$('#movie').on('change', function() {
		$('#shots').empty();
		var movieID = $(this).val();
		var querySegmentIds = {
			queryType : "getSegments",
			multimediaobjectId : movieID
		};
		oboerequest(JSON.stringify(querySegmentIds));
	});

	$('#type').on('change', function() {
		if ($(this).val() == "movie") {
			$('#shots').hide();
		}
		if ($(this).val() == "shot") {
			$('#shots').show();
		}
		oboerequest(JSON.stringify(queryVisualizations));
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
				//console.log(data.array[0].multimediaobjects.length);
				//console.log("mObj");
				for (var i = 0; i < data.array[0].multimediaobjects.length; i++) {
					$("#movie").append('<option value="' + data.array[0].multimediaobjects[i] + '">Movie ' + i + '</option>');
				}
				$('select').material_select();
				break;
			case "segments":
				//console.log("seg");
				for (var i = 0; i < data.array[0].segments.length; i++) {
					$("#shots").append(data.array[0].segments[i] + ', ');
				}
				break;
			/*case "visualizationCategories":
			 for (var i = 0; i < data.array[0].visualizationCategories.length; i++) {
			 $("#type").append('<option value="' + data.array[0].visualizationCategories[i] + '">' + data.array[0].visualizationCategories[i] + '</option>');
			 }
			 $('select').material_select();
			 break;*/
			case "visualizations":
				if ($('#type').val() == "movie") {
					for (var i = 0; i < data.array[0].visualizations.length; i++) {
						for (var j = 0; j < data.array[0].visualizations[i].visualizationTypes.length; j++) {
							if (data.array[0].visualizations[i].visualizationTypes[j] == "VISUALIZATION_MULTIMEDIAOBJECT") {
								$("#visualization").append('<option value="' + data.array[0].visualizations[i].className + '">' + data.array[0].visualizations[i].displayName + '</option>');
							}
						}	
					}
					$('select').material_select();
				}
				if ($('#type').val() == "shot") {
					for (var i = 0; i < data.array[0].visualizations.length; i++) {
						for (var j = 0; j < data.array[0].visualizations[i].visualizationTypes.length; j++) {
							if (data.array[0].visualizations[i].visualizationTypes[j] == "VISUALIZATION_SEGMENT") {
								$("#visualization").append('<option value="' + data.array[0].visualizations[i].className + '">' + data.array[0].visualizations[i].displayName + '</option>');
							}
						}	
					}
					$('select').material_select();
				}

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
