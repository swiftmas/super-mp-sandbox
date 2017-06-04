/////// ONE MODULE TO RULE THEM ALL //////////////////


exports = module.exports = {};
exports.collmap = require("./coll.json");
exports.coredata = {"chunks":{},"players":{}};
exports.chunkdata = require("./chunks.json")
exports.mapchange = false;
exports.chunkParts = ["npcs","entities"];
exports.attackQueue = {};
exports.movementQueue = {};
exports.moveQueue = [];

// Tuning settings
exports.hitbox1 = {"w": 3, "h": 2}
