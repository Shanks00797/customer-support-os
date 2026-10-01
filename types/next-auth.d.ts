import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "admin" | "agent";
    tenantId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "agent";
      tenantId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "agent";
    tenantId: string;
  }
}
