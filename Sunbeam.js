var Sunbeam = (function () 
{
	function txSunbeam()
	{
		var TX_SIZE = 512;
		var canvas = document.createElement('canvas');
		canvas.width = TX_SIZE;
		canvas.height = TX_SIZE;
		var xCenter = TX_SIZE / 2;
		var yCenter = TX_SIZE / 2;
		var ctx = canvas.getContext("2d");
		
		function fillEllipse(x1, y1, x2, y2)
		{
			ctx.save();
			ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
			ctx.scale(1, (y2 - y1) / (x2 - x1) );
			ctx.beginPath();
			ctx.arc(0, 0, (x2 - x1) / 2, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}

		function fillGradientEllipse(x1, y1, x2, y2, colorCenter, colorEdge)
		{
			// console.log("ellipse %f, %f, %f, %f", x1, y1, x2, y2);
			var styleOld = ctx.fillStyle;
			var grad = ctx.createRadialGradient(0, 0, 1, 0, 0, (x2 - x1) / 2);
			grad.addColorStop(0, colorCenter);
			grad.addColorStop(1, colorEdge);
			
			ctx.fillStyle = grad;
			fillEllipse(x1, y1, x2, y2);
			ctx.fillStyle = styleOld;
		}

		// Drawing four ellipses in this pattern makes the canvas tile-able;
		// it'll match up at the edges.
		function fourEllipses(x, y, rX, rY, colorCenter, colorEdge)
		{
			// console.log("fourell %f, %f, %f, %f", x, y, rX, rY);
			var xAlt = x + xCenter * 2 * (x > xCenter ? -1 : 1);
			var yAlt = y + yCenter * 2 * (y > yCenter ? -1 : 1);
			fillGradientEllipse(x - rX, y - rY, x + rX, y + rY, colorCenter, colorEdge);
			fillGradientEllipse(xAlt - rX, y - rY, xAlt + rX, y + rY, colorCenter, colorEdge);
			fillGradientEllipse(x - rX, yAlt - rY, x + rX, yAlt + rY, colorCenter, colorEdge);
			fillGradientEllipse(xAlt - rX, yAlt - rY, xAlt + rX, yAlt + rY, colorCenter, colorEdge);
		}
		
		var center = "rgba(255, 255, 255, 0.1)";
		var edge = "rgba(255, 255, 0, 0.001)";
		var darkCenter = "rgba(128, 128, 64, 0.1)";
		var darkEdge = "rgba(255, 224, 0, 0.001)";
		var ellScale = 4;
		var cElls = 150;
	
		for (var i = 0; i < cElls; i++)
		{
			fourEllipses(Math.random() * TX_SIZE, 
					Math.random() * TX_SIZE,
					(Math.random() * xCenter + xCenter) / ellScale,
					(Math.random() * yCenter + yCenter) / ellScale, 
					center, edge);
			fourEllipses(Math.random() * TX_SIZE, 
					Math.random() * TX_SIZE,
					(Math.random() * xCenter + xCenter) / ellScale,
					(Math.random() * yCenter + yCenter) / ellScale, 
					darkCenter, darkEdge);
		}
		
		var uvMap = new THREE.UVMapping();
		var url = canvas.toDataURL("image/png");
		var imgTx = new Image();
		imgTx.src = url;
		var tx = new THREE.Texture(imgTx, uvMap, 
			THREE.RepeatWrapping, THREE.RepeatWrapping);
		imgTx.onload = function () { tx.image = imgTx; tx.needsUpdate = true; };
	
		return tx;
	}
	var sm_txSunbeam = txSunbeam();
	var matSunbeam = new THREE.MeshPhongMaterial(
		{
		transparent: true,
		opacity: 0.3,
		map: sm_txSunbeam
		});
		
	var xBeamCenter = 0;
	var zBeamCenter = 0;
	var yBeamCenter = 3.75;
	var rBeamMax = 3;
	function my()
	{
		function theLight() { return new THREE.PointLight(0xFFFFFF, 1.0, 3); }
		
		// Coordinates for a hexagon around the center.
		var ax = [xBeamCenter - rBeamMax, xBeamCenter - rBeamMax / 2, xBeamCenter + rBeamMax / 2,
				   xBeamCenter + rBeamMax, xBeamCenter + rBeamMax / 2, xBeamCenter - rBeamMax / 2];
	    var az = [zBeamCenter, zBeamCenter + rBeamMax * 0.87, zBeamCenter + rBeamMax * 0.87,
				   zBeamCenter, zBeamCenter - rBeamMax * 0.87, zBeamCenter - rBeamMax * 0.87];
		function lightCircle(obj, height)
		{
			for (var i = 0; i < ax.length; i++)
			{
				var light = theLight();
				light.position = new THREE.Vector3(ax[i], height, az[i]);
				obj.add(light);
			}
		}
		
		var obj = new THREE.Object3D();
		
		// THREE.js appears to be sensitive to the order of an object's children if 
		// some of them are transparent. If the lights aren't added first,
		// the ones "behind" the beam from the camera's viewpoint won't light
		// anything.
		lightCircle(obj, 1);
		lightCircle(obj, 3.125);
		lightCircle(obj, 5.25);
		
		// If the outer beam is added first, the inner ones won't render.
		for (var radius = 2; radius < rBeamMax; radius += 0.32)
		{
			var mesh = new THREE.Mesh(
				new THREE.CylinderGeometry(radius * 0.7, radius, yBeamCenter * 2, 
					11, 1, true), 
				matSunbeam);
			mesh.position = new THREE.Vector3(xBeamCenter, yBeamCenter, zBeamCenter);
			obj.add(mesh);
		}
		
		return obj;
	}

	return my;
}());