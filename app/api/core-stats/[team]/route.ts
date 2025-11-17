import type { NextApiRequest } from "next";
import { auth } from "../../../auth";
import { getCoreStats } from "../../../data/core-stats";
import { getUser } from "../../../data/user";
import type { teams } from "../../../shared-types";

export async function GET(
  _req: NextApiRequest,
  { params }: { params: Promise<{ team: teams }> },
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

  const coreStats = await getCoreStats(team);
  return new Response(JSON.stringify(coreStats || {}));
}
