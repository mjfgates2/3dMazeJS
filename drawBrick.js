function BrickPlacer(
		imgBrick, imgMortar, imgBrickBump, imgMortarBump)
{
    this.ptMinBrickSize = new Object(); 
	this.ptMaxBrickSize = new Object();
	
	this.imgBrick = imgBrick;
	this.imgBrickBump = imgBrickBump;
	this.imgMortar = imgMortar;
	this.imgMortarBump = imgMortarBump;
	
}

function rnd(min, max) { return min + Math.random() * (max - min); }

BrickPlacer.prototype = 
{
    ctxColor: undefined,
    ctxBump: undefined, 
    mortarThickness: 6,
	
	setBrickSize : function(cxBrickMin, cxBrickMax, cyBrickMin, cyBrickMax, mortarThickness)
	{
		this.ptMinBrickSize.x = 1 * cxBrickMin;
		this.ptMinBrickSize.y = 1 * cyBrickMin;
		
		this.ptMaxBrickSize.x = 1 * cxBrickMax;
		this.ptMaxBrickSize.y = 1 * cyBrickMax;
		this.mortarThickness = 1 * mortarThickness;
	},
	
	placeSingleBrick : function (yCenter, left, width, cyBrick)
	{
		var tx = rnd(0, 256);
		var ty = rnd(0, 256);
		
		this.ctxColor.translate(tx, ty);
		this.ctxColor.fillRect(left - tx, yCenter - cyBrick / 2 - ty, width, cyBrick);
		this.ctxColor.translate(-tx, -ty);
		
		this.ctxBump.translate(tx, ty);
		this.ctxBump.fillRect(left - tx, yCenter - cyBrick / 2 - ty, width, cyBrick);
		this.ctxBump.translate(-tx, -ty);
	},
    
    placeBrickRow : function(yCenter, left, xRight)
    {
       
        // mortar gaps at the ends of the row
        if (Math.random() >= 0.5)
        {
            left += this.mortarThickness;
        }
        
        if (Math.random() >= 0.5)
        {
            xRight -= this.mortarThickness;
        }
        
        while (xRight - left > this.mortarThickness * 2)
        {
            var width = Math.min(rnd(this.ptMinBrickSize.x, this.ptMaxBrickSize.x), 
                xRight - left - this.mortarThickness);
            var y = yCenter - this.mortarThickness / 2 + rnd(1, this.mortarThickness - 2);
            var cyBrick = rnd(this.ptMinBrickSize.y, this.ptMaxBrickSize.y);
			this.placeSingleBrick(y, left, width, cyBrick);
			left += width + this.mortarThickness;
        }
    },
    
    drawBricksRect : function(canvasColor, canvasBump, left, top, width, height)
    {
		
		this.ctxColor = canvasColor.getContext("2d");
		this.ctxBump = canvasBump.getContext("2d");
		
		this.ctxColor.fillStyle = this.imgMortar ? 
			this.ctxColor.createPattern(this.imgMortar, "repeat") : 
			"rgb(192, 192, 192)";
		this.ctxColor.fillRect(left, top, width, height);
		this.ctxBump.fillStyle = this.imgMortarBump ? 
			this.ctxBump.createPattern(this.imgMortarBump, "repeat") : 
			"rgb(0, 0, 0)";
		this.ctxBump.fillRect(left, top, width, height);
		
		this.ctxColor.fillStyle = this.imgBrick ? 
			this.ctxColor.createPattern(this.imgBrick, "repeat") : 
			"rgb(128, 96, 96)";
		this.ctxBump.fillStyle = this.imgBrickBump ? 
			this.ctxBump.createPattern(this.imgBrickBump, "repeat") : 
			"rgb(255, 255, 255)";
		
		var cyAverageBrick = (this.ptMaxBrickSize.y + this.ptMinBrickSize.y) / 2;
		
		var offset = 0;
		var dOffset = -(this.ptMaxBrickSize.x + this.ptMinBrickSize.x) / 4;
		for (var i = top + height - cyAverageBrick / 2 - rnd(0, this.mortarThickness); 
			i >= top; 
			i -= cyAverageBrick + this.mortarThickness)
		{
			this.placeBrickRow(i, left + offset, left + width - offset);
			offset += dOffset;
			dOffset = -dOffset;
		}
    }
	
	drawBricksComplex : function(canvasColor, canvasBump, 
		aLefts, aRights,
		borders)
	{
		var retval = undefined;
		function apply(array, fn /* function (previous, element) */ )
		{
			for (var i = 0; i < array.length; i++)
			{
				retval = fn(retval, array[i]);
			}
			return retval;
		}
	
		var left = apply(aLefts, 
			function(prev, elem) { return (prev === undefined) ? 
				elem.x : Math.min(prev, elem.x); });
		var right = apply(aRights,
			function(prev, elem) { return (prev === undefined) ?
				elem.x : Math.max(prev, elem.x); });
				
		this.drawBricksRect(canvasColor, canvasBump, 
			left, right - left, 
			aLefts[0].y, aLefts[aLefts.length - 1].y);
	}

}; 