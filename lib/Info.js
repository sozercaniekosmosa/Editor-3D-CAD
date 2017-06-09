/**
 * Created by admin on 29.11.13.
 */

E.makeInfoRepository = function (scene, world){

	scene.world = world;
    scene.idCount = 0;

// intersection
    scene.projector = new THREE.Projector();
    scene.vector;
    scene.ray;
    scene.intersects = [];

    scene.addObj = function (property) {

        var obj = {};

        obj = property.mesh.clone();
        if (obj === undefined) obj = createBox(40, 100);

        obj.type = property.type;
        obj.name = property.name;
        if (obj.name === undefined) obj.name = "object_" + this.idCount++;
        obj.toString = function () {
            return obj.name;
        };
        property.name = undefined; // for child reset

        obj.style = (property.style === undefined) ? clone_style(matBone) : clone_style(property.style);

        this.add(obj);

        return obj;
    };

    scene.update = function () {

        this.intersects = [];

        for (var inx = 0; inx < this.children.length; inx++) {

            var obj = this.children[inx];

	        if (E.select === EMPTY) {
		        setStyle(obj, 'hide');
		        continue;
	        }

	        switch (E.mode) {
                case EMPTY:
                    break;
                case MODE_SELECT:
	                break;
                case MODE_TRANSFORMATION:
                    break;
                case MODE_CAMERA:
                    break;
            }

    //  View
	        var target = E.select.mLocal;

	        if (E.select.eparent === this.world.sceneObj.primary){
		        setStyle(obj, 'hide');
		        continue;
	        }
	        if (obj.type === LINK_LINE) {
		        setStyle(obj, 'def');
		        var v = new THREE.Vector3().setFromMatrixPosition(E.select.mLocal);
		        var v2 = new THREE.Vector3().setFromMatrixPosition(E.select.eparent.mWorld);
		        obj.geometry.vertices = [v, v2];
		        obj.geometry.verticesNeedUpdate = true;
		        continue;
	        }
	        if (obj.type === LINK_PARENT){
		        setStyle(obj, 'def');
		        target = E.select.eparent.mWorld;
	        }
	        if (obj.type === LINK_CHILD) setStyle(obj, 'def');


	        obj.matrix.identity();

	        var cp = this.world.camera.position.clone();
	        var v = cp.sub((cp.clone().sub(new THREE.Vector3().setFromMatrixPosition(target))).normalize().multiplyScalar(1000));
	        if ((world.sceneControl.mode_global_coord) && (obj.type != SCALE))
		        obj.applyMatrix(new THREE.Matrix4().setPosition(v));
	        else
		        obj.applyMatrix(target.clone().setPosition(v));

	        // Intersect
//	        this.vector = new THREE.Vector3(E.Input.x, E.Input.y, 1);
//	        this.projector.unprojectVector(this.vector, this.world.camera);
//	        this.ray = new THREE.Raycaster(this.world.camera.position, this.vector.sub(this.world.camera.position).normalize());
//	        if ((obj.visible) && (obj.material.opacity > 0.2))this.ray.intersectObject(obj, this.intersects);
        }
//	    this.mode_transformation_last = E.mode_transformation;
    };

    return scene;
}
