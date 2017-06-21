/////// ONE MODULE TO RULE THEM ALL //////////////////

const fs = require('fs');

// Day Night Change
function ChangeDayNight(choice){
  switch(choice){
    case "day":
      exports.chunkdata = JSON.parse(fs.readFileSync("./daychunks.json"));
      break;
    case "night":
      exports.chunkdata = JSON.parse(fs.readFileSync("./nightchunks.json"));
      break;
  }
};


exports = module.exports = {};
exports.coredata = {"chunks":{},"players":{}};
exports.chunkdata = JSON.parse(fs.readFileSync("./daychunks.json"));
exports.chunkParts = ["npcs","entities"];
exports.attackQueue = {};
exports.movementQueue = {};
exports.moveQueue = [];
exports.time = 50;
exports.ChangeDayNight = function (choice) { ChangeDayNight(choice); };
exports.daystate = "day"
exports.serverPause = false;
exports.serverMessage = null;


// Tuning settings
exports.hitbox1 = {"w": 3, "h": 2}
