var cube;

function init(surface, srfrnd) {

    E.surface = $(surface);
    E.srfrnd = $(srfrnd);
    E.Input = new E.Input();

    world = new E.World();
	
	anm = new E.Animation({world: world});

    ////------------------------------------------------

    init_body(world.sceneObj);

	ui = new  E.GUI();

	update();
}

function task_processing() {
    for (var i = 0; i < task_pull.length; i++) {
        task_pull[i]();
    }

    window.requestAnimationFrame(task_processing, world.renderer.domElement);
}

function update() {

//	out(E.mode);
//	out( world.sceneControl.modeTransformation);
//	out(world.sceneControl.modeTransformation);

//	out(new Date().getTime())
	E.Input.update();

	if(!E.Input.isMove){
		window.requestAnimationFrame(update, world.renderer.domElement);
		return;
	}

	if(!anm.isRender) world.update();
	anm.update();

	var intersects = (world.sceneControl.intersects.length == 0) ? world.sceneObj.intersects : world.sceneControl.intersects;

	intersects.sort(
		function (a, b) {
			return a.distance - b.distance;
		});

	E.under = (intersects.length > 0) ? intersects[0].object : EMPTY;

	ui.update();

	out( anm.theta * Math.deg);

	window.requestAnimationFrame(update, world.renderer.domElement);
}

function init_body(obj) {

//	return;

    property = new Object();

	obj.addCamera();

	obj.addGreed();

	property.type = AMBIENT;
	obj.addLight(property);

	property = {};
	property.pos = new THREE.Vector3(300, 300, 300);
	property.type = POINT;
	obj.addLight(property);

	property = {};

    property.mesh = createBox(100,50);
    property.escale = new THREE.Vector3(1, 1, 1);
	property.pos = new THREE.Vector3(0, 0, 0);
	property.eparent = undefined;

	var tx = new THREE.ImageUtils.loadTexture( 'pic/1.png' );
//	tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
	tx.repeat.set( 1, 1 );

//	property.material = new THREE.MeshBasicMaterial({map:tx, side: THREE.FrontSide});
//	property.material = new THREE.MeshBasicMaterial({map:tx, color: 0x555555, opacity: 1.0, transparent: true, side: THREE.FrontSide});
//	property.material = new THREE.MeshLambertMaterial({color:0xFFFF00, opacity:1.0, transparent:true, side: THREE.FrontSide});
//  property.material = new THREE.MeshPhongMaterial({map:tx, opacity:1.0, transparent:true, side: THREE.FrontSide});
	property.material = new THREE.MeshPhongMaterial({color:0xFFFF00, opacity:1.0, transparent:true, side: THREE.FrontSide});
//	property.material = new THREE.MeshNormalMaterial();
    property.basis = new THREE.Vector3(0, 50, 0);

    HEAD = obj.addObj(property);
    property.pos = new THREE.Vector3(0, 100, 0);
	property.mesh = createBox(100,50);
    PELVIS = obj.addObj(property);
//
	property.mesh = createBox(100,50);
    SHOULDER_L = obj.addObj(property);
	property.mesh = createBox(100,50);
    FOREARM_L = obj.addObj(property);

}