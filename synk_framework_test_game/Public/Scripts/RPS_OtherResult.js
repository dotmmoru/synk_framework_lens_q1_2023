// -----JS CODE-----
//@input Asset.Texture rock
//@input Asset.Texture papper
//@input Asset.Texture scissors
//@input Component.Image image
//@input Component.Image nothing

var assets = [script.rock, script.papper, script.scissors];

script.api.HideOtherResult = function()
{
	script.image.enabled = false;
	script.nothing.enabled = false;
}

script.api.ShowOtherResult = function(value)
{
	script.image.enabled = value!= -1;
	script.nothing.enabled = value == -1;

	if(value!= -1)
		UpdateTexture(assets[value]);
}

function UpdateTexture(value)
{
	script.image.mainPass["baseTex"] = value;
}

script.api.HideOtherResult();