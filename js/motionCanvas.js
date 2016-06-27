function motionCanvas(canvas){
	
	var el = canvas.get(0);
	
    var fgbgSwitch = 1;//1: foreground; 0: background; 
    
	var paths = new Array();
    var bgPaths = new Array();
	var currentPath;
	
	var ctx = el.getContext('2d');
	ctx.lineJoin = ctx.lineCap = 'round';
	ctx.strokeStyle = ctx.fillStyle = 'red';
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
	
	el.onmouseup = el.onmouseout = function() {
	  isDrawing = false;
	  if(currentPath != null && currentPath.length > 1){
		if(fgbgSwitch == 1){
	        paths.push(currentPath);
	    }
	    else{
	        bgPaths.push(currentPath);
	    }
	  	
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
	};
	
	this.getPaths = function(){
		return JSON.stringify(paths);
	};
    
    this.getBgPaths = function(){
		return JSON.stringify(bgPaths);
	};
	
	this.clearPaths = function(){
		paths = new Array();
		ctx.clearRect(0, 0, el.width, el.height);
	};
    
    this.clearBgPaths = function(){
        bgPaths = new Array();
		ctx.clearRect(0, 0, el.width, el.height);
	};
    
    this.switchFgBg = function(){
		fgbgSwitch = 1 - fgbgSwitch;
        if(fgbgSwitch == 1){
            ctx.strokeStyle = ctx.fillStyle = 'red';
        }
        else{
            ctx.strokeStyle = ctx.fillStyle = 'green';
        }
	};
}