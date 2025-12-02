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
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, account, profile }) => {
      if (account && profile) {
        token.oid = profile.oid;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Use old sub from session for user if oid doesn't exist
      // This is to help with the migration
      if (token.sub && !token.oid) {
        session.user.id = token.oid as string;
      }

      if (token.oid) {
        session.user.id = token.oid as string;
      }

      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});
