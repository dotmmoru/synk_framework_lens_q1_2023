// -----JS CODE-----
//@input SceneObject readyUI
//@input SceneObject gameplayUI
//@input SceneObject gameoverUI
//@ui {"widget":"separator"}
//@input Component.Text connectedUsers
//@ui {"widget":"separator"}
//@input Component.Text timer
//@input SceneObject timerTween
//@ui {"widget":"separator"}
//@input Component.Text whoWinsText
//@input Component.Text yourFinalScoreText
//@input Component.Text otherFinalScoreText
//@ui {"widget":"separator"}
//@input Component.ScriptComponent otherResult
//@ui {"widget":"separator"}
//@input Component.ScriptComponent gestureUIListener
//@ui {"widget":"separator"}
//@input Component.ScriptComponent[] buttons

///////////////////////////////////////////////////////
var gameOverAmount = 3;
var countdownAmount = 6;
var resetDone = false;
var _tempScore = new vec2(0,0);
///////////////////////////////////////////////////////
var syncEntity = new global.SyncEntity(script);

var scoreYourProp = global.StorageProperty.manualInt("your_score" ,0);
syncEntity.addStorageProperty(scoreYourProp);

var scoreOtherProp = global.StorageProperty.manualInt("other_score" ,0);
syncEntity.addStorageProperty(scoreOtherProp);

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
syncEntity.onEventReceived.add("startGameover",function() 
{
	StartGameover();
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
	{
		var isGameOver = HandleResult();
		print("IS GAME OVER " + isGameOver);
		if(isGameOver === true)
			delay_GameOver.reset(2);
		else
			delay_CheckUsersAmount.reset(2);
	}
	
});
///////////////////////////////////////////////////////
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
			your = otherChoiceProp.currentValue < yourChoiceProp.currentValue ? 1:0;
			other = otherChoiceProp.currentValue > yourChoiceProp.currentValue ? 1:0;
			_tempScore = addScore(your,other);
		}
	}

	return CheckGameOver(_tempScore.x, _tempScore.y);
}

function IfVal(a, b, choiceY , choiceO, score) 
{
	var result = (choiceY === a && choiceO === b)? true : false;
	if(result == true)
	{
		_tempScore = addScore(score.x, score.y);
	}
}

function addScore(yourScore, otherScore) 
{
	var scoreVec2 = new vec2(scoreYourProp.currentValue + yourScore, scoreOtherProp.currentValue + otherScore);
    scoreYourProp.setPendingValue(scoreVec2.x);
    scoreOtherProp.setPendingValue(scoreVec2.y);
    return scoreVec2;
}

function CheckGameOver(yourScore, otherScore)
{
	return (yourScore >= gameOverAmount || otherScore >= gameOverAmount);
}

function CheckWhoWinner(yourScore, otherScore )
{
	return yourScore > otherScore? yourNameProp.currentValue : otherNameProp.currentValue;
}

function IsMainUser()
{
	return global.getUserName() === yourNameProp.currentValue;
}
///////////////////////////////////////////////////////

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
	resetDone = false;
	ResetChoise();
	AllowButtonTap(true);
	UnSelectAllButtons(-1);
	script.otherResult.api.HideOtherResult();
	countdownAmount = 6;
	delay_GameplayCountDown.reset(0);
}

function StartGameover()
{
	InitGameOverUI();
	SetEnabledGameUI(false,false,true);
	ResetChoise();
	AllowButtonTap(false);
	UnSelectAllButtons(-1);
	script.otherResult.api.HideOtherResult();
}

function InitGameOverUI()
{
	var winnerName = CheckWhoWinner(scoreYourProp.currentValue,scoreOtherProp.currentValue);
	script.whoWinsText.text = winnerName + " WINS!";
	script.yourFinalScoreText.text = yourNameProp.currentValue+": " + scoreYourProp.currentValue;
 	script.otherFinalScoreText.text = otherNameProp.currentValue + ": " + scoreOtherProp.currentValue;
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
	//for (var i = script.buttons.length - 1; i >= 0; i--) 
	//	script.buttons[i].api.IsTapEnabled(allow);

	script.gestureUIListener.api.IsGestureEnabled(allow);
}

function UnSelectAllButtons(selected)
{
	script.gestureUIListener.api.UnSelectAll();
	/*for (var i = script.buttons.length - 1; i >= 0; i--) 
	{
		if(selected != i)
			script.buttons[i].api.UnSelect();
	}*/
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

function ResetConnection() 
{
	if(resetDone === true)
		return;

	resetDone = true;
	yourNameProp.setPendingValue("");
	otherNameProp.setPendingValue("");

    scoreYourProp.setPendingValue(0);
    scoreOtherProp.setPendingValue(0);

    ResetChoise();
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
	var usersAmount = global.sessionController.getUsers().length
	if(usersAmount === 2)
	{
		if(IsMainUser())
			syncEntity.sendEvent("startGameplay");
	}
	//else if(usersAmount < 2)
	{
		//ResetConnection();
		//OnConnectNewUser();
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
			delay_GameplayCountDown.reset(1);
		}
		else 
		{
			AllowButtonTap(false);
			syncEntity.sendEvent("gameplayCheckResult");
		}
	}
});

var delay_GameOver = script.createEvent("DelayedCallbackEvent");
delay_GameOver.bind(function(eventData)
{
	if(IsMainUser())
		syncEntity.sendEvent("startGameover");
});

///////////////////////////////////////////////////////////

Start();