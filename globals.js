/////// ONE MODULE TO RULE THEM ALL //////////////////


exports = module.exports = {};
exports.collmap = require("./coll.json");
exports.coredata = {"players":{}, "dest":{}, "effects":[], "bombs":[], "npcs":{"enemy2":{"pos":"19.23","state":"normal","health":100,"alerttimer":0,"team":"red","skin":"redKnight","dir":"up","origin":"19.23"}}};
exports.pathing = [38.32,30.32,15.14,14.6,27.6,34.10,41.6,57.6,59.3,55.14];
exports.mapchange = false;
exports.attackQueue = {};
exports.moveQueue = [];
