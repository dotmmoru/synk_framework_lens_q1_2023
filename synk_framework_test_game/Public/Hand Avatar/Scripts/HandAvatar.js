// HandAvatar.js
// Version: 1.0.1
// Event: On Awake
// Description: Sends and receives hand joint data.


//@input Component.ObjectTracking3D handTracking
/** @type {ObjectTracking3D} */
var handTracking = script.handTracking;

//@input float interpolationTarget = -0.25
/** @type {number} */
var interpolationTarget = script.interpolationTarget;

//@input SceneObject visual
/** @type {SceneObject} */
var visual = script.visual;

const JOINT_NAMES = ["wrist","thumb-0","thumb-1","thumb-2","thumb-3","index-0","index-1","index-2","index-3","mid-0","mid-1","mid-2","mid-3","ring-0","ring-1","ring-2","ring-3","pinky-0","pinky-1","pinky-2","pinky-3","wrist_to_thumb","wrist_to_index","wrist_to_mid","wrist_to_ring","wrist_to_pinky"];

var sendLimit = 10;

var syncEntity = new global.SyncEntity(script);

var handTrackingTransform = handTracking.getTransform();
var localTransform = script.getTransform();

/**
 * @class
 * @param {string} jointName
 * @param {Transform} source
 * @param {Transform} destination
 */
function JointInfo(jointName, source, destination) {
    /** @type {string} */
    this.jointName = jointName;
    /** @type {Transform} */
    this.source = source;
    /** @type {Transform} */
    this.destination = destination;
}

/** @type {JointInfo[]} */
var jointInfos = [];

/** @type {quat[]} */
var rotDataArray;

/** @type {float[]} */
var scaleDataArray;

function initJoints() {
    for (var i=0; i<JOINT_NAMES.length; i++) {
        var trackedObjects = handTracking.getAttachedObjects(JOINT_NAMES[i]);
        for (var j=0; j<trackedObjects.length; j++) {
            var sourceTr = trackedObjects[j].getTransform();
            var destObj = findChildObjectWithName(script.getSceneObject(), trackedObjects[j].name);
            var destTr = destObj ? destObj.getTransform() : null;
            var jointInfo = new JointInfo(JOINT_NAMES[i], sourceTr, destTr);
            jointInfos.push(jointInfo);
        }
    }
    rotDataArray = new Array(jointInfos.length);
    scaleDataArray = new Array(jointInfos.length);
    updateRotsFromSource();
}

function updateRotsFromSource() {
    for (var i=0; i<jointInfos.length; i++) {
        rotDataArray[i] = jointInfos[i].source.getLocalRotation();
        scaleDataArray[i] = jointInfos[i].source.getLocalScale().x;
    }
}

/**
 * 
 * @param {quat[]} rots 
 */
function setRotsOnDest(rots) {
    for (var i=0; i<jointInfos.length; i++) {
        jointInfos[i].destination.setLocalRotation(rots[i]);
    }
}

function setScalesOnDest(scales) {
    var scaleVal;
    for (var i=0; i<jointInfos.length; i++) {
        scaleVal = scales[i];
        jointInfos[i].destination.setLocalScale(new vec3(scaleVal, scaleVal, scaleVal));
    }
}

initJoints();

// Initialize property to track all joints
var rotationsProp = syncEntity.addStorageProperty(
    global.StorageProperty.manual("jointRotations", global.StorageTypes.quatArray, rotDataArray, {
        "interpolationTarget": interpolationTarget,
    }));
rotationsProp.setterFunc = setRotsOnDest;
rotationsProp.sendsPerSecondLimit = sendLimit;
// HACK
rotationsProp.equalsCheck = function() {
    return true;
};

var scalesProp = syncEntity.addStorageProperty(
    global.StorageProperty.manual("jointScales", global.StorageTypes.floatArray, scaleDataArray, {
        "interpolationTarget": interpolationTarget,
    }));
scalesProp.setterFunc = setScalesOnDest;
scalesProp.sendsPerSecondLimit = sendLimit;
// Force the equals check to always return true, since we don't need to waste time comparing arrays
scalesProp.equalsCheck = function() {
    return true;
};

var rootPosProp = syncEntity.addStorageProperty(global.StorageProperty.forPosition(localTransform, true, {"interpolationTarget": interpolationTarget}));
rootPosProp.sendsPerSecondLimit = sendLimit;

var rootRotProp = syncEntity.addStorageProperty(global.StorageProperty.forRotation(localTransform, true, {"interpolationTarget": interpolationTarget}));
rootRotProp.sendsPerSecondLimit = sendLimit;

var enabledProp = syncEntity.addStorageProperty(global.StorageProperty.manualBool("isTracking", false));
var enabledTimeoutEvent = script.createEvent("DelayedCallbackEvent");
enabledTimeoutEvent.bind(enabledTimeout);

function onUpdate() {
    if (syncEntity.doIOwnStore()) {
        localTransform.setWorldPosition(handTrackingTransform.getWorldPosition());
        localTransform.setWorldRotation(handTrackingTransform.getWorldRotation());
        
        if (handTracking.isTracking()) {
            enabledProp.setPendingValue(true);
            var time = getTime();
            if (rotationsProp.checkWithinSendLimit(time)) {
                updateRotsFromSource();
                rotationsProp.setPendingValue(rotDataArray);
                rotationsProp.markedDirty = true;
            }
        } else {
            enabledProp.setPendingValue(false);
        }
    }
}

visual.enabled = false;
syncEntity.notifyOnReady(function() {
    if (!syncEntity.doIOwnStore()) {
        visual.enabled = enabledProp.currentValue || false;
    }
    script.createEvent("UpdateEvent").bind(onUpdate);
});


function enabledTimeout() {
    visual.enabled = false;
}

function onEnabledUpdatedRemote(newValue) {
    enabledTimeoutEvent.enabled = !newValue;
    if (newValue) {
        visual.enabled = true;
    } else {
        enabledTimeoutEvent.reset(.5);
    }
}
enabledProp.onRemoteChange.add(onEnabledUpdatedRemote);


/**
 * Searches through the children of `sceneObject` and returns the first child found with a matching name.
 * NOTE: This function recursively checks the entire child hierarchy and should not be used every frame.
 * It's recommended to only run this function once and store the result.
 * @param {SceneObject} sceneObject Parent object to search the children of
 * @param {string} childName Object name to search for
 * @returns {SceneObject?} Found object (if any)
 */
function findChildObjectWithName(sceneObject, childName) {
    var childCount = sceneObject.getChildrenCount();
    var child;
    var res;
    for (var i=0; i<childCount; i++) {
        child = sceneObject.getChild(i);
        if (child.name == childName) {
            return child;
        }
        res = findChildObjectWithName(child, childName);
        if (res) {
            return res;
        }
    }
    return null;
}