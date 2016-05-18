function sketchCanvas(canvas) {

	this.erase = false;
	
	var strokeCounter = 0;
	
	this.setErase = function(erase) {
		if (erase) {
			ctx.globalCompositeOperation = "destination-out";
			this.erase = true;
		} else {
			ctx.globalCompositeOperation = "source-over";
			this.erase = false;
		}
	};
	
	var setErase = this.setErase;

	var el = canvas.get(0);

	var ctx = el.getContext('2d');
	ctx.lineJoin = ctx.lineCap = 'round';

	var isDrawing, lastPoint;
	
	var image = new Image();
	image.onload = function(){
		ctx.drawImage(this, 0, 0, el.width, el.height);
	};
	image.onerror = function(e){
		console.warn(e);
	};

	this.loadImageFromUrl = function(url){
		image.src = url;
	};
	
	var loadImageFromUrl = this.loadImageFromUrl;

	el.onmousedown = function(e) {
		isDrawing = true;
		var offset = canvas.offset();
		lastPoint = {
			x : e.clientX - offset.left + $(window).scrollLeft(),
			y : e.clientY - offset.top + $(window).scrollTop()
		};
	};

	el.onmousemove = function(e) {
		setErase(e.ctrlKey);
		if (!isDrawing)
			return;
		var offset = canvas.offset();
		var currentPoint = {
			x : e.clientX - offset.left + $(window).scrollLeft(),
			y : e.clientY - offset.top + $(window).scrollTop()
		};
		ctx.beginPath();
		if (this.erase) {
			ctx.arc(lastX, lastY, 5, 0, Math.PI * 2, false);
			ctx.fill();
		} else {
			ctx.moveTo(lastPoint.x, lastPoint.y);
			ctx.lineTo(currentPoint.x, currentPoint.y);
			ctx.stroke();
		}

		lastPoint = currentPoint;
	};

	el.onmouseup = function() {
		isDrawing = false;
	};
	
	el.onmouseout = function() {
		isDrawing = false;
	};

	//image drag functionality
	el.ondragover = el.ondragend = function() {
		return false;
	};

	el.ondrop = function(e) {
		e.preventDefault();

		
		var file = e.dataTransfer.files[0];
		if ( typeof file === "undefined") {
			//image.src = e.dataTransfer.getData("URL");
			loadImageFromUrl(e.dataTransfer.getData("URL"));
		} else {
			var reader = new FileReader();
			reader.onloadend = function(event) {
				loadImageFromUrl(event.target.result);
			};
			reader.readAsDataURL(file);
		}
		return false;
	};
	/*
	this.drawDOMImage = function(img){
		console.log(img);
		ctx.drawImage(img, 0, 0, el.width, el.height);
	};*/

	this.setLineWidth = function(width) {
		ctx.lineWidth = width;
	};

	this.setColor = function(col) {
		ctx.strokeStyle = col;
		ctx.fillStyle = col;
	};

	this.clear = function() {
		ctx.clearRect(0, 0, el.width, el.height);
	};

	this.fill = function() {
		ctx.fillRect(0, 0, el.width, el.height);
	};

	this.getDataURL = function() {
		return el.toDataURL();
	};
}