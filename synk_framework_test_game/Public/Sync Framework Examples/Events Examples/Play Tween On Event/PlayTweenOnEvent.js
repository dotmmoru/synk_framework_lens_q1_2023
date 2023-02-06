// PlayTweenOnEvent.js
// Version: 1.0.1
// Event: On Awake
// Description: Example script showing how to send events with simple data attached, and react to them.


//@input SceneObject tweenObject
/** @type {SceneObject} */
var tweenObject = script.tweenObject || script.getSceneObject();

//@input string[] tweenNames
/** @type {string[]} */
var tweenNames = script.tweenNames;

var syncEntity = new global.SyncEntity(script);

// Subscribe to "tween" event
syncEntity.onEventReceived.add("tween", onTweenEventReceived);

/**
 * @param {NetworkMessage<string>} netMessage
 */
function onTweenEventReceived(netMessage) {
    var tweenName = netMessage.data;
    global.tweenManager.startTween(tweenObject, tweenName);
}

function playRandomTween() {
    var tweenName = randomItem(tweenNames);
    syncEntity.sendEvent("tween", tweenName);
}

script.createEvent("TapEvent").bind(playRandomTween);

/**
 * @template T
 * @param {T[]} list
 * @returns {T}
 */
function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}