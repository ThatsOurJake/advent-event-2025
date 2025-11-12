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
}

export const mapTeamToColour = (team: teams): ThemeColours => {
  if (team === "red") {
    return {
      background: "bg-red-100",
    };
  }

  if (team === "green") {
    return {
      background: "bg-green-100",
    };
  }

  return {
    background: "bg-blue-100",
  };
};
