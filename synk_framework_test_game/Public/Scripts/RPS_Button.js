// -----JS CODE-----
//@input Component.ScriptComponent gameController
//@input int id {"widget":"combobox", "values":[{"label":"Rock", "value":0}, {"label":"Paper", "value":1}, {"label":"Scissors", "value":2}]}
//@input Component.Image image
//@input vec4 notSelected {"widget":"color"}
//@input vec4 selected {"widget":"color"}

var isTapEnabled = false;
var isSelected = false;

function Start()
{
	isTapEnabled = true;// ????????????
	isSelected = false;
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
	script.gameController.api.SelectButton(script.id);
}

script.api.UnSelect= function()
{
	isSelected = false;
	UpdateTexture();
}

function UpdateTexture()
{
	script.image.mainPass["baseColor"] = isSelected? script.selected : script.notSelected;
}

Start();