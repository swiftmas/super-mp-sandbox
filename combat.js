globals = require('./globals.js');
general = require('./general.js');
coredata = globals.coredata;
collmap = globals.collmap;
mapchange = globals.mapchange;
attackQueue = globals.attackQueue;
activeAttacksQueue = globals.activeAttacksQueue;


///// Exports ///////////////////////////
module.exports = {
  addEffect: function (attacker, chunk, attacktype) {
    addEffect(attacker, chunk, attacktype);
  },
  processEffects: function () {
    processEffects();
  },
  processAttackQueue: function () {
    processAttackQueue();
  },
};


/// Gets attacks from queue (players only) and makes them happen
function processAttackQueue(){
  for (var inst in attackQueue){
    if (activeAttacksQueue.hasOwnProperty(inst)){
      var data = activeAttacksQueue[inst];
      data.inputtype = attackQueue[inst];
    } else if (attackQueue[inst] != null && coredata.players[inst].state < 10){
      activeAttacksQueue[inst] = {"inputtype": attackQueue[inst], "attacktype": attackQueue[inst], "chunk": "none", "keydown": 0};
    } else if (coredata.players[inst].state > 60){coredata.players[inst].pos = coredata.players[inst].origin; coredata.players[inst].state = 0; coredata.players[inst].health = 100; return; };
    delete attackQueue[inst];
  }
  processActiveAttacks();
};

function processActiveAttacks(){
  for (var inst in activeAttacksQueue){
    var attackData = activeAttacksQueue[inst]
    // Cleanup Data Model
    var db, nameType;
    switch(inst[0]){
      case "n":
        nameType = "npcs"
        // unfortunate fix for moving npcs out of a chunk in the middle of a tick when i need to refernce thier position The top if moves on if the player died and the open chunk was closed, the second if simply looks for the npc in a closeby chunk if he is no longer at his home chunk.
        if (coredata.chunks.hasOwnProperty(attackData.chunk)){
          if ( !(coredata.chunks[attackData.chunk].npcs.hasOwnProperty(inst))){
            for (chunk in coredata.chunks){
              if (coredata.chunks[chunk].npcs.hasOwnProperty(inst)){
                attackData.chunk = chunk;
              }
            }
          }
        } else { console.log("Chunk of attacking NPC was lost, removing attacks"); delete activeAttacksQueue[inst]; continue;}
        db = coredata.chunks[attackData.chunk]
        break;
      case "p":
        nameType = "players"
        db = coredata
        attackData.chunk = db[nameType][inst].closeChunks[0]
        break;
      case "e":
        nameType = "entities"
        db = coredata.chunks[attackData.chunk]
        break;
    }
    // SET at as the variable for either players or other data types
    var at = db[nameType];
    console.log(inst, attackData.chunk, attackData.attacktype, attackData.keydown, attackData.chargeHardMaximum, " from ", attackData.chargeMinimum)


    // if this is new then we setup the data
    if (Object.keys(activeAttacksQueue[inst]).length == 4 ){
      // Get weapon attack data based on slot.
      switch(attackData.attacktype){
        //merges attack data from weapon to attack data object
        case "attack1":
          for (var k in globals.weaponData[at[inst].slot1]) attackData[k] = globals.weaponData[at[inst].slot1][k];
          break;
        case "attack2":
          for (var k in globals.weaponData[at[inst].slot2]) attackData[k] = globals.weaponData[at[inst].slot2][k];
          break;
        case "attack3":
          for (var k in globals.weaponData[at[inst].slot3]) attackData[k] = globals.weaponData[at[inst].slot3][k];
          break;
      };
      if (inst[0] == "n" ){attackData.chargeHardMaximum = attackData.chargeMinimum};
    } else {
      attackData.keydown ++
    };
      // IF CHARGE OVER or attack is instant
    var ChargeSufficientForRelease = false
    if (attackData.charged && attackData.attacktype != attackData.inputtype && attackData.chargeMinimum <= attackData.keydown){
      ChargeSufficientForRelease = true;
    } else if (attackData.charged && attackData.chargeMinimum > attackData.keydown && attackData.attacktype != attackData.inputtype){
      delete activeAttacksQueue[inst];
    }
    if (attackData.keydown == attackData.chargeHardMaximum || ChargeSufficientForRelease || attackData.charged == false){
      //GET ATTaCK DIRECTION
      var distance = attackData.releaseOffset;
      var atdir = at[inst].dir;
      var atorig = at[inst].pos.split(".");
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
      var situationalData = new Object()
      situationalData.pos = atpos
      situationalData.dir = atdir
      situationalData.owner = inst
      situationalData.chunk = attackData.chunk
      situationalData.damage = attackData.releaseDamage
      situationalData.state =  attackData.releaseState
      situationalData.startState = attackData.releaseState
      situationalData.stateWdamage = attackData.releaseDamageAtState
      situationalData.type = attackData.releaseType
      situationalData.h =  attackData.rh
      situationalData.w = attackData.rw
      situationalData.pushback = attackData.releasePushback
      if (attackData.projectile){
      situationalData.projectile = attackData.projectile
      situationalData.state = attackData.projectileState
      situationalData.startState = attackData.projectileState
      situationalData.distance = attackData.projectileDistance
      situationalData.type = attackData.projectileType
      situationalData.velocity = attackData.projectileVelocity
      };
      coredata.chunks[attackData.chunk].attacks.push(situationalData);
      at[inst].state = attackData.releaseOwnerState

      delete activeAttacksQueue[inst];
    } else { // if charge is still ongoing
      /////////// CHARGE //////////////////////////

      if ( attackData.keydown == 0 || attackData.keydown % 3 === 0){
        var distance = attackData.releaseOffset;
        var atdir = at[inst].dir;
        var atorig = at[inst].pos.split(".");
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
        var situationalData = new Object()
        situationalData.pos = atpos
        situationalData.dir = atdir
        situationalData.owner = inst
        situationalData.chunk = attackData.chunk
        situationalData.damage = attackData.chargeDamage
        situationalData.state =  attackData.chargeState
        situationalData.startState = attackData.chargeState
        situationalData.stateWdamage = attackData.releaseDamageAtState
        situationalData.type = attackData.chargeType
        situationalData.h = attackData.rh
        situationalData.w = attackData.rw
        situationalData.pushback = attackData.releasePushback
        coredata.chunks[attackData.chunk].attacks.push(situationalData);
        at[inst].state = attackData.chargeOwnerState // setting player state due to attack
      }
    };
     // This is where we add the else for if its not a new queue item :)
  }
}


// This is the processing section. All attacks are placed in coredata. this allows for attacks to have timeouts that are not tied to the player. this is to handle animations and damageOverTime affects.
function processEffects(){
  for (var chunk in coredata.chunks){
    var db = coredata.chunks[chunk].attacks;
    var removes = [];
    for (var attack = db.length -1; attack >= 0; attack--){
      if (db[attack].projectile){
        if (db[attack].state <= 0){ db[attack].state = db[attack].startState};
        dodamage(db[attack], db[attack].pos, db[attack].owner, db[attack].chunk, db[attack].dir, db[attack].damage, db[attack].h, db[attack].w, false, db[attack].pushback);
        if (db[attack].distance > 0){
          db[attack].distance -= 1; general.DoMovement(attack, db[attack].chunk, db[attack].dir, db[attack].velocity, true, db[attack].pushback)
        } else {
           removes.push(attack); break
        };
      }
      if (db[attack].state <= 0){ removes.push(attack); break};

      if (db[attack].state == db[attack].stateWdamage || db[attack].stateWdamage == -1){
        dodamage(db[attack], db[attack].pos, db[attack].owner, db[attack].chunk, db[attack].dir, db[attack].damage, db[attack].h, db[attack].w, false, db[attack].pushback);
      }
    };
    for (var rem in removes){
      db.splice(rem, 1)
    };
  }
};


function dodamage(attack, atpos, owner, chunk, direction, damage, h, w, friendlyFire, pushback){
  console.log(owner, "attacked at: ", atpos, "for: ", damage, "damage")
  var ownerTeam
  if(owner[0] == "p"){ ownerTeam = coredata.players[owner].team} else if (owner[0] == "n"){ ownerTeam = coredata.chunks[chunk].npcs[owner].team} else {ownerTeam = null}
  if (damage == null){damage = 25;};
  var at
  switch (direction){
    case "2":
    case "6":
      at = {"h": w, "w": h}
      break;
    case "4":
    case "8":
      at = {"h": h, "w": w}
      break;
  }
  general.Collission(atpos, at.w, at.h, function(result){
    for (hit in result[1]){
      var name = result[1][hit][0]
      var chunk = result[1][hit][1]
      var nameType = result[1][hit][2]
      if (chunk == "none"){ db = coredata } else { db = coredata.chunks[chunk]}
      if (nameType == "colliders"){break;};
      if (db[nameType][name].hasOwnProperty("team")){ if (db[nameType][name].team == ownerTeam) {break;}};
      db[nameType][name].health = db[nameType][name].health - damage
      if (activeAttacksQueue.hasOwnProperty(name) && activeAttacksQueue[name].interruptible){
        delete activeAttacksQueue[name];
      }
      if (db[nameType][name].health > 0 && owner[0] == "p"){
        if(owner[0] == "p"){ ownerTeam = coredata.players[owner].alerttimer += 10} else if (owner[0] == "n"){ ownerTeam = coredata.chunks[chunk].npcs[owner].alerttimer += 10}
      }

      attack.distance = 0;
      general.DoMovement(name, chunk, direction, pushback, false, false);
      if (db[nameType][name].health <= 0){
        db[nameType][name].state = 63;
        if (activeAttacksQueue.hasOwnProperty(name)){
          delete activeAttacksQueue[name];
        }
      };
    };
  });
};
