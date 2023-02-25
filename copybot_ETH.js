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
var ably = require("ably");
var sportx_js_1 = require("@sx-bet/sportx-js");
var helperFunctions = require("./helperFunctions");
var nameTags = require('./nameTags');
var STAKE;
var USDC_STAKE = 25;
var WETH_STAKE = 0.015;
var WSX_STAKE = 200;
var USDC_ENABLED = true;
var WETH_ENABLED = true;
var WSX_ENABLED = true;
var HIDE_BETS_BELOW = 70;
var MAX_SLIPPAGE = 0.03;
var BET_TOKEN = "any";
var FOLLOW_LIST = [
    "0x24357454D8d1a0Cc93a6C25fD490467372bC2454".toLowerCase(),
    "0x2b231FE033593ea99d3d6983BA8B2Aa74eD905c8".toLowerCase(),
    "0x43328E4e8FEe5A76D50055B23830C4f13e8bDF5D".toLowerCase(),
    //"0x74CfAE7b1b76Ea063Dd9B63B4FA9d16DA31e0626".toLowerCase(),
    "0xEaDa5F319B93fB9E5140ba34fd536b9134dcA304".toLowerCase(),
    "0xDEf91d30dA9B50d8CB8d42b09111F822Da173C99".toLowerCase(),
    "0x05e39710CB6b7aD5264Bc68Ae6efF298e7F21988".toLowerCase(),
    "0x27fC6CF716345018DE6a1274d71F62F11C09d13A".toLowerCase(),
    "0x2AdC112D4b138B6BA5419B4240e79Aa885e82a4E".toLowerCase(),
    "0x0C6dF912d1F70ce04F70AA6329B92fe6b447F14C".toLowerCase(),
    "0x10981f03BdA67342B272036571ca008fd53aF4Df".toLowerCase(),
    //"0xC83aa25FA5829c789DF2AC5976b4A26d49c648FF".toLowerCase()
    "0xA041DE78Be445480Fa111E85FB4511A6C471e5F8".toLowerCase(),
    //"0x631B34CF9f08615a8653B2438A881FE38211DAb4".toLowerCase(),
    "0x449472f3d7e02109b0c616b56650fef42a12d634".toLowerCase()
];
var ENABLED_BASE_TOKENS = [];
var USDC_BASE_TOKEN = "0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e".toLowerCase();
var WETH_BASE_TOKEN = "0xa173954cc4b1810c0dbdb007522adbc182dab380".toLowerCase();
var WSX_BASE_TOKEN = "0xaa99bE3356a11eE92c3f099BD7a038399633566f".toLowerCase();
if (USDC_ENABLED) {
    ENABLED_BASE_TOKENS.push(WETH_BASE_TOKEN);
}
if (WETH_ENABLED) {
    ENABLED_BASE_TOKENS.push(USDC_BASE_TOKEN);
}
if (WSX_ENABLED) {
    ENABLED_BASE_TOKENS.push(WSX_BASE_TOKEN);
}
console.log("Selected base tokens:", ENABLED_BASE_TOKENS);
// Load the environment variables from .env file
dotenv.config({ path: '.env' });
// Convert the nameTags hash map to lowercase
var nameTagsLowerCase = Object.fromEntries(Object.entries(nameTags).map(function (_a) {
    var k = _a[0], v = _a[1];
    return [k.toLowerCase(), v];
}));
var getBestPricedOrder = function (targetOrders) { return __awaiter(void 0, void 0, void 0, function () {
    var bestPricedHash, priceOfBestHash, bestOrder;
    return __generator(this, function (_a) {
        bestPricedHash = targetOrders[0].orderHash;
        priceOfBestHash = parseInt(targetOrders[0].percentageOdds);
        bestOrder = targetOrders[0];
        //Find which order is priced best
        targetOrders.forEach(function (order) {
            console.log("Is ".concat(parseInt(order.percentageOdds), "! < ").concat(priceOfBestHash, "?"));
            if (parseInt(order.percentageOdds) > priceOfBestHash && order.maker != "0x92A19377DaEA520f7Ae43F412739D8AA439f16e6") {
                bestPricedHash = order.orderHash;
                priceOfBestHash = parseInt(order.percentageOdds);
                bestOrder = order;
            }
            else {
                console.log("no");
            }
            console.log("Price of bestHash is now ".concat(priceOfBestHash, " (hgiher is better as this is the price the mm pays). \nBase token is").concat(bestOrder.baseToken));
        });
        return [2 /*return*/, bestOrder];
    });
}); };
var filterOrders = function (orders, requiredMakerOddsApi, isMakerOutcomeOne) { return __awaiter(void 0, void 0, void 0, function () {
    var targetOrders;
    return __generator(this, function (_a) {
        targetOrders = [];
        orders.forEach(function (order) {
            if (ENABLED_BASE_TOKENS.includes(order.baseToken.toLowerCase()) &&
                parseInt(order.percentageOdds) >= parseInt(requiredMakerOddsApi) &&
                order.isMakerBettingOutcomeOne === isMakerOutcomeOne) {
                targetOrders.push(order);
                console.log("Yes, added to array");
            }
        });
        return [2 /*return*/, targetOrders];
    });
}); };
var determineFillAmount = function (bestOrderOdds, bestOrderBaseToken) {
    if (bestOrderBaseToken.toLowerCase() === WETH_BASE_TOKEN) {
        STAKE = WETH_STAKE;
    }
    else if (bestOrderBaseToken.toLowerCase() === USDC_BASE_TOKEN) {
        STAKE = USDC_STAKE;
    }
    else {
        STAKE = WSX_STAKE;
    }
    var finalDecimalOdds = 1 / (1 - (0, sportx_js_1.convertFromAPIPercentageOdds)(bestOrderOdds));
    var finalPayout = finalDecimalOdds * STAKE;
    var finalProfit = Number((finalPayout - STAKE).toFixed(6));
    var finalFillAmount = (0, sportx_js_1.convertToTrueTokenAmount)(finalProfit, bestOrderBaseToken);
    var fillAmounts = [
        finalFillAmount
    ];
    return fillAmounts;
};
var stageOrder = function (bestOrder) {
    var finalOrder = [
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
    return finalOrder;
};
var convertOddsToDesiredFromMakerPOV = function (odds) {
    // Convert original odds taken in trade to implied % odds
    var convertedOdds = (0, sportx_js_1.convertFromAPIPercentageOdds)(odds);
    //Get acceptable odds limit slippage included
    var acceptableOddsTarget = convertedOdds * (1 + MAX_SLIPPAGE);
    //Inverse it so it's in makers POV
    var requiredMakerOdds = 1 - acceptableOddsTarget;
    //Convert to API format
    return (0, sportx_js_1.convertToAPIPercentageOdds)(requiredMakerOdds).toString();
};
var isMakerOutcomeOne = function (bettingOutcomeOne) {
    if (bettingOutcomeOne) {
        return false;
    }
    else {
        return true;
    }
};
var getTradesFillOrder = function (sportX, marketHash, odds, bettingOutcomeOne) { return __awaiter(void 0, void 0, void 0, function () {
    var orders, targetOrders, bestOrder, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sportX.getOrders([
                    marketHash,
                ])];
            case 1:
                orders = _a.sent();
                return [4 /*yield*/, filterOrders(orders, convertOddsToDesiredFromMakerPOV(odds), isMakerOutcomeOne(bettingOutcomeOne))];
            case 2:
                targetOrders = _a.sent();
                if (!(targetOrders != undefined && targetOrders != null && targetOrders.length != 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, getBestPricedOrder(targetOrders)];
            case 3:
                bestOrder = _a.sent();
                return [4 /*yield*/, sportX.fillOrders(stageOrder(bestOrder), determineFillAmount(bestOrder.percentageOdds, bestOrder.baseToken))];
            case 4:
                result = _a.sent();
                helperFunctions.sendDiscordMessage('913719533007675425', "CopyBot Filled an ".concat(BET_TOKEN, " Order"));
                helperFunctions.sendDiscordMessage('913719533007675425', JSON.stringify(result));
                console.log(result);
                return [2 /*return*/];
            case 5:
                helperFunctions.sendDiscordMessage('913719533007675425', "Shark placed a bet but was unable to find a bet to copy");
                console.log("No approroiate orders found");
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var sportX, realtime;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sportx_js_1.newSportX)({
                        env: sportx_js_1.Environments.SxMainnet,
                        customSidechainProviderUrl: process.env.PROVIDER,
                        privateKey: process.env.PRIVATE_KEY_ETH
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
                            // Subscribe to the "connected" event
                            realtime.connection.on("connected", function () {
                                resolve();
                                if (!logicExecuted) {
                                    // Once the connection is established, listen for realtime trades on the "recent_trades" channel
                                    var sxChannel = realtime.channels.get("recent_trades");
                                    console.log("Listening for Trades @ ", helperFunctions.printTime());
                                    // Keep track of the previous trade that we received so that we can avoid processing the same trade twice
                                    var previousFillHash = "";
                                    // Subscribe to the "message" event on the channel
                                    sxChannel.subscribe(function (trade) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            // Filter out trades that don't meet our criteria
                                            if (trade.data.tradeStatus === "PENDING" &&
                                                trade.data.betTimeValue > HIDE_BETS_BELOW &&
                                                trade.data.maker === false &&
                                                trade.data.fillHash != previousFillHash &&
                                                FOLLOW_LIST.includes(trade.data.bettor.toLowerCase())) {
                                                previousFillHash = trade.data.fillHash;
                                                console.log("Previous fillHash:", previousFillHash);
                                                console.log(trade.data);
                                                try {
                                                    getTradesFillOrder(sportX, trade.data.marketHash, trade.data.odds, trade.data.bettingOutcomeOne);
                                                }
                                                catch (error) {
                                                    console.log(JSON.stringify(error));
                                                    helperFunctions.sendDiscordMessage('913719533007675425', JSON.stringify(error));
                                                    helperFunctions.sendDiscordMessage('913719533007675425', "Trying again");
                                                    try {
                                                        getTradesFillOrder(sportX, trade.data.marketHash, trade.data.odds, trade.data.bettingOutcomeOne);
                                                    }
                                                    catch (error) {
                                                        console.log(JSON.stringify(error));
                                                        helperFunctions.sendDiscordMessage('913719533007675425', JSON.stringify(error));
                                                    }
                                                }
                                                console.log("finish loop, listening for next noob to snipe");
                                            }
                                            return [2 /*return*/];
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
helperFunctions.setupDiscordClient(process.env.DISCORD_TOKEN);
main();
