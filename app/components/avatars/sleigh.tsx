import type { SimplifiedUser } from "../../data/user";

interface SleighAvatarProps {
  user: SimplifiedUser;
  isLoggedInUser?: boolean;
}

export const SleighAvatar = ({ user, isLoggedInUser }: SleighAvatarProps) => {
  return (
    <div title={user.name}>
      <div className="w-full mx-auto relative">
        <p className="sr-only">A visual card of an elf for {user.name}</p>
        <img
          src="/static/avatars/sleigh.png"
          alt="user frame"
          className={`w-full relative z-10 rounded border-2  ${isLoggedInUser ? "border-amber-300" : "border-black"}`}
        />
        <img
          src={`/api/avatar/${user.userId}`}
          alt="user profile"
          className="rounded-full absolute z-1"
          style={{ top: "27%", left: "30%", width: "32%" }}
        />
      </div>
      <p className="truncate w-full px-2 mx-auto mt-1">{user.name}</p>
    </div>
  );
};
