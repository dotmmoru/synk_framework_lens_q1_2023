// -----JS CODE-----
//@input Component.ScriptComponent gameController
//@input Component.Image image
//@input vec4 notSelected {"widget":"color"}
//@input vec4 selected {"widget":"color"}
//@input SceneObject waitForOtherHint

var isTapEnabled = true;
var isSelected = false;

function Start()
{
	script.waitForOtherHint.enabled = false;
	UpdateTexture();
}

var TapEvent = script.createEvent("TapEvent");
TapEvent.bind(onTapped);
function onTapped(eventData)
{
	if(isTapEnabled && !isSelected)
		DoEvent();
}

function DoEvent()
{
	isSelected = true;
	UpdateTexture();
	script.gameController.api.OnClick_ReadyButton();
	script.waitForOtherHint.enabled = true;
}

script.api.UnSelect= function()
{
	isSelected = false;
	Start();
}

function UpdateTexture()
{
	script.image.mainPass["baseColor"] = isSelected? script.selected : script.notSelected;
}

Start();