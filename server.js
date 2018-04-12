//// SETUP VARS ////////////////////////////
http = require("http");
url = require('url');
fs = require('fs');
io = require('socket.io');
npcs = require('./npc.js');
globals = require('./globals.js');
combat = require('./combat.js');
interact = require('./interact.js');
general = require('./general.js');
////VARS////
coredata = globals.coredata;
mapchange = globals.mapchange;
attackQueue = globals.attackQueue;
moveQueue = globals.moveQueue;
chunkParts = globals.chunkParts;
activeAttacksQueue = globals.activeAttacksQueue;

// Unfortunately at this time this setups up the server and does all the listening so its a little ugly. to see actual game functions goto the setInterval. That loop is the backbone of the game.
var server = http.createServer(function(request, response){
    var path = url.parse(request.url).pathname;
    // STATIC STUFF ///////////////////
    if (path.substring(0, 8) == "/static/" ) {
        fs.readFile(__dirname + path, function(error, data){
            if (error){
                response.writeHead(404);
                response.write("o0ps this doesn't exist - 404");
                response.end();
            }
            else{
                if (path.slice(-3) == "png"){
                    response.writeHead(200, {"Content-Type": "image/png"});
                };
                if (path.slice(-3) == "jpg"){
                    response.writeHead(200, {"Content-Type": "image/jpg"});
                };
                if (path.slice(-4) == "html"){
                    response.writeHead(200, {"Content-Type": "text/html"});
                };
                if (path.slice(-2) == "js"){
                    response.writeHead(200, {"Content-Type": "text/html"});
                };
                if (path.slice(-4) == "woff"){
                    response.writeHead(200, {"Content-Type": "text/html"});
                };
                response.write(data, "utf8");
                response.end();
            }
        });
    } else {
    switch(path){
        case '/':
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write('hello world <a href="session.html" style="size: 54px;">click here to start the game </a>');
            response.end();
            break;
        case '/socket.html':
            fs.readFile(__dirname + path, function(error, data){
                if (error){
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                    response.end();
                }
                else{
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(data, "utf8");
                    response.end();
                }
            });
            break;
	case '/session.html':
            fs.readFile(__dirname + path, function(error, data){
                if (error){
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                    response.end();
                }
                else{
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(data, "utf8");
                    response.end();
                }
            });
            break;
	case '/main.js':
            fs.readFile(__dirname + path, function(error, data){
                if (error){
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                    response.end();
                }
                else{
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(data, "utf8");
                    response.end();
                }
            });
            break;
        case '/cli.css':
            fs.readFile(__dirname + path, function(error, data){
                if (error){
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                    response.end();
                }
                else{
                    response.writeHead(200, {"Content-Type": "text/css"});
                    response.write(data, "utf8");
                    response.end();
                }
            });
            break;
  case '/client-modules.js':
            fs.readFile(__dirname + path, function(error, data){
                if (error){
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                    response.end();
                }
                else{
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(data, "utf8");
                    response.end();
                }
            });
            break;
	case '/40x40collmap.jpg':
            fs.readFile(__dirname + path, function(error, data){
                if (error){
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                    response.end();
                }
                else{
                    response.writeHead(200, {"Content-Type": "image/jpg"});
                    response.write(data, "utf8");
                    response.end();
                }
            });
            break;
        default:
            response.writeHead(404);
            response.write("opps this doesn't exist - 404");
            response.end();
            break;
    }
    };
});

server.listen(8080);

//----------------------------/COOL STUFF /-----------------------------------------------------------------------//////////////

listener = io.listen(server);

//// Server Update ///////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(function(){
  var tickstart = new Date().getTime()
  general.ticBegin()
  ticklength = (new Date().getTime()) - tickstart
  if ( ticklength > 10){console.log(ticklength)}
}, 100);

///// Per Connectoin /////////////////////////////////////////////////////////////////////////////////////////////////
listener.sockets.on('connection', function(socket){
// For every Client data event (this is where we recieve input)////////////

// This listens for new players ////////
  socket.on('add_player', function(data){
    for (var key in data){
      if (data.hasOwnProperty(key)) {
        coredata.players[key] = data[key];
      };
    };
    console.log(coredata.players[key]);
    socket.emit('start', globals.time);
  });

// Listens for attacks ////// !!!!!! NEEDS FUNCTION OUSIDE OF LISTENER  !!!!!!!!///////////////////////////
  socket.on('action', function(data) {
    if (coredata.players.hasOwnProperty(data[0])){
      switch (data[1]){
        case "attack0":
          attackQueue[data[0]] =  "attack0";
          break;
        case "attack1":
          attackQueue[data[0]] =  "attack1";
          break;
        case "attack2":
          attackQueue[data[0]] =  "attack2";
          break;
        case "attack3":
          attackQueue[data[0]] =  "attack3";
          break;
        case "interact":
          if (data[2] !== null){
            console.log("Interacting: ", data[2][0])
            if (["characterInteract", "swap"].indexOf(data[2][0]) == -1){
              interact.getDialog(data[0], data[2]);
            } else {
              interact.getUI(data[0], data[2]);
            }
          } else {
            interact.startDialog(data[0]);
          };
          if (activeAttacksQueue.hasOwnProperty(data[0])){
            activeAttacksQueue[data[0]].interacted = true;
          }
          break;
        case "character":
          moveQueue[data[0]] = [data[0], null];
          interact.showCharacter(data[0]);
        case "attacknull":
          attackQueue[data[0]] = null;
          //moveQueue[data[0]] = data;
          break;
        case "movenull":
          data[1] = null
          moveQueue[data[0]] = data;
          break;
        case "superMove":
          data[1] = 0
          console.log("Did it")
          general.DoMovement(data[0], "none", data[2], 4)
          break;
        default:
          moveQueue[data[0]] = data;
          break;
      };
    }
  });
// Listens for disconnects
  socket.on('disconnect', function() {
    console.log(this.id + "Disconnected");
    var cleanid = this.id
    if (typeof coredata.players["p"+cleanid] !== undefined && coredata.players.hasOwnProperty("p"+cleanid)){
        //var newnpc = coredata.chunks[coredata.players["p"+cleanid].closeChunks[0]].npcs;
        //newnpc["p"+cleanid] = {}
        //for(var k in coredata.players["p"+cleanid]) {newnpc["p"+cleanid][k]=coredata.players["p"+cleanid][k]};
        //newnpc["p"+cleanid].state = 63
        //newnpc["p"+cleanid].chunk = coredata.players["p"+cleanid].closeChunks[0]
        delete attackQueue["p" + cleanid]
        delete activeAttacksQueue["p" + cleanid]
        delete coredata.players["p" + cleanid];
        console.log("cleaned up " + cleanid)
    };
  });
});
