var Videos = {};
var Shots = {};
var Scores = {};

var rf_positive = new Array();
var rf_negative = new Array();

var ScoreWeights = { //TODO update with sliders
	globalcolor: 0.1,
	localcolor: 0.6,
	edge: 0.3,
	motion: 0
};

function normalizeScoreWeights(){
	var sum = parseInt(ScoreWeights.globalcolor) + 
		parseInt(ScoreWeights.localcolor) + 
		parseInt(ScoreWeights.edge) + 
    parseInt(ScoreWeights.motion);

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

	query += "{\"categories\":" + JSON.stringify(categories) + ",\n";	//see config.js
	query += "\"id\": " + id + "}\n";

	query += "]}";

	return query;

}

function buildRFQuery() {

	var query = "{\"queryType\":\"relevanceFeedback\", \"query\":";
		query += "{\"positive\": " + JSON.stringify(rf_positive) + ",\n";
		query += "\"negative\": " + JSON.stringify(rf_negative) + ",\n";
		query += "\"categories\":" + JSON.stringify(categories) + "\n";	//see config.js
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

function buildQuery(){
	
	var query = "{\"queryType\":\"multiSketch\", \"query\":[";
	
	for(var key in shotInputs){
		var shotInput = shotInputs[key];
		
		query += "{\"img\": \"" + shotInput.color.getDataURL() + "\",\n";
		query += "\"motion\":" + shotInput.motion.getPaths() + ",\n";
        query += "\"motionbackground\":" + shotInput.motion.getBgPaths() + ",\n";
		query += "\"categories\":" + JSON.stringify(categories) + ",\n"; //see config.js
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
	if(resultName == 'no-filter'){
		resultName = null;
	}
	return resultName;
}

function oboerequest(query, noContext) {
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
			if(noContext){
				$('#sequence-segmentation-button').show();
				hideProgress();
			}else{
				oboerequest(buildContextQuery(), true);
				showProgress(categories.length / (categories.length + 1));
			}
			
		}).node('{type}', function(data) {
			var type = data.type;
			switch(type) {
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
				
			case "error" :
			
				console.error('Error from API: ' + data.msg);
				
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
	for(var i = 0; i < shotIdsToUpdateScore.length; ++i){
		var scoreContainer = Scores[shotIdsToUpdateScore[i]];
		
		var score = 0;
		for (var key in ScoreWeights) {
			score += scoreContainer[key] * ScoreWeights[key];
		}
		updateScoreInShotContainer(shotIdsToUpdateScore[i], score);
		
	}

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
	$('#v' + videoid + ' > .shotbox').each(function(){
		var data_score = $(this).data('score');
		if(data_score !== undefined){
			score = Math.max(score, parseFloat(data_score));
		}
		
	});
	$('#v' + videoid).data('score', score).attr('data-score', score); //second part is necessary to write score to html
}
