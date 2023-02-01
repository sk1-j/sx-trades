
const nameTags = require('./nameTags');
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import { Environments, newSportX } from "@sx-bet/sportx-js";
import {
	convertToAPIPercentageOdds,
	convertToTrueTokenAmount
  } from "@sx-bet/sportx-js";
import * as ably from "ably";


async function initialize() {  
  var sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });

}

async function getMarket(hash: string) {
  var sportX = await newSportX({
    env: Environments.SxMainnet,
    customSidechainProviderUrl: process.env.PROsVIDER,
    privateKey: process.env.PRIVATE_KEY,
  });

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
          var currentDate = new Date();
          console.log("\n"+currentDate.toLocaleString());

          // Check if the bettor is known address
          //Checks if an address is doxxed by looking up the bettor address against known address in nameTags.js
          var doxxedAddress = nameTags.hasOwnProperty(message.data.bettor);
          if(doxxedAddress){
            console.log("Username: " + nameTags[message.data.bettor])
          }

          if(mrkt.length!=0){
            // Print Event
            console.log("Event: " + mrkt[0].outcomeOneName + " vs " + mrkt[0].outcomeTwoName);
            
            if(message.data.bettingOutcomeOne === true){
              console.log("Selection: " + mrkt[0].outcomeOneName);
            } 
            if(message.data.bettingOutcomeOne === false){
              console.log("Selection: " + mrkt[0].outcomeTwoName);
            } 
         } else {
            console.log("Error retrieving market details");
         }
          //Output bet details
          //TODO query market with market hash to get better details (which side teams etc)
          console.log("Stake: $" + message.data.betTimeValue + 
                      "\nDecimal Odds: "+ 1/(message.data.odds/100000000000000000000));
          //console.log(message.data);
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


