import * as dotenv from 'dotenv';
import BigNumber from 'bignumber.js';
import * as ably from "ably";
import { stringify } from 'querystring';
import { constants } from 'fs/promises';

import { Client, TextChannel, GatewayIntentBits } from "discord.js";
import { convertFromAPIPercentageOdds, ISportX, convertToAPIPercentageOdds, Environments, newSportX, convertToTrueTokenAmount, IGetTradesRequest, IDetailedRelayerMakerOrder, convertToTakerPayAmount, convertToDisplayAmount } from "@sx-bet/sportx-js";

import * as helperFunctions from './helperFunctions';
import { measureMemory } from 'vm';
import { error } from 'console';
const nameTags = require('./nameTags');

let STAKE: number;
const USDC_STAKE = 25;
const WETH_STAKE = 0.015;
const WSX_STAKE = 200;

const USDC_ENABLED: boolean = true;
const WETH_ENABLED: boolean = true;
const WSX_ENABLED: boolean = true;

const HIDE_BETS_BELOW = 500;
const MAX_SLIPPAGE = 0.03;
const BET_TOKEN: string = "any";

const FOLLOW_LIST: string[] = [
  "0x24357454D8d1a0Cc93a6C25fD490467372bC2454".toLowerCase(),
  "0x2b231FE033593ea99d3d6983BA8B2Aa74eD905c8".toLowerCase(),
  "0x43328E4e8FEe5A76D50055B23830C4f13e8bDF5D".toLowerCase(),
  "0x74CfAE7b1b76Ea063Dd9B63B4FA9d16DA31e0626".toLowerCase(),
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

const ENABLED_BASE_TOKENS: string[] = [];
const USDC_BASE_TOKEN = "0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e".toLowerCase();
const WETH_BASE_TOKEN = "0xa173954cc4b1810c0dbdb007522adbc182dab380".toLowerCase();
const WSX_BASE_TOKEN = "0xaa99bE3356a11eE92c3f099BD7a038399633566f".toLowerCase();

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
const nameTagsLowerCase = Object.fromEntries(
  Object.entries(nameTags).map(([k, v]) => [k.toLowerCase(), v])
);

const getBestPricedOrder = async (targetOrders: IDetailedRelayerMakerOrder[]) => {

  var bestPricedHash: string = targetOrders[0].orderHash;
  //console.log("Best Priced Hash", bestPricedHash)
  var priceOfBestHash: number = parseInt(targetOrders[0].percentageOdds);
  //console.log("Price of Best Hash", priceOfBestHash)

  var bestOrder = targetOrders[0];
  //Find which order is priced best
  targetOrders.forEach(order => {
    console.log(`Is ${parseInt(order.percentageOdds)}! < ${priceOfBestHash}?`);

    if (parseInt(order.percentageOdds) > priceOfBestHash && order.maker != "0x92A19377DaEA520f7Ae43F412739D8AA439f16e6") {
      bestPricedHash = order.orderHash;
      priceOfBestHash = parseInt(order.percentageOdds);
      bestOrder = order;
    } else {
      console.log("no");
    }
    console.log(`Price of bestHash is now ${priceOfBestHash} (hgiher is better as this is the price the mm pays). \nBase token is${bestOrder.baseToken}`);
  });
  return bestOrder;
}

const filterOrders = async (orders: IDetailedRelayerMakerOrder[], requiredMakerOddsApi: string, isMakerOutcomeOne: boolean) => {
  const targetOrders: IDetailedRelayerMakerOrder[] = [];
  orders.forEach(order => {
    if (ENABLED_BASE_TOKENS.includes(order.baseToken.toLowerCase()) &&
      parseInt(order.percentageOdds) >= parseInt(requiredMakerOddsApi) &&
      order.isMakerBettingOutcomeOne === isMakerOutcomeOne
    ) {
      targetOrders.push(order);
      console.log("Yes, added to array");
    }
  });
  return targetOrders;
}

const determineFillAmount = (bestOrderOdds: string, bestOrderBaseToken: string) => {
  if (bestOrderBaseToken.toLowerCase() === WETH_BASE_TOKEN) {
    STAKE = WETH_STAKE;
  } else if (bestOrderBaseToken.toLowerCase() === USDC_BASE_TOKEN) {
    STAKE = USDC_STAKE;
  } else {
    STAKE = WSX_STAKE;
  }

  //Figure out how much to enter in the function to ensure right bet  size
  const finalDecimalOdds = 1 / (1 - convertFromAPIPercentageOdds(bestOrderOdds));
  const finalPayout = finalDecimalOdds * STAKE;
  const finalProfit = Number((finalPayout - STAKE).toFixed(6));
  const finalFillAmount = convertToTrueTokenAmount(finalProfit, bestOrderBaseToken);
  const fillAmounts = [
    finalFillAmount
    //convertToTrueTokenAmount(BET_STAKE, USDC_BASE_TOKEN)
  ];
  return fillAmounts;
}

const stageOrder = (bestOrder: IDetailedRelayerMakerOrder) => {
  const finalOrder = [
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
}

const convertOddsToDesiredFromMakerPOV = (odds: string) => {
  // Convert original odds taken in trade to implied % odds
  const convertedOdds = convertFromAPIPercentageOdds(odds);
  //Get acceptable odds limit slippage included
  const acceptableOddsTarget = convertedOdds * (1 + MAX_SLIPPAGE);
  //Inverse it so it's in makers POV
  const requiredMakerOdds = 1 - acceptableOddsTarget;
  //Convert to API format
  return convertToAPIPercentageOdds(requiredMakerOdds).toString();
}


const isMakerOutcomeOne = (bettingOutcomeOne: boolean) => {
  if (bettingOutcomeOne) {
    return false;
  } else {
    return true;
  }
}

const getTradesFillOrder = async (sportX: ISportX, marketHash: string, odds: string, bettingOutcomeOne: boolean) => {
  const orders = await sportX.getOrders([
    marketHash,
  ]);
  const targetOrders = await filterOrders(orders, convertOddsToDesiredFromMakerPOV(odds), isMakerOutcomeOne(bettingOutcomeOne));
  if (targetOrders != undefined && targetOrders != null && targetOrders.length != 0) {
    var bestOrder = await getBestPricedOrder(targetOrders);
    const result = await sportX.fillOrders(stageOrder(bestOrder), determineFillAmount(bestOrder.percentageOdds, bestOrder.baseToken));
    helperFunctions.sendDiscordMessage('913719533007675425', `CopyBot Filled an ${BET_TOKEN} Order`);
    helperFunctions.sendDiscordMessage('913719533007675425', JSON.stringify(result));
    console.log(result)
    return;
  }
  else {
    helperFunctions.sendDiscordMessage('913719533007675425', "Shark placed a bet but was unable to find a bet to copy");
    console.log("No approroiate orders found");
  }
}


async function main() {
  // Create a connection to the SportX API and wait for it to finish initializing
  const sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY_ETH,
  });
  console.log("Enter Main: ", helperFunctions.printTime());
  // Create a new instance of Ably realtime
  const realtime = new ably.Realtime.Promise({
    authUrl: `https://api.sx.bet/user/token`,
  });
  // Wait for connection to be established
  await new Promise<void>((resolve, reject) => {
    console.log("Connecting...");
    let logicExecuted = false;
    // Subscribe to the "connected" event
    realtime.connection.on("connected", () => {
      resolve();
      if (!logicExecuted) {
        // Once the connection is established, listen for realtime trades on the "recent_trades" channel
        const sxChannel = realtime.channels.get(`recent_trades`);
        console.log("Listening for Trades @ ", helperFunctions.printTime());
        // Keep track of the previous trade that we received so that we can avoid processing the same trade twice
        var previousFillHash = "";
        // Subscribe to the "message" event on the channel
        sxChannel.subscribe(async (message) => {
          // Filter out trades that don't meet our criteria
          if (
            message.data.tradeStatus === "PENDING" &&
            message.data.betTimeValue > HIDE_BETS_BELOW &&
            message.data.maker === false &&
            message.data.fillHash != previousFillHash &&
            FOLLOW_LIST.includes(message.data.bettor.toLowerCase())
          ) {
            previousFillHash = message.data.fillHash;
            console.log("Previous fillHash:", previousFillHash);
            console.log(message.data);
            try {
              getTradesFillOrder(sportX, message.data.marketHash, message.data.odds, message.data.bettingOutcomeOne);
            } catch (error) {
              console.log(JSON.stringify(error));
              helperFunctions.sendDiscordMessage('913719533007675425', JSON.stringify(error));
              helperFunctions.sendDiscordMessage('913719533007675425', "Trying again");
              try {
                getTradesFillOrder(sportX, message.data.marketHash, message.data.odds, message.data.bettingOutcomeOne);
              } catch (error) {
                console.log(JSON.stringify(error));
                helperFunctions.sendDiscordMessage('913719533007675425', JSON.stringify(error));
              }
            }
            console.log("finish loop, listening for next noob to snipe");
          }
        });
        logicExecuted = true;
      }
    });
    // 10s timeout to connect
    setTimeout(() => reject(), 10000);
    console.log("Connected.");
  });
}
helperFunctions.setupDiscordClient(process.env.DISCORD_TOKEN);
main();
