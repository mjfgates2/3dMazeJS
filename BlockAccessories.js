function BlockAccessories() 
{
	this.aAccessories = [];
	this.aPositions = [];
	this.aPositionsActive = [];
}

BlockAccessories.prototype = 
{
	reset : function()
	{
		this.aPositionsActive = [];
	},
	
	activate : function(
		/* THREE.Object3D */ parent,
		/* THREE.Vector3 */ coords)
	{
		var i;
		for (i = 0; i < this.aPositionsActive.length; i++)
		{
			if (this.aPositionsActive[i].equals(coords))
			{
				return;
			}
		}
		
		this.aPositionsActive.push(new THREE.Vector3(coords.x, coords.y, coords.z));
		for (i = 0; i < this.aAccessories.length; i++)
		{
			if (this.aPositions[i].equals(coords))
			{
				parent.add(this.aAccessories[i]);
			}
		}
	},
	
	add : function(
		/* THREE.Object3D */ obj,
		/* THREE.Vector3 */ coords)
	{
		this.aAccessories.push(obj);
		this.aPositions.push(new THREE.Vector3(coords.x, coords.y, coords.z));
	}
};