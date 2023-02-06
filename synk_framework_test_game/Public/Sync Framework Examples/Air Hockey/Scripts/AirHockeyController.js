// AirHockeyController.js
// Version: 1.0.1
// Event: On Awake
// Description: Controls the game flow in the Air Hockey example.

//@input Component.ScriptComponent ball
/** @type {ScriptComponent & AirHockeyBall} */
var ball = script.ball;

//@input SceneObject sceneRoot
/** @type {SceneObject} */
var sceneRoot = script.sceneRoot;

//@input Component.Camera camera
/** @type {Camera} */
var camera = script.camera;

//@input Physics.ColliderComponent leftGoalCollider
/** @type {ColliderComponent} */
var leftGoalCollider = script.leftGoalCollider;

//@input Physics.ColliderComponent rightGoalCollider
/** @type {ColliderComponent} */
var rightGoalCollider = script.rightGoalCollider;

//@input Component.ScriptComponent leftPaddle
/** @type {AirHockeyPaddle} */
var leftPaddle = script.leftPaddle;

//@input Component.ScriptComponent rightPaddle
/** @type {AirHockeyPaddle} */
var rightPaddle = script.rightPaddle;

//@input SceneObject leftOriginPos
/** @type {SceneObject} */
var leftOriginPos = script.leftOriginPos;

//@input SceneObject rightOriginPos
/** @type {SceneObject} */
var rightOriginPos = script.rightOriginPos;

//@input Component.ScriptComponent leftJoinButton
/** @type {ScriptComponent & RaycastButton} */
var leftJoinButton = script.leftJoinButton;

//@input Component.ScriptComponent rightJoinButton
/** @type {ScriptComponent & RaycastButton} */
var rightJoinButton = script.rightJoinButton;

//@input Component.ScriptComponent startGameButton
/** @type {ScriptComponent & RaycastButton} */
var startGameButton = script.startGameButton;

var isLeftPlayer = false;
var isRightPlayer = false;

var syncEntity = new global.SyncEntity(script, null, true);

var leftScoreProp = syncEntity.addStorageProperty(global.StorageProperty.manualInt("leftScore", 0));
var rightScoreProp = syncEntity.addStorageProperty(global.StorageProperty.manualInt("rightScore", 0));
var isGameStartedProp = syncEntity.addStorageProperty(global.StorageProperty.manualBool("isGameStarted", false));

var hasInitAsOwner = false;

function isHost() {
    return syncEntity.isSetupFinished && syncEntity.doIOwnStore();
}

function startGame() {
    if (!isGameStartedProp.currentOrPendingValue) {
        isGameStartedProp.setValueImmediate(syncEntity.currentStore, true);
        refreshUI();
        print("start game");
        ball.startMovement();
    }
}

function refreshUI() {
    var isConnected = syncEntity.isSetupFinished;
    startGameButton.getSceneObject().enabled = isConnected && isHost() && !isGameStartedProp.currentOrPendingValue && ball.syncEntity.doIOwnStore();
    var hasJoinedAsPlayer = (isRightPlayer || isLeftPlayer);
    leftJoinButton.getSceneObject().enabled = isConnected && !hasJoinedAsPlayer && !leftPaddle.syncEntity.isStoreOwned();
    rightJoinButton.getSceneObject().enabled = isConnected && !hasJoinedAsPlayer && !rightPaddle.syncEntity.isStoreOwned();
}


/**
 * 
 * @param {Transform} viewTransform 
 */
function recenterRootToPos(viewTransform) {
    var rootTransform = sceneRoot.getTransform();
    var camTransform = camera.getTransform();

    var desiredWorldForward = flattenDirVecY(camTransform.back);
    var rotQuat = quat.rotationFromTo(flattenDirVecY(viewTransform.forward), desiredWorldForward);
    rootTransform.setWorldRotation(rootTransform.getWorldRotation().multiply(rotQuat));

    var desiredPos = camTransform.getWorldPosition();
    var viewPosOffset = desiredPos.sub(viewTransform.getWorldPosition());

    var newPos = rootTransform.getWorldPosition().add(viewPosOffset);
    newPos.y = rootTransform.getWorldPosition().y;

    rootTransform.setWorldPosition(newPos);
}

/**
 * 
 * @param {vec3} vec 
 * @returns {vec3}
 */
function flattenDirVecY(vec) {
    return new vec3(vec.x, 0, vec.z).normalize();
}


/**
 * @param {OverlapEnterEventArgs} eventArgs
 */
function onLeftGoalOverlap(eventArgs) {
    var overlap = eventArgs.overlap;
    if (overlap.collider.isSame(ball.bodyComponent)) {
        print("goal on left!");
        ball.resetBall();
        rightScoreProp.setPendingValue(rightScoreProp.currentOrPendingValue + 1);
    }
}

/**
 * @param {OverlapEnterEventArgs} eventArgs
 */
function onRightGoalOverlap(eventArgs) {
    var overlap = eventArgs.overlap;
    if (overlap.collider.isSame(ball.bodyComponent)) {
        print("goal on right!");
        ball.resetBall();
        leftScoreProp.setPendingValue(leftScoreProp.currentOrPendingValue + 1);
    }
}


function initAsOwner() {
    if (!hasInitAsOwner) {
        hasInitAsOwner = true;
        leftGoalCollider.onOverlapEnter.add(onLeftGoalOverlap);
        rightGoalCollider.onOverlapEnter.add(onRightGoalOverlap);
        startGameButton.onTouchStart.add(startGame);
        print("trying to claim ownership of ball");
        ball.syncEntity.tryClaimOwnership(refreshUI);
        refreshUI();
    }
}

function initAsClient() {
    refreshUI();
}

function onLeftJoinButtonPressed() {
    if (!isLeftPlayer && !isRightPlayer && !leftPaddle.syncEntity.isStoreOwned()) {
        setupForLeftSide();
    }
}

function onRightJoinButtonPressed() {
    if (!isLeftPlayer && !isRightPlayer && !rightPaddle.syncEntity.isStoreOwned()) {
        setupForRightSide();
    }
}

/**
 * 
 * @param {ConnectedLensModule.UserInfo} ownerInfo
 */
function onOwnershipUpdated(ownerInfo) {
    if (!syncEntity.isStoreOwned()) {
        print("controller is not owned, trying to claim");
        syncEntity.tryClaimOwnership(function(store) {
            initAsOwner();
        });
    }
    refreshUI();
}

function onSyncEntityReady() {
    if (isHost()) {
        initAsOwner();
    } else {
        initAsClient();
    }

    leftJoinButton.onTouchStart.add(onLeftJoinButtonPressed);
    rightJoinButton.onTouchStart.add(onRightJoinButtonPressed);

    leftPaddle.syncEntity.onOwnerUpdated.add(refreshUI);
    rightPaddle.syncEntity.onOwnerUpdated.add(refreshUI);
    ball.syncEntity.onOwnerUpdated.add(refreshUI);

    refreshUI();
}

function init() {
    syncEntity.onSetupFinished.add(onSyncEntityReady);
    syncEntity.onOwnerUpdated.add(onOwnershipUpdated);
    refreshUI();
}

function setupForLeftSide() {
    leftPaddle.syncEntity.tryClaimOwnership(function() {
        isLeftPlayer = true;
        recenterRootToPos(leftOriginPos.getTransform());
        refreshUI();
    });
}

function setupForRightSide() {
    rightPaddle.syncEntity.tryClaimOwnership(function() {
        isRightPlayer = true;
        recenterRootToPos(rightOriginPos.getTransform());
        refreshUI();
    });
}

script.createEvent("OnStartEvent").bind(init);

script.startGame = startGame;