import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@ecom/db'
import { userService } from '@ecom/api/modules/iam/services/user-service'
import Credentials from 'next-auth/providers/credentials'
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          console.log("Authorizing:", credentials.email);
          const user = await userService.validateCredentials(
            credentials.email as string,
            credentials.password as string
          );
          if (!user) {
            console.log("No user found or invalid password");
            return null;
          }
          console.log("User authorized:", user.id);
          return {
            id: user.id,
            email: user.email,
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error - role is added to token
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        // @ts-expect-error - role is added to session user
        session.user.role = token.role;
      }
      return session;
    }
  },
})

