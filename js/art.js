var segmentsArray = [];

$(function() {	
	$(".button-collapse").sideNav();
	$(document).ready(function() {
		$('select').material_select();
		//$('select').prop('disabled', 'disabled');
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
	
	/*var queryShot = {
		queryType : "video",
		query : {
			shotid : "7274499"
		}
	};*/
	
	/**
	 * just testing here, has to be removed because not needed
	 */
	var queryLabels = {
		queryType : "getLabels"
	};

	$(document).ready(function() {
		oboerequest(JSON.stringify(queryMultimediaObjects));
		//oboerequest(JSON.stringify(queryVisualizationCategories));
		//oboerequest(JSON.stringify(queryShot));
		oboerequest(JSON.stringify(queryLabels));
	});

	$('#movie').on('change', function() {
		segmentsArray = [];
		$('#shots').empty();
		$('#type').prop('disabled', false);
		$('select').material_select();
		var movieID = $(this).val();
		console.log(movieID);
		var querySegmentIds = {
			queryType : "getSegments",
			multimediaobjectId : movieID
		};
		oboerequest(JSON.stringify(querySegmentIds));
	});

	$('#type').on('change', function() {
		$('#visualization').prop('disabled', false);
		if ($(this).val() == "VISUALIZATION_MULTIMEDIAOBJECT") {
			$('#shots').hide();
		}
		if ($(this).val() == "VISUALIZATION_SEGMENT") {
			$('#shots').show();
		}
		oboerequest(JSON.stringify(queryVisualizations));
	});

	$('#visualization').on('change', function() {
		$('#search-button').prop('disabled', false);
	});

	$('#search-button').click(function() {
		$("#graph").empty();
		var movie = $('#movie').val();
		//console.log(movie);
		var type = $('#type').val();
		//console.log(type);
		var visualization = $('#visualization').val();
		//console.log(visualization);

		if (type == "VISUALIZATION_MULTIMEDIAOBJECT") {
			var queryArt = {
				queryType : "getArt",
				visualizationType : type,
				visualization : visualization,
				multimediaobjectId: movie
			};
			oboerequest(JSON.stringify(queryArt));
		}
		if (type == "VISUALIZATION_SEGMENT") {
			var shot = $("input[name=shotIDs]:checked").val();
			//console.log(shot);
			
			var queryArt = {
				queryType : "getArt",
				visualizationType : type,
				visualization : visualization,
				segmentId: shot
			};
			oboerequest(JSON.stringify(queryArt));
		}

	});

	$('#d3').on('change', function() {
		$('#search-button-d3').prop('disabled', false);
	});

	$('#search-button-d3').click(function() {
		$("#graph").empty();
		//console.log($('#d3').val());
		var value = $('#d3').val();
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
					$("#movie").append('<option value="' + data.array[0].multimediaobjects[i].videoid + '">' + data.array[0].multimediaobjects[i].name + '</option>');
				}
				$('select').material_select();
				break;
			case "segments":
				//console.log("seg");
				$("#shots").append('<form action="#">');
				for (var i = 0; i < data.array[0].segments.length; i++) {
					$("#shots").append('<p><input name="shotIDs" type="radio" id="' + data.array[0].segments[i] + '" value="' + data.array[0].segments[i] + '" /><label for="'+ data.array[0].segments[i] +'">' + data.array[0].segments[i] + '</label></p>');
					segmentsArray.push(data.array[0].segments[i]);
					//$("#shots").append(data.array[0].segments[i] + ', ');}
				}
				$("#shots").append('</form>');
				var id = '#' + data.array[0].segments[0];
				$(id).prop('checked', true);
				//console.log(segmentsArray);
				break;
			/*case "visualizationCategories":
			 for (var i = 0; i < data.array[0].visualizationCategories.length; i++) {
			 $("#type").append('<option value="' + data.array[0].visualizationCategories[i] + '">' + data.array[0].visualizationCategories[i] + '</option>');
			 }
			 $('select').material_select();
			 break;*/
			case "visualizations":
				$("#visualization").empty();
				$("#visualization").append('<option value="" disabled selected>Visualization</option>');
				if ($('#type').val() == "VISUALIZATION_MULTIMEDIAOBJECT") {
					for (var i = 0; i < data.array[0].visualizations.length; i++) {
						for (var j = 0; j < data.array[0].visualizations[i].visualizationTypes.length; j++) {
							if (data.array[0].visualizations[i].visualizationTypes[j] == "VISUALIZATION_MULTIMEDIAOBJECT") {
								$("#visualization").append('<option value="' + data.array[0].visualizations[i].className + '">' + data.array[0].visualizations[i].displayName + '</option>');
							}
						}
					}
					$('select').material_select();
				}
				if ($('#type').val() == "VISUALIZATION_SEGMENT") {
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
			case "resultData":
			console.log(data.array[0].resultType);
				if(data.array[0].resultType == "IMAGE") {
					$("#graph").empty();
					var picture = data.array[0].resultData;
					$("#graph").append('<img src="' + picture + '" />');
					/*console.log(picture);
					var encodedPicture = window.atob(picture);
					console.log(encodedPicture);*/
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
