import { PagePinger } from "../components/page-pinger";
import { PageWrapper } from "../components/page-wrapper";
import { getServerUser } from "../components/server-hooks/get-server-user";
import { KEY_ORE_STORED } from "../constants";
import { getTeamScores } from "../data/teams";
import redis from "../services/redis";
import { constructTeamKey } from "../utils/construct-team-key";
import { mapTeamToColour } from "../utils/map-team";
import ForgeGame from "./game";

const ForgePage = async () => {
  const user = await getServerUser();
  const teamScores = await getTeamScores();
  const teamScore =
    teamScores.find((x) => x.name === user.game.team)?.stats.score || 0;
  const teamColours = mapTeamToColour(user.game.team);
  const oreStored = await redis.get(
    constructTeamKey(user.game.team, KEY_ORE_STORED),
  );

  return (
    <PageWrapper theme={teamColours} user={user} teamScore={teamScore}>
      <PagePinger location="forge" />
      <ForgeGame oreStored={Number(oreStored) || 0} />
    </PageWrapper>
  );
};

export default ForgePage;
