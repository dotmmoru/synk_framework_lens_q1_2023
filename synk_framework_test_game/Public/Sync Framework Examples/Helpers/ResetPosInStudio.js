// ResetPosInStudio.js
// Version: 1.0.1
// Event: On Awake
// Description: Used only for debugging in the Interactive Preview in Lens Studio.
// It moves the position down so the interactive preview space matches how it will appear on device in World Tracking mode.


//@input SceneObject camera
/** @type {SceneObject} */
var camera = script.camera;

//@input Component.DeviceTracking deviceTracking
/** @type {DeviceTracking} */
var deviceTracking = script.deviceTracking;


if (global.deviceInfoSystem.isEditor()) {
    script.createEvent("OnStartEvent").bind(resetPos);
}

function resetPos() {
    if (!deviceTracking || deviceTracking.getRequestedDeviceTrackingMode() == DeviceTrackingMode.World) {
        var pos = script.getTransform().getWorldPosition();
        pos.y = camera.getTransform().getWorldPosition().y;
        script.getTransform().setWorldPosition(pos);
    }
}