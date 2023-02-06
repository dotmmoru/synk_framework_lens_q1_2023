// SyncedColorSelector.js
// Version: 1.0.1
// Event: On Awake
// Description: Example showing a simple networked RGB based color selector.
// Each color is represented by a slider, and synced over the network using a StorageProperty.


//@input Component.ScriptComponent redSlider
/** @type {ConstrainBody} */
var redSlider = script.redSlider;

//@input Component.ScriptComponent greenSlider
/** @type {ConstrainBody} */
var greenSlider = script.greenSlider;

//@input Component.ScriptComponent blueSlider
/** @type {ConstrainBody} */
var blueSlider = script.blueSlider;

//@input Component.MaterialMeshVisual targetVisual
/** @type {MaterialMeshVisual} */
var targetVisual = script.targetVisual;

//@input float sendPerSecondLimit = 10.0
/** @type {number} */
var sendPerSecondLimit = script.sendPerSecondLimit;

/**
 * 
 * @param {string} name 
 * @param {ConstrainBody} slider 
 * @param {string} colorProp 
 * @returns {StorageProperty<number>}
 */
function makeSliderProp(name, slider, colorProp) {
    var prop = new global.StorageProperty(name, global.StorageTypes.float);

    prop.getterFunc = function() {
        return slider.getRelativePosition().y;
    };

    prop.setterFunc = function(v) {
        slider.setRelativePosition(new vec3(0.5, v, 0.5));
    };

    /**
     * 
     * @param {float} val 
     */
    function onChange(val) {
        var col = targetVisual.mainPass.baseColor;
        col[colorProp] = val;
        targetVisual.mainPass.baseColor = col;
    }

    prop.onAnyChange.add(onChange);
    prop.onPendingValueChange.add(onChange);

    prop.sendsPerSecondLimit = sendPerSecondLimit;

    return prop;
}

var storageProps = new global.StoragePropertySet([
    makeSliderProp("red", redSlider, "r"),
    makeSliderProp("green", greenSlider, "g"),
    makeSliderProp("blue", blueSlider, "b"),
]);

// eslint-disable-next-line no-unused-vars
var syncEntity = new global.SyncEntity(script, storageProps, false);
