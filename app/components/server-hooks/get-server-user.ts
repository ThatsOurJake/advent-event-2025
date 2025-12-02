import { auth } from "@/app/auth";
import { createUser, getUser } from "@/app/data/user";

export const getServerUser = async () => {
  const session = await auth();

  if (!session) {
    throw new Error("User not logged in");
  }

  const sessionUser = session.user!;

  const user = await getUser(sessionUser.id!, sessionUser.name!);

  if (!user) {
    const newUser = await createUser({
      sub: sessionUser.id!,
      name: sessionUser.name!,
    });

    return newUser!;
  }

  return user!;
};
