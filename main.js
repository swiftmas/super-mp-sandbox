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
var serverMessage = null;
var serverMessageTimer = 0;
var serverTime = 6000
var dialog = null;
var dialogPointers = [null, null, null, null, null];
var selector = 0;
var currentDirKey = null;
var currentDir = null;
var controlState = "character";




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
	var playername = "p" + socket.io.engine.id;
	var newplayerdata = {};
	newplayerdata[playername] = {"pos":"40.50", "dir": "2", "state":"0", "health": 100, "alerttimer": 0, "team": team, "origin": "40.50", "closeChunks": [], "h": 3, "w": 3};
	console.log(newplayerdata);
	userplayer = playername;
	var elem = document.getElementById("chooseteam");
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
	serverTime -= 1;
	if ( userplayer !== null ){
		//CLEAN canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.font='6px tiny';
		// DRAW map ///////////////////////////////////
		ctx.drawImage(map1, 32 - campos[0] , 32 - campos[1])
		//Get all sprite locations
		db = coredata;
		for (var code in db){
			blk = db[code].split(".");
			//Draw each sprite
			if (db[code].length > 0){
				image2draw = charAlg(db[code]);
				image2draw.push(blk[3] - campos[0] + 28, blk[4] - campos[1] + 26, 8, 8);
				ctx.drawImage.apply(ctx, image2draw);

			};
		};
		// Draw the top layer of the map
		ctx.drawImage(map2, 32 - campos[0] , 32 - campos[1])

		//////////////////// TIME OF DAY SHADERS //////////////////////
		if (serverTime < 3400 && serverTime > 3000){
			ctx.globalCompositeOperation = "color-burn";
			percent = (40 - ((serverTime - 3000)/10))/100
			style = "rgba(0,21,211," + percent + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,64,64);
			ctx.globalCompositeOperation = "source-over";
		}

		if (serverTime <= 3000 && serverTime > 400){
			ctx.globalCompositeOperation = "color-burn";
			percent = 0.4
			style = "rgba(0,21,211," + percent + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,64,64);
			ctx.globalCompositeOperation = "source-over";
		}

		if (serverTime <= 400){
			ctx.globalCompositeOperation = "color-burn";
			percent = ((serverTime)/10)/100
			style = "rgba(0,21,211," + percent + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,64,64);
			ctx.globalCompositeOperation = "source-over";
		}

		//////////// UI stuff ////////////////////
		ctx.fillStyle= "grey";
		ctx.fillRect(1,1, 10,3)
		ctx.fillStyle= "#00ff38";
		ctx.fillRect(1,1, Math.round(playerHealth/10),3)
		ctx.fillText(Math.floor(serverTime/100), 14, 5);
		ctx.fillText(selector, 24, 5);

		if (dialog != null){
			ctx.fillStyle= "rgba(15,15,15,0.85)"
			ctx.fillRect(0,36,64,28);
			ctx.fillStyle= "grey";
			ctx.fillText(dialog[0], 3, 42);
			ctx.fillText(dialog[1], 3, 47);
			ctx.fillText(dialog[2], 3, 52);
			ctx.fillText(dialog[3], 3, 57);
			ctx.fillText(dialog[4], 3, 62);
			ctx.fillText(">", -1, 42 + (5*selector));
		}

		// If server message, display now
		if (serverMessage != null){
			style = "rgba(15,15,15," + serverMessageTimer/10 + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,64,64);
			style = "rgba(255,255,255," + serverMessageTimer/20 + ")"
			ctx.fillStyle=style;
			ctx.fillText(serverMessage, 5, 28);
			serverMessageTimer -= 1;
			if (serverMessageTimer <= 0) {
				serverMessageTimer = 0;
				serverMessage = null;
			}
		}
	};
};

//mOVEMENT /////////////////////////////////////////


function control(action){
	if (action == currentDir){return};
	switch (action){
		case "2":
			if(controlState == "character"){	socket.emit('movement', [userplayer, "2"]); } else { if (selector > 0){selector -= 1}  }
			break;
		case "4":
			if(controlState == "character"){	socket.emit('movement', [userplayer, "4"]); } else { if (selector > 0){selector -= 1}  }
			break;
		case "6":
			if(controlState == "character"){	socket.emit('movement', [userplayer, "6"]); } else { if (selector < 4){selector += 1}  }
			break;
		case "8":
			if(controlState == "character"){	socket.emit('movement', [userplayer, "8"]); } else { if (selector < 4){selector += 1}  }
			break;
		case "null":
			if(controlState == "character"){	socket.emit('movement', [userplayer, null]); } else { selector = selector  }
			break;
		case "interact":
			if(controlState == "character"){
				socket.emit('action', [userplayer, "interact", null]); console.log('interact');
			} else {
				if (dialogPointers == "exit"){
					selector = 0;
					dialogPointers = [null, null, null, null, null];
					dialog = null;
					controlState = "character";
					return;
				}
				socket.emit('action', [userplayer, "interact", dialogPointers[selector]]); console.log('speak', dialogPointers[selector]);
			}
			break;
		case "attack":
			if (controlState == "character"){socket.emit('action', [userplayer, "attack"]);}
			selector = 0;
			dialogPointers = [null, null, null, null, null];
			dialog = null;
			controlState = "character";
			break;

	  if (["2", "4", "6", "8"].indexOf(action) !== 1) {currentDir = action;}
	}
}

///// GET PLAYER TEAM AND STUFF ////
document.getElementById("selBlue").addEventListener("click", function(event) { add_player(1); });
document.getElementById("selGreen").addEventListener("click", function(event) { add_player(2); });
document.getElementById("selRed").addEventListener("click", function(event) { add_player(3); });
document.getElementById("selGold").addEventListener("click", function(event) { add_player(4); });


window.addEventListener("resize", function() {
	resize();
});
resize();
///// USER INPUT for player movement  ////////////////////////////   192

document.onkeydown= function(event) {
		var key= (event || window.event).keyCode;
		if (key == 78){ control("attack"); console.log('attack'); return };
		if (key == 192){ console.log(serverTime, coredata, " currentDirKey ", currentDirKey); return };
		if (key == 75){ control("interact"); console.log('interact'); return };
		if (key == 78){ socket.emit('action', [userplayer, "attack"]); console.log('attack'); return };
		//arrows
		if (key == 87){ control("2") };
		if (key == 68){ control("4") };
		if (key == 83){ control("6") };
		if (key == 65){ control("8") };
		// WASd
		if (key == 38){ control("2") };
		if (key == 39){ control("4") };
		if (key == 40){ control("6") };
		if (key == 37){ control("8") };
		currentDirKey = key;
};


document.onkeyup= function(event) {
		var key= (event || window.event).keyCode;
		if (key == currentDirKey){ currentDirKey = null; control("null")};
};






////// GET data //////////////
socket.on('start', function(data) {
	TeamSelected = true;
	serverTime = data;
	console.log("Player Initialized:", data);
});

socket.on('dialog', function(data) {
	dialog = data[0];
	dialogPointers= data[1];
	controlState = "dialog";
	console.log("Dialog gottedidid:", data);
});

socket.on('serverMessage', function(data) {
	serverMessage = data.message;
	serverTime = data.time;
	console.log("serverMessage:", serverMessage);
	if (serverMessageTimer <= 10) { serverMessageTimer += 2 };
	draw(coredata);
});

socket.on('camera', function(data) {
		campos = data[0].split(".");
		playerHealth = data[1]
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

var tc = new Hammer(map);
tc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

tc.on("press", function(ev){socket.emit('action', [userplayer, "attack"]); console.log('attack'); return });

tc.on("panup", function(ev){
	control("2")
});
tc.on("pandown", function(ev){
        control("6")
});
tc.on("panright", function(ev){
        control("4")
});
tc.on("panleft", function(ev){
        control("8")
});

tc.on("panend", function(ev){
	control("null")
});
