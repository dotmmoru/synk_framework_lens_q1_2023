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

var yourNameProp = global.StorageProperty.manual("yourName", global.StorageTypes.string, "");
syncEntity.addStorageProperty(yourNameProp);

var otherNameProp = global.StorageProperty.manual("otherName", global.StorageTypes.string, "");
syncEntity.addStorageProperty(otherNameProp);

var yourChoiceProp = global.StorageProperty.manualInt("yourChoice", -1);
syncEntity.addStorageProperty(yourChoiceProp);

var otherChoiceProp = global.StorageProperty.manualInt("otherChoice", -1);
syncEntity.addStorageProperty(otherChoiceProp);

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
	var otherResult = IsMainUser()? otherChoiceProp.currentValue : yourChoiceProp.currentValue;
	print("otherResult " + otherResult);
	script.otherResult.api.ShowOtherResult(otherResult);
	if(IsMainUser())
		HandleResult();
	delay_CheckUsersAmount.reset(2);
});
///////////////////////////////////////////////////////
function ListenProperties() 
{
	yourNameProp.onAnyChange.add(function(newValue, oldValue) 
	{
		SetNamesAndScore();
	});

    otherNameProp.onAnyChange.add(function(newValue, oldValue) 
	{
		SetNamesAndScore();
	});

    scoreProp.onAnyChange.add(function(newValue, oldValue) 
	{
		SetNamesAndScore();
	});
}

function OnConnectNewUser()
{
	GetUserNames();

	var usersAmount = global.sessionController.getUsers().length;
	UpdateAmountOfConnectedUsers(usersAmount);
	SetEnabledGameUI(true,false,false);	

	delay_CheckUsersAmount.reset(2);
}

function UpdateAmountOfConnectedUsers(amount)
{
	script.connectedUsers.text = "Connected users: \n"+amount+"/2";
}

function HandleResult()
{
	if(yourChoiceProp.currentValue >= 0 && otherChoiceProp.currentValue >= 0)
	{
		if(yourChoiceProp.currentValue != otherChoiceProp.currentValue)
		{
			// rock 0
			// papper 1
			// scissors 2
			IfVal(0, 2, yourChoiceProp.currentValue, otherChoiceProp.currentValue, new vec2(1,0));
			IfVal(2, 1, yourChoiceProp.currentValue, otherChoiceProp.currentValue, new vec2(1,0));
			IfVal(1, 0, yourChoiceProp.currentValue, otherChoiceProp.currentValue, new vec2(1,0));
			IfVal(2, 0, yourChoiceProp.currentValue, otherChoiceProp.currentValue, new vec2(0,1));
			IfVal(1, 2, yourChoiceProp.currentValue, otherChoiceProp.currentValue, new vec2(0,1));
			IfVal(0, 1, yourChoiceProp.currentValue, otherChoiceProp.currentValue, new vec2(0,1));
		}else 
			print("DRAW");
	}else 
	{
		if(yourChoiceProp.currentValue >= 0 || otherChoiceProp.currentValue >= 0)
		{
			var other = otherChoiceProp.currentValue > yourChoiceProp.currentValue ? 1:0;
			var your = otherChoiceProp.currentValue < yourChoiceProp.currentValue ? 1:0;
			addScore(your,other);
		}
	}
}

function IfVal(a, b, choiceY , choiceO, score) 
{
	var result = (choiceY === a && choiceO === b)? true : false;
	if(result == true)
	{
		addScore(score.x, score.y);
	}
}

function addScore(yourScore, otherScore) 
{
	var tempScore = new vec2(scoreProp.currentValue.x += yourScore, scoreProp.currentValue.y += otherScore);
	print(tempScore);
    scoreProp.setPendingValue(tempScore);
}

function IsMainUser()
{
	return global.getUserName() === yourNameProp.currentValue;
}
///////////////////////////////////////////////////////
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
	ResetChoise();
	AllowButtonTap(true);
	UnSelectAllButtons(-1);
	script.otherResult.api.HideOtherResult();
	countdownAmount = 6;
	delay_GameplayCountDown.reset(0);
}

script.api.SelectButton = function(id)
{
	if(IsMainUser())
	{
		yourChoiceProp.setPendingValue(id);
	}else 
	{
		otherChoiceProp.setPendingValue(id);
	}
	UnSelectAllButtons(id);
}

function ResetChoise()
{
	yourChoiceProp.setPendingValue(-1);
	otherChoiceProp.setPendingValue(-1);
}

function AllowButtonTap(allow)
{
	for (var i = script.buttons.length - 1; i >= 0; i--) 
		script.buttons[i].api.IsTapEnabled(allow);
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
		if(yourNameProp.currentValue != userName)
			otherNameProp.setPendingValue(userName);
}

function SetNamesAndScore()
{
	//print("SetNamesAndScore " + yourNameProp.currentValue + ": " + scoreProp.currentValue.x);
	//print("SetNamesAndScore " + otherNameProp.currentValue + ": " + scoreProp.currentValue.y);
	//script.yourScore.text = yourNameProp.currentValue + ": " + scoreProp.currentValue.x;
	//script.otherScore.text = otherNameProp.currentValue + ": " + scoreProp.currentValue.y;
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

		if(countdownAmount > 0)
		{
			if(countdownAmount === 1)
				AllowButtonTap(false);
			delay_GameplayCountDown.reset(1);
		}
		else 
			syncEntity.sendEvent("gameplayCheckResult");
	}
});

///////////////////////////////////////////////////////////

Start();