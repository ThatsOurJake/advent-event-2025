import type { SimplifiedUser } from "../../data/user";

interface GenericAvatarProps {
  user: SimplifiedUser;
  isLoggedInUser?: boolean;
}

export const GenericAvatar = ({ user, isLoggedInUser }: GenericAvatarProps) => {
  return (
    <div title={user.name}>
      <div className="w-full mx-auto relative">
        <p className="sr-only">A visual card of an elf for {user.name}</p>
        <img
          src="/static/avatars/elf.png"
          alt="user frame"
          className={`w-full relative z-10 rounded border-2  ${isLoggedInUser ? "border-amber-300" : "border-black"}`}
        />
        <img
          src={`/api/avatar/${user.userId}`}
          alt="user profile"
          className="rounded-full absolute z-1"
          style={{ top: "28%", left: "34%", width: "29%" }}
        />
      </div>
      <p className="truncate w-full px-2 mx-auto mt-1 text-center">
        {user.name}
      </p>
    </div>
  );
};
