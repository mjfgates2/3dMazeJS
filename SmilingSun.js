var SmilingSun = (function () {
	var sm_geometry = undefined;
	var loader = new THREE.JSONLoader();
	loader.load("meshes3d/SmilinSun.js",
		function(geometry) 
		{
			sm_geometry = geometry;
		});
		
	function makeLight(scene, position, dx, dz)
	{
		var lightSun = new THREE.PointLight(0xF0F0A0, 0.5);
		lightSun.position.set(position.x + dx, 
			position.y - 4, position.z + dz);
		scene.add(lightSun);
	}
		
	function my(position)
	{
		this.position = new THREE.Vector3(position.x, position.y, position.z);
		this.sun = undefined;
		this.scene = new THREE.Scene();
		makeLight(this.scene, position, 10, 0);
		makeLight(this.scene, position, -10, 0);
		makeLight(this.scene, position, 0, 10);
		makeLight(this.scene, position, 0, -10);
	}
	
	my.prototype = 
	{
		ensureSun : function()
		{
			if (this.sun)
			{
				return this.sun;
			}
			else if (sm_geometry)
			{
				this.sun = new THREE.Mesh(
					sm_geometry,
					new THREE.MeshPhongMaterial({
						color: 0xc0C040,
						ambient: 0xFFFF00,
						specular: 0xFFFF60,
						shininess : 70,
						shading : THREE.SmoothShading,
						metal: true
						}));
				this.sun.scale = new THREE.Vector3(2, 2, 2);
				this.sun.position = this.position;
				this.scene.add(this.sun);
				return this.sun;
			}
			else
			{
				return undefined;
			}
		},
		
		faceToward : function (position)
		{
			if (this.ensureSun())
			{
				var mat = new THREE.Matrix4();
				mat.lookAt(this.sun.position, position, vJ);
				this.sun.quaternion.setFromRotationMatrix(mat);
			}
		},
		
		render : function (renderer, camera)
		{
			if (this.ensureSun())
			{
				this.faceToward(camera.position);
				renderer.clear( false, true, false );
				renderer.render(this.scene, camera);
			}
		}
	};
	
	return my;
}());


