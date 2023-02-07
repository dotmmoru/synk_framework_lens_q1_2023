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
var syncEntity = new global.SyncEntity(script, null, true);

var scoreProp = global.StorageProperty.manual("score", global.StorageTypes.vec2, new vec2(0,0));
syncEntity.addStorageProperty(scoreProp);

syncEntity.notifyOnReady(onReady);
function onReady()
{
	syncEntity.sendEvent("onConnectNewUser");
}

var yourNameProp = global.StorageProperty.manualString("yourName", "");
syncEntity.addStorageProperty(yourNameProp);

var otherNameProp = global.StorageProperty.manualString("otherName", "");
syncEntity.addStorageProperty(otherNameProp);

syncEntity.onEventReceived.add("onConnectNewUser",function() 
{
	OnConnectNewUser();
});

syncEntity.onEventReceived.add("onClickReady",function() 
{
	print("canIModifyStore" + syncEntity.canIModifyStore());

	if(isReady === true)
	{
		print("Start Gameplay");
		StartGameplay();
	}
});

function OnConnectNewUser()
{
   	script.readyUI.enabled = true;
	script.gameplayUI.enabled = true;
	script.gameoverUI.enabled = false;
	
	SetTimerText("");
	GetUserNames();
	SetNamesAndScore(0,0);
}

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
	SetNamesAndScore(0,0);
}

function StartGameplay()
{
	script.readyUI.enabled = false;
	script.gameplayUI.enabled = true;
	script.gameoverUI.enabled = false;
	
	SetTimerText("game");
	SetNamesAndScore(0,0);
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
	if (syncEntity.doIOwnStore()) 
	{
		var currentOwner = syncEntity.ownerInfo;
		script.yourScore.text = currentOwner.displayName;
		print(currentOwner.displayName);
		yourNameProp.setPendingValue(currentOwner.displayName);
	}else 
	{
		var userName = global.getUserName();

		if(userName === "")
			userName = "TEST";
		print(userName);
		script.otherScore.text = userName+"";
		otherNameProp.setPendingValue(userName);
	}
}

function SetNamesAndScore(scoreYou, scoreOther)
{
	script.yourScore.text = yourNameProp.currentValue + ": " + scoreYou;
	script.otherScore.text = otherNameProp.currentValue + ": " + scoreOther;
}

function SetNames(nameYou, nameOther, scoreYou, scoreOther)
{
	script.yourScore.text = nameYou + ": " + scoreYou;
	script.otherScore.text = nameOther + ": " + scoreOther;
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