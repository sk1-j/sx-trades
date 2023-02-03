"use strict";
exports.__esModule = true;
exports.shortenEthAddress = exports.compileDiscordMessage = exports.apiToDecimalOdds = exports.hasOwnPropertyIgnoreCase = exports.takersSelection = exports.printMarketDetails = exports.printTime = void 0;
var sportx_js_1 = require("@sx-bet/sportx-js");
// Function to print the current date and time to the console
function printTime() {
    // Get the current date
    var currentDate = new Date();
    // Print the date and time in a locale-specific format
    console.log("\n" + currentDate.toLocaleString());
    // Return the current date
    return currentDate.toLocaleString();
}
exports.printTime = printTime;
// Function to print details about a betting market
function printMarketDetails(event, isMakerTeamOne, outcomeOne, outcomeTwo, stake, odds, address) { }
exports.printMarketDetails = printMarketDetails;
// Function to determine the taker's selected outcome
function takersSelection(isMakerTeamOne, outcomeOne, outcomeTwo) {
    var takersSide;
    if (isMakerTeamOne) {
        // Taker is betting on Outcome 2
        takersSide = outcomeOne;
    }
    else if (!isMakerTeamOne) {
        // Taker is betting on Outcome 1
        takersSide = outcomeTwo;
    }
    else {
        // Error finding taker's side of the bet
        "Error finding taker's side of the bet";
    }
    // Return the taker's selected outcome
    return takersSide;
}
exports.takersSelection = takersSelection;
// Function to check if an object has a property, ignoring case sensitivity
function hasOwnPropertyIgnoreCase(obj, prop) {
    // Convert the property name to lowercase
    prop = prop.toLowerCase();
    // Loop through the object properties
    for (var key in obj) {
        // Check if the lowercase version of the property name matches the desired property
        if (key.toLowerCase() === prop) {
            // The property exists, return true
            return true;
        }
    }
    // The property does not exist, return false
    return false;
}
exports.hasOwnPropertyIgnoreCase = hasOwnPropertyIgnoreCase;
// Function to convert API odds to decimal odds
function apiToDecimalOdds(num) {
    // Calculate the decimal odds
    var decimalOdds = 1 / (0, sportx_js_1.convertFromAPIPercentageOdds)(num);
    // Round the decimal odds to 3 decimal places and return the result
    return parseFloat(decimalOdds.toFixed(3));
}
exports.apiToDecimalOdds = apiToDecimalOdds;
// Function to compile a Discord message
function compileDiscordMessage(match, takersBet, stake, odds, taker, user) {
    if (typeof user === "undefined") {
        // Generate the message without the username
        return "\n**".concat(taker, " bet $").concat(stake, " on ").concat(takersBet, " @ ").concat(odds, "\n").concat(match, "\n");
    }
    else {
        // Generate the message with the username
        //return `\n**${match}**\n${takersBet}\n$${stake} @ ${odds}\n${user}\n${taker}`;
        return "\n**".concat(user, " bet $").concat(stake, " on ").concat(takersBet, " @ ").concat(odds, "\n").concat(match, "\n");
    }
}
exports.compileDiscordMessage = compileDiscordMessage;
"";
function shortenEthAddress(address, digits) {
    if (digits === void 0) { digits = 4; }
    return "".concat(address.slice(0, digits + 2), "...").concat(address.slice(-digits));
}
exports.shortenEthAddress = shortenEthAddress;
