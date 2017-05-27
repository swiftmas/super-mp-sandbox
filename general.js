globals = require('./globals.js');
coredata = globals.coredata;
collmap = globals.collmap;
moveQueue = globals.moveQueue;
mapchange = globals.mapchange;

module.exports = {
  getDist: function (origin, destination, callback) {
    getDist(origin, destination, callback);
  },
  StateController: function () {
    StateController();
  },
  DoMovement: function (name, dir, rate, maintainFacingDirection) {
    DoMovement(name, dir, rate, maintainFacingDirection);
  },
  ProcessMovements: function () {
    ProcessMovements();
  },
};

function StateController(){
  entities = ["npcs","players","attacks"]
  for (entity in entities){
    db = coredata[entities[entity]]
    for(item in db){
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
    if (coredata.players[moveQueue[inst][0]].state < 10){
      DoMovement(moveQueue[inst][0], moveQueue[inst][1], 2);
    }
    delete moveQueue[inst];
  }
};

function DoMovement(name, dir, rate, maintainFacingDirection) {
  //Only objects with a letter before thier id can be moved
  nameType = ""
  switch(name[0]){
    case "n":
      nameType = "npcs"
      break;
    case "p":
      nameType = "players"
      break;
  }


  if (coredata[nameType][name].state == 0){coredata[nameType][name].state = 3}
  if (dir == "2"){
    var x = parseInt(coredata[nameType][name].pos.split(".")[0])
    var y = parseInt(coredata[nameType][name].pos.split(".")[1]) - rate
    cellname = ''+x+'.'+y+''
  };
  if (dir == "6"){
    var x = parseInt(coredata[nameType][name].pos.split(".")[0])
    var y = parseInt(coredata[nameType][name].pos.split(".")[1]) + rate
    cellname = ''+x+'.'+y+''
  };
  if (dir == "8"){
    var x = parseInt(coredata[nameType][name].pos.split(".")[0]) - rate
    var y = parseInt(coredata[nameType][name].pos.split(".")[1])
    cellname = ''+x+'.'+y+''
  };
  if (dir == "4"){
    var x = parseInt(coredata[nameType][name].pos.split(".")[0]) + rate
    var y = parseInt(coredata[nameType][name].pos.split(".")[1])
    cellname = ''+x+'.'+y+''
  };

  if (maintainFacingDirection == true){
    dir = coredata[nameType][name].dir;
  };

  if (coredata[nameType][name].state !== "dead" ){
    if (!(collmap.hasOwnProperty(cellname))) {
      coredata[nameType][name].pos = cellname;
      coredata[nameType][name].dir = dir;

    } else {
      coredata[nameType][name].dir = dir;
    }

  };

};
