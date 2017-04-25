globals = require('./globals.js');
coredata = globals.coredata;
collmap = globals.collmap;
moveQueue = globals.moveQueue;
mapchange = globals.mapchange;

module.exports = {
  DoMovement: function (playername, dir) {
    DoMovement(playername, dir);
  },
  ProcessMovements: function () {
    ProcessMovements();
  },
};

function ProcessMovements(){
  for (var inst in moveQueue){
    DoMovement(moveQueue[inst][0], moveQueue[inst][1], 2);
    delete moveQueue[inst];
  }
};

function DoMovement(playername, dir, rate) {
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



  if (coredata.players[playername].state !== "dead" && collmap[cellname] == 0){
  //process.stdout.write(data[1]+" commit to ->");
  //console.log(data[0], coredata.players[data[0]].pos);
  coredata.players[playername].pos = cellname;
  coredata.players[playername].dir = dir;
    };
};
