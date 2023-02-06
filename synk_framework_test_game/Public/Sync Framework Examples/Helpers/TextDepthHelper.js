// TextDepthHelper.js
// Version: 1.0.0
// Event: On Awake
// Description: Helps assign settings to make Text components use world space depth rendering.


// @input Component.Text text

// @input bool depthWrite = true
// @input bool twoSided = true

// @input bool setRenderOrder
// @input int renderOrder = 9999 {"showIf":"setRenderOrder"}

var text = script.text || script.getSceneObject().getComponent("Component.Text");

if (text) {
    text.mainPass.depthWrite = script.depthWrite;
    text.mainPass.twoSided = script.twoSided;
    if (script.setRenderOrder) {
        text.setRenderOrder(script.renderOrder);
    }
}