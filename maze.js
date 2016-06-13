function Maze(cx, cy, cz)
{
	this.entries = new Uint32Array(cx * cy * cz);
	this.cx = cx;
	this.cy = cy;
	this.cz = cz;
	this.vCurrentSet = new THREE.Vector3().set(-1, -1, -1);
	this.set = undefined;
}

Maze.prototype = 
{
	cxBlock: 10,
	cyBlock: 8,
	czBlock: 10,
	offsetBlock : new THREE.Vector3(5, 0, 5),
	MEMASKPY : 1,
	MEMASKMY : 2,
	MEMASKPZ : 4, 
	MEMASKMZ : 8,
	MEMASKPX : 16,
	MEMASKMX : 32,
	
	/* uint32 */ entry : function(/* THREE.Vector3 */ vMaze) 
	{
        if (vMaze.x < 0 || vMaze.x >= this.cx || 
            vMaze.y < 0 || vMaze.y >= this.cy ||
            vMaze.z < 0 || vMaze.z >= this.cz)
        {
            return this.ALLWALLS;
        }
        else
        {
            return this.entries[vMaze.x + this.cx * (vMaze.y + this.cy * vMaze.z)];
        }
	},
    
    setEntry : function(vMaze, value)
    {
        // console.log("setting " + vMaze + " to  " + value);
        this.entries[vMaze.x + this.cx * (vMaze.y + this.cy * vMaze.z)] = value;
    },
    
    fill: function(value)
    {
        vTemp = new THREE.Vector3();
        for (vTemp.x = this.cx - 1; vTemp.x >= 0; vTemp.x--)
        {
            for (vTemp.y = this.cy - 1; vTemp.y >= 0; vTemp.y--)
            {
                for (vTemp.z = this.cz - 1; vTemp.z >= 0; vTemp.z--)
                {
                    this.setEntry(vTemp, value);
                }
            }
        }
    },
	
	/* THREE.Vector3 */ toMazeCoords : function (/* THREE.Vector3 */ vSpace) 
	{
		return new THREE.Vector3(
			Math.floor((vSpace.x + this.offsetBlock.x) / this.cxBlock),
			Math.floor((vSpace.y + this.offsetBlock.y) / this.cyBlock),
			Math.floor((vSpace.z + this.offsetBlock.z) / this.czBlock));
	},
	
	/* THREE.Vector3 */ toSpaceCoords : function(/* THREE.Vector3 */ vMaze)
	{
		return new THREE.Vector3(
			vMaze.x * this.cxBlock /* + this.offsetBlock.x */,
			vMaze.y * this.cyBlock /* + this.offsetBlock.y */ ,
			vMaze.z * this.czBlock /* + this.offsetBlock.z */ );
	},
    
    isValidCoord : function(/* THREE.Vector3 */ vMaze)
    {
        return vMaze.x >= 0 && vMaze.x < this.cx && 
            vMaze.y >= 0 && vMaze.y < this.cy &&
            vMaze.z >=0 && vMaze.z < this.cz;
    }
    
};

Maze.prototype.aDirections =
    [[new THREE.Vector3(0, 1, 0), Maze.prototype.MEMASKPY, Maze.prototype.MEMASKMY],
     [new THREE.Vector3(0, -1, 0), Maze.prototype.MEMASKMY, Maze.prototype.MEMASKPY],
     [new THREE.Vector3(0, 0, 1), Maze.prototype.MEMASKPZ, Maze.prototype.MEMASKMZ],
     [new THREE.Vector3(0, 0, -1), Maze.prototype.MEMASKMZ, Maze.prototype.MEMASKPZ],
     [new THREE.Vector3(1, 0, 0), Maze.prototype.MEMASKPX, Maze.prototype.MEMASKMX],
     [new THREE.Vector3(-1, 0, 0), Maze.prototype.MEMASKMX, Maze.prototype.MEMASKPX]];
Maze.prototype.ALLWALLS = Maze.prototype.MEMASKPY | Maze.prototype.MEMASKMY | 
        Maze.prototype.MEMASKPZ | Maze.prototype.MEMASKMZ | 
        Maze.prototype.MEMASKPX | Maze.prototype.MEMASKMX;


var MazeGen = (function () {
    function randInt(maxPlusOne)
    {
        return Math.floor(Math.random() * maxPlusOne);
    }
    
	var my = {
		run : function(maze) 
		{
            maze.fill(maze.ALLWALLS);
            
            var cSpotsRemaining = maze.cx * maze.cy * maze.cz - 1;
            
            var surface = [new THREE.Vector3(randInt(maze.cx), 
                    randInt(maze.cy), randInt(maze.cz))];
            while (surface.length > 0)
            {
                var iSurface = randInt(surface.length);
                var currentSpot = surface[iSurface];
                var ent = maze.entry(currentSpot);
                
                var dirStart = randInt(maze.aDirections.length);
                var dir = dirStart;
                do
                {
                    var newSpot = new THREE.Vector3(currentSpot.x, currentSpot.y, currentSpot.z).
                            add(maze.aDirections[dir][0]);
                    if ((ent & maze.aDirections[dir][1]) !=- 0 &&
                        maze.isValidCoord(newSpot) &&
                        maze.entry(newSpot) === maze.ALLWALLS)
                    {
                        // console.log("maze opening " + currentSpot + " -> " + newSpot);
                        // Found a new spot to expand to
                        maze.setEntry(surface[iSurface], ent - maze.aDirections[dir][1]);
                        maze.setEntry(newSpot, maze.entry(newSpot) - maze.aDirections[dir][2]);
                        surface.push(newSpot);
                        dir = maze.aDirections.length + 37;
                        cSpotsRemaining--;
                        break;
                    }
                    else
                     /* {
                        // Report on why this direction wasn't suitable.
                        var reason = "";
                        if ((ent & maze.aDirections[dir][1]) == 0)
                            reason = " wall already open ";
                        if (!maze.isValidCoord(newSpot)) reason = reason + "bad destination ";
                        if (maze.entry(newSpot) != maze.ALLWALLS)
                            reason = reason + " new spot not empty";
                        console.log("can't open " + currentSpot + "(" + ent + ")->" + newSpot + 
                            ", " + reason);
                        
                    } */
                    dir = (dir + 1) % maze.aDirections.length;
                } while (dir != dirStart); 
                
                if (dir == dirStart)
                {
                    // console.log("Spot " + surface[iSurface] + " clogged, removing");
                    // No spaces were actually reachable from the given spot; remove it
                    // from the surface.
                    surface.splice(iSurface, 1);
                }
            }
            
            // console.log("ended generation, " + cSpotsRemaining + " spots unfilled");
            if (cSpotsRemaining > 0)
            {
                // TODO: throw 
                console.log("Maze did not fill all spots.");
            }
		}
	};
    
    return my;
}());