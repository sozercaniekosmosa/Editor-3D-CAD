/**
 /**
 * Created by admin on 29.11.13.
 */

E.World = function () {

	var _this = this;

// camera
	this.camera = E.empty;

// scene
	this.sceneHelp = E.makeHelperRepository(new THREE.Scene(), this);
	this.sceneObj = E.makeObjectRepository(new THREE.Scene(), this);
	this.sceneControl = E.makeTransformationRepository(new THREE.Scene(), this);

// render
//	this.render = {};
	if (Detector.webgl)
		this.renderer = new THREE.WebGLRenderer({canvas: E.surface[0], antialias: false, preserveDrawingBuffer: true, alpha: true});
	else
		this.renderer = new THREE.CanvasRenderer();

	var width = E.surface.width() || 0;
	var height = E.surface.height() || 0;

	E.surface.css({height: E.surface.height() + 'px'});

	this.renderer.setSize(width, height);
	this.renderer.setClearColor(E.clearColor, 1.0);

	this.renderer.clear();
	this.renderer.autoClear = false;

//	this.resize = function () {	// TODO: привязать к изменению камеры
//		var width = E.surface.width();
//		var height = E.surface.height();
//
//		_this.renderer.setSize(width, height);
//		_this.camera.setSize(width, height);
//		_this.camera.updateProjectionMatrix();
//	}
//	window.addEventListener('resize', this.resize, false);

	this.camera = E.getCamera();

//	this.camera.toOrthographic();
}

E.World.prototype = {
	constructor: E.World,

	render: function () {
		world.renderer.setClearColor(E.clearColor, 0.0);

		this.camera.update();

		this.sceneObj.update();
		this.renderer.clear();
		this.renderer.render(this.sceneObj, this.camera);

		world.renderer.setClearColor(E.clearColor, 1.0);
	},

	update: function () {

		var _this = this;

		this.camera.disable();
		switch (E.mode) {
			case EMPTY:
				break;
			case MODE_SELECT:
				break;
			case MODE_TRANSFORMATION:
				break;
			case MODE_CAMERA:
				this.camera.enable();
				break;
		}

		this.camera.update();

		this.sceneObj.update();

		this.sceneControl.update();

		if (!E.Input.isMove) return;

		this.sceneHelp.update();

		this.renderer.clear();
		this.renderer.render(this.sceneObj, this.camera);
		this.renderer.clear(false, true, false); // clear depth buffer
		this.renderer.render(this.sceneHelp, this.camera);
		this.renderer.clear(false, true, false); // clear depth buffer
		this.renderer.render(this.sceneControl, this.camera);

	}
}