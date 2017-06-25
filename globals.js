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
      exports.daystate = "night"
      break;
  }
};


exports = module.exports = {};
exports.coredata = {"chunks":{},"players":{}};
exports.chunkdata = JSON.parse(fs.readFileSync("./nightchunks.json"));
exports.chunkParts = ["npcs","entities"];
exports.attackQueue = {};
exports.movementQueue = {};
exports.moveQueue = [];
exports.time = 400;
exports.ChangeDayNight = function (choice) { ChangeDayNight(choice); };
exports.daystate = "night"
exports.serverPause = false;
exports.serverMessage = null;

// Tuning settings
exports.hitbox1 = {"w": 3, "h": 2}
