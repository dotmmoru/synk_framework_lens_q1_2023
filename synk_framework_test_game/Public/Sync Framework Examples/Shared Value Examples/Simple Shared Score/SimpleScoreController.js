// SimpleScoreController.js
// Version: 1.0.1
// Event: On Awake
// Description: Simple example of syncing a score value using a StorageProperty.
// For a more complex example, see OwnedValueEntity.js


//@input Component.ScriptComponent plusButton
/** @type {RaycastButton} */
var plusButton = script.plusButton;

//@input Component.ScriptComponent minusButton
/** @type {RaycastButton} */
var minusButton = script.minusButton;

var syncEntity = new global.SyncEntity(script);

var scoreProp = global.StorageProperty.manual("score", global.StorageTypes.int, 0);
syncEntity.addStorageProperty(scoreProp);

function setScore(value) {
    scoreProp.setPendingValue(value);
}

function addScore(amount) {
    setScore(scoreProp.currentValue + amount);
}

syncEntity.notifyOnReady(onReady);

function onReady() {
    plusButton.onTouchStart.add(function() {
        addScore(1);
    });

    minusButton.onTouchStart.add(function() {
        addScore(-1);
    });
}