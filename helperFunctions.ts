//Get and print the current datetime
export function printTime() {
  var currentDate = new Date();
  console.log("\n"+currentDate.toLocaleString());  
}

export function printMarketDetails(event: string, isMakerTeamOne: boolean, outcomeOne: string, outcomeTwo: string, stake: number, odds: number, address: string ){

}

export function takersSelection(isMakerTeamOne: boolean, outcomeOne: string, outcomeTwo: string){
  var takersSide;

  if(isMakerTeamOne === true){
    //Then taker is betting on Outcome 2
    takersSide = outcomeTwo;
  } else if (isMakerTeamOne === false) {
    //Then taker is betting on Outcome 1
    takersSide = outcomeTwo;
  } else {
    "Error finding takers side of the bet"
  } 
  return takersSide;
}