import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { exactEmailMatch, normalizeEmail, requireAdminSession } from "@/lib/auth";
import { Seeker } from "@/models/Seeker";
import { sendEmail } from "@/config/mail";
import { User } from "@/models/User";
import { EventRegistration } from "@/models/EventRegistration";
import { Event } from "@/models/Event";
export const dynamic = "force-dynamic";

function buildQuery(searchParams: URLSearchParams) {
  const query: Record<string, any> = {};
  const city = searchParams.get("city");
  const centerInterest = searchParams.get("centerInterest");
  const eventInterest = searchParams.get("eventInterest");
  const followUpStatus = searchParams.get("followUpStatus");

  if (city) {
    query.city = city;
  }

  if (centerInterest) {
    query.centerInterest = centerInterest;
  }

  if (eventInterest) {
    query.eventInterest = eventInterest;
  }

  if (followUpStatus) {
    query.followUpStatus = followUpStatus;
  }

  return query;
}

async function loadAudienceUsers(searchParams: URLSearchParams) {
  const city = searchParams.get("city");
  const centerInterest = searchParams.get("centerInterest");
  const eventInterest = searchParams.get("eventInterest");
  const followUpStatus = searchParams.get("followUpStatus");

  if (followUpStatus && followUpStatus !== "Registered user") {
    return [];
  }

  const userQuery: Record<string, any> = {
    role: { $ne: "Admin" },
  };

  if (city) {
    userQuery.city = city;
  }

  if (centerInterest) {
    userQuery.centerInterest = centerInterest;
  }

  const users = (await User.find(userQuery).sort({ name: 1 }).lean()) as any[];
  if (users.length === 0) {
    return [];
  }

  const userEmails = users
    .map((user) => normalizeEmail(user.email))
    .filter(Boolean);

  let eventInterestMap = new Map<string, string[]>();

  if (userEmails.length > 0) {
    const registrations = (await EventRegistration.find(
      { $or: userEmails.map((email) => ({ email: exactEmailMatch(email) })) },
      { email: 1, eventId: 1, eventTitle: 1 }
    ).lean()) as any[];
    const eventIds = Array.from(
      new Set(registrations.map((registration) => String(registration.eventId || "")).filter(Boolean))
    );
    const liveEvents = (await Event.find({ _id: { $in: eventIds } }, { _id: 1, title: 1 }).lean()) as any[];
    const liveEventMap = new Map(liveEvents.map((event: any) => [String(event._id), event.title]));

    for (const registration of registrations) {
      const email = normalizeEmail(registration.email);
      const liveTitle = liveEventMap.get(String(registration.eventId || ""));
      if (!email || !liveTitle) {
        continue;
      }

      const current = eventInterestMap.get(email) || [];
      if (!current.includes(liveTitle)) {
        current.push(liveTitle);
        current.sort((a, b) => a.localeCompare(b));
        eventInterestMap.set(email, current);
      }
    }
  }

  return users
    .map((user) => {
      const email = String(user.email || "").trim().toLowerCase();
      const eventInterests = eventInterestMap.get(email) || [];
      return {
        _id: String(user._id),
        name: user.name,
        city: user.city || "",
        phone: "",
        email: user.email,
        centerInterest: user.centerInterest || "",
        eventInterest: eventInterests.join(", "),
        eventInterestList: eventInterests,
        followUpStatus: "Registered user",
      };
    })
    .filter((user) => {
      if (!eventInterest) {
        return true;
      }

      return user.eventInterestList.includes(eventInterest);
    });
}

export async function GET(request: NextRequest) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const audience = request.nextUrl.searchParams.get("audience") || "seekers";

  if (audience === "users") {
    const users = await loadAudienceUsers(request.nextUrl.searchParams);
    return NextResponse.json({
      status: 200,
      data: users,
    }, { status: 200 });
  }

  if (audience === "everyone") {
    const [seekers, users] = await Promise.all([
      Seeker.find(buildQuery(request.nextUrl.searchParams)).sort({ addedAt: -1 }).lean(),
      loadAudienceUsers(request.nextUrl.searchParams),
    ]);
    const merged = [...seekers, ...users];
    return NextResponse.json({ status: 200, data: merged }, { status: 200 });
  }

  const seekers = await Seeker.find(buildQuery(request.nextUrl.searchParams)).sort({ addedAt: -1 }).lean();
  return NextResponse.json({ status: 200, data: seekers }, { status: 200 });
}

export async function POST(request: NextRequest) {
  await connect();

  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const filters = new URLSearchParams(body.filters || {});
  const audience = String(body.audience || "seekers");

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const seekerAudience = audience === "seekers" || audience === "everyone";
  const userAudience = audience === "users" || audience === "everyone";
  const [seekers, users] = await Promise.all([
    seekerAudience ? Seeker.find(buildQuery(filters)).lean() : Promise.resolve([]),
    userAudience ? loadAudienceUsers(filters) : Promise.resolve([]),
  ]);
  const deduped = new Map<string, { name: string; email: string }>();

  for (const seeker of seekers as any[]) {
    if (seeker.email) {
      deduped.set(String(seeker.email).toLowerCase(), { name: seeker.name || "seeker", email: seeker.email });
    }
  }

  for (const user of users as any[]) {
    if (user.email) {
      deduped.set(String(user.email).toLowerCase(), { name: user.name || "user", email: user.email });
    }
  }

  const emailRecipients = Array.from(deduped.values());
  const sendResults = await Promise.allSettled(
    emailRecipients.map((recipient) =>
      sendEmail(
        recipient.email,
        subject,
        `<div style="font-family:Arial,sans-serif;line-height:1.6"><p>Dear ${recipient.name || "friend"},</p><p>${message.replace(/\n/g, "<br/>")}</p><p>With regards,<br/>Sahaja Yoga Telangana</p></div>`
      )
    )
  );
  const deliveredCount = sendResults.filter((result) => result.status === "fulfilled").length;
  const failedCount = sendResults.length - deliveredCount;

  return NextResponse.json(
    {
      status: 200,
      message:
        failedCount > 0
          ? `Outreach sent to ${deliveredCount} recipients. ${failedCount} email(s) failed and can be retried.`
          : `Outreach sent to ${emailRecipients.length} email recipients.`,
      meta: {
        totalMatches: emailRecipients.length,
        emailRecipients: emailRecipients.length,
        deliveredCount,
        failedCount,
      },
    },
    { status: 200 }
  );
}
