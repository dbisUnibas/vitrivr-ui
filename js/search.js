var Videos = {};
var Shots = {};
var Scores = {};

var rf_positive = new Array();
var rf_negative = new Array();

function getCategories(){
	var categories = [];
	if(ScoreWeights.globalcolor > 0){
		categories.push('globalcolor');
	}
	if(ScoreWeights.localcolor > 0){
		categories.push('localcolor');
	}
	if(ScoreWeights.edge > 0){
		categories.push('edge');
	}
	if(ScoreWeights.motion > 0){
		categories.push('motion');
	}
	return categories;
}

var ScoreWeights = {
	globalcolor: 0.1,
	localcolor: 0.6,
	edge: 0.3,
	motion: 0,
};

function sumWeights(){
	var sum = parseInt(ScoreWeights.globalcolor) + 
		parseInt(ScoreWeights.localcolor) + 
		parseInt(ScoreWeights.edge) + 
		parseInt(ScoreWeights.motion);
		return sum > 0 ? sum : 1;
}

function normalizeScoreWeights(){

	var sum = sumWeights();

	if(sum > 0){
		ScoreWeights.globalcolor /= sum;
		ScoreWeights.localcolor /= sum;
		ScoreWeights.edge /= sum;
		ScoreWeights.motion /= sum;
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

	var query = "{\"queryType\":\"multiSketch\", \"query\":[";

	query += "{\"categories\":" + JSON.stringify(getCategories()) + ",\n";	//see config.js
	query += "\"id\": " + id + "}\n";

	query += "]}";

	return query;

}

function buildRFQuery() {

	var query = "{\"queryType\":\"relevanceFeedback\", \"query\":";
		query += "{\"positive\": " + JSON.stringify(rf_positive) + ",\n";
		query += "\"negative\": " + JSON.stringify(rf_negative) + ",\n";
		query += "\"categories\":" + JSON.stringify(getCategories()) + "\n";	//see config.js
		query += "}}";

	return query;

}

function buildContextQuery() {

	var shotids = new Array();
	
	for(var key in Shots){
		shotids.push(Shots[key].shotid);
	}

	var query = "{\"queryType\":\"context\", \"query\":";
		query += "{\"shotidlist\": " + JSON.stringify(shotids);
		query += "}}";

	return query;

}

function buildVideoQuery(shotid){
	var query = "{\"queryType\":\"video\", \"query\":";
		query += "{\"shotid\": " + shotid;
		query += "}}";

	return query;
	
}

function buildQuery(){ //TODO categories from sketch complete
	
	var query = "{\"queryType\":\"multiSketch\", \"query\":[";
	
	for(var key in shotInputs){
		var shotInput = shotInputs[key];
		
		query += "{\"img\": \"" + shotInput.color.getDataURL() + "\",\n";
		query += "\"motion\":" + shotInput.motion.getPaths() + ",\n";
		query += "\"categories\":" + JSON.stringify(getCategories()) + ",\n"; //see config.js
		query += "\"concepts\":" + JSON.stringify(shotInput.conceptList) + ", \n";
		query += "\"id\": " + 0 + "\n";
		query += "},";
	}
	
	query = query.slice(0, -1);
	query += "],";
	query += "\"resultname\":\"" + getResultName() + "\"}";
		
	return query;
	
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