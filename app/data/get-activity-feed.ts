import { ACTIVITY_COLLECTION, USER_COLLECTION } from "../constants";
import { client, connect } from "../services/mongo";
import type { teams } from "../shared-types";
import type { User } from "./get-user";

export type ActivityTypes =
  | "USE_MINE"
  | "USE_FORGE"
  | "USE_WRAP"
  | "USE_SLEIGH";

export interface ActivityItem {
  userId: string;
  type: ActivityTypes;
  timestamp: number;
  team: teams;
}

export interface ActivityItemDTO {
  user?: {
    name: string;
  };
  userId: string;
  type: ActivityTypes;
  timestamp: number;
  team: teams;
}

export const addActivityItem = async ({
  team,
  type,
  userId,
}: Omit<ActivityItem, "timestamp">) => {
  const item: ActivityItem = {
    team,
    timestamp: Date.now(),
    type,
    userId,
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
): Promise<ActivityItemDTO[]> => {
  await connect();

  const db = client.db();
  const activityCollection = db.collection<ActivityItem>(ACTIVITY_COLLECTION);
  const userCollection = db.collection<User>(USER_COLLECTION);

  const activityItems = await activityCollection
    .find({ team })
    .sort({ timestamp: "desc" })
    .limit(3)
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
      user: user ? {
        name: user.details.name
      } : undefined
    }
  });

  return result;
};
