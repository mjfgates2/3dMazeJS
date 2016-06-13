function setupOSB(controls, idOSB, data)
{
    var btnOSB = document.getElementById(idOSB);
    function fn(val) { controls[data] = val; }
	
	btnOSB.onmousedown = function () { btnOSB.osbDown = true; fn(1);};
	btnOSB.onmouseup = function () { btnOSB.osbDown = false; fn(0);};
	btnOSB.onmouseout = function() { if (btnOSB.osbDown) {fn(0); btnOSB.osbDown = 0; } };
	btnOSB.ondragstart = function() { return false; };
}

// Chrome as of version 33.0.1750.146 does not provide this standard DOM 
// object. So, define it myself if necessary.
if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
        DOM_VK_CANCEL: 3,
        DOM_VK_HELP: 6,
        DOM_VK_BACK_SPACE: 8,
        DOM_VK_TAB: 9,
        DOM_VK_CLEAR: 12,
        DOM_VK_RETURN: 13,
        DOM_VK_ENTER: 14,
        DOM_VK_SHIFT: 16,
        DOM_VK_CONTROL: 17,
        DOM_VK_ALT: 18,
        DOM_VK_PAUSE: 19,
        DOM_VK_CAPS_LOCK: 20,
        DOM_VK_ESCAPE: 27,
        DOM_VK_SPACE: 32,
        DOM_VK_PAGE_UP: 33,
        DOM_VK_PAGE_DOWN: 34,
        DOM_VK_END: 35,
        DOM_VK_HOME: 36,
        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,
        DOM_VK_PRINTSCREEN: 44,
        DOM_VK_INSERT: 45,
        DOM_VK_DELETE: 46,
        DOM_VK_0: 48,
        DOM_VK_1: 49,
        DOM_VK_2: 50,
        DOM_VK_3: 51,
        DOM_VK_4: 52,
        DOM_VK_5: 53,
        DOM_VK_6: 54,
        DOM_VK_7: 55,
        DOM_VK_8: 56,
        DOM_VK_9: 57,
        DOM_VK_SEMICOLON: 59,
        DOM_VK_EQUALS: 61,
        DOM_VK_A: 65,
        DOM_VK_B: 66,
        DOM_VK_C: 67,
        DOM_VK_D: 68,
        DOM_VK_E: 69,
        DOM_VK_F: 70,
        DOM_VK_G: 71,
        DOM_VK_H: 72,
        DOM_VK_I: 73,
        DOM_VK_J: 74,
        DOM_VK_K: 75,
        DOM_VK_L: 76,
        DOM_VK_M: 77,
        DOM_VK_N: 78,
        DOM_VK_O: 79,
        DOM_VK_P: 80,
        DOM_VK_Q: 81,
        DOM_VK_R: 82,
        DOM_VK_S: 83,
        DOM_VK_T: 84,
        DOM_VK_U: 85,
        DOM_VK_V: 86,
        DOM_VK_W: 87,
        DOM_VK_X: 88,
        DOM_VK_Y: 89,
        DOM_VK_Z: 90,
        DOM_VK_CONTEXT_MENU: 93,
        DOM_VK_NUMPAD0: 96,
        DOM_VK_NUMPAD1: 97,
        DOM_VK_NUMPAD2: 98,
        DOM_VK_NUMPAD3: 99,
        DOM_VK_NUMPAD4: 100,
        DOM_VK_NUMPAD5: 101,
        DOM_VK_NUMPAD6: 102,
        DOM_VK_NUMPAD7: 103,
        DOM_VK_NUMPAD8: 104,
        DOM_VK_NUMPAD9: 105,
        DOM_VK_MULTIPLY: 106,
        DOM_VK_ADD: 107,
        DOM_VK_SEPARATOR: 108,
        DOM_VK_SUBTRACT: 109,
        DOM_VK_DECIMAL: 110,
        DOM_VK_DIVIDE: 111,
        DOM_VK_F1: 112,
        DOM_VK_F2: 113,
        DOM_VK_F3: 114,
        DOM_VK_F4: 115,
        DOM_VK_F5: 116,
        DOM_VK_F6: 117,
        DOM_VK_F7: 118,
        DOM_VK_F8: 119,
        DOM_VK_F9: 120,
        DOM_VK_F10: 121,
        DOM_VK_F11: 122,
        DOM_VK_F12: 123,
        DOM_VK_F13: 124,
        DOM_VK_F14: 125,
        DOM_VK_F15: 126,
        DOM_VK_F16: 127,
        DOM_VK_F17: 128,
        DOM_VK_F18: 129,
        DOM_VK_F19: 130,
        DOM_VK_F20: 131,
        DOM_VK_F21: 132,
        DOM_VK_F22: 133,
        DOM_VK_F23: 134,
        DOM_VK_F24: 135,
        DOM_VK_NUM_LOCK: 144,
        DOM_VK_SCROLL_LOCK: 145,
        DOM_VK_COMMA: 188,
        DOM_VK_PERIOD: 190,
        DOM_VK_SLASH: 191,
        DOM_VK_BACK_QUOTE: 192,
        DOM_VK_OPEN_BRACKET: 219,
        DOM_VK_BACK_SLASH: 220,
        DOM_VK_CLOSE_BRACKET: 221,
        DOM_VK_QUOTE: 222,
        DOM_VK_META: 224
    };
}

function Controls(fov, container, cPelPerPel)
{
	this.radiansPerPel = cPelPerPel * fov / container.offsetHeight / 180 * Math.PI;
	
	// Booleans - "am I doing X?"
	this.left = 0;
	this.right = 0;
	this.forward = 0;
	this.back = 0; 
	this.leftTurn = 0;
	this.rightTurn = 0;
    this.jump= 0;
	
	// which way I am looking.
	this.xLookOffset = 0;	
	this.yLookOffset = 0;
	this.r = 0;
	this.fMousedown = false;
	this.xMousedown = 0;
	this.yMousedown = 0;
	
	var mousetarget = this;
	container.onmousedown = function(event) { mousetarget.main_mousedown(event); };
	container.onmouseup = function(event) { mousetarget.main_mouseup(event); };
	container.onmousemove = function(event) { mousetarget.main_mousemove(event); };
	container.onmouseout = function(event) { mousetarget.main_mouseout(event); };
	
	document.body.onkeydown = function(event) { mousetarget.upOrDown(event, 1); };
	document.body.onkeyup = function(event) { mousetarget.upOrDown(event, 0); };
	
	// Key bindings
	this.keyFunctionMap = new Array();
	var keyFunctionMap = this.keyFunctionMap;
	keyFunctionMap[KeyEvent.DOM_VK_LEFT] = function(t) { mousetarget.goLeft(t); };
	keyFunctionMap[KeyEvent.DOM_VK_RIGHT] = function(t) { mousetarget.goRight(t); };
	keyFunctionMap[KeyEvent.DOM_VK_UP] = function(t) { mousetarget.goForward(t); };
	keyFunctionMap[KeyEvent.DOM_VK_DOWN] = function(t) { mousetarget.goBack(t); };
	keyFunctionMap[KeyEvent.DOM_VK_HOME] = function(t) { mousetarget.turnLeft(t); };
	keyFunctionMap[KeyEvent.DOM_VK_PAGE_UP] = function(t) { mousetarget.turnRight(t); };

	keyFunctionMap[KeyEvent.DOM_VK_W] = function(t) { mousetarget.goForward(t); };
	keyFunctionMap[KeyEvent.DOM_VK_A] = function(t) { mousetarget.goLeft(t); };
	keyFunctionMap[KeyEvent.DOM_VK_S] = function(t) { mousetarget.goBack(t); };
	keyFunctionMap[KeyEvent.DOM_VK_D] = function(t) { mousetarget.goRight(t); };
	keyFunctionMap[KeyEvent.DOM_VK_Q] = function(t) { mousetarget.turnLeft(t); };
	keyFunctionMap[KeyEvent.DOM_VK_E] = function(t) { mousetarget.turnRight(t); };
	
	keyFunctionMap[KeyEvent.DOM_VK_O] = function (t) { if (t) toggleOnScreenMovement(); };
	keyFunctionMap[KeyEvent.DOM_VK_M] = function (t) { if (t) launchMainMenu(); };
	
	setupOSB(this, "osb_turnLeft", "leftTurn");
	setupOSB(this, "osb_fwd", "forward");
	setupOSB(this, "osb_turnRight", "rightTurn");
	setupOSB(this, "osb_left", "left");
	setupOSB(this, "osb_back", "back");
	setupOSB(this, "osb_right", "right");
}

// Keep a rotation within the usual 0-2*pi range. 
function fitRWithin2PI(r)
{
	while (r < 0)
		r += 2 * Math.PI;
	while (r > 2 * Math.PI)
		r -= 2 * Math.PI;
	return r;
}

Controls.prototype = {
	speed: 11,  // regular movement speed in "units"/second
	turnSpeed: Math.PI, // rotation speed from keyboard, radians/second
	
	getTheta: function()
	{
		return fitRWithin2PI(this.r + this.xLookOffset * this.radiansPerPel);
	},
	
	
	getRho: function()
	{
		return this.yLookOffset * this.radiansPerPel;
	},

	getVelocityDesired : function (elapsed)
	{
		if (this.leftTurn - this.rightTurn !== 0) 
		{
			var newR = this.r + elapsed * this.turnSpeed * 
					(this.leftTurn - this.rightTurn);
			newR = fitRWithin2PI(newR);
			this.r = newR;
		}
		var rWithMouse = this.getTheta();

		var velDesired = new CANNON.Vec3(0, 0, 0);
		if (this.right - this.left !== 0 ||
			 this.forward - this.back !== 0)
		 {
			var c = Math.cos(rWithMouse);
			var s = Math.sin(rWithMouse);
			
			var dRight = (this.right - this.left) * 
				this.speed;
			var dFwd = (this.forward - this.back) * 
				this.speed;
			velDesired.x = c * dRight - s * dFwd;
			velDesired.z = -c * dFwd - s * dRight;
			// console.log("ssc " + secondsSinceControl + " fwd " + dFwd + " right " + dRight + " gives " + playerState.x + ", " + playerState.z);
		}
		
		return velDesired;
	},
	
	main_mousedown: function(event)
	{
		this.fMousedown = true;
		this.xMousedown = event.clientX;
		
		// Preserving this.yLookOffset, so that click, drag up/down, release,
		// then clicking again preserves the look up/down from the first click 
		// rather than resetting the view to horizontal.
		this.yMousedown = event.clientY - this.yLookOffset;
	},

	main_mousemove: function(event)
	{
		if (this.fMousedown)
		{
			this.xLookOffset = event.clientX - this.xMousedown;
			this.yLookOffset = event.clientY - this.yMousedown;
		}
	},

	main_mousedone: function()
	{
		if (this.fMousedown)
		{
			this.r = fitRWithin2PI(
				this.r + this.xLookOffset * this.radiansPerPel);
			this.xLookOffset = 0;
			this.fMousedown = false;
		}
	},

	main_mouseout: function(event)
	{
		this.main_mousedone();
	},

	main_mouseup: function(event)
	{
		this.main_mousedone();
	},
	
	upOrDown : function(event, updown)
	{
		if (this.keyFunctionMap[event.keyCode] !== undefined)
		{
			this.keyFunctionMap[event.keyCode](updown);
		}
	},
	
	goLeft : function(data) { this.left = data; },
	goRight : function(data)  { this.right = data; },
	goForward : function(data)  { this.forward = data; },
	goBack : function(data)  { this.back = data; },
	turnLeft : function(data)  { this.leftTurn = data; },
	turnRight : function(data)  { this.rightTurn = data; }
};
