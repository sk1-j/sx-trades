import * as dotenv from 'dotenv';
import * as helperFunctions from './helperFunctions';


dotenv.config({ path: '.env' });

import { Environments, newSportX } from "@sx-bet/sportx-js";
import {
	convertToAPIPercentageOdds,
	convertToTrueTokenAmount
  } from "@sx-bet/sportx-js";
import * as ably from "ably";


const nameTags = require('./nameTags');



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
      const channel = realtime.channels.get(`recent_trades`);
      channel.subscribe(async (message) => {
        //Post the purchase order, only when successful

        if (message.data.tradeStatus=="SUCCESS"&&message.data.status=="SUCCESS"&&message.data.maker==false){
          var mrkt = await getMarket(message.data.marketHash);

          console.log("************************************");
          //Get and print the current datetime
          helperFunctions.printTime();

          // Check if the bettor is known address
          //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
          
          // Some error here, not printing all usernames..
          // the issue is due to case-sensitive matching with hasOwnProperty

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

initialize();
main();


