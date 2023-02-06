// RaycastButton.js
// Version: 1.0.1
// Event: On Awake
// Description: Simple implementation of a button that can be interacted in world space.
// On mobile and Studio, it uses raycasts from screen touch position.
// On Spectacles, it raycasts from the center of the camera view on touch.


//@input Component.Camera myCamera
/** @type {Camera} */
var myCamera = script.myCamera;
var camTran = myCamera.getTransform();

//@input Physics.WorldComponent physicsWorld
/** @type {WorldComponent} */
var physicsWorld = script.physicsWorld;

//@input Physics.ColliderComponent myCollider
/** @type {ColliderComponent} */
var myCollider = script.myCollider || script.getSceneObject().getComponent("Physics.ColliderComponent");

//@input Component.ScriptComponent myBehavior
/** @type {ScriptComponent} */
var myBehavior = script.myBehavior;

//@input bool playTween
/** @type {boolean} */
var playTween = script.playTween;

/** @type {Probe} */
var probe = physicsWorld ? physicsWorld.createProbe() : Physics.createRootProbe();
probe.filter.includeIntangible = myCollider.intangible;

/** @type {EventWrapper<ScriptComponent, TouchStartEvent>} */
var onTouchStart = new global.EventWrapper();

script.createEvent("TouchStartEvent").bind(function(eventData) {
    var origin = camTran.getWorldPosition();
    var dist = 10000;
    /** @type {vec3} */
    var end;
    if (global.deviceInfoSystem.isSpectacles()) {
        end = origin.add(camTran.back.uniformScale(dist));
    } else {
        end = myCamera.screenSpaceToWorldSpace(eventData.getTouchPosition(), dist);
    }
    
    probe.rayCast(origin, end, function(hit) {
        if (hit != null) {
            if (hit.collider.isSame(myCollider)) {
                if (playTween) {
                    global.tweenManager.startTween(script.getSceneObject(), "button");
                }
                if (myBehavior) {
                    myBehavior.api.trigger();
                }
                onTouchStart.trigger(script, eventData);
            }
        }
    });
});

/**
 * @typedef RaycastButton
 * @property {EventWrapper<ScriptComponent, TouchStartEvent>} onTouchStart
 */

script.onTouchStart = onTouchStart;