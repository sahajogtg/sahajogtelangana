import { connect } from "@/database/mongo.config";
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions, ISODateString, User } from "next-auth";
import { User as UserModel } from "@/models/User";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";

export type CustomSession = {
  user?: CustomUser;
  expires: ISODateString;
};

export type CustomUser = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
};

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/login",
  },
  
  // debug: process.env.NODE_ENV === "development",
  debug: true,
 
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      connect();
      try {
        const findUser = await UserModel.findOne({ email: user.email });
        if (findUser) {
          return true;
        }
        await UserModel.create({
          email: user.email,
          name: user.name,
          role: "User",
        });
        return true;
      } catch (error) {
        console.log("The error is ", error);
        return false;
      }      
    },

    async jwt({ token, user }: { token: JWT; user: CustomUser }) {
      // console.log("JWT Callback - Token:", JSON.stringify(token));
      // console.log("JWT Callback - User:", JSON.stringify(user));
      if (user) {
        user.role = user?.role == null ? "User" : user?.role;
        token.user = user;
      }
      // console.log("JWT Callback - Modified Token:", JSON.stringify(token));
      return token;
    },
    
    async session({
      session,
      token,
      user,
    }: {
      session: CustomSession;
      token: JWT;
      user: User;
    }) {
      // console.log("Session Callback - Token:", JSON.stringify(token));
      // console.log("Session Callback - User:", JSON.stringify(user));
      // console.log("Session Callback - Initial Session:", JSON.stringify(session));
      session.user = token.user as CustomUser;
      // console.log("Session Callback - Modified Session:", JSON.stringify(session));
      return session;
    },

  },
  providers: [
    Credentials({
      name: "Welcome Back",
      type: "credentials",

      // defining input for next auth
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        // * Connect to the MongoDb
        connect();
        const user = await UserModel.findOne({ email: credentials?.email });
        if (user) {
          // Check password if it exists (for credential provider)
          if (credentials?.password && user.password) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (isPasswordCorrect) {
              return user;
            } else {
              return null;
            }
          }
          // For OAuth providers that don't use password
          return user;
        } else {
          return null;
        }
      },
    }),

    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
};
