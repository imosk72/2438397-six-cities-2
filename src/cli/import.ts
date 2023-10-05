import {Offer} from "../models/offer";

import fs from "node:fs/promises";
import { EOL } from "node:os";
import { resolve } from "node:path";

const KEYS = [
  "title",
  "description",
  "date",
  "city",
  "preview",
  "images",
  "isPremium",
  "isFavourite",
  "rating",
  "housingType",
  "roomCount",
  "guestCount",
  "cost",
  "facilities",
  "author",
  "commentsCount",
  "coordinates",
];

function printHelp(options: string) {
  if (options === "--help") {
    console.log("NAME:\n    \"import\" - Imports data from TSV-file\n");
    console.log("USAGE:\n    cli.js --import path\n");
    console.log("ARGUMENTS:\n");
    console.log("    path - The path to the file from which you want to import data in tsv format");
    return;
  }
}

export async function importCommand(options: string, args: Array<string>) {
  printHelp(options)

  const content = await fs.readFile(resolve(args[0]), {encoding: "utf-8"});
  const lines = content.split(EOL);


  for (const line of lines) {
    const values = line.split("\t");

    const offer = Object.fromEntries(KEYS.map((key, i) => [key, values[i]])) as unknown as Offer;
    offer.images = (offer.images as unknown as string).split(",") as Offer["images"];
    offer.facilities = (offer.facilities as unknown as string).split(",") as Offer["facilities"];
    offer.date = new Date((offer.date as unknown as string));
    offer.isPremium = (offer.isPremium as unknown as string) === "true";
    offer.isFavourite = (offer.isFavourite as unknown as string) === "true";
    offer.rating = parseFloat(offer.rating as unknown as string);
    offer.roomCount = parseInt(offer.roomCount as unknown as string, 10);
    offer.guestCount = parseInt(offer.guestCount as unknown as string, 10);
    offer.cost = parseInt(offer.cost as unknown as string, 10);
    offer.coordinates = (() => {
      let coords = (offer.coordinates as unknown as string).split(",");
      return {latitude: parseFloat(coords[0]), longitude:parseFloat(coords[1])};
    })();

    console.log(JSON.stringify(offer));
  }
}
