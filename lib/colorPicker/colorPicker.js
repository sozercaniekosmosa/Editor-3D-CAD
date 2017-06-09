onLoad();

function onLoad() {
	var el = document.body
	if (el != null && typeof(el) != "undefined")
		colorPicker();
	else
		setTimeout(function () {
			onLoad();
		}, 0);
}

function colorPicker() {

	var srf, cpButton;
	var colorPickerArrButton = document.getElementsByClassName('colorPicker');
	for (var i = 0; i < colorPickerArrButton.length; i++) {
		colorPickerArrButton[i].addEventListener('click', function (e) {
			cpButton = e.target;
			createColorPicker();
			if (srf !== undefined) {
				srf.style.display = 'block';
				var cpShow = cpButton.getAttribute('cpShow');
				if (cpShow !== null) eval(cpShow + '.call(this, cpButton)');
			}
		});
		cpButton = colorPickerArrButton[i];
		createColorPicker();
	}

	function createColorPicker() {
		var x = 0, y = 0;
		var cpChange = cpButton.getAttribute('cpChange');
		var cpHide = cpButton.getAttribute('cpHide');

		var bgColor = cpButton.getAttribute('bgColor');

		var hsvText = cpButton.getAttribute('hsvText');

		var colorAttr = cpButton.getAttribute('value');
		var widthAttr = parseInt(cpButton.getAttribute('cpWidth'));
		var heightAttr = parseInt(cpButton.getAttribute('cpHeight'));

		var xAttr = parseInt(cpButton.getAttribute('cpX'));
		var yAttr = parseInt(cpButton.getAttribute('cpY'));

		var xOffAttr = parseInt(cpButton.getAttribute('cpXOff'));
		var yOffAttr = parseInt(cpButton.getAttribute('cpYOff'));

		var width = !widthAttr ? 100 : widthAttr;
		var height = !heightAttr ? 100 : heightAttr;

		var hsv = colorAttr === null ? rgb_hsv(0, 0, 0) : rgb_hsv(parseColor(colorAttr));

		var wSV = parseInt(width * 0.84);
		var hSV = parseInt(height * 0.84);

		var posSVx = 0;
		var posSVy = 0;

		var wH = parseInt(width * 0.14);
		var hH = hSV + 1;
		var posHx = wSV + 1;
		var posHy = 0;

		var pos = getAutoPositionColorPicker(cpButton);

		var cpX = !xAttr ? pos.x : xAttr;
		var cpY = !yAttr ? pos.y : yAttr;

		cpX += !xOffAttr ? 0 : xOffAttr;
		cpY += !yOffAttr ? 0 : yOffAttr;

		var HUE = hsv.h;
		var S = hsv.s;
		var V = hsv.v;

		var clickText = 0;
		var clickSV = 0;
		var clickH = 0;
		var onFocusText = 0;

		var clickOutsideColorPicker = 0;

		var sdw = '2px 2px 3px rgba(0,0,0,.2), 10px 10px 40px rgba(0,0,0,.1)';

		srf = createNode('div', 'srf', {
			display:               'none',
			position:              'absolute',
			left:                  cpX + 'px',
			top:                   cpY + 'px',
			cursor:                'default',
			zIndex:                16777271,
			'-webkit-user-select': 'none'
		});

		var cnvSV = createNode('canvas', 'cnvSV', {
				position: 'absolute',
				left:     posSVx + 'px',
				top:      posSVy + 'px',
				border:   '1px solid black'},
			{
				height: hSV,
				width:  wSV
			});
		var cnvH = createNode('canvas', 'cnvH',
			{
				position:  'absolute',
				left:      posHx + 'px',
				top:       posHy + 'px',
				border:    '1px solid black',
				boxShadow: sdw
			}, {
				height: hH, width: wH
			});

		var sampleColor = createNode('div', 'sampleColor', {
			position:  'absolute',
			width:     wH + 'px',
			height:    wH + 'px',
			top:       hSV + 2 + 'px',
			left:      posHx + 'px',
			border:    '1px solid black',
			boxShadow: sdw
		});

		var inputColor = createNode('input', 'inputColor', {
			fontFamily:            'monospace',
			margin:                '0',
			padding:               '0',
			position:              'absolute',
			border:                '1px solid black',
			width:                 wSV + 'px',
			height:                wH + 'px',
			top:                   hSV + 2 + 'px',
			left:                  '0px',
			textAlign:             'center',
			boxShadow:             sdw,
			'-webkit-user-select': 'none'
		}, {
			readOnly: 1
		});

		var xSV = createNode('div', 'xSV', {
			position:     'absolute',
			border:       '1px solid white',
			width:        2 + 'px',
			height:       2 + 'px',
			top:          (100 - V) * hSV / 100 + 'px',
			left:         S * wSV / 100 + 'px',
			boxShadow:    '0 0 0 1px black',
			borderRadius: '50%'
		});

		var xH = createNode('div', 'xH', {
			position:     'absolute',
			top:          (359 - HUE) * hH / 359 + 'px',
			width:        '0px',
			height:       '0px',
			left:         posHx + 'px',
			marginLeft:   wH + 2 + 'px',
			marginTop:    '-5px',
			borderBottom: '5px solid transparent',
			borderLeft:   '0px solid transparent',
			borderTop:    '5px solid transparent',
			borderRight:  '10px solid black'
		});

		gradH(cnvH, 0, 0, wH, hH);
		gradSV(cnvSV, 0, wSV, hSV);

		document.body.appendChild(srf);
		srf.appendChild(cnvSV);
		srf.appendChild(inputColor);
		srf.appendChild(cnvH);
		srf.appendChild(sampleColor);
		srf.appendChild(xSV);
		srf.appendChild(xH);

		update();

		inputColor.onclick = function () {
			inputColor.readOnly = 0;
		};
		inputColor.onfocus = function () {
			onFocusText = 1;
		};

		inputColor.onblur = function () {
			onFocusText = 0;
			inputColor.readOnly = 1;
			textToColor();
		};

		document.onkeydown = function (e) {
			if (e.keyCode === 13) {
				if (onFocusText == 0) {
					clickOutsideColorPicker = 1;
					clickSV = 0;
					clickH = 0;
					clickText = 0;
				}
				onFocusText = 0;
				inputColor.readOnly = 1;
				textToColor();
				update();
			}
			if (e.keyCode === 27) {
				clickOutsideColorPicker = 1;
				clickSV = 0;
				clickH = 0;
				clickText = 0;
				update();
			}
		};

		cnvSV.onmousedown = function (e) {
			clickSV = 1;
			onFocusText = 0;
			inputColor.readOnly = 1;
			update();
		};

		cnvH.onmousedown = function (e) {
			clickH = 1;
			update();
		};
		inputColor.onmousedown = function () {
			clickText = 1;
		};
		document.onmousedown = function (e) {
			if ((onFocusText == 0) && ((clickSV + clickH + clickText) == 0)) clickOutsideColorPicker = 1;
			update(e);
		};
		document.onmousemove = function (e) {
			update(e);
		};
		document.onmouseup = function () {
			clickSV = 0;
			clickH = 0;
			clickText = 0;
		};

		function update(e) {
			cpButton.style.backgroundColor = cpButton.getAttribute('value');
			if(srf.style.display == 'none') return;

			var posSrf, dmn, pos;

			if (e !== undefined) {
				x = e.pageX;
				y = e.pageY;
			}

			if (clickSV) {
				posSrf = getNodeDmn(srf);
				dmn = getNodeDmn(cnvSV);

				pos = {x: x - posSrf.x, y: y - posSrf.y};

				limitPos(dmn, pos);

				xSV.style.left = dmn.x + pos.x - 2 + 'px';
				xSV.style.top = dmn.y + pos.y - 2 + 'px';

				scalePos(pos, dmn, 100);

				S = pos.x;
				V = 100 - pos.y;
			}

			if (clickH) {
				posSrf = getNodeDmn(srf);
				dmn = getNodeDmn(cnvH);

				pos = {x: x - posSrf.x, y: y - posSrf.y};

				limitPos(dmn, pos);

				xH.style.left = dmn.x + 'px';
				xH.style.top = pos.y + 'px';

				scalePos(pos, dmn, 359);

				HUE = 359 - pos.y;

				if (HUE > 358) HUE = 0;
			}

			setStyle(xSV, {top: (100 - V) * hSV / 100 + 'px', left: S * wSV / 100 + 'px'});
			setStyle(xH, {top: (359 - HUE) * hH / 359 + 'px'});

			gradSV(cnvSV, HUE, wSV, hSV);

			var rgb = hsv_rgb(HUE, S, V);

			var color = rgbToString(rgb);
			cpButton.setAttribute('value', color);
			if (!onFocusText) inputColor.value = (hsvText === null) ? color : 'hsv(' + parseInt(HUE) + ',' + parseInt(S) + ',' + parseInt(V) + ')';
			sampleColor.style.backgroundColor = color;
			if (bgColor !== null) {
				var VT = (V < 70) ? 100 : 0;
				VT = (S > 35) ? 100 : VT;
				VT = (V > 79) && (S > 35) && (HUE > 36) && (HUE < 196) ? 0 : VT;

				cpButton.style.color = rgbToString(hsv_rgb(0, 0, VT));
				cpButton.style.backgroundColor = color;
			}


			if ((clickSV) && (cpChange !== null)) eval(cpChange + '.call(this, cpButton)');

			if ((clickH) && (cpChange !== null)) eval(cpChange + '.call(this, cpButton)');

			if (clickOutsideColorPicker) {
				if ((cpHide !== null) && (srf.style.display !== 'none'))
					eval(cpHide + '.call(this, cpButton)');
				srf.style.display = 'none';
				clickOutsideColorPicker = 0;
			}

		}

		function rgbToString(rgb) {
			return '#' + cap(rgb.r.toString(16)) + cap(rgb.g.toString(16)) + cap(rgb.b.toString(16));
		}

		function setStyle(node, style) {
			var st = node.style;
			for (var key in style) {
				if (style.hasOwnProperty(key))
					st[ key ] = style[key];
			}
		}

		function createNode(node, id, style, attr) {

			var key;

			if (document.getElementById(id) === null) {
				node = document.createElement(node.toString());
				node.id = id;
			} else {
				node = document.getElementById(id);
			}

			var st = node.style;
			for (key in style) {
				if (style.hasOwnProperty(key))
					st[ key ] = style[key];
			}

			for (key in attr) {
				if (attr.hasOwnProperty(key))
					node[ key ] = attr[key];
			}

			return node;
		}

		function scalePos(pos, dmn, k) {
			pos.x = pos.x * (k / dmn.w);
			pos.y = pos.y * (k / dmn.h);
		}

		function limitPos(node, pos) {
			if (pos.x < 0) pos.x = 0;
			if (pos.x > node.w) pos.x = node.w;
			if (pos.y < 0) pos.y = 0;
			if (pos.y > node.h) pos.y = node.h;
		}

		function getNodeDmn(node) {
			return{
				x: node.offsetLeft,
				y: node.offsetTop,
				w: node.offsetWidth,
				h: node.offsetHeight
			}
		}

		function cap(comp) {
			return (comp.length == 1) ? '0' + comp : comp;
		}

		function parseColor(color) {
			var cache = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color);
			return {r: parseInt(cache[1], 16), g: parseInt(cache[2], 16), b: parseInt(cache[3], 16)};
		}

		function textToColor() {
			try {
				var color = parseColor(inputColor.value);
				hsv = rgb_hsv(color.r, color.g, color.b);

				HUE = hsv.h;
				S = hsv.s;
				V = hsv.v;
			} catch (e) {
				inputColor.value = rgbToString(hsv_rgb(HUE, S, V));
			}
		}

		function getOffsetSum(node) {
			var x = 0, y = 0;
			while (node) {
				x = x + parseFloat(node.offsetLeft);
				y = y + parseFloat(node.offsetTop);
				node = node.offsetParent;
			}

			return {x: Math.round(x), y: Math.round(y)};
		}

		function getOffsetRect(node) {

			var box = node.getBoundingClientRect();

			var body = document.body;
			var docElem = document.documentElement;

			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;

			var y = box.top + scrollTop - clientTop;
			var x = box.left + scrollLeft - clientLeft;

			return { x: Math.round(x), y: Math.round(y) };
		}

		function getOffset(node) {
			if (node.getBoundingClientRect) {
				return getOffsetRect(node);
			} else {
				return getOffsetSum(node);
			}
		}

		function getAutoPositionColorPicker(node) {

			var hPg = document.documentElement.scrollHeight ? document.documentElement.scrollHeight : document.body.scrollHeight;
			var wPg = document.documentElement.scrollWidth ? document.documentElement.scrollWidth : document.body.scrollWidth;

			var buttonDmn = getOffset(node);

			buttonDmn.h = node.offsetHeight;
			buttonDmn.w = node.offsetWidth;

			var pos = {};

			pos.x = buttonDmn.x;
			pos.y = buttonDmn.y + buttonDmn.h;

			if (pos.x < 0) pos.x = 0;
			if (pos.y < 0) pos.y = 0;

			if ((pos.x + width + 10) > wPg) {
				pos.x = wPg - width - 10;
				xOffAttr *= -1;
			}
			if ((pos.y + height) > hPg) {
				pos.y = hPg - height;
				yOffAttr *= -1;
			}

			if (pos.y < buttonDmn.y) pos.y = buttonDmn.y - height;

			return pos;

		}

		function gradSV(cnv, hue, w, h) {
			var c2d, grd;

			c2d = cnv.getContext("2d");

			grd = c2d.createLinearGradient(0, 0, 0, h);

			for (var i = 0; i <= 100; i++) {
				var a = hsv_rgb(hue, i, 100);
				var b = hsv_rgb(hue, 100, i);

				var colorA = 'rgb(' + a.r + ',' + a.g + ',' + a.b + ')';
				grd.addColorStop(0, colorA);
				var colorB = 'rgb(' + b.r + ',' + b.g + ',' + b.b + ')';
				grd.addColorStop(1, colorB);

				c2d.fillStyle = grd;
				c2d.fillRect(w / 100 * i, 0, (w / 100) + 1, h);
			}
		}

		function gradH(cnv, x, y, w, h) {

			var c2d, grd, hue;

			c2d = cnv.getContext("2d");
			grd = c2d.createLinearGradient(x, h, x, y); //direction

			hue = [
				[255, 0, 0],
				[255, 255, 0],
				[0, 255, 0],
				[0, 255, 255],
				[0, 0, 255],
				[255, 0, 255],
				[255, 0, 0]
			];

			for (var i = 0; i <= 6; i++) {
				grd.addColorStop(i * 0.16666666666666666, 'rgb(' + hue[i][0] + ',' + hue[i][1] + ',' + hue[i][2] + ')');
			}

			c2d.fillStyle = grd;
			c2d.fillRect(x, y, w, h);
		}

		function hsv_rgb(h, s, v) {

			var r, g, b, i, f, p, q, t;

			h = Math.max(0, Math.min(360, h));
			s = Math.max(0, Math.min(100, s));
			v = Math.max(0, Math.min(100, v));

			s /= 100;
			v /= 100;

			if (s == 0) {
				r = g = b = v;
				return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
			}

			h /= 60;
			i = Math.floor(h);
			f = h - i;
			p = v * (1 - s);
			q = v * (1 - s * f);
			t = v * (1 - s * (1 - f));

			switch (i) {
				case 0:
					r = v;
					g = t;
					b = p;
					break;

				case 1:
					r = q;
					g = v;
					b = p;
					break;

				case 2:
					r = p;
					g = v;
					b = t;
					break;

				case 3:
					r = p;
					g = q;
					b = v;
					break;

				case 4:
					r = t;
					g = p;
					b = v;
					break;

				default:
					r = v;
					g = p;
					b = q;
			}

			return {
				r: Math.round(r * 255),
				g: Math.round(g * 255),
				b: Math.round(b * 255)
			};
		}

		function rgb_hsv(r, g, b) {

			if (g === undefined) {
				g = r.g;
				b = r.b;
				r = r.r;
			}

			r /= 255;
			g /= 255;
			b /= 255;

			var minVal = Math.min(r, g, b);
			var maxVal = Math.max(r, g, b);
			var delta = maxVal - minVal;
			var HSV = {hue: 0, s: 0, v: maxVal};
			var del_R, del_G, del_B;

			if (delta !== 0) {
				HSV.s = delta / maxVal;
				del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
				del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
				del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;

				if (r === maxVal) {
					HSV.hue = del_B - del_G;
				}
				else if (g === maxVal) {
					HSV.hue = (1 / 3) + del_R - del_B;
				}
				else if (b === maxVal) {
					HSV.hue = (2 / 3) + del_G - del_R;
				}

				if (HSV.hue < 0) {
					HSV.hue += 1;
				}
				if (HSV.hue > 1) {
					HSV.hue -= 1;
				}
			}

			HSV.hue *= 360;
			HSV.s *= 100;
			HSV.v *= 100;

			return {h: HSV.hue, s: HSV.s, v: HSV.v};
		}
	}
}