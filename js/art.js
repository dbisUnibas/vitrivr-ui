const beginStringVisualization = "org.vitrivr.cineast.art.modules.Visualization";

const radioVisualizationMovie = [["AverageColor", "MedianColor", "DominantColor"], ["Grid8", "Gradient", "Stripe"], ["Variable", "Square"]];
const radioVisualizationShot = [["AverageColor", "MedianColor", "DominantEdge"], ["Grid8", "Grid16", "AverageColor"], ["Grid8", "Grid16"]];

const queryMultimediaObjects = {
	queryType : "getMultimediaobjects"
};

/*const queryVisualizationCategories = {
 queryType : "getVisualizationCategories"
 };*/

const queryVisualizations = {
	queryType : "getVisualizations"
};

var segmentsArray = [];
var visualizationArray = [];

$(function() {
	$(".button-collapse").sideNav();
	$(document).ready(function() {
		$('select').material_select();
		//$('select').prop('disabled', 'disabled');
	});

	$(document).ready(function() {
		oboerequest(JSON.stringify(queryMultimediaObjects));
		//oboerequest(JSON.stringify(queryVisualizationCategories));
	});

	/**
	 * Collection, Movie or Shot
	 */
	$('#type').on('change', function() {
		$("#graph").empty();
		$("#radio").empty();

		if ($(this).val() == "VISUALIZATION_MULTIMEDIAOBJECT") {
			$('#shots').hide();

			var appendVis = '<form action="#">';
			for (var i = 0; i < radioVisualizationMovie.length; i++) {
				appendVis += "<p>";
				for (var j = 0; j < radioVisualizationMovie[i].length; j++) {
					if(i != (radioVisualizationMovie.length -1)) {
						//console.log(radioVisualizationMovie[i][j]);
						appendVis += '<input name="part' + i + '" type="radio" id="' + radioVisualizationMovie[i][j] + i + '" value="' + radioVisualizationMovie[i][j] + '" disabled />';
						appendVis += '<label for="' + radioVisualizationMovie[i][j] + i + '">' + radioVisualizationMovie[i][j] + '</label>';
					} else {
						console.log(i);
						appendVis += '<input name="part' + i + '" type="checkbox" class="filled-in" id="' + radioVisualizationMovie[i][j] + i + '" value="' + radioVisualizationMovie[i][j] + '" disabled/>';
						appendVis += '<label for="' + radioVisualizationMovie[i][j] + i + '">' + radioVisualizationMovie[i][j] + '</label>';
					}	
				}
				appendVis += "</p>";
			}
			appendVis += '</form>';

			$("#radio").append(appendVis);
			$('input[name=part0]').prop('disabled', false);
			//var id = '#part1';
			//$(id).prop('checked', true);
		}
		if ($(this).val() == "VISUALIZATION_SEGMENT") {
			$('#shots').show();

			var appendVis = '<form action="#">';
			for (var i = 0; i < radioVisualizationShot.length; i++) {
				appendVis += "<p>";
				for (var j = 0; j < radioVisualizationShot[i].length; j++) {
					//console.log(radioVisualizationShot[i][j]);
					appendVis += '<input name="part' + i + '" type="radio" id="' + radioVisualizationShot[i][j] + i + '" value="' + radioVisualizationShot[i][j] + '" disabled />';
					appendVis += '<label for="' + radioVisualizationShot[i][j] + i +'">' + radioVisualizationShot[i][j] + '</label>';
				}
				appendVis += "</p>";
			}
			appendVis += '</form>';

			$("#radio").append(appendVis);
			$('input[name=part0]').prop('disabled', false);
			//var id = '#part1';
			//$(id).prop('checked', true);
		}

		$('#movie').prop('disabled', false);

		oboerequest(JSON.stringify(queryVisualizations));

	});

	/**
	 * Select Movie
	 */
	$('#movie').on('change', function() {
		$("#graph").empty();
		$('#shots').empty();

		segmentsArray = [];

		$('#visualization').prop('disabled', false);

		$('select').material_select();

		var movieID = $(this).val();
		//console.log(movieID);

		var querySegmentIds = {
			queryType : "getSegments",
			multimediaobjectId : movieID
		};

		oboerequest(JSON.stringify(querySegmentIds));

		if ($('#type').val() == "VISUALIZATION_MULTIMEDIAOBJECT") {
			$('#shots').hide();
		}
		if ($('#type').val() == "VISUALIZATION_SEGMENT") {
			$('#shots').show();
		}
	});

	/**
	 * Select visualization with radiobuttons/checkboxes
	 */
	$(document).on('change', 'input[name=part0]', function() {
		//console.log($("input[name=part0]:checked").val());
		var IDs = $("input[name=part1]").map(function() { return this.id; }).get();
		var IDs2 = $("input[name=part2]").map(function() { return this.id; }).get();
		var possibleValues = "";
		for (var i = 0; i < IDs.length; i++) {
			possibleValues += beginStringVisualization;
			possibleValues += $("input[name=part0]:checked").val();
			possibleValues += $("#" + IDs[i]).val();
			for (var j = 0; j < visualizationArray.length; j++) {
				if (visualizationArray[j].includes(possibleValues)) {
					$("#" + IDs[i]).prop('disabled', false);
					break;
				} else {
					$("#" + IDs[i]).prop('disabled', true);
				}
			}
			possibleValues = "";
		}
		
		for (var i = 0; i < IDs2.length; i++) {
			$("#" + IDs2[i]).prop('disabled', true);
		}
		//console.log(IDs);
		$('input[name=part1]').prop('checked', false);
		$('input[name=part2]').prop('checked', false);
		
		$('#search-button').prop('disabled', true);
	});
	
	$(document).on('change', 'input[name=part1]', function() {
		//console.log($("input[name=part1]:checked").val());
		var IDs = $("input[name=part2]").map(function() { return this.id; }).get();
		var possibleValues = "";
		
		for (var i = 0; i < IDs.length; i++) {
			possibleValues += beginStringVisualization;
			possibleValues += $("input[name=part0]:checked").val();
			possibleValues += $("input[name=part1]:checked").val();
			possibleValues += $("#" + IDs[i]).val();
			for (var j = 0; j < visualizationArray.length; j++) {
				if (visualizationArray[j].includes(possibleValues)) {
					$("#" + IDs[i]).prop('disabled', false);
					break;
				} else {
					$("#" + IDs[i]).prop('disabled', true);
				}
			}
			possibleValues = "";
		}
		
		var checked = beginStringVisualization + $("input[name=part0]:checked").val() + $("input[name=part1]:checked").val();
		if(visualizationArray.indexOf(checked) != -1) {
			$('#search-button').prop('disabled', false);
		} else {
			$('#search-button').prop('disabled', true);
		}
		
		$('input[name=part2]').prop('checked', false);
	});
	
	$(document).on('change', 'input[name=part2]', function() {
		//console.log($("input[name=part2]:checked").val());
		
		var checked1 = beginStringVisualization + $("input[name=part0]:checked").val() + $("input[name=part1]:checked").val();
		var checked2 = beginStringVisualization + $("input[name=part0]:checked").val() + $("input[name=part1]:checked").val() + $("input[name=part2]:checked").val();
		if(visualizationArray.indexOf(checked1) != -1 || visualizationArray.indexOf(checked2)) {
			$('#search-button').prop('disabled', false);
		} else {
			$('#search-button').prop('disabled', true);
		}
	});

	/**
	 * Select Visualization
	 */
	$('#visualization').on('change', function() {
		$("#graph").empty();
		$('#search-button').prop('disabled', false);
	});

	/**
	 * Visualization Button
	 */
	$('#search-button').click(function() {
		$("#graph").empty();
		var movie = $('#movie').val();
		var type = $('#type').val();
		var visualization = $('#visualization').val();

		if (type == "VISUALIZATION_MULTIMEDIAOBJECT") {
			var queryArt = {
				queryType : "getArt",
				visualizationType : type,
				visualization : visualization,
				multimediaobjectId : movie
			};

			oboerequest(JSON.stringify(queryArt));
		}
		if (type == "VISUALIZATION_SEGMENT") {
			var shot = $("input[name=shotIDs]:checked").val();

			var queryArt = {
				queryType : "getArt",
				visualizationType : type,
				visualization : visualization,
				segmentId : shot
			};

			oboerequest(JSON.stringify(queryArt));
		}

	});

	$('#d3').on('change', function() {
		$('#search-button-d3').prop('disabled', false);
	});

	$('#search-button-d3').click(function() {
		$("#graph").empty();
		$("#graphd3").empty();

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

var progressCounter = 0;
function showProgress(progress) {
	$('#loading').show();
	$('#loading>.determinate').css('width', Math.round(100 * progress) + '%');
	progressCounter = progress;
}

function hideProgress() {
	$('#loading').hide();
}

function oboerequest(query, noContext) {
	searchRunning = true;
	showProgress(0);
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
			hideProgress();
			console.log(data);
			console.log(data.array[0]);
			searchRunning = false;

			switch(Object.keys(data.array[0])[0]) {
			case "multimediaobjects":
				var movies = '';
				data.array[0].multimediaobjects.sort(function(a, b) {
					var textA = a.name.toUpperCase();
					var textB = b.name.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});
				for (var i = 0; i < data.array[0].multimediaobjects.length; i++) {
					movies += '<option value="' + data.array[0].multimediaobjects[i].videoid + '">' + data.array[0].multimediaobjects[i].name + '</option>';
				}
				$("#movie").append(movies);
				$('select').material_select();
				break;
			case "segments":
				var movieID = $('#movie').val();
				var segs = '';
				segs += '<form action="#" class="scrollWithBar">';
				for (var i = 0; i < data.array[0].segments.length; i++) {
					segs += '<label class="rad">';
					segs += '<input name="shotIDs" type="radio" id="' + data.array[0].segments[i] + '" value="' + data.array[0].segments[i] + '" />';
					segs += '<img class="thumbnail pixelated" src="' + thumbnailHost + '' + movieID + '/' + data.array[0].segments[i] + '.' + thumbnailFileType + '" />';
					segs += '</label>';
					segmentsArray.push(data.array[0].segments[i]);
				}
				segs += '</form>';
				$("#shots").append(segs);
				var id = '#' + data.array[0].segments[0];
				$(id).prop('checked', true);
				break;
			/*case "visualizationCategories":
			 for (var i = 0; i < data.array[0].visualizationCategories.length; i++) {
			 $("#type").append('<option value="' + data.array[0].visualizationCategories[i] + '">' + data.array[0].visualizationCategories[i] + '</option>');
			 }
			 $('select').material_select();
			 break;*/
			case "visualizations":
				$("#visualization").empty();
				$("#visualization").append('<option value="notAvailable" disabled selected>Visualization</option>');
				visualizationArray = [];
				if ($('#type').val() == "VISUALIZATION_MULTIMEDIAOBJECT") {
					for (var i = 0; i < data.array[0].visualizations.length; i++) {
						for (var j = 0; j < data.array[0].visualizations[i].visualizationTypes.length; j++) {
							if (data.array[0].visualizations[i].visualizationTypes[j] == "VISUALIZATION_MULTIMEDIAOBJECT") {
								$("#visualization").append('<option value="' + data.array[0].visualizations[i].className + '">' + data.array[0].visualizations[i].displayName + '</option>');
								visualizationArray.push(data.array[0].visualizations[i].className);
								//console.log(data.array[0].visualizations[i].className);
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
								visualizationArray.push(data.array[0].visualizations[i].className);
								//console.log(data.array[0].visualizations[i].className);
							}
						}
					}
					$('select').material_select();
				}
				$('#search-button').prop('disabled', true);

				break;
			case "resultData":
				if (data.array[0].resultType == "IMAGE") {
					$("#graph").empty();
					var picture = data.array[0].resultData;
					$("#graph").append('<br \><br \><img class="materialboxed pixelated" id="result" src="' + picture + '" />');

					$(document).ready(function() {
						$('.materialboxed').materialbox();
					});

				}
				break;
			default:
				console.log(data.array[0]);
				break;
			}
		}).fail(function(data) {
			console.log("FAIL");
			console.log(data);
			hideProgress();
			searchRunning = false;
		});
	} catch(e) {
		console.warn(e.message + " | " + e.lineNumber);
	}

}
