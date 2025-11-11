"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import type { GetLocationStatsResp } from "../api/location-stats/[team]/route";
import { type FetchCallback, regularlyFetch } from "../utils/regularly-fetch";
import { AppContext } from "./page-wrapper";

export const ChoreList = () => {
  const {
    user: {
      game: { team },
    },
  } = useContext(AppContext);
  const [locationStats, setLocationStats] = useState<GetLocationStatsResp>({
    forge: 0,
    mines: 0,
    sleigh: 0,
    wrappingStation: 0,
  });

  useEffect(() => {
    const onResp: FetchCallback<GetLocationStatsResp> = (
      errored,
      resp,
      error,
    ) => {
      if (errored || !resp) {
        console.error(error);
        return;
      }

      setLocationStats(resp);
    };

    const interval = regularlyFetch<GetLocationStatsResp>(
      `/api/location-stats/${team}`,
      5000,
      onResp,
    );

    return () => {
      clearInterval(interval);
    };
  }, [team]);

  return (
    <div className="py-2 border-2 rounded mx-2 bg-cyan-100">
      <p className="font-bold text-center text-xl">Chores List</p>
      <div className="grid grid-cols-2 grid-row-2">
        <Link href="/mine" className="p-2">
          <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-between items-center flex-col bg-fuchsia-200 shadow">
            <img src="/static/pickaxe.png" className="w-1/2 mb-1" aria-hidden />
            <p className="font-bold text-center">The Mines</p>
            <p className="my-1 italic text-sm text-center">Produces "Ore"</p>
            <p className="text-sm text-center">
              <span className="font-bold">{locationStats.mines}</span> person
              mining
            </p>
          </div>
        </Link>
        <Link href="/forge" className="p-2">
          <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-between items-center flex-col bg-fuchsia-200 shadow">
            <img src="/static/hammer.png" className="w-1/2 mb-1" aria-hidden />
            <p className="font-bold text-center">The Forge</p>
            <p className="my-1 italic text-sm text-center">
              Produces "Gift Mounds" from "Ore"
            </p>
            <p className="text-sm text-center">
              <span className="font-bold">{locationStats.forge}</span> people
              smelting
            </p>
          </div>
        </Link>
        <Link href="/wrap" className="p-2">
          <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-between items-center flex-col bg-fuchsia-200 shadow">
            <img
              src="/static/wrapping.png"
              className="w-1/2 mb-1"
              aria-hidden
            />
            <p className="font-bold text-center">Wrapping Station</p>
            <p className="my-1 italic text-sm text-center">
              Produces "Wrapped Gifts" from "Gift Mounds"
            </p>
            <p className="text-sm text-center">
              <span className="font-bold">{locationStats.wrappingStation}</span>{" "}
              people wrapping
            </p>
          </div>
        </Link>
        <a href="/sleigh" className="p-2">
          <div className="h-full px-1 py-4 rounded border-2 cursor-pointer flex justify-between items-center flex-col bg-fuchsia-200 shadow">
            <img src="/static/sleigh.png" className="w-1/2 mb-1" aria-hidden />
            <p className="font-bold text-center">The Sleigh</p>
            <p className="my-1 italic text-sm text-center">
              Gain Score from "Wrapped Gifts"
            </p>
            <p className="text-sm text-center">
              <span className="font-bold">{locationStats.sleigh}</span> people
              packing
            </p>
          </div>
        </a>
      </div>
    </div>
  );
};
