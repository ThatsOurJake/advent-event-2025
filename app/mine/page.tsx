import { PagePinger } from "../components/page-pinger";
import { PageWrapper } from "../components/page-wrapper";
import { getServerUser } from "../components/server-hooks/get-server-user";
import { KEY_SCORE } from "../constants";
import redis from "../services/redis";
import { constructTeamKey } from "../utils/construct-team-key";
import { mapTeamToColour } from "../utils/map-team";
import MiningGame from "./game";

const MinePage = async () => {
  const user = await getServerUser();
  const teamScore =
    (await redis.get(constructTeamKey(user.game.team, KEY_SCORE))) || "0";
  const teamColours = mapTeamToColour(user.game.team);

  return (
    <PageWrapper theme={teamColours} user={user} teamScore={teamScore}>
      <PagePinger location="mine" />
      <MiningGame />
    </PageWrapper>
  );
};

export default MinePage;
