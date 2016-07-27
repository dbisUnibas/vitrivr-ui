function motionCanvas(canvas){
	
	var el = canvas.get(0);
	
	var paths = new Array();
	var currentPath;
	
	var ctx = el.getContext('2d');
	ctx.lineJoin = ctx.lineCap = 'round';
	ctx.strokeStyle = ctx.fillStyle = 'black';
	ctx.lineWidth = 1;

	var isDrawing, lastPoint, lastAngle;
	
	function addPointToPath(point){
		currentPath.push(
			[Math.min(1, Math.max(0, point.x / el.width)) ,
			 Math.min(1, Math.max(0, point.y / el.height))]
		);
	}
	
	el.onmousedown = function(e) {
	  isDrawing = true;
	  currentPath = new Array();
	  var offset = canvas.offset();
	  lastPoint = { x: e.clientX - offset.left + $(window).scrollLeft(), y: e.clientY - offset.top + $(window).scrollTop()};
	  addPointToPath(lastPoint);
	};
	
	el.onmousemove = function(e) {
	  if (!isDrawing) return;
	  var offset = canvas.offset();
	  var currentPoint = { x: e.clientX - offset.left + $(window).scrollLeft(), y: e.clientY - offset.top + $(window).scrollTop()};
	  ctx.beginPath();
	  ctx.moveTo(lastPoint.x, lastPoint.y);
	  ctx.lineTo(currentPoint.x, currentPoint.y);
	  ctx.stroke();
	  
	  addPointToPath(currentPoint);
	  lastAngle = Math.atan2(currentPoint.y - lastPoint.y, currentPoint.x - lastPoint.x);
	  lastPoint = currentPoint;
	};
	
	var finishPath = function(){
		isDrawing = false;
		if (currentPath != null && currentPath.length > 1) {
			paths.push(currentPath);

			ctx.save();
			ctx.translate(lastPoint.x, lastPoint.y);
			ctx.rotate(lastAngle - 1.5707);
			ctx.beginPath();
			ctx.moveTo(-5, 0);
			ctx.lineTo(5, 0);
			ctx.lineTo(0, 10);
			ctx.closePath();
			ctx.fill();

			ctx.restore();
		}
		currentPath = null;
		
		if(ScoreWeights.motion == 0){
			readSliders();
			var val = 20;
			$('#motion-weight').get(0).noUiSlider.set(val);
			
			readSliders();
			var sum = sumWeights();
			if(sum > 100){
				var scale = (100 - val) / (sum - ScoreWeights.motion);
				$('#global-color-weight').get(0).noUiSlider.set(ScoreWeights.globalcolor * scale);
				$('#local-color-weight').get(0).noUiSlider.set(ScoreWeights.localcolor * scale);
				$('#edge-weight').get(0).noUiSlider.set(ScoreWeights.edge * scale);
			}
		
		updateScores(true);
		}
	};
	
	el.onmouseout = finishPath;
	el.onmouseup = finishPath;
	
	this.getPaths = function(){
		return JSON.stringify(paths);
	};
	
	this.clearPaths = function(){
		paths = new Array();
		ctx.clearRect(0, 0, el.width, el.height);
	};
}
