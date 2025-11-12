import { USER_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { User } from "./get-user";

export const decrUserActionPoints = async (userId: string) => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  await collection.findOneAndUpdate(
    {
      userId,
    },
    {
      $inc: { "game.actionPoints": -1 },
    },
  );
};
