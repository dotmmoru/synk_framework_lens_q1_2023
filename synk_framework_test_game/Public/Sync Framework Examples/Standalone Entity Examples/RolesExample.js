// RolesExample.js
// Version: 1.0.1
// Event: On Awake
// Description: Example showing how to create a simple role selection screen using Standalone Entities.
// We dynamically create a new Standalone SyncEntity for each available role - these SyncEntities are not tied to a Component or SceneObject.
// Users claim a role by claiming ownership of the Entity.


//@input SceneObject uiParent
/** @type {SceneObject} */
var uiParent = script.uiParent;

//@input Component.ScriptComponent[] claimRoleButtons
/** @type {(ScriptComponent & RaycastButton)[]} */
var claimRoleButtons = script.claimRoleButtons;

//@ui {"widget":"group_start","label":"Button Colors"}


//@input vec4 defaultColor = {1, 1, 1, 1} {"widget":"color"}
/** @type {vec4} */
var defaultColor = script.defaultColor;

//@input vec4 selfColor = {0, 0, 1, 1} {"widget":"color"}
/** @type {vec4} */
var selfColor = script.selfColor;

//@input vec4 otherColor = {0.5. 0.5, 0.5, 1.0} {"widget":"color"}
/** @type {vec4} */
var otherColor = script.otherColor;

//@ui {"widget":"group_end"}

/** @type {SyncEntity[]} */
var roleEntities = [];

var claimingOwnership = false;

function createRole(index) {
    var role = global.SyncEntity.createStandalone("role_" + index);
    roleEntities.push(role);

    var button = claimRoleButtons[index];
    button.onTouchStart.add(function() {
        if (!claimingOwnership) {
            if (role.doIOwnStore()) {
                role.tryRevokeOwnership();
            } else if (!role.isStoreOwned()) {
                clearAnyRoles();
                role.tryClaimOwnership(function() {
                    claimingOwnership = false;
                }, function() {
                    claimingOwnership = false;
                });
            }
        }
    });

    var txt = getComponentRecursive(button.getSceneObject(), "Text");
    var vis = getComponentRecursive(button.getSceneObject(), "Component.MaterialMeshVisual");
    if (vis) {
        vis.mainMaterial = vis.mainMaterial.clone();
    }
    role.onOwnerUpdated.add(function(ownerInfo) {
        if (txt) {
            txt.text = (ownerInfo && ownerInfo.displayName) || "";
        }
        if (vis) {
            var col = defaultColor;
            if (role.doIOwnStore()) {
                col = selfColor;
            } else if (role.isStoreOwned()) {
                col = otherColor;
            }
            vis.mainPass.baseColor = col;
        }
        
    });
}

function clearAnyRoles() {
    for (var i=0; i<roleEntities.length; i++) {
        roleEntities[i].tryRevokeOwnership();
    }
}

function init() {
    // Create a "role" entity for each role button
    for (var i=0; i<claimRoleButtons.length; i++) {
        createRole(i);
    }

    uiParent.enabled = false;

    global.sessionController.notifyOnReady(function() {
        uiParent.enabled = true;
    });
}

script.createEvent("OnStartEvent").bind(init);

/**
* Returns the first Component of `componentType` found in the object or its children.
* @template {keyof ComponentNameMap} T
* @param {SceneObject} object Object to search
* @param {T} componentType Component type name to search for
* @returns {ComponentNameMap[T]} Matching Component in `object` and its children
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