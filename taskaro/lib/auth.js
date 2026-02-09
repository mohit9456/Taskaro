import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {
  findOrCreateGoogleUser,
  validateCredentials,
} from "@/server/services/auth.service";
import { connectToDatabase } from "@/server/db/mongodb";
import User from "@/server/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const user = await validateCredentials(
          credentials.email,
          credentials.password
        );

        if (!user) {
          return null;
        } else {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const dbUser = await findOrCreateGoogleUser(user);
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
      }
      return true;
    },

    async jwt({ token, user }) {
      // First login only
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      await connectToDatabase();

      const dbUser = await User.findById(token.id).select(
        "name role profileImage about createdAt"
      );

      if (dbUser) {
        session.user.id = token.id;
          session.user.name = dbUser.name;
        session.user.role = dbUser.role;
        session.user.profileImage = dbUser.profileImage;
        session.user.about = dbUser.about;
        session.user.createdAt = dbUser.createdAt;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
  trustHost: true, // 🔹 Add this
});
