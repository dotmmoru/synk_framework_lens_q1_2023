// HandGestureController.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Sends given set of triggers on hand gesture detection

//@input Component.ScriptComponent gestureUIListener
//@input Component.ObjectTracking tracker
//@input bool debug

var labels = ["open", "close", "victory"];

function generateTriggerResponse(evt) {
    return function() {
        if (script.debug) {
            print("Gesture detected: " + evt);
        }
    script.gestureUIListener.api.GestureDetected(evt);
    };
}

function init() {
    for (var i = 0; i < labels.length; i++) {
        script.tracker.registerDescriptorStart(labels[i], generateTriggerResponse(labels[i]));
        if (script.debug) {
            print("Event created for: " + labels[i]);
        }
    }
}

init();