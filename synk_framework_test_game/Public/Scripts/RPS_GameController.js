// -----JS CODE-----
//@input SceneObject readyUI
//@input SceneObject gameplayUI
//@input SceneObject gameoverUI
//@input Component.Text connectedUsers
//@input Component.Text yourScore
//@input Component.Text otherScore
//@input Component.Text timer
//@input SceneObject timerTween
//@input Component.Text gameResult
//@input Component.ScriptComponent otherResult
//@input Component.ScriptComponent[] buttons

///////////////////////////////////////////////////////
var syncEntity = new global.SyncEntity(script);

var scoreProp = global.StorageProperty.manual("score", global.StorageTypes.vec2, new vec2(0,0));
syncEntity.addStorageProperty(scoreProp);

var yourNameProp = global.StorageProperty.manualString("yourName", "");
syncEntity.addStorageProperty(yourNameProp);

var otherNameProp = global.StorageProperty.manualString("otherName", "");
syncEntity.addStorageProperty(otherNameProp);

syncEntity.notifyOnReady(onReady);
function onReady()
{
	ListenProperties();
	syncEntity.sendEvent("onConnectNewUser");
}

syncEntity.onEventReceived.add("onConnectNewUser",function() 
{
	OnConnectNewUser();
});

syncEntity.onEventReceived.add("startGameplay",function() 
{
	StartGameplay();
});

syncEntity.onEventReceived.add("gameplayCountDown",function(networkMessage) 
{
	SetTimerText(networkMessage.data);
});

syncEntity.onEventReceived.add("gameplayCheckResult",function() 
{
	SetTimerText("");
	script.otherResult.api.ShowOtherResult(2);
});
///////////////////////////////////////////////////////
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
	GetUserNames();

	var usersAmount = global.sessionController.getUsers().length;
	UpdateAmountOfConnectedUsers(usersAmount);
	SetEnabledGameUI(true,false,false);	

	delay_CheckUsersAmount.reset(1);
}



function UpdateAmountOfConnectedUsers(amount)
{
	script.connectedUsers.text = "Connected users: \n"+amount+"/2";
}

function addScore(amount) 
{
    scoreProp.setPendingValue(scoreProp.currentValue + amount);
}

function IsMainUser()
{
	return global.getUserName() === yourNameProp.currentValue;
}
///////////////////////////////////////////////////////
var selectedBtn = -1;
var countdownAmount = 6;

// NEED TO GET USER NAMES 

function Start()
{
	SetEnabledGameUI(false,false,false);
	SetTimerText("");
}

function SetEnabledGameUI(ready,game,over)
{
	script.readyUI.enabled = ready;
	script.gameplayUI.enabled = game;
	script.gameoverUI.enabled = over;
}

function StartGameplay()
{
	SetEnabledGameUI(false,true,false);
	delay_GameplayCountDown.reset(0);
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
	script.timer.text = value+"";
	if(value != 0 && value != "")
		global.tweenManager.startTween(script.timerTween,"show");
	else 
		global.tweenManager.startTween(script.timerTween,"init");
}

function SetGameOverResult(value)
{
	script.gameResult.text = value? "YOU WIN":"YOU LOSE";
}

///////////////////////////////////////////////////////////
var delay_CheckUsersAmount = script.createEvent("DelayedCallbackEvent");
delay_CheckUsersAmount.bind(function(eventData)
{
	if(IsMainUser())
	{
		var usersAmount = global.sessionController.getUsers().length
		if(usersAmount === 2)
			syncEntity.sendEvent("startGameplay");
	}
});

var delay_GameplayCountDown = script.createEvent("DelayedCallbackEvent");
delay_GameplayCountDown.bind(function(eventData)
{
	if(IsMainUser())
	{
		countdownAmount --;
		syncEntity.sendEvent("gameplayCountDown", countdownAmount);

		if(countdownAmount >0)
			delay_GameplayCountDown.reset(1);
		else 
			syncEntity.sendEvent("gameplayCheckResult");
	}
});

///////////////////////////////////////////////////////////

Start();