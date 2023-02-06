// SendEventToObject.js
// Version: 1.0.1
// Event: On Awake
// Description: Example script showing how to send an event to a specific entity whenever a button press occurs.


//@input Component.ScriptComponent syncEntityScript
/** @type {ScriptComponent} */
var syncEntityScript = script.syncEntityScript;

//@input Component.ScriptComponent button
/** @type {ScriptComponent & RaycastButton} */
var button = script.button;

//@input string eventName
/** @type {string} */
var eventName = script.eventName;

//@input float eventData
/** @type {number} */
var eventData = script.eventData;

function onPress() {
    var syncEntity = global.SyncEntity.getSyncEntityOnComponent(syncEntityScript);
    if (syncEntity.isSetupFinished) {
        syncEntity.sendEvent(eventName, eventData);
    }
}

script.createEvent("OnStartEvent").bind(function() {
    button.onTouchStart.add(onPress);
});