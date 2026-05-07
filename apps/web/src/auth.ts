import NextAuth from 'next-auth'
import { userService } from '@ecom/api/modules/iam/services/user-service'
import Credentials from 'next-auth/providers/credentials'
import authConfig from "./auth.config"

// auth.ts — server-only. Contains the real authorize() which uses bcrypt + Prisma.
// The JWT/session callbacks and session strategy are defined in auth.config.ts
// so they are shared with the edge-compatible middleware.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Override the stub provider with the real one that validates credentials.
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await userService.validateCredentials(
            credentials.email as string,
            credentials.password as string
          );
          if (!user) return null;
          // Return id, email, and role — the jwt() callback in authConfig
          // will persist these into the JWT token.
          return {
            id: user.id,
            email: user.email,
            // @ts-expect-error - role is a custom field on the User model
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error in authorize:", error);
          return null;
        }
      }
    })
  ],
})

