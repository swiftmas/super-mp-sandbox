/////// ONE MODULE TO RULE THEM ALL //////////////////


exports = module.exports = {};
exports.collmap = require("./coll.json");
exports.coredata = {"players":{}, "dest":{}, "effects":[], "bombs":[], "npcs":{"enemy2":{"pos":"19.23","state":"normal","health":100,"alerttimer":0,"team":"red","skin":"redKnight","dir":"2","origin":"19.23"}}};
exports.mapchange = false;
exports.attackQueue = {};
exports.movementQueue = {};
exports.moveQueue = [];
