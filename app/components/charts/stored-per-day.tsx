"use client";

import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import type { Snapshot } from "../../data/teams";
import { mapTeamToColour, mapTeamToName } from "../../utils/map-team";

interface StoredPerDayGraphProps {
  data: Snapshot[];
  statToShow: "ore" | "giftMounds" | "wrappedGifts" | "score";
  title: string;
}

interface GraphData {
  date: string;
  red: number;
  green: number;
  blue: number;
}

export const StoredPerDayGraph = ({
  data,
  statToShow,
  title,
}: StoredPerDayGraphProps) => {
  const groupedPerDay: Map<
    string,
    {
      red: number;
      green: number;
      blue: number;
    }
  > = new Map();

  for (let i = 0; i < data.length; i++) {
    const { snapshot, timestamp } = data[i];
    const dateStr = new Date(timestamp).toLocaleDateString("en-GB");
    const obj = groupedPerDay.get(dateStr) || {
      blue: 0,
      green: 0,
      red: 0,
    };

    for (const team of snapshot) {
      const { name, stats } = team;
      const stat = stats[statToShow];
      const value = typeof stat === "number" ? stat : stat.stored;

      obj[name] = value;
    }

    groupedPerDay.set(dateStr, obj);
  }

  const graphData: GraphData[] = groupedPerDay
    .entries()
    .reduce((acc: GraphData[], current) => {
      const [date, data] = current;
      const { blue, green, red } = data;

      return acc.concat({
        date,
        red,
        green,
        blue,
      });
    }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-center font-bold">{title}</p>
      <div className="grow min-h-0">
        <LineChart
          responsive
          data={graphData}
          style={{ width: "100%", height: "100%" }}
        >
          <XAxis dataKey="date" />
          <YAxis width="auto" />
          <Tooltip />
          <Legend />
          <Line
            type="linear"
            dataKey="red"
            stroke={mapTeamToColour("red").graphColour}
            name={mapTeamToName("red")}
          />
          <Line
            type="linear"
            dataKey="green"
            stroke={mapTeamToColour("green").graphColour}
            name={mapTeamToName("green")}
          />
          <Line
            type="linear"
            dataKey="blue"
            stroke={mapTeamToColour("blue").graphColour}
            name={mapTeamToName("blue")}
          />
        </LineChart>
      </div>
    </div>
  );
};
