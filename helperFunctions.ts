import { convertFromAPIPercentageOdds, IGetTradesRequest, ITrade, ITradesResponse } from "@sx-bet/sportx-js";
import Web3 from "web3";


// Function to print the current date and time to the console
export function printTime() {
  // Get the current date
  const currentDate = new Date();

  // Print the date and time in a locale-specific format
  console.log("\n" + currentDate.toLocaleString());  

  // Return the current date
  return currentDate.toLocaleString();
}

// Function to print details about a betting market
export function printMarketDetails(
  event: string,
  isMakerTeamOne: boolean,
  outcomeOne: string,
  outcomeTwo: string,
  stake: number,
  odds: number,
  address: string
) {}

// Function to determine the taker's selected outcome
export function takersSelection(isMakerTeamOne: boolean, outcomeOne: string, outcomeTwo: string) {
  let takersSide;

  if (isMakerTeamOne) {
    // Taker is betting on Outcome 2
    takersSide = outcomeOne;
  } else if (!isMakerTeamOne) {
    // Taker is betting on Outcome 1
    takersSide = outcomeTwo;
  } else {
    // Error finding taker's side of the bet
    "Error finding taker's side of the bet";
  } 

  // Return the taker's selected outcome
  return takersSide;
}

// Function to check if an object has a property, ignoring case sensitivity
export function hasOwnPropertyIgnoreCase(obj: any, prop: string): boolean {
  // Convert the property name to lowercase
  prop = prop.toLowerCase();

  // Loop through the object properties
  for (const key in obj) {
    // Check if the lowercase version of the property name matches the desired property
    if (key.toLowerCase() === prop) {
      // The property exists, return true
      return true;
    }
  }

  // The property does not exist, return false
  return false;
}

// Function to convert API odds to decimal odds
export function apiToDecimalOdds(num: string) {
  // Calculate the decimal odds
  const decimalOdds = 1 / convertFromAPIPercentageOdds(num);

  // Round the decimal odds to 3 decimal places and return the result
  return parseFloat(decimalOdds.toFixed(3));
}

// Function to compile a Discord message
export function compileDiscordMessage(
  match: string | undefined,
  takersBet: string | undefined,
  stake: string,
  odds: number,
  taker: string,
  marketMaker: string,
  sport: string | undefined,
  league: string | undefined,
  user: string,
  marketMakerUsername: string
) {
  marketMaker = shortenEthAddress(marketMaker, 5);
  if (user === "" && marketMakerUsername === "") {
    console.log("option 1");

    // Generate the message without the username or taker username
    return `\n💠 ${taker} bet $${stake} on ${takersBet} @ ${odds}\n${match}\n${sport}: ${league}\nMaker: ${marketMaker}\n`;
  //Generate message if taker username not found
  } else if(user === "") {
    console.log("option 2");

    return `\n💠 ${taker} bet $${stake} on ${takersBet} @ ${odds}\n${match}\n${sport}: ${league}\nMaker: ${marketMakerUsername}\n`;

    // Generate the message with the username
    //return `\n**${match}**\n${takersBet}\n$${stake} @ ${odds}\n${user}\n${taker}`;

  //Generate message if maker username not found
  } else if(marketMakerUsername === "") {
    console.log("option 3");

    return `\n💠 ${user} bet $${stake} on ${takersBet} @ ${odds}\n${match}\n${sport}: ${league}\nMaker: ${marketMaker}\n`;

  } else {
    console.log("option 4");
    return `\n💠 ${user} bet $${stake} on ${takersBet} @ ${odds}\n${match}\n${sport}: ${league}\nMaker: ${marketMakerUsername}\n`;

  }
}
``
export function shortenEthAddress(address: string, digits = 4): string {
  return `${address.slice(0, digits + 2)}...${address.slice(-digits)}`;
}


//dont really need this, cant reverse lookup  by addr
export async function getAddressFromENS(web3: Web3, ethereumAddress: string){
  const Web3 = require("web3");
  try {
    const ensAddress = await Web3.eth.ens.getAddress(ethereumAddress);
    console.log("The owner of the ENS name is: ", ensAddress);
    return ensAddress;
  } catch (error) {
    console.error("An error occurred: ", error);
    return null;
  }
}


