import { ForgeAvatar } from "../components/avatars/forge";
import { MineAvatar } from "../components/avatars/miner";
import { SleighAvatar } from "../components/avatars/sleigh";
import { WrapAvatar } from "../components/avatars/wrap";
import { StoredPerDayGraph } from "../components/charts/stored-per-day";
import { UserContributionsGraph } from "../components/charts/user-contributions";
import { getServerUser } from "../components/server-hooks/get-server-user";
import { getUsersActivity } from "../data/get-activity-feed";
import { getLatestMVE } from "../data/mve";
import { getSnapshots, getTeamScores } from "../data/teams";
import { mapTeamToColour, mapTeamToName } from "../utils/map-team";

const GraphsPage = async () => {
  const user = await getServerUser();

  const teamSnapshots = await getSnapshots();
  const userActivity = await getUsersActivity(user.userId);
  const mves = await getLatestMVE();
  const teamScores = await getTeamScores();

  const [first, second, third] = teamScores.sort(
    (a, b) => b.stats.score - a.stats.score,
  );

  const sanitisedTeamSnapshots = JSON.parse(JSON.stringify(teamSnapshots));
  const sanitisedUserActivity = JSON.parse(JSON.stringify(userActivity));

  return (
    <div className="space-y-2">
      <div className="bg-white rounded border-2 p-2 text-center">
        <p className="text-3xl font-bold">Graphs and Stats</p>
        <p className="italic py-1 text-sm">
          This screen contains various graphs and stats recorded throughout the
          event
        </p>
      </div>
      <div className="bg-pink-50 rounded border-2 p-2">
        <p className="text-center text-2xl mb-2">Final Podium</p>
        <div className="grid grid-cols-3 w-1/3 mx-auto">
          <div className="flex flex-col-reverse px-1">
            <div className="bg-gray-300 rounded border h-28 flex justify-center items-center">
              <p className="font-bold text-center">
                Score [{second.stats.score}]
              </p>
            </div>
            <p
              className={`pb-2 text-center font-bold ${mapTeamToColour(second.name).teamLinkColour}`}
            >
              {mapTeamToName(second.name)}
            </p>
          </div>
          <div className="flex flex-col-reverse px-1">
            <div className="bg-yellow-300 rounded border h-40 flex justify-center items-center">
              <p className="font-bold text-center">
                Score [{first.stats.score}]
              </p>
            </div>
            <p
              className={`pb-2 text-center font-bold ${mapTeamToColour(first.name).teamLinkColour}`}
            >
              {mapTeamToName(first.name)}
            </p>
          </div>
          <div className="flex flex-col-reverse px-1">
            <div className="bg-orange-500 rounded border h-18 flex justify-center items-center">
              <p className="font-bold text-center">
                Score [{third.stats.score}]
              </p>
            </div>
            <p
              className={`pb-2 text-center font-bold ${mapTeamToColour(third.name).teamLinkColour}`}
            >
              {mapTeamToName(third.name)}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded border-2 p-2">
        <p className="text-center font-bold">Your contributions per day</p>
        <div className="w-1/2 mx-auto aspect-video my-2">
          <UserContributionsGraph data={sanitisedUserActivity} />
        </div>
      </div>
      <div className="bg-white rounded border-2 p-2">
        <p className="text-center font-bold">Team contributions per day</p>
        <div className="grid grid-cols-2">
          <div className="aspect-video p-1">
            <StoredPerDayGraph
              data={sanitisedTeamSnapshots}
              statToShow="ore"
              title="Ore stored per day"
            />
          </div>
          <div className="aspect-video p-1">
            <StoredPerDayGraph
              data={sanitisedTeamSnapshots}
              statToShow="giftMounds"
              title="Gift mounds stored per day"
            />
          </div>
          <div className="aspect-video p-1">
            <StoredPerDayGraph
              data={sanitisedTeamSnapshots}
              statToShow="wrappedGifts"
              title="Wrapped gifts stored per day"
            />
          </div>
          <div className="aspect-video p-1">
            <StoredPerDayGraph
              data={sanitisedTeamSnapshots}
              statToShow="score"
              title="Overall Score per day"
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded border-2 p-2">
        <p className="text-center font-bold">Most Valued Elves</p>
        <div className="grid grid-cols-3 my-1">
          {mves?.awards.map((x) => {
            const { team, forge, mine, sleigh, wrap } = x;
            const { background, teamLinkColour } = mapTeamToColour(team);
            const teamName = mapTeamToName(team);

            return (
              <div
                key={team}
                className={`${background} rounded border-2 m-1 p-1`}
              >
                <p className={`${teamLinkColour} text-center font-bold`}>
                  {teamName}
                </p>
                <div className="grid grid-cols-2 gap-x-2">
                  {mine.userName && (
                    <div className="flex flex-col text-center p-2">
                      <MineAvatar
                        user={{ name: mine.userName, userId: mine.userId }}
                      />
                      <p>Mined "{mine.count}" ore</p>
                    </div>
                  )}
                  {forge.userName && (
                    <div className="flex flex-col text-center p-2">
                      <ForgeAvatar
                        user={{ name: forge.userName, userId: forge.userId }}
                      />
                      <p>Forged "{forge.count}" gift mounds</p>
                    </div>
                  )}
                  {wrap.userName && (
                    <div className="flex flex-col text-center p-2">
                      <WrapAvatar
                        user={{ name: wrap.userName, userId: wrap.userId }}
                      />
                      <p>Wrapped "{wrap.count}" presents</p>
                    </div>
                  )}
                  {sleigh.userName && (
                    <div className="flex flex-col text-center p-2">
                      <SleighAvatar
                        user={{ name: sleigh.userName, userId: sleigh.userId }}
                      />
                      <p>Scored "{sleigh.count}" points</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GraphsPage;
