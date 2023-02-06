// PlayerOwnedObjSpawner.js
// Version: 1.0.1
// Event: On Awake
// Description: Example showing how to spawn a single, persistent object per player.
// This is accomplished using the the `overrideNetworkId` property in `InstantiationOptions`.
// We first generate a network id based on our local user id - this will never change between sessions.
// When we ask the Instantiator to spawn this object, it will first check if an object with that id already exists.
// If an existing object is found, it uses the existing object. Otherwise, it spawns a new one like normal.
// This can be used with any prefab, but it's intended to be used with PersistentOwnedObject.js


//@input Component.ScriptComponent instantiator
/** @type {Instantiator} */
var instantiator = script.instantiator;

//@input Asset.ObjectPrefab[] prefabs
/** @type {ObjectPrefab[]} */
var prefabs = script.prefabs;

/** @type {NetworkRootInfo} */
var myNetworkRoot;

global.sessionController.notifyOnReady(onReady);

function onReady() {
    var event = script.createEvent("DelayedCallbackEvent");
    event.bind(function(eventData) {
        var localPos = new vec3(
            randomRange(-50, 50),
            randomRange(-50, 50),
            randomRange(-50, -100)
        );

        var options = new global.InstantiationOptions();
        options.persistence = "Persist";
        options.claimOwnership = true;
        options.localPosition = localPos;
        options.overrideNetworkId = global.sessionController.getLocalUserId() + "_scoreHolder";
        
        var prefab = getRandomPrefab();
        if (prefab) {
            instantiator.instantiate(prefab, options, onSpawned);
        } else {
            print("Could not instantiate prefab!");
        }
    });
    event.reset(0.5);
}

/**
 * 
 * @param {NetworkRootInfo} networkRoot 
 */
function onSpawned(networkRoot) {
    myNetworkRoot = networkRoot; // eslint-disable-line no-unused-vars
}

/**
 * @returns {ObjectPrefab?}
 */
function getRandomPrefab() {
    if (prefabs.length > 0) {
        return prefabs[Math.floor(randomRange(0, prefabs.length))];
    }
    print("Prefabs list is empty!");
    return null;
}

/**
* Returns a random value between `min` and `max`
* @param {number} min 
* @param {number} max 
* @returns {number} Random value between `min` and `max`
*/
function randomRange(min, max) {
    return min + Math.random() * (max-min);
}
