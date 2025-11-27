import type { validLocations } from "../api/location-stats/[team]/route";
import type {
  PostGameForgePayload,
  PostGameMinePayload,
  PostGameWrappingPayload,
} from "../shared-types";

interface ProcessGameResp {
  success?: boolean;
}

export async function reportGameResult(
  game: "sleigh",
  payload: Omit<PostGameForgePayload, "game">,
): Promise<ProcessGameResp>;
export async function reportGameResult(
  game: "wrap_station",
  payload: Omit<PostGameWrappingPayload, "game">,
): Promise<ProcessGameResp>;
export async function reportGameResult(
  game: "forge",
  payload: Omit<PostGameForgePayload, "game">,
): Promise<ProcessGameResp>;
export async function reportGameResult(
  game: "mine",
  payload: Omit<PostGameMinePayload, "game">,
): Promise<ProcessGameResp>;
export async function reportGameResult(
  game: validLocations,
  payload: object,
): Promise<ProcessGameResp> {
  const res = await fetch("/api/game", {
    method: "POST",
    body: JSON.stringify({
      game,
      ...payload,
    }),
    headers: {
      "content-type": "application/json",
    },
  });

  const data = await res.json();

  return data;
}
