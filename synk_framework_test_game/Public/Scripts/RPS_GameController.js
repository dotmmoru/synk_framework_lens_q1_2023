// -----JS CODE-----
//@input SceneObject readyUI
//@input SceneObject gameplayUI
//@input Component.Text yourScore
//@input Component.Text otherScore
//@input Component.Text timer
//@input Component.ScriptComponent[] buttons

var selectedBtn = -1;

// NEED TO GET USER NAMES 
var yourName = "You";
var otherName = "Other";

function Start()
{
	//script.readyUI.enabled = true;
	script.gameplayUI.enabled = false;
	SetTimerText("");
	GetUserNames();
	SetNamesAndScore(0,0);
}

script.api.OnClick_ReadyButton = function()
{
	print("RADY Clicked");
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
	yourName = "You";
	otherName = "Other";
}

function SetNamesAndScore(scoreYou, scoreOther)
{
	script.yourScore.text = yourName + ": " + scoreYou;
	script.otherScore.text = otherName + ": " + otherScore;
}

function SetTimerText(value)
{
	script.timer.text = value;
}

Start();