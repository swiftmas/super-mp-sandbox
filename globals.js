/////// ONE MODULE TO RULE THEM ALL //////////////////

const fs = require('fs');
////// Global maintenece funtions ///////////////////
// Day Night Change. Gotta find a way to move this.
//function ChangeDayNight(choice){
//  switch(choice){
//    case "day":
//      exports.chunkdata = JSON.parse(fs.readFileSync("./daychunks.json"));
//      break;
//    case "night":
//      exports.chunkdata = JSON.parse(fs.readFileSync("./nightchunks.json"));
//      exports.daystate = "night"
//      break;
//  }
//};

////////////////// Vars
exports = module.exports = {};
exports.coredata = {"chunks":{},"players":{}};
exports.chunkdata = JSON.parse(fs.readFileSync("./daychunks.json"));
exports.dialogdb = require('./dialogdb.json');
exports.chunkParts = ["npcs","entities"];
exports.weaponData = require('./weaponData.json')
exports.time = 3050; /// shoud be 6000, using other numbers to test time transitions. 3k is night
exports.dayint = 0;
//exports.ChangeDayNight = function (choice) { ChangeDayNight(choice); }; //// gotta fit this into gernal.js but it wasn't wroking.
exports.daystate = "day" /// Required so its easier to determine if its day or night wihtout relying on the day timer which may change.
exports.serverPause = false;
exports.serverMessage = null;

/////////////////////// QUEUES
exports.attackQueue = {};
/// This is a queue of all incoming attack requests from players, it is then converted to the active attacks queue so that duplicate attacks are not counted.
exports.activeAttacksQueue = {};
// This is a queue of all attacks currently being orchestrated. different from the queue for parsing through attack requests. this is where actual attacks are processed.
exports.movementQueue = {};
/// This is a queue of all incoming movement request from players, it is then converted to the move queue so that duplicate movements are not counted. this will be revised.
exports.moveQueue = {};
