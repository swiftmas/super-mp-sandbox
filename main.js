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
var serverMessageWindow = 0;
var serverTime = 6000
var dialog = null;
var dialogPointers = [null, null, null, null, null];
var selector = [0,0];
var currentDirKey = null;
var currentDir = null;
var controlState = "character";
var dialogType = null;
var lootSpot1 = null;
var loot1 = null;
var loot2 = null;
var playerHealth;
var damagechange = false;


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
	newplayerdata[playername] = {"pos":"818.782","dir":"2","state":"0","effects":{},"health":140,"maxHealth":140,"gold":0,"mana":100,"maxMana":100,"cor":0,"maxCor":200,"alerttimer":0,"team":team,"slot0":"sword1","slot1":"-","slot2":"-","slot3":"-","inventory":[{"name":"sword1","quantity":1},{"name":"Fire Sword","quantity":1},{"name":"mana","quantity":5},{"name":"health","quantity":5},{"name":"gold","quantity":5},{"name":"-","quantity":1}],"abilities":[{"name":"Orb Of Healing","quantity":1},{"name":"PoinsonShot","quantity":1}],"origin":"818.782","closeChunks":[],"h":4,"w":4};
	console.log(newplayerdata);
	userplayer = playername;
	var elem = document.getElementById("chooseteam");
	elem.parentNode.removeChild(elem);
        socket.emit('add_player', newplayerdata);
};

function charAlg(code){
	block = code.split(".");
	yvalue = ((block[0] -1) * 64) + (((block[1]/2) - 1) * 16);
	anims = [0, 48, 96, 144, 192, 240, 288, 336, 384, 432, 480]
	if (block[2] < 10){
		xvalue = anims[0] + (block[2] * 16);
	}
	if (block[2] < 100 && block[2] > 9 ){
		prts=block[2].split("")
		xvalue = anims[prts[0]] + (prts[1] * 16);
	}
	if (block[2] < 1000 && block[2] > 99 ){
		prts=block[2].split("")
		xvalue = anims[prts[0]+prts[1]] + (prts[2] * 16);
	}
	return [charsprites,xvalue,yvalue,16,16];
}

function draw(){
	serverTime -= 1;
	if ( userplayer !== null ){
		//CLEAN canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.font='8px tiny';
		ctx.textAlign="left";
		// DRAW map ///////////////////////////////////
		ctx.drawImage(map1, (32 - campos[0])*2 , (34 - campos[1])*2)
		//Get all sprite locations
		db = coredata;
		db.reverse();
		db.sort(function(a,b){return a.split(".")[4] - b.split(".")[4]})
		db.sort(function(a,b){return a.split(".")[5] - b.split(".")[5]})
		for (var code in db){
			blk = db[code].split(".");
			//Draw each sprite
			if (db[code].length > 0){
				image2draw = charAlg(db[code]);
				image2draw.push((blk[3] - campos[0] + 28)*2, (blk[4] - campos[1] + 28)*2, 16, 16);
				ctx.drawImage.apply(ctx, image2draw);
				if ((blk[3] - campos[0] + 28)*2 == 56 && (blk[4] - campos[1] + 28)*2 == 56 && damagechange == true){
					ctx.globalCompositeOperation = "exclusion";
					ctx.drawImage.apply(ctx, image2draw);
					ctx.globalCompositeOperation = "source-over";
				}
			};
		};
		// Draw the top layer of the map
		ctx.drawImage(map2, (32 - campos[0])*2 , (32 - campos[1])*2)

		//////////////////// TIME OF DAY SHADERS //////////////////////
		if (serverTime < 3400 && serverTime > 3000){
			ctx.globalCompositeOperation = "color-burn";
			percent = (40 - ((serverTime - 3000)/10))/100
			style = "rgba(0,21,211," + percent + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,128,128);
			ctx.globalCompositeOperation = "source-over";
		}

		if (serverTime <= 3000 && serverTime > 400){
			ctx.globalCompositeOperation = "color-burn";
			percent = 0.4
			style = "rgba(0,21,211," + percent + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,128,128);
			ctx.globalCompositeOperation = "source-over";
		}

		if (serverTime <= 400){
			ctx.globalCompositeOperation = "color-burn";
			percent = ((serverTime)/10)/100
			style = "rgba(0,21,211," + percent + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,128,128);
			ctx.globalCompositeOperation = "source-over";
		}

		//////////// UI stuff ////////////////////
		//Health
		ctx.drawImage.apply(ctx, [charsprites,400,560,80,16,-10,-5,80,16])
		ctx.fillStyle= "rgba(255,0,56,0.35)";
		ctx.fillRect(2,0, Math.round((playerHealth/playerMaxHealth)*30),6)
		ctx.fillStyle= "rgba(0,56,255,0.35)";
		ctx.fillRect(35,0, Math.round((playerMana/playerMaxMana)*23),6)
		var cor = Math.round((playerCor/playerMaxCor)*80) + 1
		ctx.drawImage.apply(ctx, [charsprites,560-cor,560,cor,16,70-cor,-5,cor,16])
		//ctx.fillText(selector[0]+"|"+selector[1]+"|"+(selector[1]+ (selector[0]*(selectorXlimit+1))), 70, 16);

		//Items
		ctx.fillStyle= "#282c34";
		image2draw = charAlg(weap0);
		image2draw.push(76, 0, 8, 8);
		ctx.drawImage.apply(ctx, image2draw);
		ctx.fillText("H", 70, 8);
		image2draw = charAlg(weap1);
		image2draw.push(91, 0, 8, 8);
		ctx.drawImage.apply(ctx, image2draw);
		ctx.fillText("J", 85, 8);
		image2draw = charAlg(weap2);
		image2draw.push(106, 0, 8, 8);
		ctx.drawImage.apply(ctx, image2draw);
		ctx.fillText("K", 100, 8);
		image2draw = charAlg(weap3);
		image2draw.push(119, 0, 8, 8);
		ctx.drawImage.apply(ctx, image2draw);
		ctx.fillText("L", 115, 8);
		//Dialog
		if (dialog != null && dialogType == "speech"){
			ctx.fillStyle= "rgba(15,15,15,0.85)"
			ctx.drawImage.apply(ctx, [charsprites,400,576,128,64,0,64,128,64])
			//ctx.fillRect(0,74,128,64);
			ctx.fillStyle= "#c1c1c1";
			ctx.fillText(dialog[0], 7, 82);
			ctx.fillText(dialog[1], 7, 92);
			ctx.fillText(dialog[2], 7, 102);
			ctx.fillText(dialog[3], 7, 112);
			ctx.fillText(dialog[4], 7, 122);
			ctx.fillText(">", 2, 81 + (10*selector[0]));
		}
		//loot
		if (dialog != null && dialogType == "loot"){
			ctx.drawImage.apply(ctx, [charsprites,656,560,128,80,0,48,128,80])
			ctx.fillStyle= "#c1c1c1";
			ctx.font='6px tinyest';
			for (var i = 0; i < dialog.length; i++){
				var image2draw = charAlg(dialog[i][2]);
				if (i < 10){
					image2draw.push(5+(12*i), 98, 8, 8);
					ctx.drawImage.apply(ctx, image2draw);
					if (dialog[i][1] > 1 ){if (dialog[i][1] < 10){ctx.fillText(dialog[i][1], 12+(12*i), 107);} else {ctx.fillText("+", 12+(12*i), 107);} }
				} else{
					image2draw.push(5+(12*(i-10)), 114, 8, 8);
					ctx.drawImage.apply(ctx, image2draw);
					if (dialog[i][1] > 1 ){if (dialog[i][1] < 10){ctx.fillText(dialog[i][1], 12+(12*(i-10)), 123);} else {ctx.fillText("+", 12+(12*(i-10)), 123);} }

				}
			}
			ctx.font='8px tiny';
			if (lootSpot1 !== null){
				ctx.beginPath();
				ctx.strokeStyle= "red"
				ctx.rect(5 + (12*lootSpot1[1]), 97 + (16*lootSpot1[0]), 10, 10);
				ctx.stroke();
			}
			ctx.fillStyle= "#c1c1c1";
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][0], 7, 77);
			ctx.fillStyle= "#7B7B7B";
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][6], 51, 63);
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][4], 75, 63);
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][5], 103, 62);
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][3], 7, 87);
			ctx.beginPath();
			ctx.strokeStyle= "orange"
			ctx.rect(5 + (12*selector[1]), 97 + (16*selector[0]), 10, 10);
			ctx.stroke();
			//ctx.fillText(">", 2 + (12*selector[1]), 102 + (16*selector[0]));
		}
		//Character UI inventory
		if (dialog != null && dialogType == "character"){
			ctx.drawImage.apply(ctx, [charsprites,784,528,128,112,0,16,128,112])
			ctx.fillStyle= "#c1c1c1";
			ctx.font='6px tinyest';
			for (var i = 0; i < dialog.length; i++){
				var image2draw = charAlg(dialog[i][2]);
				if (i < 10){
					image2draw.push(5+(12*i), 98, 8, 8);
					ctx.drawImage.apply(ctx, image2draw);
					if (dialog[i][1] > 1 ){if (dialog[i][1] < 10){ctx.fillText(dialog[i][1], 12+(12*i), 107);} else {ctx.fillText("+", 12+(12*i), 107);} }
				} else{
					image2draw.push(5+(12*(i-10)), 114, 8, 8);
					ctx.drawImage.apply(ctx, image2draw);
					if (dialog[i][1] > 1 ){if (dialog[i][1] < 10){ctx.fillText(dialog[i][1], 12+(12*(i-10)), 123);} else {ctx.fillText("+", 12+(12*(i-10)), 123);} }

				}
			}
			ctx.font='8px tiny';
			ctx.globalCompositeOperation = "soft-light";
			style = "rgba(220,220,170,0.100)"
			ctx.fillStyle=style;
			ctx.fillRect(6,98,8,8);
			ctx.fillRect(18,98,8,8);
			ctx.fillRect(30,98,8,8);
			ctx.fillRect(42,98,8,8);
			ctx.globalCompositeOperation = "source-over";

			if (lootSpot1 !== null){
				ctx.beginPath();
				ctx.strokeStyle= "red"
				ctx.rect(5 + (12*lootSpot1[1]), 97 + (16*lootSpot1[0]), 10, 10);
				ctx.stroke();
			}
			ctx.fillStyle= "#7B7B7B";
			ctx.font='6px tinyest';
			ctx.fillText("Health: "+playerHealth+"/"+playerMaxHealth, 7, 28);
			ctx.fillText("Mana: "+playerMana+"/"+playerMaxMana, 69, 28);
			ctx.fillText("Corruption: "+playerCor+"/"+playerMaxCor, 7, 34);
			ctx.font='8px tiny';
			ctx.fillStyle= "#c1c1c1";
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][0], 7, 75);
			ctx.fillStyle= "#7B7B7B";
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][6], 51, 63);
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][4], 75, 63);
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][5], 103, 62);
			ctx.fillText(dialog[selector[1]+ (selector[0]*(selectorXlimit+1))][3], 7, 85);
			ctx.beginPath();
			ctx.strokeStyle= "orange"
			ctx.rect(5 + (12*selector[1]), 97 + (16*selector[0]), 10, 10);
			ctx.stroke();
			//ctx.fillText(">", 2 + (12*selector[1]), 102 + (16*selector[0]));
		}


		// If server message, display now
		if (serverMessage != null){
			if (serverMessageWindow > 20){
				serverMessageTimer += 1
			} else if (playerHealth > 0){
				serverMessageTimer -= 1
			}
			serverMessageWindow -= 1
			var message = serverMessage.split("|");
			ctx.textAlign="center";
			style = "rgba(15,15,15," + serverMessageTimer/40 + ")"
			ctx.fillStyle=style;
			ctx.fillRect(0,0,128,128);
			style = "rgba(255,255,255," + serverMessageTimer/20 + ")"
			ctx.fillStyle=style;
			ctx.font='8px small';
			ctx.fillText(message[0], 64, 62);
			ctx.font='8px tiny';
			ctx.fillText(message[1], 64, 72);
			if (serverMessageTimer <= 0) {
				serverMessageTimer = 0;
				serverMessage = null;
			console.log(serverMessageTimer)
			}
		}
	};
};

//mOVEMENT /////////////////////////////////////////


function control(action){
	if (action == currentDir){return};
	switch (action){
		case "2":
			if(controlState == "character"){	socket.emit('action', [userplayer, "2"]); } else { if (selector[0] > 0){selector[0] -= 1} }
			break;
		case "4":
			if(controlState == "character"){	socket.emit('action', [userplayer, "4"]); } else { if (selector[1] < selectorXlimit){selector[1] += 1} }
			break;
		case "6":
			if(controlState == "character"){	socket.emit('action', [userplayer, "6"]); } else { if (selector[0] < selectorYlimit){selector[0] += 1} }
			break;
		case "8":
			if(controlState == "character"){	socket.emit('action', [userplayer, "8"]); } else { if (selector[1] > 0){selector[1] -= 1} }
			break;
		case "movenull":
			if(controlState == "character"){socket.emit('action', [userplayer, "movenull"]);}
			break;
		case "attacknull":
			if(controlState == "character"){socket.emit('action', [userplayer, "attacknull"]);}
			break;
		case "character":
			if (dialogType == "character") {
				loot1 = null
				loot2 = null
				lootSpot1 = null
				selector = [0,0];
				dialogPointers = [null, null, null, null, null];
				dialog = null;
				dialogType = null;
				controlState = "character";
			} else{
				loot1 = null
				loot2 = null
				lootSpot1 = null
				socket.emit('action', [userplayer, "character", null]); console.log('interact');
			}
			break;
		case "interact":
			if(controlState == "character"){
				socket.emit('action', [userplayer, "interact", null]); console.log('interact');
			} else {
				if (["loot"].indexOf(dialogType) > -1 && loot1 == null){
					loot1 = dialogPointers[selector[1]+ (selector[0]*(selectorXlimit+1))]
					lootSpot1 = [selector[0],selector[1]]
					return;
				}
				if (["loot"].indexOf(dialogType) > -1 && loot1 !== null){
					loot2 = dialogPointers[selector[1]+ (selector[0]*(selectorXlimit+1))]
					console.log("emit", loot1, loot2)
					socket.emit('action', [userplayer, "interact", ["swap"].concat(loot1, loot2)]);
					loot1 = null
					loot2 = null
					lootSpot1 = null
					return;
				}
				if (["character"].indexOf(dialogType) > -1 && loot1 == null){
					loot1 = dialogPointers[selector[1]+ (selector[0]*(selectorXlimit+1))]
					lootSpot1 = [selector[0],selector[1]]
					return;
				}
				if (["character"].indexOf(dialogType) > -1 && loot1 !== null){
					loot2 = dialogPointers[selector[1]+ (selector[0]*(selectorXlimit+1))]
					console.log("emit", loot1, loot2)
					socket.emit('action', [userplayer, "interact", ["characterInteract"].concat(loot1, loot2)]);
					loot1 = null
					loot2 = null
					lootSpot1 = null
					return;
				}
				if (dialogPointers == "exit" || dialogPointers[selector[1]+ (selector[0]*(selectorXlimit+1))] == "exit"){
					selector = [0,0];
					dialogPointers = [null, null, null, null, null];
					dialog = null;
					dialogType = null;
					controlState = "character";
					return;
				}
				socket.emit('action', [userplayer, "interact", dialogPointers[selector[1]+ (selector[0]*(selectorXlimit+1))]]);
			}
			break;
		case "attack0":
			if (controlState == "character"){socket.emit('action', [userplayer, "attack0"]);}
			loot1 = null
			loot2 = null
			lootSpot1 = null
			selector = [0,0];
			dialogPointers = [null, null, null, null, null];
			dialog = null;
			controlState = "character";
			break;
		case "attack1":
			if (controlState == "character"){socket.emit('action', [userplayer, "attack1"]);}
			loot1 = null
			loot2 = null
			lootSpot1 = null
			selector = [0,0];
			dialogPointers = [null, null, null, null, null];
			dialog = null;
			controlState = "character";
			break;
		case "attack2":
			if (controlState == "character"){socket.emit('action', [userplayer, "attack2"]);}
			loot1 = null
			loot2 = null
			lootSpot1 = null
			selector = [0,0];
			dialogPointers = [null, null, null, null, null];
			dialog = null;
			controlState = "character";
			break;
		case "attack3":
			if (controlState == "character"){socket.emit('action', [userplayer, "attack3"]);}
			loot1 = null
			loot2 = null
			lootSpot1 = null
			selector = [0,0];
			dialogPointers = [null, null, null, null, null];
			dialog = null;
			controlState = "character";
			break;
	}
	if (["2", "4", "6", "8", "null"].indexOf(action) !== -1) {currentDir = action;}
}

///// GET PLAYER TEAM AND STUFF ////
document.getElementById("selBlue").addEventListener("click", function(event) { add_player(1); });
document.getElementById("selGreen").addEventListener("click", function(event) { add_player(8); });
document.getElementById("selRed").addEventListener("click", function(event) { add_player(9); });
document.getElementById("selGold").addEventListener("click", function(event) { add_player(6); });


window.addEventListener("resize", function() {
	resize();
});
resize();
///// USER INPUT for player movement  ////////////////////////////   192

document.onkeydown= function(event) {
		var key= (event || window.event).keyCode;
		if (key == 72){ control("attack0"); return };
		if (key == 74){ control("attack1"); return };
		if (key == 75){ control("attack2"); return };
		if (key == 76){ control("attack3"); return };
		if (key == 192){ console.log(serverTime, coredata, " currentDirKey ", currentDirKey); return };
		if (key == 73){ control("interact"); return };
		if (key == 85){ control("character"); return };
		//wasd
		if (key == 87){ control("2") };
		if (key == 68){ control("4") };
		if (key == 83){ control("6") };
		if (key == 65){ control("8") };
		// arrows
		if (key == 38){ event.preventDefault(); control("2") };
		if (key == 39){ event.preventDefault(); control("4") };
		if (key == 40){ event.preventDefault(); control("6") };
		if (key == 37){ event.preventDefault(); control("8") };
		if ([72, 74, 75, 76].indexOf(key) == -1){
			currentDirKey = key;
		}
};


document.onkeyup= function(event) {
		var key= (event || window.event).keyCode;
		if (key == currentDirKey){
			currentDirKey = null;
			currentDir = null;
			control("movenull");
		} else if ([72, 74, 75, 76].indexOf(key) > -1){
			control("attacknull");
		};
};






////// GET data //////////////
socket.on('start', function(data) {
	TeamSelected = true;
	serverTime = data;
	console.log("Player Initialized:", data);
});

socket.on('dialog', function(data) {
	dialogType = data[0];
	dialog = data[1];
	dialogPointers= data[2];
	if (dialogType == "speech"){
		selectorYlimit = 4
		selectorXlimit = 0
	}
	if (dialogType == "loot"){
		selectorYlimit = 1
		selectorXlimit = 9
	}
	if (dialogType == "character"){
		selectorYlimit = 1
		selectorXlimit = 9
	}
	controlState = "dialog";
	console.log("Dialog gottedidid:", data);
});

socket.on('serverMessage', function(data) {
	serverMessage = data.message;
	serverTime = data.time;
	console.log("serverMessage:", serverMessage);
	serverMessageTimer = 0;
	serverMessageWindow = 40;
});

socket.on('camera', function(data) {
		campos = data[0].split(".");
		if (playerHealth > data[1]){
			damagechange = true;
		} else {
			damagechange = false;
		}
		playerHealth = data[1]
		playerMaxHealth = data[2]
		playerMana = data[3]
		playerMaxMana = data[4]
		playerCor = data[5]
		playerMaxCor = data[6]
		weap0 = data[7]
		weap1 = data[8]
		weap2 = data[9]
		weap3 = data[10]
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

tc.on("tap", function(ev){control("attack0"); return });

tc.on("press", function(ev){control("interact"); return });

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
map.addEventListener('touchend', touchend, false);
function touchend(ev){
	currentDirKey = null;
	currentDir = null;
	control("movenull")
};
