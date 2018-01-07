globals = require('./globals.js');
general = require('./general.js');
coredata = globals.coredata;
collmap = globals.collmap;
mapchange = globals.mapchange;
attackQueue = globals.attackQueue;

///// Exports ///////////////////////////
module.exports = {
  startDialog: function (interacter) {
    startDialog(interacter);
  },
  getDialog: function (interacter, path) {
    getDialog(interacter, path);
  }
};

function getDialog(interacter, path){
  if (path[0] == "consumable"){
    console.log("consumable path: " + path)
    var verbage = ["== Your Equipped: ==", coredata.players[interacter].slot1, coredata.players[interacter].slot2, coredata.players[interacter].slot3, "<"]
    var pointers = [null,null,null,null,null]
    listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);
    return;
  }
  if (path[0] == "loot"){
    console.log("looting path: " + path)
    path.splice(0,1,"swap")
    var verbage = ["== Your Equipped: ==", coredata.players[interacter].slot1, coredata.players[interacter].slot2, coredata.players[interacter].slot3, "<"]
    var pointers = ["exit",path.concat(["slot1"]),path.concat(["slot2"]),path.concat(["slot3"]),"exit"]
    listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);
    return;
  }
  if (path[0] == "swap"){
    console.log("swapping path: " + path)
    var curItem = coredata.players[interacter][path[5]];
    coredata.players[interacter][path[5]] = coredata.chunks[path[1]][path[2]][path[3]][path[4]]
    coredata.chunks[path[1]][path[2]][path[3]][path[4]] = curItem
    var verbage = ["","Your " + curItem, "has been replaced with", coredata.players[interacter][path[5]], ""]
    var pointers = [null,null,null,null,null]
    listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);
    return;
  }
  var verbageOptions = globals.dialogdb[path[0]][path[1]].textVariations.length - 1;
  var verbage = globals.dialogdb[path[0]][path[1]].textVariations[Math.round(Math.random() * verbageOptions)];
  var pointers = globals.dialogdb[path[0]][path[1]].pointers;
  listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);
}


function startDialog(interacter){
  var distance = 4;
  var player = coredata.players[interacter]
  var interacterTeam = player.team;
  var direction = player.dir;
  var atpos = player.pos.split(".");
  var at
  switch(direction){
    case "2":
      atpos[1] = parseInt(atpos[1]) - distance
      at = {"h": 6, "w": 6}
      break;
    case "6":
      atpos[1] = parseInt(atpos[1]) + distance
      at = {"h": 6, "w": 6}
      break;
    case "4":
      at = {"h": 6, "w": 6}
      atpos[0] = parseInt(atpos[0]) + distance
      break;
    case "8":
      atpos[0] = parseInt(atpos[0]) - distance
      at = {"h": 6, "w": 6}
      break;
  }
  atpos = atpos.join(".");
  general.Collission(atpos, at.w, at.h, function(result){
    for (hit in result[1]){
      console.log(result[1][hit])
      var name = result[1][hit][0]
      var chunk = result[1][hit][1]
      var nameType = result[1][hit][2]
      if (chunk == "none"){ continue } else { db = coredata.chunks[chunk]}
      if (nameType == "colliders"){continue;};
      if (nameType == "entities" && db[nameType][name].hasOwnProperty("grave")){
        var verbage = ["You have bound","yourself to this grave.",". . . ","You will respawn here","If you die."]
        var pointers = ["exit"];
        listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);
        db[nameType][name].state = 67;
        coredata.players[interacter].health = coredata.players[interacter].maxHealth;
        var newpos = db[nameType][name].pos.split(".")[0] + "." + (parseInt(db[nameType][name].pos.split(".")[1]) + 6);
        coredata.players[interacter].origin = newpos;
        break;
      }
      if (nameType == "entities" && db[nameType][name].slot1 != null){
        if (db[nameType][name].state < 60){db[nameType][name].state = 67}
        var verbage = ["== Chest ==", db[nameType][name].slot1, db[nameType][name].slot2, db[nameType][name].slot3, "<"]
        var thing = db[nameType][name];
        if (thing.slot1.indexOf("mana") !== -1 || thing.slot1.indexOf("health") !== -1 || thing.slot1.indexOf("gold") !== -1){var loot1 = "consumable"}else{var loot1 = "loot"}
        if (thing.slot2.indexOf("mana") !== -1 || thing.slot2.indexOf("health") !== -1 || thing.slot2.indexOf("gold") !== -1){var loot2 = "consumable"}else{var loot2 = "loot"}
        if (thing.slot3.indexOf("mana") !== -1 || thing.slot3.indexOf("health") !== -1 || thing.slot3.indexOf("gold") !== -1){var loot3 = "consumable"}else{var loot3 = "loot"}
        var pointers = ["exit",[loot1, chunk, nameType, name, "slot1"],[loot2, chunk, nameType, name, "slot2"],[loot3, chunk, nameType, name, "slot3"],"exit"]
        listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);
        break;
      } else if (nameType == "entities"){ console.log("nothing to interact with");continue;};
      if (db[nameType][name].state >= 60 ){
        var verbage = ["== " + name +"'s Corpse ==", db[nameType][name].slot1, db[nameType][name].slot2, db[nameType][name].slot3, "<"]
        var thing = db[nameType][name];
        if (thing.slot1.indexOf("mana") !== -1 || thing.slot1.indexOf("health") !== -1 || thing.slot1.indexOf("gold") !== -1){var loot1 = "consumable"}else{var loot1 = "loot"}
        if (thing.slot2.indexOf("mana") !== -1 || thing.slot2.indexOf("health") !== -1 || thing.slot2.indexOf("gold") !== -1){var loot2 = "consumable"}else{var loot2 = "loot"}
        if (thing.slot3.indexOf("mana") !== -1 || thing.slot3.indexOf("health") !== -1 || thing.slot3.indexOf("gold") !== -1){var loot3 = "consumable"}else{var loot3 = "loot"}
        var pointers = ["exit",[loot1, chunk, nameType, name, "slot1"],[loot2, chunk, nameType, name, "slot2"],[loot3, chunk, nameType, name, "slot3"],"exit"]
        listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);
        break;
      }
      if (db[nameType][name].hasOwnProperty("team")){ if (db[nameType][name].team == interacterTeam) {
        getDialog(interacter, ["TeamStandard", "start"])
        console.log("WHT", name)
      } else {
        getDialog(interacter, ["NonTeamStandard", "start"])
        console.log("WHT", name)
      }};

    };
  });
};
