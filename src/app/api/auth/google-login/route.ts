import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { User as UserModel } from "@/models/User";
import { encode } from "next-auth/jwt";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	await connect();

	try {
		const body = await request.json().catch(() => ({}));
		const { idToken } = body;
		if (!idToken) {
			return NextResponse.json(
				{ status: 400, message: "idToken is required." },
				{ status: 400 }
			);
		}

		// Verify Google ID Token against Google's tokeninfo API
		const verifyRes = await fetch(
			`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
		);
		if (!verifyRes.ok) {
			return NextResponse.json(
				{ status: 401, message: "Invalid Google ID token." },
				{ status: 401 }
			);
		}

		const payload = await verifyRes.json();
		const { email, name, picture } = payload;

		if (!email) {
			return NextResponse.json(
				{ status: 400, message: "Google ID token has no email." },
				{ status: 400 }
			);
		}

		// Find user or create if not exists
		let user = await UserModel.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
		if (!user) {
			user = await UserModel.create({
				email,
				name: name || email.split("@")[0],
				role: "User",
				avtar: picture || null,
			});
		}

		// Generate JWT Web Token matching same signature as NextAuth
		const tokenPayload = {
			id: String(user._id),
			name: user.name,
			email: user.email,
			role: user.role || "User",
			picture: user.avtar || null,
		};

		const nextAuthToken = await encode({
			token: tokenPayload,
			secret: process.env.NEXTAUTH_SECRET!,
			maxAge: 30 * 24 * 60 * 60, // 30 days life expectancy
		});

		return NextResponse.json(
			{
				status: 200,
				token: nextAuthToken,
				user: {
					id: String(user._id),
					email: user.email,
					name: user.name,
					role: user.role,
					avatar: user.avtar,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Direct Google authentication error:", error);
		return NextResponse.json(
			{ status: 500, message: "Internal server error." },
			{ status: 500 }
		);
	}
}
