// myHashMap.ts

import fs from 'fs';

interface MyHashMap {
  [key: string]: string;
}

let myHashMap: MyHashMap = {

};

function writeHashMapToFile(): void {
  fs.writeFileSync('myHashMap.json', JSON.stringify(myHashMap));
}

export function updateHashMap(key: string, value: string): void {
  myHashMap[key] = value;
  writeHashMapToFile();
}

export function addNewEntry(key: string, value: string): void {
  myHashMap = {
    ...myHashMap,
    [key]: value,
  };
  writeHashMapToFile();
}

export function getHashMap(): MyHashMap {
  return myHashMap;
}