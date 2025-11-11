import { envStr } from "env-helpers";
import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: envStr("AUTH_SECRET"),
  providers: [
    MicrosoftEntraID({
      clientId: envStr("AUTH_MICROSOFT_ENTRA_ID_ID", ""),
      clientSecret: envStr("AUTH_MICROSOFT_ENTRA_ID_SECRET", ""),
      issuer: envStr("AUTH_MICROSOFT_ENTRA_ID_ISSUER", ""),
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});
