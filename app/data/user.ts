import fs from "node:fs";
import path from "node:path";
import type { Collection, WithId } from "mongodb";
import { STARTING_AP, USER_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import redis from "../services/redis";
import type { teams } from "../shared-types";
import { migrateActivityItems } from "./activity-feed";
import { migrateMVEs } from "./mve";

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
    console.log(`Created user and assigned them to ${assignedTeam}`);
    return user;
  }

  console.error(`Failed to insert user`);
};

const migrateUser = async (collection: Collection<User>, oid: string, name: string) => {
  // Migration put in place due to bug where users could re-log to move teams as the sub from the JWT wasn't globally unique
  const user = (await collection.findOne({
    details: {
      name,
    },
  })) as WithId<User>;

  const oldUserId = user.userId;

  if (user) {
    console.log(`Migrating user to new oid.`);

    await collection.updateOne(
      { details: { name } },
      { $set: { userId: oid } },
    );

    user.userId = oid;

    await migrateActivityItems(oldUserId, oid);
    await migrateMVEs(oldUserId, oid);
  }

  return user;
};

export const getUser = async (
  oid: string,
  name: string,
): Promise<User | null> => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  let user = (await collection.findOne({
    userId: oid,
  })) as WithId<User>;

  if (!user) {
    user = await migrateUser(collection, oid, name);
  }

  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    details: user.details,
    game: user.game,
  };
};

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

export const resetUserActionPoints = async () => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  console.log(`Resetting Users Action Points`);

  await collection.updateMany(
    {},
    {
      $set: {
        "game.actionPoints": STARTING_AP,
      },
    },
  );
};

export interface UserTeamCount {
  _id: teams;
  count: number;
}

export const getTeamUserCount = async (): Promise<UserTeamCount[]> => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  const result = (await collection
    .aggregate([
      {
        $group: {
          _id: "$game.team",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray()) as UserTeamCount[];

  return result;
};

export const getUsersLeftoverAP = async (): Promise<UserTeamCount[]> => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  const result = (await collection
    .aggregate([
      {
        $group: {
          _id: "$game.team",
          count: { $sum: "$game.actionPoints" },
        },
      },
    ])
    .toArray()) as UserTeamCount[];

  return result;
};

export interface SimplifiedUser {
  userId: string;
  name: string;
}

interface Roster {
  team: teams;
  users: SimplifiedUser[];
}

export const getTeamRoster = async () => {
  await connect();

  const db = client.db();
  const collection = db.collection<User>(USER_COLLECTION);

  const result = (await collection
    .aggregate([
      {
        $group: {
          _id: "$game.team",
          users: {
            $push: {
              userId: "$userId",
              name: "$details.name",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          team: "$_id",
          users: 1,
        },
      },
    ])
    .toArray()) as Roster[];

  return result.sort((a, b) => a.team.localeCompare(b.team));
};
