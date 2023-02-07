////////////////
// Return increased index of array in loop 
////////////////
global.updateSelectedIndexInList = function(index, listCount,isNext)
{
    if (isNext===true)
        index = index + 1 < listCount ? index + 1 : 0;
    else
        index = index - 1 >= 0 ? index - 1 : listCount - 1;

    return index;
}

////////////////
// Shuffle array and return it
////////////////
global.shuffle = function(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

////////////////
// Sort array by bubble algorithm
////////////////
global.bubbleSort = function(arr)
{
    //Outer pass
    for(var i = 0; i < arr.length; i++)
    {
        //Inner pass
        for(var j = 0; j < arr.length - i - 1; j++)
        {
            //Value comparison using ascending order
            if(arr[j + 1] < arr[j])
            {
                //Swapping
                [arr[j + 1],arr[j]] = [arr[j],arr[j + 1]]
            }
        }
    }
    return arr;
};

////////////////
// Change LIST visibility
////////////////
global.setEnabledList = function (list, value)
{
    for (var i = list.length - 1; i >= 0; i--) {
        list[i].enabled = value;
    }
}

////////////////
// Disable tween with tag DISABLE
// Enable tween with tag ENABLE
////////////////
global.updateTweenState = function (enable_obj,enable_name,disable_obj,disable_name)
{
    global.tweenManager.stopTween( disable_obj, disable_name);
    global.tweenManager.startTween( enable_obj, enable_name);
}

////////////////
// Disable tween with tag DISABLE
// Enable tween with tag ENABLE
// Call FUNC as a call back, while start new tween
////////////////
global.updateTweenStateFunc = function (enable_obj,enable_name,disable_obj,disable_name, func)
{
    global.tweenManager.stopTween( disable_obj, disable_name);
    global.tweenManager.startTween( enable_obj, enable_name, func());
}

////////////////
// Return random int value
////////////////
global.getRandomInt = function(max) {
  return Math.floor(Math.random() * max);
}

////////////////
// Return random int value from min to max
// min INCLUDE
// max EXCLUDE
////////////////
global.getRandomIntEx = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

////////////////
// Return random int value from min to max
// min INCLUDE
// max INCLUDE
////////////////
global.getRandomIntInc = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

////////////////
// Return random float value from min to max
// min INCLUDE
// max EXCLUDE
////////////////
global.getRandomFloat = function(min, max) {
  return Math.random() * (max - min) + min;
}

////////////////
// Convert degree to radian
////////////////
global.convertDegreeToRadian = function(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

////////////////
// Convert radian to degree
////////////////
global.convertRadianToDegree = function(radians) {
  var pi = Math.PI;
  return radians * (180/pi);
}

/////////////////
// Return true if random value NOT EQUAL num
////////////////
global.notEqual = function(amount,num)
{
	return global.getRandomInt(amount) != num;
}

/////////////////
// Return true if random value EQUAL num
////////////////
global.isEqual = function(amount,num)
{
	return global.getRandomInt(amount) === num;
}

/////////////////
// Return value by linear interpolation
////////////////
global.lerp = function(start, end, t) {
    return start * (1 - t) + end * t;
}

global.lerpVec2 = function(startV2, endV2, t) 
{
    return new vec2(lerp(startV2.x,endV2.x,t),lerp(startV2.y,endV2.y,t));
}

global.lerpVec3 = function(startV3, endV3, t) 
{
    return new vec3(lerp(startV3.x,endV3.x,t),lerp(startV3.y,endV3.y,t),lerp(startV3.z,endV3.z,t));
}

/////////////////
//If value < min, it will return the minimum allowed number
//If value > max, it will return the maximum allowed number
//If value > min and value < max, it will return the passed number
////////////////
global.clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/////////////////
// Return user name
////////////////
var userName = "";
global.userContextSystem.requestDisplayName(function(displayName) {
   userName = displayName;
});
global.getUserName = function()
{
    return userName;
}