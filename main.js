///VARS -------//////////////////////////////////////////////////////////
var json = {};
var map = document.getElementById("map");
var ctx = map.getContext("2d");
var socket = io.connect();
var xwin = window.innerWidth / 2;
var ywin = window.innerHeight / 2;
var userplayer = null;
var coredata = {};
var mapdata = {};
var touchdir = ["none", 0];
var touchtimer = 0;


//Utility Functoins //////////////////////////////////////////

//RO real origin (used all over in draw)






///// METHODS ///////////////////////////

function resize(){
	var sels = ["selBlue", "selRed", "selGreen", "selGold"]
	if (window.innerWidth < window.innerHeight){
		map.style.width = window.innerWidth + "px";
		for(i=0; i < sels.length; i++) {
			document.getElementById(sels[i]).style.width = window.innerWidth/4 + "px";
			document.getElementById(sels[i]).style.height = window.innerWidth/4 + "px";
		};
	} else {
		map.style.width = window.innerHeight+"px";
		for(i=0; i < sels.length; i++) {
			document.getElementById(sels[i]).style.width = window.innerHeight/4 + "px";
			document.getElementById(sels[i]).style.height = window.innerHeight/4 + "px";
		};
	}
}


function add_player(team){
	playername = "p" + socket.io.engine.id;
	newplayerdata = {};
	newplayerdata[playername] = {"pos":"2.2", "dir": "up", "state":"normal", "health": 100, "alerttimer": 0, "team": team, "origin": "2.2"};
	console.log(newplayerdata);
	userplayer = playername;
	elem = document.getElementById("chooseteam");
	elem.parentNode.removeChild(elem);
        socket.emit('add_player', newplayerdata);

};

function draw(){
	if ( userplayer !== null ){


    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		//MAP CREATE////////////////////
		collElements = [];
		collDestElem = [];
		for (var key in mapdata) {
			if (mapdata[key] == 1){
				collElements.push(key);
			} else if (mapdata[key] == 2) {
				collDestElem.push(key);
			};
		};
		for (var i = 0; i < collElements.length; i++) {
			ctx.fillStyle = "#e3e3e3";
			ctx.fillRect(collElements[i].split('.')[0] -1, collElements[i].split('.')[1] -1, 1, 1);
		};
		for (var i = 0; i < collDestElem.length; i++) {
			ctx.fillStyle = "#c9c9c9";
			ctx.fillRect(collDestElem[i].split('.')[0] -1, collDestElem[i].split('.')[1] -1, 1, 1);
		};
		// DRAW Blocks ///////////////////////////////////
		db = coredata;
		for (var code in db){
			blk = db[code].split(".");
			if (blk[0] == "01"){
				ctx.fillStyle = "blue";
				ctx.fillRect(blk[1] -1, blk[2] -1, 1, 1);
			};
			if (blk[0] == "02"){
				ctx.fillStyle = "green";
				ctx.fillRect(blk[1] -1, blk[2] -1, 1, 1);
			};
			if (blk[0] == "03"){
				ctx.fillStyle = "red";
				ctx.fillRect(blk[1] -1, blk[2] -1, 1, 1);
			};
			if (blk[0] == "04"){
				ctx.fillStyle = "gold";
				ctx.fillRect(blk[1] -1, blk[2] -1, 1, 1);
			};
			if (blk[0] == "11"){
				ctx.fillStyle = "black";
				ctx.fillRect(blk[1] -1, blk[2] -1, 1, 1);
			};
			if (blk[0] == "12"){
				ctx.fillStyle = "yellow";
				ctx.fillRect(blk[1] -1, blk[2] -1, 1, 1);
			};
			if (blk[0] == "13"){
				ctx.fillStyle = "orange";
				ctx.fillRect(blk[1] -1, blk[2] -1, 1, 1);
			};
		};
	};
};



//mOVEMENT /////////////////////////////////////////

function getinput(e) {

    e = e || window.event;

    if (e.keyCode == '87') {
        move('up', userplayer)
    }
    else if (e.keyCode == '78') {
			socket.emit('attack', userplayer);
    }
    else if (e.keyCode == '192') {
    	console.log(JSON.stringify(coredata));
    }
    else if (e.keyCode == '83') {
        move('down', userplayer)
    }
    else if (e.keyCode == '65') {
       move('left', userplayer)
    }
    else if (e.keyCode == '68') {
       move('right', userplayer)
    }

};

function move(dir, playername) {
	socket.emit('movement', [playername, dir]);
};



///// GET PLAYER TEAM AND STUFF ////
document.getElementById("selBlue").addEventListener("click", function(event) { add_player("01"); });
document.getElementById("selGreen").addEventListener("click", function(event) { add_player("02"); });
document.getElementById("selRed").addEventListener("click", function(event) { add_player("03"); });
document.getElementById("selGold").addEventListener("click", function(event) { add_player("04"); });


resize();
window.addEventListener("resize", function() {
	resize();
});

///// USER INPUT for player movement  ////////////////////////////
document.body.addEventListener("keydown", function(event) {
	if (userplayer !== null){
		getinput(event);
	};
});

////// GET data //////////////
socket.on('getmap', function(data) {
	mapdata = data;
	console.log("map was loaded:", mapdata);
});

socket.on('getdata', function(data){
	coredata = data;
	//updatehud();
	//moveplayers(data.players);
	if (mapdata !== null) {
		draw(coredata);
	};
});





////// UTILITY EVENTS //////////////////////////


///// Touch device controlls ///////////////////////
document.getElementById("attack").addEventListener("touchstart", function(event) {
	socket.emit('attack', userplayer);
});

document.getElementById("map").addEventListener("touchstart", function(event) {
	event.preventDefault();
	var pattack = [userplayer];
	//socket.emit('attacks', pattack);
	tstarx = Math.ceil((event.pageX));
 	tstary = Math.ceil((event.pageY));
	touchdown = true;
	initialtouch = true;
	document.getElementById("logger").innerHTML = initialtouch
}, false);


document.addEventListener("touchmove", function(event) {
	event.preventDefault();
	tmovx = Math.ceil((event.pageX));
 	tmovy = Math.ceil((event.pageY));
 	if (initialtouch == true){
 		//getswipedir(tmovx, tmovy);
 		initialtouch = false;
 		document.getElementById("logger").innerHTML = initialtouch
 	};
 	if (Date.now() > touchtimer + 200){
		getswipedir(tmovx, tmovy);
		touchtimer = Date.now();
	};
}, false);


function getswipedir(x, y) {
	var dirlength = [];
    if (y > tstary + 2){
    	var ddist = y - tstary;
    	dirlength.push(["down", ddist])
    };
    if (y < tstary - 2){
    	var udist = tstary - y;
    	dirlength.push(["up", udist])
    };
    if (x > tstarx + 2){
    	var rdist = x - tstarx;
    	dirlength.push(["right", rdist])
    };
    if (x < tstarx - 2){
    	var ldist = tstarx - x;
    	dirlength.push(["left", ldist])
    };
    var top = ["none", 0];
    if (dirlength.length > 1){
    	for (var i = 0; i < dirlength.length; i++ ){
    		if (dirlength[i][1] > top[1]){
    			top = dirlength[i];
    			touchdir = top[0];
    		};
    	};
    	move(top[0], userplayer);
    } else if (dirlength.length == 1) {
    	top = dirlength[0];
    	touchdir = top[0]
    	move(top[0], userplayer);
    };

  	//var coor = "Coordinates: (" + top[0] + ")";
  	document.getElementById("coor").innerHTML = touchdir;
};
