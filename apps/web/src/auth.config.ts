import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export default {
  providers: [
    Credentials({
      async authorize() {
        return null;
      }
    })
  ],
} satisfies NextAuthConfig
