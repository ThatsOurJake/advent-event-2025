import type { WithId } from "mongodb";
import { TEAM_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { teams } from "../shared-types";

interface Team {
  name: teams;
  stats: {
    ore: {
      mined: number;
      stored: number;
    };
    giftMounds: {
      collected: number;
      stored: number;
    };
    wrappedGifts: {
      wrapped: number;
      stored: number;
    };
  };
}

export const createTeam = async (team: Team) => {
  await connect();

  const db = client.db();
  const collection = db.collection<Team>(TEAM_COLLECTION);

  const { acknowledged } = await collection.insertOne(team);

  if (acknowledged) {
    return team;
  }

  console.error(`Failed to insert team`);
};

export const getTeam = async (team: teams): Promise<Team | null> => {
  await connect();

  const db = client.db();
  const collection = db.collection<Team>(TEAM_COLLECTION);

  const teamDB = (await collection.findOne({
    name: team,
  })) as WithId<Team>;

  if (!teamDB) {
    return null;
  }

  return {
    name: teamDB.name,
    stats: teamDB.stats,
  }
};

type DotNotation<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
  ? K extends string
  ? DotNotation<T[K], `${Prefix}${K}.`>
  : never
  : K extends string
  ? `${Prefix}${K}`
  : never;
}[keyof T];

type TeamStatsPaths = DotNotation<Team['stats'], 'stats.'>;

export const updateTeamStats = async (team: teams, path: TeamStatsPaths, byValue: number) => {
  await connect();

  const db = client.db();
  const collection = db.collection<Team>(TEAM_COLLECTION);

  await collection.findOneAndUpdate({
    name: team,
  }, {
    $inc: { [path]: byValue }
  });
};
