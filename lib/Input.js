/**
 * Created by admin on 23.11.13.
 */
E.Input = function(){
    var _this = this;

	this.enable = true;

// MOUSE
    this.rc  = 3;
    this.isMove  = this.rc;
    var offset  = E.surface.offset();

// coord range[-1;+1]
    this.x = 0;
    this.y = 0;

//  screen coord
    this.xs = 0;
    this.ys = 0;

//  delta screen coord
    this.dx = 0;
    this.dy = 0;

    this.modeGreed = true;  // greed detected click
    this.isEqual = false;   // if "object under down" and "object under current" equal

// events mouse
    this.click = [0,0,0,0];
    this.down = [false,false,false,false];
    this.downNow = [0,0,0,0]; // отрабатывает один раз при нажатии
    this.up = [true,true,true,true];

// screen coord befor change
    this.xLast = 0;
    this.yLast = 0;

// objects belong DOM
    this.over = false;
    this.out = false;
    this.it = null;

//skip click
	this.skipClick = 0;

    var width = E.surface.width();
    var height = E.surface.height();

    E.surface.get(0).addEventListener( 'mousemove', mMove, false );
	E.surface.get(0).addEventListener( 'mouseup', mUp, false );
	E.surface.get(0).addEventListener( 'mousedown', mDown, false );
    E.surface.get(0).addEventListener( 'mouseover', mOver, false );
    E.surface.get(0).addEventListener( 'mouseout', mOut, false );

	document.addEventListener( 'mousewheel', mWheel, false );
	document.addEventListener( 'DOMMouseScroll', mWheel, false ); // firefox
	document.addEventListener( 'mouseup', function(){_this.isMove = _this.rc;}, false );
	document.addEventListener( 'mousedown', function(){_this.isMove = _this.rc;}, false );

    function mMove(e) {
	    offset = E.surface.offset();
        _this.x     = ((e.pageX - offset.left) / E.surface.width() * 2 - 1);
        _this.y     = -((e.pageY - offset.top) / E.surface.height() * 2 - 1);
        _this.xs    = e.pageX - offset.left;
        _this.ys    = e.pageY - offset.top;

        _this.isMove    = _this.rc;
    }

    function mDown(e) {
	    if (_this.skipClick)  return;

        var mb = e.which;
        _this.down[mb]  = true;
        _this.up[mb]    = false;
        _this.click[mb] = 0;
	    _this.downNow[mb] = 3;
        _this.objDown   = E.under;
    }

    function mUp(e) {

	    if (_this.skipClick) { _this.skipClick = 0; return; }

        var mb = e.which;
        _this.down[mb]  = false;
        _this.up[mb]    = true;
        _this.objUp     = E.under;
        if (_this.modeGreed) {
            _this.click[mb] = _this.isEqual ? 2 : 0;
        } else {
            _this.click[mb] = 2;
        }
    }

    function mOver(event) {
        _this.over = true;
        _this.out = false;
        _this.it = $(_this).get(0);
    }

    function mWheel(event) {
	    _this.isMove    = _this.rc;
    }

    function mOut(event) {
        _this.over = false;
        _this.it = null;
        _this.out = true;

//	    _this.click = [0,0,0,0];
//	    _this.down = [false,false,false,false];
//	    _this.downNow = [0,0,0,0];
//	    _this.up = [true,true,true,true];
    }

    function reset() {
        var ode = document.createEvent('MouseEvents');
        ode.initMouseEvent( 'mouseup', true, true, window, 1, 0, 0, 0, 0, false, false, true, false, 0, null );
        document.dispatchEvent(ode);
    }

// KEY
    this.pressed = {};
    this.released = 0;
    this.key_release = 0;
	this.pressNow = 0;

    this.event = {};

    this.KEY_BACKSPASE = 8;
    this.KEY_DELETE = 46;
    this.KEY_ENTER = 13;
    this.KEY_ALT = 18;
    this.KEY_CTRL = 17;
    this.KEY_SHIFT = 16;
    this.KEY_PAGE_UP = 33;
    this.KEY_PAGE_DOWN_ = 34;
    this.KEY_END = 35;
    this.KEY_HOME = 36;
    this.KEY_A = 65;
    this.KEY_W = 87;
    this.KEY_D = 68;
    this.KEY_S = 83;
    this.KEY_SPACE = 32;
    this.KEY_ARROW_LEFT = 37;
    this.KEY_ARROW_UP = 38;
    this.KEY_ARROW_RIGHT = 39;
    this.KEY_ARROW_DOWN = 40;

    this[""]=	31;	this[" "]=	32;	this["!"]=	33;	this["\""]=	34;	this["#"]=	35;	this["$"]=	36; this["%"]=	37;
    this["&"]=	38;	this["'"]=	39;	this["("]=	40;	this[")"]=	41;	this["*"]=	42; this["+"]=	43;	this[","]=	44;
    this["-"]=	45;	this["."]=	46;	this["/"]=	47;	this["0"]=	48; this["1"]=	49;	this["2"]=	50;	this["3"]=	51;
    this["4"]=	52;	this["5"]=	53;	this["6"]=	54; this["7"]=	55;	this["8"]=	56;	this["9"]=	57;	this["="]=	58;
    this[";"]=	59;	this["<"]=	60; this["="]=	61;	this[">"]=	62;	this["?"]=	63;	this["@"]=	64;	this["A"]=	65;
    this["B"]=	66; this["C"]=	67;	this["D"]=	68;	this["E"]=	69;	this["F"]=	70;	this["G"]=	71;	this["H"]=	72;
    this["I"]=	73;	this["J"]=	74;	this["K"]=	75;	this["L"]=	76;	this["M"]=	77;	this["N"]=	78; this["O"]=	79;
    this["P"]=	80;	this["Q"]=	81;	this["R"]=	82;	this["S"]=	83;	this["P"]=	84; this["U"]=	85;	this["V"]=	86;
    this["W"]=	87;	this["X"]=	88;	this["Y"]=	89;	this["Z"]=	90; this["["]=	91;	this["\\"]=	92;	this["]"]=	93;
    this["^"]=	94;	this["_"]=	95;	this["`"]=	96; this["a"]=	97;	this["b"]=	98;	this["c"]=	99;	this["d"]=	100;
    this["e"]=	101;this["f"]=	102;this["g"]=	103;this["h"]=	104;this["i"]=	105;this["j"]=	106;this["k"]=	107;
    this["l"]=	108;this["m"]=	109;this["n"]=	110;this["o"]=	111;this["p"]=	112;this["q"]=	113;this["r"]=	114;
    this["s"]=	115;this["t"]=	116;this["u"]=	117;this["v"]=	118;this["w"]=	119;this["x"]=	120;this["y"]=	121;
    this["z"]=	122;this["{"]=	123;this["|"]=	124;this["}"]=	125;

//    document.onkeydown = onKeyDown;
//	document.onkeyup = onKeyUp;
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

    function onKeyDown (e) {
        if(!_this.enable) return;
        _this.event = e;
        _this.pressed[e.keyCode] = true;
	    _this.pressNow = 1;
	    _this.isMove = _this.rc;
    }
    function onKeyUp (e) {
	    if(!_this.enable) return;
        _this.pressed[e.keyCode] = false;
        _this.key_release = e.keyCode;
        _this.released = 2;
	    _this.isMove  = _this.rc;
    }
}

E.Input.prototype = {
    constructor: E.Input,

    update: function () {
//	    console.log('IN-');
        this.dx     = (this.xLast - this.xs) * -1;
        this.dy     = (this.yLast - this.ys) * -1;
        this.xLast  = this.xs;
        this.yLast  = this.ys;

        this.isEqual = this.objDown === E.under;

        if (this.click[1]) this.click[1]--;
        if (this.click[2]) this.click[2]--;
        if (this.click[3]) this.click[3]--;
        if (this.downNow[1]) this.downNow[1]--;
        if (this.downNow[2]) this.downNow[2]--;
        if (this.downNow[3]) this.downNow[3]--;
        if (this.released) this.released--; else this.key_release = 0;
        if (this.pressNow) this.pressNow--;

	    if(this.isMove)
		    this.isMove--;
    },

	isPressNow: function(keyCode) {
		return (this.pressNow > 0) ? this.pressed[keyCode]:0;
	},

    isPress: function(keyCode) {
        return this.pressed[keyCode] == true;
    },

    isRelease: function(key) {
        return (this.released != 0) && (key == this.key_release);
    },
    getState: function(key) {
        return this.pressed[key.charCodeAt(0)];
    }

}

E.Input.prototype.toString = function() {
    return	'code: ' + this.event.keyCode + ' char: ' + String.fromCharCode(this.event.keyCode) +
        (this.event.keyCode == undefined ? 'undefined' : '') +
        (this.event.shiftKey ?  ' shift'    :'') +
        (this.event.ctrlKey ?   ' ctrl'     :'') +
        (this.event.altKey ?    ' alt'      :'') +
        (this.event.metaKey ?   ' meta'     :'');
}