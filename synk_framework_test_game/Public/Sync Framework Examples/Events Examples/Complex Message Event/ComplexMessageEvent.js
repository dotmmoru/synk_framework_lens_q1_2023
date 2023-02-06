// ComplexMessageEvent.js
// Version: 1.0.1
// Event: On Awake
// Description: Example of sending a complex network event message.
// This example uses the system keyboard to allow the user to send world-space text strings to other users.


//@input SceneObject camera
/** @type {SceneObject} */
var camera = script.camera;

//@input SceneObject sceneRoot
/** @type {SceneObject} */
var sceneRoot = script.sceneRoot;

//@input Component.Text inputText
/** @type {Text} */
var inputText = script.inputText;

//@input Asset.ObjectPrefab prefab
/** @type {ObjectPrefab} */
var prefab = script.prefab;

var syncEntity = new global.SyncEntity(script);

inputText.getSceneObject().setParent(camera);


/**
 * @class
 */
function MyDataClass() {
    /** @type {vec3} */
    this.position;

    /** @type {quat} */
    this.rotation;

    /** @type {string} */
    this.text;
}

/** @type {EntityEventWrapper<MyDataClass>} */
var postMessageEvent = syncEntity.getEntityEventWrapper("postMessage");

syncEntity.onSetupFinished.add(function() {
    script.createEvent("TapEvent").bind(postNewMessage);
    inputText.text = "Tap to write message";
});

inputText.text = "";
inputText.getSceneObject().getComponents("Component.ScriptComponent").forEach(function(c) {
    c.enabled = false;
});

postMessageEvent.onEventReceived.add(function(message) {
    var data = message.data;
    var instance = prefab.instantiate(sceneRoot);
    instance.getTransform().setLocalPosition(data.position);
    instance.getTransform().setLocalRotation(data.rotation);
    instance.getComponent("Component.Text").text = data.text;
});

function postNewMessage() {
    if (syncEntity.isSetupFinished) {
        var options = new TextInputSystem.KeyboardOptions();
        inputText.text = "Start typing...";
        options.onTextChanged = function(newText, range) {
            inputText.text = newText;
        };

        options.onReturnKeyPressed = function() {
            var data = new MyDataClass();
            
            var worldPos = inputText.getTransform().getWorldPosition();
            var worldToRoot = sceneRoot.getTransform().getInvertedWorldTransform();
            var pos = worldToRoot.multiplyPoint(worldPos);
            var forward = worldToRoot.multiplyDirection(camera.getTransform().forward);
            var up = worldToRoot.multiplyDirection(camera.getTransform().up);
            var rot = quat.lookAt(forward, up);

            data.position = pos;
            data.rotation = rot;
            data.text = inputText.text;

            postMessageEvent.send(data);

            inputText.text = "";
        };
        global.textInputSystem.requestKeyboard(options);
    }
}
