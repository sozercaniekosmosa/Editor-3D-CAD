/**
 * Created by admin on 29.11.13.
 */

E.makeTransformationRepository = function (scene, world){

	scene.world = world;
	scene.idCount = 0;

	scene.mode_global_coord = false;
	scene.mode_basis_change = false;
	scene.modeTransformation = E.empty;
	scene.mode_snap_pos = false;
	scene.mode_snap_ang = false;

// intersection
	scene.projector = new THREE.Projector();
	scene.vector = {};
	scene.ray = {};
	scene.intersects = [];

	scene.dPos = new THREE.Vector3(0,0,0);
	scene.lastDeltaAng = 0;

	scene.clickPos = undefined;
	scene.buffPos = undefined;
	scene.buffBasis = undefined;
	scene.angelLast = undefined;

	scene.mTemp = new THREE.Matrix4();
	scene.vTemp = new THREE.Vector3();
	scene.sign = 0;

	scene.choise = EMPTY;


	scene.addObj = function (property) {

		var obj = {};
		var plane = {};

		obj = property.mesh;

		if (obj === undefined) obj = createBox(40, 100);

		obj.name = property.name;
		if (obj.name === undefined) obj.name = "object_" + this.idCount++;
		obj.toString = function () {
			return obj.name;
		};

		property.name = undefined; // for child reset

		obj.style = property.style;

		obj.choise = false;
		obj.extend = property.extend;
		obj.type = property.type;

		obj.isControl = true;
		obj.isIntersect = true;

		obj.isBillboard = ( property.isBillboard !== undefined );

		if(property.axis !== undefined){
			obj.axis = property.axis;
		}

		if(property.planeA !== undefined){
			plane = property.planeA;
			obj.planeA = plane;
			plane.toString = function () {
				return obj.name+' planeA';
			};
			plane.isPlane = true;
			plane.style = property.style;

//			this.add( plane );
		}

		if(property.planeB !== undefined){
			plane = property.planeB;
			obj.planeB = plane;
			plane.toString = function () {
				return obj.name+' planeB';
			};
			plane.isPlane = true;
			plane.style = property.style;

//			this.add( plane );
		}

		this.add(obj);

		return obj;
	};

	scene.update = function () {

		var target;
		this.intersects = [];

		switch (E.mode) {
			case EMPTY:
				break;
			case MODE_SELECT:
				if ((E.Input.downNow[1]) && (E.under != EMPTY) && (E.under.isControl) && E.Input.isEqual) {
					E.mode = MODE_TRANSFORMATION;
					this.choise = E.under;
				}
				break;
			case MODE_TRANSFORMATION:
				if (this.choise != EMPTY) {
					if (E.Input.downNow[1]) {
						this.itemHistory = getSceneState(world.sceneObj.children);
					}
					if (E.Input.down[1]) {

						if(!this.isChangeObj) this.isChangeObj = ( (Math.abs(E.Input.dx) + Math.abs(E.Input.dy) ) > 0 );

						this.choise.extend.call(this, E.select);
						setStyle(this.choise, on);
					}
					if (E.Input.up[1]) {
						E.mode = MODE_RETURN;

						this.clickPos = undefined;
						this.buffPos = undefined;
						this.angelLast = undefined;
						this.lastBasis = undefined;

						if (this.isChangeObj) {
							this.isChangeObj = false;
							writeHistory(this.itemHistory);
						}

						this.choise = EMPTY;
					}
				}
				break;
			case MODE_CAMERA:
				break;
		}

		for (var inx = 0; inx < this.children.length; inx++) {

			var obj = this.children[inx];

			if(obj.isPlane){
				continue;
			}

			if( (E.select === EMPTY) || (E.select.isGhost) ){
				setStyle(obj, hide);
				continue;
			}

			switch (E.mode) {
				case EMPTY:
					continue;
					break;
				case MODE_SELECT:
					setStyle(obj, hide);
					if(E.select[this.modeTransformation] === undefined){
						this.modeTransformation = E.empty;
						continue;
					}
					setStyle(obj, ((obj.type === this.modeTransformation) ? def : hide));
					if (E.under == obj) setStyle(E.under, on);
					break;
				case MODE_TRANSFORMATION:
					break;
				case MODE_CAMERA:
					break;
			}

	//  View

			if( obj.isBillboard){
				var target = (this.world.camera.matrixWorld).copyPosition(E.select.mWorld);
			}else {
				target = (world.sceneControl.mode_basis_change) && (obj.type != E.ang) ? E.select.mWorld : E.select.mLocal;
			}

			obj.matrix.identity();
			var cp = this.world.camera.position.clone();
			var v = cp.sub((cp.clone().sub(new THREE.Vector3().setFromMatrixPosition(target))).normalize().multiplyScalar(1300));
			if ((world.sceneControl.mode_global_coord) && (obj.type != E.escale))
				obj.applyMatrix(new THREE.Matrix4().setPosition(v));
			else
				obj.applyMatrix(target.clone().setPosition(v));
//			obj.applyMatrix(target);

	// Intersect

			this.vector = new THREE.Vector3(E.Input.x, E.Input.y, 1);
			this.projector.unprojectVector(this.vector, this.world.camera);
			this.ray = new THREE.Raycaster(this.world.camera.position, this.vector.sub(this.world.camera.position).normalize());

			if (obj.isIntersect){
				if (this.ray.intersectObjectMy(obj.children[0], this.intersects))
					this.intersects[this.intersects.length-1].object = obj;
			}

		}

	};

	scene.translate = function (obj) {

//-------- VARS

		var intersects = [];

		var ctrl = this.choise;

		var planeA = ctrl.planeA;
		var planeB = ctrl.planeB;

		var axis = this.choise.axis.clone();
		var is2Axis = axis.lengthManhattan() > 1;
		var activePlane = (is2Axis)?planeA:this.getActivePlane(this.choise) ? planeA : planeB;

		var xPos;
		var delta;

// -------------------------

		if(this.clickPos === undefined) this.setActivePlane(ctrl, obj);

		if (this.ray.intersectObjectMy(activePlane, intersects)) {

			xPos = intersects[0].point;

			if(this.clickPos === undefined){
				this.clickPos =  xPos.clone();
				this.buffPos = obj.pos.clone();
				this.buffBasis = obj.basis.clone();

			}

			delta = xPos.sub(this.clickPos);

			if (is2Axis) {

				if (this.mode_basis_change)
					obj.basis = this.getDeltaTwoAxisBasis(obj, delta).add(this.buffBasis);
				else
					obj.pos = this.getDeltaTwoAxisPos(obj, delta).add(this.buffPos);

			} else {

				if (this.mode_basis_change)
					obj.basis = (this.mode_global_coord) ? this.getDeltaOneAxisGlobalBasis(obj, delta, axis).add(this.buffBasis) : obj.basis = this.getDeltaOneAxisLocalBasis(obj, delta, axis).add(this.buffBasis);
				else
					obj.pos = (this.mode_global_coord) ? this.getDeltaOneAxisGlobalPos(obj, delta, axis).add(this.buffPos) : obj.pos = this.getDeltaOneAxisLocalPos(obj, delta, axis).add(this.buffPos);
			}

			if(this.mode_snap_pos){
				if (this.mode_basis_change){
					obj.basis = E.quantization(obj.basis, E.defGridSnap);
				}else{
					obj.pos = E.quantization(obj.pos, E.defGridSnap);
				}
			}

		}else{
			this.setActivePlane(ctrl, obj);
		}
	};

	scene.basisOperation = function(obj, basis){
		if(this.lastBasis === undefined) this.lastBasis = basis;
		var offset = basis.clone().sub(this.lastBasis);
		this.lastBasis = basis;
		obj.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( offset.x, offset.y, offset.z ) );
		obj.geometry.verticesNeedUpdate = true;
	};

	scene.getDeltaTwoAxisBasis = function (obj, delta) {
		return delta.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(obj.matrix)));
	};

	scene.getDeltaTwoAxisPos = function (obj, delta) {
		delta.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(obj.matrix)));
		return delta.applyMatrix4(this.mTemp.makeRotationFromQuaternion(obj.ang));
	};

	scene.getDeltaOneAxisGlobalBasis = function (obj, delta, axis) {
		axis.projectVec(delta); // проецируем вектор на вектор
		return axis.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(obj.matrix))); // возвращаем прежний угол вектора
	};

	scene.getDeltaOneAxisLocalBasis = function (obj, delta, axis) {
		axis.applyMatrix4(this.mTemp.extractRotation(obj.matrix)); // выставляем угол вектора как у видимой оси
		axis.projectVec(delta); // проецируем вектор на вектор
		return axis.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(obj.matrix))); // возвращаем прежний угол вектора
	};

	scene.getDeltaOneAxisGlobalPos = function (obj, delta, axis) {
		axis.projectVec(delta); // проецируем вектор на вектор
		return axis.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(obj.eparent.matrix)));
	};

	scene.getDeltaOneAxisLocalPos = function (obj, delta, axis) {
		axis.applyMatrix4(this.mTemp.extractRotation(obj.matrix)); // выставляем угол вектора как у видимой оси
		axis.projectVec(delta); // проецируем вектор на вектор
		axis.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(obj.matrix))); // возвращаем прежний угол вектора
		return axis.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(obj.ang));
	};

	scene.setActivePlane = function (ctrl, obj) {

		var planeA = ctrl.planeA;
		var planeB = ctrl.planeB;
		var matrix = (this.mode_global_coord) ? newMatrix().copyPosition(obj.matrix) : obj.matrix;

		planeA.matrix.identity();
		planeA.applyMatrix(matrix);
		planeA.updateMatrixWorld();
		if (planeB !== undefined) {
			planeB.matrix.identity();
			planeB.applyMatrix(matrix);
			planeB.updateMatrixWorld();
		}
	};

	scene.getActivePlane = function(ctrl){

		var axis = ctrl.axis;

		var eye = new THREE.Vector3();
		eye.copy( world.camera.position ).sub( new THREE.Vector3().setFromMatrixPosition(ctrl.matrixWorld) ).normalize();

		eye.applyProjection( this.mTemp.getInverse( this.mTemp.extractRotation( ctrl.planeA.matrixWorld) ) );

		if(axis.x > 0) return (Math.abs(eye.y) < Math.abs(eye.z));
		if(axis.y > 0) return (Math.abs(eye.x) < Math.abs(eye.z));
		if(axis.z > 0) return (Math.abs(eye.x) < Math.abs(eye.y));

	};

	scene.intensityLight = function (obj) {
		var ctrl = this.choise;
		var div = 100;

		obj.intensity -= E.Input.dy/div;

		if(obj.intensity < 0.0){
			obj.intensity = 0.0;
		}

	}

	scene.distanceLight = function (obj) {
		var ctrl = this.choise;

		obj.distance -= E.Input.dy*10;

		if(obj.distance < 0.0){
			obj.distance = 0.0;
		}

	}

	scene.scale = function (obj) {

		var ctrl = this.choise;
		var limit = 0.001;
		var div = 100;

		if (ctrl.planeA === undefined) {
			obj.escale.add((new THREE.Vector3(-E.Input.dy, -E.Input.dy, -E.Input.dy)).divideScalar(div));
		} else {
			var intersects = [];
			var planeA = ctrl.planeA;
			var planeB = ctrl.planeB;

			var axis = this.choise.axis.clone();

			var xPos;
			var delta;

			if (this.clickPos === undefined) this.setActivePlane(ctrl, obj);

			this.ray.intersectObjectMy(this.getActivePlane(this.choise) ? planeA : planeB, intersects);

			if (intersects.length > 0) {

				xPos = intersects[0].point;

				if (this.clickPos === undefined) {
					this.clickPos = xPos.clone();
					this.buffPos = obj.escale.clone();
				}

				delta = xPos.sub(this.clickPos);

				axis.applyMatrix4(this.mTemp.extractRotation(obj.matrix)); // выставляем угол вектора как у видимой оси
				axis.projectVec(delta); // проецируем вектор на вектор
				axis.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(obj.matrix))); // возвращаем прежний угол вектора

				obj.escale = (axis.divideScalar(div)).add(this.buffPos);

			} else {
				this.setActivePlane(ctrl, obj);
			}
		}

		obj.escale.x = obj.escale.x < limit ? limit : obj.escale.x;
		obj.escale.y = obj.escale.y < limit ? limit : obj.escale.y;
		obj.escale.z = obj.escale.z < limit ? limit : obj.escale.z;

	};

	scene.rotate = function (obj) {

//-------- VARS

		var intersects = [];

		var ctrl = this.choise;
		var planeA = ctrl.planeA;
		var axis = this.choise.axis.clone();
		var radius;
		var xPos;
		var angel;

// -------------------------

		if(this.angelLast === undefined){
			this.setActivePlane(ctrl, obj);
			var vA = planeA.geometry.vertices[1].clone().sub(planeA.geometry.vertices[0]);
			var vB = planeA.geometry.vertices[2].clone().sub(planeA.geometry.vertices[0]);
			var n = new THREE.Vector3().crossVectors(vA, vB);
			if (!world.sceneControl.mode_global_coord) n.applyMatrix4(newMatrix().extractRotation(obj.matrix));

			var o = new THREE.Vector3().setFromMatrixPosition(obj.matrix);
			var cp = this.world.camera.position.clone();
			var v = cp.sub(o).normalize();

			this.sign = (v.dot(n) > 0 ) ? -1 : 1;
		}

		this.ray.intersectObjectMy(planeA, intersects);

		if (intersects.length > 0) {

			xPos = intersects[0].point;

			radius = xPos.sub(newVector().setFromMatrixPosition(obj.mLocal));
			radius.applyMatrix4(this.mTemp.getInverse(this.mTemp.extractRotation(world.camera.matrix)));
			angel = Math.atan2( radius.y, radius.x );

			if(this.angelLast === undefined) this.angelLast = angel;

			var deltaAng = (angel - this.angelLast) * this.sign;
			this.angelLast = angel;

			if (this.mode_snap_ang) {
				if (this.objLast === undefined) this.objLast = {};

				if (this.objLast !== obj) this.dAng = 0;

				this.objLast = obj;
				this.dAng += deltaAng;

				if ((deltaAng = this.dAng - this.dAng % (Math.rad * E.defAngSnap)) == 0) return;

				this.dAng = 0;
			}

			if (world.sceneControl.mode_global_coord) axis = axis.applyMatrix4(new THREE.Matrix4().getInverse(new THREE.Matrix4().extractRotation(obj.matrix)));
			obj.ang.multiply(new THREE.Quaternion().setFromAxisAngle(axis, deltaAng));
//			out(new THREE.Euler().setFromQuaternion(obj.ang) );

		}else{
			this.setActivePlane(ctrl, obj);
		}

	};

	var a = Math.PI/2;
	var sz = 1e30;

	var hide = 0;
	var def = 1;
	var on = 2;

	function setStyle(obj, inx){
		if(obj === undefined) inx = def;
		applyStyle(obj, inx);

		for (var i = 0; i < obj.children.length; i++) applyStyle(obj.children[i], inx);
	}

	function applyStyle(obj, inx){
		if(inx == hide){
			obj.isIntersect = obj.visible = false;
		}else{
			obj.isIntersect = obj.visible = true;
			if(obj.style === undefined){
				obj.isIntersect = obj.visible = false;
				return;
			}
			obj.material = obj.style[inx];
		}
	}

	function getStyleLine(color, alphDef, alphOn){
		if(alphDef === undefined) alphDef = 1.0;
		if(alphOn === undefined) alphOn = 1.0;
		return [
			0,
			new THREE.LineBasicMaterial({color:color, opacity:alphDef, transparent:true}),
			new THREE.LineBasicMaterial({color:0xFFFF00, opacity:alphOn, transparent:true})
			];
	}

	function getStyle(color, alphDef, alphOn){
		if(alphDef === undefined) alphDef = 1.0;
		if(alphOn === undefined) alphOn = 1.0;
		return [
			0,
			new THREE.MeshBasicMaterial({color:color, opacity:alphDef, transparent:true, side: THREE.FrontSide}),
			new THREE.MeshBasicMaterial({color:0xFFFF00, opacity:alphOn, transparent:true, side: THREE.FrontSide})
			];
	}

	function getStylePlane(color){
		return [
			0,
			new THREE.MeshBasicMaterial({color:color, opacity:1.0, transparent:true, side: THREE.BackSide}),
			new THREE.MeshBasicMaterial({color:0xFFFF00, opacity:1.0, transparent:true, side: THREE.BackSide})
			];
	}

	var matScale = [
		0,
		new THREE.MeshBasicMaterial({color:0xFFFF00, opacity:0.5, transparent:true, side: THREE.FrontSide}),
		new THREE.MeshBasicMaterial({color:0xFFFF00, opacity:1.0, transparent:true, side: THREE.FrontSide})
	];

	var matHandlePlane = [
		0,
		new THREE.MeshBasicMaterial({color:0xFFFF00, opacity:0.1, transparent:true, side: THREE.DoubleSide}),
		new THREE.MeshBasicMaterial({color:0xFFFF00, opacity:0.3, transparent:true, side: THREE.DoubleSide})
	];

	var red = 0xFF0000;
	var green = 0x00FF00;
	var blue = 0x0000FF;
	var yellow = 0xFFFF00;

	var property = {};

	property.type	=	E.ang;

	setTransform(property, "ROTATE_X",    createRot(0, 0, a),      getStyle(red),           scene.rotate, new THREE.Vector3(1, 0, 0),  createPlaneAdd( new THREE.Vector3(0,1,0), a, sz ));
	setTransform(property, "ROTATE_Y",    createRot(0, 0, 0),      getStyle(green),         scene.rotate, new THREE.Vector3(0, 1, 0),  createPlaneAdd( new THREE.Vector3(1,0,0), -a, sz ));
	setTransform(property, "ROTATE_Z",    createRot(a, 0, 0),      getStyle(blue),          scene.rotate, new THREE.Vector3(0, 0, 1),  createPlaneAdd( new THREE.Vector3(0,0,0), 0, sz ));

	property.type	=	E.pos;

	setTransform(property, "TRANSLATE_X", createArrow(0, 0, -a),   getStyle(red),           scene.translate,    new THREE.Vector3(1,0,0),  createPlaneAdd( new THREE.Vector3(0,0,0), 0, sz ), createPlaneAdd( new THREE.Vector3(1,0,0), a, sz ));
	setTransform(property, "TRANSLATE_Y", createArrow(0, 0, 0),    getStyle(green),         scene.translate,    new THREE.Vector3(0,1,0),  createPlaneAdd( new THREE.Vector3(0,0,1), 0, sz ), createPlaneAdd( new THREE.Vector3(0,1,0), a, sz ));
	setTransform(property, "TRANSLATE_Z", createArrow(a, 0, 0),    getStyle(blue),          scene.translate,    new THREE.Vector3(0,0,1),  createPlaneAdd( new THREE.Vector3(1,0,0), a, sz ), createPlaneAdd( new THREE.Vector3(0,1,0), a, sz ));

	setTransform(property, "TRANSLATE_XY",createPlane(0, 0, 0),    getStylePlane(yellow),   scene.translate,    new THREE.Vector3(1,1,0),  createPlaneAdd( new THREE.Vector3(0,0,0), 0, sz ));
	setTransform(property, "TRANSLATE_XZ",createPlane(a, 0, 0),    getStylePlane(yellow),   scene.translate,    new THREE.Vector3(1,0,1),  createPlaneAdd( new THREE.Vector3(1,0,0), a, sz ));
	setTransform(property, "TRANSLATE_YZ",createPlane(0, -a, 0),   getStylePlane(yellow),   scene.translate,    new THREE.Vector3(0,1,1),  createPlaneAdd( new THREE.Vector3(0,1,0), a, sz ));

	property.type	=	E.escale;

	setTransform(property, "SCALE_X",     createScale(0, 0, -a),   getStyle(red),           scene.scale,                new THREE.Vector3(1,0,0),   createPlaneAdd( new THREE.Vector3(0,0,0), 0, sz ), createPlaneAdd( new THREE.Vector3(1,0,0), a, sz ));
	setTransform(property, "SCALE_Y",     createScale(0, 0, 0),    getStyle(green),         scene.scale,                new THREE.Vector3(0,1,0),   createPlaneAdd( new THREE.Vector3(0,0,1), 0, sz ), createPlaneAdd( new THREE.Vector3(0,1,0), a, sz ));
	setTransform(property, "SCALE_Z",     createScale(a, 0, 0),    getStyle(blue),          scene.scale,                new THREE.Vector3(0,0,1),   createPlaneAdd( new THREE.Vector3(1,0,0), a, sz ), createPlaneAdd( new THREE.Vector3(0,1,0), a, sz ));

	setTransform(property, "escale",       createCube(30),          matScale,                scene.scale);

	property.type	=	E.intensity;
	setTransformBillboard(property, "intensity",   createCircle(30, 16),  getStyleLine(yellow), scene.intensityLight);

	property.type	=	E.distance;
	setTransformBillboard(property, "distance",    createCircle(30, 16, 1, -1),  getStyleLine(yellow), scene.distanceLight);

	function setTransformBillboard(property, name, mesh, style, ex){
		setTransform(property, name, mesh, style, ex, undefined, undefined, undefined, true);
	};
	function setTransform(property, name, mesh, style, ex, axis, planeA, planeB, isBillboard){
		property.name = name;
		property.mesh = mesh;
		property.style = style;
		property.extend = ex;
		property.axis = axis;
		property.planeA = planeA;
		property.planeB = planeB;
		property.isBillboard = isBillboard;

		scene.addObj(property);
	}


	function createCircle(r, seg, dot, emp){

		if( (dot === undefined) || (dot > 1.0)) dot = 1.0;
		if( (emp === undefined) || (emp > 1.0)) emp = 0.0;

		var ang = (Math.PI/180) * (360/seg);

		var geometry = new THREE.Geometry();
		geometry.dynamic = true;

		for(var i=0; i<seg; i++){
			geometry.vertices.push(new THREE.Vector3(r * Math.sin(ang*i),r * Math.cos(ang*i),0));
			i+=dot;
			geometry.vertices.push(new THREE.Vector3(r * Math.sin(ang*i),r * Math.cos(ang*i),0));
			i+=emp;
		}
		geometry.verticesNeedUpdate = true;

		var mesh = new THREE.Line(geometry);


		geometry = new THREE.CircleGeometry(r,16);

		var meshHand = new THREE.Mesh(geometry);
		mesh = mergeObj(mesh, meshHand, 0, 0, 0);

		mesh.children[0].style = matHandlePlane;

		return mesh;
	}

	function createRot(x, y, z) {
//		var rotOpVis = {s: 114, h: 180, k: 1.005, det: 45};
		var rotOpVis = {s: 114, h: 150, k: 1.01, det: 45};
		var rotOpHand = {s: 105, h: 7, k: 1.27, det: 16};

		function createRingRotate(x, y, z, op) {

			var s = op.s;

			var h = op.h;
			var k = op.k;

			var det = op.det;

			var r2,r;
			r = r2 = s;

			var geometry = new THREE.CylinderGeometry(
				r,			// radiusTop
				r2*k,		// radiusBottom
				s/h,		// height
				det,		// radialSegments
				1,			// heightSegments
				true);		// openEnded
			geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, s/h/2, 0 ) );

			var geometry2 = new THREE.CylinderGeometry(
				r*k,	    // radiusTop
				r2,			// radiusBottom
				s/h,		// heighta
				det,		// radialSegments
				1,			// heightSegments
				true);		// openEnded
			geometry2.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -s/h/2, 0 ) );

			THREE.GeometryUtils.merge(geometry, geometry2);

			transform(geometry, 0, 0, 0, x, y, z);

			return new THREE.Mesh(geometry);
		}

		var mesh = createRingRotate(x, y, z, rotOpVis);
		var meshHand = createRingRotate(x, y, z, rotOpHand);

		return mergeObj(mesh, meshHand, x, y, z);
	}

	function createArrow(x,y,z) {
		var s = 100;
		var r = 50;
		var geometry = new THREE.CylinderGeometry(0.6, 0.6, s, 3, 1, false);
		var geometry2 = new THREE.CylinderGeometry(0, s/r*1.7, s / 4, 32, 1, false);

		transform(geometry2, 0, s/2, 0, 0, 0, 0);

		THREE.GeometryUtils.merge(geometry, geometry2);

		transform(geometry, 0, s/2, 0, x, y, z);

		var mesh = new THREE.Mesh(geometry);

		geometry = new THREE.CylinderGeometry(s/r*5, s/r*5, s, 4, 1, false);

		transform(geometry, 0, s/2, 0, x, y, z);

		var meshHand = new THREE.Mesh(geometry);

		return mergeObj(mesh, meshHand, x, y, z);
	}

	function createPlane(x, y, z){

		var size = 50;

		var geometry = new THREE.CylinderGeometry(0.6, 0.6, size, 3, 1, false);

		transform(geometry, size, size/2, 0, 0, 0, 0);

		var geometry2 = new THREE.CylinderGeometry(0.6, 0.6, size, 3, 1, false);

		transform(geometry2, 0, 0, 0, 0, 0, Math.PI/2);
		transform(geometry2, size/2, size, 0, 0, 0, 0);

		THREE.GeometryUtils.merge(geometry, geometry2);

		transform(geometry, 0, 0, 0, x, y, z);

		var mesh = new THREE.Mesh(geometry);


		geometry = new THREE.PlaneGeometry(size, size);

		transform(geometry, size/2, size/2, 0, x, y, z);

		var meshHand = new THREE.Mesh(geometry);
		mesh = mergeObj(mesh, meshHand, x, y, z);

		mesh.children[0].style = matHandlePlane;

		return mesh;
	}

	function createScale(x, y, z) {
		var s = 170;
		var geometry = new THREE.CylinderGeometry(0.6, 0.6, s - s / 3, 3, 1, false);
		var geometry2 = new THREE.SphereGeometry( 5, 32, 16 );

		transform(geometry2, 0, s/3, 0, 0, 0, 0);

		THREE.GeometryUtils.merge(geometry, geometry2);

		transform(geometry, 0, s/3, 0, x, y, z);

		var mesh = new THREE.Mesh(geometry);
		geometry = new THREE.CylinderGeometry(10, 10, s - s / 3, 4, 1, false);

		transform(geometry, 0, s/3, 0, x, y, z);

		var meshHand = new THREE.Mesh(geometry);

		return mergeObj(mesh, meshHand, x, y, z);
	}

	function createCube(s) {
		var geometry = new THREE.CubeGeometry(s, s, s);
		transform(geometry,s/2,s/2,s/2,0,0,0);
		var mesh = new THREE.Mesh(geometry);

		geometry = new THREE.CubeGeometry(s, s, s);
		transform(geometry,s/2,s/2,s/2,0,0,0);
		var meshHand = new THREE.Mesh(geometry);

		return mergeObj(mesh, meshHand, 0, 0, 0);
	}

	function createSphere(s) {
		var geometry = new THREE.SphereGeometry( s, 32, 16 );
		var mesh = new THREE.Mesh(geometry);

		s *= 2;

		geometry = new THREE.SphereGeometry( s, 8, 8 );
		var meshHand = new THREE.Mesh(geometry);

		return mergeObj(mesh, meshHand, 0, 0, 0);
	}

	function transform(g, x, y, z, ax, ay, az){
		g.applyMatrix( new THREE.Matrix4().makeTranslation(x, y, z));
		g.applyMatrix( new THREE.Matrix4().makeRotationX(ax));
		g.applyMatrix( new THREE.Matrix4().makeRotationY(ay));
		g.applyMatrix( new THREE.Matrix4().makeRotationZ(az));
	}

	function mergeObj(mesh, meshHand, x, y, z){

		mesh.add(meshHand);

		var axis = '';
		if(x > 1) axis = 'x';
		if(y > 1) axis = 'y';
		if(z > 1) axis = 'z';

		mesh.children[0].name = 'handle_' + axis;

		return mesh;
	}

	function assignObj(obj){
		for(var key in obj)
			if (obj.hasOwnProperty(key)){
				if(scene[key] !== undefined) alert(key);
				scene[key] = obj[key];
			}
	}

	return scene;
};