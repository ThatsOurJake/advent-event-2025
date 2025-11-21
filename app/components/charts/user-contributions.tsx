"use client";

import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityItem } from "../../data/get-activity-feed";

interface UserContributionsGraphProps {
  data: ActivityItem[];
}

interface GraphData {
  date: string;
  ore: number;
  mounds: number;
  wrapped: number;
  score: number;
}

export const UserContributionsGraph = ({
  data,
}: UserContributionsGraphProps) => {
  const groupedPerDay: Map<
    string,
    {
      ore: number;
      mounds: number;
      wrapped: number;
      score: number;
    }
  > = new Map();

  for (let i = 0; i < data.length; i++) {
    const { timestamp, type, amount = 1 } = data[i];
    const dateStr = new Date(timestamp).toLocaleDateString("en-GB");
    const obj = groupedPerDay.get(dateStr) || {
      ore: 0,
      mounds: 0,
      wrapped: 0,
      score: 0,
    };

    switch (type) {
      case "USE_MINE":
        obj.ore += amount;
        break;
      case "USE_FORGE":
        obj.mounds += amount;
        break;
      case "USE_WRAP":
        obj.wrapped += amount;
        break;
      case "USE_SLEIGH":
        obj.score += amount;
        break;
    }

    groupedPerDay.set(dateStr, obj);
  }

  const graphData: GraphData[] = groupedPerDay
    .entries()
    .reduce((acc: GraphData[], current) => {
      const [date, data] = current;
      const { mounds, ore, score, wrapped } = data;

      return acc.concat({
        date,
        ore,
        mounds,
        wrapped,
        score,
      });
    }, []);

  return (
    <LineChart
      responsive
      data={graphData}
      style={{ width: "100%", height: "100%" }}
    >
      <XAxis dataKey="date" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Line type="linear" dataKey="ore" stroke="#a21caf" name="Ore Mined" />
      <Line
        type="linear"
        dataKey="mounds"
        stroke="#4338ca"
        name="Mounds Forged"
      />
      <Line
        type="linear"
        dataKey="wrapped"
        stroke="#075985"
        name="Gifts Wrapped"
      />
      <Line
        type="linear"
        dataKey="score"
        stroke="#d97706"
        name="Score Gained"
      />
    </LineChart>
  );
};
