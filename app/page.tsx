import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgeAvatar } from "./components/avatars/forge";
import { MineAvatar } from "./components/avatars/miner";
import { SleighAvatar } from "./components/avatars/sleigh";
import { WrapAvatar } from "./components/avatars/wrap";
import { ChoreList } from "./components/chores-list";
import { PageWrapper } from "./components/page-wrapper";
import { getServerUser } from "./components/server-hooks/get-server-user";
import { COOKIE_BULLETINS_DISMISSED } from "./constants";
import { getMessages } from "./data/bulletin-board";
import { getLatestMVE } from "./data/mve";
import { getTeamScores } from "./data/teams";
import {
  isAfterEventDate,
  isBeforeEventDate,
} from "./utils/event-date-helpers";
import { mapTeamToColour, mapTeamToName } from "./utils/map-team";

const Home = async () => {
  const eventFinished = isAfterEventDate();

  if (eventFinished) {
    return redirect("/graphs");
  }

  if (isBeforeEventDate()) {
    return redirect("/pre-registration");
  }

  const cookieStore = await cookies();
  const user = await getServerUser();
  const teamColours = mapTeamToColour(user.game.team);
  const teamScores = await getTeamScores();
  const bulletinBoardMessages = await getMessages(user.game.team);
  const dismissedBulletinsCookie = cookieStore.get(COOKIE_BULLETINS_DISMISSED);
  const dismissedIds = dismissedBulletinsCookie
    ? dismissedBulletinsCookie.value.split("|")
    : [];
  const filteredMessages = bulletinBoardMessages.filter((x) => {
    return !dismissedIds.includes(x._id?.toString() || "");
  });
  const mve = await getLatestMVE();
  const teamMves = mve?.awards.find((x) => x.team === user.game.team);
  const formattedDate = new Date(
    mve?.timestamp || Date.now(),
  ).toLocaleDateString("en-GB");
  const teamScore =
    teamScores.find((x) => x.name === user.game.team)?.stats.score || 0;

  return (
    <PageWrapper
      theme={teamColours}
      user={user}
      teamScore={teamScore}
      bulletinBoardMessages={JSON.parse(JSON.stringify(filteredMessages))}
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
      {mve && teamMves && (
        <div className="bg-yellow-100 m-2 p-2 border-2 rounded">
          <p className="text-2xl font-bold text-center">
            Hardest working elves for the{" "}
            <span className={`${teamColours.teamLinkColour}`}>
              {mapTeamToName(user.game.team)}
            </span>
          </p>
          <p className="text-sm text-center">
            Last Updated {formattedDate} [Updates every 5 days]
          </p>
          <p className="italic text-sm text-center">
            All elves are hard working, but these elves have been focusing their
            energy on each task the most!
          </p>
          <div className="grid grid-cols-4 my-2">
            {teamMves.mine.count > 0 && teamMves.mine.userName && (
              <div>
                <p className="text-center truncate font-semibold">
                  Chief Miner
                </p>
                <div className="w-2/3 mx-auto my-2">
                  <MineAvatar
                    user={{
                      userId: teamMves.mine.userId,
                      name: teamMves.mine.userName,
                    }}
                  />
                </div>
                <p className="text-center text-sm">
                  Mined: {teamMves.mine.count} ore
                </p>
              </div>
            )}
            {teamMves.forge.count > 0 && teamMves.forge.userName && (
              <div>
                <p className="text-center truncate font-semibold">
                  Sweaty Blacksmith
                </p>
                <div className="w-2/3 mx-auto my-2">
                  <ForgeAvatar
                    user={{
                      userId: teamMves.forge.userId,
                      name: teamMves.forge.userName,
                    }}
                  />
                </div>
                <p className="text-center text-sm">
                  Forged: {teamMves.forge.count} gift mound(s)
                </p>
              </div>
            )}
            {teamMves.wrap.count > 0 && teamMves.wrap.userName && (
              <div>
                <p className="text-center truncate font-semibold">
                  Cellotape Master
                </p>
                <div className="w-2/3 mx-auto my-2">
                  <WrapAvatar
                    user={{
                      userId: teamMves.wrap.userId,
                      name: teamMves.wrap.userName,
                    }}
                  />
                </div>
                <p className="text-center text-sm">
                  Wrapped: {teamMves.wrap.count} gift(s)
                </p>
              </div>
            )}
            {teamMves.sleigh.count > 0 && teamMves.sleigh.userName && (
              <div>
                <p className="text-center truncate font-semibold">
                  Weightlifter
                </p>
                <div className="w-2/3 mx-auto my-2">
                  <SleighAvatar
                    user={{
                      userId: teamMves.sleigh.userId,
                      name: teamMves.sleigh.userName,
                    }}
                  />
                </div>
                <p className="text-center text-sm">
                  Loaded: {teamMves.sleigh.count} gift(s) onto the sleigh
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export const dynamic = "force-dynamic";

export default Home;
