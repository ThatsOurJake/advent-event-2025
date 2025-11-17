import { BULLETIN_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { teams } from "../shared-types";

export interface BulletinMessage {
  _id?: string;
  team: teams | "all";
  dateToShow: number;
  message: string;
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

  const messages = await collection.find({
    $or: [
      {
        team: team
      },
      {
        team: 'all'
      }
    ],
    dateToShow: dayOfMonth
  }).toArray() as BulletinMessage[];

  return messages;
}
