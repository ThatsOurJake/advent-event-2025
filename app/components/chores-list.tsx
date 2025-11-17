"use client";

import { useContext, useEffect, useState } from "react";
import type { GetLocationStatsResp } from "../api/location-stats/[team]/route";
import { type FetchCallback, regularlyFetch } from "../utils/regularly-fetch";
import { ChoreListItem } from "./chore-list-item";
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
    <div className="pt-2 border-2 rounded mx-2 bg-cyan-100">
      <p className="font-bold text-center text-xl">Task List</p>
      <p className="text-center">
        Visit the following places to gather resources
      </p>
      <div className="grid grid-cols-2">
        <ChoreListItem
          href="/mine"
          image="/static/pickaxe.png"
          title="The Mines"
          description='Produces "Ore"'
          peopleCount={locationStats.mines}
          locationSuffixes={{
            single: "person mining",
            plural: "people mining",
          }}
        />
        <ChoreListItem
          href="/forge"
          image="/static/hammer.png"
          title="The Forge"
          description='Produces "Gift Mounds" from "Ore"'
          peopleCount={locationStats.forge}
          locationSuffixes={{
            single: "person forging",
            plural: "people forging",
          }}
        />
        <ChoreListItem
          href="/wrap"
          image="/static/wrapping.png"
          title="Wrapping Station"
          description='Produces "Wrapped Gifts" from "Gift Mounds"'
          peopleCount={locationStats.wrappingStation}
          locationSuffixes={{
            single: "person wrapping",
            plural: "people wrapping",
          }}
        />
        <ChoreListItem
          anchor
          href="/sleigh"
          image="/static/sleigh.png"
          title="The Sleigh"
          description='Gain Score from "Wrapped Gifts"'
          peopleCount={locationStats.sleigh}
          locationSuffixes={{
            single: "person packing",
            plural: "people packing",
          }}
        />
      </div>
      <p className="text-center italic mb-2">
        Note: Resources produced today will go into storage over night and will
        be available to use tomorrow!
      </p>
    </div>
  );
};
