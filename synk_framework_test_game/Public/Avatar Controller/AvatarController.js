// AvatarController.js
// Version: 1.0.1
// Event: On Awake
// Description: Spawns and updates an avatar for the local player


//@input Component.ScriptComponent instantiator
/** @type {Instantiator} */
var instantiator = script.instantiator;

//@input Asset.ObjectPrefab myPrefab
/** @type {ObjectPrefab} */
var myPrefab = script.myPrefab;

//@input SceneObject myTarget
/** @type {SceneObject} */
var myTarget = script.myTarget;
var camTransform = myTarget.getTransform();

//@input bool randomizeColor
/** @type {boolean} */
var randomizeColor = script.randomizeColor;

/** @type {SceneObject} */
var mySceneObject;

/** @type {Transform} */
var myTransform;

function onReady() {
    var worldPos = camTransform.getWorldPosition();
    var worldRot = camTransform.getWorldRotation();

    var options = new global.InstantiationOptions();
    options.onSuccess = onSpawned;
    options.persistence = RealtimeStoreCreateOptions.Persistence.Owner;
    options.claimOwnership = true;
    options.worldPosition = worldPos;
    options.worldRotation = worldRot;

    instantiator.instantiate(myPrefab, options);
}

/**
 * 
 * @param {NetworkRootInfo} networkRoot 
 */
function onSpawned(networkRoot) {
    mySceneObject = networkRoot.instantiatedObject;
    myTransform = mySceneObject.getTransform();
    script.createEvent("UpdateEvent").bind(onUpdate);

    if (randomizeColor) {
        var visual = getComponentRecursive(mySceneObject, "Component.MaterialMeshVisual");
        if (visual) {
            var color = new vec4(Math.random(), Math.random(), Math.random(), 1.0);
            visual.mainPass.baseColor = color;
        }
    }
}

function onUpdate() {
    myTransform.setWorldPosition(camTransform.getWorldPosition());
    myTransform.setWorldRotation(camTransform.getWorldRotation());
}


function init() {
    instantiator.notifyOnReady(onReady);
}

script.createEvent("OnStartEvent").bind(init);

script.getAvatar = function() {
    return mySceneObject;
};

/**
* Returns the first Component of `componentType` found in the object or its children.
* @template {keyof ComponentNameMap} T
* @param {SceneObject} object Object to search
* @param {T} componentType Component type name to search for
* @returns {ComponentNameMap[T]} Matching Components in `object` and its children
*/
function getComponentRecursive(object, componentType) {
    var component = object.getComponent(componentType);
    if (component) {
        return component;
    }
    var childCount = object.getChildrenCount();
    for (var i=0; i<childCount; i++) {
        var result = getComponentRecursive(object.getChild(i), componentType);
        if (result) {
            return result;
        }
    }
    return null;
}
