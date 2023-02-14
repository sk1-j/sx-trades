import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';
import { Client, TextChannel, GatewayIntentBits } from "discord.js";
import { convertFromAPIPercentageOdds, ISportX, convertToAPIPercentageOdds, Environments, newSportX, convertToTrueTokenAmount, IGetTradesRequest, ITrade } from "@sx-bet/sportx-js";
import * as ably from "ably";

// Load the environment variables from .env file
dotenv.config({ path: '.env' });

// Load the nameTags module


let discordClient: Client;

const hideBetsBellow = 1;


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

  //Look through all pages of orders to find the right item
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
  



  
  var tradeRequest: IGetTradesRequest = {
   bettor: "",
    settled: true,
//    paginationKey: "63e7676b9a297511f39d21cb",
  };

  const searchedPages: string[] = [];

  const allTrades: ITrade[] = [];





  //console.log("tradereq", tradeRequest);
  //Need to look through every page when doing getTrades
  var firstPage = await sportX.getTrades(tradeRequest);
  var profit = 0;
  
  firstPage.trades.forEach((trade, index) => {
    allTrades.push(trade);
  });


  var firstPaginationKey = firstPage.nextKey;

  tradeRequest.paginationKey = firstPage.nextKey;
  var pageinationKey = '';

  while(firstPaginationKey != pageinationKey){
    firstPage = await sportX.getTrades(tradeRequest);
    tradeRequest.paginationKey = firstPage.nextKey;
    pageinationKey = firstPage.nextKey;
    if(firstPage.nextKey != firstPaginationKey)
    {
      firstPage.trades.forEach((trade, index) => {
        allTrades.push(trade);
      });
    }
  }







  console.log(allTrades);



  allTrades.forEach((trade, index) => {
    
    var decimalOdds = helperFunctions.apiToDecimalOdds(trade.odds);
    console.log(`{${index}: Outcome ${trade.outcome}, Betting Outcomeone: ${trade.bettingOutcomeOne}`);


    if((trade.outcome === 2 && trade.bettingOutcomeOne===false) || (trade.outcome === 1 && trade.bettingOutcomeOne===true))   {
      profit = profit + (trade.betTimeValue * (decimalOdds-1))  
    } else if (trade.outcome === 0){

    } else {
      profit = profit - trade.betTimeValue;
    }
    console.log("prfoit: ", profit);
    allTrades.push(trade);

  });  

  //console.log("Enter Main: ", unsettledTrades);
  // Create a new instance of Ably realtime


}
setupDiscordClient(process.env.DISCORD_TOKEN);
main();
