import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';
import { Client, Channel, TextChannel, GatewayIntentBits } from "discord.js";

// Load the environment variables from .env file
dotenv.config({ path: '.env' });

import { Environments, newSportX } from "@sx-bet/sportx-js";
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
      console.log(`Logged in as ${discordClient.user.tag}!`);
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
      sxChannel.subscribe(async (message) => {
        if (message.data.tradeStatus === "SUCCESS" &&
            message.data.status === "SUCCESS" &&
            message.data.maker === false
        ) {
          // Get market details
          var mrkt = await getMarket(message.data.marketHash);

          console.log("************************************");
          // Get current datetime
          var timeOfBet = helperFunctions.printTime();

           // Initialize variables
          let username;
          let event
          var takersBet;
          var outcomeOne = mrkt[0].outcomeOneName;
          var outcomeTwo = mrkt[0].outcomeTwoName;
          var dollarStake = message.data.betTimeValue;
          message.data.be
          var decimalOdds = 1/(message.data.odds/100000000000000000000);
          var takerAddress = message.data.bettor;
          //var makerAddress = message.data.maker;

          let discordMessage;

          console.log("Market deets", mrkt);
          console.log("Order deets", message.data);


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
          //Output bet details
          console.log("Stake: $" + dollarStake + 
                      "\nDecimal Odds: "+ decimalOdds);
          console.log("Bettor Address: " + takerAddress);


                    // Check if the bettor is known address
          //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
          if(helperFunctions.hasOwnPropertyIgnoreCase(nameTags, message.data.bettor)){
            username = nameTagsLowerCase[message.data.bettor.toLowerCase()]
            discordMessage = `\nUser: ${username}\n__**${event}**__\n**${takersBet}**\nStake: $${dollarStake}\nOdds: ${decimalOdds}\nTaker Address: ${takerAddress}\n💸💸💸💸💸💸💸💸💸💸💸💸💸💸`;

          } else {
            discordMessage = `\n__**${event}**__\n**${takersBet}**\nStake: $${dollarStake}\nOdds: ${decimalOdds}\nTaker: ${takerAddress}\n💸💸💸💸💸💸💸💸💸💸💸💸💸💸`;
          }
          console.log("Username: " + username)



          console.log(discordMessage);
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
