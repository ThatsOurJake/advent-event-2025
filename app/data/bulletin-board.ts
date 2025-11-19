import game from "../../game.json";
import { BULLETIN_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { teams } from "../shared-types";

export interface BulletinMessage {
  _id?: string;
  team: teams | "all";
  dateToShow: number;
  message: string;
  dismissible?: boolean;
}

export const createMessage = async (message: BulletinMessage) => {
  await connect();

  const db = client.db();
  const collection = db.collection<BulletinMessage>(BULLETIN_COLLECTION);

  const { acknowledged } = await collection.insertOne(message);

  if (acknowledged) {
    return message;
  }

  console.error(`Failed to insert bulletin message`);
};

export const getMessages = async (team: teams) => {
  const dayOfMonth = new Date().getDate();

  await connect();

  const db = client.db();
  const collection = db.collection<BulletinMessage>(BULLETIN_COLLECTION);

  const messages = (await collection
    .find({
      $or: [
        {
          team: team,
        },
        {
          team: "all",
        },
      ],
      dateToShow: dayOfMonth,
    })
    .toArray()) as BulletinMessage[];

  messages.push({
    team: "all",
    dismissible: true,
    dateToShow: 1,
    message: `The Christmas advent event 2025 is here ✨.
  This years is slightly different to previous years, to help with that a [guide](${game.gameGuideLink}) has been put together!`,
    _id: "starting_guide",
  });

  return messages;
};
