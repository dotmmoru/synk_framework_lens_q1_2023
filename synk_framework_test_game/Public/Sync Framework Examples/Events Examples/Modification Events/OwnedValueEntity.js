// OwnedValueEntity.js
// Version: 1.0.1
// Event: On Awake
// Description: Example showing a more robust method of allowing all users to modify a value.
// At all times, one user will own the object. (If the current owner leaves, other players will try claiming ownership).
// Whoever owns the object is in control of the score value.
// All players interact with the score by sending "addScore" events to this Entity.
// Only the owner of the store will react to these events and modify the score accordingly.
// This helps prevent race conditions where two users try to modify the score at the same time, overwriting each other's changes.


var syncEntity = new global.SyncEntity(script, null, true);

// Create "score" property
var scoreProp = syncEntity.addStorageProperty(global.StorageProperty.manualInt("score", 0));

// Subscribe to "addScore" event
syncEntity.onEventReceived.add("addScore", function(message) {
    // Only react if we own the entity
    if (syncEntity.doIOwnStore()) {
        var scoreChange = message.data;
        // Set the score value to the current value plus the event data
        scoreProp.setPendingValue(scoreProp.currentOrPendingValue + scoreChange);
    }
});