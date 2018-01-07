//// SETUP VARS ////////////////////////////
var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var npcs = require('./npc.js');
var globals = require('./globals.js');
var combat = require('./combat.js');
var interact = require('./interact.js');
var general = require('./general.js');


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
////VARS////
coredata = globals.coredata;
collmap = globals.collmap;
attackQueue = globals.attackQueue;
moveQueue = globals.moveQueue;
listener = io.listen(server);

//// Server Update ///////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(function(){
  var tickstart = new Date().getTime()
  general.ProcessTime();
  if (globals.serverPause == false ){
    general.ProcessChunks();
    general.StateController();
    npcs.npccontroller();
    npcs.alerttimedown();
    general.ProcessMovements();
    combat.processAttackQueue();
    combat.processEffects();
    //npcs.npccontroller();
    //npcs.alerttimedown();



    /////Convert Catagories to Packets//////////
    var playerDatas = [];
    //PLAYERS
    var dp = coredata.players;
    for ( var player in dp){
      var code = dp[player].team;
      var pos = dp[player].pos;
      var state = dp[player].state;
      var dir = dp[player].dir
      //position player camera!
      listener.sockets.connected[player.slice(1)].emit('camera', [dp[player].pos, dp[player].health,dp[player].maxHealth,dp[player].mana,dp[player].maxMana])
      playerDatas.push(code + "." + dir + "." + state + "." + pos);
    }

    for (var player in coredata.players){
      var datas = [];
      for (var chunk in coredata.players[player].closeChunks){
        //console.log(JSON.stringify(coredata.players[player].closeChunks), coredata.players[player].closeChunks[chunk], coredata.chunks);
        var dp = coredata.chunks[coredata.players[player].closeChunks[chunk]].npcs;
        for ( var npc in dp){
          var code = dp[npc].team;
          var pos = dp[npc].pos;
          var state = dp[npc].state;
          var dir = dp[npc].dir
          datas.push(code + "." + dir + "." + state + "." + pos);
        }
        //Attacks
        var db = coredata.chunks[coredata.players[player].closeChunks[chunk]].attacks;
        for (var attack in db){
          var code = db[attack].type
          var pos = db[attack].pos
          var dir = db[attack].dir
          var state = db[attack].state
          datas.push(code + "." + dir + "." + state + "." + pos);
        }
        //entities
        var db = coredata.chunks[coredata.players[player].closeChunks[chunk]].entities;
        for (var attack in db){
          var code = db[attack].team
          var pos = db[attack].pos
          var dir = db[attack].dir
          var state = db[attack].state
          datas.push(code + "." + dir + "." + state + "." + pos);
        }
      }
      playerspecificData = datas.concat(playerDatas)
      listener.sockets.connected[player.slice(1)].emit('getdata', playerspecificData)

    }
  } else { listener.sockets.emit('serverMessage', {"message": globals.serverMessage, "time": globals.time})}
  ticklength = (new Date().getTime()) - tickstart
  if ( ticklength > 10){console.log(ticklength)}
}, 100);

///// Per Connectoin /////////////////////////////////////////////////////////////////////////////////////////////////
listener.sockets.on('connection', function(socket){

////// INIT ////////////

// For every Client data event (this is where we recieve movement)////////////

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
          moveQueue[data[0]] = [data[0], null];
          if (data[2] !== null){
            interact.getDialog(data[0], data[2]);
          } else {
            interact.startDialog(data[0]);
          };
          break;
        case "attacknull":
          attackQueue[data[0]] = null;
          //moveQueue[data[0]] = data;
          break;
        case "movenull":
          data[1] = null
          moveQueue[data[0]] = data;
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
        delete coredata.players["p" + cleanid];
        console.log("cleaned up " + cleanid)
    };
  });
});
