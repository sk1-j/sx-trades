"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.sendDiscordMessage = exports.setupDiscordClient = exports.getAddressFromENS = exports.shortenEthAddress = exports.compileDiscordMessage = exports.apiToDecimalOdds = exports.hasOwnPropertyIgnoreCase = exports.takersSelection = exports.printMarketDetails = exports.printTime = void 0;
var sportx_js_1 = require("@sx-bet/sportx-js");
var discord_js_1 = require("discord.js");
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
function compileDiscordMessage(match, takersBet, stake, odds, taker, marketMaker, sport, league, user, marketMakerUsername) {
    marketMaker = shortenEthAddress(marketMaker, 5);
    if (user === "" && marketMakerUsername === "") {
        // Generate the message without the username or taker username
        return "\n\uD83D\uDCA0 ".concat(taker, " bet $").concat(stake, " on ").concat(takersBet, " @ ").concat(odds, "\n").concat(match, "\n").concat(sport, ": ").concat(league, "\nMaker: ").concat(marketMaker, "\n");
        //Generate message if taker username not found
    }
    else if (user === "") {
        return "\n\uD83D\uDCA0 ".concat(taker, " bet $").concat(stake, " on ").concat(takersBet, " @ ").concat(odds, "\n").concat(match, "\n").concat(sport, ": ").concat(league, "\nMaker: ").concat(marketMakerUsername, "\n");
        //Generate message if maker username not found
    }
    else if (marketMakerUsername === "") {
        return "\n\uD83D\uDCA0 ".concat(user, " bet $").concat(stake, " on ").concat(takersBet, " @ ").concat(odds, "\n").concat(match, "\n").concat(sport, ": ").concat(league, "\nMaker: ").concat(marketMaker, "\n");
    }
    else {
        return "\n\uD83D\uDCA0 ".concat(user, " bet $").concat(stake, " on ").concat(takersBet, " @ ").concat(odds, "\n").concat(match, "\n").concat(sport, ": ").concat(league, "\nMaker: ").concat(marketMakerUsername, "\n");
    }
}
exports.compileDiscordMessage = compileDiscordMessage;
"";
function shortenEthAddress(address, digits) {
    if (digits === void 0) { digits = 4; }
    return "".concat(address.slice(0, digits + 2), "...").concat(address.slice(-digits));
}
exports.shortenEthAddress = shortenEthAddress;
//dont really need this, cant reverse lookup  by addr
function getAddressFromENS(web3, ethereumAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var Web3, ensAddress, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Web3 = require("web3");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Web3.eth.ens.getAddress(ethereumAddress)];
                case 2:
                    ensAddress = _a.sent();
                    console.log("The owner of the ENS name is: ", ensAddress);
                    return [2 /*return*/, ensAddress];
                case 3:
                    error_1 = _a.sent();
                    console.error("An error occurred: ", error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getAddressFromENS = getAddressFromENS;
var discordClient;
// setup Discord client
var setupDiscordClient = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // check if token is provided
                if (!token) {
                    console.error("Discord token is not provided.");
                    return [2 /*return*/];
                }
                // create a new Discord client with Guilds intent
                discordClient = new discord_js_1.Client({
                    intents: [discord_js_1.GatewayIntentBits.Guilds]
                });
                // handle "ready" event when the client is logged in
                discordClient.on("ready", function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (discordClient.user) {
                            console.log("Logged into Discord as ".concat(discordClient.user.tag, "!"));
                        }
                        else {
                            console.error("Failed to get user information.");
                            return [2 /*return*/];
                        }
                        return [2 /*return*/];
                    });
                }); });
                // log in to Discord with the provided token
                return [4 /*yield*/, discordClient.login(token)
                        .then(function () {
                        console.log("Login successful.");
                    })["catch"](function (error) {
                        console.error("Failed to log in:");
                        console.error(error);
                    })];
            case 1:
                // log in to Discord with the provided token
                _a.sent();
                return [2 /*return*/, discordClient];
        }
    });
}); };
exports.setupDiscordClient = setupDiscordClient;
// send a message to a specified Discord channel
var sendDiscordMessage = function (channelId, message) { return __awaiter(void 0, void 0, void 0, function () {
    var discordChannel;
    return __generator(this, function (_a) {
        discordChannel = discordClient.channels.cache.get(channelId);
        // send the message to the channel
        discordChannel.send(message)
            .then(function () {
            console.log("Message sent successfully.");
        })["catch"](function (error) {
            console.error("Failed to send message:");
            console.error(error);
        });
        return [2 /*return*/];
    });
}); };
exports.sendDiscordMessage = sendDiscordMessage;
