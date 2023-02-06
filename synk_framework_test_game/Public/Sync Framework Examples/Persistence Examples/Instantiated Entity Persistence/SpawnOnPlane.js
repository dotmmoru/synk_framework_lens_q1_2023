// SpawnOnPlane.js
// Version: 1.0.1
// Event: On Awake
// Description: Example script showing how to instantiate and destroy network objects.
// Every time a touch event occurs, a raycast will be performed from the camera. 
// If the raycast hits one of our instantiated objects, it will be destroyed.
// Otherwise, we raycast onto an imaginary plane at this object's height, and instantiate a new object there.


//@input Component.Camera raycastCamera
/** @type {Camera} */
var raycastCamera = script.raycastCamera;

//@input Component.ScriptComponent instantiator
/** @type {ScriptComponent & Instantiator} */
var instantiator = script.instantiator;

//@input Asset.ObjectPrefab prefab
/** @type {ObjectPrefab} */
var prefab = script.prefab;

//@input string persistence = "Session" {"widget":"combobox", "values":[{"label":"Ephemeral", "value":"Ephemeral"},{"label":"Owner", "value":"Owner"},{"label":"Session", "value":"Session"},{"label":"Persist", "value":"Persist"}]}
/** @type {RealtimeStoreCreateOptions.Persistence} */
var persistence = RealtimeStoreCreateOptions.Persistence[script.persistence];

//@input bool ownedBySpawner
/** @type {boolean} */
var ownedBySpawner = script.ownedBySpawner;



/**
 * 
 * @param {vec3} planePos 
 * @param {vec3} planeNormal 
 * @param {vec3} rayPos 
 * @param {vec3} rayDir 
 * @returns {vec3?}
 */
function intersectPlane(planePos, planeNormal, rayPos, rayDir) { 
    // assuming vectors are all normalized
    var denom = -planeNormal.dot(rayDir); 
    if (denom > 1e-6) {
        var offset = planePos.sub(rayPos);
        var dist = -offset.dot(planeNormal) / denom;
        if (dist >= 0) {
            return rayPos.add(rayDir.uniformScale(dist));
        }
    } 
    return null;
}

/**
 * 
 * @param {vec3} pos 
 */
function spawnObject(pos) {
    if (instantiator.isReady()) {
        instantiator.instantiate(prefab, {
            persistence: persistence,
            claimOwnership: ownedBySpawner,
            worldPosition: pos,
        });
    }
}

var probe = Physics.createGlobalProbe();
// Get prefab object name from path
var prefabName = prefab.name.slice(prefab.name.lastIndexOf("/")+1, prefab.name.lastIndexOf("."));

script.createEvent("TouchStartEvent").bind(function(e) {
    var pos = e.getTouchPosition();
    var origin = raycastCamera.getTransform().getWorldPosition();
    var end;
    if (global.deviceInfoSystem.isSpectacles()) {
        end = origin.add(raycastCamera.getTransform().back.uniformScale(10000));
    } else {
        end = raycastCamera.screenSpaceToWorldSpace(pos, 10000);
    }
    var direction = end.sub(origin).normalize();

    probe.rayCast(origin, end, function(hit) {
        if (!isNull(hit)) {
            var other = hit.collider.getSceneObject();
            if (other.name == prefabName) {
                other.destroy();
            }
        } else {
            var hitPos = intersectPlane(script.getTransform().getWorldPosition(), vec3.up(), origin, direction);
            if (!isNull(hitPos)) {
                spawnObject(hitPos);
            }
        }
    });
});

script.createEvent("OnStartEvent");
