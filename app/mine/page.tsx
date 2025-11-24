import { PagePinger } from "../components/page-pinger";
import { PageWrapper } from "../components/page-wrapper";
import { getServerUser } from "../components/server-hooks/get-server-user";
import { getTeamScores } from "../data/teams";
import { mapTeamToColour } from "../utils/map-team";
import MiningGame from "./game";

const MinePage = async () => {
  const user = await getServerUser();
  const teamScores = await getTeamScores();
  const teamScore =
    teamScores.find((x) => x.name === user.game.team)?.stats.score || 0;
  const teamColours = mapTeamToColour(user.game.team);

  return (
    <PageWrapper theme={teamColours} user={user} teamScore={teamScore}>
      <PagePinger location="mine" />
      <MiningGame />
    </PageWrapper>
  );
};

export const dynamic = "force-dynamic";

export default MinePage;
