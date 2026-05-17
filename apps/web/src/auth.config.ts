import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

export default {
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      // authorize() is intentionally a no-op here.
      // The real authorize() lives in auth.ts (server-only).
      // This stub is required for the edge-compatible middleware build.
      async authorize() {
        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // Persist role and id into the JWT when the user first signs in.
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    session({ session, token }) {
      // Expose id and role on session.user so middleware can read them.
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig
