import type { NextApiRequest } from "next";
import redis from "../../../services/redis";

const LOC_MINE_KEY = "location:mine";
const LOC_FORGE_KEY = "location:forge";
const LOC_WRAP_STATION_KEY = "location:wrap_station";
const LOC_SLEIGH_KEY = "location:sleigh";

const EXPIRY = 5 * 60;

export interface GetLocationStatsResp {
  mines: number;
  forge: number;
  wrappingStation: number;
  sleigh: number;
}

const VALID_LOCATIONS_ARR = [
  "mine",
  "forge",
  "wrap_station",
  "sleigh",
] as const;
export type validLocations = (typeof VALID_LOCATIONS_ARR)[number];

export async function GET(
  _req: NextApiRequest,
  { params }: { params: Promise<{ team: string }> },
) {
  const { team } = await params;

  const [peopleInMine, peopleInForge, peopleInWrappingStation, peopleInSleigh] =
    await Promise.all([
      redis.get(`${team}:${LOC_MINE_KEY}`),
      redis.get(`${team}:${LOC_FORGE_KEY}`),
      redis.get(`${team}:${LOC_WRAP_STATION_KEY}`),
      redis.get(`${team}:${LOC_SLEIGH_KEY}`),
    ]);

  const resp: GetLocationStatsResp = {
    mines: parseInt(peopleInMine || "0", 10),
    forge: parseInt(peopleInForge || "0", 10),
    wrappingStation: parseInt(peopleInWrappingStation || "0", 10),
    sleigh: parseInt(peopleInSleigh || "0", 10),
  };

  return Response.json(resp);
}

export async function PUT(req: Request, { params }: { params: Promise<{ team: string }> }) {
  const { team } = await params;
  const payload: { location: string } = await req.json();

  if (!payload.location) {
    return new Response(JSON.stringify({ error: "Must send a location" }), {
      status: 400,
    });
  }

  if (!VALID_LOCATIONS_ARR.includes(payload.location as validLocations)) {
    return new Response(JSON.stringify({ error: "Not a valid location" }), {
      status: 400,
    });
  }

  const redisKey = `${team}:location:${payload.location}`;

  await redis.incr(redisKey);
  await redis.expire(redisKey, EXPIRY);

  return new Response(null, {
    status: 202,
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ team: string }> }) {
  const { team } = await params;
  const payload: { location: string } = await req.json();

  if (!payload.location) {
    return new Response(JSON.stringify({ error: "Must send a location" }), {
      status: 400,
    });
  }

  if (!VALID_LOCATIONS_ARR.includes(payload.location as validLocations)) {
    return new Response(JSON.stringify({ error: "Not a valid location" }), {
      status: 400,
    });
  }

  const redisKey = `${team}:location:${payload.location}`;

  await redis.decr(redisKey);

  return new Response(null, {
    status: 202,
  });
}
