import type { NextRequest } from "next/server";
import { auth } from "../../../auth";
import { getCoreStats } from "../../../data/core-stats";
import { getUser } from "../../../data/user";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/core-stats/[team]">,
) {
  const { team } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return new Response(null, {
      status: 401,
    });
  }

  const { id, name } = session.user;

  const user = await getUser(id!, name!);

  if (user?.game.team !== team) {
    return new Response(null, {
      status: 403,
    });
  }

  const coreStats = await getCoreStats(team);
  return new Response(JSON.stringify(coreStats || {}));
}
