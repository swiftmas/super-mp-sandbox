//// SETUP VARS ////////////////////////////
var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var npcs = require('./npc.js');
var globals = require('./globals.js');
var combat = require('./combat.js');
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
                if (path.slice(-2) == ".html"){
                    response.writeHead(200, {"Content-Type": "text/html"});
                };
                if (path.slice(-2) == "js"){
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
            response.write('hello world');
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
var listener = io.listen(server);

//// Server Update ///////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(function(){
  coredata.effects = []
  npcs.npccontroller();
  npcs.alerttimedown();
  general.ProcessMovements();
  combat.processAttackQueue();
  combat.processAttacks();


  /////Convert Catagories to Packets//////////
  var datas = [];
  //PLAYERS
  var dp = coredata.players;
  for ( var player in dp){
    var code = dp[player].team;
    var pos = dp[player].pos;
    var state = dp[player].state;
    var dir = dp[player].dir
    //position player camera!
    listener.sockets.connected[player.slice(1)].emit('camera', dp[player].pos)
    datas.push(code + "." + dir + "." + state + "." + pos);
  }

  var dp = coredata.npcs;
  for ( var player in dp){
    var code = dp[player].team;
    var pos = dp[player].pos;
    var state = dp[player].state;
    var dir = dp[player].dir
    //position player camera!
    //listener.sockets.connected[player.slice(1)].emit('camera', dp[player].pos)
    datas.push(code + "." + dir + "." + state + "." + pos);
  }
  //Bombs
  var db = coredata.attacks;
  for (var attack in db){
    var code = 11;
    var pos = db[attack].pos
    var dir = db[attack].dir
    datas.push(code + "." + dir + "." + state + "." + pos);
  }
  datas.push.apply(datas, coredata.effects);
  listener.sockets.emit('getdata', datas);
}, 100);

///// Per Connectoin /////////////////////////////////////////////////////////////////////////////////////////////////
listener.sockets.on('connection', function(socket){

////// INIT ////////////
  var mapname = "This is to take away the coll map sending. it can be used to define which background image to use."
  socket.emit('getmap', mapname);

// For every Client data event (this is where we recieve movement)////////////
  socket.on('movement', function(data){
    moveQueue[data[0]] = data;
  });

// This listens for new players ////////
  socket.on('add_player', function(data){
    console.log(data);
    for (var key in data){
      if (data.hasOwnProperty(key)) {
        coredata.players[key] = data[key];
        console.log(coredata.players[key])
      };
    };
  });

// Listens for attacks ////// !!!!!! NEEDS FUNCTION OUSIDE OF LISTENER  !!!!!!!!///////////////////////////
  socket.on('attack', function(data) {
    attackQueue[coredata.players[data].pos] =  [data, "players"];
  });
// Listens for disconnects
  socket.on('disconnect', function() {
    console.log(this.id + "Disconnected");
    var cleanid = this.id
    if (typeof coredata.players["p"+cleanid] !== undefined){
        delete coredata.players["p" + cleanid];
        console.log("cleaned up " + cleanid)
    };
  });
});
