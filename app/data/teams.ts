import type { WithId } from "mongodb";
import { TEAM_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { teams } from "../shared-types";

export interface Team {
  name: teams;
  stats: {
    score: number;
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

export const setTeamStat = async (team: teams, path: TeamStatsPaths, newValue: number) => {
  await connect();

  const db = client.db();
  const collection = db.collection<Team>(TEAM_COLLECTION);

  await collection.findOneAndUpdate({
    name: team,
  }, {
    $set: { [path]: newValue }
  });
};

export const getTeamScores = async () => {
  await connect();

  const db = client.db();
  const collection = db.collection<Team>(TEAM_COLLECTION);

  return collection.find({}).project<{ name: teams; stats: { score: number } }>({ 'stats.score': 1, name: 1 }).toArray();
};

export const updateTeamsNightlyResources = async () => {
  await connect();

  const db = client.db();
  const collection = db.collection<Team>(TEAM_COLLECTION);

  const teams = await collection.find({}).toArray();
  const output: { team: string; newOreValue: number; newGiftMoundsValue: number; newWrappedGiftsValue: number }[] = [];

  for (const team of teams) {
    const { stats: { ore, giftMounds, wrappedGifts } } = team;
    console.log(`Updating ${team.name} nightly stats`);

    const newOreValue = ore.stored + ore.mined;
    const newGiftMoundsValue = giftMounds.stored + giftMounds.collected;
    const newWrappedGiftsValue = wrappedGifts.stored + wrappedGifts.wrapped;

    await collection.findOneAndUpdate({
      _id: team._id,
    }, {
      $set: {
        'stats.ore.mined': 0,
        'stats.giftMounds.collected': 0,
        'stats.wrappedGifts.wrapped': 0,
        'stats.ore.stored': newOreValue,
        'stats.giftMounds.stored': newGiftMoundsValue,
        'stats.wrappedGifts.stored': newWrappedGiftsValue,
      },
    });

    output.push({
      team: team.name,
      newGiftMoundsValue,
      newOreValue,
      newWrappedGiftsValue
    });
  }

  return output;
};
