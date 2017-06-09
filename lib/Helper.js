/**
 * Created by admin on 29.11.13.
 */

E.makeHelperRepository = function (scene, world){

	scene.world = world;
    scene.idCount = 0;

    var tempVec = new THREE.Vector3();

    scene.addObj = function (property) {

        var obj = {};

        obj = property.mesh;

        obj.type = property.type;
        obj.name = property.name;
        if (obj.name === undefined) obj.name = "object_" + this.idCount++;
        obj.toString = function () {
            return obj.name;
        };
	    obj.zoom = property.zoom | 0;

        property.name = undefined; // for child reset

	    if(property.material !== undefined)
        obj.material = property.material


        this.add(obj);

        return obj;
    };

    scene.update = function () {

//	    return;

        this.intersects = [];

        for (var inx = 0; inx < this.children.length; inx++) {

            var obj = this.children[inx];
	        obj.visible = false;

	        if(E.select.isGhost) continue;
    //  View

	        var target;

		        switch (obj.type){
			        case LINK_LINE:
				        if (E.select === EMPTY) continue;
				        if (E.select.eparent.isPrimary) continue;
				        obj.geometry.vertices[0].copy(tempVec.setFromMatrixPosition(E.select.mLocal));
				        obj.geometry.vertices[1].copy(tempVec.setFromMatrixPosition(E.select.eparent.matrix));
				        obj.geometry.verticesNeedUpdate = true;
				        obj.visible = true;
				        continue;
			        case LINK_PARENT:
				        if (E.select === EMPTY) continue;
				        if (E.select.eparent.isPrimary) continue;
					    target = new THREE.Matrix4().copyPosition(E.select.eparent.matrix);
				        obj.visible = true;
				        break;
			        case LINK_CHILD:
				        if (E.select === EMPTY) continue;
				        if (E.select.eparent.isPrimary) continue;
					    target = new THREE.Matrix4().copyPosition(E.select.mLocal);
				        obj.visible = true;
				        break;
					case PIVOT_LINE:
						if (E.select === EMPTY) continue;
						obj.visible = true;
						obj.geometry.vertices[0].copy(tempVec.setFromMatrixPosition(E.select.matrix));
						obj.geometry.vertices[1].copy(tempVec.setFromMatrixPosition(E.select.mLocal));
						obj.geometry.verticesNeedUpdate = true;
						continue;
			        case PIVOT_OBJ:
				        if (E.select === EMPTY) continue;
				        obj.visible = true;
				        target = new THREE.Matrix4().copyPosition(E.select.matrix);
				        break;
			        case PIVOT_POS:
				        if (E.select === EMPTY) continue;
				        obj.visible = true;
				        target = new THREE.Matrix4().copyPosition(E.select.mLocal);
				        break;
			        case BOX_SELECT:
				        if(E.select === EMPTY) continue;
					    obj.update(E.select);
				        obj.visible = true;
				        continue;

			        case BOX_UNDER:
				        if(E.under === EMPTY) continue;
				        if(E.under.isControl) continue;
					    obj.update(E.under);
				        obj.visible = true;
				        continue;

			        case E.intensity:
				        if(E.select === EMPTY) continue;
				        if(!E.select[E.intensity]) continue;
				        obj.visible = true;

				        target = this.world.camera.matrixWorld;
				        target.copyPosition(E.select.mWorld);

				        var s = new THREE.Vector3().setFromMatrixScale(target);
				        var invScale = new THREE.Vector3(1/s.x, 1/s.y, 1/s.z);
				        target.scale(invScale);
				        s = E.select.intensity+1;
				        s = new THREE.Vector3(s, s, 1);
				        target.scale(s);

				        obj.matrix.identity();
				        obj.applyMatrix(target);

				        continue;

					case E.distance:
				        if(E.select === EMPTY) continue;
				        if(!E.select[E.distance]) continue;
				        obj.visible = true;

				        target = this.world.camera.matrixWorld;
				        target.copyPosition(E.select.mWorld);

				        var s = new THREE.Vector3().setFromMatrixScale(target);
				        var invScale = new THREE.Vector3(1/s.x, 1/s.y, 1/s.z);
				        target.scale(invScale);
				        s = (E.select.distance/1000)+1;
				        s = new THREE.Vector3(s, s, 1);
				        target.scale(s);

				        obj.matrix.identity();
				        obj.applyMatrix(target);

				        continue;
		        }

	        obj.matrix.identity();
	        var cp = this.world.camera.position.clone();
	        var vPos = cp.sub((cp.clone().sub(new THREE.Vector3().setFromMatrixPosition(target))).normalize().multiplyScalar(obj.zoom));
	        if ((world.sceneControl.mode_global_coord) && (obj.type != E.escale))
		        obj.applyMatrix(new THREE.Matrix4().setPosition(vPos));
	        else
		        obj.applyMatrix(target.clone().setPosition(vPos));
//		        obj.applyMatrix(target.clone());

        }
    };

	var zoom = 1000;

	var property = {};

	var matLinkSh = new THREE.MeshBasicMaterial({color:0xFF9900});
	var matLinkLn = new THREE.LineBasicMaterial({color:0xFF9900});
	var matBasisSh = new THREE.MeshBasicMaterial({color:0xCCFF00});
	var matBasisLn = new THREE.LineBasicMaterial({color:0xCCFF00});

	var matBoxSelect = new THREE.LineBasicMaterial({color:0xFFFFFF, opacity:0.7, transparent:true});
	var matBoxUnder = new THREE.LineBasicMaterial({color:0xFFFFFF, opacity:1.0, transparent:true});

	var matIntensity = new THREE.LineBasicMaterial({color:0xFFFFFF});
	var matDistance = new THREE.LineBasicMaterial({color:0xFFFFFF});

	setTransform(property, LINK_LINE, createLine(), matLinkLn, zoom);
	setTransform(property, LINK_CHILD, createSphere(2), matLinkSh, zoom);
	setTransform(property, LINK_PARENT, createSphere(5), matLinkSh, zoom);
	setTransform(property, PIVOT_LINE, createLine(), matBasisLn, zoom);
	setTransform(property, PIVOT_OBJ, createSphere(2), matBasisSh, zoom + 15);
	setTransform(property, PIVOT_POS, createSphere(5), matBasisSh, zoom + 15);

	setTransform(property, BOX_SELECT, new BoxHelper(), matBoxSelect);
	setTransform(property, BOX_UNDER, new BoxHelper(), matBoxUnder);

	setTransform(property, E.intensity, getRing(40, 64), matIntensity);
	setTransform(property, E.distance, getRing(40, 64, 1,-1), matDistance);

	function setTransform(property, type, mesh, material, zoom){
		property.type = type;
		property.name = type;
		property.mesh = mesh;
		property.material = material;
		property.zoom = zoom;

		scene.addObj(property);
	}

	function getRing(r, seg, dot, emp){

		var ang = (Math.PI/180) * (360/seg);

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

		return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 1, linewidth: 3}), THREE.LinePieces);
	}

    return scene;
};
