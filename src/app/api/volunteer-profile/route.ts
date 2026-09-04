import { NextRequest, NextResponse } from "next/server";
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import { connect } from "@/database/mongo.config";
import { exactEmailMatch, getSessionFromRequest, normalizeEmail } from "@/lib/auth";
import { User } from "@/models/User";
import { VolunteerProfile } from "@/models/VolunteerProfile";
import { volunteerInviteAcceptSchema } from "@/validator/volunteerInviteSchema";
import { normalizeRole } from "@/lib/roles";
export const dynamic = "force-dynamic";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

async function requireVolunteer(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session?.email) {
    return { error: "Please log in first.", status: 401 } as const;
  }
  const user = await User.findOne({ email: exactEmailMatch(normalizeEmail(session.email)) }).lean();
  const role = normalizeRole((user as any)?.role);
  if (role !== "Volunteer" && role !== "Admin") {
    return { error: "Only volunteers can access this.", status: 403 } as const;
  }
  return { session, email: normalizeEmail(session.email) };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    await connect();

    const auth = await requireVolunteer(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: corsHeaders() });
    }

    const profile = (await VolunteerProfile.findOne({ email: auth.email }).lean()) as any;
    return NextResponse.json(
      {
        profile: profile
          ? {
              phone: profile.phone || "",
              city: profile.city || "",
              state: profile.state || "",
              language: profile.language || "",
              interests: profile.interests || [],
            }
          : { phone: "", city: "", state: "", language: "", interests: [] },
      },
      { headers: corsHeaders() },
    );
  } catch (error: any) {
    console.error("Volunteer profile lookup error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();

    const auth = await requireVolunteer(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: corsHeaders() });
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

    const user = await User.findOne({ email: exactEmailMatch(auth.email) }).lean();
    const profile = (await VolunteerProfile.findOneAndUpdate(
      { email: auth.email },
      {
        $set: {
          name: (user as any)?.name || "Sahaja Yogi",
          email: auth.email,
          phone: output.phone,
          city: output.city,
          state: output.state || "",
          language: output.language || "",
          interests: output.interests || [],
          isActive: true,
        },
      },
      { upsert: true, new: true },
    )) as any;

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        profile: {
          phone: profile.phone || "",
          city: profile.city || "",
          state: profile.state || "",
          language: profile.language || "",
          interests: profile.interests || [],
        },
      },
      { headers: corsHeaders() },
    );
  } catch (error: any) {
    console.error("Volunteer profile update error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
