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
var dotenv = require("dotenv");
var helperFunctions = require("./helperFunctions");
var discord_js_1 = require("discord.js");
var sportx_js_1 = require("@sx-bet/sportx-js");
var ably = require("ably");
// Load the environment variables from .env file
dotenv.config({ path: '.env' });
// Load the nameTags module
var nameTags = require('./nameTags');
// Convert the nameTags hash map to lowercase
var nameTagsLowerCase = nameTags;
for (var key in nameTags) {
    if (nameTags.hasOwnProperty(key)) {
        nameTagsLowerCase[key.toLowerCase()] = nameTags[key];
    }
}
var discordClient;
var hideBetsBellow = 499;
// setup Discord client
var setupDiscordClient = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!token) {
                    console.error("Discord token is not provided.");
                    return [2 /*return*/];
                }
                discordClient = new discord_js_1.Client({
                    intents: [discord_js_1.GatewayIntentBits.Guilds]
                });
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
                return [4 /*yield*/, discordClient.login(token)
                        .then(function () {
                        console.log("Login successful.");
                    })["catch"](function (error) {
                        console.error("Failed to log in:");
                        console.error(error);
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// send a message to a specified Discord channel
var sendDiscordMessage = function (channelId, message) { return __awaiter(void 0, void 0, void 0, function () {
    var discordChannel;
    return __generator(this, function (_a) {
        discordChannel = discordClient.channels.cache.get(channelId);
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
// get a market with the specified hash
var getMarket = function (hash, sportX) { return __awaiter(void 0, void 0, void 0, function () {
    var markets;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sportX.marketLookup([hash])];
            case 1:
                markets = _a.sent();
                return [2 /*return*/, markets];
        }
    });
}); };
var makersMessage;
var orderHash;
var getMaker = function (marketHash, fillHash, sportX) { return __awaiter(void 0, void 0, void 0, function () {
    var mrktHash, tradeRequest, unsettledTrades, desiredFillHash, maker;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mrktHash = [marketHash];
                tradeRequest = {
                    marketHashes: mrktHash,
                    maker: true
                };
                return [4 /*yield*/, sportX.getTrades(tradeRequest)];
            case 1:
                unsettledTrades = _a.sent();
                desiredFillHash = fillHash;
                maker = "0x0000000000000000000000000000";
                //console.log("Unsttled trades", unsettledTrades);
                //console.log("Desired Hash", desiredFillHash);
                unsettledTrades.trades.forEach(function (element, index) {
                    if (element.fillHash === desiredFillHash && element.maker === true) {
                        maker = element.bettor;
                        return (maker);
                    }
                });
                return [2 /*return*/, (maker)];
        }
    });
}); };
var marketMaker;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var sportX, realtime;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sportx_js_1.newSportX)({
                        env: sportx_js_1.Environments.SxMainnet,
                        customSidechainProviderUrl: process.env.PROVIDER,
                        privateKey: process.env.PRIVATE_KEY
                    })];
                case 1:
                    sportX = _a.sent();
                    console.log("Enter Main: ", helperFunctions.printTime());
                    realtime = new ably.Realtime.Promise({
                        authUrl: "https://api.sx.bet/user/token"
                    });
                    // Wait for connection to be established
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            console.log("Connecting...");
                            var logicExecuted = false;
                            realtime.connection.on("connected", function () {
                                resolve();
                                if (!logicExecuted) {
                                    // Listen for realtime trades
                                    var sxChannel = realtime.channels.get("recent_trades");
                                    console.log("Listening for Trades @ ", helperFunctions.printTime());
                                    sxChannel.subscribe(function (message) { return __awaiter(_this, void 0, void 0, function () {
                                        var mrkt, timeOfBet, username, usernameMaker, event_1, takersBet, sport, league, marketMaker_1, outcomeOne, outcomeTwo, dollarStake, decimalOdds, takerAddress, discordMessage, teamOne, teamTwo;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!(message.data.tradeStatus === "SUCCESS" &&
                                                        message.data.status === "SUCCESS" &&
                                                        message.data.betTimeValue > hideBetsBellow &&
                                                        message.data.maker === false)) return [3 /*break*/, 3];
                                                    // Get market details 
                                                    console.log("Before get market: ", helperFunctions.printTime());
                                                    return [4 /*yield*/, getMarket(message.data.marketHash, sportX)];
                                                case 1:
                                                    mrkt = _a.sent();
                                                    console.log("After get market: ", helperFunctions.printTime());
                                                    timeOfBet = helperFunctions.printTime();
                                                    username = void 0;
                                                    usernameMaker = void 0;
                                                    sport = void 0;
                                                    league = void 0;
                                                    outcomeOne = mrkt[0].outcomeOneName;
                                                    outcomeTwo = mrkt[0].outcomeTwoName;
                                                    dollarStake = message.data.betTimeValue.toFixed(2);
                                                    decimalOdds = helperFunctions.apiToDecimalOdds(message.data.odds);
                                                    takerAddress = helperFunctions.shortenEthAddress(message.data.bettor, 5);
                                                    discordMessage = void 0;
                                                    return [4 /*yield*/, getMaker(message.data.marketHash, message.data.fillHash, sportX)];
                                                case 2:
                                                    marketMaker_1 = _a.sent();
                                                    console.log("maker: ", marketMaker_1);
                                                    // Check if the market has details
                                                    if (mrkt.length != 0) {
                                                        teamOne = mrkt[0].teamOneName;
                                                        teamTwo = mrkt[0].teamTwoName;
                                                        league = mrkt[0].leagueLabel;
                                                        sport = mrkt[0].sportLabel;
                                                        // Print Event
                                                        event_1 = teamOne + " vs " + teamTwo;
                                                        console.log("Event: " + event_1);
                                                        //Print takers side of the bet
                                                        takersBet = helperFunctions.takersSelection(message.data.bettingOutcomeOne, outcomeOne, outcomeTwo);
                                                        console.log(takersBet);
                                                    }
                                                    else {
                                                        console.log("Error retrieving market details");
                                                    }
                                                    // Check if the bettor is known address
                                                    //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
                                                    if (helperFunctions.hasOwnPropertyIgnoreCase(nameTags, message.data.bettor)) {
                                                        username = nameTagsLowerCase[message.data.bettor.toLowerCase()];
                                                    }
                                                    else {
                                                        username = "";
                                                    }
                                                    // Check if the maker is known address
                                                    //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
                                                    if (helperFunctions.hasOwnPropertyIgnoreCase(nameTags, marketMaker_1)) {
                                                        usernameMaker = nameTagsLowerCase[marketMaker_1.toLowerCase()];
                                                    }
                                                    else {
                                                        usernameMaker = "";
                                                    }
                                                    discordMessage = helperFunctions.compileDiscordMessage(event_1, takersBet, dollarStake, decimalOdds, takerAddress, marketMaker_1, sport, league, username, usernameMaker);
                                                    //Print discord message to console
                                                    console.log(discordMessage);
                                                    //Send discord message to Channel
                                                    //Send to CSP
                                                    sendDiscordMessage('783878646142205962', discordMessage);
                                                    _a.label = 3;
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    logicExecuted = true;
                                }
                            });
                            // 10s timeout to connect
                            setTimeout(function () { return reject(); }, 10000);
                            console.log("Connected.");
                        })];
                case 2:
                    // Wait for connection to be established
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
setupDiscordClient(process.env.DISCORD_TOKEN);
main();
