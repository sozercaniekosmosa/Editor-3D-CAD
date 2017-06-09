E.makeObjectRepository = function(scene, world){

	scene.world = world;

    scene.idCount = 0;

	scene.idLightCount = 0; // счетчик источников света

	scene.modeConnectBones = false;
	scene.modeDisconnectBone = false;
	scene.choiseParent = EMPTY;

    // intersection
    scene.projector = new THREE.Projector();
    scene.vector = {};
    scene.ray = {};
    scene.intersects = [];

	scene.primary = {
		isPrimary: true,
		matrix:    new THREE.Matrix4(),
		mWorld:    new THREE.Matrix4(),
		mLocal:    new THREE.Matrix4(),
		pos:       new THREE.Vector3(),
		basis:     new THREE.Vector3(),
		ang:       new THREE.Vector4(),
		name:      "none"
	};

    scene.addGreed = function (dimention, cell) {

	    if (dimention === undefined) dimention = 200;
	    if (cell === undefined) cell = 50;

	    var obj = new THREE.GridHelper(dimention, cell);
//	    obj.mesh.setColors();
	    obj.isGhost = true;
	    E.greed = obj;
	    scene.add(obj);
    }

	scene.addLight = function ( settings ) {
		var obj = {};
		var property = {};
		var light;


		var color = settings.color;
		if (color === undefined) color = 0xffffff;

		var type = settings.type;
		if (type === undefined) type = POINT;

		switch (type){
			case    POINT:

				var light = new THREE.PointLight(color);
				var sun = getSun(10, 16, (light.color ).multiplyScalar( light.intensity ) );

				sun.material.color = light.color;

				obj = new THREE.Mesh( new THREE.CubeGeometry( 50, 50, 50 ) );
				obj.visible = false;

				obj.billboard = sun;

				obj.add(sun);
				obj.add(light);

				addProperty(obj, 'color', light.color);
				addProperty(obj, 'intensity', light);
				addProperty(obj, 'distance', light);

				this.ambient.color = new THREE.Color().setHex(0x0);
				break;
			case    SPOT:
				light = new THREE.SpotLight(color);

				var sun = getSun(10, 16, (light.color ).multiplyScalar( light.intensity ) );

				sun.material.color = light.color;

				obj = new THREE.Mesh( new THREE.CubeGeometry( 50, 50, 50 ) );
				obj.visible = false;

				obj.billboard = sun;

				obj.add(sun);
				obj.add(light);

				addProperty(obj, 'color', light.color);
				addProperty(obj, 'intensity', light);
				addProperty(obj, 'distance', light);
				break;
			case    HEMISPHERE:
				light = new THREE.HemisphereLight(0xffffff);
				break;
			case    DIRECTIONAL:
				light = new THREE.DirectionalLight(0xffffff);
				break;
			case    AREA:
				light = new THREE.AreaLight(0xffffff);
				break;
			case    AMBIENT:
				light = new THREE.AmbientLight(0xffffff);
				obj = new THREE.Mesh( new THREE.CubeGeometry( 50, 50, 50 ) );
				obj.add(light);
				obj.visible = false;
				obj.isGhost = true;
				this.ambient = light;
				this.idLightCount--;
				break;
		}

		obj.isLight = true;
		obj.isObject = true;

		obj.mWorld = new THREE.Matrix4();
		obj.mLocal = new THREE.Matrix4();

		obj.escale = E.getVector3(settings.escale, new THREE.Vector3(1,1,1)).clone();

		addProperty(obj, 'header_light');
		addProperty(obj, 'pos', E.getVector3(settings.pos).clone());
		addProperty(obj, 'basis', E.getVector3(settings.basis).clone());
		addProperty(obj, 'ang', E.getQuaternion(settings.ang).clone());
		addProperty(obj, 'eparent', (settings.eparent === undefined) ? this.primary : settings.eparent);

		settings.eparent = obj; // for child

		obj.name = settings.name;
		addProperty(obj, 'name', settings.name);
		if(obj.name === undefined) obj.name = "light_" + this.idLightCount;
		this.idLightCount++;
		obj.toString = function(){ return obj.name; };
		settings.name = undefined; // reset for child

		scene.add(obj);

		this.children.all(function(obj){
			obj.material.needsUpdate = true;
		});

		return obj;
	}

	scene.addObj = function ( settings ) {

		var obj = {};


		obj = settings.mesh.clone();

		obj.mWorld = new THREE.Matrix4();
		obj.mLocal = new THREE.Matrix4();

		addProperty(obj, 'header_object');
		addProperty(obj, 'pos', E.getVector3(settings.pos).clone());
		addProperty(obj, 'basis', E.getVector3(settings.basis).clone());
		addProperty(obj, 'ang', E.getQuaternion(settings.ang).clone());
		addProperty(obj, 'escale', E.getVector3(settings.escale, new THREE.Vector3(1,1,1)).clone());
		addProperty(obj, 'eparent', (settings.eparent === undefined) ? this.primary : settings.eparent);

		settings.eparent = obj; // for child

		obj.name = settings.name;

		addProperty(obj, 'name', settings.name);

		if(obj.name === undefined) obj.name = "object_" + this.idCount++;
		obj.toString = function(){ return obj.name; };
		settings.name = undefined; // reset for child

		if(settings.material !== undefined){
			obj.material = settings.material.clone();
			addProperty(obj, 'opacity', obj.material);
		}

		obj.isObject = true;

		if((settings.basis !== undefined) && (settings.basis.length() > 0)){ // преобразуем геометрию если базис изменился
			var offset = settings.basis;
			obj.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( offset.x, offset.y, offset.z ) );
			obj.geometry.verticesNeedUpdate = true;
			obj.basis = new THREE.Vector3();
		}

		scene.add(obj);
		return obj;
	};

	scene.addCamera = function () {

		world.camera.isGhost = true;
		world.camera.eparent = {};
		world.camera.eparent.isPrimary = true;
		world.camera.property = [];

		addProperty(world.camera, 'header_camera');
		addProperty(world.camera, 'target', world.camera.control.target);
		addProperty(world.camera, 'position', world.camera.position);

	};

	scene.deleteObj = function (obj) {

		if(obj == E.empty) return;

		if(obj.isLight){
			this.idLightCount--;
			if(this.idLightCount == 0) this.ambient.color = new THREE.Color().setHex(0xffffff);
		}

		for (var inx = 0; inx < this.children.length; inx++) {
			if(this.children[inx].eparent == obj){
				this.children[inx].eparent = this.primary;
				this.children[inx].pos = new THREE.Vector3().setFromMatrixPosition(this.children[inx].mLocal);
			}
		}
		this.remove(obj);

		E.mode = MODE_RETURN;
		E.select = EMPTY;

	}

    scene.update = function(){

        this.intersects = [];

	    E.selectLast = E.select;

	    switch (E.mode) {
		    case EMPTY:
			    this.modeConnectBones = false;
			    if ((E.Input.click[1]) && (E.under != EMPTY) && (E.under.isObject)) {
				    E.select = E.under;
				    E.mode = MODE_SELECT;
				    break;
			    }
			    break;
		    case MODE_SELECT:
			    if (E.Input.click[1]) {
				    if (E.under == EMPTY) {
					    E.mode = MODE_RETURN;
					    E.select = EMPTY;
						this.modeConnectBones = false;
					    break;
				    }

				    if(E.under.isObject) E.select = E.under;

				    if ((this.modeConnectBones) && (this.choiseParent !== E.select)) {
					    writeHistory();
					    E.select.eparent = this.choiseParent;
					    E.select.pos = new THREE.Vector3().setFromMatrixPosition(E.select.mLocal).sub(new THREE.Vector3().setFromMatrixPosition(this.choiseParent.mLocal));
					    this.modeConnectBones = false;
				    }
			    }
			    if (this.modeConnectBones) this.choiseParent = E.select; else this.choiseParent = EMPTY;
			    if (this.modeDisconnectBone)
				    if(E.select.eparent !== this.primary){
					    writeHistory();
					    E.select.eparent = this.primary;
					    E.select.pos = new THREE.Vector3().setFromMatrixPosition(E.select.mLocal);
					    this.modeDisconnectBone = false;
				    }

			    break;
	    }

	    if(anm.isRender) E.greed.visible = false; else E.greed.visible = true;

        for (var inx = 0; inx < this.children.length; inx++) {
            var obj = this.children[inx];

	        if(obj.isGhost) continue;
	        else
	            if(obj.isLight) obj.children[0].visible = !anm.isRender;

            var m = obj.eparent.mWorld.clone();

            m.multiply(new THREE.Matrix4().setPosition(obj.pos));
            m.multiply(new THREE.Matrix4().makeRotationFromQuaternion(obj.ang));
            obj.mLocal = m.clone();
            m.multiply(new THREE.Matrix4().setPosition(obj.basis));

            obj.mWorld = m.clone();
            m.scale(obj.escale);

            obj.matrix.identity();
            obj.applyMatrix(m.clone());

// Intersect
            this.vector = new THREE.Vector3(E.Input.x, E.Input.y, 1);
            this.projector.unprojectVector(this.vector, this.world.camera);
            this.ray = new THREE.Raycaster(this.world.camera.position, this.vector.sub(this.world.camera.position).normalize());

//	        this.ray = this.projector.pickingRay(this.vector, this.world.camera);

            this.ray.intersectObjectMy(obj, this.intersects);


	        if(obj.billboard){
		        var billBoard = obj.children[0];
		        billBoard.matrix.identity();
		        billBoard.applyMatrix(newMatrix().extractRotation(newMatrix().getInverse(obj.matrix).multiply(this.world.camera.matrixWorld)));
	        }
        }
   };

	function addProperty(obj, fieldName, source) {

		if(source !== undefined){

//			if( (source[fieldName] === undefined) && (source instanceof Object) ) obj[fieldName] = source;
//			if( ((source[fieldName] instanceof Object) || (source instanceof Object)) ) obj[fieldName] = source;
			if( !isFinite(source[fieldName])) obj[fieldName] = source;
			if( isFinite(source[fieldName]) ){
				obj.__defineGetter__(fieldName, function () {
					return source[fieldName];
				});

				obj.__defineSetter__(fieldName, function (val) {
					source[fieldName] = val;
				});
			}

		}
		if(obj.property === undefined) obj.property = [];
		obj.property.push(fieldName);
	};

	return scene;
};