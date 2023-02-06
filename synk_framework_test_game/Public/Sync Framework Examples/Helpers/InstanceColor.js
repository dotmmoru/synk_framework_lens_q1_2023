// InstanceColor.js
// Version: 1.0.0
// Event: On Awake
// Description: Immediately instances the main material of the assigned MeshVisual, and assigns the new color.


//@input vec4 color = {1, 1, 1, 1} {"widget":"color"}
/** @type {vec4} */
var color = script.color;

//@input Component.MaterialMeshVisual visual
/** @type {MaterialMeshVisual} */
var visual = script.visual || script.getSceneObject().getComponent("MaterialMeshVisual");

visual.mainMaterial = visual.mainMaterial.clone();

visual.mainPass.baseColor = color;