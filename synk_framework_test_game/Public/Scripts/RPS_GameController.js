// -----JS CODE-----
//@input SceneObject readyUI
//@input SceneObject gameplayUI
//@input SceneObject gameoverUI
//@input Component.Text yourScore
//@input Component.Text otherScore
//@input Component.Text timer
//@input Component.Text gameResult
//@input Component.ScriptComponent[] buttons

///////////////////////////////////////////////////////
var syncEntity = new global.SyncEntity(script);

var scoreProp = global.StorageProperty.manual("score", global.StorageTypes.vec2, new vec2(0,0));
syncEntity.addStorageProperty(scoreProp);

var yourNameProp = global.StorageProperty.manualString("yourName", "");
syncEntity.addStorageProperty(yourNameProp);

var otherNameProp = global.StorageProperty.manualString("otherName", "");
syncEntity.addStorageProperty(otherNameProp);

syncEntity.onEventReceived.add("onConnectNewUser",function() 
{
	OnConnectNewUser();
});

syncEntity.notifyOnReady(onReady);
function onReady()
{
	ListenProperties();
	syncEntity.sendEvent("onConnectNewUser");
}

function ListenProperties() 
{
	var yourNameP = syncEntity.propertySet.getProperty("yourName");
    if (yourNameP) 
        yourNameP.onAnyChange.add(SetNamesAndScore);

    var otherNameP = syncEntity.propertySet.getProperty("otherName");
    if (otherNameP) 
        otherNameP.onAnyChange.add(SetNamesAndScore);

    var scoreP = syncEntity.propertySet.getProperty("score");
    if (scoreP) 
        scoreP.onAnyChange.add(SetNamesAndScore);
}

function OnConnectNewUser()
{
   	script.readyUI.enabled = true;
	script.gameplayUI.enabled = true;
	script.gameoverUI.enabled = false;
	
	SetTimerText("");
	GetUserNames();
}

syncEntity.onEventReceived.add("onClickReady",function() 
{
	print("canIModifyStore" + syncEntity.canIModifyStore());

	if(isReady === true)
	{
		print("Start Gameplay");
		StartGameplay();
	}
});

function addScore(amount) 
{
    scoreProp.setPendingValue(scoreProp.currentValue + amount);
}
///////////////////////////////////////////////////////
var selectedBtn = -1;
var isReady  = false;

// NEED TO GET USER NAMES 

function Start()
{
	script.readyUI.enabled = false;
	script.gameplayUI.enabled = false;
	script.gameoverUI.enabled = false;
	
	SetTimerText("");
}

function StartGameplay()
{
	script.readyUI.enabled = false;
	script.gameplayUI.enabled = true;
	script.gameoverUI.enabled = false;
	
	SetTimerText("game");
}

script.api.OnClick_ReadyButton = function()
{
	print("READY Clicked");
	isReady = true;
	syncEntity.sendEvent("onClickReady");
}

script.api.SelectButton = function(id)
{
	selectedBtn = id;
	UnSelectAllButtons(id);
}

script.api.UnSelectButton = function(id)
{

}

function UnSelectAllButtons(selected)
{
	for (var i = script.buttons.length - 1; i >= 0; i--) 
	{
		if(selected != i)
			script.buttons[i].api.UnSelect();
	}
}

function GetUserNames()
{
	var userName = global.getUserName();
	if (yourNameProp.currentValue == "")
		yourNameProp.setPendingValue(userName);
	else
		otherNameProp.setPendingValue(userName);
}

function SetNamesAndScore()
{
	script.yourScore.text = yourNameProp.currentValue + ": " + scoreProp.currentValue.x;
	script.otherScore.text = otherNameProp.currentValue + ": " + scoreProp.currentValue.y;
}

function SetTimerText(value)
{
	script.timer.text = value;
}

function SetGameOverResult(value)
{
	script.gameResult.text = value? "YOU WIN":"YOU LOSE";
}

Start();