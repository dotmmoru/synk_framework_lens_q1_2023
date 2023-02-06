// AirHockeyBall.js
// Version: 1.0.1
// Event: On Awake
// Description: Ball controller used in the Air Hockey example.


//@input Physics.BodyComponent ballBody
/** @type {BodyComponent} */
var ballBody = script.ballBody || script.getSceneObject().getComponent("Physics.BodyComponent");

var transform = script.getTransform();

var syncEntity = new global.SyncEntity(script, null, false);

// Last known position
var posProp = syncEntity.addStorageProperty(global.StorageProperty.manualVec3("pos", transform.getLocalPosition()));
// Last known velocity
var velocityProp = syncEntity.addStorageProperty(global.StorageProperty.manualVec3("velocity", vec3.zero()));
// Timestamp of last change
var timeStampProp = syncEntity.addStorageProperty(global.StorageProperty.manualDouble("lastChanged", -1));

var isResetting = false;

ballBody.overlapFilter.includeStatic = true;

/**
 * 
 * @param {CollisionEnterEventArgs} collisionArgs 
 */
function onCollisionEnter(collisionArgs) {
    var collision = collisionArgs.collision;
    var otherObj = collision.collider.getSceneObject();
    if (otherObj.name.startsWith("wall")) {
        var normal = collision.contacts[0].normal;

        var worldToLocal = transform.getInvertedWorldTransform();

        var relativePos = worldToLocal.multiplyDirection(normal);

        var curVelocity = velocityProp.currentOrPendingValue.uniformScale(1);

        if (Math.abs(relativePos.x) > .005) {
            curVelocity.x *= -1;
        }
        if (Math.abs(relativePos.z) > .005) {
            curVelocity.z *= -1;
        }
                
        updateMovementState(transform.getLocalPosition(), curVelocity);

    } else if (otherObj.name.startsWith("drag_Paddle")) {
        var paddleVelocity = velocityProp.currentOrPendingValue.uniformScale(1);
        paddleVelocity.z *= -1;
        var otherVel = collision.collider.velocity;
        var paddleWorldToLocal = transform.getInvertedWorldTransform();
        var otherVelLocal = paddleWorldToLocal.multiplyDirection(otherVel).normalize().uniformScale(otherVel.length);
        var maxAddedVel = 20;
        paddleVelocity.x += Math.max(-maxAddedVel, Math.min(otherVelLocal.x, maxAddedVel));

        paddleVelocity = paddleVelocity.uniformScale(1.1);
        updateMovementState(transform.getLocalPosition(), paddleVelocity);
        
    }
}

/**
 * 
 * @param {vec3} position 
 * @param {vec3} velocity 
 */
function updateMovementState(position, velocity) {
    posProp.setPendingValue(position);
    velocityProp.setPendingValue(velocity);
    timeStampProp.setPendingValue(getServerTime());
}

syncEntity.onSetupFinished.add(function() {
    if (syncEntity.doIOwnStore()) {
        initAsOwner();
    }
    // Set up collisions
    ballBody.onCollisionEnter.add(onCollisionEnter);
});

function initAsOwner() {
    
}

function getServerTime() {
    return global.sessionController.getSession().getServerTimestamp() * .001;
}

/**
 * 
 * @param {vec3} pos 
 * @param {vec3} velocity 
 * @param {number} initialTime 
 * @param {number} currentTime 
 * @returns 
 */
function extrapolatePos(pos, velocity, initialTime, currentTime) {
    var elapsedTime = currentTime - initialTime;
    return pos.add(velocity.uniformScale(elapsedTime));
}

function updateBallPosition() {
    var startTime = timeStampProp.currentOrPendingValue;
    var newPos = extrapolatePos(posProp.currentOrPendingValue, velocityProp.currentOrPendingValue, startTime, getServerTime());
    newPos.y = 0;
    transform.setLocalPosition(newPos);
    transform.setLocalRotation(quat.quatIdentity());
}

function onUpdate() {
    if (syncEntity.isSetupFinished) {
        updateBallPosition();
    }
}

function resetBall() {
    if (!isResetting) {
        isResetting = true;
        transform.setLocalPosition(vec3.zero());
        updateMovementState(vec3.zero(), vec3.zero());

        var event = script.createEvent("DelayedCallbackEvent");
        event.bind(function() {
            script.removeEvent(event);
            isResetting = false;
            startMovement();
        });
        event.reset(1.0);
    }
}

function startMovement() {
    var initVelocity = new vec3(randomRange(-20, 20), 0, randomChoice(-1, 1) * 40);
    updateMovementState(transform.getLocalPosition(), initVelocity);
}

script.createEvent("UpdateEvent").bind(onUpdate);

/**
* Returns a random value between `min` and `max`
* @param {number} min 
* @param {number} max 
* @returns {number} Random value between `min` and `max`
*/
function randomRange(min, max) {
    return min + Math.random() * (max-min);
}

/**
 * @template T
 * @param {...T} args 
 * @returns {T}
 */
function randomChoice(args) {
    return arguments[Math.floor(Math.random() * arguments.length)];
}

/**
 * @typedef AirHockeyBall
 * @property {SyncEntity} syncEntity
 * @property {()=>void} resetBall
 * @property {()=>void} startMovement
 * @property {BodyComponent} bodyComponent
 */

script.syncEntity = syncEntity;
script.resetBall = resetBall;
script.startMovement = startMovement;
script.bodyComponent = ballBody;