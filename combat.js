globals = require('./globals.js');
coredata = globals.coredata;
collmap = globals.collmap;
mapchange = globals.mapchange;
attackQueue = globals.attackQueue;

///// Exports ///////////////////////////
module.exports = {
  bombcontroller: function () {
    bombcontroller();
  },
  attack: function (attacker, dir) {
    attack(attacker, dir);
  },
  explode: function (bombNumber) {
    explode(bombNumber);
  },
  processBombs: function () {
    processBombs();
  },
};

function bombcontroller(){
    var db = coredata.bombs;
    removes = [];
    for (var bomb = coredata.bombs.length -1; bomb >= 0; bomb--){
      console.log(JSON.stringify(db[bomb]));
      if (db[bomb].state <= 3){ removes.push(bomb); break};
      if (db[bomb].state < 6){
        explode(bomb);
      };
      if (db[bomb].state > 0){
        db[bomb].state -= 1;
      };
    };
    for (var rem in removes){
      db.splice(rem, 1)
    };
}

function processBombs(){
  for (var inst in attackQueue){
    attack(attackQueue[inst][0], attackQueue[inst][1])
    delete attackQueue[inst];
  }
  //attackQueue = {};
}

function attack(attacker, npcsORplayers){
    // second argument, npc or player is the attribute of the attacker, not whats being attacked.
    at = coredata[npcsORplayers];
    //coredata.attacks["a" + attacker] = at[attacker].pos;
    atdir = at[attacker].dir;
    atorig = at[attacker].pos.split(".");
    if (atdir == "up"){
    	nx = parseInt(atorig[0])
    	ny = parseInt(atorig[1]) - 1
    	atpos = nx + "." + ny
    } else if (atdir == "down") {
		nx = parseInt(atorig[0])
    	ny = parseInt(atorig[1]) + 1
    	atpos = nx + "." + ny
    } else if (atdir == "left") {
    	nx = parseInt(atorig[0]) - 1
    	ny = parseInt(atorig[1])
    	atpos = nx + "." + ny
    } else if (atdir == "right") {
    	nx = parseInt(atorig[0]) + 1
    	ny = parseInt(atorig[1])
    	atpos = nx + "." + ny
    };
    if (collmap[atpos] == 0) {
      for (var bomb = coredata.bombs.length -1; bomb >= 0; bomb--){
        if (coredata.bombs[bomb].pos == atpos){
          return;
        }
      };

      coredata.bombs.push({"pos": atpos, "state": "20", "owner": attacker});
      console.log(attacker + " placed bomb");

    };

};

function explode(bomb) {
    var radius = 4;
    dbomb = coredata.bombs[bomb];
    posx = parseInt(dbomb.pos.split(".")[0]);
    posy = parseInt(dbomb.pos.split(".")[1]);
    console.log("boom @ " + dbomb.pos, posx, posy)
    dodamage(dbomb.pos);
    bombAffect = [];
    //x
      //left
      for (var lx = posx -1; lx >= posx-radius; lx--){
        var atpos = lx + "." + posy
        if (collmap[atpos] !== 1){
          if (collmap[atpos] > 1){
            collmap[atpos] = 0;
            mapchange = true;
            break;
          } else {
            dodamage(atpos);
          };
          if (lx !== posx - 3){
            coredata.effects.push("12" + "." + atpos);
          } else {coredata.effects.push("13" + "." + atpos);};
        } else {
          break;
        };
      };
      //right
      for (var rx = posx + 1 ; rx <= posx + radius; rx++) {
        atpos = rx + "." + posy
        if (collmap[atpos] !== 1){
          if (collmap[atpos] == 2){
            collmap[atpos] = 0;
            mapchange = true;
            break;
          } else {
            dodamage(atpos);
          };
          if (rx !== posx + 3){
            coredata.effects.push("12" + "." + atpos);
          } else {coredata.effects.push("13" + "." + atpos);};
        } else {
          break;
        };
      };
    //y
      //up
      for (var uy = posy -1; uy >= posy-radius; uy--){
        var atpos = posx + "." + uy
        if (collmap[atpos] !== 1){
          if (collmap[atpos] == 2){
            collmap[atpos] = 0;
            mapchange = true;
            break;
          } else {
            dodamage(atpos);
          };
          if (uy !== posy - 3){
            coredata.effects.push("12" + "." + atpos);
          } else {coredata.effects.push("13" + "." + atpos);};
        } else {
          break;
        };
      };
      //down
      for (var dy = posy + 1 ; dy <= posy + radius; dy++) {
        atpos = posx + "." + dy
        if (collmap[atpos] !== 1){
          if (collmap[atpos] == 2){
            collmap[atpos] = 0;
            mapchange = true;
            break;
          } else {
            dodamage(atpos);
          };
          if (dy !== posy + 3){
            coredata.effects.push("12" + "." + atpos);
          } else {coredata.effects.push("13" + "." + atpos);};
        } else {
          break;
        };
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
