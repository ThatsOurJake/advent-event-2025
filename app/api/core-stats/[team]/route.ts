import type { NextApiRequest } from "next";
import { getCoreStats } from "../../../data/core-stats";

export async function GET(_req: NextApiRequest, { params }: { params: Promise<{ team: string }> }
) {
  const { team } = await params;
  const coreStats = await getCoreStats(team);
  return new Response(JSON.stringify(coreStats));
}
