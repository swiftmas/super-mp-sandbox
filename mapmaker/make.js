//VARS -------//////////////////////////////////////////////////////////
var json = {}
var map = document.getElementById("map");
var ctx = map.getContext("2d");
var coor;
mouse = "up";
oldloc = "none";


function rco(j) {
	return (j * 16) - 16;
};

function aco(axis, location) {
	if (axis == "y"){
	return ((location * 16) - 16 + document.getElementById("map").offsetTop);
	} else if (axis == "x"){
	return ((location * 16) - 16 + document.getElementById("map").offsetLeft);
	};
};

function cco(axis, location){
	if (axis == "y"){
	return Math.ceil((location - document.getElementById("map").offsetTop)/16);
	} else if (axis == "x"){
	return Math.ceil((location - document.getElementById("map").offsetLeft)/16);
	};
};

document.getElementById("map").addEventListener("mousemove", function(event) {
  var x = Math.ceil((event.pageX - document.getElementById("map").offsetLeft) / 16);
  var y = Math.ceil((event.pageY - document.getElementById("map").offsetTop) / 16);
  coor = x + "." + y;
  document.getElementById("coor").innerHTML = coor;;
});

document.getElementById("map").addEventListener("mousedown", function(event) {
  mouse = "down";
});

document.getElementById("map").addEventListener("mouseup", function(event) {
  mouse = "up";
});

setInterval(function(){
  if (mouse == "down" && coor != oldloc){
    oldloc = coor;
  	if (json[coor] == 1){
  		json[coor] = 0;
  		drawmap();
    } else if (json[coor] == 0) {
  		json[coor] = 1;
      drawmap();
  	};
  };
}, 5);


document.getElementById("input").addEventListener('keyup', function(event) { setdim() });

function setdim() {
  var theIn = document.getElementById('input').value;
	json = {}
  if (theIn.split('x').length > 1 && theIn.split('x')[1].length > 0) {
    for (var x = 1; x <= theIn.split('x')[0]; x++) {
			for (var y = 1; y <= theIn.split('x')[1]; y++) {
				if (x == 1){ var coll = 1;}
				else if (y == 1 ){ var coll = 1;}
				else if (x == theIn.split('x')[0]){ var coll = 1;}
				else if (y == theIn.split('x')[1]){ var coll = 1;}
				else {
					if ( x > 2 && y > 2 && x < theIn.split('x')[0] - 1 && y < theIn.split('x')[1] - 1) {

						var coll = 0;
					} else {
					var coll = 0
					};
				};
				coor = x + "." + y
				json[coor] = coll
			}
		};
		document.querySelector("#map").width = parseInt(theIn.split('x')[0]*16);
		document.querySelector("#map").height = parseInt(theIn.split('x')[1]*16);
		drawmap();
  } else {
		json = ''
	};
	//PRINT THE JSON OF MAP
  //document.getElementById("out").innerHTML = JSON.stringify(json, null, 2);

};

//----------------------------------------------------------------------------------------------------
function drawmap(){
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	collElements = [];
	for (var key in json) {
		if (json[key] == 1){
			collElements.push(key);
		};
	};
	for (var i = 0; i < collElements.length; i++) {
		ctx.fillStyle = "#e3e3e3";
		ctx.fillRect(rco(collElements[i].split('.')[0]), rco(collElements[i].split('.')[1]), 16, 16);
	};
};

document.getElementById("start").addEventListener("click", function(event) {
	makePlayer();
  document.getElementById("out").innerHTML = JSON.stringify(json, null, 2);
});

function makePlayer() {
	var myLayer = document.createElement('div');
	myLayer.id = 'player';
	myLayer.style.position = 'absolute';
	myLayer.style.left = aco('x', 2)+ 1 + "px";
	myLayer.style.top = aco('y', 2)+ 1 + "px";
	myLayer.style.width = '14px';
	myLayer.style.height = '14px';
	myLayer.style.backgroundColor = "red";
	document.body.appendChild(myLayer);
};

document.body.addEventListener("keydown", function(event) {
getinput(event);
});

function getinput(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
    		console.log("up triggered")
        move('up')
    }
    else if (e.keyCode == '192') {
    		document.getElementById("out").innerHTML = JSON.stringify(json, null, 2);
    }
    else if (e.keyCode == '40') {
        move('down')
    }
    else if (e.keyCode == '37') {
       move('left')
    }
    else if (e.keyCode == '39') {
       move('right')
    }

};

function move(dir) {
	if (dir == "up"){
		x = cco('x', document.getElementById("player").offsetLeft)
		y = cco('y', document.getElementById("player").offsetTop) - 1
		cellname = ''+x+'.'+y+''
		console.log(x,y,cellname,json[cellname])
		if (json[cellname] == 1) {
			console.log('no go')
		} else {
			document.getElementById("player").style.top = parseInt(document.getElementById("player").style.top) - 16 + "px"
		};
	};
	if (dir == "down"){
		x = cco('x', document.getElementById("player").offsetLeft)
		y = cco('y', document.getElementById("player").offsetTop) + 1
		cellname = ''+x+'.'+y+''
		console.log(x,y,cellname,json[cellname])
		if (json[cellname] == 1) {
			console.log('no go')
		} else {
			document.getElementById("player").style.top = parseInt(document.getElementById("player").style.top) + 16 + "px";
		};
	};
	if (dir == "left"){
		x = cco('x', document.getElementById("player").offsetLeft) - 1
		y = cco('y', document.getElementById("player").offsetTop)
		cellname = ''+x+'.'+y+''
		console.log(x,y,cellname,json[cellname])
		if (json[cellname] == 1) {
			console.log('no go')
		} else {
			document.getElementById("player").style.left = parseInt(document.getElementById("player").style.left) - 16 + "px";
		};
	};
	if (dir == "right"){
		x = cco('x', document.getElementById("player").offsetLeft) + 1
		y = cco('y', document.getElementById("player").offsetTop)
		cellname = ''+x+'.'+y+''
		console.log(x,y,cellname,json[cellname])
		if (json[cellname] == 1) {
			console.log('no go')
		} else {
			document.getElementById("player").style.left = parseInt(document.getElementById("player").style.left) + 16 + "px";
		};
	};

};
