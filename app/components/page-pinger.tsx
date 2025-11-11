"use client";

import { useContext, useEffect } from "react";
import type { validLocations } from "../api/location-stats/[team]/route";
import { AppContext } from "./page-wrapper";

interface PagePingerProps {
  location: validLocations;
}

export const PagePinger = ({ location }: PagePingerProps) => {
  const {
    user: {
      game: { team },
    },
  } = useContext(AppContext);

  useEffect(() => {
    const send = (method: "PUT" | "DELETE") => {
      fetch(`/api/location-stats/${team}`, {
        body: JSON.stringify({
          location,
        }),
        method,
        headers: {
          "content-type": "application/json",
        },
      });
    };

    send("PUT");

    return () => {
      send("DELETE");
    };
  }, [location, team]);

  return null;
};
