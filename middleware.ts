import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/tickets/:path*",
    "/api/tickets/:path*",
    "/api/drafts/:path*",
    "/api/search-kb/:path*",
  ],
};
