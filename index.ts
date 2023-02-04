import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';
import { Client, TextChannel, GatewayIntentBits } from "discord.js";
import { convertFromAPIPercentageOdds, convertToAPIPercentageOdds, Environments, newSportX, convertToTrueTokenAmount, IGetTradesRequest } from "@sx-bet/sportx-js";
import * as ably from "ably";

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

// initialize the SportX library
const initializeSportX = async () => {
  return await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });
};

// get a market with the specified hash
const getMarket = async (hash: string) => {
  const sportX = await initializeSportX();
  const markets = await sportX.marketLookup([hash]);
  return markets;
};

let makersMessage: ably.Types.Message;
let orderHash: ably.Types.Message;



// Initialize the SportX library
async function initialize() {

  var sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });
  return (sportX);
}

async function main() {

  var sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });
console.log("HERE");





//helperFunctions.searchByOrderHashAndReturnDifferentMaker(unsettledTrades, '0x0fd038aff08b4f405b713e987ce142512e6e7ffa0aa6c40767cb7ca7410a3f46', '0x631B34CF9f08615a8653B2438A881FE38211DAb4');


  
  var marketMaker;
  console.log("Enter Main: ", helperFunctions.printTime());
  // Create a new instance of Ably realtime
  const realtime = new ably.Realtime.Promise({
    authUrl: `https://api.sx.bet/user/token`,
  });


  // Wait for connection to be established
  await new Promise<void>((resolve, reject) => {
    console.log("Connecting...");

    realtime.connection.on("connected", () => {
      resolve();
      
      // Listen for realtime trades
      const sxChannel = realtime.channels.get(`recent_trades`);
      console.log("Listening for Trades @ ", helperFunctions.printTime());
      sxChannel.subscribe(async (message) => {
        console.log("MSG DATA", message.data);
        console.log("END OF MSG DATA");


        
        if (message.data.tradeStatus === "SUCCESS" &&
            message.data.status === "SUCCESS" &&
            message.data.betTimeValue > hideBetsBellow &&
            message.data.maker === false
        ) {
          var mrktHash = [message.data.marketHash]; 
          
          
          // GET MAKER HERE
          const tradeRequest: IGetTradesRequest = {
            marketHashes: mrktHash,
            maker: true,
          };

          var sportX = await newSportX({
            env: Environments.SxMainnet,
            customSidechainProviderUrl: process.env.PROVIDER,
            privateKey: process.env.PRIVATE_KEY,
          });
          console.log("tradereq", tradeRequest);
          var unsettledTrades = await sportX.getTrades(tradeRequest);

         

          console.log("MSG data:" , unsettledTrades.trades[0]);
          const desiredFillHash = message.data.fillHash;

          //Find maker here...
          var maker = "0x00000000000000000000000000";
          console.log("Unsttled trades", unsettledTrades);

          console.log("Desired Hash", desiredFillHash);


          unsettledTrades.trades.forEach((element, index) => {
            console.log("Desired Hash:  ", desiredFillHash);
            console.log("Real Hash: ", element.fillHash);
            console.log("Maker Value: ", element.maker);


            if(element.fillHash === desiredFillHash && element.maker === true){
              maker = element.bettor
              console.log("This is the element", element)
            } 
            //console.log("Fill Hash" + index + " = " + element.fillHash);
          });
          
          console.log("Maker is:", maker);




          // Get market details 
          console.log("Before get market: ", helperFunctions.printTime());
          var mrkt = await getMarket(message.data.marketHash);
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
           let marketMaker;
           var outcomeOne = mrkt[0].outcomeOneName;
           var outcomeTwo = mrkt[0].outcomeTwoName;
           var dollarStake = message.data.betTimeValue.toFixed(2);
           var decimalOdds = helperFunctions.apiToDecimalOdds(message.data.odds);
           var takerAddress = helperFunctions.shortenEthAddress(message.data.bettor, 5);
           //var makerAddress = message.data.maker;
 
           let discordMessage;

          
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
          if(helperFunctions.hasOwnPropertyIgnoreCase(nameTags, maker)){
            usernameMaker = nameTagsLowerCase[maker.toLowerCase()];

          } else {
            usernameMaker = "";
          }
          discordMessage = helperFunctions.compileDiscordMessage(event, takersBet, dollarStake, decimalOdds, takerAddress, maker, sport, league, username, usernameMaker);


          //Print discord message to console
          console.log(discordMessage);

          //Send discord message to Channel
         //Send to CSP
          //sendDiscordMessage('783878646142205962', discordMessage);
          // Send to private
          sendDiscordMessage('913719533007675425', discordMessage);
          }
      });
    });
    // 10s timeout to connect
    setTimeout(() => reject(), 10000);
    console.log("Connected.");
  });

}
setupDiscordClient(process.env.DISCORD_TOKEN);
initialize();
main();
