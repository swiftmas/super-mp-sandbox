//// SETUP VARS ////////////////////////////

module.exports = {
  ticBegin: function () {
    ticBegin();
  },
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

function ticBegin(){
  // Why not put documentation in the code. that seems like a best practice :(. Currently We process time, resolve all chunks that we need pulled into memory,
  // All chunks are already in memory but we have a subset that we look at as not to loop through all chunks cause that would take forever
  // We then globally tic down the state of every entity npc and player (this includes thier states)
  // We then process npc movement, we do this before player movemnt because it gives the player the opportunity to attack before the npcs. Otherwise npcs can get in range and attack int the same tic
  ProcessTime();
  ProcessChunks();
  StateController();
  npcs.npccontroller();
  ProcessMovements();
  combat.processAttackQueue();
  combat.processEffects();

  /////We then send out the sprite info per player in the form of decimal deliniated numbers //////////
  var playerDatas = [];
  //PLAYERS
  var dp = coredata.players;
  for ( var player in dp){
    var code = dp[player].team;
    var pos = dp[player].pos;
    var state = dp[player].state;
    var dir = dp[player].dir
    //We export the players camera location, this is a semi non priority as the players will update as needed. This also holds mana data health and cooldowns for now
    listener.sockets.connected[player.slice(1)].emit('camera', [dp[player].pos, dp[player].health,dp[player].maxHealth,dp[player].mana,dp[player].maxMana],dp[player].slot1, dp[player].slot2, dp[player].slot3)
    playerDatas.push(code + "." + dir + "." + state + "." + pos);
  }

  for (var player in coredata.players){
    var datas = [];
    for (var chunk in coredata.players[player].closeChunks){
      //NPCS
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
}

function ProcessTime(){
  globals.time -= 1
  if (globals.time == 3000){
    console.log("Night has fallen. The darkness chills you");
    globals.serverMessage = "NIGHT HAS FALLEN | The darkness chills you"
    listener.sockets.emit('serverMessage', {"message": globals.serverMessage, "time": globals.time})
  }
  if (globals.time == 0){
    console.log("Day " + globals.dayint +" has broken. the light blesses you");
    globals.dayint += 1;
    globals.time = 6000;
    globals.serverMessage = "DAY " + globals.dayint +" HAS BROKEN | the light blesses you"
    listener.sockets.emit('serverMessage', {"message": globals.serverMessage, "time": globals.time})
  }
}

function ProcessChunks(){
  var CurrentChunksInTick = []
  for (var player in coredata.players) {
      coredata.players[player].closeChunks = [];
      //Doing math to get surrounding chunk names rather than loop through all chunks, cause no body got time for that.
      var ppos = coredata.players[player].pos.split(".")
      var currentChunk = [(parseInt(ppos[0]/128)*128)+64,(parseInt(ppos[1]/128)*128)+64]
      var chunkBelow=[(parseInt(ppos[0]/128)*128)+64,(parseInt(ppos[1]/128)*128) - 64]
      var chunkAbove=[(parseInt(ppos[0]/128)*128)+64,(parseInt(ppos[1]/128)*128) + 192]
      var centerChunks=[currentChunk, chunkAbove, chunkBelow]
      var surroundingChunks = []
      for (var c = 0; c < centerChunks.length; c++){
        var cc = centerChunks[c]
        surroundingChunks[cc[0]+"."+cc[1]]={}
        surroundingChunks[cc[0]-128+"."+cc[1]]={}
        surroundingChunks[cc[0]+128+"."+cc[1]]={}
      }
      for (var chunk in surroundingChunks){
        getDist(coredata.players[player].pos, chunk, function(result) {
          if (Math.abs(result[1]) < 110 && Math.abs(result[2]) < 110){
            coredata.players[player].closeChunks.push(chunk);
            CurrentChunksInTick.push(chunk);
            if (! coredata.chunks.hasOwnProperty(chunk)){
              if (typeof globals.chunkdata[chunk].lastClosed !== undefined && globals.chunkdata[chunk].lastClosed < globals.dayint - 2){
                var resetChunkdata = JSON.parse(fs.readFileSync("./daychunks.json"))
                console.log("chunk refreshed from file after timout of 2 days")
                for (var k in resetChunkdata[chunk]) globals.chunkdata[chunk][k] =resetChunkdata[chunk][k];
                delete resetChunkdata;
              }
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
      globals.chunkdata[chunk].lastClosed = globals.dayint;
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
      if (Math.abs(result[1]) < (128 + (width/2)) && Math.abs(result[2]) < (128 + (height/2))){
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
    if (db[player].hasOwnProperty("effects")){
      for (var effect in db[player].effects){
        if (db[player].effects[effect] > 0){
          db[player].effects[effect] -= 1
        } else {
          delete db[player].effects[effect]
        };
      }
    };
    if (db[player].hasOwnProperty("alerttimer")){
      if (db[player].alerttimer > 0){
        db[player].alerttimer -= 1
      }
    };
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
        if (db[item].hasOwnProperty("effects")){
          for (var effect in db[item].effects){
            if (db[item].effects[effect] > 0){
              db[item].effects[effect] -= 1
            } else {
              delete db[item].effects[effect]
            }
          }
        };
        if (db[item].hasOwnProperty("alerttimer")){
          if (db[item].alerttimer > 0){
            db[item].alerttimer -= 1
          }
        };
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
