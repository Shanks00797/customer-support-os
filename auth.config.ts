import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export default {
  providers: [],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    authorized({ auth, request }) {
      if (auth) {
        return true;
      }

      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      return false;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
