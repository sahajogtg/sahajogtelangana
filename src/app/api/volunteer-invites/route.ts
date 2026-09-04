import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { exactEmailMatch, getSessionFromRequest, normalizeEmail } from "@/lib/auth";
import { User } from "@/models/User";
import { VolunteerInvite } from "@/models/VolunteerInvite";
import { normalizeRole } from "@/lib/roles";
import {
  generateInviteToken,
  hashInviteToken,
  isInviteExpired,
  INVITE_TTL_MS,
  MAX_ACTIVE_INVITES,
} from "@/lib/invites";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function GET(request: NextRequest) {
  try {
    await connect();

    const session = await getSessionFromRequest(request);
    if (!session?.email) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401, headers: corsHeaders() });
    }

    const user = await User.findOne({ email: exactEmailMatch(normalizeEmail(session.email)) }).lean();
    const role = normalizeRole((user as any)?.role);
    if (role !== "Volunteer" && role !== "Admin") {
      return NextResponse.json({ error: "Only volunteers can view invites." }, { status: 403, headers: corsHeaders() });
    }

    const invites = await VolunteerInvite.find({ createdBy: session.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const now = Date.now();
    const payload = invites.map((invite) => ({
      _id: invite._id,
      status: invite.status === "active" && isInviteExpired(invite as { expiresAt?: Date | null }) ? "expired" : invite.status,
      usedByEmail: invite.usedByEmail,
      usedAt: invite.usedAt,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      expiresInMs: invite.expiresAt ? Math.max(0, invite.expiresAt.getTime() - now) : null,
    }));

    return NextResponse.json({ invites: payload }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error("Volunteer invite list error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    const session = await getSessionFromRequest(request);
    if (!session?.email) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401, headers: corsHeaders() });
    }

    const user = await User.findOne({ email: exactEmailMatch(normalizeEmail(session.email)) }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found. Please log in again." }, { status: 401, headers: corsHeaders() });
    }

    const role = normalizeRole((user as any)?.role);
    if (role !== "Volunteer" && role !== "Admin") {
      return NextResponse.json(
        { error: "Only volunteers can generate invite links." },
        { status: 403, headers: corsHeaders() },
      );
    }

    const activeCount = await VolunteerInvite.countDocuments({
      createdBy: session.id,
      status: "active",
      // Only invites that are still usable count toward the cap. Legacy invites
      // (no expiresAt) and past-due ones must not block new generations.
      $or: [{ expiresAt: { $gt: new Date() } }],
    });
    if (activeCount >= MAX_ACTIVE_INVITES) {
      return NextResponse.json(
        {
          error: `You already have ${MAX_ACTIVE_INVITES} active invite links. Use one before generating another.`,
        },
        { status: 429, headers: corsHeaders() },
      );
    }

    const token = generateInviteToken();
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    await VolunteerInvite.create({
      token,
      tokenHash: hashInviteToken(token),
      createdBy: session.id,
      createdByEmail: normalizeEmail(session.email),
      status: "active",
      expiresAt,
    });

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/invite/${token}`;

    return NextResponse.json({ inviteLink, token, expiresAt }, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    console.error("Volunteer invite generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
