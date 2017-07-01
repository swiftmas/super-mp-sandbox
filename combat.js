globals = require('./globals.js');
general = require('./general.js');
coredata = globals.coredata;
collmap = globals.collmap;
mapchange = globals.mapchange;
attackQueue = globals.attackQueue;

///// Exports ///////////////////////////
module.exports = {
  attack: function (attacker, dir) {
    attack(attacker, dir);
  },
  processAttacks: function () {
    processAttacks();
  },
  processAttackQueue: function () {
    processAttackQueue();
  },
};



function processAttackQueue(){
  for (var inst in attackQueue){
    attack(attackQueue[inst][0], "none")
    delete attackQueue[inst];
  }
};

function processAttacks(){
  for (var chunk in coredata.chunks){
    var db = coredata.chunks[chunk].attacks;
    var removes = [];
    for (var attack = db.length -1; attack >= 0; attack--){
      //console.log(JSON.stringify(db[attack]));
      if (db[attack].state <= 0){ removes.push(attack); break};

      if (db[attack].state == 3){
        dodamage(db[attack].pos, db[attack].owner, db[attack].chunk, db[attack].dir, false);
      }
    };
    for (var rem in removes){
      db.splice(rem, 1)
    };
  }
};

function attack(attacker, chunk){
    // second argument, npc or player is the attribute of the attacker, not whats being attacked.
    var distance = 5
    var db, nameType
    switch(attacker[0]){
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
    //added more distane to npcs attack as it did not equal that of the player for some reason.
    if (chunk == "none"){db = coredata; chunk = db[nameType][attacker].closeChunks[0]} else { db = coredata.chunks[chunk]; distance = 6 }

    var at = db[nameType];
    if (at[attacker].state > 60){at[attacker].pos = at[attacker].origin; at[attacker].state = 0; at[attacker].health = 100; return; };
    //coredata.attacks["a" + attacker] = at[attacker].pos;
    var atdir = at[attacker].dir;
    var atorig = at[attacker].pos.split(".");
    var atpos = "";
    if (atdir == "2"){
    	var nx = parseInt(atorig[0])
    	var ny = parseInt(atorig[1]) - distance
    	atpos = nx + "." + ny
    } else if (atdir == "6") {
		  var nx = parseInt(atorig[0])
    	var ny = parseInt(atorig[1]) + distance
    	atpos = nx + "." + ny
    } else if (atdir == "8") {
    	var nx = parseInt(atorig[0]) - distance
    	var ny = parseInt(atorig[1])
    	atpos = nx + "." + ny
    } else if (atdir == "4") {
    	var nx = parseInt(atorig[0]) + distance
    	var ny = parseInt(atorig[1])
    	atpos = nx + "." + ny
    };
    if (at[attacker].state < 10) {
      coredata.chunks[chunk].attacks.push({"pos": atpos, "dir": atdir, "state": "3", "owner": attacker, "chunk": chunk, "type": "5"});
      at[attacker].state = 13
      console.log(attacker + " placed attack");

    };

};

function dodamage(atpos, owner, chunk, direction, friendlyFire){
  var ownerTeam
  if(owner[0] == "p"){ ownerTeam = coredata.players[owner].team} else if (owner[0] == "n"){ ownerTeam = coredata.chunks[chunk].npcs[owner].team} else {ownerTeam = null}
  var damage = 25;
  var at
  switch (direction){
    case "2":
    case "6":
      at = {"h": 3, "w": 6}
      break;
    case "4":
    case "8":
      at = {"h": 6, "w": 3}
      break;
  }
  console.log(direction)
  general.Collission(atpos, at.w, at.h, function(result){
    for (hit in result[1]){
      var name = result[1][hit][0]
      var chunk = result[1][hit][1]
      var nameType = result[1][hit][2]
      if (chunk == "none"){ db = coredata } else { db = coredata.chunks[chunk]}
      if (nameType == "colliders"){break;};
      if (db[nameType][name].hasOwnProperty("team")){ if (db[nameType][name].team == ownerTeam) {break;}};
      db[nameType][name].health = db[nameType][name].health - damage
      general.DoMovement(name, chunk, direction, 6);
      if (db[nameType][name].health <= 0){
        db[nameType][name].state = 63;

      };
    };
  });
};
