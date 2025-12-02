import { ACTIVITY_COLLECTION, USER_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { ActivityTypes, teams } from "../shared-types";
import type { User } from "./user";

export interface ActivityItem {
  userId: string;
  type: ActivityTypes;
  timestamp: number;
  team: teams;
  amount: number;
}

export interface ActivityItemDTO {
  user?: {
    name: string;
  };
  userId: string;
  type: ActivityTypes;
  timestamp: number;
  team: teams;
  amount: number;
}

export const addActivityItem = async ({
  team,
  type,
  userId,
  amount,
}: Omit<ActivityItem, "timestamp">) => {
  const item: ActivityItem = {
    team,
    timestamp: Date.now(),
    type,
    userId,
    amount,
  };

  await connect();

  const db = client.db();
  const collection = db.collection<ActivityItem>(ACTIVITY_COLLECTION);

  const { acknowledged } = await collection.insertOne(item);

  if (acknowledged) {
    return item;
  }

  console.error(`Failed to insert activity item`);
};

export const getActivityItems = async (
  team: teams,
  limit: number = 3,
): Promise<ActivityItemDTO[]> => {
  await connect();

  const db = client.db();
  const activityCollection = db.collection<ActivityItem>(ACTIVITY_COLLECTION);
  const userCollection = db.collection<User>(USER_COLLECTION);

  const activityItems = await activityCollection
    .find({ team })
    .sort({ timestamp: "desc" })
    .limit(limit)
    .toArray();

  const userIds = activityItems.map((x) => x.userId);
  const users = await userCollection
    .find({
      userId: {
        $in: userIds,
      },
    })
    .toArray();

  const result: ActivityItemDTO[] = activityItems.map((item) => {
    const user = users.find((x) => x.userId === item.userId);
    return {
      ...item,
      user: user
        ? {
          name: user.details.name,
        }
        : undefined,
    };
  });

  return result;
};

interface AchievementActivity {
  count: number;
  userId: string;
  type: ActivityTypes;
}

export const getAchievementActivities = async (team: teams) => {
  await connect();

  const db = client.db();
  const activityCollection = db.collection<ActivityItem>(ACTIVITY_COLLECTION);

  const result = (await activityCollection
    .aggregate([
      {
        $match: { team },
      },
      {
        $group: {
          _id: { userId: "$userId", type: "$type" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id.userId",
          type: "$_id.type",
          count: 1,
        },
      },
    ])
    .toArray()) as AchievementActivity[];

  return result;
};

export const getUsersActivity = async (userId: string) => {
  await connect();

  const db = client.db();
  const activityCollection = db.collection<ActivityItem>(ACTIVITY_COLLECTION);

  return activityCollection
    .find({ userId })
    .sort({ timestamp: "asc" })
    .toArray();
};

export const migrateActivityItems = async (oldUserId: string, newUserId: string) => {
  await connect();

  const db = client.db();
  const collection = db.collection<ActivityItem>(ACTIVITY_COLLECTION);

  const { modifiedCount } = await collection.updateMany(
    { userId: oldUserId },
    { $set: { userId: newUserId } }
  );

  console.log(`Migrated: ${modifiedCount} activity items`);

  return modifiedCount;
};
