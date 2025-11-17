import Link from "next/link";
import { ChoreList } from "./components/chores-list";
import { PageWrapper } from "./components/page-wrapper";
import { getServerUser } from "./components/server-hooks/get-server-user";
import { KEY_SCORE } from "./constants";
import { getMessages } from "./data/bulletin-board";
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
  const bulletinBoardMessages = await getMessages(user.game.team);

  return (
    <PageWrapper
      theme={teamColours}
      user={user}
      teamScore={teamScore}
      bulletinBoardMessages={JSON.parse(JSON.stringify(bulletinBoardMessages))}
    >
      <ChoreList />
      <div className="bg-white m-2 p-2 border-2 rounded">
        <p className="text-center font-bold text-2xl mb-2">
          Faction Statistics
        </p>
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
    </PageWrapper>
  );
};

export default Home;
