// -----JS CODE-----
//@input SceneObject[] gesturesUI
//@input SceneObject[] gesturesHand

var labels = ["open", "close", "victory"];

var selectedUI = "";

var asset = 
{
	"open": { hand: script.gesturesHand[0] , ui: script.gesturesUI[0] },
	"close": { hand: script.gesturesHand[1] , ui: script.gesturesUI[1] },
	"victory": { hand: script.gesturesHand[2] , ui: script.gesturesUI[2] },
}

script.api.GestureDetected = function(g) 
{
	PlayUITween(asset[g].ui, g);
	PlayHandTween(asset[g].hand);
}

function PlayUITween(obj, key)
{
	if( key != selectedUI)
	{			
		if(selectedUI!="")
			global.tweenManager.startTween(asset[selectedUI].ui,"hide");
		global.tweenManager.startTween(obj,"show");
		selectedUI = key;
	}else 
	{
		global.tweenManager.startTween(obj,"show");
	}
}

function PlayHandTween(obj)
{
	global.tweenManager.startTween(obj,"scale");
	global.tweenManager.startTween(obj,"play");
}