'use client';

import { useEffect, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import CityPicker from '@/components/CityPicker';
import EmptyState from '@/components/EmptyState';

type Volunteer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  gender?: string;
  roles?: string[];
  assignments?: string[];
  availability?: string;
  staffingFocus?: string;
  notes?: string;
  isActive?: boolean;
};

type VolunteerRequest = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  interests?: string[];
  availability?: string;
  experience?: string;
  status?: string;
};

const emptyVolunteer = {
  name: '',
  email: '',
  phone: '',
  city: '',
  gender: 'Unknown',
  roles: '',
  assignments: '',
  availability: '',
  staffingFocus: '',
  notes: '',
  isActive: true,
};

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [form, setForm] = useState(emptyVolunteer);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchVolunteers = async () => {
    const [volunteersResponse, requestsResponse] = await Promise.all([
      fetch('/api/auth/admin/volunteers'),
      fetch('/api/auth/admin/volunteer-requests'),
    ]);
    const volunteersData = await volunteersResponse.json();
    const requestsData = await requestsResponse.json();
    setVolunteers(volunteersData.data || []);
    setRequests(requestsData.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      roles: form.roles.split(',').map((item) => item.trim()).filter(Boolean),
      assignments: form.assignments.split(',').map((item) => item.trim()).filter(Boolean),
    };

    await fetch(editingId ? `/api/auth/admin/volunteers/${editingId}` : '/api/auth/admin/volunteers', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setForm(emptyVolunteer);
    setEditingId(null);
    setSaving(false);
    fetchVolunteers();
  };

  const handleEdit = (volunteer: Volunteer) => {
    setEditingId(volunteer._id);
    setForm({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || '',
      city: volunteer.city || '',
      gender: volunteer.gender || 'Unknown',
      roles: (volunteer.roles || []).join(', '),
      assignments: (volunteer.assignments || []).join(', '),
      availability: volunteer.availability || '',
      staffingFocus: volunteer.staffingFocus || '',
      notes: volunteer.notes || '',
      isActive: volunteer.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/auth/admin/volunteers/${id}`, { method: 'DELETE' });
    fetchVolunteers();
  };

  const handleRequestAction = async (id: string, action: 'approve' | 'reject') => {
    await fetch(`/api/auth/admin/volunteer-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchVolunteers();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="admin-card p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">Volunteers</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink)] md:text-4xl">Volunteer management</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Track roles, assignments, availability, and event staffing so admin follow-up and collectives stay coordinated.
        </p>
      </section>

      <section className="admin-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-[color:var(--ink)]">Volunteer requests from yogis</h2>
        {requests.length === 0 ? (
          <EmptyState
            icon={<FiUserPlus className="w-7 h-7 text-[color:var(--muted)]" />}
            title="No volunteer requests"
            message="Pending volunteer requests from yogis will appear here."
          />
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {requests.map((request) => (
              <article key={request._id} className="rounded-[24px] border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-2)_70%,transparent)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[color:var(--ink)]">{request.name}</h3>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{request.email}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{request.city || 'City not shared'} • {request.phone || 'Phone not shared'}</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {request.status || 'Pending'}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                  <p><span className="font-semibold text-[color:var(--ink)]">Interests:</span> {(request.interests || []).join(', ') || 'Not shared'}</p>
                  <p><span className="font-semibold text-[color:var(--ink)]">Availability:</span> {request.availability || 'Not shared'}</p>
                  {request.experience ? <p><span className="font-semibold text-[color:var(--ink)]">Experience:</span> {request.experience}</p> : null}
                </div>
                {request.status === 'Pending' ? (
                  <div className="mt-5 flex gap-3">
                    <button type="button" onClick={() => handleRequestAction(request._id, 'approve')} className="admin-btn-primary">Approve</button>
                    <button type="button" onClick={() => handleRequestAction(request._id, 'reject')} className="admin-btn-secondary">Reject</button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-[color:var(--ink)]">{editingId ? 'Edit volunteer' : 'Add volunteer'}</h2>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} required />
          <Input label="Email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} required />
          <Input label="Phone" value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
          <label>
            <span className="mb-2 block text-sm font-medium text-[color:var(--ink)]">City</span>
            <CityPicker value={form.city} onChange={(value) => setForm((prev) => ({ ...prev, city: value }))} className="admin-input" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-[color:var(--ink)]">Gender</span>
            <select
              className="admin-input"
              value={form.gender}
              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
          </label>
          <Input label="Roles" value={form.roles} onChange={(value) => setForm((prev) => ({ ...prev, roles: value }))} placeholder="Follow-up, Events, Music" />
          <Input label="Assignments" value={form.assignments} onChange={(value) => setForm((prev) => ({ ...prev, assignments: value }))} placeholder="Beginners, Center north, Event desk" />
          <Input label="Availability" value={form.availability} onChange={(value) => setForm((prev) => ({ ...prev, availability: value }))} />
          <Input label="Staffing focus" value={form.staffingFocus} onChange={(value) => setForm((prev) => ({ ...prev, staffingFocus: value }))} />
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-[color:var(--ink)]">Notes</span>
            <textarea
              className="admin-input min-h-[120px]"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-[color:var(--ink)]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="admin-btn-primary">{saving ? 'Saving...' : editingId ? 'Update volunteer' : 'Add volunteer'}</button>
            {editingId ? (
              <button type="button" className="admin-btn-secondary" onClick={() => { setEditingId(null); setForm(emptyVolunteer); }}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="admin-card p-8 text-sm text-[color:var(--muted)]">Loading volunteers...</div>
        ) : volunteers.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState
              icon={<FiUserPlus className="w-7 h-7 text-[color:var(--muted)]" />}
              title="No volunteers yet"
              message="Add volunteers using the form above."
            />
          </div>
        ) : volunteers.map((volunteer) => (
          <article key={volunteer._id} className="admin-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[color:var(--ink)]">{volunteer.name}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{volunteer.email}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{volunteer.city || 'City not set'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${volunteer.isActive === false ? 'bg-[color:color-mix(in_srgb,var(--danger)_15%,transparent)] text-[color:var(--danger)]' : 'bg-[color:color-mix(in_srgb,var(--success)_15%,transparent)] text-[color:var(--success)]'}`}>
                {volunteer.isActive === false ? 'Inactive' : 'Active'}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
              <p><span className="font-semibold text-[color:var(--ink)]">Gender:</span> {volunteer.gender || 'Not set'}</p>
              <p><span className="font-semibold text-[color:var(--ink)]">Roles:</span> {(volunteer.roles || []).join(', ') || 'Not set'}</p>
              <p><span className="font-semibold text-[color:var(--ink)]">Assignments:</span> {(volunteer.assignments || []).join(', ') || 'Not set'}</p>
              <p><span className="font-semibold text-[color:var(--ink)]">Availability:</span> {volunteer.availability || 'Not set'}</p>
              <p><span className="font-semibold text-[color:var(--ink)]">Staffing focus:</span> {volunteer.staffingFocus || 'Not set'}</p>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => handleEdit(volunteer)} className="admin-btn-secondary">Edit</button>
              <button type="button" onClick={() => handleDelete(volunteer._id)} className="inline-flex items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--danger)_35%,transparent)] px-4 py-2 text-sm font-semibold text-[color:var(--danger)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)]">
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-[color:var(--ink)]">{label}</span>
      <input
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
