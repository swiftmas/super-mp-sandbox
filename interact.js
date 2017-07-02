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
  verbageOptions = globals.dialogdb[path[0]][path[1]].textVariations.length - 1;
  verbage = globals.dialogdb[path[0]][path[1]].textVariations[Math.round(Math.random() * verbageOptions)];
  pointers = globals.dialogdb[path[0]][path[1]].pointers;
  listener.sockets.connected[interacter.slice(1)].emit('dialog', [verbage, pointers]);

}

function startDialog(interacter){
  var distance = 6;
  var player = coredata.players[interacter]
  var interacterTeam = player.team;
  var direction = player.dir;
  var atpos = player.pos.split(".");
  var at
  switch(direction){
    case "2":
      atpos[1] = parseInt(atpos[1]) - distance
      at = {"h": 6, "w": 3}
      break;
    case "6":
      atpos[1] = parseInt(atpos[1]) + distance
      at = {"h": 6, "w": 3}
      break;
    case "4":
      at = {"h": 3, "w": 6}
      atpos[0] = parseInt(atpos[0]) + distance
      break;
    case "8":
      atpos[0] = parseInt(atpos[0]) - distance
      at = {"h": 3, "w": 6}
      break;
  }
  atpos = atpos.join(".");
  general.Collission(atpos, at.w, at.h, function(result){
    for (hit in result[1]){
      var name = result[1][hit][0]
      var chunk = result[1][hit][1]
      var nameType = result[1][hit][2]
      if (chunk == "none"){ break } else { db = coredata.chunks[chunk]}
      if (nameType == "colliders" || nameType == "entities"){break;};
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
