import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/database/mongo.config';
import { getRequiredSession } from '@/lib/auth';
import { Seeker } from '@/models/Seeker';
import { VolunteerProfile } from '@/models/VolunteerProfile';
import { INDIAN_CITIES, NEIGHBORING_STATES, CityEntry } from '@/data/indian-districts';
import { isTerminalStatus, computeSnoozedUntil } from '@/lib/seeker-snooze';
import { Gender } from '@/lib/gender-inference';

export const dynamic = 'force-dynamic';

type FollowUpVolunteer = {
  _id?: string;
  name: string;
  gender?: Gender;
  language?: string;
  city?: string;
  roles?: string[];
  staffingFocus?: string;
  isActive?: boolean;
};

function hasFollowUpAccess(volunteer: any) {
  const roles = Array.isArray(volunteer?.roles) ? volunteer.roles : [];
  const values = [...roles, volunteer?.staffingFocus || ''].map((value) => String(value).toLowerCase());
  return volunteer?.isActive !== false && values.some((value) => value.includes('follow'));
}

function resolveCity(cityName: string): CityEntry | undefined {
  return INDIAN_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
  );
}

async function getVolunteer(): Promise<{ session: any; volunteer: FollowUpVolunteer | null }> {
  const session = await getRequiredSession();
  if (!session?.user?.email) {
    return { session, volunteer: null };
  }

  await connect();
  const volunteer = await VolunteerProfile.findOne({
    email: String(session.user.email).trim().toLowerCase(),
    isActive: { $ne: false },
  }).lean<FollowUpVolunteer | null>();

  return { session, volunteer };
}

function seekerProjection() {
  return {
    name: 1,
    city: 1,
    phone: 1,
    email: 1,
    addedBy: 1,
    addedAt: 1,
    followUpStatus: 1,
    seekerPhase: 1,
    assignedVolunteer: 1,
    volunteerFollowUpCompletedAt: 1,
    volunteerFollowUpCompletedBy: 1,
    lastContactDate: 1,
    snoozedUntil: 1,
    snoozedBy: 1,
    snoozeReason: 1,
    source: 1,
    eventInterest: 1,
    centerInterest: 1,
    preferredLanguage: 1,
    gender: 1,
    notes: 1,
  };
}

export async function GET() {
  try {
    const { volunteer } = await getVolunteer();

    if (!volunteer || !hasFollowUpAccess(volunteer)) {
      return NextResponse.json(
        { error: 'You need an approved Follow-up volunteer profile to access seeker batches.' },
        { status: 403 }
      );
    }

    const seekers = await Seeker.find({
      assignedVolunteer: volunteer.name,
      $or: [{ volunteerFollowUpCompletedAt: { $exists: false } }, { volunteerFollowUpCompletedAt: null }],
    }, seekerProjection()).sort({ addedAt: 1 }).limit(12).lean();

    return NextResponse.json({ data: seekers }, { status: 200 });
  } catch (error) {
    console.error('Failed to load seeker follow-ups:', error);
    return NextResponse.json({ error: 'Failed to load seeker follow-ups.' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { volunteer } = await getVolunteer();

    if (!volunteer || !hasFollowUpAccess(volunteer)) {
      return NextResponse.json(
        { error: 'You need an approved Follow-up volunteer profile to claim seeker batches.' },
        { status: 403 }
      );
    }

    const activeCount = await Seeker.countDocuments({
      assignedVolunteer: volunteer.name,
      $or: [{ volunteerFollowUpCompletedAt: { $exists: false } }, { volunteerFollowUpCompletedAt: null }],
    });

    if (activeCount > 0) {
      const seekers = await Seeker.find({
        assignedVolunteer: volunteer.name,
        $or: [{ volunteerFollowUpCompletedAt: { $exists: false } }, { volunteerFollowUpCompletedAt: null }],
      }, seekerProjection()).sort({ addedAt: 1 }).limit(12).lean();

      return NextResponse.json(
        { data: seekers, claimed: 0, message: 'Please complete your current seeker batch before fetching another one.' },
        { status: 200 }
      );
    }

    const volLang = (volunteer.language || '').toLowerCase().trim();
    const volCity = (volunteer.city || '').trim();
    const volCityEntry = resolveCity(volCity);
    const volState = volCityEntry?.state || '';
    const volZone = volCityEntry?.zone || '';
    const neighboringStates = volState ? NEIGHBORING_STATES[volState] || [] : [];

    const unassignedFilter: any = {
      $and: [
        { $or: [{ assignedVolunteer: '' }, { assignedVolunteer: { $exists: false } }] },
        { $or: [
          { snoozedUntil: { $exists: false } },
          { snoozedUntil: null },
          { snoozedUntil: { $lte: new Date() } },
        ] },
      ],
    };

    if (volLang) {
      unassignedFilter.preferredLanguage = { $regex: new RegExp(`^${volLang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    }

    const volGender = (volunteer.gender || '').trim();
    if (volGender !== 'Female') {
      unassignedFilter.gender = { $in: ['Male', 'Unknown'] };
    }

    const candidates = await Seeker.find(unassignedFilter, { _id: 1, city: 1 })
      .sort({ addedAt: 1 })
      .limit(20)
      .lean();

    const scored: { _id: any; ring: number }[] = candidates.map((c: any) => {
      const entry = resolveCity(String(c.city || ''));
      let ring = 4;
      if (entry) {
        const cName = entry.name.toLowerCase();
        const vName = volCity.toLowerCase();
        if (cName === vName) {
          ring = 0;
        } else if (entry.state === volState) {
          ring = 1;
        } else if (neighboringStates.includes(entry.state)) {
          ring = 2;
        } else if (volZone && entry.zone === volZone) {
          ring = 3;
        }
      }
      return { _id: c._id, ring };
    });

    scored.sort((a, b) => a.ring - b.ring);

    const claimedIds: string[] = [];
    for (const candidate of scored.slice(0, 4)) {
      const seeker = await Seeker.findOneAndUpdate(
        {
          _id: candidate._id,
          $or: [{ assignedVolunteer: '' }, { assignedVolunteer: { $exists: false } }],
        },
        {
          $set: { assignedVolunteer: volunteer.name },
          $unset: {
            snoozedUntil: '',
            volunteerFollowUpCompletedAt: '',
            volunteerFollowUpCompletedBy: '',
          },
        },
        { new: true, projection: { _id: 1 } }
      );
      if (seeker) {
        claimedIds.push(seeker._id.toString());
      }
    }

    const seekers = await Seeker.find({
      assignedVolunteer: volunteer.name,
      $or: [{ volunteerFollowUpCompletedAt: { $exists: false } }, { volunteerFollowUpCompletedAt: null }],
    }, seekerProjection()).sort({ addedAt: 1 }).limit(12).lean();

    return NextResponse.json({ data: seekers, claimed: claimedIds.length }, { status: 200 });
  } catch (error) {
    console.error('Failed to claim seeker batch:', error);
    return NextResponse.json({ error: 'Failed to claim seeker batch.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { volunteer } = await getVolunteer();

    if (!volunteer || !hasFollowUpAccess(volunteer)) {
      return NextResponse.json(
        { error: 'You need an approved Follow-up volunteer profile to update seekers.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const seekerId = String(body.seekerId || '').trim();

    if (!seekerId) {
      return NextResponse.json({ error: 'Seeker ID is required.' }, { status: 400 });
    }

    const status = String(body.followUpStatus || 'New').trim();
    const isCompletedOrFollowUp = status !== 'New';

    const update: any = {
      $set: {
        followUpStatus: status,
        seekerPhase: String(body.seekerPhase || '').trim(),
        lastContactDate: body.lastContactDate ? new Date(body.lastContactDate) : new Date(),
        preferredLanguage: String(body.preferredLanguage || 'English').trim(),
        eventInterest: String(body.eventInterest || '').trim(),
        centerInterest: String(body.centerInterest || '').trim(),
        notes: String(body.notes || '').trim(),
      }
    };

    if (isCompletedOrFollowUp) {
      update.$set.assignedVolunteer = '';
      // Keep the volunteer's attribution on terminal statuses too, so per-volunteer
      // dashboards can count "converted by me" / "dormant by me".
      update.$set.volunteerFollowUpCompletedAt = new Date();
      update.$set.volunteerFollowUpCompletedBy = volunteer.name;
      if (isTerminalStatus(status)) {
        update.$unset = {
          snoozedUntil: '',
          snoozedBy: '',
          snoozeReason: '',
        };
      } else {
        update.$set.snoozedUntil = computeSnoozedUntil(new Date(), body.snoozeDays);
        update.$set.snoozedBy = volunteer.name;
        if (body.snoozeReason) {
          update.$set.snoozeReason = String(body.snoozeReason).trim();
        }
      }
    } else {
      update.$set.volunteerFollowUpCompletedAt = new Date();
      update.$set.volunteerFollowUpCompletedBy = volunteer.name;
    }

    const seeker = await Seeker.findOneAndUpdate(
      {
        _id: seekerId,
        assignedVolunteer: volunteer.name,
      },
      update,
      { new: true, projection: seekerProjection() }
    );

    if (!seeker) {
      return NextResponse.json({ error: 'Seeker not found in your assigned batch.' }, { status: 404 });
    }

    return NextResponse.json({ data: seeker }, { status: 200 });
  } catch (error) {
    console.error('Failed to update seeker follow-up:', error);
    return NextResponse.json({ error: 'Failed to update seeker follow-up.' }, { status: 500 });
  }
}
