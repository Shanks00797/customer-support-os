import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import type { Tenant, User } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password, tenantName } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof tenantName !== "string"
    ) {
      return NextResponse.json(
        { error: "Name, email, password, and tenantName are required." },
        { status: 400 },
      );
    }

    if (!name.trim() || !email.trim() || !password || !tenantName.trim()) {
      return NextResponse.json(
        { error: "Name, email, password, and tenantName are required." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("support-os");

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await db.collection<User>("users").findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Unable to create account with these details." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const tenant: Tenant = {
      name: tenantName.trim(),
      subscriptionTier: "free",
      createdAt: new Date(),
    };

    const tenantResult = await db
      .collection<Tenant>("tenants")
      .insertOne(tenant);

    const user: User = {
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      role: "admin",
      tenantId: tenantResult.insertedId.toString(),
    };

    const userResult = await db.collection<User>("users").insertOne(user);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userResult.insertedId.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
        tenant: {
          id: tenantResult.insertedId.toString(),
          name: tenant.name,
          subscriptionTier: tenant.subscriptionTier,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration failed:", error);

    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 },
    );
  }
}
