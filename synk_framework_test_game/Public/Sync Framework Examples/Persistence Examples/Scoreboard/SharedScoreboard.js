// SharedScoreboard.js
// Version: 1.0.1
// Event: On Awake
// Description: Example showing how to control a persistent, shared scoreboard.
// This script uses two StorePropLookup objects - one to track the scores, and the other to track display names.
// This simple example uses the tap event to increase scores, but it can easily work for anything.


//@input Component.Text scoreBoardText3D
/** @type {Text} */
var scoreBoardText3D = script.scoreBoardText3D;

//@input bool showHeading
/** @type {boolean} */
var showHeading = script.showHeading;

//@input bool showTotalScore
/** @type {boolean} */
var showTotalScore = script.showTotalScore;

var syncEntity = new global.SyncEntity(script, null, false, RealtimeStoreCreateOptions.Persistence.Persist);

// == STATE
/** @type {StorageProperty<int>} */
var localScoreProp;

/** @type {StoragePropLookup<int>} */
var scoreProperties = new global.StoragePropLookup(syncEntity, "user-score-", global.StorageTypes.int);
scoreProperties.onAnyChange.add(redrawScores);

/** @type {StoragePropLookup<string>} */
var displayNameProperties = new global.StoragePropLookup(syncEntity, "display-name-", global.StorageTypes.string);
displayNameProperties.onAnyChange.add(redrawScores);

// == Initialize Properties

// We need to collect other properties after we've connected
function initTrackPropertiesFromUserId() {
    // Set up current user
    var localId = global.sessionController.getLocalUserId();

    // Add our score
    localScoreProp = scoreProperties.addProperty(localId, 0);

    // Add our display name to the store
    displayNameProperties.addProperty(localId, global.sessionController.getLocalUserName());
}

// == Score Modifiers
/**
 * @param {number} amount 
 */
function addLocalScore(amount) {
    localScoreProp.setPendingValue(localScoreProp.currentValue + amount);
}

// == Experience
syncEntity.notifyOnReady(onReady);

function onReady() {
    initTrackPropertiesFromUserId();

    // Increase our score on tap
    script.createEvent("TapEvent").bind(function() {
        addLocalScore(1);
    });
}

// == Helpers

function getUserDisplayName(userId) {
    var prop = displayNameProperties.getProperty(userId);
    return prop ? prop.currentValue : "?";
}

function redrawScores() {
    var result = "";

    if (showHeading) {
        result += "SCORE";
        result += "\n" + "=====";
    }
    
    var scoreEntries = [];
    var totalScore = 0;

    // Go through score properties, add name and score entries to list
    for (var userId in scoreProperties.propertyDic) {
        var value = scoreProperties.getProperty(userId).currentValue;
        var playerName = getUserDisplayName(userId);
        scoreEntries.push({name: playerName, value:value});
        totalScore += value;
    }

    // Sort each pair by highest score
    scoreEntries.sort(function(aEntry, bEntry) {
        return (aEntry.value === bEntry.value) ? 0 : (aEntry.value < bEntry.value) ? 1 : -1;
    });

    if (showTotalScore) {
        // Write the total score
        result += "\nTotal Score: " + totalScore;
    }

    // Write each entry to the list
    for (var i=0; i<scoreEntries.length; i++) {
        var entry = scoreEntries[i];
        result += "\n" + entry.name + ": " + entry.value;
    }

    scoreBoardText3D.text = result;
}

