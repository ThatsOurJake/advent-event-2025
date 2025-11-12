import type { NextRequest } from "next/server";
import { auth } from "../../auth";
import { VALID_LOCATIONS_ARR } from "../../constants";
import { getUser } from "../../data/get-user";
import type { PostGameBasePayload } from "../../shared-types";
import { processGame } from "./process";

export async function POST(req: NextRequest) {
  const payload: PostGameBasePayload = await req.json();

  if (!payload.game || !VALID_LOCATIONS_ARR.includes(payload.game)) {
    return new Response(null, {
      status: 400,
    });
  }

  const session = await auth();

  if (!session) {
    return new Response(null, {
      status: 401,
    });
  }

  const { user } = session;
  const { id } = user!;

  const dbUser = await getUser(id!);

  if (!dbUser) {
    return new Response(null, {
      status: 403,
    });
  }

  const { game: { actionPoints, team }, userId } = dbUser;

  if (actionPoints === 0) {
    return new Response(JSON.stringify({ error: 'Not enough action points' }), {
      status: 400,
    });
  }

  try {
    const result = await processGame(userId, team, payload.game, payload);

    return new Response(JSON.stringify(result || {}), {
      status: 202,
    });
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
}
