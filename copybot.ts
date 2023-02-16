import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';
import { Client, TextChannel, GatewayIntentBits } from "discord.js";
import BigNumber from 'bignumber.js';

import { convertFromAPIPercentageOdds, ISportX, convertToAPIPercentageOdds, Environments, newSportX, convertToTrueTokenAmount, IGetTradesRequest, IDetailedRelayerMakerOrder, convertToTakerPayAmount } from "@sx-bet/sportx-js";
import * as ably from "ably";
import { stringify } from 'querystring';

const BET_STAKE = "500000000";
const USDC_BASE_TOKEN = "0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e";
const HIDE_BETS_BELOW = 500;

// Load the environment variables from .env file
dotenv.config({ path: '.env' });

// Load the nameTags module
const nameTags = require('./nameTags');


// Convert the nameTags hash map to lowercase
const nameTagsLowerCase = nameTags;
for (const key in nameTags) {
  if (nameTags.hasOwnProperty(key)) {
    nameTagsLowerCase[key.toLowerCase()] = nameTags[key];
  }
}

let discordClient: Client;


// setup Discord client
const setupDiscordClient = async (token: string | undefined) => {
  if (!token) {
    console.error("Discord token is not provided.");
    return;
  }
  discordClient = new Client({
    intents: [GatewayIntentBits.Guilds]
  });
  
  discordClient.on("ready", async () => {
    if (discordClient.user) {
      console.log(`Logged into Discord as ${discordClient.user.tag}!`);
    } else {
      console.error("Failed to get user information.");
      return;
    }
  });
  
  await discordClient.login(token)
    .then(() => {
      console.log("Login successful.");
    })
    .catch((error) => {
      console.error("Failed to log in:");
      console.error(error);
    });
};

// send a message to a specified Discord channel
const sendDiscordMessage = async (channelId: string, message: string) => {
  const discordChannel = discordClient.channels.cache.get(channelId) as TextChannel;
  discordChannel.send(message)
    .then(() => {
      console.log("Message sent successfully.");
    })
    .catch((error) => {
      console.error("Failed to send message:");
      console.error(error);
    });
};

// get a market with the specified hash
const getMarket = async (hash: string, sportX: ISportX) => {
  const markets = await sportX.marketLookup([hash]);
  return markets;
};

let makersMessage: ably.Types.Message;
let orderHash: ably.Types.Message;


const getMaker = async (marketHash: string, fillHash: string, orderHash: string, sportX: ISportX) => {
  var mrktHash = [marketHash]; 
  // GET MAKER HERE
  var tradeRequest: IGetTradesRequest = {
    marketHashes: mrktHash,
    maker: true,
  };

  //console.log("tradereq", tradeRequest);
  //Need to look through every page when doing getTrades
  var unsettledTrades = await sportX.getTrades(tradeRequest);
  //console.log("UNSETTLEDTRADES", unsettledTrades);
  console.log("MSG data:" , unsettledTrades.trades[0]);
  const desiredFillHash = fillHash;

  //Find maker here...
  var maker = "0x0000000000000000000000000000";
  //console.log("Unsttled trades", unsettledTrades);
  console.log("Desired Hash", desiredFillHash);

console.log("Next Key:", unsettledTrades.nextKey);
  while(unsettledTrades.nextKey!=undefined)

  {
   // console.log("Now iterating thru:", unsettledTrades);
    console.log("next key:", unsettledTrades.nextKey);

    unsettledTrades.trades.forEach((element, index) => {
      if(element.fillHash === desiredFillHash && element.orderHash === orderHash && element.maker === true && element.tradeStatus === "SUCCESS"){
        console.log("found elemnt");
        maker = element.bettor;
        return(maker);
      } 
    });  

    var tradeRequest: IGetTradesRequest = {
      marketHashes: mrktHash,
      maker: true,
      paginationKey: unsettledTrades.nextKey
    };
    unsettledTrades = await sportX.getTrades(tradeRequest);  
  }

  return(maker);
}



let marketMaker;
async function main() {

  const sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY,
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

    realtime.connection.on("connected", () => {
      resolve();
      if(!logicExecuted) {
        // Listen for realtime trades
        const sxChannel = realtime.channels.get(`recent_trades`);
        console.log("Listening for Trades @ ", helperFunctions.printTime());
        sxChannel.subscribe(async (message) => {
          //console.log("MESSAGE", message);



          if (message.data.tradeStatus === "PENDING" &&
              message.data.betTimeValue > HIDE_BETS_BELOW &&
              message.data.maker === false &&
              //modify below so the addresses are in arrays and i use .cointain() or something 
              // 2 arrays whitelist (good traders), blacklist(noobs 2 fade)
              (message.data.bettor === "0x24357454D8d1a0Cc93a6C25fD490467372bC2454" || //
              message.data.bettor === "0x2b231FE033593ea99d3d6983BA8B2Aa74eD905c8" ||  //
              message.data.bettor === "0x43328E4e8FEe5A76D50055B23830C4f13e8bDF5D" ||  //
              message.data.bettor === "0x74CfAE7b1b76Ea063Dd9B63B4FA9d16DA31e0626" ||  //
              message.data.bettor === "0xEaDa5F319B93fB9E5140ba34fd536b9134dcA304" ||  //
              message.data.bettor === "0xDEf91d30dA9B50d8CB8d42b09111F822Da173C99" ||  //
              message.data.bettor === "0x05e39710CB6b7aD5264Bc68Ae6efF298e7F21988" ||  //
              message.data.bettor === "0x631B34CF9f08615a8653B2438A881FE38211DAb4" ||  //

              message.data.bettor === "0x449472f3d7e02109b0c616b56650fef42a12d634"     //
              
              )
            ) {
              console.log(message.data);
            
              //Duplicate this but inreverse so it is betting against the worst bettors
              var isMakerOutcomeOne: boolean;
              if(message.data.bettingOutcomeOne) {
                isMakerOutcomeOne = false;
              } else {
                isMakerOutcomeOne = true;
              }
              
              

              const convertedOdds = convertFromAPIPercentageOdds(message.data.odds);

              console.log("Converted Odds:", convertedOdds);
              const acceptableOddsTarget = convertedOdds * (1-0.02);
              console.log("Target Odds (2% below):", acceptableOddsTarget);
              const requiredMakerOdds = 1 - acceptableOddsTarget;
              console.log("Required Maker Odds:", requiredMakerOdds);
              const requiredMakerOddsApi = convertToAPIPercentageOdds(requiredMakerOdds).toString();

              const orders = await sportX.getOrders([
               message.data.marketHash,
              ]);
              const targetOrders: IDetailedRelayerMakerOrder[] = [];
              orders.forEach(order => {
               // console.log(`Base toke ${order.baseToken} + USDC: ${USDC_BASE_TOKEN}`);
               // console.log(`Order odds ${order.percentageOdds} < ${parseInt(requiredMakerOddsApi)}`);

                if(order.baseToken === USDC_BASE_TOKEN &&
                  parseInt(order.percentageOdds) < parseInt(requiredMakerOddsApi) &&
                  order.isMakerBettingOutcomeOne === isMakerOutcomeOne
                  ){
                    targetOrders.push(order);
                }
              });
              if(targetOrders != undefined && targetOrders != null && targetOrders.length != 0){

              var bestPricedHash: string = targetOrders[0].orderHash;
              //console.log("Best Priced Hash", bestPricedHash)
              var priceOfBestHash: number = parseInt(targetOrders[0].percentageOdds);
              //console.log("Price of Best Hash", priceOfBestHash)
              
              var bestOrder = targetOrders[0];
              

              targetOrders.forEach(order => {
                if(parseInt(order.percentageOdds) < priceOfBestHash && order.maker != "0x92A19377DaEA520f7Ae43F412739D8AA439f16e6"){
                  bestPricedHash = order.orderHash;
                  priceOfBestHash = parseInt(order.percentageOdds);
                  bestOrder = order;
                }
              });
              if(bestOrder != undefined && bestOrder != null){
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
                const fillAmounts = [
                  BET_STAKE
                  //convertToTrueTokenAmount(BET_STAKE, USDC_BASE_TOKEN)
                  
                ];  
                try {
                  const result = await sportX.fillOrders(finalOrder, fillAmounts);
                  sendDiscordMessage('913719533007675425', "CopyBot Filled an Order");
                  sendDiscordMessage('913719533007675425', JSON.stringify(result));
                  console.log(result)

                } catch (error) {
                  sendDiscordMessage('913719533007675425', "CopyBot Error filling an Order");
                  sendDiscordMessage('913719533007675425', JSON.stringify(error));


                }          

              }
            }
            console.log("finish loop, listening for next noob to snipe");
              //console.log("Best Priced Hash", bestPricedHash)
              //console.log("Price of Best Hash", priceOfBestHash)

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
setupDiscordClient(process.env.DISCORD_TOKEN);
main();
