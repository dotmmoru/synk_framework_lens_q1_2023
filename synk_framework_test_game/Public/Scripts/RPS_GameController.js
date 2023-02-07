// -----JS CODE-----
//@input SceneObject readyUI
//@input SceneObject gameplayUI
//@input Component.ScriptComponent[] buttons

var selectedBtn = -1;

function Start()
{
	//script.readyUI.enabled = true;
	script.gameplayUI.enabled = false;
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




Start();