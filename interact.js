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
    var verbage = ["","","Consumed" + coredata.chunks[path[1]][path[2]][path[3]][path[4]],"",""]
    consumable = coredata.chunks[path[1]][path[2]][path[3]][path[4]].split(" ")
    coredata.players[interacter][consumable[1]] += parseInt(consumable[0])
    coredata.chunks[path[1]][path[2]][path[3]][path[4]] = "-";
    var pointers = [null,null,null,null,null]
    listener.sockets.connected[interacter.slice(1)].emit('dialog', ["speech", verbage, pointers]);
    return;
  }
  if (path[0] == "loot"){
    console.log("looting path: " + path)
    path.splice(0,1,"swap")
    var verbage = ["== Your Equipped: ==", coredata.players[interacter].slot1, coredata.players[interacter].slot2, coredata.players[interacter].slot3, "<"]
    var pointers = ["exit",path.concat(["slot1"]),path.concat(["slot2"]),path.concat(["slot3"]),"exit"]
    listener.sockets.connected[interacter.slice(1)].emit('dialog', ["loot", verbage, pointers]);
    return;
  }
  if (path[0] == "swap"){
    console.log("swapping path: " + path)
    //item1
    if (path[1] == "none"){ db1 = coredata } else { db1 = coredata.chunks[path[1]]}
    if (db1[path[2]][path[3]].inventory[path[4]] !== void 0){
      var item1 = db1[path[2]][path[3]].inventory[path[4]].name;
      var item1Quant = db1[path[2]][path[3]].inventory[path[4]].quantity;
    } else {
      //Create actual record for any empty slots
      var item1 = "-"
      var item1Quant = 1
      for (var newi = db1[path[2]][path[3]].inventory.length; newi < 10; newi++){
        db1[path[2]][path[3]].inventory.push({"name": item1, "quantity": item1Quant})
      }
    }
    console.log(item1, item1Quant)
    //item2
    if (path[5] == "none"){ db2 = coredata } else { db2 = coredata.chunks[path[5]]}
    if (db2[path[6]][path[7]].inventory[path[8]] !== void 0){
      var item2 = db2[path[6]][path[7]].inventory[path[8]].name;
      var item2Quant = db2[path[6]][path[7]].inventory[path[8]].quantity;
    } else {
      //Create actual record for empty slots
      var item2 = "-"
      var item2Quant = 1
      for (var newi = db2[path[6]][path[7]].inventory.length; newi < 10; newi++){
        db2[path[6]][path[7]].inventory.push({"name": item2, "quantity": item2Quant})
      }
    }
    console.log(db2[path[6]][path[7]].inventory, path[8])

    if (item1 == item2 && item1 !== "-"){
      if (path[3] == path[7] && path[4] == path[8]){console.log("Cannot Swap same item")} else {
        db1[path[2]][path[3]].inventory[path[4]].name = "-"
        db1[path[2]][path[3]].inventory[path[4]].quantity = 1
        db2[path[6]][path[7]].inventory[path[8]].quantity += item1Quant
      }
    } else if (item2 == "-" && item1Quant > 1){
      db2[path[6]][path[7]].inventory[path[8]].name = item1
      db2[path[6]][path[7]].inventory[path[8]].quantity = 1
      db1[path[2]][path[3]].inventory[path[4]].quantity -= 1
    } else {
      //SwapItem1
      db1[path[2]][path[3]].inventory[path[4]].name = item2
      db1[path[2]][path[3]].inventory[path[4]].quantity = item2Quant

      //SwapItem2
      db2[path[6]][path[7]].inventory[path[8]].name = item1
      db2[path[6]][path[7]].inventory[path[8]].quantity = item1Quant
    }
    //Go to start
    startDialog(interacter)
    return;
  }
  var verbageOptions = globals.dialogdb[path[0]][path[1]].textVariations.length - 1;
  var verbage = globals.dialogdb[path[0]][path[1]].textVariations[Math.round(Math.random() * verbageOptions)];
  var pointers = globals.dialogdb[path[0]][path[1]].pointers;
  listener.sockets.connected[interacter.slice(1)].emit('dialog', ["speech", verbage, pointers]);
}

function showLoot(interacter, name, chunk, nameType){
  db = coredata.chunks[chunk]
  var verbage = []
  var thing = db[nameType][name];
  var person = coredata.players[interacter];
  var pointers = []
  //console.log(thing,Object.keys(thing.inventory).length)
  for (var i = 0; i < thing.inventory.length; i++){
    var weapon =  globals.weaponData[thing.inventory[i].name]
    verbage.push([thing.inventory[i].name, thing.inventory[i].quantity, weapon.sprite, weapon.description])
    pointers.push([chunk,nameType,name,i])
  }
  for (var i = verbage.length; i < 10; i++){
    verbage.push(["-","1","10.8.1.0.0","Empty"])
    pointers.push([chunk,nameType,name,i])
  }
  for (var i = 0; i < person.inventory.length; i++){
    var weapon =  globals.weaponData[person.inventory[i].name]
    verbage.push([person.inventory[i].name, person.inventory[i].quantity, weapon.sprite, weapon.description])
    pointers.push(["none","players",interacter,i])
  }
  for (var i = verbage.length; i < 20; i++){
    verbage.push(["-","1","10.8.1.0.0","Empty"])
    pointers.push(["none","players",interacter,i - 10])
  }
  listener.sockets.connected[interacter.slice(1)].emit('dialog', ["loot", verbage, pointers]);
  //console.log(verbage)
}

function showGrave(interacter, name, chunk, nameType){
  var verbage = ["You have bound","yourself to this grave.",". . . ","You will respawn here","If you die."]
  var pointers = ["exit"];
  listener.sockets.connected[interacter.slice(1)].emit('dialog', ["speech", verbage, pointers]);
  db[nameType][name].state = 67;
  coredata.players[interacter].health = coredata.players[interacter].maxHealth;
  var newpos = db[nameType][name].pos.split(".")[0] + "." + (parseInt(db[nameType][name].pos.split(".")[1]) + 6);
  coredata.players[interacter].origin = newpos;
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
      var name = result[1][hit][0]
      var chunk = result[1][hit][1]
      var nameType = result[1][hit][2]
      if (chunk == "none"){ continue } else { db = coredata.chunks[chunk]}
      if (nameType == "colliders"){continue;};
      if (db[nameType][name].hasOwnProperty("singleMessage")){ getDialog(interacter, [db[nameType][name].properName, db[nameType][name].singleMessage]) };
      if (nameType == "entities" && db[nameType][name].hasOwnProperty("grave")){
        showGrave(interacter, name, chunk, nameType)
        break;
      }
      if (nameType == "entities" && db[nameType][name].slot1 != null){
        if (db[nameType][name].state < 60){db[nameType][name].state = 67}
        showLoot(interacter, name, chunk, nameType)
        break;
      } else if (nameType == "entities"){ console.log("nothing to interact with");continue;};
      if (db[nameType][name].state >= 60 ){
        showLoot(interacter, name, chunk, nameType)
        break;
      }
      if (db[nameType][name].hasOwnProperty("team")){
        if (db[nameType][name].hasOwnProperty("properName")){
          getDialog(interacter, [db[nameType][name].properName, "start"])
          console.log("GetSpeachWith", name, db[nameType][name].properName)
        } else if (db[nameType][name].team == interacterTeam) {
          getDialog(interacter, ["TeamStandard", "start"])
          console.log("GetSpeachWith", name)
        }else{
          getDialog(interacter, ["NonTeamStandard", "start"])
          console.log("GetSpeachWith", name)
        }
      };
    };
  });
};
