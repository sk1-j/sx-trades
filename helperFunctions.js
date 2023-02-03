"use strict";
exports.__esModule = true;
exports.apiToDecimalOdds = exports.hasOwnPropertyIgnoreCase = exports.takersSelection = exports.printMarketDetails = exports.printTime = void 0;
var sportx_js_1 = require("@sx-bet/sportx-js");
//Get and print the current datetime
function printTime() {
    var currentDate = new Date();
    console.log("\n" + currentDate.toLocaleString());
    return currentDate;
}
exports.printTime = printTime;
function printMarketDetails(event, isMakerTeamOne, outcomeOne, outcomeTwo, stake, odds, address) {
}
exports.printMarketDetails = printMarketDetails;
function takersSelection(isMakerTeamOne, outcomeOne, outcomeTwo) {
    var takersSide;
    if (isMakerTeamOne) {
        //Then taker is betting on Outcome 2
        takersSide = outcomeOne;
    }
    else if (!isMakerTeamOne) {
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
function apiToDecimalOdds(num) {
    var decimalOdds = 1 / (0, sportx_js_1.convertFromAPIPercentageOdds)(num);
    return parseFloat(decimalOdds.toFixed(3));
}
exports.apiToDecimalOdds = apiToDecimalOdds;
