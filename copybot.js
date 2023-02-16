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
var USDC_BASE_TOKEN = "0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e";
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
var hideBetsBellow = 1;
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
var getMaker = function (marketHash, fillHash, orderHash, sportX) { return __awaiter(void 0, void 0, void 0, function () {
    var mrktHash, tradeRequest, unsettledTrades, desiredFillHash, maker, tradeRequest;
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
                //console.log("UNSETTLEDTRADES", unsettledTrades);
                console.log("MSG data:", unsettledTrades.trades[0]);
                desiredFillHash = fillHash;
                maker = "0x0000000000000000000000000000";
                //console.log("Unsttled trades", unsettledTrades);
                console.log("Desired Hash", desiredFillHash);
                console.log("Next Key:", unsettledTrades.nextKey);
                _a.label = 2;
            case 2:
                if (!(unsettledTrades.nextKey != undefined)) return [3 /*break*/, 4];
                // console.log("Now iterating thru:", unsettledTrades);
                console.log("next key:", unsettledTrades.nextKey);
                unsettledTrades.trades.forEach(function (element, index) {
                    if (element.fillHash === desiredFillHash && element.orderHash === orderHash && element.maker === true && element.tradeStatus === "SUCCESS") {
                        console.log("found elemnt");
                        maker = element.bettor;
                        return (maker);
                    }
                });
                tradeRequest = {
                    marketHashes: mrktHash,
                    maker: true,
                    paginationKey: unsettledTrades.nextKey
                };
                return [4 /*yield*/, sportX.getTrades(tradeRequest)];
            case 3:
                unsettledTrades = _a.sent();
                return [3 /*break*/, 2];
            case 4: return [2 /*return*/, (maker)];
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
                                        var isMakerOutcomeOne, convertedOdds, acceptableOddsTarget, requiredMakerOdds, requiredMakerOddsApi_1, orders, targetOrders_1, bestPricedHash, priceOfBestHash, bestOrder, finalOrder, fillAmounts, result, error_1;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!(message.data.tradeStatus === "SUCCESS" &&
                                                        message.data.status === "SUCCESS" &&
                                                        message.data.betTimeValue > hideBetsBellow &&
                                                        message.data.maker === false &&
                                                        (message.data.bettor === "0x24357454D8d1a0Cc93a6C25fD490467372bC2454" ||
                                                            message.data.bettor === "0x2b231FE033593ea99d3d6983BA8B2Aa74eD905c8" ||
                                                            message.data.bettor === "0x43328E4e8FEe5A76D50055B23830C4f13e8bDF5D" ||
                                                            message.data.bettor === "0x631B34CF9f08615a8653B2438A881FE38211DAb4"))) return [3 /*break*/, 6];
                                                    console.log(message.data);
                                                    if (message.data.bettingOutcomeOne) {
                                                        isMakerOutcomeOne = false;
                                                    }
                                                    else {
                                                        isMakerOutcomeOne = true;
                                                    }
                                                    convertedOdds = (0, sportx_js_1.convertFromAPIPercentageOdds)(message.data.odds);
                                                    console.log("Converted Odds:", convertedOdds);
                                                    acceptableOddsTarget = convertedOdds * (1 - 0.02);
                                                    console.log("Target Odds (2% below):", acceptableOddsTarget);
                                                    requiredMakerOdds = 1 - acceptableOddsTarget;
                                                    console.log("Required Maker Odds:", requiredMakerOdds);
                                                    requiredMakerOddsApi_1 = (0, sportx_js_1.convertToAPIPercentageOdds)(requiredMakerOdds).toString();
                                                    return [4 /*yield*/, sportX.getOrders([
                                                            message.data.marketHash,
                                                        ])];
                                                case 1:
                                                    orders = _a.sent();
                                                    targetOrders_1 = [];
                                                    orders.forEach(function (order) {
                                                        console.log(" order", order);
                                                        // console.log(`Base toke ${order.baseToken} + USDC: ${USDC_BASE_TOKEN}`);
                                                        // console.log(`Order odds ${order.percentageOdds} < ${parseInt(requiredMakerOddsApi)}`);
                                                        if (order.baseToken === USDC_BASE_TOKEN &&
                                                            parseInt(order.percentageOdds) < parseInt(requiredMakerOddsApi_1) &&
                                                            order.isMakerBettingOutcomeOne === isMakerOutcomeOne) {
                                                            console.log("adding order", order);
                                                            targetOrders_1.push(order);
                                                        }
                                                    });
                                                    console.log("Length of that array^:", targetOrders_1);
                                                    if (!(targetOrders_1 != undefined && targetOrders_1 != null && targetOrders_1.length != 0)) return [3 /*break*/, 5];
                                                    bestPricedHash = targetOrders_1[0].orderHash;
                                                    priceOfBestHash = parseInt(targetOrders_1[0].percentageOdds);
                                                    bestOrder = targetOrders_1[0];
                                                    targetOrders_1.forEach(function (order) {
                                                        if (parseInt(order.percentageOdds) < priceOfBestHash && order.maker != "0x92A19377DaEA520f7Ae43F412739D8AA439f16e6") {
                                                            bestPricedHash = order.orderHash;
                                                            priceOfBestHash = parseInt(order.percentageOdds);
                                                            bestOrder = order;
                                                        }
                                                    });
                                                    if (!(bestOrder != undefined && bestOrder != null)) return [3 /*break*/, 5];
                                                    finalOrder = [
                                                        {
                                                            executor: bestOrder.executor,
                                                            expiry: bestOrder.expiry,
                                                            isMakerBettingOutcomeOne: bestOrder.isMakerBettingOutcomeOne,
                                                            maker: bestOrder.maker,
                                                            marketHash: bestOrder.marketHash,
                                                            percentageOdds: bestOrder.percentageOdds,
                                                            salt: bestOrder.salt,
                                                            totalBetSize: bestOrder.totalBetSize,
                                                            baseToken: bestOrder.baseToken,
                                                            signature: bestOrder.signature,
                                                            apiExpiry: bestOrder.apiExpiry
                                                        }
                                                    ];
                                                    fillAmounts = [
                                                        (0, sportx_js_1.convertToTrueTokenAmount)(5, USDC_BASE_TOKEN)
                                                    ];
                                                    _a.label = 2;
                                                case 2:
                                                    _a.trys.push([2, 4, , 5]);
                                                    return [4 /*yield*/, sportX.fillOrders(finalOrder, fillAmounts)];
                                                case 3:
                                                    result = _a.sent();
                                                    sendDiscordMessage('913719533007675425', "CopyBot Filled an Order");
                                                    sendDiscordMessage('913719533007675425', JSON.stringify(result));
                                                    console.log(result);
                                                    return [3 /*break*/, 5];
                                                case 4:
                                                    error_1 = _a.sent();
                                                    sendDiscordMessage('913719533007675425', "CopyBot Error filling an Order");
                                                    sendDiscordMessage('913719533007675425', JSON.stringify(error_1));
                                                    return [3 /*break*/, 5];
                                                case 5:
                                                    console.log("finish loop, listening for next noob to snipe");
                                                    _a.label = 6;
                                                case 6: return [2 /*return*/];
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
