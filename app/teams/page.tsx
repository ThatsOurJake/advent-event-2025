import { GenericAvatar } from "../components/avatars/generic";
import { getServerUser } from "../components/server-hooks/get-server-user";
import { getTeamRoster } from "../data/user";
import { mapTeamToColour, mapTeamToName } from "../utils/map-team";

const TeamsPage = async () => {
  const user = await getServerUser();
  const teams = await getTeamRoster();

  return (
    <>
      <p className="text-2xl font-bold underline text-center">Elf Factions</p>
      <div className="space-y-2 my-2">
        {teams.map((x) => {
          const theme = mapTeamToColour(x.team);
          const teamName = mapTeamToName(x.team);
          return (
            <section
              key={x.team}
              className={`p-2 ${theme.background} rounded border-2`}
            >
              <p className={`${theme.teamLinkColour} font-bold`}>{teamName}</p>
              <div className="grid grid-cols-8">
                {x.users.map((u) => (
                  <div className="p-1" key={u.userId}>
                    <GenericAvatar
                      user={u}
                      isLoggedInUser={u.userId === user.userId}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
};

export default TeamsPage;
