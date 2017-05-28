globals = require('./globals.js');
general = require('./general.js');
coredata = globals.coredata;
collmap = globals.collmap;
mapchange = globals.mapchange;
attackQueue = globals.attackQueue;

///// Exports ///////////////////////////
module.exports = {
  attack: function (attacker, dir) {
    attack(attacker, dir);
  },
  processAttacks: function () {
    processAttacks();
  },
  processAttackQueue: function () {
    processAttackQueue();
  },
};



function processAttackQueue(){
  for (var inst in attackQueue){
    attack(attackQueue[inst][0], attackQueue[inst][1])
    delete attackQueue[inst];
  }
};

function processAttacks(){
  var db = coredata.attacks;
  var removes = [];
  for (var attack = coredata.attacks.length -1; attack >= 0; attack--){
    //console.log(JSON.stringify(db[attack]));
    if (db[attack].state <= 0){ removes.push(attack); break};

    if (db[attack].state == 3){
      dodamage(db[attack].pos, db[attack].owner, db[attack].dir, false);
    }
  };
  for (var rem in removes){
    db.splice(rem, 1)
  };
};

function attack(attacker, npcsORplayers){
    // second argument, npc or player is the attribute of the attacker, not whats being attacked.
    var at = coredata[npcsORplayers];
    if (at[attacker].state > 60){at[attacker].pos = at[attacker].origin; at[attacker].state = 0; return; };
    //coredata.attacks["a" + attacker] = at[attacker].pos;
    var atdir = at[attacker].dir;
    var atorig = at[attacker].pos.split(".");
    var atpos = "";
    if (atdir == "2"){
    	var nx = parseInt(atorig[0])
    	var ny = parseInt(atorig[1]) - 5
    	atpos = nx + "." + ny
    } else if (atdir == "6") {
		  var nx = parseInt(atorig[0])
    	var ny = parseInt(atorig[1]) + 5
    	atpos = nx + "." + ny
    } else if (atdir == "8") {
    	var nx = parseInt(atorig[0]) - 5
    	var ny = parseInt(atorig[1])
    	atpos = nx + "." + ny
    } else if (atdir == "4") {
    	var nx = parseInt(atorig[0]) + 5
    	var ny = parseInt(atorig[1])
    	atpos = nx + "." + ny
    };
    if (!(collmap.hasOwnProperty(atpos)) && at[attacker].state < 10) {
      coredata.attacks.push({"pos": atpos, "dir": atdir, "state": "3", "owner": attacker, "type": "5"});
      at[attacker].state = 13
      console.log(attacker + " placed attack");

    };

};



function dodamage(atpos, owner, direction, friendlyFire){
  var damage = 25;
  var dp = coredata.players;
  for (var key in dp){
    if (dp.hasOwnProperty(key) && key != owner) {
      general.getDist(atpos, dp[key].pos, function(result) {
        if (result[0] <= 4){
          console.log(result, damage, dp[key].health);
          dp[key].health = dp[key].health - damage;
          general.DoMovement(key, direction, 6, true);
          if (dp[key].health <= 0){
            dp[key].state = 63;
            dp[key].health = 100;
            console.log(dp[key], ' killed at ', atpos)
          };
        };
      });
    };
  };


  var dn = coredata.npcs;
  for (var key in dn){
    if (dn.hasOwnProperty(key) && key != owner) {
      general.getDist(atpos, dn[key].pos, function(result) {
        if (result[0] <= 4){
          console.log(result, damage, dn[key].health);
          dn[key].health = dn[key].health - damage;
          general.DoMovement(key, direction, 6, true);
          if (dn[key].health <= 0){
            dn[key].state = 63;
            dn[key].health = 100;
            console.log(dn[key], ' killed at ', atpos)
          };
        };
      });
    };
  };
};
