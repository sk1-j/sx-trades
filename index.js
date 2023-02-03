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
// Load the environment variables from .env file
dotenv.config({ path: '.env' });
var sportx_js_1 = require("@sx-bet/sportx-js");
var ably = require("ably");
console.log("Hello...");
var sendDiscordMessage = function (token, channelId, message) { return __awaiter(void 0, void 0, void 0, function () {
    var client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!token) {
                    console.error("Discord token is not provided.");
                    return [2 /*return*/];
                }
                client = new discord_js_1.Client({
                    intents: [discord_js_1.GatewayIntentBits.Guilds]
                });
                // Event listener that is triggered when the client is ready
                client.on("ready", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var discordChannel;
                    return __generator(this, function (_a) {
                        // Check if the user information is available
                        if (client.user) {
                            console.log("Logged in as ".concat(client.user.tag, "!"));
                        }
                        else {
                            console.error("Failed to get user information.");
                            return [2 /*return*/];
                        }
                        discordChannel = client.channels.cache.get(channelId);
                        // Send the message to the channel
                        discordChannel.send(message)
                            .then(function () {
                            console.log("Message sent successfully.");
                        })["catch"](function (error) {
                            console.error("Failed to send message:");
                            console.error(error);
                        });
                        return [2 /*return*/];
                    });
                }); });
                // Login to the Discord client
                return [4 /*yield*/, client.login(token)
                        .then(function () {
                        console.log("Login successful.");
                    })["catch"](function (error) {
                        console.error("Failed to log in:");
                        console.error(error);
                    })];
            case 1:
                // Login to the Discord client
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// Load the nameTags module
var nameTags = require('./nameTags');
// Convert the nameTags hash map to lowercase
var nameTagsLowerCase = nameTags;
for (var key in nameTags) {
    if (nameTags.hasOwnProperty(key)) {
        nameTagsLowerCase[key.toLowerCase()] = nameTags[key];
    }
}
// Initialize the SportX library
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var sportX;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sportx_js_1.newSportX)({
                        env: sportx_js_1.Environments.SxMainnet,
                        customSidechainProviderUrl: process.env.PROVIDER,
                        privateKey: process.env.PRIVATE_KEY
                    })];
                case 1:
                    sportX = _a.sent();
                    return [2 /*return*/, (sportX)];
            }
        });
    });
}
function getMarket(hash) {
    return __awaiter(this, void 0, void 0, function () {
        var sportX, markets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sportx_js_1.newSportX)({
                        env: sportx_js_1.Environments.SxMainnet,
                        customSidechainProviderUrl: process.env.PROsVIDER,
                        privateKey: process.env.PRIVATE_KEY
                    })];
                case 1:
                    sportX = _a.sent();
                    return [4 /*yield*/, sportX.marketLookup([
                            hash,
                        ])];
                case 2:
                    markets = _a.sent();
                    return [2 /*return*/, (markets)];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var realtime;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    realtime = new ably.Realtime.Promise({
                        authUrl: "https://api.sx.bet/user/token"
                    });
                    // Wait for connection to be established
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            console.log("Connecting...");
                            realtime.connection.on("connected", function () {
                                resolve();
                                // Listen for realtime trades
                                var sxChannel = realtime.channels.get("recent_trades");
                                sxChannel.subscribe(function (message) { return __awaiter(_this, void 0, void 0, function () {
                                    var mrkt, timeOfBet, username, event_1, takersBet, outcomeOne, outcomeTwo, dollarStake, decimalOdds, takerAddress, discordMessage, teamOne, teamTwo;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!(message.data.tradeStatus === "SUCCESS" &&
                                                    message.data.status === "SUCCESS" &&
                                                    message.data.maker === false)) return [3 /*break*/, 2];
                                                return [4 /*yield*/, getMarket(message.data.marketHash)];
                                            case 1:
                                                mrkt = _a.sent();
                                                console.log("************************************");
                                                timeOfBet = helperFunctions.printTime();
                                                username = void 0;
                                                outcomeOne = mrkt[0].outcomeOneName;
                                                outcomeTwo = mrkt[0].outcomeTwoName;
                                                dollarStake = message.data.betTimeValue;
                                                message.data.be;
                                                decimalOdds = 1 / (message.data.odds / 100000000000000000000);
                                                takerAddress = message.data.bettor;
                                                discordMessage = void 0;
                                                console.log("Market deets", mrkt);
                                                console.log("Order deets", message.data);
                                                // Check if the market has details
                                                if (mrkt.length != 0) {
                                                    teamOne = mrkt[0].teamOneName;
                                                    teamTwo = mrkt[0].teamTwoName;
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
                                                //Output bet details
                                                console.log("Stake: $" + dollarStake +
                                                    "\nDecimal Odds: " + decimalOdds);
                                                console.log("Bettor Address: " + takerAddress);
                                                // Check if the bettor is known address
                                                //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
                                                if (helperFunctions.hasOwnPropertyIgnoreCase(nameTags, message.data.bettor)) {
                                                    username = nameTagsLowerCase[message.data.bettor.toLowerCase()];
                                                    discordMessage = "\nUser: ".concat(username, "\n__**").concat(event_1, "**__\n**").concat(takersBet, "**\nStake: $").concat(dollarStake, "\nOdds: ").concat(decimalOdds, "\nTaker Address: ").concat(takerAddress, "\n\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8");
                                                }
                                                else {
                                                    discordMessage = "\n__**".concat(event_1, "**__\n**").concat(takersBet, "**\nStake: $").concat(dollarStake, "\nOdds: ").concat(decimalOdds, "\nTaker: ").concat(takerAddress, "\n\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8\uD83D\uDCB8");
                                                }
                                                console.log("Username: " + username);
                                                console.log(discordMessage);
                                                sendDiscordMessage(process.env.DISCORD_TOKEN, '913719533007675425', discordMessage);
                                                _a.label = 2;
                                            case 2: return [2 /*return*/];
                                        }
                                    });
                                }); });
                            });
                            // 10s timeout to connect
                            setTimeout(function () { return reject(); }, 10000);
                            console.log("Connected.");
                        })];
                case 1:
                    // Wait for connection to be established
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
initialize();
main();
