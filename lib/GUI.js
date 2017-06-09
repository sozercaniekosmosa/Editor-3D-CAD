E.GUI = function () {
	var _this = this;

	this.tmOut = 0; //stack overflow protection as fn keyDown creates too large a stream of events
	this.cnt = 0;
	this.isPlayLast = 0;

	this.isOnFocus = 0;

//	$('<div>').dialog();

	$('.draggable').draggable({
		containment: 'body',
		snapMode:    'outer',
		snap:        '.draggable',
		stack:       '.draggable',
		scroll:      false,
		delay:       200,
		distance:    20
	});

	$(document).keydown(
		function () {
			ui.update(true);
		}
	);

	$(document).keyup(
		function () {
			_this.tmOut = 0;
			ui.update(true);
		}
	);

	$(document).mousedown(
		function () {
			ui.update(true);
		}
	);

	$(document).mouseup(
		function () {
			_this.tmOut = 0;
			ui.update(true);
		}
	);

	$('.input').on('mousedown', function (e) {


		var cell = $(e.target);
		var input = $('#input');

		cell.after(input);

		input.css('left', cell.position().left);
		input.css('top', cell.position().top + 2);
		input.css('width', cell.outerWidth());
		input.css('height', cell.outerHeight() - 4);
		input.css('display', 'block');

		input.attr('prop', cell.attr('prop'));
		input.attr('field', cell.attr('field'));

		input.val(cell.text());

		input.select();
		input.focus();
		_this.isOnFocus = 1;
		E.Input.enable = false;
	});

	function inputFocusOut(cont, e) {

		E.Input.enable = true;

		if (_this.isOnFocus == 0) return;
		_this.isOnFocus = 0;


		var input = $(e.target);
		input.css('display', 'none');

		var obj = E.select;
		if (obj === E.empty) return;

		var prop = input.attr('prop');
		input.removeAttr('prop');
		var field = input.attr('field');
		input.removeAttr('field');
		var cell = undefined;

		if (field === undefined)
			cell = $(cont).find('.input[prop=' + prop + ']');
		else
			cell = $(cont).find('.input[field=' + field + ']');

		if (cell.text() !== input.val() + '')
			writeHistory();
		cell.text(input.val());

		if (prop == 'name') {
			obj[prop] = isFinite(input.val()) ? '_' + input.val() : input.val() + '';
			E.Input.skipClick = 1;
			return;
		}

		if (obj[prop] instanceof THREE.Vector3) {
			obj[prop][field] = parseFloat(input.val());

		} else if (obj[prop] instanceof THREE.Color) {
			obj[prop].copy(new THREE.Color().setStyle(input.attr('value')));
		} else if (obj[prop] instanceof THREE.Quaternion) {
			var ang = new THREE.Euler().setFromQuaternion(obj[prop]);
			ang[field] = parseFloat(input.val()) * Math.rad;
			obj[prop] = new THREE.Quaternion().setFromEuler(ang);

		} else if (isFinite(obj[prop])) {
			obj[prop] = parseFloat(input.val());
		} else {
		}

		E.Input.skipClick = 1;
	};

	$('.contain').on('focusout', function (e) {
		inputFocusOut(this, e);
	});

	$('#input').on('keydown', function (e) {
		if (e.keyCode === 13)
			inputFocusOut(this, e);
	});

	$(document).on('click', function (e) {
		var target = $(e.target);
		var id = target.attr('id');

		if (anm.isRender) return;

		E.update();

		switch (id) {
			case 'settings':
				E.mode = MODE_RETURN;
				E.mode = MODE_SELECT;
				E.select = E;
				break;
			case 'rendering':
				if (anm.isRender) return;
				if (anm.getFrameCnt() <= 0) return;
				anm.isRender = true;

				anm.showKey(0);
				anm.inxKey = 0;
				anm.inxFrm = 0;
				anm.keyKeep = -1;
				anm.cntRndrFrm = -1;
				anm.isPlay = true;
				anm.setCameraAnimate();

				E.cntRFrm = 0;
				break;
			case 'delete-obj':
				world.sceneObj.deleteObj(E.select);
				break;
			case 'camera-prop':
				E.mode = MODE_RETURN;
				E.mode = MODE_SELECT;
				E.select = world.camera;
				break;
			case 'camera-state-store':
				world.camera.storeState();
			case 'camera-state-restore':
				world.camera.restoreState();
			case 'mode_empty':
				world.sceneControl.modeTransformation = E.empty;
				break;
			case 'mode_pos':
				world.sceneControl.modeTransformation = E.pos;
				break;
			case 'mode_ang':
				world.sceneControl.modeTransformation = E.ang;
				break;
			case 'mode_escale':
				world.sceneControl.modeTransformation = E.escale;
				break;
			case 'mode_intensity':
				world.sceneControl.modeTransformation = E.intensity;
				break;
			case 'mode_distance':
				world.sceneControl.modeTransformation = E.distance;
				break;
			case 'edit-snap-pos':
				world.sceneControl.mode_snap_pos = !world.sceneControl.mode_snap_pos;
				break;
			case 'edit-snap-ang':
				world.sceneControl.mode_snap_ang = !world.sceneControl.mode_snap_ang;
				break;
			case 'edit_center':
				world.camera.center(((world.sceneControl.mode_basis_change) && (world.sceneControl.modeTransformation != E.ang)) ? E.select.mWorld : E.select.mLocal);
				break;
			case 'edit_reset_camera':
				world.camera.reset();
				break;
			case 'loopAni':
				anm.isLoop = !anm.isLoop;
				break;
			case 'playAni':
				if (anm.getFrameCnt() <= 0) {
					$('#playAni').removeClass('active');
					return;
				}
				anm.isPlay = !anm.isPlay;
				anm.setCameraAnimate();
				break;
			case 'stopAni':
				if (anm.getFrameCnt() <= 0) return;
				anm.stop();
				break;
			case 'addKey':
				_this.addKeyFrame('#timeSlider tr');
				break;
			case 'edit_link':
				world.sceneObj.modeConnectBones = !world.sceneObj.modeConnectBones;
				break;
			case 'edit_unlink':
				world.sceneObj.modeDisconnectBone = true;
				break;
			case 'add-light':
				property = {};
				property.pos = new THREE.Vector3(200, 300, 0);
				property.type = POINT;
				world.sceneObj.addLight(property);
				break;

			case 'edit_type_camera':
				if (target.hasClass('active')) {
					world.camera.toTrackBall();
				} else {
					world.camera.toOrbit();
				}
				break;
		}

		ui.update(true);
	});

	$('#timeSlider').on('click', function (e) {
		var _this = $(e.target);
		var $td = _this.parent('td')
		var id = $td.attr('id');

		if (_this.hasClass('apply')) {
			anm.isRender = 1;
			var dim = getDimension(snapshot({x:0, y:0, w:E.surface.width(), h:E.surface.height()}));
			var _w = dim.w*0.1; var _h = dim.h*0.1; dim.x -= _h; dim.y -= _w; dim.w += 2*_h; dim.h += 2*_w;
			$td.css({ backgroundImage:    'url(' + snapshot(dim).toDataURL() + ')' });
			anm.isRender = 0;
			anm.applyKey(id);
		}

		if (_this.hasClass('delete')) {
			anm.deleteKey(id);
			$td.remove();
		}
	});

	$('#timeSlider').on('dblclick', 'td.key', function (e) {
		var _this = $(e.target);
		var id = _this.attr('id');
		var inx = anm.getInx(id);
		if (anm.keyArr[inx].cntFrm <= 0) return;

		anm.showKey((anm.keyKeep == inx) ? -1 : inx);
	});
}

E.GUI.prototype = {
	constructor: E.GUI,

	colorWrite: function (e) {
		this._alreadyWrite = undefined;
	},

	colorChange: function (e) {

		if (this._alreadyWrite === undefined) {
			this._alreadyWrite = {};
			writeHistory();
		}

		var cl = e.attributes['value'].value;//$(e).attr('value');

		E.select.color.copy(new THREE.Color().setStyle(cl));

		E.Input.skipClick = 1;
	},

	makeSortable: function (contObj) {
		$(contObj).sortable({

			placeholder: "key",
			axis:        "x",
//			revert:      true,
//			delay:   200,
			distance:    20,

			update: function (event, ui) {
				var id = ui.item.attr('id');
				var arr = $(ui.item).parent().sortable('toArray');

				var src = anm.getInx(id);
				var dst = arr.indexOf(id);

				anm.replaceKey(anm.keyArr, src, dst);
				if (anm.keyKeep > -1) {
					anm.keyKeep = dst;// новый индекс для объекта тк при перемещ он изменился
					E.GUI.selectUpdate();
				}
			}
		});
	},

	makeResizeble: function (rszObj) {
		var ex = -1, inx = 0, _this = this;
		$(rszObj).resizable({
			handles:   "e",
			maxHeight: 70,
			minHeight: 70,
			minWidth:  70,
			start:     function (event, ui) {
				var id = ui.element.context.id;
				inx = anm.getInx(id);
				if (!anm.isPlay) return;
				ex = anm.keyKeep;			    // запоминаем ключ что бы потом к нему вернуться
				anm.keyKeep = inx;   // устанавливаем новый ключ
			},

			stop: function (event, ui) {
				if (anm.isPlay) anm.keyKeep = ex;				// возвращаем предыдущее значение
				_this.update(true);
			},

			resize: function (event, ui) {
				var id = ui.element.context.id;
				var cnt = ui.size.width - 70;

				cnt /= 10;
				cnt = cnt.toFixed(0);
				anm.keyArr[inx].cntFrm = cnt;

				$('#' + id).children('.cnt').text(cnt);
			}
		});

	},

	update: function (updNow) {
//		out(undoSceneStorage.length + ' ' + redoSceneStorage.length);
		if (this.isPlayLast !== anm.isPlay) {
			this.cnt = 0;
			this.isPlayLast = anm.isPlay;
		}

		if (updNow !== undefined) this.cnt = 0;

		if (this.cnt++ > 1) return;

//		out(new Date().getTime());

//--------ALL CONTROL

		this.visControl();

		if ((E.select !== E.empty) && (this.isOnFocus == 0)) {
			var obj = E.select;

			for (var inx = 0; inx < obj.property.length; inx++) {
				var prop = obj.property[inx];
				var cont = $('#property_' + prop);

				if (prop == 'name') {
					cont.find('[prop=' + prop + ']').text(obj[prop] + '');
					continue;
				}

				if (obj[prop] instanceof THREE.Vector3) {
					cont.find('[field=x]').text(obj[prop].x.toFixed(3));
					cont.find('[field=y]').text(obj[prop].y.toFixed(3));
					cont.find('[field=z]').text(obj[prop].z.toFixed(3));
				} else if (obj[prop] instanceof THREE.Quaternion) {
					var ang = new THREE.Euler().setFromQuaternion(obj[prop]);

					ang.x = ang._x / Math.rad;
					ang.y = ang._y / Math.rad;
					ang.z = ang._z / Math.rad;

					cont.find('[field=x]').text(ang.x.toFixed(3));
					cont.find('[field=y]').text(ang.y.toFixed(3));
					cont.find('[field=z]').text(ang.z.toFixed(3));
				} else if (isFinite(String(obj[prop]))) {
					cont.find('[prop=' + prop + ']').text(obj[prop].toFixed(3));
				} else if (obj[prop] instanceof THREE.Color) {
					cont.find('[prop=' + prop + ']').attr('value', rgbToString(obj[prop]));
					cont.find('[prop=' + prop + ']').css('backgroundColor', rgbToString(obj[prop]));
				} else {
					switch (prop) {
						case E.eparent:
							cont.find('[prop=' + prop + ']').text(obj[prop].name);
							break;
						default:
							cont.find('[prop=' + prop + ']').text(obj[prop]);
					}
				}
			}
		}

// PROPERTY

//		if(E.select != E.empty){
//			$('#tableProperty').append($('<td></td>'));
//			var td = $("#" + id);
//			td.append($('<button></button>').addClass('btn btn-dmn apply').text('+'));
//		}

//		obj.remove();

//	UNDO
		if ((E.Input.isPressNow(E.Input.KEY_CTRL)) && (E.Input.isPressNow(E.Input.Z))) undo();
//	REDO
		if ((E.Input.isPressNow(E.Input.KEY_CTRL)) && (E.Input.isPressNow(E.Input.Y))) redo();

//	CAMERA
		if ((E.Input.isPress(E.Input.KEY_SHIFT)) && (E.Input.isPress(E.Input.F))) {
			this.onEvent('click', '#edit_center');
		}

		if (E.Input.isPress(E.Input.KEY_SHIFT))     $('#edit_view').addClass('active');
		if (E.Input.isRelease(E.Input.KEY_SHIFT))   $('#edit_view').removeClass('active');
		if ($('#edit_view').hasClass('active'))     E.mode = MODE_CAMERA;
		if ((E.mode == MODE_CAMERA) && (!$('#edit_view').hasClass('active'))) E.mode = MODE_RETURN;

//	TRANFORMATION
		world.sceneControl.mode_basis_change = $('#mode_basis').hasClass('active');
		world.sceneControl.mode_global_coord = $('#mode_global').hasClass('active');

		if (E.Input.isPress(E.Input.Q)) this.onEvent('click', '#mode_empty');
		if (E.Input.isPress(E.Input.E)) this.onEvent('click', '#mode_ang');
		if (E.Input.isPress(E.Input.W)) this.onEvent('click', '#mode_pos');
		if (E.Input.isPress(E.Input.R)) this.onEvent('click', '#mode_escale');
		if (E.Input.isPress(E.Input.L)) this.onEvent('click', '#mode_intensity');
		if (E.Input.isPress(E.Input.D)) this.onEvent('click', '#mode_distance');

		if (world.sceneControl.modeTransformation === E.empty) $('#mode_empty').addClass('active');
//	ANIMATION

		//CONTROL

		if (E.Input.isPress(E.Input.KEY_SPACE)) this.onEvent('click', '#playAni');
		;

//		if (anm.isPlay)
//			$('#playAni').addClass('active').text('pause');
//		else
//			$('#playAni').removeClass('active').text('play');

		//TIME LINE
		$('.key').removeClass('select-key');
		$('.only-select').hide();

		if (anm.keyKeep != -1) {
			var obj = $('#' + anm.getID(anm.keyKeep));

			obj.addClass('select-key');
			obj.children('.only-select').show();
		}

// CONNECT
		if (!world.sceneObj.modeConnectBones) $('#edit_link').removeClass('active');
	},

	addKeyFrame: function (elementTimeSlider) {

		var id = anm.addKey();

		$(elementTimeSlider).append($('<td></td>').attr('id', id).addClass('key').css('width', E.defCntKey + 70 + 'px'));

		var td = $("#" + id);

		anm.isRender = 1;
		var dim = getDimension(snapshot({x:0, y:0, w:E.surface.width(), h:E.surface.height()}));
		var _w = dim.w*0.1; var _h = dim.h*0.1; dim.x -= _h; dim.y -= _w; dim.w += 2*_h; dim.h += 2*_w;

		td.css({
			backgroundImage:    'url(' + snapshot(dim).toDataURL() + ')',
			backgroundSize:     'contain',
			backgroundPosition: '50% 50%',
			backgroundRepeat:   'no-repeat'
		});
		anm.isRender = 0;

//		td.append($('<button></button>').addClass('btn btn-dmn apply').text('+'));
		td.append($('<img>').addClass('btn btn-dmn apply').attr('src','pic/apply.png'));
		td.append($('<img>').addClass('btn btn-dmn only-select delete').attr('src','pic/delete-key.png'));
//		td.append($('<button></button>').addClass('btn btn-dmn only-select delete').text('X'));
		td.append($('<div></div>').addClass('cnt').text((E.defCntKey / 10).toFixed(0)));

		this.makeSortable("#timeSlider tr");
		this.makeResizeble(".key");
	},

	onEvent: function (event, id) {
		if (this.tmOut++ < 1)
			$(id).trigger(event);
	},

	visControl: function () {
		var prop = E.select.property;
		$('.itemProperty').addClass('hide');
		if (prop === undefined) return;

		for (var inx = 0; inx < prop.length; inx++) {
			var fld = prop[inx];
			$('#property_' + fld).removeClass('hide');
			$('#mode_' + fld).removeClass('hide');
			switch (fld) {
				case E.pos:
				case E.rot:
				case E.escale:
					$('#mode_global, #mode_basis').removeClass('hide');
			}
		}
	}
}