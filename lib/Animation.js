E.Animation = function (property) {

	var _this = this;

	this.theta = 0.0;
	this.phi = 0.0;
	this.distance = 0.0;

	this.cameraAngCnt = 0;
	this.frameDelay = 0;

	this.idCount = 0;

	this.phase = 0;

	this.isRender = false;
	this.hasDimension = false;
	this.dim;
	this.snp;

	this.cameraAng = 0;

	this.isPlay = false;
	this.isLoop = false;
//	this.isBind = false;

	this.keyKeep = -1;

	this.keyArr = [];

	this.inxKey = 0;
	this.inxFrm = 0;

	this.frameA = {};
	this.frameB = {};

	property = property === undefined ? {} : property;

	if (property.world === undefined) alert('ainmation: world not defined');

	this.objArr = property.world.sceneObj.children;
}

E.Animation.prototype = {
	constructor: E.Animation,

	showKey: function (key) {
		if (this.keyArr.length == 0) return;
		this.keyKeep = key;
		if (this.keyKeep > -1) {
			this.mixFrames(this.keyArr[this.keyKeep], this.keyArr[this.keyKeep], 0);
		}
	},

	isTimeout: function () {
		if(this.frameDelay + E.anmFrmDelay < new Date().getTime()){
			this.frameDelay = new Date().getTime();
			return true;
		}

		return false;
	},

	stop: function () {
		anm.hasDimension = false;
		world.camera.restoreState();
		$('#playAni').removeClass('active');
		this.isPlay = false;
		this.isRender = false;
		this.showKey(0);
		this.inxKey = 0;
		this.inxFrm = 0;
		this.keyKeep = -1;
	},

	addKey: function () {
		var key = this.getSceneState();

		key.id = 'key' + (this.idCount++);
		key.cntFrm = (E.defCntKey / 10).toFixed(0);
		this.keyArr.push(key);

		return key.id;
	},

	applyKey: function (id) {
		var ex = this.keyArr[this.getInx(id)];

		var key = this.getSceneState();

		key.id = ex.id;
		key.cntFrm = ex.cntFrm;

		this.keyArr[this.getInx(id)] = key;
	},

	deleteKey: function (id) {
		this.stop();
		this.keyArr.splice(this.getInx(id), 1);
		this.keyKeep = -1;
	},

	getFrameCnt: function () {
		var cnt = 0;
		this.keyArr.all(
			function (it) {
				cnt += parseInt(it.cntFrm, 10);
			}
		);
		return cnt;
	},

	update: function () {

		if (!this.isPlay) return;

		if (this.keyArr.length == 0) return;

		E.update();
		if(!this.isRender && !this.isTimeout()) return;

		if (this.keyKeep > -1) this.inxKey = this.keyKeep;

		if (this.inxFrm >= this.keyArr[this.inxKey].cntFrm) {
			this.inxFrm = 0;
			this.inxKey++;
		}

		if (this.inxKey >= this.keyArr.length) {
			this.inxFrm = 0;
			this.inxKey = 0;

			if (this.cameraAngCnt > 0) {
				this.camRot();
			} else {
				this.camRot();
				if(this.isRender){
					if(this.hasDimension){
						this.stop();
					} else{
						this.setCameraAnimate();
						this.hasDimension = true;
					}
				}
			}

			return;
		}

		this.frameA = this.keyArr[this.inxKey];
		this.frameB = (this.inxKey + 1 >= this.keyArr.length) ? this.keyArr[0] : this.keyArr[this.inxKey + 1];

		this.mixFrames(this.frameA, this.frameB, this.inxFrm);
		this.inxFrm++;

		if (this.isRender){
			if(this.hasDimension){
				render(this.dim);
			}else{
				this.snp = snapshot({x:0, y:0, w:E.surface.width(), h:E.surface.height()});
				this.dim = getDimension(this.snp, this.dim);
			}
		}
	},

	camRot: function () {
		if(this.cameraAngCnt <= 0) return;
		this.cameraAngCnt--;

		this.theta += (this.cameraAng * Math.rad);
		var off = world.camera.position;
		off.x = this.distance * Math.sin(this.phi) * Math.sin(this.theta);
		off.y = this.distance * Math.cos(this.phi);
		off.z = this.distance * Math.sin(this.phi) * Math.cos(this.theta);
	},

	mixFrames: function (srcFrmA, srcFrmB, frame) {
		var cntFrm = srcFrmA.cntFrm;
		for (var i = 0; i < srcFrmA.length; i++) {
			var A = srcFrmA[i];
			var B = srcFrmB[i];
			var alpha = 1 / cntFrm * frame;
			var obj = A.object;

			var prop = obj.property;

			for (var inx = 0; inx < prop.length; inx++) {
				var fld = prop[inx];
				if (A[fld] instanceof THREE.Vector3)
					obj[fld].copy(A[fld]).lerp(B[fld], alpha);
				else if (A[fld] instanceof THREE.Quaternion)
					obj[fld].copy(A[fld]).slerp(B[fld], alpha);
				else if (A[fld] instanceof THREE.Color)
					obj[fld].copy(A[fld]).lerp(B[fld], alpha);
				else if (isFinite(A[fld]))
					obj[fld] = A[fld] + ( B[fld] - A[fld] ) * alpha;
				else
					obj[fld] = B[fld];
			}
		}
	},

	setCameraAnimate: function () {

		world.camera.storeState();

		this.cameraAngCnt = E.camPanAngCnt-1;

		this.cameraAng = 360/E.camPanAngCnt;

		var off = world.camera.position;
		anm.theta = Math.atan2(off.x, off.z);
		anm.phi = Math.atan2(Math.sqrt(off.x * off.x + off.z * off.z), off.y);
		anm.distance = new THREE.Vector3().subVectors(world.camera.position, world.camera.target).length();
	},

	getSceneState: function () {
		var key = [];
		for (var inxObj = 0; inxObj < this.objArr.length; inxObj++) {
			var obj = this.objArr[inxObj];
			if (obj.isGhost) continue;

			var state = {};
			var prop = obj.property;

			state.object = obj;

			for (var inxFld = 0; inxFld < prop.length; inxFld++) {
				var fld = prop[inxFld];
				if (obj[fld] instanceof THREE.Vector3)
					state[fld] = obj[fld].clone();
				else if (obj[fld] instanceof THREE.Quaternion)
					state[fld] = obj[fld].clone();
				else if (obj[fld] instanceof THREE.Color)
					state[fld] = obj[fld].clone();
				else //if (isFinite(obj[fld]))
					state[fld] = obj[fld];
			}

			key.push(state);
		}
		return key;
	},

	replaceKey: function (array, src, dst) {
		var newArr = array.slice(src, src + 1);
		array.splice(src, 1);
		array.splice(dst, 0, newArr[0]);
	},

	getID: function (inx) {
		return anm.keyArr[inx].id;
	},

	getInx: function (id) {
		var len = anm.keyArr.length;
		var obj = anm.keyArr;
		var inx;

		for (inx = 0; inx < len; inx++)
			if (obj[inx].id === id) break;

		return inx;
	}

};