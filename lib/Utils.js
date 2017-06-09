jQuery.fn.swap = function (b) {
	b = jQuery(b)[0];
	var a = this[0],
		a2 = a.cloneNode(true),
		b2 = b.cloneNode(true),
		stack = this;

	a.parentNode.replaceChild(b2, a);
	b.parentNode.replaceChild(a2, b);

	stack[0] = a2;
	return this.pushStack(stack);
};

$(document).on('click', '.btn-down', function (e) {
	var _this = $(this);
	var cl = $(e.target);
	var dDwn = $(this).children(':nth-child(2)');
	var face = $(this).children(':first-child');

	if (dDwn.css('display') == 'none') {
		dDwn.css({top: _this.outerHeight() + 6 + 'px'});
		dDwn.slideDown(150);
	} else {
		if (_this.attr('swap') !== undefined) {
			if (cl[0] === face[0]) {
				dDwn.slideUp(50);
			}
			cl.swap(face);
		}
		dDwn.slideUp(50);
	}
});

$(document).on('click', '[radio-group]', function (e) {
	var obj = $(e.target);
	if (obj.attr('disabled')) return false;
	if (!obj.hasClass('btn')) return;
	$(this).children().removeClass('active');
	obj.addClass('active');
});

$(document).on('mousedown', '.btn :not([btn-toggle]) :not([radio-group]) :not([disabled])', function (e) {
	var obj = $(e.target);

	if (!obj.hasClass('btn')) {
		obj = $(obj).parent('.btn');
	}

	if (obj.attr('disabled')) return false;

	obj.addClass('active');
});

$(document).on('mouseup', '.btn :not([btn-toggle]) :not([radio-group]) :not([disabled])', function (e) {
	var obj = $(e.target);

	if (!obj.hasClass('btn')) {
		obj = $(obj).parent('.btn');
	}

	obj.removeClass('active');
});

$(document).on('click', '[btn-toggle]', function (e) {
	var obj = $(e.target);

	if (!obj.hasClass('btn')) {
		obj = $(obj).parent('.btn');
	}

	if (obj.attr('disabled')) return false;

	var alt_src = obj.attr('alt-src'); // switch img
	if (alt_src !== undefined) {
		var src = obj.attr('src');
		obj.attr('src', alt_src);
		obj.attr('alt-src', src);
	}

	var alt_txt = obj.attr('alt-txt'); // switch txt
	if (alt_txt !== undefined) {
		var txt = obj.text();
		obj.text(alt_txt);
		obj.attr('alt-txt', txt);
	}

	if (obj.hasClass('active')) {
		obj.removeClass('active');
	} else {
		obj.addClass('active');
	}
})

E.getVector3 = function (vector, vec_def) {
	var v = vec_def;
	if (v === undefined) v = new THREE.Vector3();
	return vector === undefined ? v : vector;
}

E.getVector4 = function (vector, vec_def) {
	var v = vec_def;
	if (v === undefined) v = new THREE.Vector4();
	return vector === undefined ? v : vector;
}

E.getQuaternion = function (qt, qt_def) {
	var q = qt_def;
	if (q === undefined) q = new THREE.Quaternion();
	return qt === undefined ? q : qt;
}

E.checkMatrix = function (m) {
	return m === undefined ? new THREE.Matrix4() : m;
}

function scrToWorld() {
	var vector = new THREE.Vector3(E.Input.x, E.Input.y, 0.5);
	var camera = world.camera;
	var projector = new THREE.Projector();

	projector.unprojectVector(vector, camera);

	var dir = vector.sub(camera.position).normalize();

	var distance = -camera.position.z / dir.z;

	return camera.position.clone().add(dir.multiplyScalar(distance));
}

function lerp(vA, vB, alpha) {

	var v = new THREE.Vector3();

	v.x = vB.x + ( vA.x - vB.x ) * alpha;
	v.y = vB.y + ( vA.y - vB.y ) * alpha;
	v.z = vB.z + ( vA.z - vB.z ) * alpha;

	return v;
}

function clone_style(mat) {
	rmat = new Object();
	for (fld in mat) if (mat.hasOwnProperty(fld))
		rmat[fld] = mat[fld].clone();
	return rmat;
}

function copy(src, dst) {
	var key;
	for (key in src) {
		if (src.hasOwnProperty(key)) {
			dst[ key ] = src[ key ];
		}
	}
}

function getDecart(a, b, r) {
	var v = new THREE.Vector3();
	v.x = -r * Math.cos(a) * Math.cos(b);
	v.y = r * Math.sin(b);
	v.z = r * Math.sin(a) * Math.cos(b);
	return v;
}


function getSphere(v) {
	var angels;
	angels.r = sqrt(v.x * v.x + v.z * v.z);
	angels.a = atan2(v.z, v.x);
	angels.b = atan2(v.y, angels.r);
	return angels;
}

E.quantization = function (v, k) {
	var vc = new THREE.Vector3();

	v.addScalar(0.001);

	vc.x = v.x - v.x % k;
	vc.y = (v.y - v.y % k);
	vc.z = v.z - v.z % k;

	return vc;
}

var s = 100;

//function createCube(s) {
//	var g = new THREE.CubeGeometry(s,s,s);
//	var mesh = new THREE.Mesh(g, matDisable.clone());
//	return mesh;
//}

//function createScale(x, y, z) {
//    var r = 20;
//    var g = new THREE.CylinderGeometry(s/r, s/r, s - s / 3, 4, 1, false);
//    var mesh = new THREE.Mesh(new THREE.SphereGeometry( s/r*1.7, 32, 16 ));
//    mesh.position.y = s / 2.5;
//    THREE.GeometryUtils.merge(g, mesh);
//    mesh = new THREE.Mesh(g, matDisable.clone());
//
//    mesh.position.y = s / 3;
//    g = new THREE.Geometry();
//    THREE.GeometryUtils.merge(g, mesh);
//    mesh = new THREE.Mesh(g, matDisable.clone());
//
//    mesh.rotation.x = x;
//    mesh.rotation.y = y;
//    mesh.rotation.z = z;
//    g = new THREE.Geometry();
//    THREE.GeometryUtils.merge(g, mesh);
//    mesh = new THREE.Mesh(g, matDisable.clone());
//
//    return mesh;
//}

function createBone(h, sz, mat) {
	var geometry = new THREE.CylinderGeometry(0.01, sz, h, 4, 1, false);
//    geometry.vertices[2] = new three.Vector3(0,size,0);
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, h / 2, 0));
	return new THREE.Mesh(geometry);
}

function createBox(height, width) {
	var geometry = new THREE.CubeGeometry(width, height, width);
//    geometry.vertices[2] = new three.Vector3(0,size,0);
//    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, height/2, 0 ) );
	return new THREE.Mesh(geometry);
}

function createSphere(r) {
	return new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16));
}

function createTorus(r) {
	return new THREE.Mesh(new THREE.TorusGeometry(r, r / 2, 16, 16));
}

function createLine() {
	var geometry = new THREE.Geometry();
	geometry.dynamic = true;
	geometry.vertices = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
	return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000}), THREE.LineStrip);
}

function createPlaneAdd(va, ang, size) {

	var geometry = new THREE.PlaneGeometry(size, size);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationAxis(va, ang));
	var obj = new THREE.Mesh(
		geometry,
		new THREE.MeshNormalMaterial({
			color:       0xcc0000,
			side:        THREE.DoubleSide,
			opacity:     0.2,
			transparent: true,
			visible:     true}));

	obj.name = "plane";
	return obj;
}

function getSun(r, seg, color, dot, emp) {

	if (color === undefined) color = 0xFFFF00;

	if ((dot === undefined) || (dot > 1.0)) dot = 1;
	if ((emp === undefined) || (emp > 1.0)) emp = -1;

	var ang = (Math.PI / 180) * (360 / seg);

	var geometry = new THREE.Geometry();
	geometry.dynamic = true;

	for (var i = 0; i < seg; i++) {
		geometry.vertices.push(new THREE.Vector3(r * Math.sin(ang * i), r * Math.cos(ang * i), 0));
		i += dot;
		geometry.vertices.push(new THREE.Vector3(r * Math.sin(ang * i), r * Math.cos(ang * i), 0));
		i += emp;
	}

	r += 5;

	for (var i = 0; i < seg; i++) {
		geometry.vertices.push(new THREE.Vector3(r * Math.sin(ang * i), r * Math.cos(ang * i), 0));
		r += 10;
		geometry.vertices.push(new THREE.Vector3(r * Math.sin(ang * i), r * Math.cos(ang * i), 0));
		r -= 10;
		i += 1;
	}

	geometry.verticesNeedUpdate = true;

	var mat = new THREE.LineBasicMaterial({color: color, transparent: true});
	return new THREE.Line(geometry, mat, THREE.LinePieces);
}

undoSceneStorage = [];
redoSceneStorage = [];

writeHistory = function (sceneState) {
	redoSceneStorage.length = 0;
	if (sceneState === undefined) sceneState = getSceneState(world.sceneObj.children);
	undoSceneStorage.push(sceneState);
};

setSceneState = function (stateScene) {
	for (var inx = 0; inx < stateScene.length; inx++) {
		var obj = stateScene[inx];
		if (obj.object.property === undefined) continue;
		setObjState(obj);
	}
};

getSceneState = function (objScene) {
	var stateScene = [];
	for (var inx = 0; inx < objScene.length; inx++) {
		var state = getObjState(objScene[inx]);
		if (state === undefined) continue;
		stateScene.push(state);
	}
	return stateScene;
};

setObjState = function (state) {
	if (state === undefined) return;
	var obj = state.object;
	var prop = obj.property;

	for (var inx = 0; inx < prop.length; inx++) {
		var fld = prop[inx];
		if (( state[fld] instanceof THREE.Vector3 ) || ( state[fld] instanceof THREE.Quaternion) || ( state[fld] instanceof THREE.Color))
			obj[fld].copy(state[fld]);
		else
			obj[fld] = state[fld];
	}

};

getObjState = function (obj) {

	var state = {};
	var prop = obj.property;
	if (prop === undefined) return undefined;

	for (var inx = 0; inx < prop.length; inx++) {
		var fld = prop[inx];
		if (( obj[fld] instanceof THREE.Vector3 ) || ( obj[fld] instanceof THREE.Quaternion ) || ( obj[fld] instanceof THREE.Color))
			state[fld] = obj[fld].clone();
		else
			state[fld] = obj[fld];
	}

	state.object = obj;

	return state;
};

undo = function () {
	if (undoSceneStorage.length == 0) return;
	var state = undoSceneStorage.pop();
	redoSceneStorage.push(getSceneState(world.sceneObj.children));
	setSceneState(state);
}

redo = function () {
	if (redoSceneStorage.length == 0) return;
	var state = redoSceneStorage.pop();
	undoSceneStorage.push(getSceneState(world.sceneObj.children));
	setSceneState(state);
}

function addProperty(obj, fieldName, source) {
	obj.__defineGetter__(fieldName, function () {
		return source[fieldName];
	});

	obj.__defineSetter__(fieldName, function (val) {
		source[fieldName] = val;
	});
}

BoxHelper = function (object) {

	var geometry = new THREE.Geometry();

	for (var i = 0; i < 47 + 1; i++)
		geometry.vertices.push(new THREE.Vector3());

	THREE.Line.call(this, geometry, new THREE.LineBasicMaterial({ color: 0xffff00 }), THREE.LinePieces);

	if (object !== undefined) {

		this.update(object);

	}

};

BoxHelper.prototype = Object.create(THREE.Line.prototype);

BoxHelper.prototype.update = function (object) {

	var d = 8;

	var geometry = object.geometry;

	if (geometry.boundingBox === null) {

		geometry.computeBoundingBox();

	}

	var min = geometry.boundingBox.min;
	var max = geometry.boundingBox.max;

	var v = this.geometry.vertices;

	var l = Math.abs(max.x - min.x) / d;
	var h = Math.abs(max.y - min.y) / d;
	var d = Math.abs(max.z - min.z) / d;

	v[0 ].set(max.x, max.y, max.z);
	v[1 ].set(max.x - l, max.y, max.z);
	v[2 ].set(max.x, max.y, max.z);
	v[3 ].set(max.x, max.y - h, max.z);
	v[4 ].set(max.x, max.y, max.z);
	v[5 ].set(max.x, max.y, max.z - d);

	v[6 ].set(min.x, max.y, max.z);
	v[7 ].set(min.x + l, max.y, max.z);
	v[8 ].set(min.x, max.y, max.z);
	v[9 ].set(min.x, max.y - h, max.z);
	v[10].set(min.x, max.y, max.z);
	v[11].set(min.x, max.y, max.z - d);

	v[12].set(min.x, min.y, max.z);
	v[13].set(min.x + l, min.y, max.z);
	v[14].set(min.x, min.y, max.z);
	v[15].set(min.x, min.y + h, max.z);
	v[16].set(min.x, min.y, max.z);
	v[17].set(min.x, min.y, max.z - d);

	v[18].set(min.x, min.y, min.z);
	v[19].set(min.x + l, min.y, min.z);
	v[20].set(min.x, min.y, min.z);
	v[21].set(min.x, min.y + h, min.z);
	v[22].set(min.x, min.y, min.z);
	v[23].set(min.x, min.y, min.z + d);

	v[24].set(max.x, min.y, min.z);
	v[25].set(max.x - l, min.y, min.z);
	v[26].set(max.x, min.y, min.z);
	v[27].set(max.x, min.y + h, min.z);
	v[28].set(max.x, min.y, min.z);
	v[29].set(max.x, min.y, min.z + d);

	v[30].set(max.x, max.y, min.z);
	v[31].set(max.x - l, max.y, min.z);
	v[32].set(max.x, max.y, min.z);
	v[33].set(max.x, max.y - h, min.z);
	v[34].set(max.x, max.y, min.z);
	v[35].set(max.x, max.y, min.z + d);

	v[36].set(min.x, max.y, min.z);
	v[37].set(min.x + l, max.y, min.z);
	v[38].set(min.x, max.y, min.z);
	v[39].set(min.x, max.y - h, min.z);
	v[40].set(min.x, max.y, min.z);
	v[41].set(min.x, max.y, min.z + d);

	v[42].set(max.x, min.y, max.z);
	v[43].set(max.x - l, min.y, max.z);
	v[44].set(max.x, min.y, max.z);
	v[45].set(max.x, min.y + h, max.z);
	v[46].set(max.x, min.y, max.z);
	v[47].set(max.x, min.y, max.z - d);

	this.geometry.computeBoundingSphere();
	this.geometry.verticesNeedUpdate = true;

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

function rgbToString(rgb) {
	return '#' + cap((255 * rgb.r).toString(16)) + cap((255 * rgb.g).toString(16)) + cap((255 * rgb.b).toString(16));
}

function cap(comp) {
	return (comp.length == 1) ? '0' + comp : comp;
}

function getDimension(snp, dim) {
	var cnt = 0;
	var w = snp.getContext('2d').canvas.width;
	var h = snp.getContext('2d').canvas.height;
	var d = snp.getContext('2d').getImageData(0, 0, w, h).data;

	var t,l;
	var r,b;
	var x = y = 0;

	if(dim == undefined) {
		t = l = 9007199254740992;
		r = b = 0;
	}else{
		l = dim.x;
		t = dim.y;
		r = dim.x + dim.w;
		b = dim.y + dim.h;
	}


	for (var i = 0, j = 0, n = d.length; i < n; i += 4, j++) {
		if (d[i + 3] > 0) {
			x = j % w;
			y = (j - x) / w;
			if (x < l)l = x;
			if (y < t)t = y;
			if (x > r)r = x;
			if (y > b)b = y;
			cnt++;
		}
	}

	return cnt?{x: l, y: t, w: r-l, h: b-t, cnt:cnt}:undefined;
//	console.log({x: l, y: t, w: r-l, h: b-t, f:f});
}

function snapshot(d) {
	world.render();

	var surf = E.surface[0];
	var rend = E.srfrnd[0];

	var x = d.x, y = d.y, w = d.w, h = d.h;

	rend.getContext('2d').canvas.width = w;
	rend.getContext('2d').canvas.height = h;
	rend.getContext('2d').clearRect(0, 0, w, h);
	rend.getContext('2d').drawImage(surf, x, y, w, h, 0, 0, w, h);
	return rend;
}

function render(d) {
	snapshot(d).toBlob(saveFrame);
}

function saveFrame(blob) {
	E.cntRFrm |= 0;
	E.cntRFrm += 1;
	saveAs(blob, 'anim_' + E.cntRFrm + '.png');
}

//var mainCanv;
//var rendImg;
//var rendCtx;
//var rendBuff;
//
//function initRender(cnt){
//	mainCanv = $("canvas")[0];
//
//	var width = E.frameCrop.width, height = E.frameCrop.height;
//
//	$('#rnd').attr('width', width);
//	$('#rnd').attr('height', height);
//
//	rendImg = new Image();   // Создать новый объект Image
//	rendCtx = $('#rnd')[0].getContext('2d');
//	rendBuff = new Uint8ClampedArray(width * height * 4 * cnt);
//
//	world.renderer.setClearColor(E.clearColor, 0.0);
//}
//
//function render(inx){
//
//	if(inx < 0 ) return;
//	if(mainCanv  == undefined ) return;
//
//	$('#frameCrop').show();
//
//	var x = E.frameCrop.x, y = E.frameCrop.y, width = E.frameCrop.width, height = E.frameCrop.height;
//	rendImg.src = mainCanv.toDataURL("image/png");
//
//	rendCtx.clearRect(0, 0, width, height);
//
//	rendCtx.drawImage(rendImg, x, y, width, height, 0, 0, width, height);
//	var rendImgBuff = rendCtx.getImageData(0,0, width, height);
//
//	console.log(inx);
//
//	try{
//		rendBuff.set(rendImgBuff.data, rendImgBuff.data.length * inx);
//	}catch (e){
//		console.error(inx);
//	}
//
//}
//
//function endRender(cnt){
//
//	$('#frameCrop').hide();
//
//	var width = E.frameCrop.width, height = E.frameCrop.height;
//
//	world.renderer.setClearColor(E.clearColor, 1.0);
//
//	CanvasTool.PngEncoder(rendBuff, {'width': parseInt(width, 10), 'height': parseInt(height, 10) * cnt * (world.camera.frameCnt==0?1:world.camera.frameCnt + 1)});
//	var a = CanvasTool.PngEncoder.prototype.convertToArray();
//	a = new Uint8Array( a );
//	var blob = new Blob([a]);
//	saveAs(blob, "ainmation.png");
//
//}