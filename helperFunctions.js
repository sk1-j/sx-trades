"use strict";
exports.__esModule = true;
exports.hasOwnPropertyIgnoreCase = exports.takersSelection = exports.printMarketDetails = exports.printTime = void 0;
//Get and print the current datetime
function printTime() {
    var currentDate = new Date();
    console.log("\n" + currentDate.toLocaleString());
}
exports.printTime = printTime;
function printMarketDetails(event, isMakerTeamOne, outcomeOne, outcomeTwo, stake, odds, address) {
}
exports.printMarketDetails = printMarketDetails;
function takersSelection(isMakerTeamOne, outcomeOne, outcomeTwo) {
    var takersSide;
    if (isMakerTeamOne === true) {
        //Then taker is betting on Outcome 2
        takersSide = outcomeTwo;
    }
    else if (isMakerTeamOne === false) {
        //Then taker is betting on Outcome 1
        takersSide = outcomeTwo;
    }
    else {
        "Error finding takers side of the bet";
    }
    return takersSide;
}
exports.takersSelection = takersSelection;
function hasOwnPropertyIgnoreCase(obj, prop) {
    prop = prop.toLowerCase();
    for (var key in obj) {
        if (key.toLowerCase() === prop) {
            return true;
        }
    }
    return false;
}
exports.hasOwnPropertyIgnoreCase = hasOwnPropertyIgnoreCase;
