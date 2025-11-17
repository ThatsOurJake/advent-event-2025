import { ChoreList } from "./components/chores-list";
import { PageWrapper } from "./components/page-wrapper";
import { getServerUser } from "./components/server-hooks/get-server-user";
import { KEY_SCORE } from "./constants";
import { getTeamScores } from "./data/teams";
import redis from "./services/redis";
import { constructTeamKey } from "./utils/construct-team-key";
import { mapTeamToColour, mapTeamToName } from "./utils/map-team";

const Home = async () => {
  const user = await getServerUser();
  const teamScore =
    (await redis.get(constructTeamKey(user.game.team, KEY_SCORE))) || "0";
  const teamColours = mapTeamToColour(user.game.team);
  const teamScores = await getTeamScores();

  return (
    <PageWrapper theme={teamColours} user={user} teamScore={teamScore}>
      <ChoreList />
      <div className="bg-white m-2 p-2 border-2 rounded">
        <p className="text-center font-bold text-2xl mb-2">
          Faction Statistics
        </p>
        <div className="grid grid-cols-3">
          {teamScores.map((s) => (
            <div
              key={`score:${s.name}`}
              className={`${mapTeamToColour(s.name).background} m-1 p-2 rounded border-2`}
            >
              <p className="text-xl font-bold text-center">
                {mapTeamToName(s.name)}
              </p>
              <p className="text-center">Current Score: {s.stats.score}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;
