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

const sendDiscordMessage = async (token: string | undefined, channelId: string, message: string) => {
  if (!token) {
    console.error("Discord token is not provided.");
    return;
  }
  // Create a new Discord client
  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });
  
  // Event listener that is triggered when the client is ready
  client.on("ready", async () => {
    // Check if the user information is available
    if (client.user) {
      console.log(`Logged in as ${client.user.tag}!`);
    } else {
      console.error("Failed to get user information.");
      return;
    }
  
    // Get the specified Discord channel
    const discordChannel = client.channels.cache.get(channelId) as TextChannel;
    // Send the message to the channel
    discordChannel.send(message)
      .then(() => {
        console.log("Message sent successfully.");
      })
      .catch((error) => {
        console.error("Failed to send message:");
        console.error(error);
      });
  });
  
  // Login to the Discord client
  await client.login(token)
    .then(() => {
      console.log("Login successful.");
    })
    .catch((error) => {
      console.error("Failed to log in:");
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
  const realtime = new ably.Realtime.Promise({
    authUrl: `https://api.sx.bet/user/token`,
  });
  await new Promise<void>((resolve, reject) => {
    console.log("Connecting...");

    realtime.connection.on("connected", () => {
      resolve();
      
      // Listen for realtime trades
      const sxChannel = realtime.channels.get(`recent_trades`);
      sxChannel.subscribe(async (message) => {
        //Post the purchase order, only when successful

        if (message.data.tradeStatus=="SUCCESS"&&message.data.status=="SUCCESS"&&message.data.maker==false){
          var mrkt = await getMarket(message.data.marketHash);


          //sendDiscordMessage(process.env.DISCORD_TOKEN, '913719533007675425', 'This is a test message from my Discord bot!');

          console.log("************************************");
          //Get and print the current datetime
          var timeOfBet = helperFunctions.printTime();

          var username;
          var event
          var takersBet;
          var outcomeOne = mrkt[0].outcomeOneName;
          var outcomeTwo = mrkt[0].outcomeTwoName;
          var dollarStake = message.data.betTimeValue;
          var decimalOdds = 1/(message.data.odds/100000000000000000000);
          var takerAddress = message.data.bettor;
          //var makerAddress = message.data.maker;

          var discordMessage;



//BUG HERE
//IF it is a Totals market is will show "Under X vs Over X: OveX"
//Change so that is shows PlayerA vs PlayerB: Under X
          if(mrkt.length!=0){
            // Print Event
            event = mrkt[0].teamOneName + " vs " + mrkt[0].teamTwoName;
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
          sendDiscordMessage(process.env.DISCORD_TOKEN, '913719533007675425', discordMessage);


          }

      });
    });
    // 10s timeout to connect
    setTimeout(() => reject(), 10000);
    console.log("Connected.");
  });

}

initialize();
main();
