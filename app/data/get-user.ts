import fs from "node:fs";
import path from "node:path";
import type { WithId } from "mongodb";
import { STARTING_AP, USER_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import redis from "../services/redis";
import type { teams } from "../shared-types";

const assignTeamScript = fs.readFileSync(
  path.resolve("app", "lua", "assign_team.lua"),
);

export interface User {
  userId: string;
  details: {
    name: string;
  };
  game: {
    team: teams;
    actionPoints: number;
  };
}

interface CreateUserOpts {
  sub: string;
  name: string;
}


export const createUser = async ({ name, sub }: CreateUserOpts) => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  const assignedTeam = await redis.eval(assignTeamScript, 0);

  const user: User = {
    details: {
      name,
    },
    userId: sub,
    game: {
      team: assignedTeam as teams,
      actionPoints: STARTING_AP,
    },
  };

  const { acknowledged } = await collection.insertOne(user);

  if (acknowledged) {
    return user;
  }

  console.error(`Failed to insert user`);
};

export const getUser = async (sub: string): Promise<User | null> => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  const user = (await collection.findOne({
    userId: sub,
  })) as WithId<User>;

  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    details: user.details,
    game: user.game,
  };
};
