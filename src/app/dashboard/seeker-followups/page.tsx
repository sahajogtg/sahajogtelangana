'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiPhone, FiRefreshCw, FiSave, FiUsers, FiInbox } from 'react-icons/fi';
import YogiDashboardShell from '@/components/YogiDashboardShell';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

type Seeker = {
  _id: string;
  name: string;
  city: string;
  phone: string;
  email?: string;
  addedAt: string;
  followUpStatus?: string;
  lastContactDate?: string;
  source?: string;
  eventInterest?: string;
  centerInterest?: string;
  preferredLanguage?: string;
  notes?: string;
};

const statusOptions = ['New', 'Contacted', 'Follow-up scheduled', 'Converted', 'Dormant'];
const languageOptions = ['English', 'Odia', 'Hindi', 'Telugu'];

export default function SeekerFollowupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isVolunteer, setIsVolunteer] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    loadSeekers();

    const userRole = ((session?.user as any)?.role || '').toLowerCase();
    setIsVolunteer(userRole === 'volunteer' || userRole === 'admin');
  }, [status, session]);

  const loadSeekers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/yogi-seeker-followups');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load seekers.');
      }

      setSeekers(data.data || []);
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load seekers.');
    } finally {
      setLoading(false);
    }
  };

  const claimBatch = async () => {
    try {
      setClaiming(true);
      setMessage('');
      setError('');
      const response = await fetch('/api/yogi-seeker-followups', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to claim seekers.');
      }

      setSeekers(data.data || []);
      setMessage(data.message || (data.claimed > 0 ? `${data.claimed} seeker${data.claimed === 1 ? '' : 's'} added to your batch.` : 'No new unassigned seekers are available right now.'));
    } catch (claimError: any) {
      setError(claimError.message || 'Unable to claim seekers.');
    } finally {
      setClaiming(false);
    }
  };

  const updateSeeker = async (seekerId: string, payload: Partial<Seeker>) => {
    const current = seekers.find((seeker) => seeker._id === seekerId);
    if (!current) return;

    try {
      setSavingId(seekerId);
      setError('');
      const response = await fetch('/api/yogi-seeker-followups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, ...payload, seekerId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update seeker.');
      }

      setSeekers((previous) => previous.filter((seeker) => seeker._id !== seekerId));
      setMessage('Follow-up saved. This seeker has been removed from your active batch.');
    } catch (saveError: any) {
      setError(saveError.message || 'Unable to update seeker.');
    } finally {
      setSavingId(null);
    }
  };

  const editLocal = (seekerId: string, payload: Partial<Seeker>) => {
    setSeekers((previous) => previous.map((seeker) => (seeker._id === seekerId ? { ...seeker, ...payload } : seeker)));
  };

  if (status === 'loading' || loading) {
    return (
      <YogiDashboardShell activeKey="seeker-followups">
        <div className="admin-card p-8 text-sm text-[color:var(--muted)]">Loading seeker follow-ups...</div>
      </YogiDashboardShell>
    );
  }

  return (
    <YogiDashboardShell activeKey="seeker-followups">
      <main className="space-y-6">
        <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[color:var(--muted)]">Seeker follow-up</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink)] md:text-4xl">Your seeker batch</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
                Claim a small batch, contact each seeker, and update the follow-up details for the collective.
              </p>
            </div>
            <button
              type="button"
              onClick={claimBatch}
              disabled={claiming || seekers.length > 0}
              className="admin-btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              title={seekers.length > 0 ? 'Complete your current batch before fetching another one.' : undefined}
            >
              {claiming ? <LoadingSpinner /> : <FiUsers className="h-4 w-4" aria-hidden="true" />}
              {claiming ? 'Claiming...' : seekers.length > 0 ? 'Complete current batch first' : 'Get next 4 seekers'}
            </button>
          </div>
          {message ? <p className="mt-4 text-sm text-green-700 dark:text-green-300">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          {seekers.map((seeker) => {
            const whatsappText = encodeURIComponent(`Hello ${seeker.name}, this is from Sahaja Yoga Odisha.`);
            const telValue = seeker.phone.replace(/\s+/g, '');

            return (
              <article key={seeker._id} className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-soft md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[color:var(--ink)]">{seeker.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{seeker.city}</p>
                    {isVolunteer ? (
                      <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{seeker.phone}</p>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">
                        {seeker.phone.slice(0, 2)}XXXXXX{seeker.phone.slice(-2)}
                      </p>
                    )}
                    {seeker.email ? <p className="mt-1 text-sm text-[color:var(--muted)]">{seeker.email}</p> : null}
                  </div>
                  {isVolunteer ? (
                    <div className="grid grid-cols-2 gap-2">
                      <a href={`tel:${telValue}`} className="admin-btn-secondary inline-flex items-center justify-center gap-2">
                        <FiPhone className="h-4 w-4" aria-hidden="true" />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/91${telValue.replace(/^\+?91/, '')}?text=${whatsappText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn-primary"
                      >
                        WhatsApp
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2 text-xs text-[color:var(--muted)]">
                      Contact your volunteer coordinator to reach this seeker
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-[18px] border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-2)_70%,transparent)] p-4">
                  <p className="text-sm text-[color:var(--muted)]">
                    Source: <span className="font-medium text-[color:var(--ink)]">{seeker.source || 'Website'}</span>
                  </p>
                  {seeker.eventInterest ? (
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Event: <span className="font-medium text-[color:var(--ink)]">{seeker.eventInterest}</span>
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    Added on: {new Date(seeker.addedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field label="Follow-up status">
                    <select
                      className="admin-input"
                      value={seeker.followUpStatus || 'New'}
                      onChange={(event) => editLocal(seeker._id, { followUpStatus: event.target.value })}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Last contact date">
                    <input
                      type="date"
                      className="admin-input"
                      value={seeker.lastContactDate ? new Date(seeker.lastContactDate).toISOString().slice(0, 10) : ''}
                      onChange={(event) => editLocal(seeker._id, { lastContactDate: event.target.value })}
                    />
                  </Field>
                  <Field label="Preferred language">
                    <select
                      className="admin-input"
                      value={seeker.preferredLanguage || 'English'}
                      onChange={(event) => editLocal(seeker._id, { preferredLanguage: event.target.value })}
                    >
                      {languageOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Center interest">
                    <input
                      className="admin-input"
                      value={seeker.centerInterest || ''}
                      onChange={(event) => editLocal(seeker._id, { centerInterest: event.target.value })}
                      placeholder="Center or area discussed"
                    />
                  </Field>
                  <Field label="Event interest">
                    <input
                      className="admin-input"
                      value={seeker.eventInterest || ''}
                      onChange={(event) => editLocal(seeker._id, { eventInterest: event.target.value })}
                      placeholder="Event or program"
                    />
                  </Field>
                  <Field label="Notes">
                    <textarea
                      className="admin-input min-h-[110px]"
                      value={seeker.notes || ''}
                      onChange={(event) => editLocal(seeker._id, { notes: event.target.value })}
                      placeholder="Interest, next step, suitable time, or concerns"
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={() => updateSeeker(seeker._id, {})}
                  disabled={savingId === seeker._id}
                  className="admin-btn-primary mt-5 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingId === seeker._id ? <LoadingSpinner /> : <FiSave className="h-4 w-4" aria-hidden="true" />}
                  {savingId === seeker._id ? 'Saving...' : 'Save follow-up'}
                </button>
              </article>
            );
          })}
        </section>

        {seekers.length === 0 ? (
          <EmptyState
            icon={<FiInbox className="w-7 h-7 text-[color:var(--muted)]" />}
            title="No seekers assigned"
            message='Use "Get next 4 seekers" when you are ready to follow up.'
          />
        ) : null}
      </main>
    </YogiDashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[color:var(--ink)]">{label}</span>
      {children}
    </label>
  );
}
