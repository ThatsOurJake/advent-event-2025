import Link from "next/link";
import type { TeamScores } from "../data/teams";
import { mapTeamToColour, mapTeamToName } from "../utils/map-team";

interface FactionStatsProps {
  teamScores: TeamScores[];
}

export const FactionStats = ({ teamScores }: FactionStatsProps) => {
  return (
    <div className="bg-white m-2 p-2 border-2 rounded">
      <p className="text-center font-bold text-2xl mb-2">Faction Statistics</p>
      <div className="grid grid-cols-3">
        {teamScores.map((s) => {
          const theme = mapTeamToColour(s.name);
          return (
            <div
              key={`score:${s.name}`}
              className={`${theme.background} m-1 p-2 rounded border-2`}
            >
              <p
                className={`text-xl font-bold text-center ${theme.teamLinkColour}`}
              >
                {mapTeamToName(s.name)}
              </p>
              <p className="text-center">Current Score: {s.stats.score}</p>
            </div>
          );
        })}
      </div>
      <Link
        href="/teams"
        className="text-center text-purple-600 hover:underline"
      >
        <p className="py-1">View Team Members</p>
      </Link>
    </div>
  );
};
