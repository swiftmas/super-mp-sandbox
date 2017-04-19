//// SETUP VARS ////////////////////////////
var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io');
var npcs = require('./npc.js');
var globals = require('./globals.js');
var combat = require('./combat.js');


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
var listener = io.listen(server);

//// Server Update ///////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(function(){
  coredata.effects = []
  combat.processBombs();
  combat.bombcontroller();


  ///////////////
  var datas = [];
  //PLAYERS
  var dp = coredata.players;
  for ( var player in dp){
    var code = dp[player].team;
    var pos = dp[player].pos
    datas.push(code + "." + pos);
  }
  //Bombs
  var db = coredata.bombs;
  for (var bomb in db){
    var code = db[bomb].state;
    if (code >= 16 || code <= 10 && code >= 6 ){
      code = 11;
    } else {
      code = 12;
    };
    var pos = db[bomb].pos
    datas.push(code + "." + pos);
  }
  datas.push.apply(datas, coredata.effects);
  listener.sockets.emit('getdata', datas);
}, 100);

///// Per Connectoin /////////////////////////////////////////////////////////////////////////////////////////////////
listener.sockets.on('connection', function(socket){

////// INIT ////////////
  socket.emit('getmap', collmap);

// For every Client data event (this is where we recieve movement)////////////
  socket.on('movement', function(data){
    var playername = data[0]
    var dir = data[1]
    if (dir == "up"){
  		var x = parseInt(coredata.players[playername].pos.split(".")[0])
  		var y = parseInt(coredata.players[playername].pos.split(".")[1]) - 1
  		cellname = ''+x+'.'+y+''
  	};
  	if (dir == "down"){
  		var x = parseInt(coredata.players[playername].pos.split(".")[0])
  		var y = parseInt(coredata.players[playername].pos.split(".")[1]) + 1
  		cellname = ''+x+'.'+y+''
  	};
  	if (dir == "left"){
  		var x = parseInt(coredata.players[playername].pos.split(".")[0]) - 1
  		var y = parseInt(coredata.players[playername].pos.split(".")[1])
  		cellname = ''+x+'.'+y+''
  	};
  	if (dir == "right"){
  		var x = parseInt(coredata.players[playername].pos.split(".")[0]) + 1
  		var y = parseInt(coredata.players[playername].pos.split(".")[1])
  		cellname = ''+x+'.'+y+''
  	};



  	if (coredata.players[playername].state !== "dead" && collmap[cellname] == 0){
    //process.stdout.write(data[1]+" commit to ->");
		//console.log(data[0], coredata.players[data[0]].pos);
		coredata.players[playername].pos = cellname;
		coredata.players[playername].dir = dir;
    	};
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
