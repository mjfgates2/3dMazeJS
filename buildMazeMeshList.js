THREE.Vector3.prototype.j = new THREE.Vector3(0, 1, 0);
THREE.Vector3.prototype.toString = function() 
{ 
    return "(" + this.x + ", " + this.y + ", " + this.z + ")"; 
};

var MazeMeshCreator = (function()
{
	var maze;
	var vMeshListCenter = new THREE.Vector3().set(-1, -1, -1);
    
    var txWall = new THREE.ImageUtils.loadTexture("meshes3d/Wall2OO.png");
	var mat = new THREE.MeshPhongMaterial(
		{
        map: txWall
		// color: 0xC0A0A0
		});
		
	var cGeometriesToLoad = 0;
	var loader = new THREE.JSONLoader();
	function loadGeo(name)
	{
		cGeometriesToLoad++;
		var mesh = new THREE.Mesh();
		mesh.material = mat;
		loader.load("meshes3d/" + name,
			function(geometry) 
			{
				mesh.geometry = geometry;
				cGeometriesToLoad--;
				aPositionsInaMeshes = [];
			});
		return mesh;
	}

	var frameEmpty = loadGeo("Wall2OO.js");
	var frameXWall = loadGeo("Wall2LO.js");
	var frameZWall = loadGeo("Wall2OR.js");
	var frameTwoWall = loadGeo("Wall2LR.js");
	var frameFloor = loadGeo("Floor2Present.js");
    var frameFloorHole = loadGeo("FloorAbsent.js");
	
	var maxProjectionRange = 5;
    var wallThickness = 0.5;

	var aMeshes;
	var aPositionsInaMeshes = [];
	function meshFromMazeBlock(maze, coords)
	{
        function addMesh(maze, coords, strMeshName, geo, mat)
        {
            var mesh = new THREE.Mesh(geo, mat);
            var pos = maze.toSpaceCoords(coords);
            // pos.sub(maze.offsetBlock);
            mesh.position = pos;
            aPositionsInaMeshes.push(strMeshName);
            aMeshes.add(mesh);
        }
        
        function floorMeshOfMazeBlock(maze, coords)
        {
            var strFloorCoords = coords.toString() + ",F";
            var iExisting = aPositionsInaMeshes.indexOf(strFloorCoords);
            if (iExisting == -1)
            {
                var geo = maze.entry(coords) & maze.MEMASKMY ?
                    frameFloor.geometry : frameFloorHole.geometry;
                addMesh(maze, coords, strFloorCoords, geo, mat /* matFloor */);
                // console.log("adding floor " + strFloorCoords);
            }
        }
        
        function wallMeshOfMazeBlock(maze, coords)
        {
            var strCoords = coords.toString();
            var iExistingMesh = aPositionsInaMeshes.indexOf(strCoords);
            if (iExistingMesh == -1)
            {
                // console.log("adding mesh " + strCoords);
                var entry = maze.entry(coords);
                var geo = entry & maze.MEMASKPX ?
                    (entry & maze.MEMASKPZ ?
                        frameTwoWall.geometry : frameXWall.geometry) :
                    (entry & maze.MEMASKPZ ?
                        frameZWall.geometry : frameEmpty.geometry);
                addMesh(maze, coords, strCoords, geo, mat);
            }
            //else
            //{   
                // console.log("mesh " + strCoords + " added already");
                // meshRet = aMeshes[iExistingMesh];
            //}
		}
		
        coords.x--;
        wallMeshOfMazeBlock(maze, coords);
        coords.z--;
        wallMeshOfMazeBlock(maze, coords);
        coords.x++; 
        wallMeshOfMazeBlock(maze, coords);
        coords.z++;
		wallMeshOfMazeBlock(maze, coords);
        
        floorMeshOfMazeBlock(maze, coords);
        coords.y++;
        floorMeshOfMazeBlock(maze, coords);
        coords.y--;
	}

    var aWalls = [];
    var aNewWalls = [];
    var aWallNames = [];
    var aNewWallNames = [];
    function wallFromMazeBlockSide(maze, coords, xDir, yDir, zDir, physics)
    {
        // console.log("in wall fn");
        var name = physics.wallName(coords, xDir, yDir, zDir);
		var iUpdatedExisting = aNewWallNames.indexOf(name);
		if (-1 === iUpdatedExisting)
		{
			var iExisting = aWallNames.indexOf(name);
			var wall;
			if (iExisting == -1)
			{
				wall = physics.addWall(coords, xDir, yDir, zDir);
				// console.log("added wall " + name);
			}
			else
			{
				// console.log("preserved wall " + name);
				wall = aWalls[iExisting];
			}
			
			aNewWalls.push(wall);
			aNewWallNames.push(name);
		}
    }
    
    function clearWalls(physics)
    {
        var cCleared = 0;

		// console.log("Removing walls");
        for (i = aWallNames.length - 1; i >= 0; i--)
        {
            if (aNewWallNames.indexOf(aWallNames[i]) == -1)
            {
				// console.log("removed wall " + aWallNames[i]);
                physics.removeWall(aWalls[i]);
                cCleared++;
            }
        }
        
        /* if (cCleared > 0)
        {
            console.log("removed " + cCleared + " walls.");
        } */
        aWalls = aNewWalls;
        aWallNames = aNewWallNames;
        aNewWalls = [];
        aNewWallNames = [];
		
/*		console.log("remaining walls are");
		for (i = aWallNames.length - 1; i>= 0; i--)
		{
			console.log(aWallNames[i] + " at " + aWalls[i].position);
		}
		console.log("--end of wall list");
		
		if (aWallNames.length != physics.wallCount())
		{
			console.log("I say " + aWallNames.length + " walls, physics says " + physics.wallCount());
			physics.dumpPositions();
		}
*/
    }
	
	var my = new Object();
	my.setMaze = function(theMaze, physics, exit, probabilityLamp)
	{
		this.m_maze = theMaze;
		this.m_vLastCalcedPosition = null;
		this.m_aMeshesCalced = null;
        this.physics = physics;
		this.accessories = new BlockAccessories();
        aWalls = [];
        aWallNames = [];
		
		for (var x = 0; x < theMaze.cx; x++)
		{
			for (var y = 0; y < theMaze.cy; y++)
			{
				for (var z = 0; z < theMaze.cz; z++)
				{
					if (Math.random() < probabilityLamp)
					{
						var v = new THREE.Vector3(x, y, z);
						this.accessories.add(Lamp.create(theMaze, v), v);
					}
				}
			}
		}
		
		// console.log("sunbeam at " + exit);
		var exitSunbeam = new Sunbeam();
		exitSunbeam.position = theMaze.toSpaceCoords(exit);
		this.accessories.add(exitSunbeam, exit);
	};
    
    function expandFromSurface(maze,
        /* THREE.Vector3 */ vStart, 
        /* double */ rangeMax, 
        /* void (THREE.Vector3 position, THREE.Vector3 dir) */ wallFn, 
        /* void (THREE.Vector3 position, THREE.Vector3 dir) */ holeFn,
		/* boolean */ fLoopback)
    {
        var aSurface = [vStart];
        var aSurfaceDistance = [0];
        
        while (aSurface.length > 0)
        {
            var entry = maze.entry(aSurface[0]);
            for (var i = 0; i < maze.aDirections.length; i++)
            {
                var dir = maze.aDirections[i];
                if (entry & dir[1])
                {
                    wallFn(maze, aSurface[0], dir[0]);
                }
                else
                {
                    holeFn(maze, aSurface[0], dir[0]);
                    
                    var vNew = new THREE.Vector3(
                            aSurface[0].x, aSurface[0].y, aSurface[0].z).add(dir[0]);
                    var vNewRelative = new THREE.Vector3(vNew.x, vNew.y, vNew.z).sub(vStart);
                    var dNew = vNewRelative.length();
                    if (dNew > aSurfaceDistance[0] && 
						 dNew <= rangeMax)
                    {
                        aSurface.push(vNew);
                        aSurfaceDistance.push(dNew);
                    }
                }
            }
            aSurface.splice(0, 1);
            aSurfaceDistance.splice(0, 1);
        }
    }
    
	my.fromPlayerPosition = function()
	{
		var vMazePosition = this.m_maze.toMazeCoords(
                this.physics.getPlayer().position);
		
		// If I've already made the list for here, just return the existing list.
		if (this.m_vLastCalcedPosition === null ||
		    !vMazePosition.equals(this.m_vLastCalcedPosition))
		{
			aMeshes = new THREE.Object3D();
			var accessories = this.accessories;
			aPositionsInaMeshes = new Array();
            
            // Build the visual world
            expandFromSurface(this.m_maze, vMazePosition, maxProjectionRange,
                meshFromMazeBlock, meshFromMazeBlock);
				
			// place accessories (including lights, which need to be placed 
			// *beyond* sight range so that they can shine into sight range)
			function placeAccessory(maze, pos, dir)
			{
				accessories.activate(aMeshes, pos);
			}
			accessories.reset();
			expandFromSurface(this.m_maze, vMazePosition, 
				maxProjectionRange + this.m_maze.cxBlock * 2,
				placeAccessory, placeAccessory);
            
            // Build the physics world around this square-- only need immediate
			// surroundings, as you don't collide with things two cells away
            var phys = this.physics;
            var theMaze = this.m_maze;
			// console.log("Calculating walls for " + vMazePosition);
            expandFromSurface(this.m_maze, vMazePosition, 1.8,
                function (maze, pos, dir) 
                {              
                    wallFromMazeBlockSide(theMaze, pos, dir.x, dir.y, dir.z, phys); 
                },
                function (maze, pos, dir) 
                {
					if (dir.y)
					{
						wallFromMazeBlockSide(theMaze, pos, dir.x, dir.y, dir.z, phys);
					}
                });
            clearWalls(this.physics);
            
            this.m_aMeshesCalced = aMeshes;
            this.m_vLastCalcedPosition = new THREE.Vector3(
                vMazePosition.x, vMazePosition.y, vMazePosition.z);
			// aMeshes.add(this.aLamps);
		}
		
		return this.m_aMeshesCalced;
	};
	
	return my;
}());