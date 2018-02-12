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
    } else if (coredata.players[inst].state > 60){coredata.players[inst].pos = coredata.players[inst].origin; coredata.players[inst].state = 0; coredata.players[inst].health = 100; coredata.players[inst].mana = 100; return; };
    delete attackQueue[inst];
  }
  processActiveAttacks();
  //console.warn("Attacks")
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


    // if this is new then we setup the data
    if (Object.keys(activeAttacksQueue[inst]).length == 4 ){
      //console.log(inst, "Attacks with: ", attackData)
      // Get weapon attack data based on slot.
      switch(attackData.attacktype){
        //merges attack data from weapon to attack data object
        case "attack0":
          for (var k in globals.weaponData[at[inst].slot0]) attackData[k] = globals.weaponData[at[inst].slot0][k];
          break;
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
      if (attackData.hasOwnProperty("release") == false){
        delete activeAttacksQueue[inst];
        continue;
      }
      if (inst[0] == "n" ){
        attackData.chargeHardMaximum = attackData.chargeMaximum
        attackData.cooldown = attackData.npcCooldown
      };
      var cooldown = at[inst]["slot" + attackData.attacktype[-1]+"cooldown" ]
      if ( typeof cooldown !== "undefined"){
        if (cooldown[0] < globals.dayint || cooldown[1] - attackData.cooldown >= globals.time){
          var nothing = undefined;
        }else{
        delete activeAttacksQueue[inst];
        continue;
        };
      }
    } else {
      attackData.keydown ++
    };
      // IF CHARGE OVER or attack is instant
    var ChargeSufficientForRelease = false
    if (attackData.charged && attackData.attacktype != attackData.inputtype && attackData.chargeMinimum <= attackData.keydown){
      ChargeSufficientForRelease = true;
    } else if (attackData.charged && attackData.chargeMinimum == attackData.chargeHardMaximum && attackData.chargeMinimum > attackData.keydown) {
      ChargeSufficientForRelease = false
    } else if (attackData.charged && attackData.chargeMinimum == attackData.chargeHardMaximum && attackData.chargeMinimum <= attackData.keydown) {
      ChargeSufficientForRelease = true
    } else if (attackData.charged && attackData.chargeMinimum > attackData.keydown && attackData.attacktype != attackData.inputtype){
      console.log("charge hadnt sufficient chill points")
      delete activeAttacksQueue[inst];
    }
    if (attackData.keydown == attackData.chargeHardMaximum || ChargeSufficientForRelease || attackData.charged == false){
      //GET ATTaCK DIRECTION
      if (attackData.charged && attackData.keydown > attackData.chargeMaximum){
        var damage = attackData.releaseDamage + attackData.chargeDamageMultiplier * attackData.chargeMaximum
        var projectileDamage = attackData.projectileDamage + attackData.chargeDamageMultiplier * attackData.chargeMaximum
        var projectileDistance = attackData.projectileDistance + attackData.chargeDistanceMultiplier * attackData.chargeMaximum
      } else {
        var damage = attackData.releaseDamage + attackData.chargeDamageMultiplier * attackData.keydown
        var projectileDamage = attackData.projectileDamage + attackData.chargeDamageMultiplier * attackData.keydown
        var projectileDistance = attackData.projectileDistance + attackData.chargeDistanceMultiplier * attackData.keydown
      };
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
      if (attackData.effectsSelf){
        for (var effect in attackData.releaseEffects){
          at[inst].effects[effect] = attackData.releaseEffects[effect]
        }
      } else {
        situationalData.effects = attackData.chargeEffects
      }
      situationalData.pos = atpos
      situationalData.dir = atdir
      situationalData.owner = inst
      situationalData.chunk = attackData.chunk
      situationalData.damage = damage
      situationalData.state =  attackData.releaseState
      situationalData.startState = attackData.releaseState
      situationalData.stateWdamage = attackData.releaseDamageAtState
      situationalData.type = attackData.releaseType
      situationalData.h =  attackData.rh
      situationalData.w = attackData.rw
      situationalData.pushback = attackData.releasePushback
      if (attackData.release){
        if (at[inst].hasOwnProperty("mana") && at[inst].mana < attackData.releaseManaCost){
          delete activeAttacksQueue[inst];
          situationalData.damage = 0
          situationalData.stateWdamage = 0
          situationalData.type =  attackData.chargeFailType
          situationalData.state =  attackData.chargeFaileState
          situationalData.pushback = 0
          coredata.chunks[attackData.chunk].attacks.push(JSON.parse(JSON.stringify(situationalData)));

          continue;
        } else if (at[inst].hasOwnProperty("mana")){
          at[inst].mana -= attackData.releaseManaCost;
        }
        coredata.chunks[attackData.chunk].attacks.push(JSON.parse(JSON.stringify(situationalData)))
        attackData.release = false;
        at[inst].alerttimer += attackData.releaseAggro
        at[inst].state = attackData.releaseOwnerState
        continue;
      }

      if (attackData.projectile){
      situationalData.projectile = attackData.projectile
      situationalData.state = attackData.projectileState
      situationalData.startState = attackData.projectileState
      situationalData.damage = projectileDamage
      situationalData.distance = projectileDistance
      situationalData.type = attackData.projectileType
      situationalData.velocity = attackData.projectileVelocity
      situationalData.pushback = attackData.projectilePushback
      situationalData.projectileEndAnim = attackData.projectileEndAnim
      coredata.chunks[attackData.chunk].attacks.push(JSON.parse(JSON.stringify(situationalData)));
      delete activeAttacksQueue[inst];
      at[inst]["slot" + attackData.attacktype[-1]+"cooldown"] = [globals.dayint, globals.time];
      continue;

      } else {
      delete activeAttacksQueue[inst];
      at[inst]["slot" + attackData.attacktype[-1]+"cooldown"] = [globals.dayint, globals.time];
      continue;
      };

    } else { // if charge is still ongoing
      /////////// CHARGE //////////////////////////
      if ( attackData.keydown == 0 || attackData.keydown % attackData.chargeAnimLength === 0){
        var distance = attackData.chargeOffset;
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

        if (attackData.effectsSelf){
          for (var effect in attackData.chargeEffects){
            at[inst].effects[effect] = attackData.chargeEffects[effect]
          }
        } else {
          situationalData.effects = attackData.chargeEffects
        }

        situationalData.pos = atpos
        situationalData.dir = atdir
        situationalData.owner = inst
        situationalData.chunk = attackData.chunk
        situationalData.damage = attackData.chargeDamage
        situationalData.startState = attackData.chargeState
        situationalData.stateWdamage = attackData.chargeDamageAtState
        situationalData.state =  attackData.chargeState
        situationalData.type = attackData.chargeType
        if (attackData.keydown >= attackData.chargeMaximum){
          situationalData.state =  attackData.chargeMaximumState
          situationalData.type = attackData.chargeMaximumType
        }
        situationalData.h = attackData.ch
        situationalData.w = attackData.cw
        situationalData.pushback = attackData.releasePushback
        if (at[inst].hasOwnProperty("mana") && at[inst].mana < attackData.chargeManaPerTic){
          console.log("OOM")
          at[inst].mana += attackData.chargeManaPerTic * parseInt(attackData.keydown/attackData.chargeAnimLength)
          delete activeAttacksQueue[inst];
          situationalData.damage = 0
          situationalData.stateWdamage = 0
          situationalData.type =  attackData.chargeFailType
          situationalData.state =  attackData.chargeFaileState
          situationalData.pushback = 0
          coredata.chunks[attackData.chunk].attacks.push(JSON.parse(JSON.stringify(situationalData)));

          continue;
        }
        //ACTUAL EXPORT OF ATTACK
        coredata.chunks[attackData.chunk].attacks.push(JSON.parse(JSON.stringify(situationalData)));

        if (attackData.keydown >= 3 && attackData.chargeOwnerAnimOnce){
            at[inst].state = attackData.chargeOwnerAnimEnd
        } else {
          at[inst].state = attackData.chargeOwnerState
        }
        if (attackData.keydown < attackData.chargeMaximum){at[inst].mana -= attackData.chargeManaPerTic; at[inst].alerttimer += attackData.chargeAggroPerTic}
      }
    };
  }
}


// This is the processing section. All attacks are placed in coredata. this allows for attacks to have timeouts that are not tied to the player. this is to handle animations and damageOverTime affects.
function processEffects(){
  for (var chunk in coredata.chunks){
    var db = coredata.chunks[chunk].attacks;
    var removes = [];
    for (var atk = db.length -1; atk >= 0; atk--){
      if (db[atk].projectile){
        if (db[atk].state <= 0){ db[atk].state = db[atk].startState};
        if (!(db[atk].hasOwnProperty("done"))){
          dodamage(db[atk], db[atk].pos, db[atk].owner, db[atk].chunk, db[atk].dir, db[atk].damage, db[atk].h, db[atk].w, false, db[atk].pushback);
        }
        if (db[atk].distance > 0){
          db[atk].distance -= 1; general.DoMovement(atk, db[atk].chunk, db[atk].dir, db[atk].velocity, true, db[atk].pushback)
          if (db[atk].hasOwnProperty("done")){db[atk].velocity = 0;}
        } else {
           db.splice(atk, 1); continue;
        };
      }
      if (db[atk].state <= 0){ db.splice(atk, 1); continue;};

      if (db[atk].state == db[atk].stateWdamage || db[atk].stateWdamage == -1){
        dodamage(db[atk], db[atk].pos, db[atk].owner, db[atk].chunk, db[atk].dir, db[atk].damage, db[atk].h, db[atk].w, false, db[atk].pushback);
      }
    };
    for (var rem in removes){
      db.splice(rem, 1)
    };
  }
  //console.warn("Effects")

};


function dodamage(attack, atpos, owner, chunk, direction, damage, h, w, friendlyFire, pushback){
  var ownerTeam
  if(owner[0] == "p"){
    ownerTeam = coredata.players[owner].team
  } else if (owner[0] == "n"){
    if (coredata.chunks.hasOwnProperty(chunk)){
      if ( !(coredata.chunks[chunk].npcs.hasOwnProperty(owner))){
        for (otherchunk in coredata.chunks){
          if (coredata.chunks[otherchunk].npcs.hasOwnProperty(owner)){
            chunk = otherchunk;
          }
        }
      }
    } else { console.log("Chunk of attacking NPC was lost, moving on without doing damage"); return;}
    ownerdb = coredata.chunks[chunk].npcs[owner]
    ownerTeam = ownerdb.team
  } else {ownerTeam = null}
  //console.log(owner, " of team: ",ownerTeam, "attacked at: ", atpos, chunk, "for: ", damage, "damage. Projectile:", attack.projectile)
  if (damage == null){damage = 25;};
  var atdim = {"h": h, "w": w}
  switch (direction){
    case "2":
    case "6":
      atdim = {"h": w, "w": h}
      break;
    case "4":
    case "8":
      atdim = {"h": h, "w": w}
      break;
  }
  general.Collission(atpos, atdim.w, atdim.h, function(result){
    for (hit in result[1]){
      var name = result[1][hit][0]
      var chunk = result[1][hit][1]
      var nameType = result[1][hit][2]
      if (chunk == "none"){ db = coredata } else { db = coredata.chunks[chunk]}
      if (nameType == "colliders"){continue;};
      // no team damager unless healing spell
      if (db[nameType][name].hasOwnProperty("team")){ if ( damage < 0){console.log("healing spell")} else if (db[nameType][name].team == ownerTeam) {continue;}};

      // Do damage

      if (owner[0] == "p" && coredata.players[owner].alerttimer == 0 && damage > 0){ damage = damage * 2 }
      if (damage > 0 || db[nameType][name].health < db[nameType][name].maxHealth) {
        db[nameType][name].health = db[nameType][name].health - damage
      }
      if (activeAttacksQueue.hasOwnProperty(name) && activeAttacksQueue[name].interruptible){
        delete activeAttacksQueue[name];
      }
      // Add aggro!
      if (db[nameType][name].health > 0 && owner[0] == "p"){
        if(owner[0] == "p"){ coredata.players[owner].alerttimer += 10} else if (owner[0] == "n"){ coredata.chunks[chunk].npcs[owner].alerttimer += 10}
      }

      // PROJECTIlE ending anim math
      if (attack.hasOwnProperty("projectileEndAnim") && !(attack.hasOwnProperty("done"))){
      attack.distance = 3;
      attack.state = attack.projectileEndAnim;
      attack.velocity = attack.pushback;
      attack.done = true;
      };
      // MOVE the target
      if (db[nameType][name].immoveable == null){
        general.DoMovement(name, chunk, direction, pushback, false, false);
      };
      if (db[nameType][name].health <= 0){
        db[nameType][name].state = 63;
        if (activeAttacksQueue.hasOwnProperty(name)){
          delete activeAttacksQueue[name];
        }
        db[nameType][name].alerttimer = 0;
      	if (name[0] == "p"){
      		listener.sockets.connected[name.slice(1)].emit('serverMessage', {"message": "YOU HAVE DIED|but your soul is restless", "time": globals.time})
      	}
      };
    };
    //console.warn("Combat Is still happen")
  });
};
