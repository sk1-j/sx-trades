import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';
import { Client, Channel, TextChannel, GatewayIntentBits } from "discord.js";

dotenv.config({ path: '.env' });

import { Environments, newSportX } from "@sx-bet/sportx-js";
import {
	convertToAPIPercentageOdds,
	convertToTrueTokenAmount
  } from "@sx-bet/sportx-js";
import * as ably from "ably";
console.log("Hello...");

/// New disc int

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
    //const channel = client.channels.cache.get("967808235048423484");
    //console.log(channel);
  
  } else {
    console.error("Failed to get user information.");
  }

  // Replace "CHANNEL_ID" with the ID of the channel you want to send the message in
   const discordChannel = client.channels.cache.get('913719533007675425') as TextChannel;




  discordChannel.send("This is a test message from my Discord bot!")
    .then(() => {
      console.log("Test message sent successfully.");
      initialize();
      main();
    })
    .catch((error) => {
      console.error("Failed to send test message:");
      console.error(error);
    });
    console.log("Send Break1.");
});
console.log("Send Break2.");


client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log("Login successful.");
    console.log(client);
  })
  .catch((error) => {
    console.error("Failed to log in:");
    console.error(error);
  });





  

const nameTags = require('./nameTags');

//Convert nameTags Hash Map to lowercase
const nameTagsLowerCase = nameTags;
for (const key in nameTags) {
  if (nameTags.hasOwnProperty(key)) {
    nameTagsLowerCase[key.toLowerCase()] = nameTags[key];
  }
}



async function initialize() {  
  var sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });
  return(sportX);
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

          console.log("************************************");
          //Get and print the current datetime
          helperFunctions.printTime();

          // Check if the bettor is known address
          //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
          
          // Some error here, not printing all usernames..
          // the issue is due to case-sensitive matching with hasOwnProperty [FIXED]



          if(helperFunctions.hasOwnPropertyIgnoreCase(nameTags, message.data.bettor)){
            console.log("Username: " + nameTagsLowerCase[message.data.bettor.toLowerCase()])
          } else {
            console.log("Username not found or User unknown");
          }

          if(mrkt.length!=0){
            // Print Event
            console.log("Event: " + mrkt[0].outcomeOneName + " vs " + mrkt[0].outcomeTwoName);
            
            //Print takers side of the bet
            console.log(helperFunctions.takersSelection(message.data.bettingOutcomeOne,mrkt[0].outcomeOneName,mrkt[0].outcomeTwoName))

         } else {
            console.log("Error retrieving market details");
         }
          //Output bet details
          console.log("Stake: $" + message.data.betTimeValue + 
                      "\nDecimal Odds: "+ 1/(message.data.odds/100000000000000000000));
          console.log("Bettor Address: " + message.data.bettor);
          }
      });
    });
    // 10s timeout to connect
    setTimeout(() => reject(), 10000);
    console.log("Connected.");
  });
}


