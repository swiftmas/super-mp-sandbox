exports = module.exports = {};


//// IMG /////////////////////////////////////////////////////////////
var charsprites = new Image();
charsprites.src = '/static/charsprites.png';
var chars = {};
chars.t01 = {};
chars.t01.d2 = [charsprites, 0, 16, 16, 16];
chars.t01.d6 = [charsprites, 16, 16, 16, 16];
chars.t01.d8 = [charsprites, 32, 16, 16, 16];
chars.t01.d4 = [charsprites, 48, 16, 16, 16];
chars.t03 = {};
chars.t03.d2 = [charsprites, 0, 0, 16, 16];
chars.t03.d6 = [charsprites, 16, 0, 16, 16];
chars.t03.d8 = [charsprites, 32, 0, 16, 16];
chars.t03.d4 = [charsprites, 48, 0, 16, 16];
chars.t02 = {};
chars.t02.d2 = [charsprites, 0, 32, 16, 16];
chars.t02.d6 = [charsprites, 16, 32, 16, 16];
chars.t02.d8 = [charsprites, 32, 32, 16, 16];
chars.t02.d4 = [charsprites, 48, 32, 16, 16];
chars.t04 = {};
chars.t04.d2 = [charsprites, 0, 48, 16, 16];
chars.t04.d6 = [charsprites, 16, 48, 16, 16];
chars.t04.d8 = [charsprites, 32, 48, 16, 16];
chars.t04.d4 = [charsprites, 48, 48, 16, 16];
chars.duane = {};
chars.duane.d2 = [charsprites, 0, 64, 16, 16];
chars.duane.d6 = [charsprites, 16, 64, 16, 16];
chars.duane.d8 = [charsprites, 32, 64, 16, 16];
chars.duane.d4 = [charsprites, 48, 64, 16, 16];
////////////////////////////////////////////////////////////////////////////
exports.spritesheet = charsprites;
exports.charsprites = chars;
