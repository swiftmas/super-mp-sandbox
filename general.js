globals = require('./globals.js');
const fs = require('fs');
coredata = globals.coredata;
chunkParts = globals.chunkParts;
moveQueue = globals.moveQueue;
mapchange = globals.mapchange;

module.exports = {
  getDist: function (origin, destination, callback) {
    getDist(origin, destination, callback);
  },
  ProcessChunks: function () {
    ProcessChunks();
  },
  ProcessTime: function () {
    ProcessTime();
  },
  Collission: function (location, width, height, callback) {
    Collission(location, width, height, callback);
  },
  StateController: function () {
    StateController();
  },
  DoMovement: function (name, chunk, dir, rate, ignoreCollision, maintainFacingDirection) {
    DoMovement(name, chunk, dir, rate, ignoreCollision, maintainFacingDirection);
  },
  ProcessMovements: function () {
    ProcessMovements();
  },
};

function ProcessTime(){
  globals.time -= 1
  if (globals.time == 3300){
    console.log("The day grows long");
  };
  if (globals.time == 3000){
    console.log("Night has fallen. The darkness chills you");
    globals.serverPause = true;
    globals.serverMessage = "Night has fallen. The darkness chills you"
    globals.ChangeDayNight("night");
    coredata.chunks = {}
  }
  if (globals.time == 2960){
    globals.serverPause = false;
  }
  if (globals.time == 300){
    console.log("Day is near");
  }
  if (globals.time == 0){
    console.log("Day has broken. the light blesses you");
    globals.serverPause = true;
    globals.serverMessage = "Day has broken. the light blesses you"
    globals.ChangeDayNight("day");
    coredata.chunks = {}
    globals.time = 6000;
  }
  if (globals.time == 5960){
    globals.serverPause = false;
  }
}

function ProcessChunks(){
  var CurrentChunksInTick = []
  for (var player in coredata.players) {
      coredata.players[player].closeChunks = [];
      for (var chunk in globals.chunkdata){
        getDist(coredata.players[player].pos, chunk, function(result) {
          if (Math.abs(result[1]) < 70 && Math.abs(result[2]) < 70){
            coredata.players[player].closeChunks.push(chunk);
            CurrentChunksInTick.push(chunk);
            if (! coredata.chunks.hasOwnProperty(chunk)){
              coredata.chunks[chunk] = globals.chunkdata[chunk];
              console.log("New chunk added: ", chunk, "  total: ", Object.keys(coredata.chunks).length)
            };
          };
        });
      };
  }
  for (var chunk in coredata.chunks){
    if (CurrentChunksInTick.indexOf(chunk) == -1){
      delete coredata.chunks[chunk];
      console.log("New chunk removed: ", chunk, "  total: ", Object.keys(coredata.chunks).length)
    }
  }
};

function Collission(location, width, height, callback){
  var CollissionResults = [];
  var collide = false;
  var playersHaveBeenRun = false;
  collideableParts = chunkParts.concat(["colliders", "players"])
  for (var chunk in coredata.chunks){
    getDist(location, chunk, function(result){
      if (Math.abs(result[1]) < (64 + (width/2)) && Math.abs(result[2]) < (64 + (height/2))){
        for (var part in collideableParts){
          if (collideableParts[part] == "players" && playersHaveBeenRun !== true){var db = coredata[collideableParts[part]]; playersHaveBeenRun = true; chunk = "none"} else {var db = coredata.chunks[chunk][collideableParts[part]]};
          for (var item in db){
            var xo = db[item].pos.split('.')[0];
            var yo = db[item].pos.split('.')[1];
            var xl = location.split('.')[0];
            var yl = location.split('.')[1];
            var distx = xl - xo;
            var disty = yl - yo;
            if (Math.abs(distx) < (width + db[item].w)/2 && Math.abs(disty) < (height + db[item].h)/2){
              collide = true;
              CollissionResults.push([item, chunk, collideableParts[part]]);
            }
          }
        }
      }
    });
  }
  callback([collide, CollissionResults])
};


function StateController(){
  stateParts = chunkParts.concat(["attacks"])
  for (var player in coredata.players){
    var db = coredata.players;
    if (db[player].state > 0){
      db[player].state -= 1;
    }
    if (db[player].state == 60){
      db[player].state = 63
    }
    if (db[player].state % 10 == 0){
      db[player].state = 0;
    }
  }
  for (var chunk in coredata.chunks){
    for (var part in stateParts){
      var db = coredata.chunks[chunk][stateParts[part]]
      for(var item in db){
        if (db[item].state > 0){
          db[item].state -= 1;
        }
        if (db[item].state == 60){
          db[item].state = 63
        }
        if (db[item].state % 10 == 0){
          db[item].state = 0;
        }
      }
    }
  }
}

// All the goods in one. probably needs to be tuned. but should be fast enough.
function getDist(origin, destination, callback) {
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
  callback([trueDist, distx, disty, xdir, ydir, greaterDir]);
};

function ProcessMovements(){
  for (var inst in moveQueue){
    if (coredata.players.hasOwnProperty(moveQueue[inst][0]) && coredata.players[moveQueue[inst][0]].state < 10){
      if(moveQueue[inst][1] != null){
        DoMovement(moveQueue[inst][0], "none",moveQueue[inst][1], 2);
      };
    }
  }
};

function DoMovement(name, chunk, dir, rate, ignoreCollision, maintainFacingDirection) {
  //if (rate == 6){faceDir = false}
  //Only objects with a letter before thier id can be moved
  if (ignoreCollision == null){ignoreCollision = false};
  if (maintainFacingDirection == null){maintainFacingDirection = true};
  var db, nameType
  switch(name[0]){
    case "n":
      nameType = "npcs"
      break;
    case "p":
      nameType = "players"
      break;
    case "e":
      nameType = "entities"
      break;
  }
  if (nameType == null){
    nameType = "attacks"
  }
  // Chunk with none is a player, all other moveable objects belong to a chunk.
  if (chunk == "none"){ db = coredata } else { db = coredata.chunks[chunk]}

  if (db[nameType][name].state == 0){db[nameType][name].state = 3}
  if (dir == "2"){
    var x = parseInt(db[nameType][name].pos.split(".")[0])
    var y = parseInt(db[nameType][name].pos.split(".")[1]) - rate
    cellname = ''+x+'.'+y+''
  };
  if (dir == "6"){
    var x = parseInt(db[nameType][name].pos.split(".")[0])
    var y = parseInt(db[nameType][name].pos.split(".")[1]) + rate
    cellname = ''+x+'.'+y+''
  };
  if (dir == "8"){
    var x = parseInt(db[nameType][name].pos.split(".")[0]) - rate
    var y = parseInt(db[nameType][name].pos.split(".")[1])
    cellname = ''+x+'.'+y+''
  };
  if (dir == "4"){
    var x = parseInt(db[nameType][name].pos.split(".")[0]) + rate
    var y = parseInt(db[nameType][name].pos.split(".")[1])
    cellname = ''+x+'.'+y+''
  };

  if (maintainFacingDirection == false){
    dir = db[nameType][name].dir;
  };
  if (ignoreCollision == true){
    db[nameType][name].pos = cellname;
    db[nameType][name].dir = dir;
  }
  if (db[nameType][name].state !== "dead" && ignoreCollision == false ){
    Collission(cellname, db[nameType][name].w, db[nameType][name].h, function(result){
      if (result[0] == false){
        db[nameType][name].pos = cellname;
        db[nameType][name].dir = dir;
      } else {
        //if collider is self. ignore collission
        if (result[1].length == 1 && result[1][0][0] == name){
          db[nameType][name].pos = cellname;
          db[nameType][name].dir = dir;
        } else {
          db[nameType][name].dir = dir;
        }
      }
    });
  };

};
