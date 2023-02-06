// HandAvatarController.js
// Version: 1.0.1
// Event: On Awake
// Description: Spawns HandAvatar prefabs for the left and right hands


//@input Component.ScriptComponent instantiator
/** @type {Instantiator} */
var instantiator = script.instantiator;

//@input Asset.ObjectPrefab leftHandPrefab
/** @type {ObjectPrefab} */
var leftHandPrefab = script.leftHandPrefab;

//@input Asset.ObjectPrefab rightHandPrefab
/** @type {ObjectPrefab} */
var rightHandPrefab = script.rightHandPrefab;

//@input Component.Camera mainCamera
/** @type {Camera} */
var mainCamera = script.mainCamera;

//@input SceneObject trackingParent
/** @type {SceneObject} */
var trackingParent = script.trackingParent;

function onReady() {
    var options = new global.InstantiationOptions();
    options.persistence = RealtimeStoreCreateOptions.Persistence.Owner;
    options.claimOwnership = true;

    if (rightHandPrefab) {
        instantiator.instantiate(rightHandPrefab, options);
    }
    if (leftHandPrefab) {
        instantiator.instantiate(leftHandPrefab, options);
    }
}


function init() {
    instantiator.notifyOnReady(onReady);
}

script.createEvent("OnStartEvent").bind(init);

trackingParent.setParent(mainCamera.getSceneObject());
