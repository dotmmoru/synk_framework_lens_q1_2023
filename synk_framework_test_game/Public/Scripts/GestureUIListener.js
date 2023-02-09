// -----JS CODE-----
//@input Component.ScriptComponent gameController
//@input SceneObject[] gesturesUIParent
//@input SceneObject[] gesturesUI
//@input SceneObject[] gesturesHand

var labels = ["open", "close", "victory"];

var isEnabled = false;
var selectedUI = "";

var asset = 
{
	"open": { hand: script.gesturesHand[0] , ui: script.gesturesUI[0], id: 1, uiParent: script.gesturesUIParent[0] }, // papper 
	"close": { hand: script.gesturesHand[1] , ui: script.gesturesUI[1], id: 0, uiParent: script.gesturesUIParent[1] }, // rock
	"victory": { hand: script.gesturesHand[2] , ui: script.gesturesUI[2], id: 2, uiParent: script.gesturesUIParent[2] }, // scissors
}

script.api.IsGestureEnabled = function(value)
{
	isEnabled = value;
}

script.api.UnSelectAll = function()
{
	selectedUI = "";
	for (var i = script.gesturesUI.length - 1; i >= 0; i--) 
	{
		global.tweenManager.startTween(script.gesturesUI[i],"init");
		global.tweenManager.startTween(script.gesturesUIParent[i],"init");
	}
}

script.api.GestureDetected = function(g) 
{
	if(isEnabled === false)
		return;

	script.gameController.api.SelectButton(asset[g].id);
	PlayUITween(asset[g].ui, asset[g].uiParent, g);
	PlayHandTween(asset[g].hand);
}

function PlayUITween(obj, objParent ,key)
{
	if( key != selectedUI)
	{			
		if(selectedUI!="")
			global.tweenManager.startTween(asset[selectedUI].ui,"hide");
		global.tweenManager.startTween(obj,"show");
		global.tweenManager.startTween(objParent,"select");
		selectedUI = key;
	}else 
	{
		global.tweenManager.startTween(objParent,"select");
		global.tweenManager.startTween(obj,"show");
	}
}

function PlayHandTween(obj)
{
	global.tweenManager.startTween(obj,"scale");
	global.tweenManager.startTween(obj,"play");
}