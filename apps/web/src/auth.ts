import NextAuth from 'next-auth'
import { userService } from '@ecom/api/modules/iam/services/user-service'
import Credentials from 'next-auth/providers/credentials'
import authConfig from "./auth.config"

// auth.ts — server-only. Contains the real authorize() which uses bcrypt + Prisma.
// The JWT/session callbacks and session strategy are defined in auth.config.ts
// so they are shared with the edge-compatible middleware.
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
          return {
            id: user.id,
            email: user.email,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'Shopper',
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error in authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!profile?.email) return false;
        
        try {
          const dbUser = await userService.upsertOAuthAccount(
            account.provider,
            account.providerAccountId,
            {
              email: profile.email,
              firstName: (profile as any).given_name,
              lastName: (profile as any).family_name,
            }
          );
          
          user.id = dbUser.id;
          (user as any).role = dbUser.role;
          return true;
        } catch (error) {
          console.error("OAuth error:", error);
          return false;
        }
      }
      return true;
    }
  }
})

