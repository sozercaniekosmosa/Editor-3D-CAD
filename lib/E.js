function newVector() {
	return new THREE.Vector3();
}

function newMatrix() {
	return new THREE.Matrix4();
}

function getMPos(m) {
	return new THREE.Vector3().setFromMatrixPosition(m);
}

function line1(a, b) {
	Rline.geometry.vertices = [a, b];
	Rline.geometry.verticesNeedUpdate = true;
}

function line2(a, b) {
	Bline.geometry.vertices = [a, b];
	Bline.geometry.verticesNeedUpdate = true;
}

function line3(a, b) {
	Gline.geometry.vertices = [a, b];
	Gline.geometry.verticesNeedUpdate = true;
}

function line4(a, b) {
	Fline.geometry.vertices = [a, b];
	Fline.geometry.verticesNeedUpdate = true;
}


function out(obj) {
//	console.log(obj);
	$('#info').text(obj);
}

var EMPTY = "empty";
var MODE_SELECT = "MODE SELECT";
var MODE_TRANSFORMATION = "MODE TRANSFORMATION";
var MODE_CAMERA = "MODE CAMERA";
var MODE_LINK = "MODE LINK";
var MODE_RETURN = "MODE RETURN";

var E = {
	VERSION:      6,
	surface:      {},
	srfrnd:       {},
	Input:        {},
	selectCamera: false,
	under:        EMPTY,         // that under the cursor
	_select:      EMPTY,
	_lastSelect:  EMPTY,
	cloneSelect:  {},
	get select() {
		return this._select;
	},
    set select(val) {
        if ((val !== EMPTY) && (!val.isGhost)) this.cloneSelect = {pos: val.pos.clone(), ang: val.ang.clone()}
        this._lastSelect = this._select;
        this._select = val;
    },
	selectLast:         EMPTY,
	defCntKey:          50,
	camPanAngCnt: 1,
	anmFrmDelay: 100,
	_mode:              [EMPTY],
	                    get mode() {
		                    return this._mode[this._mode.length - 1];
	                    },
	                    set mode(val) {
		                    if (val === MODE_RETURN) {
			                    this._mode.pop();
			                    if (this._mode.length == 0) this._mode.push(EMPTY);
			                    return;
		                    }
		                    if (this._mode[this._mode.length - 1] == val) return val;
		                    this._mode.push(val);
	                    },

	update: function(){
		this.Input.isMove = this.Input.rc;
	},

	isGhost:  true,
	property: ['header_settings', 'defGridSnap', 'defAngSnap', 'camPanAngCnt', 'anmFrmDelay'],

	defGridSnap: 50,
	defAngSnap:  15,

	empty:   "empty",
	eparent: "eparent",
	pos:     "pos",
	ang:     "ang",
	escale:  "escale",
	global:  "global",
	basis:   "basis",

	color:     "color",
	intensity: "intensity",
	distance:  "distance",

	target:   "target",
	angle:    "angle",
	exponent: "exponent",

	greed: {},

//	clearColor: 0xB0B0B0,
	clearColor: 0xC0C0C0,
//	clearColor: 0xA3988B,

	cntRFrm: 0
};

Math.rad = Math.PI / 180;
Math.deg = 180 / Math.PI;

var Rline;
var Bline;
var Gline;
var Fline;

var world;
var ui;
var anm;
var und;

var POINT = "POINT";
var SPOT = "SPOT";
var HEMISPHERE = "HEMISPHERE";
var DIRECTIONAL = "DIRECTIONAL";
var AREA = "AREA";
var AMBIENT = "AMBIENT";


var LINK_LINE = "LINK LINE";
var LINK_PARENT = "LINK eparent";
var LINK_CHILD = "LINK CHILD";

var PIVOT_LINE = "PIVOT_LINE";
var PIVOT_OBJ = "PIVOT_OBJ";
var PIVOT_POS = "PIVOT_POS";

var BOX_SELECT = "BOX HELP";
var BOX_UNDER = "BOX UNDER";


var task_pull = [];

var HEAD = 0;
var CHEST = 1;
var SHOULDER_L = 2;
var FOREARM_L = 3;
var HAND_L = 4;
var SHOULDER_R = 5;
var FOREARM_R = 6;
var HAND_R = 7;

var PELVIS = 8;

var THIGH_L = 9;
var SHIN_L = 10;
var FOOT_L = 11;
var THIGH_R = 12;
var SHIN_R = 13;
var FOOT_R = 14;


THREE.Vector2.prototype.toString = function () {
	return this.x.toFixed() + "," + this.y.toFixed();
};

THREE.Vector3.prototype.projectVec = function (b) {

	var len = this.lengthSq();
	var dot = this.dot(b);
//	console.log(dot.toString());

	var v = dot / len;
	var vp = this.multiplyScalar(v);
	return vp;
//	return this.multiplyScalar( this.dot(b)/this.lengthSq());
}

THREE.Vector3.prototype.toString = function () {
	var fx = 1;
	return (this.x * fx).toFixed() / fx + ", " + (this.y * fx).toFixed() / fx + ", " + (this.z * fx).toFixed() / fx;
};

THREE.Quaternion.prototype.toString = function () {
	var fx = 10;
	return (this.w * fx).toFixed() / fx + ", " + (this.x * fx).toFixed() / fx + ", " + (this.y * fx).toFixed() / fx + ", " + (this.z * fx).toFixed() / fx;
};

THREE.Euler.prototype.toString = function () {
	var fx = 1;
	x = this._x / Math.rad;
	y = this._y / Math.rad;
	z = this._z / Math.rad;
	return (x * fx).toFixed() / fx + ", " + (y * fx).toFixed() / fx + ", " + (z * fx).toFixed() / fx;
};

THREE.Vector4.prototype.toString = function () {
	return this.x.toFixed() + "," + this.y.toFixed() + "," + this.z.toFixed() + "," + this.w.toFixed();
};

Array.prototype.reset = function () {
	this.inx = 0;
}

Array.prototype.next = function () {
	if (typeof(this.inx) == 'undefined') this.reset();
	if (this.inx >= this.length) {
		this.reset();
		return false;
	}
	return this[this.inx++];
}

Array.prototype.toString = function () {
	var key, value, ret = '';

	function getProp(obj) {
		var key, value, ret = '';
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				value = obj[key];
				if (typeof(value) == "object")
					value = getProp(value);
				ret += key + ': ' + value + ' ';
			}
		}
		return ret;
	}

	for (key in this) {
		if (this.hasOwnProperty(key)) {
			value = this[key];
			if (typeof(value) == "object")
				value = getProp(value);
			ret += key + ': ' + value + '\n';
		}
	}

	return ret;
}

Array.prototype.all = function (fn) {
	var len = this.length;
	for (var i = 0; i < len; i++) {
		fn(this[i]);
	}
}