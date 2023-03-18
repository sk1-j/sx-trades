import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';
import { Client, TextChannel, GatewayIntentBits } from "discord.js";
import { convertFromAPIPercentageOdds, ISportX, convertToAPIPercentageOdds, Environments, newSportX, convertToTrueTokenAmount, IGetTradesRequest } from "@sx-bet/sportx-js";
import * as ably from "ably";

// Load the environment variables from .env file
dotenv.config({ path: '.env' });

// Load the nameTags module
const nameTags = require('./nameTags');
const oppOne = "0x7c00c9f0e7aed440c0c730a9bd9ee4f49de20d5c".toLowerCase(); //kryptonik
const oppTwo = "".toLowerCase(); 



// Convert the nameTags hash map to lowercase
const nameTagsLowerCase = nameTags;
for (const key in nameTags) {
  if (nameTags.hasOwnProperty(key)) {
    nameTagsLowerCase[key.toLowerCase()] = nameTags[key];
  }
}


const hideBetsBellow = 1;


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



          if ((message.data.status === "SUCCESS" && message.data.bettor.toLowerCase() === "0x886e9553f0A770e1874c584fa75D4942e3B2D489".toLowerCase()) || //if copybot1
              (message.data.status === "SUCCESS" && message.data.bettor.toLowerCase() === "0x1eBeC5952c4439e356bFb04e5c744670D3E67099".toLowerCase()) || //if copybot2
              (message.data.status === "SUCCESS" && message.data.bettor.toLowerCase() === oppOne) || 
              (message.data.status === "SUCCESS" && message.data.bettor.toLowerCase() === oppTwo) 
         //if d4
          ) {


            // Get market details 
            console.log("Before get market: ", helperFunctions.printTime());
            var mrkt = await getMarket(message.data.marketHash,sportX);
            console.log("After get market: ", helperFunctions.printTime());

            // Get current datetime
            var timeOfBet = helperFunctions.printTime();

            // Initialize variables
            let username;
            let usernameMaker;
            let event
            var takersBet;
            let sport;
            let league;
            let marketMaker: any;
            var outcomeOne = mrkt[0].outcomeOneName;
            var outcomeTwo = mrkt[0].outcomeTwoName;
            var dollarStake = message.data.betTimeValue.toFixed(2);
            var decimalOdds = helperFunctions.apiToDecimalOdds(message.data.odds);
            var takerAddress = helperFunctions.shortenEthAddress(message.data.bettor, 5);
            //var makerAddress = message.data.maker;
  
            let discordMessage;


            marketMaker = await getMaker(message.data.marketHash, message.data.fillHash,message.data.orderHash,sportX);
            
            console.log("maker: ", marketMaker);
            // Check if the market has details
            if(mrkt.length!=0){

              var teamOne = mrkt[0].teamOneName;
              var teamTwo = mrkt[0].teamTwoName;
              league = mrkt[0].leagueLabel;
              sport = mrkt[0].sportLabel;

              // Print Event
              event = teamOne + " vs " + teamTwo;
              console.log("Event: " + event);
              
              //Print takers side of the bet
              takersBet = helperFunctions.takersSelection(message.data.bettingOutcomeOne,outcomeOne,outcomeTwo)
              console.log(takersBet);

            } else {
                console.log("Error retrieving market details");
            }



            // Check if the bettor is known address
            //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
            if(helperFunctions.hasOwnPropertyIgnoreCase(nameTags, message.data.bettor)){
              username = nameTagsLowerCase[message.data.bettor.toLowerCase()]
            } else {
              username = "";
            }
            // Check if the maker is known address
            //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
            if(helperFunctions.hasOwnPropertyIgnoreCase(nameTags, marketMaker)){
              usernameMaker = nameTagsLowerCase[marketMaker.toLowerCase()];
              if(usernameMaker==="CSP"){
                usernameMaker = "<@281233046227779585>";
              }
              if(usernameMaker==="SK1"){
                usernameMaker = "<@418940152778457099>";
              }

            } else {
              usernameMaker = "";
            }
              if(dollarStake > hideBetsBellow || usernameMaker === '<@281233046227779585>' || usernameMaker ===  '<@418940152778457099>' || username ==='CopyBot2'){
                discordMessage = helperFunctions.compileDiscordMessage(event, takersBet, dollarStake, decimalOdds, takerAddress, marketMaker, sport, league, username, usernameMaker);
                //Print discord message to console
                console.log(discordMessage);

                //Send discord message to Channel
              //Send to CSP
              //helperFunctions.sendDiscordMessage('783878646142205962', discordMessage);
                // Send to private
                //helperFunctions.sendDiscordMessage('913719533007675425', discordMessage);
                //send to my discord tournament channel
                helperFunctions.sendDiscordMessage('1086558962742218812', discordMessage);

                
              }
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
