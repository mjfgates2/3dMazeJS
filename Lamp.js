var Lamp = (function()
{
	var LAMP_COLOR = 0XFFF090;
	var LAMP_INTENSITY = 0.6;
	var LAMP_DISTANCE = 12;
    var txLamp = THREE.ImageUtils.loadTexture("meshes3d/LampTX.png");
	// var txEmission = THREE.ImageUtils.loadTexture("meshes3d/LampEmit.png");
	var mat = new THREE.MeshPhongMaterial(
		{
        map: txLamp
		// , lightMap: txEmission
		});

	var loader = new THREE.JSONLoader();
	function loadGeo(name)
	{
		var mesh = new THREE.Mesh();
		mesh.material = mat;
		loader.load("meshes3d/" + name,
			function(geometry) 
			{
				mesh.geometry = geometry;
			});
		return mesh;
	}

	var geo = loadGeo("Lamp.js");
	
	

	var my = {};
	my.create = function (maze, coords)
	{
		var theLamp = new THREE.Object3D();
		var pos = maze.toSpaceCoords(coords);
		
		var theLampLight = new THREE.PointLight(LAMP_COLOR, LAMP_INTENSITY, LAMP_DISTANCE);
		theLampLight.position.set(pos.x + 3, pos.y + 5, pos.z + 3);
		theLamp.add(theLampLight);

		var theObject = new THREE.Mesh(geo.geometry, mat);
		theObject.position = pos;
		theLamp.add(theObject);
		
		return theLamp;
	};
	return my;
}());