var app = app || {};


app.run = function() {
	var objects = [];

	app.timeOutLength = 64;
	app.OVER = false;
	app.GO = false;
	app.mouse = {};
	app.mouse.x = 50;
	app.mouse.y = 50;
	app.progress = 0;
	app.progressMax = .8;
	app.lastTime = new Date();
	app.maxX = 499;
	app.maxY = 400;
	app.pauseTime = 0;
	app.now = new Date();

	app.canvas = document.getElementById('display');
	app.canvas2 = document.getElementById('display2');
	app.context = app.canvas.getContext('2d');
	app.context2 = app.canvas2.getContext('2d');
	app.canvas.style.cursor = 'none';

	app.eventListener = app.canvas;
  	app.eventListener.addEventListener('mousemove', app.onMousemove);
  	app.eventListener.addEventListener('click', app.onMouseClick);
  	app.eventListener.addEventListener('keydown', app.onKeyDown);

	objects.push(app.initCrosshairs());
	objects.push(app.makeBox('gameArea', {x:0, y:0}, app.maxX, app.maxY));
	objects.push(app.makeFocusBar());
	objects.push(app.makeProgressBar());
	objects.push(app.makeTimerBar());
	app.objects = objects;
	app.targets = [];

	var imageObj = new Image();

	imageObj.onload = function() {
		app.context.drawImage(imageObj, 0, 0);
	};
	imageObj.src = 'img/help.png';


	app.imageObj = imageObj;
	app.drawObjects();
};

app.initCrosshairs = function() {
	var crosshairs = {};
	crosshairs.name = 'crosshair';
	crosshairs.location = {x: 50, y: 50};
	crosshairs.randomize = function(xHair) {
		xHair.location.x = app.mouse.x + Math.floor(Math.random() * xHair.factor) - xHair.factor / 2;
		xHair.location.y = app.mouse.y + Math.floor(Math.random() * xHair.factor) - xHair.factor / 2;
		if(xHair.location.y > app.maxY) {
			xHair.location.y = app.maxY;
		}
	};
	crosshairs.factor = 30;
	crosshairs.redraw = false;
	crosshairs.draw = function() {
		app.context.strokeStyle = 'blue';
		app.context.lineWidth = 1;
		app.context.beginPath();
		app.context.moveTo(this.location.x - 0, this.location.y - 5);
		app.context.lineTo(this.location.x - 10, this.location.y - 5);
		app.context.moveTo(this.location.x - 5, this.location.y - 0);
		app.context.lineTo(this.location.x - 5, this.location.y - 10);
		app.context.stroke();
	};

	return crosshairs;
};


app.makeBox = function(name, location, width, height, color) {
	var box = {};

	box.name = name;
	box.location = location;
	box.randomize = function(x) {};
	box.factor = 0;
	box.width = width;
	box.height = height;
	box.redraw = false;
	box.draw = function() {
		app.context.strokeStyle = color ? 'red' : 'black';
		app.context.lineWidth = 1;
		app.drawBox(app.context, this, width, height);
	};

	return box;
};

app.makeTarget = function() {
	var size = Math.floor(Math.random() * 20 + 20),
		tgt = app.makeBox('target', 
		{x: 50 + Math.floor(Math.random() * (app.maxX - size - 50)),
		y: 15 + Math.floor(Math.random() * (app.maxY - size - 30))},
		size,
		size,
		'red');
	tgt.isHittable = true;
	tgt.isHit = function(x, y) {
		return x > tgt.location.x && x < tgt.location.x + size &&
			y > tgt.location.y && y < tgt.location.y + size;
	};
	return tgt;
};


app.makeFocusBar = function() {
	var focusBar = app.makeBox('focusBar',
		{x: 30, y: 450},
		400,
		10);

	focusBar.filled = .3;
	focusBar.draw = function() {
		app.context.clearRect(31, 451, 399, 9);	
		app.context.lineWidth = 1;
		app.drawBox(app.context, this, focusBar.width, focusBar.height);
		app.context.lineWidth = 8;

		if(focusBar.filled > .4 && focusBar.filled < .6) {
			app.context.strokeStyle = 'black';
		} else if( focusBar.filled > .2 && focusBar.filled < .8) {
			app.context.strokeStyle = 'gold';
		} else {
			app.context.strokeStyle = 'red';
		}

		app.fillBox(app.context, this, focusBar.width, focusBar.height, focusBar.filled);
		app.context.lineWidth = 1;
		app.context.strokeStyle = 'black';
	}

	return focusBar;
};

app.makeProgressBar = function() {
	var focusBar = app.makeBox('progressBar',
		{x: 30, y: 470},
		400,
		10);

	focusBar.filled = app.progress / app.progressMax;
	focusBar.draw = function() {
		app.context.strokeStyle = 'black';
		app.context.clearRect(31, 472, 399, 8);	
		app.context.lineWidth = 1;
		app.drawBox(app.context, this, focusBar.width, focusBar.height);
		app.context.lineWidth = 8;
		app.context.strokeStyle = 'red';
		app.fillBox(app.context, this, focusBar.width, focusBar.height, focusBar.filled);
		app.context.lineWidth = 1;
		app.context.strokeStyle = 'black';
	}

	return focusBar;
};

app.makeTimerBar = function() {
	var focusBar = app.makeBox('timerBar',
		{x: 30, y: 490},
		400,
		10);

	focusBar.filled = 1;
	focusBar.draw = function() {
		app.context.clearRect(31, 492, 399, 8);	
		app.context.lineWidth = 1;
		app.drawBox(app.context, this, focusBar.width, focusBar.height);
		app.context.lineWidth = 8;

		if(focusBar.filled > .5) {
			// leave it black;
		} else if( focusBar.filled > .25) {
			app.context.strokeStyle = 'gold';
		} else {
			app.context.strokeStyle = 'red';
		}

		app.fillBox(app.context, this, focusBar.width, focusBar.height, focusBar.filled);
		app.context.lineWidth = 1;
		app.context.strokeStyle = 'black';
	}

	return focusBar;
};

app.drawBox = function(ctx, obj, width, height) {
	ctx.beginPath();
	ctx.moveTo(obj.location.x, obj.location.y);
	ctx.lineTo(obj.location.x + width, obj.location.y);
	ctx.lineTo(obj.location.x + width, obj.location.y + height);
	ctx.lineTo(obj.location.x, obj.location.y + height);
	ctx.lineTo(obj.location.x, obj.location.y);
	ctx.stroke();
};

app.fillBox = function(ctx, obj, width, height, pct) {
	ctx.beginPath();
	ctx.moveTo(obj.location.x, obj.location.y + height / 2);
	ctx.lineTo(obj.location.x + (width * pct), obj.location.y + height / 2);
	ctx.stroke();
};

app.onKeyDown = function(e) {
	if(!app.GO && !app.OVER) {
		app.GO = true;
		app.lastTime = new Date();
		app.imageObj.src = 'img/0.jpg';
		app.gameLoop = new GameLooper();
		app.gameLoop.loop();
	}

	if(app.OVER) {
		app.imageObj.src = 'img/help.png';
		app.OVER = false;
		app.lastTime = new Date();
		app.progress = 0;
		//app.focusHelper.rewardFocus(0);
		app.GO = false;
	}

	var direction = e.keyCode === 37 ? -1 : e.keyCode === 39 ? 1 : 0;
	app.focusHelper.gainFocus(direction, app.progress);
};

app.onMouseClick = function(e) {
	if(app.targets.length === 0) {
		app.targets.push(app.makeTarget());
	} else {
		if(app.progress != app.progressMax) {
			if(app.targets[0].isHit(app.objects[0].location.x - 5, app.objects[0].location.y - 5)) {
				app.onHit();
			} else {
				app.onMiss();
			}
		}
	}

	app.drawObjects();
};

app.onHit = function() {
	if(app.GO) {
		app.targets = [];
		app.targets.push(app.makeTarget());
		// if(app.progress > .7) {
		// 	app.progress -= .1;
		// } else if( app.progress > .1 ) {
		// 	if(Math.random() * 2 > 1) {
		// 		app.progress -= .1;
		// 	}
		// }
		app.progress += .1;
		app.progress = app.progress <= 0 ? 0 : app.progress;
		app.progress = app.progress > app.progressMax ? app.progressMax : app.progress;
		app.objects[3].filled = app.progress / app.progressMax;
		app.focusHelper.rewardFocus(app.progress);	

		app.lastTime = new Date(app.lastTime - 1000 + 2000);
	}
};

app.onMiss = function() {
	if(app.GO) {
		//app.progress += .1;
		app.progress -= .1;
		app.lastTime = new Date(app.lastTime - 700);
		app.progress = app.progress <= 0 ? 0 : app.progress;
		app.progress = app.progress > app.progressMax ? app.progressMax : app.progress;
		app.objects[3].filled = app.progress / app.progressMax;
		app.focusHelper.obliterateFocus();
	}
};


app.onMousemove = function(e) {
	if(!app.OVER) {
		app.mouse = app.mouse || {};

		if(app.mouse.x != e.clientX && app.mouse.y != e.clientY) {
	    	app.mouse.x = e.clientX;
	    	app.mouse.y = e.clientY;

		    if(app.mouse.y < 410) {
				app.objects[0].randomize(app.objects[0]);
		    	app.drawObjects();
			}
		}
	}
};

app.drawObjects = function() {
	if(app.progress >= 0) {
		app.imageObj.preventRedraw = false;
		if(!app.imageObj.preventRedraw) {
			app.context.drawImage(app.imageObj, 0, 0);
		}
	}

	if(app.objects) {
		app.draw();
	}

	//var img = Math.floor((app.progress + .001) * 10 );
	//app.imageObj.src = 'img/' + img + '.jpg';

	if(app.OVER) {
		app.imageObj.src = app.progress == app.progressMax ? 'img/win.jpg' : 'img/lose.jpg';
	}
};

app.draw = function() {
	//app.context.clearRect(1, 1, app.objects[1].width, app.objects[1].height);

	for(var i = 0; i < app.objects.length; i++) {
		app.objects[i].draw();
	}
	for(var i = 0; i < app.targets.length; i++) {
		app.targets[i].draw();
	}
};

function GameLooper() {
}

GameLooper.prototype.loop = function() {
	if(app.GO) {
    if(app.mouse && app.mouse.y < app.maxY) {
			app.objects[0].randomize(app.objects[0]);
		}


		if(app.progress == app.progressMax) {
			app.GO = false;
			app.OVER = true;
		}
  	app.drawObjects();
		app.focusHelper.loseFocus(app.progress);
		app.focusHelper.runTimer();	    	
	}

	setTimeout( function() { requestAnimationFrame(app.gameLoop.loop);}, 30);
};


app.focusHelper = {focus: .5, focusPause: 10};

app.focusHelper.obliterateFocus = function() {
	var direction = Math.floor(Math.random() * 10) % 2 === 0 ? 1 : -1;
	this.focus = direction === 1 ? .75 : .25;
	this.focusPause = 5;
	this.setFocus();
};

app.focusHelper.loseFocus = function(multiplier) {
	var direction = this.focus > .5 ? 1 : -1;

	//app.context.fillText(this.focus, 5, 515);

	if(this.focusPause <= 0) {
		this.focus = this.focus > .98 ? this.focus : this.focus + direction * (.5 + multiplier) / 60;
		this.focus = this.focus < .02 ? this.focus + direction * (.5 + multiplier) / 60 : this.focus;
		this.setFocus();
	} else {
		this.focusPause = this.focusPause - 1;
	}


	//app.context.fillText(this.focus, 5, 525);
	//app.context.fillText(this.focusPause, 5, 545);

};


app.focusHelper.runTimer = function() {
	var now = new Date(),
		rawDiff = now - app.lastTime,
		diff = app.timeOutLength - Math.floor(rawDiff / (200 + (30 * app.progress))),
		drawRate = diff >= 0 ? diff : 0;

	if(drawRate > app.timeOutLength) {
		drawRate = app.timeOutLength;
		app.lastTime = new Date(now);
	}

	app.objects[4].filled = drawRate / app.timeOutLength;

	if(diff < 0) {
		// app.lastTime = new Date();
		// app.onMiss();
		// app.pauseTime = 0;
		// app.progress += .1;
		// if(app.progress > app.progressMax) {
		// 	app.progress = app.progressMax;
		// 	app.GO = false;
		// }
		app.GO = false;
		app.OVER = true;
		app.drawObjects();
	}
}

app.focusHelper.gainFocus = function(direction, multiplier) {
	if(direction === 0) {
		return;
	}
	var randomDirection = Math.floor(Math.random() * 10) % 2 === 0 ? 1 : -1,
		weirdFocus = (randomDirection * Math.random() * multiplier / 30);
	this.focus = this.focus + direction * .05 + weirdFocus;
	this.focusPause = Math.ceil(1 + 10 / (multiplier + 1));
	this.setFocus();
};

app.focusHelper.rewardFocus = function(multiplier) {
	this.focus = .5 + multiplier / 5;
	this.focusPause = 30;
	this.setFocus();
}

app.focusHelper.setFocus = function() {
	var me = this;

	me.focus = me.focus > 0 ? me.focus : 0;
	me.focus = me.focus < 1 ? me.focus : 1;

	var realFocus = Math.abs(.5 - me.focus);

	app.objects[2].filled = me.focus;
	app.objects[0].factor = realFocus == 0 ? 0 : realFocus * 90;
	app.drawObjects();
};


app.run();
