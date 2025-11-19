import { MVE_COLLECTION, USER_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { teams } from "../shared-types";
import type { User } from "./user";

export interface MostValuedElvesAward {
  team: teams;
  mine: {
    userId: string;
    count: number;
  };
  forge: {
    userId: string;
    count: number;
  };
  wrap: {
    userId: string;
    count: number;
  };
  sleigh: {
    userId: string;
    count: number;
  };
}

export interface MostValuedElves {
  timestamp: number;
  awards: MostValuedElvesAward[];
}

export interface MostValuedElvesDTO {
  timestamp: number;
  awards: {
    team: teams;
    mine: {
      userId: string;
      userName?: string;
      count: number;
    };
    forge: {
      userId: string;
      userName?: string;
      count: number;
    };
    wrap: {
      userId: string;
      userName?: string;
      count: number;
    };
    sleigh: {
      userId: string;
      userName?: string;
      count: number;
    };
  }[];
}

export const createMVEEntry = async (
  input: Omit<MostValuedElves, "timestamp">,
) => {
  const item: MostValuedElves = {
    ...input,
    timestamp: Date.now(),
  };

  await connect();

  const db = client.db();
  const collection = db.collection<MostValuedElves>(MVE_COLLECTION);

  const { acknowledged } = await collection.insertOne(item);

  if (acknowledged) {
    return item;
  }

  console.error(`Failed to insert MVE`);
};

export const getLatestMVE = async () => {
  await connect();

  const db = client.db();
  const collection = db.collection<MostValuedElves>(MVE_COLLECTION);
  const userCollection = db.collection<User>(USER_COLLECTION);

  const [latestMVE] = await collection
    .find(
      {},
      {
        sort: {
          timestamp: "desc",
        },
      },
    )
    .limit(1)
    .toArray();

  if (!latestMVE) {
    return;
  }

  const userIds = latestMVE.awards.reduce((acc: string[], current) => {
    const { forge, mine, sleigh, wrap } = current;
    return acc.concat(forge.userId, mine.userId, sleigh.userId, wrap.userId);
  }, []);

  const users = await userCollection
    .find({
      userId: {
        $in: userIds,
      },
    })
    .toArray();

  const output: MostValuedElvesDTO = {
    timestamp: latestMVE.timestamp,
    awards: latestMVE.awards.map((teamAward) => {
      const { forge, mine, sleigh, team, wrap } = teamAward;
      return {
        team,
        forge: {
          ...forge,
          userName: users.find((x) => x.userId === forge.userId)?.details.name,
        },
        mine: {
          ...mine,
          userName: users.find((x) => x.userId === mine.userId)?.details.name,
        },
        wrap: {
          ...wrap,
          userName: users.find((x) => x.userId === wrap.userId)?.details.name,
        },
        sleigh: {
          ...sleigh,
          userName: users.find((x) => x.userId === sleigh.userId)?.details.name,
        },
      };
    }),
  };

  return output;
};
