import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connect } from "@/database/mongo.config";
import { CorporateRegister } from '@/models/CorporateRegister';
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

export const fetchCache = 'force-no-store';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    await connect();
    const session = (await getServerSession(authOptions)) as CustomSession | null;
    if (!session || session.user?.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const programRequests = await CorporateRegister.find({}).sort({ createdAt: -1 });
    return NextResponse.json(programRequests, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to fetch program requests:', error);
    return NextResponse.json({ error: 'Failed to fetch program requests' }, { status: 500 });
  }
}
