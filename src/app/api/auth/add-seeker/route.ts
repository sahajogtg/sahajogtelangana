// app/api/seekers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Seeker } from "@/models/Seeker";
import { exactEmailMatch, getSessionFromRequest, normalizeEmail } from "@/lib/auth";
import { User } from "@/models/User";
import { hasFeatureAccess } from "@/lib/roles";
import { inferGender } from "@/lib/gender-inference";

connect();

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecord = (await User.findOne(
      { email: exactEmailMatch(normalizeEmail(session.email)) },
      { name: 1, role: 1 }
    ).lean()) as any;

    if (!userRecord || !hasFeatureAccess(userRecord.role)) {
      return NextResponse.json({ error: "Only Yogis and Volunteers can add seeker records." }, { status: 403 });
    }

    const user = userRecord.name || session.name || 'Unknown User';

    const seekers = await req.json();
    if (!Array.isArray(seekers) || seekers.length === 0) {
      return NextResponse.json({ error: "At least one seeker is required." }, { status: 400 });
    }

    // Add the user to each seeker entry
    const seekersWithUser = seekers.map((seeker: any) => ({
      name: String(seeker.name || "").trim(),
      city: String(seeker.city || "").trim(),
      phone: String(seeker.phone || "").trim(),
      email: String(seeker.email || "").trim(),
      locality: seeker.locality || "",
      source: seeker.source || "Website",
      eventInterest: seeker.eventInterest || "",
      centerInterest: seeker.centerInterest || "",
      preferredLanguage: seeker.preferredLanguage || "English",
      gender: seeker.gender || inferGender(String(seeker.name || "")),
      followUpStatus: seeker.followUpStatus || "New",
      assignedVolunteer: seeker.assignedVolunteer || "",
      notes: seeker.notes || "",
      addedBy: user,
      addedAt: new Date(),
    }));

    const invalidIndex = seekersWithUser.findIndex((seeker: any) => !seeker.name || !seeker.city || !seeker.phone);
    if (invalidIndex !== -1) {
      return NextResponse.json(
        { error: `Seeker row ${invalidIndex + 1} is missing name, city, or phone.` },
        { status: 400 }
      );
    }

    const createdSeekers = await Seeker.insertMany(seekersWithUser);

    return NextResponse.json({ message: "Seekers added successfully", data: createdSeekers }, { status: 201 });
  } catch (error) {
    console.error("Error adding seekers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
