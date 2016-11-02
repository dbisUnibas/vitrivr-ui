const beginStringVisualization = "org.vitrivr.cineast.art.modules.Visualization";

const radioVisualizationMovie = [["AverageColor", "MedianColor", "DominantColor"], ["Grid8", "Gradient", "Stripe", "Sunburst", "Streamgraph"], ["Variable", "Square", "Real"]];
const radioVisualizationShot = [["AverageColor", "MedianColor", "DominantEdge"], ["Grid8", "Grid16", "AverageColor"], ["Grid8", "Grid16"]];
const radioVisualizationMultipleShots = [["AverageColor", "MedianColor", "DominantColor"], ["Grid8", "Gradient", "Stripe", "Sunburst", "Streamgraph"], ["Variable", "Square", "Real"]];

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
var shots = [];
var selectedVisualization = "";

$(function() {
	$(".button-collapse").sideNav();
	$(document).ready(function() {
		$('select').material_select();
		//$('select').prop('disabled', 'disabled');
		$('#clearShots').hide();
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
		$("#shots").empty();

		if ($('#movie').val() != null) {
			addShots();
		}

		if ($(this).val() == "VISUALIZATION_MULTIMEDIAOBJECT") {
			$('#shots').hide();
			$('#clearShots').hide();
			shots = [];

			var appendVis = '<form action="#">';
			for (var i = 0; i < radioVisualizationMovie.length; i++) {
				appendVis += "<p>";
				for (var j = 0; j < radioVisualizationMovie[i].length; j++) {
					if (i != (radioVisualizationMovie.length - 1)) {
						//console.log(radioVisualizationMovie[i][j]);
						appendVis += '<input name="part' + i + '" type="radio" id="' + radioVisualizationMovie[i][j] + i + '" value="' + radioVisualizationMovie[i][j] + '" disabled />';
						appendVis += '<label for="' + radioVisualizationMovie[i][j] + i + '">' + radioVisualizationMovie[i][j] + '</label>';
					} else {
						appendVis += '<input name="part' + i + '" type="checkbox" class="filled-in" id="' + radioVisualizationMovie[i][j] + i + '" value="' + radioVisualizationMovie[i][j] + '" disabled/>';
						appendVis += '<label for="' + radioVisualizationMovie[i][j] + i + '">' + radioVisualizationMovie[i][j] + '</label>';
					}
				}
				appendVis += "</p>";
			}
			appendVis += '</form>';

			$("#radio").append(appendVis);
		}

		if ($(this).val() == "VISUALIZATION_SEGMENT") {
			$('#shots').show();
			$('#clearShots').hide();
			shots = [];

			var appendVis = '<form action="#">';
			for (var i = 0; i < radioVisualizationShot.length; i++) {
				appendVis += "<p>";
				for (var j = 0; j < radioVisualizationShot[i].length; j++) {
					//console.log(radioVisualizationShot[i][j]);
					appendVis += '<input name="part' + i + '" type="radio" id="' + radioVisualizationShot[i][j] + i + '" value="' + radioVisualizationShot[i][j] + '" disabled />';
					appendVis += '<label for="' + radioVisualizationShot[i][j] + i + '">' + radioVisualizationShot[i][j] + '</label>';
				}
				appendVis += "</p>";
			}
			appendVis += '</form>';

			$("#radio").append(appendVis);
		}

		if ($(this).val() == "VISUALIZATION_MULTIPLESEGMENTS") {
			$('#shots').show();
			$('#clearShots').show();
			if (shots.length == 0) {
				$('#clearShots').prop('disabled', 'true');
			}

			var appendVis = '<form action="#">';
			for (var i = 0; i < radioVisualizationMultipleShots.length; i++) {
				appendVis += "<p>";
				for (var j = 0; j < radioVisualizationMultipleShots[i].length; j++) {
					if (i != (radioVisualizationMultipleShots.length - 1)) {
						//console.log(radioVisualizationMovie[i][j]);
						appendVis += '<input name="part' + i + '" type="radio" id="' + radioVisualizationMultipleShots[i][j] + i + '" value="' + radioVisualizationMultipleShots[i][j] + '" disabled />';
						appendVis += '<label for="' + radioVisualizationMultipleShots[i][j] + i + '">' + radioVisualizationMultipleShots[i][j] + '</label>';
					} else {
						appendVis += '<input name="part' + i + '" type="checkbox" class="filled-in" id="' + radioVisualizationMultipleShots[i][j] + i + '" value="' + radioVisualizationMultipleShots[i][j] + '" disabled/>';
						appendVis += '<label for="' + radioVisualizationMultipleShots[i][j] + i + '">' + radioVisualizationMultipleShots[i][j] + '</label>';
					}
				}
				appendVis += "</p>";
			}
			appendVis += '</form>';

			$("#radio").append(appendVis);
		}

		if ($('#movie').val() != null) {
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
		/*if (type == "VISUALIZATION_MULTIPLESEGMENTS") {
		 $("input[name=shotIDs]:checked").each(function(){
		 shots.push($(this).val());
		 });
		 }*/

		$("#graph").empty();
		$('#shots').empty();

		$('input[name=part0]').prop('disabled', false);

		$('select').material_select();

		var movieID = $(this).val();

		var querySegmentIds = {
			queryType : "getSegments",
			multimediaobjectId : movieID
		};

		oboerequest(JSON.stringify(querySegmentIds));
	});

	/**
	 * Select visualization with radiobuttons/checkboxes
	 */
	$(document).on('change', 'input[name=part0]', function() {
		$("#graph").empty();

		selectedVisualization = "";

		//console.log($("input[name=part0]:checked").val());
		var IDs = $("input[name=part1]").map(function() {
			return this.id;
		}).get();
		var IDs2 = $("input[name=part2]").map(function() {
			return this.id;
		}).get();
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

		//console.log(selectedVisualization);
	});

	$(document).on('change', 'input[name=part1]', function() {
		$("#graph").empty();

		selectedVisualization = "";

		//console.log($("input[name=part1]:checked").val());
		var IDs = $("input[name=part2]").map(function() {
			return this.id;
		}).get();
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
		if (visualizationArray.indexOf(checked) != -1) {
			$('#search-button').prop('disabled', false);
			selectedVisualization = checked;
		} else {
			$('#search-button').prop('disabled', true);
		}

		$('input[name=part2]').prop('checked', false);

		//console.log(selectedVisualization);
	});

	$(document).on('change', 'input[name=part2]', function() {
		$("#graph").empty();

		selectedVisualization = "";

		//console.log($("input[name=part2]:checked").val());
		var checked1 = beginStringVisualization + $("input[name=part0]:checked").val() + $("input[name=part1]:checked").val();
		var checked2 = beginStringVisualization + $("input[name=part0]:checked").val() + $("input[name=part1]:checked").val() + $("input[name=part2]:checked").val();
		if (visualizationArray.indexOf(checked2) != -1) {
			$('#search-button').prop('disabled', false);
			selectedVisualization = checked2;
		} else if (visualizationArray.indexOf(checked1) != -1) {
			$('#search-button').prop('disabled', false);
			selectedVisualization = checked1;
		} else {
			$('#search-button').prop('disabled', true);
		}

		//console.log(selectedVisualization);
	});

	/**
	 * Visualization Button
	 */
	$('#search-button').click(function() {
		$("#graph").empty();
		var movie = $('#movie').val();
		var type = $('#type').val();

		if (type == "VISUALIZATION_MULTIMEDIAOBJECT") {
			var queryArt = {
				queryType : "getArt",
				visualizationType : type,
				visualization : selectedVisualization,
				multimediaobjectId : movie
			};

			oboerequest(JSON.stringify(queryArt));
		}
		if (type == "VISUALIZATION_SEGMENT") {
			var shot = $("input[name=shotID]:checked").val();

			var queryArt = {
				queryType : "getArt",
				visualizationType : type,
				visualization : selectedVisualization,
				segmentId : shot
			};

			oboerequest(JSON.stringify(queryArt));

		}
		if (type == "VISUALIZATION_MULTIPLESEGMENTS") {
			//var shots = [];

			/*$("input[name=shotIDs]:checked").each(function(){
			 if (shots.indexOf($(this).val()) == -1) {
			 shots.push($(this).val());
			 }
			 });*/

			if (shots.length > 1) {
				var queryArt = {
					queryType : "getArt",
					visualizationType : type,
					visualization : selectedVisualization,
					segmentIds : shots
				};

				oboerequest(JSON.stringify(queryArt));
			} else {
				Materialize.toast('Please select at minimum 2 shots!', 4000, 'red');
			}

		}

	});

	/**
	 * Clear ShotIDs Array
	 */
	$('#clearShots').click(function() {
		shots = [];

		$("input[name=shotIDs]:checked").each(function() {
			$(this).prop('checked', false);
		});

		$('#clearShots').prop('disabled', true);

	});

	/**
	 * add ShotIDs to array or delete them
	 */
	$(document).on('change', 'input[name=shotIDs]', function() {
		if ($(this).is(":not(:checked)")) {
			if (shots.indexOf($(this).val()) != -1) {
				shots.splice(shots.indexOf($(this).val()), 1);
			}
		}
		if ($(this).is(":checked")) {
			shots.push($(this).val());
		}

		if (shots.length != 0) {
			$('#clearShots').prop('disabled', false);
		} else {
			$('#clearShots').prop('disabled', true);
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

function addShots() {
	if ($('#type').val() == "VISUALIZATION_MULTIMEDIAOBJECT") {
		$('#shots').hide();
	}
	if ($('#type').val() == "VISUALIZATION_SEGMENT") {
		var movieID = $('#movie').val();
		var segs = '';
		segs += '<form action="#" class="scrollWithBar">';
		for (var i = 0; i < segmentsArray.length; i++) {
			segs += '<label class="rad">';
			segs += '<input name="shotID" type="radio" id="' + segmentsArray[i] + '" value="' + segmentsArray[i] + '" />';
			segs += '<img class="thumbnail pixelated" src="' + thumbnailHost + '' + movieID + '/' + segmentsArray[i] + '.' + thumbnailFileType + '" />';
			segs += '</label>';
		}
		segs += '</form>';
		$("#shots").append(segs);
		var id = '#' + segmentsArray[0];
		$(id).prop('checked', true);
		$('#shots').show();
	}
	if ($('#type').val() == "VISUALIZATION_MULTIPLESEGMENTS") {
		var movieID = $('#movie').val();
		var segs = '';
		segs += '<form action="#" class="scrollWithBar">';
		for (var i = 0; i < segmentsArray.length; i++) {
			segs += '<label class="rad">';
			segs += '<input name="shotIDs" type="checkbox" id="' + segmentsArray[i] + '" value="' + segmentsArray[i] + '" />';
			segs += '<img class="thumbnail pixelated" src="' + thumbnailHost + '' + movieID + '/' + segmentsArray[i] + '.' + thumbnailFileType + '" />';
			segs += '</label>';
		}
		segs += '</form>';
		$("#shots").append(segs);
		$('#shots').show();

		//check if shots were selcted previously
		for (var i = 0; i < shots.length; i++) {
			$('#' + shots[i]).prop('checked', true);
		}
	}
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
			//console.log(data);
			//console.log(data.array[0]);
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
				Materialize.toast('Movies loaded.', 2000);
				break;
			case "segments":
				segmentsArray = [];
				for (var i = 0; i < data.array[0].segments.length; i++) {
					segmentsArray.push(data.array[0].segments[i]);
				}
				addShots();
				break;
			/*case "visualizationCategories":
			 for (var i = 0; i < data.array[0].visualizationCategories.length; i++) {
			 $("#type").append('<option value="' + data.array[0].visualizationCategories[i] + '">' + data.array[0].visualizationCategories[i] + '</option>');
			 }
			 $('select').material_select();
			 break;*/
			case "visualizations":
				visualizationArray = [];
				if ($('#type').val() == "VISUALIZATION_MULTIMEDIAOBJECT" || $('#type').val() == "VISUALIZATION_MULTIPLESEGMENTS") {
					for (var i = 0; i < data.array[0].visualizations.length; i++) {
						for (var j = 0; j < data.array[0].visualizations[i].visualizationTypes.length; j++) {
							if (data.array[0].visualizations[i].visualizationTypes[j] == "VISUALIZATION_MULTIMEDIAOBJECT") {
								visualizationArray.push(data.array[0].visualizations[i].className);
							}
						}
					}
					$('select').material_select();
				}
				if ($('#type').val() == "VISUALIZATION_SEGMENT") {
					for (var i = 0; i < data.array[0].visualizations.length; i++) {
						for (var j = 0; j < data.array[0].visualizations[i].visualizationTypes.length; j++) {
							if (data.array[0].visualizations[i].visualizationTypes[j] == "VISUALIZATION_SEGMENT") {
								visualizationArray.push(data.array[0].visualizations[i].className);
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
					$("#graph").append('<br \><br \><img class="materialboxed pixelated centered" id="result" src="' + picture + '" />');

					$(document).ready(function() {
						$('.materialboxed').materialbox();
					});

				}
				if (data.array[0].resultType == "GRAPH_SUNBURST") {
					$("#graph").empty();
					var d3GraphSunburst = data.array[0].resultData;
					//console.log(d3GraphSunburst);
					sunburst(d3GraphSunburst);

				}
				if (data.array[0].resultType == "GRAPH_STREAMGRAPH") {
					$("#graph").empty();
					var d3GraphStreamgraph = data.array[0].resultData;
					//console.log(d3GraphStreamgraph);
					streamgraph(d3GraphStreamgraph);
				}
				break;
			case "type":
				if(data.array[0].type == "error") {
					console.warn(data);
					Materialize.toast(data.array[0].msg, 5000, 'red');
				} else {
					console.warn("type not recognized" + JSON.stringify(data));
					console.log(data.array[0]);
				}
				break;
			default:
				console.warn("type not recognized" + JSON.stringify(data));
				//console.log(data.array[0]);
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
