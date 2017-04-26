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
    console.log(JSON.stringify(db[attack]));
    if (db[attack].state <= 0){ removes.push(attack); break};

    if (db[attack].state > 0){
      db[attack].state -= 1;
      dodamage(db[attack].pos);
    };
  };
  for (var rem in removes){
    db.splice(rem, 1)
  };
};

function attack(attacker, npcsORplayers){
    // second argument, npc or player is the attribute of the attacker, not whats being attacked.
    var at = coredata[npcsORplayers];
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
    if (collmap[atpos] == 0) {
      general.getDist(at[attacker].pos, atpos, function(result) {
        console.log(result);
      });
      coredata.attacks.push({"pos": atpos, "dir": atdir, "state": "4", "owner": attacker, "type": "11"});
      console.log(attacker + " placed attack");

    };

};



function dodamage(atpos){
  dp = coredata.players;
  damage = 100;
  for (var key in dp){
    if (dp.hasOwnProperty(key)) {
      if (dp[key].pos == atpos) {
        dp[key].health = dp[key].health - damage;
        if (dp[key].health <= 0){
          dp[key].pos = dp[key].origin;
          dp[key].health = 100;
          console.log(dp[key], ' killed at ', atpos)
        };
      } ;
    };
  };


  dp = coredata.npcs;
  for (var key in dp){
    if (dp.hasOwnProperty(key)) {
      if (dp[key].pos == atpos){
        dp[key].health = dp[key].health - damage;
        if (dp[key].health <= 0){
          dp[key].state = "dead";
          console.log(dp[key], ' killed at ', atpos)
        };
      }
    };
  };
};
