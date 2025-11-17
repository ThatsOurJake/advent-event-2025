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
              <div className="grid grid-cols-7">
                {x.users.map((u) => (
                  <div className="p-1" key={u.userId}>
                    <div className="w-full mx-auto relative">
                      <p className="sr-only">
                        A visual card of an elf for {u.name}
                      </p>
                      <img
                        src="/static/elf.png"
                        alt="user frame"
                        className={`w-full relative z-10 rounded border-2  ${user.userId === u.userId ? "border-amber-300" : "border-black"}`}
                      />
                      <img
                        src={`/api/avatar/${u.userId}`}
                        alt="user profile"
                        className="rounded-full absolute z-1"
                        style={{ top: "28%", left: "34%", width: "29%" }}
                      />
                    </div>
                    <p
                      className="truncate max-w-4/5 mx-auto mt-1"
                      title={u.name}
                    >
                      {u.name}
                    </p>
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
