globals = require('./globals.js');
general = require('./general.js');
coredata = globals.coredata;
collmap = globals.collmap;
mapchange = globals.mapchange;
attackQueue = globals.attackQueue;

///// Exports ///////////////////////////
module.exports = {
  attack: function (attacker, chunk, attacktype) {
    attack(attacker, chunk, attacktype);
  },
  processAttacks: function () {
    processAttacks();
  },
  processAttackQueue: function () {
    processAttackQueue();
  },
};


/// Gets attacks from queue (players only) and makes them happen
function processAttackQueue(){
  for (var inst in attackQueue){
    attack(inst, "none", attackQueue[inst])
    delete attackQueue[inst];
  }
};
// This is the processing section. All attacks are placed in coredate. this allows for attacks to have timeouts that are not tied to the player. this is to handle animations and damageOverTime affects.
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

function attack(attacker, chunk, attacktype){
    console.log(attacker, chunk, attacktype)
    // Cleanup Data Model
    var distance = 6
    var db, nameType, attackData;
    switch(attacker[0]){
      case "n":
        nameType = "npcs"
        db = coredata.chunks[chunk]
        break;
      case "p":
        nameType = "players"
        db = coredata
        chunk = db[nameType][attacker].closeChunks[0]
        break;
      case "e":
        nameType = "entities"
        db = coredata.chunks[chunk]
        break;
    }
    // SET at as the variable for either players or other data types
    var at = db[nameType];
    // RESET PLAYER TO START POSITION IF HE IS DEAD
    if (at[attacker].state > 60){at[attacker].pos = at[attacker].origin; at[attacker].state = 0; at[attacker].health = 100; return; };
    // Get weapon attack data based on slot.
    switch(attacktype){
      case "attack1":
        attackData = JSON.parse(JSON.stringify(globals.weaponData[at[attacker].slot1]));
        break;
      case "attack2":
        attackData = globals.weaponData[at[attacker].slot2];
        break;
      case "attack3":
        attackData = globals.weaponData[at[attacker].slot3];
        break;
    };
    //GET ATTaCK DIRECTION
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
      situationalData = {"pos": atpos, "dir": atdir, "owner": attacker, "chunk": chunk}
      for (var attrname in situationalData) { attackData[attrname] = situationalData[attrname]; }
      console.log(attackData)
      coredata.chunks[chunk].attacks.push(attackData);
      at[attacker].state = 13 /// Keep for now but eventaully this will be per weapon.

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
