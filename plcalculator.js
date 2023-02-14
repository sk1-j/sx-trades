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
// Load the environment variables from .env file
dotenv.config({ path: '.env' });
// Load the nameTags module
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
                //Look through all pages of orders to find the right item
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
        var sportX, tradeRequest, searchedPages, allTrades, firstPage, profit, firstPaginationKey, pageinationKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sportx_js_1.newSportX)({
                        env: sportx_js_1.Environments.SxMainnet,
                        customSidechainProviderUrl: process.env.PROVIDER,
                        privateKey: process.env.PRIVATE_KEY
                    })];
                case 1:
                    sportX = _a.sent();
                    tradeRequest = {
                        bettor: "0x7ebd0b8B13Fc85B8b639dd05675F94fB445Ffd0E",
                        settled: true
                    };
                    searchedPages = [];
                    allTrades = [];
                    return [4 /*yield*/, sportX.getTrades(tradeRequest)];
                case 2:
                    firstPage = _a.sent();
                    profit = 0;
                    firstPage.trades.forEach(function (trade, index) {
                        allTrades.push(trade);
                    });
                    console.log("you are here");
                    firstPaginationKey = firstPage.nextKey;
                    tradeRequest.paginationKey = firstPage.nextKey;
                    pageinationKey = '';
                    _a.label = 3;
                case 3:
                    if (!(firstPaginationKey != pageinationKey)) return [3 /*break*/, 5];
                    return [4 /*yield*/, sportX.getTrades(tradeRequest)];
                case 4:
                    firstPage = _a.sent();
                    tradeRequest.paginationKey = firstPage.nextKey;
                    pageinationKey = firstPage.nextKey;
                    if (firstPage.nextKey != firstPaginationKey) {
                        firstPage.trades.forEach(function (trade, index) {
                            allTrades.push(trade);
                        });
                    }
                    return [3 /*break*/, 3];
                case 5:
                    console.log(allTrades);
                    allTrades.forEach(function (trade, index) {
                        var decimalOdds = helperFunctions.apiToDecimalOdds(trade.odds);
                        console.log("{".concat(index, ": Outcome ").concat(trade.outcome, ", Betting Outcomeone: ").concat(trade.bettingOutcomeOne));
                        if ((trade.outcome === 2 && trade.bettingOutcomeOne === false) || (trade.outcome === 1 && trade.bettingOutcomeOne === true)) {
                            profit = profit + (trade.betTimeValue * (decimalOdds - 1));
                        }
                        else if (trade.outcome === 0) {
                        }
                        else {
                            profit = profit - trade.betTimeValue;
                        }
                        console.log("prfoit: ", profit);
                        allTrades.push(trade);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
setupDiscordClient(process.env.DISCORD_TOKEN);
main();
