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
var drawEntities = true;
var drawNpcs = true;
var drawColliders = true;
var sizemultiplier = 4;

var div = document.createElement("div");
div.style.width = sizemultiplier + "px";
div.style.height = sizemultiplier + "px";
div.id = "selector"
div.style.position = "absolute";
div.style.left = "0px";
div.style.right = "0px";
div.style.background = "blue";
document.getElementById("layer").appendChild(div);



document.getElementById("input_open").addEventListener('input', function (e) {
    onOpenChange(e);
});

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
function rco(j) {
	return (j * sizemultiplier);
};

document.getElementById("map").addEventListener("mousemove", function(event) {
  var x = Math.ceil((event.pageX - document.getElementById("map").offsetLeft) / sizemultiplier);
  var y = Math.ceil((event.pageY - document.getElementById("map").offsetTop) / sizemultiplier);
	document.getElementById("selector").style.top = ((y * sizemultiplier) + document.getElementById("map").offsetTop) + "px";
	document.getElementById("selector").style.left = ((x * sizemultiplier) + document.getElementById("map").offsetLeft) + "px";
	document.getElementById("selector").style.width = sizemultiplier + "px";
	document.getElementById("selector").style.height = sizemultiplier + "px";
  coor = x + "." + y;
  document.getElementById("selector").innerHTML = coor;;
});


document.getElementById("sizemultiplier").addEventListener("keyup", function(event) {
	sizemultiplier = document.getElementById("sizemultiplier").value
});


document.getElementById("map").addEventListener("mousedown", function(event) {
	drawmap();
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
			for (entity in chunks[chunk].entities){
				console.log(entity)
				pos = chunks[chunk].entities[entity].pos.split(".")
				 ctx.stroke();
 				ctx.rect(pos[0]*sizemultiplier,pos[1]*sizemultiplier,chunks[chunk].entities[entity].h*sizemultiplier,chunks[chunk].entities[entity].w*sizemultiplier);
			}
			for (npc in chunks[chunk].npcs){
				console.log(npc)
				pos = chunks[chunk].npcs[npc].pos.split(".")
				 ctx.stroke();
 				ctx.rect(pos[0]*sizemultiplier,pos[1]*sizemultiplier,chunks[chunk].npcs[npc].h*sizemultiplier,chunks[chunk].npcs[npc].w*sizemultiplier);
			}
		}
	}

};
