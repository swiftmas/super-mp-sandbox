//VARS -------//////////////////////////////////////////////////////////
var json = {}
var map = document.getElementById("map");
var maptex1 = new Image();
maptex1.src = '../static/bot.png';
var ctx = map.getContext("2d");
map.width = maptex1.width * 16;
map.height = maptex1.height * 16;
var chunks;
var coor;
var drawbool = {};
var itemPath = []
drawbool.showEntities = true;
drawbool.showNpcs = true;
drawbool.showColliders = true;
drawbool.showChunks = true;
var sizemultiplier = 4;

var div = document.createElement("div");
div.style.width = sizemultiplier + "px";
div.style.height = sizemultiplier + "px";
div.id = "selector"
div.style.position = "absolute";
div.style.left = "0px";
div.style.right = "0px";
div.style.background = "blue";
document.getElementById("pointer").appendChild(div);



function rco(j) {
	return (j * sizemultiplier);
};

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
				if (dist[0] < nearest){
					nearest = dist[0]
					type = "chunk"
					chunkID = "none"
					name = chunk
					itemPath = [type, chunkID, name]
				}
			}
			if (drawbool.showEntities == true){
				for (entity in chunks[chunk].entities){
					var obj = chunks[chunk].entities[entity];
					var pos = obj.pos;
					dist = getDist(pos)
					if (dist[0] < nearest){
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
					if (dist[0] < nearest){
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
					if (dist[0] < nearest){
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
	if (type == "chunk"){
		document.getElementById("jsonEditor").value = name;
		document.getElementById("itemDetails").innerHTML = "Chunk - " + name

	} else {
		document.getElementById("jsonEditor").value = JSON.stringify(chunks[chunkID][type][name], null, 2);
		document.getElementById("itemDetails").innerHTML = "Chunk - " + chunkID + " :: " + type + " - " + name;
	}

});

document.getElementById("map").addEventListener("mouseup", function(event) {
  mouse = "up";
});


document.getElementById("start").addEventListener('click', function(event) { drawmap() });


//----------------------------------------------------------------------------------------------------
function drawmap(){
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	collElements = [];
	ctx.drawImage(maptex1, 0, 0, maptex1.width * sizemultiplier, maptex1.height * sizemultiplier)
	map.width = maptex1.width * sizemultiplier;
	map.height = maptex1.height * sizemultiplier;
	document.getElementById("dimensions").innerHTML = "Dimensions:" + (maptex1.width) + " by " + (maptex1.height);
	if (chunks != undefined) {
		for (chunk in chunks){
			if (drawbool.showChunks == true){
				pos = chunk.split(".")
				ctx.beginPath();
				ctx.strokeStyle="grey";
				ctx.lineWidth="4";
				ctx.rect(rco(pos[0] - 32),rco(pos[1] - 32),rco(64),rco(64));
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
