// app/api/seekers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Seeker } from "@/models/Seeker";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/options"

connect();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user?.name || 'Unknown User';

    const seekers = await req.json();

    // Add the user to each seeker entry
    const seekersWithUser = seekers.map((seeker: any) => ({
      ...seeker,
      addedBy: user,
      addedAt: new Date()
    }));

    const createdSeekers = await Seeker.insertMany(seekersWithUser);

    return NextResponse.json({ message: "Seekers added successfully", data: createdSeekers }, { status: 201 });
  } catch (error) {
    console.error("Error adding seekers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}