var Videos = {};
var Shots = {};
var Scores = {};

var ScoreWeights = {};

var rf_positive = new Array();
var rf_negative = new Array();

function getCategories(){
	var categories = [];
	
	var ks = Object.keys(categoryConfig);
	for (var i = 0, len = ks.length; i < len; i++) {
  		var key = ks[i];	  					
  		if(ScoreWeights[key] > 0){
  			categories.push(key);
  		}			
  	}
  	
  	categories.sort(function(a, b){
  		return (categoryConfig[a].queryOrder || 0) - (categoryConfig[b].queryOrder || 0);
  	});
  	
	return categories;
}

function sumWeights(){
	var sum = 0;
	
	var ks = Object.keys(categoryConfig);
	for (var i = 0, len = ks.length; i < len; i++) {
  		var key = ks[i];
  		sum += parseInt(ScoreWeights[key]);
  	}
	
	return sum > 0 ? sum : 1;
}

function normalizeScoreWeights(){

	var sum = sumWeights();

	if(sum > 0){
		var ks = Object.keys(categoryConfig);
		for (var i = 0, len = ks.length; i < len; i++) {
	  		var key = ks[i];
	  		ScoreWeights[key] /= sum;
	  	}
	}
}

function clearResults(){
	Videos = {};
	Shots = {};
	Scores = {};
	$('#results').empty();
	$('#sequence-segmentation-button').hide();
	$('#rf-button').hide();
}

function search(id, positive, negative){
	clearResults();
	if(id === undefined || id < 0){
		if(positive === undefined){ //sketch query
			console.log("starting sketch-based search");
			oboerequest(buildQuery());
		}else{//relevance feedback
			console.log("starting relevance feedback");
			oboerequest(buildRFQuery());
			rf_positive = new Array();
			rf_negative = new Array();
		}
	}else{ //id lookup
		console.log("starting id-based search");
		oboerequest(buildIdQuery(id));
	}

}


function buildIdQuery(id) {

	var query = {
		queryType: "query",
		query:[
			{
				id: id.toString(),
				categories: getCategories()
			}
		]
	};


	return JSON.stringify(query);

}

function buildRFQuery() {

	var query = {
		queryType: "query"
	};

	var elements = new Array();

	for(var key in rf_positive){
		elements.push({
			id: rf_positive[key].toString(),
			weight: 1,
			categories: getCategories()
		});
	}

	for(var key in rf_negative){
		elements.push({
			id: rf_negative[key].toString(),
			weight: -1,
			categories: getCategories()
		});
	}

	query.query = elements;
	return JSON.stringify(query);

}

function buildContextQuery() {

	var shotids = new Array();

	for(var key in Shots){
		shotids.push(Shots[key].shotid);
	}

	var query = {
		queryType: "context",
		query: {
			shotidlist: shotids.toString()
		}
	};

	return JSON.stringify(query);

}

function buildVideoQuery(shotid){

	var query = {
		queryType: "video",
		query: {
			shotid: shotid.toString()
		}
	};

	return JSON.stringify(query);
}

function buildQuery(){

var query = {
	queryType: "query",

};

var containers = new Array();


for(var key in shotInputs){
	var shotInput = shotInputs[key];

	var container = {
		img : shotInput.color.getDataURL(),
		motion: shotInput.motion.getPaths(),
		motionbackground: shotInput.motion.getBgPaths(),
		categories: getCategories()
	};

	containers.push(container);

}

query.query = containers;

return JSON.stringify(query);

}

function getResultName(){
	var resultName = $('#resultset-filter-selection>p>input:checked').attr('id');
	if(resultName == 'no-filter' || resultName === undefined){
		resultName = null;
	}
	return resultName;
}

function oboerequest(query, noContext) {
	searchRunning = true;
	showProgress(0);
	if(noContext === undefined){
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
			console.log("request done");

			for(key in Videos){
				sortVideoContainer(key);
				updateVideoScore(key);
			}

			sortVideos();
				$('#sequence-segmentation-button').show();
				hideProgress();

			searchRunning = false;

		}).node('{type}', function(data) {
			var type = data.type;
			switch(type) {

			case "error":

				console.warn(data);
				Materialize.toast(data.msg, 5000, 'orange');
				
				break;

			case "result":

				addResults([data]);

				break;
			case "shot":

				addShots([data]);

				break;
			case "video":

				addVideos([data]);

				break;
			case "resultname":

				addResultSetFilter(data.name);

				break;

			case "batch":
				switch(data.inner){
					case "result":

						addResults(data.array);

						break;
					case "shot":

						addShots(data.array);

						break;
					case "video":

						addVideos(data.array);

						break;
				}

				break;

			default:
				console.warn("type not recognized" + JSON.stringify(data));
			}
		}).fail(function(data){
			console.log("FAIL");
			console.log(data);
			hideProgress();
			searchRunning = false;
		});
	} catch(e) {
		console.warn(e.message + " | " + e.lineNumber);
	}
}

function addVideos(videoArray){
	for(var iter = 0; iter < videoArray.length; ++iter){
		var data = videoArray[iter];
		if(!(data.videoid in Videos)){
			Videos[data.videoid] = data;
			addVideoContainer(data.videoid);
		}
	}
}

function addShots(shotArray){
	var videosToSort = {};
	for(var iter = 0; iter < shotArray.length; ++iter){
		var data = shotArray[iter];
		if(!(data.shotid in Shots)){
			Shots[data.shotid] = data;
			addShotContainer(data);
			videosToSort[data.videoid] = undefined; //adding empty key to map
			if (!(data.shotid in Scores)) {
				var scoreContainer = {};
				for (var key in ScoreWeights) {
					scoreContainer[key] = 0;
				}
				Scores[data.shotid] = scoreContainer;
			}
		}
	}
	var videoIdArray = Object.keys(videosToSort);
	for(var i = 0; i < videoIdArray.length; ++i){
		sortVideoContainer(videoIdArray[i]);
	}
}

function addResults(resultArray){

	if(resultArray.length < 1){
		return;
	}

	var shotsToUpdateScore = {};

	for(var iter = 0; iter < resultArray.length; ++iter){
		var data = resultArray[iter];
		if (!(data.shotid in Scores)) {
			var scoreContainer = {};
			for (var key in ScoreWeights) {
				scoreContainer[key] = 0;
			}
			Scores[data.shotid] = scoreContainer;
		}
		var scoreContainer = Scores[data.shotid];
		if (data.score > scoreContainer[data.category]) {
			scoreContainer[data.category] = data.score;
			shotsToUpdateScore[data.shotid] = undefined;
		}
	}

	var shotIdsToUpdateScore = Object.keys(shotsToUpdateScore);
	var weightSum = sumWeights();
	for(var i = 0; i < shotIdsToUpdateScore.length; ++i){
		var scoreContainer = Scores[shotIdsToUpdateScore[i]];

		var score = 0;
		for (var key in ScoreWeights) {
			score += scoreContainer[key] * ScoreWeights[key];
		}
		updateScoreInShotContainer(shotIdsToUpdateScore[i], score / weightSum);

	}

	var categories = getCategories();
	var currentProgress = ((categories.indexOf(resultArray[0].category) + 1) / (categories.length + 1));
	if (currentProgress > progressCounter) {
		progressCounter = currentProgress;
		showProgress(progressCounter);
	}

}

function requestEntireVideo(shotid){
	$('#v' + Shots[shotid].videoid).addClass('highlightedVideo');
	oboerequest(buildVideoQuery(shotid), true);
}

function updateVideoScore(videoid){
	var score = 0;
	var arr = Array();
	$('#v' + videoid + ' > .shotbox').each(function(){
		var data_score = $(this).data('score');
		if(data_score !== undefined && parseFloat(data_score) > 0){
			arr.push(parseFloat(data_score));
		}
	});

	for(var i = 0; i < arr.length; ++i){
		score = Math.max(score, arr[i]);
	}

	if(score != score){
		score = 0;
	}

	$('#v' + videoid).data('score', score).attr('data-score', score); //second part is necessary to write score to html
}
