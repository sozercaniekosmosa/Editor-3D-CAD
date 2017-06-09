	var canvas;
	var context;
    var c_width = 800;
    var c_height = 200;
    var c_hfont = 12;
	var texture_txt;
	var txt_arr = new Array();
	var txt="";
	var ln=0;
    var last_text = "";
    var c_style = "rgba(60,140,255,0.9)";
    var c_bgstyle = "rgba(128,128,128,0.05)";

	function init_consol(scene){

		canvas = document.createElement('canvas');
		canvas.width = c_width;
		canvas.height = c_width;
		context = canvas.getContext('2d');
		context.font = (c_hfont+1)+"px Arial";
		context.clearRect(0,0,c_width,c_width);
		context.fillStyle = c_bgstyle;

		texture_txt = new THREE.Texture(canvas) 


//		var spriteMaterial = new THREE.SpriteMaterial( {map: texture_txt, useScreenCoordinates: true, alignment: new THREE.SpriteAlignment.topLeft } );
		var spriteMaterial = new THREE.SpriteMaterial( {map: texture_txt} );

		sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(c_width,c_width,1.0);
		sprite.position.set( 0, 0, -1 );
		scene.add( sprite );
		out(' ');
	}
	
	function out2(text)
    {
        console.log(text);
    }

	function out(text)
    {
        if(text === last_text) return;
        last_text = text;

        context.clearRect(0,0,c_width,c_height);
        context.fillStyle = c_bgstyle;
        context.fillRect( 0,0, c_width,c_height);
        context.fillStyle = c_style;

		ln++;
		var y_txt = c_hfont;
		txt += text + "\n";
		if(ln>c_height/c_hfont)
			txt = txt.substr(txt.indexOf("\n")+1, txt.length);

        txt_arr = txt.split("\n");
        var cnt = txt_arr.length;
        for (var n = 0; n < cnt; n++) {
			context.fillText(txt_arr[n], 0, y_txt);
			y_txt += c_hfont;
        }
		texture_txt.needsUpdate = true;
    }