// -----JS CODE-----
//@input Asset.Texture rock
//@input Asset.Texture papper
//@input Asset.Texture scissors
//@input Component.Image image

var assets = [script.rock, script.papper, script.scissors];

script.api.HideOtherResult = function()
{
	script.image.enabled = false;
}

script.api.ShowOtherResult = function(value)
{
	script.image.enabled = true;
	UpdateTexture(assets[value]);
}

function UpdateTexture(value)
{
	script.image.mainPass["baseTex"] = value;
}

script.api.HideOtherResult();