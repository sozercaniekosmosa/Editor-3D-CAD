E.getCamera = function(property){

	property = property === undefined ? {} : property;

	var width      = E.surface.width()     || 0;
	var height     = E.surface.height()    || 0;
	var view_angel = property.view_angel   || 45;
	var near       = property.near         || 0.1;
//	var far        = property.far          || 10e30;
	var far        = property.far          || 1e6;
//	var far        = property.far          || 1039;

//	var camera = new THREE.CombinedCamera( width, height, view_angel, near, far, near, far );
	var camera = new THREE.PerspectiveCamera( view_angel, width / height, near, far);

//	camera.frameCnt = 1;

//	camera.setFov(20);

//	camera.position = E.getVector3(property.position, new THREE.Vector3(0, 2200, 0));
	camera.position = E.getVector3(property.position, new THREE.Vector3(-800, 800, 800));

	camera.distance = 0;

	camera.orbit = new THREE.OrbitControls(camera, E.surface.get(0));
	camera.tball = new THREE.TrackballControls(camera, E.surface.get(0));

	camera.orbit.enabled = false;   // здесь необходимо было так сделать тк Input'ы не работали
	camera.tball.enabled = false;   // здесь необходимо было так сделать тк Input'ы не работали

	camera.control = camera.orbit;

	camera.center = function(obj){
		if ((obj === EMPTY)||(obj === undefined))
			this.control.target.set(0,0,0);// = new THREE.Vector3(0, 0, 0);
		else{
			var t = new THREE.Vector3().setFromMatrixPosition(obj).clone();
			this.control.target.set(t.x, t.y, t.z);
		}
	}

	camera.toOrbit = function(){
		this.tball.reset();
		this.tball.enabled = false;
		this.control = this.orbit;
	}

	camera.toTrackBall = function(){
		this.tball.reset();
		this.orbit.enabled = false;
		this.control = this.tball;
	}

	camera.enable = function(){
		this.control.enabled = true;
	}

	camera.disable = function(){
		this.control.enabled = false;
	}

	camera.reset = function(){
		this.control.target.set(0,0,0);
		this.tball.reset();
	}

	camera.update = function(){
		this.control.update();
	}

	camera.storeState = function(){
		camera.s_position = new THREE.Vector3().copy(camera.position);
		camera.s_target = new THREE.Vector3().copy(camera.target);
	}

	camera.restoreState = function(){
		try {
			camera.position = new THREE.Vector3().copy(camera.s_position);
			camera.target = new THREE.Vector3().copy(camera.s_target);
		}catch (e){}
	}

	camera.storeStateFrm = function(){ // lkz ма
		camera.s_position = new THREE.Vector3().copy(camera.position);
		camera.s_target = new THREE.Vector3().copy(camera.target);
	}

	camera.restoreState = function(){
		try {
			camera.position = new THREE.Vector3().copy(camera.s_position);
			camera.target = new THREE.Vector3().copy(camera.s_target);
		}catch (e){}
	}

	return camera;
}