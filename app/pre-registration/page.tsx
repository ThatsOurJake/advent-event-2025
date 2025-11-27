import { redirect } from "next/navigation";
import game from "../../game.json";
import { GenericAvatar } from "../components/avatars/generic";
import { getServerUser } from "../components/server-hooks/get-server-user";
import { isBeforeEventDate } from "../utils/event-date-helpers";
import { mapTeamToColour, mapTeamToName } from "../utils/map-team";

const PreRegistrationPage = async () => {
  if (!isBeforeEventDate()) {
    return redirect("/");
  }

  const user = await getServerUser();
  const team = user.game.team;
  const teamTheme = mapTeamToColour(team);

  return (
    <div className="bg-pink-100 rounded border-2 p-2">
      <p className="font-bold text-2xl text-center mb-2">Pre Registration</p>
      <div className="flex px-2">
        <div className="w-1/5">
          <GenericAvatar
            user={{ name: user.details.name, userId: user.userId }}
          />
        </div>
        <div className="w-4/5 px-4 space-y-1">
          <p className="font-bold">
            Welcome to the Christmas Advent Event 2025
          </p>
          <p>
            The event will start on the {game.startDate} and will run to the{" "}
            {game.endDate}
          </p>
          <p>
            This years event is slightly different and its recommended to read{" "}
            <a
              href={game.gameGuideLink}
              target="_blank"
              rel="noopener"
              className="text-purple-600 hover:underline"
            >
              this guide
            </a>
            .
          </p>
          <p>Some pre game pointers:</p>
          <ul className="list-disc list-inside">
            <li>⬅️ This is your unique Elf Identification Card</li>
            <li>
              This event aims to be a team event with there being 3 teams, you
              are part of the{" "}
              <span className={teamTheme.teamLinkColour}>
                {mapTeamToName(team)}
              </span>
            </li>
            <li>
              Your team has their own private teams group{" "}
              <a
                href={game.teamsChannels[team]}
                target="_blank"
                className="text-purple-600 hover:underline"
              >
                here
              </a>{" "}
              to discuss tactics, this isn't necessary as sometimes
              communication with strangers is tough 🤗
            </li>
            <li>
              The event page will only be accessible during work hours and on
              weekends the workshop will be closed, reopening again on Monday!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default PreRegistrationPage;
