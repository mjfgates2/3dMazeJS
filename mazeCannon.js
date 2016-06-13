CANNON.Vec3.prototype.toString = function ()
{
    return "(" + this.x + "," + this.y + "," + this.z + ")";
};
     
var PLAYER_MASS=150;

// Floor half-width, ramp width, upper ramp length, lower ramp length
var FW = 5, RW = 2.5, URL = 4, LRL = 4, CUTOUTWIDTH = 2;
var RH = 2; // handrail height
var WT = 0.5; // wall thickness
var CUTZ = -FW + RW + CUTOUTWIDTH;
var aFloorWithHoleVertices = [
        // main floor sections 
        [ FW - RW - URL, 0, -FW - WT,
          -FW - WT, 0, -FW - WT,
          -FW - WT, 0, FW + WT,
          FW - RW - URL, 0, FW + WT
        ],
        [ 
          FW - RW, 0, -FW + RW,
          FW - RW - URL, 0, -FW + RW,
          FW - RW - URL, 0, FW + WT,
          FW - RW, 0, FW + WT
        ],
        [ 
          FW + WT, 0, -FW + RW + CUTOUTWIDTH,
          FW - RW, 0, - FW + RW + CUTOUTWIDTH,
          FW - RW, 0, FW + WT,
          FW + WT, 0, FW + WT 
        ],
        // upper ramp
        [ 
          FW - RW, -URL, -FW,
          FW - RW - URL, 0, -FW, 
          FW - RW - URL, 0, -FW + RW,
          FW - RW, -URL, -FW + RW
        ],
        // landing
        [ 
          FW, -URL, -FW,
          FW - RW, -URL, -FW,
          FW - RW, -URL, -FW + RW, 
          FW, -URL, -FW + RW
        ],
        // lower ramp
        [ FW, -URL, -FW + RW,
          FW - RW, -URL, -FW + RW,
          FW - RW, -URL - LRL, -FW + RW + LRL,
          FW, -URL - LRL, -FW  + RW + LRL
        ],
		// handrails
		[-FW + RW, RH, -FW,
		-FW + RW, 0, -FW,
		-FW + RW + URL, -URL, -FW,
		-FW + RW + URL, RH, -FW
		],
		[-FW + RW + URL, RH, -FW,
		-FW + RW + URL, -URL, -FW,
		FW, -URL, -FW,
		FW, RH, -FW
		],
		[-FW + RW, RH, -FW + RW,
		FW - RW, RH, -FW + RW,
		FW - RW, -URL, -FW + RW,
		-FW + RW, 0, -FW + RW
		],
		[FW, RH, -FW,
		FW, -URL, -FW,
		FW, -URL, -FW + RW,
		FW, RH, -FW + RW
		],
		[FW, -URL + RH, -FW + RW,
		FW, -URL, -FW + RW,
		FW, -URL - LRL, -FW + RW + LRL,
		FW, -URL - LRL + RH, -FW + RW + LRL
		],
		[FW - RW, -URL + RH, -FW + RW,
		FW - RW, -URL - LRL + RH, -FW + RW + LRL,
		FW - RW, -URL - LRL, -FW + RW + LRL,
		FW - RW, -URL, -FW + RW
		],
		// cutout handrails on upper floor
		[FW - RW, RH, -FW + RW,
		 FW - RW, RH, CUTZ,
		 FW - RW, 0, CUTZ,
		 FW - RW, 0, -FW + RW],
		[FW, RH, CUTZ,
		 FW - RW, RH, CUTZ,
		 FW - RW, 0, CUTZ,
		 FW, 0, CUTZ],
		[FW, RH, -FW + RW,
		 FW, 0, -FW + RW,
		 FW, 0, CUTZ,
		 FW , RH, CUTZ]
    ];

var vMinusJ = new CANNON.Vec3(0, -0.5, 0);
var vMinusK = new CANNON.Vec3(0, 0, -0.25);
var vK = new CANNON.Vec3(0, 0, 0.25);
var vMinusI = new CANNON.Vec3(-0.25, 0, 0);
var vI = new CANNON.Vec3(0.25 , 0, 0);
var aFloorBlockNormals = [
	vMinusJ, vMinusJ, vMinusJ, 
	vMinusJ, vMinusJ, vMinusJ,
	vMinusK, vMinusK, vK, 
	vI, vI, vMinusI,
	vMinusI, vMinusK, vI
    ];
	
    // All of the shapes use the same order of vertices, so the same
	// array of vertex indices works for all.
var    floorWithHoleFaces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 4, 7, 1],
        [1, 7, 6, 2],
        [2, 6, 5, 3],
        [3, 5, 4, 0]
    ];

function MazePhysics(maze, wallThickness)
{
    this.world = new CANNON.World();
    this.world.gravity.set(0, -10, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    
    this.wallThickness = wallThickness;
    this.maze = maze;
	this.shapeWallX = new CANNON.Box(
		new CANNON.Vec3(wallThickness, maze.cyBlock / 2, maze.czBlock / 2));
	this.shapeWallZ = new CANNON.Box(
		new CANNON.Vec3(maze.cxBlock / 2, maze.cyBlock / 2, wallThickness));

    this.dirt = new CANNON.Material("dirt");
    this.feet = new CANNON.Material("feet");
    var contactDirtFeet = new CANNON.ContactMaterial(this.dirt, this.feet, 0.001, 0.005);
    this.world.addMaterial(this.dirt);
    this.world.addMaterial(this.feet);
    this.world.addContactMaterial(contactDirtFeet);

/*   // The six outer borders of the maze.
    this.addBorder(1, 0, 0, -maze.offsetBlock.x, 0, 0);
    this.addBorder(-1, 0, 0, -maze.offsetBlock.x + maze.cxBlock * maze.cx, 0, 0);
    this.addBorder(0, 1, 0, 0, -maze.offsetBlock.y, 0);
    this.addBorder(0, -1, 0, 0, -maze.offsetBlock.y + maze.cyBlock * maze.cy, 0);
    this.addBorder(0, 0, 1, 0, 0, -maze.offsetBlock.z);
    this.addBorder(0, 0, -1, 0, 0, -maze.offsetBlock.z + maze.czBlock * maze.cz);
*/

    this.bodyPlayer = new CANNON.RigidBody(PLAYER_MASS, 
        new CANNON.Sphere(1), // new CANNON.Cylinder(.75, .5, .5, 8), // new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)), 
        this.feet);
    // bodyPlayer.angularDamping = 0.5;
    this.world.add(this.bodyPlayer);
}

MazePhysics.prototype = 
{
/*    addBorder: function(xNorm, yNorm, zNorm, x, y, z)
    {
        var normal = new CANNON.Vec3(xNorm, yNorm, zNorm);
        var pt = new CANNON.Vec3(x, y, z);
        // console.log("adding border normal " + normal.toString() + " point " + pt.toString());
        this.world.add(CANNONplaneFromNormalAndPoint(normal, pt, this.dirt));
    },
*/
    
    wallName: function(coords, xDir, yDir, zDir)
    {
        function nonzero(num)
        {
            return num !== 0 ? "1," : "0,";
        }
        
        var tCoords = new CANNON.Vec3(
            coords.x + (xDir == -1 ? -1 : 0),  
            coords.y + (yDir == -1 ? -1 : 0), 
            coords.z + (zDir == -1 ? -1 : 0));
        return "" + tCoords.x + "," + tCoords.y + "," + tCoords.z + 
                "," + nonzero(xDir) + nonzero(yDir) + nonzero(zDir);
    },
    
    addWall: function(coords, xDir, yDir, zDir)
    {
		var body;
        if (yDir == -1)
        {        
            body = this.addFloor(coords);
        }
        else if (yDir == 1)
        {
            upCoords = new THREE.Vector3(coords.x, coords.y + 1, coords.z);
            body = this.addFloor(upCoords);
        }
        else
        {
            // console.log("added wall " + this.wallName(coords, xDir, yDir, zDir));
            var blockCenter = this.maze.toSpaceCoords(coords);
            var wallCenter = new CANNON.Vec3(
                blockCenter.x + (this.maze.cxBlock * xDir / 2),
                blockCenter.y + this.maze.cyBlock / 2,
                blockCenter.z + (this.maze.czBlock * zDir / 2));
             
            var shape = (xDir !== 0) ? this.shapeWallX : this.shapeWallZ;
            body = new CANNON.RigidBody(0, shape, this.dirt);
            body.position = wallCenter;
        }
		
		this.world.add(body);

		/* console.log("Added wall for %s dir %d,%d,%d at %s", 
				coords.toString(), xDir, yDir, zDir, 
				wallCenter.toString()); */
		return body;

    },

    removeWall: function(body)
    {
        // console.log("removed wall");
        this.world.remove(body);
    },
    
    // TODO: Modularize, turn these private/static.
    shapeFloorHole : undefined,
    shapeFloor: undefined,
    getFloorShape : function(present)
    {
        var vCentroid;
        
        function vtxFromFloorPos(aFloor, 
			offset, 
			aVtx, 
			iFloor, 
			iLower,
			vVertical)
        {
            if (aFloor === undefined)
            {
                console.log("why is my array not here?");
            }
            aVtx[iFloor] = new CANNON.Vec3(aFloor[offset], aFloor[offset + 1], aFloor[offset + 2]);
            aVtx[iLower] = new CANNON.Vec3(
				aFloor[offset] + vVertical.x, 
				aFloor[offset + 1] + vVertical.y, 
				aFloor[offset + 2] + vVertical.z);
            vCentroid.x += aVtx[iFloor].x + aVtx[iLower].x;
            vCentroid.y += aVtx[iFloor].y + aVtx[iLower].y;
            vCentroid.z += aVtx[iFloor].z + aVtx[iLower].z;
        }
        
        if (this.shapeFloorHole === undefined) 
        {
            this.shapeFloorHole = new CANNON.Compound();
            
            for (var i = 0; i < aFloorWithHoleVertices.length; i++)
            {
                var av3Vertices = new Array(8);
                var aFloorPos = aFloorWithHoleVertices[i];
				var vVertical = aFloorBlockNormals[i];
                
                vCentroid = new CANNON.Vec3(0, 0, 0);
                vtxFromFloorPos(aFloorPos, 0, av3Vertices, 0, 4, vVertical);
                vtxFromFloorPos(aFloorPos, 3, av3Vertices, 1, 7, vVertical);
                vtxFromFloorPos(aFloorPos, 6, av3Vertices, 2, 6, vVertical);
                vtxFromFloorPos(aFloorPos, 9, av3Vertices, 3, 5, vVertical);
                
                vCentroid.x /= 8;
                vCentroid.y /= 8;
                vCentroid.z /= 8;
                
                for (var iVtx = 0; iVtx < av3Vertices.length; iVtx++)
                {
                    av3Vertices[iVtx].x -= vCentroid.x;
                    av3Vertices[iVtx].y -= vCentroid.y;
                    av3Vertices[iVtx].z -= vCentroid.z;
                }

                var shape = new CANNON.ConvexPolyhedron(av3Vertices, floorWithHoleFaces);
                // console.log("Adding sub-shape at %s to floor", vCentroid.toString());
                this.shapeFloorHole.addChild(shape, vCentroid);
            }
            
            var wallSize = new CANNON.Vec3(maze.cxBlock / 2 + this.wallThickness, 
                    this.wallThickness / 2,
                    maze.czBlock / 2 + this.wallThickness);
            this.shapeFloor = new CANNON.Compound();
			this.shapeFloor.addChild(new CANNON.Box(wallSize), 
					new CANNON.Vec3(0, -this.wallThickness / 2, 0));
        }
        
        return present ? this.shapeFloor : this.shapeFloorHole;
    },
    
    addFloor: function(coords)
    {
        var blockCenter = this.maze.toSpaceCoords(coords);
        var yFloor = blockCenter.y;
        var shape = this.getFloorShape(
                    (maze.entry(coords) & maze.MEMASKMY),
                    this.wallThickness);
        var body = new CANNON.RigidBody(0, shape, this.dirt);
        body.position.set(blockCenter.x /*  + maze.offsetBlock.x */, 
            yFloor, blockCenter.z /* + maze.offsetBlock.z */);
        
        // console.log("Added floor for " + coords.toString() + " at " + body.position.toString());
        return body;
    },
    
    pushPlayerTowardVelocity : function(velDesired)
    {
        var MOVE_FULL_SPEED_TIME = 0.25;
        
        function desiredForce(mass, 
            /* CANNON.Vec3 */ velCurrent, 
            /* CANNON.Vec3 */ velDesired, timeRamp)
        {
            var vDiff = velDesired.vsub(velCurrent);
            vDiff.mult(mass / timeRamp, vDiff);
			
			// If I'm moving horizontally, or trying to move at all, don't damp
			// the y-force; I may be jumping or some such. (If I'm falling, gravity 
			// will fight it out with the damping and I'll still fall.)
			if (!velDesired.almostZero(0.01) || 
				(Math.abs(velCurrent.x) > 0.01 || Math.abs(velCurrent.y) > 0.01))
			{
				vDiff.y = 0;
			}
            return vDiff;
        }
        
        var vPushPos = this.bodyPlayer.position.copy();
        vPushPos.y += 1;
		
		if (velDesired.almostZero(0.25) && this.bodyPlayer.velocity.almostZero(0.25))
		{
			// console.log("stopping.");
			this.bodyPlayer.velocity.set(0, 0, 0);
			this.bodyPlayer.force.set(0, 0, 0);
		}
		else
		{
			var fDesired = desiredForce(this.bodyPlayer.mass, 
						this.bodyPlayer.velocity, velDesired, MOVE_FULL_SPEED_TIME);
			this.bodyPlayer.applyForce(fDesired, vPushPos);
		}
    },
    
    jumpPlayer: function(yVel)
    {
        var vJump = new CANNON.Vec3(0, yVel * this.bodyPlayer.mass, 0);
		// console.log("boing");
		bodyPlayer.applyImpulse(vJump, bodyPlayer.position);
		controlState.jump = 0;
    }, 
    
    getPlayer: function()
    {
        return this.bodyPlayer;
    },
    
    tick: function(seconds)
    {   
        if (seconds > 0.1)
        {
            // console.log("long tick " + seconds + " s");
            seconds = 0.1;
        }
        this.world.step(seconds);
    },
	
	wallCount : function()
	{
		return this.world.bodies.length - 1;
	},
	
	dumpPositions: function()
	{
		for (var i = 0; i < this.world.bodies.length; i++)
		{
			console.log("body at " + this.world.bodies[i].position);
		}
	}
};