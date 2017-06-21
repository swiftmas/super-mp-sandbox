///VARS -------//////////////////////////////////////////////////////////
var json = {};
var map = document.getElementById("map");
var ctx = map.getContext("2d");
var socket = io.connect();
var xwin = window.innerWidth / 2;
var ywin = window.innerHeight / 2;
var userplayer = null;
var coredata = {};
var TeamSelected = null;
var touchdir = ["none", 0];
var touchtimer = 0;
var serverMessage = null;
var serverMessageTimer = 0;

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
	newplayerdata[playername] = {"pos":"40.50", "dir": "2", "state":"0", "health": 100, "alerttimer": 0, "team": team, "origin": "40.50", "closeChunks": [], "h": 3, "w": 3};
	console.log(newplayerdata);
	userplayer = playername;
	elem = document.getElementById("chooseteam");
	elem.parentNode.removeChild(elem);
        socket.emit('add_player', newplayerdata);
};

function charAlg(code){
	block = code.split(".");
	yvalue = ((block[0] -1) * 32) + (((block[1]/2) - 1) * 8);
	anims = [0, 24, 48, 72, 96, 120, 144]
	if (block[2] < 10){
		xvalue = anims[0] + (block[2] * 8);
	}
	if (block[2] < 100 && block[2] > 9 ){
		prts=block[2].split("")
		xvalue = anims[prts[0]] + (prts[1] * 8);
	}
	return [charsprites,xvalue,yvalue,8,8];
}

function draw(){
	if ( userplayer !== null ){

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// DRAW map ///////////////////////////////////
		ctx.drawImage(map1, 32 - campos[0] , 32 - campos[1])

		db = coredata;
		for (var code in db){
			blk = db[code].split(".");
			if (db[code].length > 0){
				image2draw = charAlg(db[code]);
				image2draw.push(blk[3] - campos[0] + 28, blk[4] - campos[1] + 26, 8, 8);
				ctx.drawImage.apply(ctx, image2draw);

			};
		};
		ctx.drawImage(map2, 32 - campos[0] , 32 - campos[1])

		if (serverMessage != null){
			style = "rgba(15,15,15," + serverMessageTimer/10 + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,64,64);
			style = "rgba(255,255,255," + serverMessageTimer/20 + ")"
			ctx.fillStyle=style;
			ctx.font='6px tiny';
			ctx.fillText(serverMessage, 5, 28);
			serverMessageTimer -= 1;
		}
		//ctx.fillStyle="rgba(55,55,55,.7)";
		//ctx.fillRect(0,33,64,31);
		//ctx.fillStyle="black";
		//ctx.font='6px tiny';
                //ctx.fillText("This much fits", 1, 38);
		//ctx.fillText("pos: " + campos, 1, 43);
		//ctx.fillText("abcdefghijklmno", 1, 48);
		//ctx.fillText("pqrstuvwxyz wow", 1, 53);
		//ctx.fillText("that was all the ABCs", 1, 58);
		//ctx.fillText("the last line", 1, 63);
	};
};




///// GET PLAYER TEAM AND STUFF ////
document.getElementById("selBlue").addEventListener("click", function(event) { add_player(1); });
document.getElementById("selGreen").addEventListener("click", function(event) { add_player(2); });
document.getElementById("selRed").addEventListener("click", function(event) { add_player(3); });
document.getElementById("selGold").addEventListener("click", function(event) { add_player(4); });




resize();
window.addEventListener("resize", function() {
	resize();
});

///// USER INPUT for player movement  ////////////////////////////


KeyboardController({
    87: function() { move(userplayer, '2'); },
		68: function() { move(userplayer, '4'); },
		83: function() { move(userplayer, '6'); },
		65: function() { move(userplayer, '8'); },
		37: function() { move(userplayer, '8'); },
		38: function() { move(userplayer, '2'); },
		39: function() { move(userplayer, '4'); },
		40: function() { move(userplayer, '6'); },
    192: function() { console.log(JSON.stringify(coredata)); }
}, 50);




function KeyboardController(keys, repeat) {
	var timers= {};

	// When key is pressed and we don't already think it's pressed, call the
	// key action callback and set a timer to generate another one after a delay
	//
	document.onkeydown= function(event) {
			var key= (event || window.event).keyCode;
			if (key == 78){ socket.emit('attack', userplayer); console.log('attack') };
			if (!(key in keys))
					return true;
			if (!(key in timers)) {
					timers[key]= null;
					keys[key]();
					if (repeat!==0)
							timers[key]= setInterval(keys[key], repeat);
			}
			return false;
	};


	document.onkeyup= function(event) {
			var key= (event || window.event).keyCode;
			if (key in timers) {
					if (timers[key]!==null)
							clearInterval(timers[key]);
					delete timers[key];
			}
	};


	window.onblur= function() {
			for (key in timers)
					if (timers[key]!==null)
							clearInterval(timers[key]);
			timers= {};
	};

};


//mOVEMENT /////////////////////////////////////////

function move(playername, dir) {
	socket.emit('movement', [playername, dir]);
};


////// GET data //////////////
socket.on('start', function(data) {
	TeamSelected = data;
	console.log("Player Initialized:", TeamSelected);
});

socket.on('serverMessage', function(data) {
	serverMessage = data;
	console.log("serverMessage:", serverMessage);
	if (serverMessageTimer <= 10) { serverMessageTimer += 2 };
	draw(coredata);
});

socket.on('camera', function(data) {
		campos = data.split(".");
});

socket.on('getdata', function(data){
	coredata = data;
	//updatehud();
	//moveplayers(data.players);
	if (TeamSelected !== null) {
		draw(coredata);
	};
});





////// UTILITY EVENTS //////////////////////////


///// Touch device controlls ///////////////////////
document.getElementById("attack").addEventListener("click", function(event) {
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
    	dirlength.push(["6", ddist])
    };
    if (y < tstary - 2){
    	var udist = tstary - y;
    	dirlength.push(["2", udist])
    };
    if (x > tstarx + 2){
    	var rdist = x - tstarx;
    	dirlength.push(["4", rdist])
    };
    if (x < tstarx - 2){
    	var ldist = tstarx - x;
    	dirlength.push(["8", ldist])
    };
    var top = ["none", 0];
    if (dirlength.length > 1){
    	for (var i = 0; i < dirlength.length; i++ ){
    		if (dirlength[i][1] > top[1]){
    			top = dirlength[i];
    			touchdir = top[0];
    		};
    	};
    	move(userplayer, top[0]);
    } else if (dirlength.length == 1) {
    	top = dirlength[0];
    	touchdir = top[0]
    	move(userplayer, top[0]);
    };

  	//var coor = "Coordinates: (" + top[0] + ")";
  	document.getElementById("coor").innerHTML = touchdir;
};
