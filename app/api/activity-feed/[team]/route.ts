import type { NextRequest } from "next/server";
import { auth } from "../../../auth";
import { getActivityItems } from "../../../data/get-activity-feed";
import { getUser } from "../../../data/user";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/activity-feed/[team]">,
) {
  const { team } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return new Response(null, {
      status: 401,
    });
  }

  const { id } = session.user;

  const user = await getUser(id!);

  if (user?.game.team !== team) {
    return new Response(null, {
      status: 403,
    });
  }

  const activityFeed = await getActivityItems(team);

  return new Response(JSON.stringify(activityFeed), {
    headers: {
      "content-type": "application/json",
    },
  });
}
