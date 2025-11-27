import type { teams } from "@/app/shared-types";

export const mapTeamToName = (team: teams) => {
  if (team === "red") {
    return "Ruddy Reds";
  }

  if (team === "green") {
    return "Grungy Greens";
  }

  return "Bouncy Blues";
};

export interface ThemeColours {
  background: string;
  teamLinkColour: string;
  graphColour: string;
}

export const mapTeamToColour = (team: teams): ThemeColours => {
  if (team === "red") {
    return {
      background: "bg-red-100",
      teamLinkColour: "text-red-600",
      graphColour: "#b91c1c",
    };
  }

  if (team === "green") {
    return {
      background: "bg-green-100",
      teamLinkColour: "text-green-600",
      graphColour: "#047857",
    };
  }

  return {
    background: "bg-blue-100",
    teamLinkColour: "text-blue-600",
    graphColour: "#1d4ed8",
  };
};
