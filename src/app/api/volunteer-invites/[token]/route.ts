import { NextRequest, NextResponse } from "next/server";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import { connect } from "@/database/mongo.config";
import { exactEmailMatch, getSessionFromRequest, normalizeEmail } from "@/lib/auth";
import { User } from "@/models/User";
import { VolunteerInvite } from "@/models/VolunteerInvite";
import { VolunteerProfile } from "@/models/VolunteerProfile";
import { volunteerInviteAcceptSchema } from "@/validator/volunteerInviteSchema";
import { hashInviteToken, isInviteExpired } from "@/lib/invites";
export const dynamic = "force-dynamic";

type RouteContext = { params: { token: string } };

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function findInvite(token: string) {
  return VolunteerInvite.findOne({
    $or: [{ tokenHash: hashInviteToken(token) }, { token }],
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connect();

    const invite = await findInvite(params.token);
    if (!invite) {
      return NextResponse.json({ error: "Invite not found." }, { status: 404, headers: corsHeaders() });
    }

    const status = invite.status === "active" && isInviteExpired(invite) ? "expired" : invite.status;

    return NextResponse.json(
      {
        status,
        createdByEmail: invite.createdByEmail,
        usedByEmail: invite.usedByEmail,
        usedAt: invite.usedAt,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      },
      { headers: corsHeaders() },
    );
  } catch (error: any) {
    console.error("Volunteer invite lookup error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await connect();

    const session = await getSessionFromRequest(request);
    if (!session?.email || !session.id) {
      return NextResponse.json(
        { error: "You must be logged in to accept this invite." },
        { status: 401, headers: corsHeaders() },
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400, headers: corsHeaders() });
    }

    let output: { phone: string; city: string; state?: string; language?: string; interests?: string[] };
    try {
      vine.errorReporter = () => new ErrorReporter();
      const validator = vine.compile(volunteerInviteAcceptSchema);
      output = await validator.validate(body);
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return NextResponse.json(
          { error: "Please fill the required volunteer details correctly.", details: error.messages },
          { status: 400, headers: corsHeaders() },
        );
      }
      throw error;
    }

    const invite = await findInvite(params.token);
    if (!invite) {
      return NextResponse.json({ error: "Invite not found." }, { status: 404, headers: corsHeaders() });
    }

    if (invite.status !== "active" || isInviteExpired(invite)) {
      const expired = isInviteExpired(invite);
      return NextResponse.json(
        {
          error: expired ? "This invite link has expired." : "This invite has already been used.",
          code: expired ? "expired" : "used",
        },
        { status: 410, headers: corsHeaders() },
      );
    }

    const user = await User.findOne({ email: exactEmailMatch(normalizeEmail(session.email)) });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404, headers: corsHeaders() });
    }

    const currentRole = String(user.role || "").toLowerCase();
    if (currentRole === "volunteer" || currentRole === "admin") {
      return NextResponse.json({ error: "You are already a volunteer." }, { status: 409, headers: corsHeaders() });
    }

    // Atomic single-use claim: only one concurrent accept can flip active -> used.
    const claimed = await VolunteerInvite.findOneAndUpdate(
      { _id: invite._id, status: "active" },
      {
        $set: {
          status: "used",
          usedByEmail: normalizeEmail(session.email),
          usedAt: new Date(),
        },
      },
      { new: true },
    );
    if (!claimed) {
      return NextResponse.json(
        { error: "This invite has already been used." },
        { status: 410, headers: corsHeaders() },
      );
    }

    const userEmail = normalizeEmail(session.email);

    user.role = "Volunteer";
    await user.save();

    await VolunteerProfile.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          name: user.name || "Sahaja Yogi",
          email: userEmail,
          phone: output.phone,
          city: output.city,
          state: output.state || "",
          language: output.language || "",
          interests: output.interests || [],
          isActive: true,
          roles: ["follow-up"],
          staffingFocus: "follow-up volunteer",
        },
        $setOnInsert: {
          assignments: [],
          availability: "",
          notes: "Invited by " + invite.createdByEmail,
        },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json(
      {
        message: "You are now a volunteer!",
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name || "",
          role: "Volunteer",
        },
      },
      { status: 200, headers: corsHeaders() },
    );
  } catch (error: any) {
    console.error("Volunteer invite accept error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
