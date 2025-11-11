import { ChoreList } from "./components/chores-list";
import { PageWrapper } from "./components/page-wrapper";
import { getServerUser } from "./components/server-hooks/get-server-user";
import { KEY_SCORE } from "./constants";
import redis from "./services/redis";
import { constructTeamKey } from "./utils/construct-team-key";
import { mapTeamToColour } from "./utils/map-team";

const Home = async () => {
  const user = await getServerUser();
  const teamScore =
    (await redis.get(constructTeamKey(user.game.team, KEY_SCORE))) || "0";
  const teamColours = mapTeamToColour(user.game.team);

  return (
    <PageWrapper theme={teamColours} user={user} teamScore={teamScore}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <ChoreList />
        <div>
          <div className="p-2 bg-orange-100 rounded border-2 mb-2">
            <p className="text-center font-bold">Bulletin board</p>
            <p className="px-4 text-center">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
              malesuada pellentesque urna sit amet sollicitudin. Suspendisse
              suscipit laoreet finibus. Mauris gravida leo sed leo rutrum, non
              convallis dui venenatis. Nulla.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Home;
