// ToolbeltController.js
// Version: 1.0.0
// Event: On Awake
// Description: Simple toolbelt used for testing SyncFramework capabilities.
// Look down to see the toolbelt buttons!


//@input SceneObject camera
/** @type {SceneObject} */
var camera = script.camera;
var camTransform = camera.getTransform();

//@input float dotThreshold = .9
/** @type {number} */
var dotThreshold = script.dotThreshold;

//@input Component.ScriptComponent instantiator
/** @type {Instantiator} */
var instantiator = script.instantiator;

//@input SceneObject sceneRoot
/** @type {SceneObject} */
var sceneRoot = script.sceneRoot;

var myTransform = script.getTransform();

script.createEvent("UpdateEvent").bind(onUpdate);

/**
 * 
 * @param {vec3} vec 
 * @returns {vec3}
 */
function flattenForwardVec(vec) {
    return new vec3(vec.x, 0, vec.z).normalize();
}

function onUpdate() {
    var wantedPos = camTransform.getWorldPosition();
    myTransform.setWorldPosition(wantedPos);

    var camForward = camTransform.back;
    if (camForward.dot(vec3.down()) < dotThreshold) {

        var flattened = flattenForwardVec(camForward);
        var rot = quat.lookAt(flattened, vec3.up());
        myTransform.setWorldRotation(rot);
    }
}


function spawnObjInFront(prefab) {
    print("spawn in front");
    var forward = flattenForwardVec(myTransform.forward);
    var pos = myTransform.getWorldPosition().add(forward.uniformScale(75));
    instantiator.instantiate(prefab, {
        worldPosition: pos,
        worldRotation: quat.lookAt(forward, vec3.up()),
        persistence: "Owner",
        claimOwnership: true,
    });
}

function resetSceneRoot() {
    print("reset scene root");
    sceneRoot.getTransform().setWorldPosition(myTransform.getWorldPosition());

    var forward = flattenForwardVec(myTransform.back);
    var rot = quat.lookAt(forward, vec3.up());
    sceneRoot.getTransform().setWorldRotation(rot);
}

script.api.spawnObjInFront = spawnObjInFront;
script.spawnObjInFront = spawnObjInFront;

script.api.resetSceneRoot = resetSceneRoot;
script.resetSceneRoot = resetSceneRoot;