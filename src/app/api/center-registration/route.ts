import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { Seeker } from "@/models/Seeker";
import { Center } from "@/models/Center";
import { sendEmail } from "@/config/mail";
import { inferGender } from "@/lib/gender-inference";

export const dynamic = "force-dynamic";

const phonePattern = /^[0-9+\-\s()]{8,15}$/;

function clean(value: unknown, maxLength = 160) {
  return String(value || "").trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = clean(body.name, 80);
    const phone = clean(body.phone, 20);
    const centerName = clean(body.centerName, 120);
    const centerId = clean(body.centerId, 50);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (!phone || !phonePattern.test(phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    await connect();

    let coordinatorPhone = "";
    if (centerId) {
      try {
        const center = await Center.findById(centerId).lean();
        if (center?.contactNumbers) {
          coordinatorPhone = center.contactNumbers.replace(/[^0-9+]/g, "");
        }
      } catch (err) {
        console.error("Failed to fetch center for WhatsApp button:", err);
      }
    }
    console.log("Center registration - coordinatorPhone:", coordinatorPhone, "centerId:", centerId);

    const seeker = await Seeker.create({
      name,
      phone,
      city: "Hyderabad",
      email: "",
      locality: "",
      preferredLanguage: "English",
      gender: inferGender(name),
      centerInterest: centerName || "",
      eventInterest: "",
      notes: centerId ? `Registered via center page: ${centerId}` : "Registered via center page",
      source: "Center Page Registration",
      followUpStatus: "New",
      addedBy: "Self Registration",
      addedAt: new Date(),
    });

    const emailSubject = `New Center Registration — ${name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #292420; margin-bottom: 16px;">New Center Registration</h2>
        <p style="color: #555; line-height: 1.6;">A new person has registered to attend a meditation center.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; color: #292420;">Name</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; color: #292420;">Phone</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">${phone}</td>
          </tr>
          ${centerName ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; color: #292420;">Center</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">${centerName}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; color: #292420;">Source</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">Center Page Registration</td>
          </tr>
        </table>
        ${coordinatorPhone ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 24px; margin-left: auto; margin-right: auto;">
          <tr>
            <td style="background-color: #25D366; border-radius: 8px; padding: 12px 24px;">
              <a href="https://wa.me/${coordinatorPhone.replace(/^\+/, "")}?text=${encodeURIComponent(`Hi, I just registered for the ${centerName} meditation center.\n\nName: ${name}\nPhone: ${phone}`)}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                Contact Coordinator on WhatsApp
              </a>
            </td>
          </tr>
        </table>
        ` : ""}
        <p style="color: #999; font-size: 12px; margin-top: 24px;">This registration was submitted from the Sahaja Yoga Telangana website.</p>
      </div>
    `;

    await sendEmail("sahajogtelangana@gmail.com", emailSubject, emailHtml).catch((err) => {
      console.error("Failed to send center registration email:", err);
    });

    return NextResponse.json(
      { message: "Registration successful. We look forward to seeing you!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to process center registration:", error);
    return NextResponse.json({ error: "Unable to register right now. Please try again." }, { status: 500 });
  }
}
