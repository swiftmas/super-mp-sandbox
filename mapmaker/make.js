//VARS -------//////////////////////////////////////////////////////////
var json = {}
var map = document.getElementById("map");
var maptex1 = new Image();
maptex1.src = '../static/untitled.png';
var ctx = map.getContext("2d");
map.width = maptex1.width * 16;
map.height = maptex1.height * 16;
var chunks = {}
var coor;
var drawbool = {};
var itemPath = []
drawbool.showEntities = true;
drawbool.showNpcs = true;
drawbool.showColliders = true;
drawbool.showChunks = true;
var sizemultiplier = 4;
var shifting = false;
var div = document.createElement("div");
div.style.width = sizemultiplier + "px";
div.style.height = sizemultiplier + "px";
div.id = "selector"
div.style.position = "absolute";
div.style.left = "0px";
div.style.right = "0px";
div.style.background = "blue";
document.getElementById("pointer").appendChild(div);


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}

function rco(j) {
	return (j * sizemultiplier);
};

function select(type, chunkID, name){
	if (type == "chunk"){
		document.getElementById("jsonEditor").value = name;
		document.getElementById("itemDetails").innerHTML = "Chunk - " + name
		document.getElementById("chunkDetails").innerHTML = JSON.stringify(chunks[chunkID], null, 2);
		itemPath = [type, chunkID, name]
	} else {
		document.getElementById("jsonEditor").value = JSON.stringify(chunks[chunkID][type][name], null, 2);
		document.getElementById("itemDetails").innerHTML = "Chunk - " + chunkID + " :: " + type + " - " + name;
		document.getElementById("chunkDetails").innerHTML = ""
		itemPath = [type, chunkID, name]
	}
}

function rchalf(j){
	return rco(j/2)
}

function onOpenChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}
function onReaderLoad(event){
    //alert(event.target.result);
    chunks = JSON.parse(event.target.result);
		drawmap()
}

function drawTrueFalse(type){
		drawbool[type] = document.getElementById(type).checked;
		drawmap();
}

function getDist(destination) {
	var origin = coor
  var xo = origin.split('.')[0];
  var yo = origin.split('.')[1];
  var xd = destination.split('.')[0];
  var yd = destination.split('.')[1];
  var distx = xd - xo;
  var disty = yd - yo;
  var xdir, ydir, greaterDir
  var trueDist = Math.sqrt(Math.pow(Math.abs(distx), 2) + Math.pow(Math.abs(disty), 2));
  if ( distx > 0 ) { xdir = "4" } else { xdir = "8"};
  if ( disty > 0 ) { ydir = "2" } else { ydir = "6"};
  if (Math.abs(distx) > Math.abs(disty)){ greaterDir = xdir } else { greaterDir = ydir };
  return [trueDist, distx, disty, xdir, ydir, greaterDir];
};

function addchunks(){
	wide = parseFloat(maptex1.width / 128)
	high = parseFloat(maptex1.height / 128)
	console.log(wide, high);
	for (var x = 1; x < wide; x++){
		for (var y = 1; y < high; y++){
			var chunkname = (x * 128 - 64) + "." + (y * 128 - 64)
			if (! chunks.hasOwnProperty(chunkname)){
					chunks[chunkname] = {"npcs":{}, "colliders":{}, "entities":{}, "attacks":[]}
			}
		}
	}
	drawmap();
}
function addItem(type){
	var newguid = guid();
	console.log(type.charAt(0) + newguid, JSON.stringify({"pos": itemPath[1], "w": 4, "h": 4}));
	chunks[itemPath[1]][type][type.charAt(0) + newguid] = {"pos": itemPath[1], "w": 4, "h": 4};
	select(type, itemPath[1], type.charAt(0) + newguid);
	drawmap();
}

function move(dir){
  var chunkID = itemPath[1];
  var type = itemPath[0];
  var name = itemPath[2];
  var rate = 1;
  if (shifting == true){
    rate = 8;
  }

  var newpos = chunks[chunkID][type][name].pos
  switch (dir){
    case "left":
      var item = chunks[chunkID][type][name].pos.split(".")
      var x = (parseInt(item[0])-rate)
      newpos = x+"."+item[1];
      break;
    case "right":
      var item = chunks[chunkID][type][name].pos.split(".")
      var x = (parseInt(item[0])+rate)
      newpos = x+"."+item[1];
      break;
    case "up":
      var item = chunks[chunkID][type][name].pos.split(".")
      var y = (parseInt(item[1])-rate)
      newpos = item[0]+"."+y;
      break;
    case "down":
      var item = chunks[chunkID][type][name].pos.split(".")
      var y = (parseInt(item[1])+rate)
      newpos = item[0]+"."+y;
      break;
  }
  chunks[chunkID][type][name].pos = newpos
  chunks[chunkID][type][name].chunk = chunkID
  if (chunks[chunkID][type][name].hasOwnProperty("origin")){
    chunks[chunkID][type][name].origin = newpos
  }
  drawmap();
  document.getElementById("jsonEditor").value = JSON.stringify(chunks[chunkID][type][name], null, 2);

}

function removeItem(){
	if (itemPath[0] == "chunk"){
		delete chunks[itemPath[2]];
		document.getElementById("itemDetails").innerHTML = "Chunk Removed"
	} else {
		delete chunks[itemPath[1]][itemPath[0]][itemPath[2]]
		document.getElementById("itemDetails").innerHTML = "Item Removed";
	}
	drawmap();
}

function download() {
  document.getElementById('jsonExport').style.display = "block";
	document.getElementById('exportContent').innerHTML = JSON.stringify(chunks)
}

function changeJson(){
	if (itemPath[0] == "chunk"){
		new_value = JSON.parse(document.getElementById("jsonEditor").value)
		if (itemPath[2] !== new_value) {
	    Object.defineProperty(chunks, new_value,
	        Object.getOwnPropertyDescriptor(chunks, itemPath[2]));
	    delete chunks[itemPath[2]];
			for (entity in chunks[new_value].entities){
				var obj = chunks[new_value].entities[entity];
				obj.chunk = new_value;
			}
			for (npc in chunks[new_value].npcs){
				var obj = chunks[new_value].npcs[npc];
				obj.chunk = new_value;
			}
			for (collider in chunks[new_value].colliders){
				var obj = chunks[new_value].colliders[collider];
				obj.chunk = new_value;
			}

		}
		document.getElementById("itemDetails").innerHTML = "Chunk Saved"
	} else {
		chunks[itemPath[1]][itemPath[0]][itemPath[2]] = JSON.parse(document.getElementById("jsonEditor").value);
		document.getElementById("itemDetails").innerHTML = "Item Saved";
	}
	drawmap();
}


//#### other inputs #########
document.getElementById("input_open").addEventListener('input', function (e) {
    onOpenChange(e);
});
document.getElementById("sizemultiplier").addEventListener("keyup", function(event) {
	sizemultiplier = document.getElementById("sizemultiplier").value
});

document.addEventListener("keydown", function(event) {
  if (event.keyCode == 16){
    shifting = true;
  }
});
document.addEventListener("keyup", function(event) {
  if (event.keyCode == 16){
    shifting = false;
  }
});

//#### MOUSE Events #####
document.getElementById("map").addEventListener("mousemove", function(event) {
  var x = Math.ceil((event.pageX - 15 - document.getElementById("map").offsetLeft) / sizemultiplier);
  var y = Math.ceil((event.pageY - 15 - document.getElementById("map").offsetTop) / sizemultiplier);
	document.getElementById("selector").style.top = ((y * sizemultiplier) + document.getElementById("map").offsetTop) + "px";
	document.getElementById("selector").style.left = ((x * sizemultiplier) + document.getElementById("map").offsetLeft) + "px";
	document.getElementById("selector").style.width = sizemultiplier + "px";
	document.getElementById("selector").style.height = sizemultiplier + "px";
  coor = x + "." + y;
  document.getElementById("coor").innerHTML = coor;;
});

document.getElementById("showChunks").addEventListener('click', function(event) { drawTrueFalse("showChunks") });
document.getElementById("showEntities").addEventListener('click', function(event) { drawTrueFalse("showEntities") });
document.getElementById("showNpcs").addEventListener('click', function(event) { drawTrueFalse("showNpcs") });
document.getElementById("showColliders").addEventListener('click', function(event) { drawTrueFalse("showColliders") });

document.getElementById("left").addEventListener('click', function(event) { move("left") });
document.getElementById("right").addEventListener('click', function(event) { move("right") });
document.getElementById("up").addEventListener('click', function(event) { move("up") });
document.getElementById("down").addEventListener('click', function(event) { move("down") });



document.getElementById("map").addEventListener("mousedown", function(event) {
	//document.getElementById("jsonEditor").style.display = "contents"
	var nearest = 500000000;
	var type;
	var chunkID;
	var name;
	console.log(coor)
	if (chunks != undefined) {
		for (chunk in chunks){
			if (drawbool.showChunks == true){
				var pos = chunk
				dist = getDist(pos)
				if (dist[0] <= nearest){
					nearest = dist[0]
					type = "chunk"
					chunkID = chunk
					name = chunk
					itemPath = [type, chunkID, name]
				}
			}
			if (drawbool.showEntities == true){
				for (entity in chunks[chunk].entities){
					var obj = chunks[chunk].entities[entity];
					var pos = obj.pos;
					dist = getDist(pos)
					if (dist[0] <= nearest){
						nearest = dist[0]
						type = "entities"
						chunkID = chunk
						name = entity
						itemPath = [type, chunkID, name]
					}
				}
			}
			if (drawbool.showNpcs == true){
				for (npc in chunks[chunk].npcs){
					var obj = chunks[chunk].npcs[npc];
					var pos = obj.pos;
					dist = getDist(pos)
					if (dist[0] <= nearest){
						nearest = dist[0]
						console.log(dist[0])
						type = "npcs"
						chunkID = chunk
						name = npc
						itemPath = [type, chunkID, name]
					}
				}
			}
			if (drawbool.showColliders == true){
				for (collider in chunks[chunk].colliders){
					var obj = chunks[chunk].colliders[collider];
					var pos = obj.pos;
					dist = getDist(pos)
					if (dist[0] <= nearest){
						nearest = dist[0]
						type = "colliders"
						chunkID = chunk
						name = collider
						itemPath = [type, chunkID, name]
					}
				}
			}
		}
	}
 select(type, chunkID, name)

});

document.getElementById("map").addEventListener("mouseup", function(event) {
  mouse = "up";
});


document.getElementById("start").addEventListener('click', function(event) { drawmap() });


//----------------------------------------------------------------------------------------------------
function drawmap(){
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	collElements = [];
	ctx.drawImage(maptex1, 0, 0, maptex1.width * sizemultiplier, maptex1.height * sizemultiplier);
	map.width = (maptex1.width * sizemultiplier)/2;
	map.height = (maptex1.height * sizemultiplier)/2;
	document.getElementById("dimensions").innerHTML = "Dimensions:" + (maptex1.width) + " by " + (maptex1.height);
	if (chunks != undefined) {
		for (chunk in chunks){
			if (drawbool.showChunks == true){
				pos = chunk.split(".");
				ctx.beginPath();
				ctx.strokeStyle="grey";
				ctx.lineWidth="4";
				ctx.rect(rco(pos[0] - 64),rco(pos[1] - 64),rco(128),rco(128));
				ctx.stroke();
			}
			if (drawbool.showEntities == true){
				for (entity in chunks[chunk].entities){
					obj = chunks[chunk].entities[entity];
					pos = obj.pos.split(".");
					ctx.beginPath();
					ctx.strokeStyle="blue";
					ctx.lineWidth="2";
	 				ctx.rect(rco(pos[0] - (obj.w/2)),rco(pos[1] - (obj.h/2)),rco(obj.w),rco(obj.h));
					ctx.stroke();

				}
			}
			if (drawbool.showNpcs == true){
				for (npc in chunks[chunk].npcs){
					obj = chunks[chunk].npcs[npc];
					pos = obj.pos.split(".");
					ctx.beginPath();
					ctx.strokeStyle="red";
					ctx.lineWidth="2";
					ctx.rect(rco(pos[0] - (obj.w/2)),rco(pos[1] - (obj.h/2)),rco(obj.w),rco(obj.h));
					ctx.stroke();
				}
			}
			if (drawbool.showColliders == true){
				for (collider in chunks[chunk].colliders){
					obj = chunks[chunk].colliders[collider];
					pos = obj.pos.split(".");
					ctx.beginPath();
					ctx.strokeStyle="orange";
					ctx.lineWidth="2";
					ctx.rect(rco(pos[0] - (obj.w/2)),rco(pos[1] - (obj.h/2)),rco(obj.w),rco(obj.h));
					ctx.stroke();
				}
			}
		}
	}

};
