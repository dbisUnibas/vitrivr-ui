var shotInputs = {};
var shotInputIdCounter = 0;
var submissionURL;

function newShotInput() {

	var id = 'shotInput_' + (shotInputIdCounter++);

	var container = $('<div>');
	container.addClass('query-input-container');
	container.attr('id', id);
	container.hide();
	

	var color = $('<canvas>');
	color.addClass('queryinput').addClass('colorsketch');
	color.attr('width', '360').attr('height', '288');
	container.append(color);

	var motion = $('<canvas>');
	motion.addClass('queryinput').addClass('motionsketch');
	motion.attr('width', '360').attr('height', '288');
	container.append(motion);

	/*var objects = $('<div>');
	objects.addClass('queryinput').addClass('objectsketch').addClass('dropzone');
	container.append(objects);*/
	
	var concepts = $('<canvas>');
	concepts.addClass('queryinput').addClass('objectsketch');
	concepts.attr('width', '360').attr('height', '288');
	container.append(concepts);
	
/*
	var audio = $('<div>');
	audio.addClass('queryinput').addClass('audiosketch');
	audio.append('<audio id="audio_' + id + '" src="" controls=""></audio>');
	var recordButton = $('<button id="record_' + id + '" class="waves-effect waves-light btn btn-large red" style="width: 300px">' + 
	'<i class="material-icons left">mic_none</i>Record' + 
	'</button>');
	
	recordButton.click(function(){
		var button = $(this);
		if(button.data('recording')){
			button.data('recording', false);
			button.html('<i class="material-icons left">mic_none</i>Record');
			Fr.voice.export(function(url){
				button.prev().attr("src", url);
			}, function(base64){
				button.parent().parent().data('audio', base64);
			});
			Fr.voice.stop();
		}else{
			button.data('recording', true);
			button.html('<i class="material-icons left">mic</i>Recording...');
			Fr.voice.record(false);
		}
	});
	
	audio.append(recordButton);
	container.append(audio);*/

	var colorcanvas = new sketchCanvas(color);
	colorcanvas.setLineWidth($('#draw-radius').get(0).noUiSlider.get());
	colorcanvas.setColor($("#colorInput").spectrum('get'));

	var motioncanvas = new motionCanvas(motion);
	var t = $('#fgbgswitch-button').get(0).textContent;
	motioncanvas.setFgbgSwitch($('#fgbgswitch-button').get(0).textContent == "Foreground" ? 1 : 0);

	shotInputs[id] = {
		color : colorcanvas,
		motion : motioncanvas,
		id : '#' + id,
		conceptList : new Array()
	};

	$('#query-container-pane').append(container);
	container.slideDown(200);

	context.attach('#' + id + '>.colorsketch', [{
		header : 'Layer'
	}, {
		text : 'Fill',
		action : function(e) {
			e.preventDefault();
			shotInputs[id].color.fill();
		}
	}, {
		text : 'Clear',
		action : function(e) {
			e.preventDefault();
			shotInputs[id].color.clear();
		}
	}, {
		divider : true
	}, {
		header : 'Canvas'
	}, {
		text : 'Delete',
		action : function(e) {
			e.preventDefault();
			destroyCanvas(id);
		}
	}
	]);
	
	context.attach('#' + id + '>.motionsketch', [{
		header : 'Layer'
	}, {
		text : 'Clear',
		action : function(e) {
			e.preventDefault();
			shotInputs[id].motion.clearPaths();
			shotInputs[id].motion.clearBgPaths();
		}
	}, {
		divider : true
	}, {
		header : 'Canvas'
	}, {
		text : 'Delete',
		action : function(e) {
			e.preventDefault();
			destroyCanvas(id);
		}
	}
	]);
	
	/*context.attach('#' + id + '>.objectsketch', [{
		header : 'Layer'
	}, {
		text : 'Clear',
		action : function(e) {
			e.preventDefault();
			$('#' + id + '>.objectsketch').empty();
		}
	},{
		header : 'Canvas'
	}, {
		text : 'Delete',
		action : function(e) {
			e.preventDefault();
			destroyCanvas(id);
		}
	}
	]);*/
	
	/*context.attach('#' + id + '>.audiosketch', [{
		header : 'Layer'
	}, {
		text : 'Clear',
		action : function(e) {
			e.preventDefault();
			$('#' + id).data('audio', undefined);
		}
	}, {
		header : 'Canvas'
	}, {
		text : 'Delete',
		action : function(e) {
			e.preventDefault();
			destroyCanvas(id);
		}
	}
	]);*/

	//addDropZone('.class-container', '#' + id + '>.dropzone');

	$('#modechoice').children(".active").find("span").click();

	return id;
}

function addVideoContainer(id){
	return $('#results').append('<div id="v' + id + '" class="videocontainer"> </div>');
}

function addShotContainer(shotInfo, containerId){ //TODO optimize
	containerId = containerId || shotInfo.videoid;
	$('#v' + containerId).append(
		
		'<div class="shotbox" id="s' + shotInfo.shotid + '" data-startframe="' + shotInfo.start + '" data-endframe="' + shotInfo.start + '">' + 
		'<span class="preview">' +
		'<img class="thumbnail" src="' + thumbnailHost + '' + shotInfo.videoid + '/' + shotInfo.shotid + '.' + thumbnailFileType + '" />' + //see config.js
		'<div class="tophoverbox">' +
		'<span class="material-icons searchbutton">search</span>' +
		'<span class="material-icons playbutton">play_arrow</span>' +
		'<span class="material-icons relevanceFeedback relevanceFeedback-add">add</span>' +
		'<span class="material-icons relevanceFeedback">remove</span>' +
		(showCategoryWeights ? '<span class="material-icons showCategoryWeights">help</span>' : '') +
	//	'<span class="material-icons showid">textsms</span>' +
	//	'<span class="material-icons load_video">movie</span>' +
		'</div>' +
		'<div class="bottomhoverbox">' +
		'<span class="score"> 0% </span>' +
		'<span class="position"> ' + shotInfo.start + ' - ' + shotInfo.end + ' </span>' +
		'</div>' +
		'</span>' +
		'</div>'
		
	);
	//$('#s' + shotInfo.shotid + '>span>div>.playbutton').on('click', playShot);
	$('#s' + shotInfo.shotid + '>span>div>.playbutton').on('click', prepare_playback);
	$('#s' + shotInfo.shotid + '>span>div>.searchbutton').on('click', similaritySearch);
	$('#s' + shotInfo.shotid + '>span>div>.relevanceFeedback').on('click', relevanceFeedback);
	if(showCategoryWeights){
		$('#s' + shotInfo.shotid + '>span>div>.showCategoryWeights').on('click', showScoreComposition);
	}
	//$('#s' + shotInfo.shotid + '>span>div>.showid').on('click', showVideoId);
	//$('#s' + shotInfo.shotid + '>span>div>.load_video').on('click', load_video);
}

function updateScoreInShotContainer(id, score){
	var container = $('#s' + id);
	container.css('background-color', scoreToColor(score));
	container.data('score', score);
	container.find('.score').html(Math.round(score * 100) + '%');
}

/**
 * Scales from 0 to max
 * Perfect Matches => from 0.8 to 1 will receive a g-value of max
 */
function scoreToColor(pct) {
	var max = 0.8;
	var ideal = 230.0;
	if (pct > max) {
		var r = 0;
		var g = ideal;
		var b = 0;
	} else {
		var r = Math.floor((1.0 - pct / max) * (255.0));
		var g = ideal + Math.floor((1.0 - pct / max) * (255.0 - ideal));
		var b = Math.floor((1.0 - pct / max) * (255.0 ));
	}
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}


function sortVideoContainer(videoid){
	try{
		tinysort('#v' + videoid + '>.shotbox', {
			data : 'startframe',
			order : 'asc'
		});
	}catch (e){
		console.warn(e);
	}
}

function sortVideos(){
	try{
		tinysort('#results>.videocontainer', {
			data : 'score',
			order : 'desc'
		});
	}catch (e){
		//console.warn(e);
	}
}


function updateScores(segmentedVideos) {
	readSliders();
	var weightSum = sumWeights();
	
	for (var key in Shots) {
		var shotId = Shots[key].shotid;

		var scoreContainer = Scores[shotId];
		var score = 0;
		for (var key in ScoreWeights) {
			score += scoreContainer[key] * ScoreWeights[key];
		}
		updateScoreInShotContainer(shotId, score / weightSum);
		
	}

	segmentedVideos = segmentedVideos || false;
	if(segmentedVideos){
		var ids = new Array();
		$('#results>.videocontainer').each(function(index) {
		  ids.push($(this).attr('id').substring(1));
		});
		for(var key in ids){
			updateVideoScore(ids[key]);
		}
	}else{
		for (var key in Videos) {
		sortVideoContainer(key);
		updateVideoScore(key);
		}
	}
	

	sortVideos();
}

function sequenceSegmentation(){
	$('#sequence-segmentation-button').hide();
	for(var key in Videos){
		var videoId = Videos[key].videoid;
		var ids = new Array();
		$('#v' + videoId + '>.shotbox').each(function(){ids.push(parseInt($(this).attr('id').substring(1)));});
		if(ids.length > 1){
			$('#v' + videoId).empty();
			var segmentCounter = 0;
			var currentContainerId = videoId + '_' + (segmentCounter++);
			addVideoContainer(currentContainerId);
			var currentShotInfo = Shots[ids[0]];
			var lastShotInfo = currentShotInfo;
			addShotContainer(currentShotInfo, currentContainerId);
			for(var i = 1; i < ids.length; ++i){
				lastShotInfo = currentShotInfo;
				currentShotInfo = Shots[ids[i]];
				if((currentShotInfo.start - lastShotInfo.end) > maxFrameGap){
					currentContainerId = videoId + '_' + (segmentCounter++);
					addVideoContainer(currentContainerId);
				}
				addShotContainer(currentShotInfo, currentContainerId);
			}
			$('#v' + videoId).remove();
		}
		
	}
	updateScores(true);
	
}

function playShot(event){
	var shotBox = $(this).parent().parent().parent();
	var shotId = parseInt(shotBox.attr('id').substring(1));
	var shotInfo = Shots[shotId];
	var videoInfo = Videos[shotInfo.videoid];
	var path = videoHost + videoInfo.path;
	shotStartTime = shotInfo.start / 25;
	var player = videojs('videoPlayer');

	
  $('#video-modal').openModal({
  	in_duration: 0,
  	out_duration: 0,
  	ready: function(){
		player.src(path);
  	},
  	complete:function(){
  		player.pause();
  	}
  });
}

function similaritySearch(event){
	var shotBox = $(this).parent().parent().parent();
	var shotId = parseInt(shotBox.attr('id').substring(1));
	search(shotId);
}


function relevanceFeedback(event){
	var _this = $(this);
	var shotBox = _this.parent().parent().parent();
	var shotId = parseInt(shotBox.attr('id').substring(1));
	var positive = _this.hasClass('relevanceFeedback-add');
	
	if(positive){
		if($.inArray(shotId, rf_positive) >= 0){ //remove
			_this.css('color', 'white');
			remove_element(rf_positive,shotId);
		}else{ //add
			if($.inArray(shotId, rf_negative) >= 0){
				remove_element(rf_negative,shotId);
				_this.next().css('color', 'white');
			}
			rf_positive.push(shotId);
			_this.css('color', 'green');
		}
	}else{//negative
		if($.inArray(shotId, rf_negative) >= 0){ //remove
			_this.css('color', 'white');
			remove_element(rf_negative,shotId);
		}else{ //add
			if($.inArray(shotId, rf_positive) >= 0){
				remove_element(rf_positive,shotId);
				_this.prev().css('color', 'white');
			}
			rf_negative.push(shotId);
			_this.css('color', 'red');
		}
	}
	
	if(rf_positive.length > 0){
		$('#rf-button').show();
	}else{
		$('#rf-button').hide();
	}
	
	
	console.log(rf_positive);
	console.log(rf_negative);
}

function showScoreComposition(event){
	var _this = $(this);
	var shotBox = _this.parent().parent().parent();
	var shotId = parseInt(shotBox.attr('id').substring(1));

	var scores = Scores[shotId];
	var categories = Object.keys(scores);

	var list = '<ul>';

	for(var i = 0; i < categories.length; ++i){
		var cat = categories[i];
		list += '<li>' + cat + ': ' + scores[cat] + '</li>';
	}
	list += '</ul>';

	Materialize.toast(list, 5000);

}

function prepare_playback(event){
	var shotBox = $(this).parent().parent().parent();
	var shotId = parseInt(shotBox.attr('id').substring(1));
	var shotInfo = Shots[shotId];
	var frame = Math.floor((shotInfo.start + shotInfo.end) / 2);
	var videoInfo = Videos[shotInfo.videoid];
	var path = videoHost + videoInfo.path;
	var videoInfo = Videos[shotInfo.videoid];
	shotStartTime = shotInfo.start / (videoInfo.frames / videoInfo.seconds);
	var player = videojs('videoPlayer');
		
   $('#video-modal').openModal({
  	in_duration: 0,
  	out_duration: 0,
  	ready: function(){
		player.src(path);
  	},
  	complete:function(){
  		player.pause();
  	}
  });
}

function load_video(event){
	var _this = $(this);
	var shotBox = _this.parent().parent().parent();
	var shotId = parseInt(shotBox.attr('id').substring(1));
	requestEntireVideo(shotId);
}

function addResultSetFilter(resultSetName){
	$('#resultset-filter-selection').append(
		'<p><input class="with-gap" name="result-set" type="radio" id="' + 
		resultSetName + 
		'"/><label for="' +
		resultSetName + 
		'">' +
		resultSetName +
		'</label></p>'
      	);
}
var progressCounter = 0;
function showProgress(progress){
	$('#loading').show();
	$('#loading>.determinate').css('width', Math.round(100 * progress) + '%');
	progressCounter = progress;
}

function hideProgress(){
	$('#loading').hide();
}

function getNumberOfShotInputs(){
	return Object.keys(shotInputs).length;
}

function destroyCanvas(id) {
	context.destroy('#' + id + '>.colorsketch' );
	context.destroy('#' + id + '>.motionsketch' );
	context.destroy('#' + id + '>.objectsketch' );
	context.destroy('#' + id + '>.audiosketch' );
	
	delete shotInputs[id];
	$('#' + id).slideUp(200, function() {
		$('#' + id).remove();
		if(getNumberOfShotInputs() == 0){
			newShotInput();
		}
	});
}

function showSketchSuggestions(shotInputId){
	var suggestionPanel = $('#sketchSuggestionPanel');
	if(suggestionPanel.is(":visible")){
		suggestionPanel.hide();
	}
	
	var top = $('#shotInput_' + shotInputId).offset().top + 340;
	suggestionPanel.css('top', top);
	suggestionPanel.fadeIn(200);
	hideSketchSuggestionsTimer();
}

function hideSketchSuggestions(callback){
	clearTimeout(hideSketchSuggestionsTimeOut);
	$('#sketchSuggestionPanel').fadeOut(200, function(){
		$(this).empty();
		if(callback !== undefined){
			callback();
		}
	});
	
}

function addSketchSuggestion(name, id, width, height, dx, dy, shtoInputId){
	var suggestionPanel = $('#sketchSuggestionPanel');
	var suggestion = $('<div>');
	var imageUrl = 'img/sketch/' + id + '.png';
	var previewUrl = 'img/sketch_original/' + id + '.png';
	suggestion.addClass('sketchSuggestion');
	var img = $('<img width="250" height="250" src="' + previewUrl + '" />');
	suggestion.append(img);
	suggestion.append('<div>' + name + '</div>');
	
	img.click(function(e){
		var sketchImage = $('<img width="' + width + '" height="' + height + '" src="' + imageUrl + '" />');
		sketchImage.addClass('autoCompletedImage');
		sketchImage.css('top', dy).css('left', dx);
		sketchImage.hide();
		var target = $('#shotInput_' + shtoInputId);
		target.append(sketchImage);
		sketchImage.fadeIn(200);
		hideSketchSuggestions();
		shotInputs['shotInput_' + shtoInputId].concept.clear();
		shotInputs['shotInput_' + shtoInputId].conceptList.push(Math.floor(id / 80));
		startSearchTimeOut();
		if(ScoreWeights.concept == 0){
			readSliders();
			var val = 50;
			$('#concept-weight').get(0).noUiSlider.set(val);
			
			readSliders();
			var sum = sumWeights();
			if(sum > 100){
				var scale = (100 - val) / (sum - ScoreWeights.concept);
				$('#global-color-weight').get(0).noUiSlider.set(ScoreWeights.globalcolor * scale);
				$('#local-color-weight').get(0).noUiSlider.set(ScoreWeights.localcolor * scale);
				$('#edge-weight').get(0).noUiSlider.set(ScoreWeights.edge * scale);
				$('#motion-weight').get(0).noUiSlider.set(ScoreWeights.motion * scale);
			}
		
		updateScores(true);
		
		}
		
	});
	
	
	suggestionPanel.append(suggestion);
	
}
var hideSketchSuggestionsTimeOut;

function hideSketchSuggestionsTimer(){
	clearTimeout(hideSketchSuggestionsTimeOut);
	hideSketchSuggestionsTimeOut = setTimeout(hideSketchSuggestions, 10000);
}
