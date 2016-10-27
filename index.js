'use strict'
var scl = 20;
var snakeDead = false;
var pauseGame = false;
var masterFrameRate = 12;
var invincible = false;
var highScore = (getCookie("highscore") === "") ? 0 : getCookie("highscore");
var snake, food;

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function windowResized(){
	resizeCanvas(floor((windowWidth * 0.8)/scl)*scl, floor((windowHeight * 0.8)/scl)*scl)
	$("canvas").css("left", ((windowWidth - width)/2) + "px");
	$("canvas").css("top", ((windowHeight - height)/2) + "px");
}

function dead(){
	if(snake.tailLength - 1 > highScore){
		highScore = snake.tailLength - 1;
	}
	noLoop();
	background(255)
	fill(0);
	noStroke();
	textFont("monospace");
	textSize(40);
	textAlign(CENTER, CENTER);
	text("game over", width/2, height/2 - 50);
	textSize(25);
	text("restart", width/2, height/2 + 25);
	noFill();
	stroke(0);
	rect(width/2 - 75, height/2, 150, 50, 5);
	setCookie("highscore", highScore);
}

function Snake(){
	this.pos = createVector(0, 0);
	this.turningPoint = createVector(0, 0);
	this.speed = [1, 0];
	this.tail = [];
	this.tailStart = -1;
	this.tailLength = 1;
	
	this.turn = function(x, y){
		if(x !== this.speed[0] * -1 && y !== this.speed[1] * -1){
			if(dist(this.pos.x, this.pos.y, this.turningPoint.x, this.turningPoint.y) > 0){
				this.turningPoint = createVector(this.pos.x, this.pos.y);
				this.speed = [x, y];
			}
		}
	}
	
	this.eat = function(){
		masterFrameRate += 0.5;
		this.tailLength += 5;
		if(this.tailStart > 0){
			this.tailStart -= 5;
		}
	}
	
	this.update = function(){
		this.tailStart += 1;
		this.pos.x += this.speed[0];
		this.pos.y += this.speed[1];
		if(this.pos.x < 0 || this.pos.x >= floor(width/scl) || this.pos.y < 0 || this.pos.y >= floor(height/scl)){
			snakeDead = true;
		}
		this.tail.push(createVector(this.pos.x, this.pos.y));
		for(var i = this.tailStart; i < this.tailStart + this.tailLength - 1; i++){
			if(this.tail[i].x === this.pos.x && this.tail[i].y === this.pos.y){
				snakeDead = true;
			}
		}
	}
	
	this.show = function(){
		colorMode(HSB)
		stroke(255);
		for(var i = this.tailStart; i < this.tailStart + this.tailLength; i++){
			fill(205, (i === this.tailStart && this.tailLength === 1) ? 100 : map(i, this.tailStart, this.tailStart + this.tailLength, 60, 100), 100)
			rect(this.tail[i].x * scl, this.tail[i].y * scl, scl, scl, scl/5);
		}
		colorMode(RGB)
	}
}

function Food(){
	this.pos = createVector(floor(random(floor(width/scl))), floor(random(floor(height/scl))));
	
	this.update = function(){
		this.pos.x = floor(random(floor(width/scl)));
		this.pos.y = floor(random(floor(height/scl)));
		
		for(var i = snake.tailStart; i < snake.tailStart + snake.tailLength - 1; i++){
			if(this.pos.x === snake.tail[i].x && this.pos.y === snake.tail[i].y){
				this.update();
			}
		}
	}
	
	this.show = function(){
		fill(255, 60, 60);
		stroke(255);
		rect(this.pos.x * scl, this.pos.y * scl, scl, scl, scl/5);
	}
}

function setup(){
	frameRate(masterFrameRate);
	createCanvas(floor((windowWidth * 0.8)/scl)*scl, floor((windowHeight * 0.8)/scl)*scl)
	$("canvas").css("left", ((windowWidth - width)/2) + "px");
	$("canvas").css("top", ((windowHeight - height)/2) + "px");
	snake = new Snake();
	food = new Food();
}

function draw(){
	frameRate(masterFrameRate);
	background(255);
	snake.update();
	if(snake.pos.x === food.pos.x && snake.pos.y === food.pos.y){
		food.update();
		snake.eat();
	}
	snake.show();
	food.show();
	if(snakeDead && !invincible){
		dead();
	}
	fill(0);
	noStroke();
	textFont("monospace");
	textSize(20);
	textAlign(CENTER, CENTER);
	text(snake.tailLength - 1, width/2, 30);
// 	text(highScore, width/2, 60);
	console.log(highScore);
}

function keyPressed(){
	if(keyCode === UP_ARROW){
		snake.turn(0, -1);
	}else if(keyCode === DOWN_ARROW){
		snake.turn(0, 1);
	}else if(keyCode === LEFT_ARROW){
		snake.turn(-1, 0);
	}else if(keyCode === RIGHT_ARROW){
		snake.turn(1, 0);
	}else if(keyCode === 32){
		if(pauseGame){
			pauseGame = false;
			loop();
		}else{
			pauseGame = true;
			noLoop();
		}
	}
	cheatCodePressed(keyCode);
	return false;
}
function mousePressed(){
	if(snakeDead){
		if(mouseX > width/2 - 75 && mouseX < width/2 + 75 && mouseY > height/2 && mouseY < height/2 + 50){
			snakeDead = false;
			pauseGame = false;
			invincible = false;
			masterFrameRate = 12;
			frameRate(masterFrameRate);
			snake = new Snake();
			food = new Food();
			loop();
		}
	}
}

function arrayEquals(a, b){
	if(a === b) return true;
	if(a === null || b === null) return false;
	if(a.length !== b.length) return false;
	
	for(var i = 0; i < a.length; i++){
		if(a[i] !== b[i]) return false;
	}
	return true;
}

var cheatCodes = [
	{
		action: function(){
			masterFrameRate = 12;
		}, 
		keys: [55, 56]
	}, {
		action: function(){
			var tailToAdd = (snake.tailStart > 10) ? 10 : snake.tailStart;
			for(var i = 0; i < tailToAdd; i++){
				snake.eat();
			}
			masterFrameRate = 12;
		}, 
		keys: [75, 73, 82, 80, 65, 76]
	}, {
		action: function(){
			invincible = true;
		},
		keys: [68, 69, 65]
	}, {
		action: function(){
			invincible = false;
			snakeDead = true;
		},
		keys: [49, 50, 51, 52]
	}, {
		action: function(){
			masterFrameRate = 24;
		},
		keys: [54, 57]
	}
];
var currentKeys = [];
var currentKeyPos = 0;
var currentCheatCode;

function cheatCodePressed(keycode){
	if(currentKeys.length === 0){
		for(var i = 0; i < cheatCodes.length; i++){
			if(cheatCodes[i].keys.indexOf(keycode) === 0){
				currentKeys.push(keycode);
				currentCheatCode = cheatCodes[i];
				currentKeyPos = 1;
			}
		}
	}else{
		if(currentCheatCode.keys.indexOf(keycode) === currentKeyPos){
			currentKeys.push(keycode);
			if(arrayEquals(currentKeys, currentCheatCode.keys)){
				currentCheatCode.action();
				currentKeys = [];
				currentKeyPos = 0;
			}else{
				currentKeyPos += 1;
			}
		}else{
			currentKeys = [];
			currentKeyPos = 0;
		}
	}
}
