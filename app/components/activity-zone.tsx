"use client";

import { useContext, useEffect, useState } from "react";
import type { ActivityItemDTO } from "../data/activity-feed";
import { regularlyFetch } from "../utils/regularly-fetch";
import { AppContext } from "./page-wrapper";

const constructMessage = (item: ActivityItemDTO) => {
  const name = item.user ? item.user.name : "Someone";

  if (item.type === "USE_MINE") {
    return `${name} just mined "${item.amount}" ore at the mine ⛏️`;
  }

  if (item.type === "USE_FORGE") {
    return `${name} just smelted "${item.amount}" ore and produced a gift mound 🔥`;
  }

  if (item.type === "USE_WRAP") {
    return `${name} just wrapped "${item.amount}" present(s) 🎁`;
  }

  if (item.type === "USE_SLEIGH") {
    return `${name} just loaded a gift onto Santas' sleigh, your team have scored a point 🎅🏼`;
  }
};

export const ActivityZone = () => {
  const {
    user: {
      game: { team },
    },
  } = useContext(AppContext);
  const [activityItems, setActivity] = useState<ActivityItemDTO[]>([]);

  useEffect(() => {
    const interval = regularlyFetch<ActivityItemDTO[]>(
      `/api/activity-feed/${team}`,
      1000,
      (errored, resp, error) => {
        if (errored || !resp) {
          console.error(error);
          return;
        }

        setActivity(resp);
      },
    );

    return () => {
      clearInterval(interval);
    };
  }, [team]);

  return (
    <div>
      <p className="font-bold my-2 text-center">Activity Stream</p>
      <li className="list-none space-y-2">
        {activityItems.map((item) => (
          <ul
            className="p-2 rounded border-2 bg-purple-200"
            key={`${item.userId}-${item.timestamp}`}
          >
            <p>{constructMessage(item)}</p>
          </ul>
        ))}
      </li>
    </div>
  );
};
