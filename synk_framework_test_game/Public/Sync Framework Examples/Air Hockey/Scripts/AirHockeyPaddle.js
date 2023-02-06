// AirHockeyPaddle.js
// Version: 1.0.1
// Event: On Awake
// Description: Controls a paddle in the Air Hockey example.


var syncEntity = new global.SyncEntity(script);

var transform = script.getTransform();
var body = script.getSceneObject().getComponent("Physics.BodyComponent");

function setPos(x) {
    var pos = transform.getLocalPosition();
    pos.x = x;
    transform.setLocalPosition(pos);
}

function getPos() {
    return transform.getLocalPosition().x;
}

function getXVelocity() {
    var velocity = body.velocity;
    if (velocity.lengthSquared > .0001) {
        var worldToLocal = transform.getInvertedWorldTransform();
        var velLocal = worldToLocal.multiplyDirection(velocity).normalize().uniformScale(velocity.length);
        return velLocal.x;   
    } else {
        return 0;
    }
}

syncEntity.addStorageProperty(global.StorageProperty.autoFloat("posX", getPos, setPos));

/**
 * @typedef AirHockeyPaddle
 * @property {SyncEntity} syncEntity
 * @property {()=>number} getXVelocity
 */

script.syncEntity = syncEntity;
script.getXVelocity = getXVelocity;