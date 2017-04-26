globals = require('./globals.js');
coredata = globals.coredata;
collmap = globals.collmap;
moveQueue = globals.moveQueue;
mapchange = globals.mapchange;

module.exports = {
  getDist: function (origin, destination, callback) {
    getDist(origin, destination, callback);
  },
  DoMovement: function (playername, dir, rate, maintainFacingDirection) {
    DoMovement(playername, dir, rate, maintainFacingDirection);
  },
  ProcessMovements: function () {
    ProcessMovements();
  },
};

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
    DoMovement(moveQueue[inst][0], moveQueue[inst][1], 2);
    delete moveQueue[inst];
  }
};

function DoMovement(playername, dir, rate, maintainFacingDirection) {
  if (dir == "2"){
    var x = parseInt(coredata.players[playername].pos.split(".")[0])
    var y = parseInt(coredata.players[playername].pos.split(".")[1]) - rate
    cellname = ''+x+'.'+y+''
  };
  if (dir == "6"){
    var x = parseInt(coredata.players[playername].pos.split(".")[0])
    var y = parseInt(coredata.players[playername].pos.split(".")[1]) + rate
    cellname = ''+x+'.'+y+''
  };
  if (dir == "8"){
    var x = parseInt(coredata.players[playername].pos.split(".")[0]) - rate
    var y = parseInt(coredata.players[playername].pos.split(".")[1])
    cellname = ''+x+'.'+y+''
  };
  if (dir == "4"){
    var x = parseInt(coredata.players[playername].pos.split(".")[0]) + rate
    var y = parseInt(coredata.players[playername].pos.split(".")[1])
    cellname = ''+x+'.'+y+''
  };

  if (maintainFacingDirection == true){
    dir = coredata.players[playername].dir;
  };

  if (coredata.players[playername].state !== "dead" ){
    if (collmap[cellname] == 0) {
      coredata.players[playername].pos = cellname;
      coredata.players[playername].dir = dir;

    } else {
      coredata.players[playername].dir = dir;
    }

  };
};
