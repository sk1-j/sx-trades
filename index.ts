import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';
import { Client, Channel, TextChannel, GatewayIntentBits } from "discord.js";

// Load the environment variables from .env file
dotenv.config({ path: '.env' });

import { convertFromAPIPercentageOdds, Environments, newSportX } from "@sx-bet/sportx-js";
import {
  convertToAPIPercentageOdds,
  convertToTrueTokenAmount
} from "@sx-bet/sportx-js";
import * as ably from "ably";
console.log("Hello...");

let discordClient: Client;

const setupDiscordClient = async (token: string | undefined) => {
  if (!token) {
    console.error("Discord token is not provided.");
    return;
  }
  // Create a new Discord client
  discordClient = new Client({
    intents: [GatewayIntentBits.Guilds]
  });
  
  // Event listener that is triggered when the client is ready
  discordClient.on("ready", async () => {
    // Check if the user information is available
    if (discordClient.user) {
      console.log(`Logged into Discord as ${discordClient.user.tag}!`);
    } else {
      console.error("Failed to get user information.");
      return;
    }
  });
  
  // Login to the Discord client
  await discordClient.login(token)
    .then(() => {
      console.log("Login successful.");
    })
    .catch((error) => {
      console.error("Failed to log in:");
      console.error(error);
    });
};

const sendDiscordMessage = async (channelId: string, message: string) => {
  // Get the specified Discord channel
  const discordChannel = discordClient.channels.cache.get(channelId) as TextChannel;
  // Send the message to the channel
  discordChannel.send(message)
    .then(() => {
      console.log("Message sent successfully.");
    })
    .catch((error) => {
      console.error("Failed to send message:");
      console.error(error);
    });
};


// Load the nameTags module
const nameTags = require('./nameTags');

// Convert the nameTags hash map to lowercase
const nameTagsLowerCase = nameTags;
for (const key in nameTags) {
  if (nameTags.hasOwnProperty(key)) {
    nameTagsLowerCase[key.toLowerCase()] = nameTags[key];
  }
}

// Initialize the SportX library
async function initialize() {
  var sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });
  return (sportX);
}

async function getMarket(hash: string) {
  var sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROsVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });
  //Lookup market with hash
  const markets = await sportX.marketLookup([
    hash,
  ]);
  return(markets);
}

async function main() {
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
        if (message.data.tradeStatus === "SUCCESS" &&
            message.data.status === "SUCCESS" &&
            message.data.betTimeValue > 100 &&
            message.data.maker === false 
        ) {

          // Get market details 
          console.log("Before get market: ", helperFunctions.printTime());
          var mrkt = await getMarket(message.data.marketHash);
          console.log("After get market: ", helperFunctions.printTime());

          // Get current datetime
          var timeOfBet = helperFunctions.printTime();

           // Initialize variables
          let username;
          let event
          var takersBet;
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
            discordMessage = helperFunctions.compileDiscordMessage(event, takersBet, dollarStake, decimalOdds, takerAddress, username);
          } else {
            discordMessage = helperFunctions.compileDiscordMessage(event, takersBet, dollarStake, decimalOdds, takerAddress);
          }

          //Print discord message to console
          console.log(discordMessage);

          //Send discord message to Channel
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
