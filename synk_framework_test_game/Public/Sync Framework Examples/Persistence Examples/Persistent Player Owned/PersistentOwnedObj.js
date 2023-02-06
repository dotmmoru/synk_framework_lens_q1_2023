// PersistentOwnedObj.js
// Version: 1.0.1
// Event: On Awake
// Description: Example script showing how to set up a persistent object controlled by a specific userID.
// This object is intended to be instantiated using PlayerOwnedObjSpawner.js
// If the local user owns the object, tapping anywhere will increase the score, which controls the scale of the object.


//@input float scaleMult = 0.05
/** @type {number} */
var scaleMult = script.scaleMult;

var syncEntity = new global.SyncEntity(script);

var transform = script.getTransform();
var startScale = transform.getLocalScale();

// Set up synced properties
var score = syncEntity.addStorageProperty(global.StorageProperty.manualInt("score", 0));
var displayName = syncEntity.addStorageProperty(global.StorageProperty.manualString("displayName", ""));
var ownerId = syncEntity.addStorageProperty(global.StorageProperty.manualString("ownerId", ""));

// Subscribe to updates
score.onAnyChange.add(updateVisuals);
displayName.onAnyChange.add(updateVisuals);

syncEntity.notifyOnReady(function() {
    var doIControl = false;

    // Did we just create this store?
    if (syncEntity.doIOwnStore()) {
        displayName.setPendingValue(global.sessionController.getLocalUserName());
        ownerId.setPendingValue(global.sessionController.getLocalUserId());
        doIControl = true;
    } else {
        // Did we previously create this store?
        if (ownerId.currentValue == global.sessionController.getLocalUserId()) {
            doIControl = true;
            syncEntity.tryClaimOwnership();
        }
    }

    // If we control the store, allow interaction
    if (doIControl) {
        script.createEvent("TapEvent").bind(function() {
            score.setPendingValue(score.currentValue + 1);
        });
    }

    updateVisuals();
});

function updateVisuals() {
    // Change scale based on score
    transform.setLocalScale(startScale.uniformScale(1.0 + score.currentValue * scaleMult));
}