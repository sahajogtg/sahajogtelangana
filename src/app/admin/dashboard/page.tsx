import React from 'react';
import Link from 'next/link';
import {
  MdAddLocation,
  MdCampaign,
  MdCalendarToday,
  MdDashboard,
  MdEvent,
  MdHowToReg,
  MdInsights,
  MdLightbulb,
  MdMessage,
  MdPeople,
  MdSupervisorAccount,
  MdVolunteerActivism,
  MdUpload,
} from 'react-icons/md';
import { getServerSession } from 'next-auth';
import { CustomSession, authOptions } from '@/app/api/auth/[...nextauth]/options';

const menuItems = [
  {
    name: 'All Users',
    description: 'Manage admin access and member accounts.',
    icon: <MdSupervisorAccount size={24} />,
    href: '/admin/all-users',
  },
  {
    name: 'Seekers',
    description: 'Review added seekers and continue follow-up.',
    icon: <MdPeople size={24} />,
    href: '/admin/seekers',
  },
  {
    name: 'Messages',
    description: 'Respond to incoming website enquiries.',
    icon: <MdMessage size={24} />,
    href: '/admin/messages',
  },
  {
    name: 'Program Requests',
    description: 'Track school and corporate meditation requests.',
    icon: <MdEvent size={24} />,
    href: '/admin/program-requests',
  },
  {
    name: 'Events',
    description: 'Create, manage, and update upcoming events.',
    icon: <MdCalendarToday size={24} />,
    href: '/admin/events',
  },
  {
    name: 'Event Registrations',
    description: 'Review registrations and export attendee data.',
    icon: <MdHowToReg size={24} />,
    href: '/admin/event-registrations',
  },
  {
    name: 'Outreach',
    description: 'Segment seekers and prepare email, WhatsApp, or SMS outreach.',
    icon: <MdCampaign size={24} />,
    href: '/admin/outreach',
  },
  {
    name: 'Volunteers',
    description: 'Track roles, availability, assignments, and event staffing.',
    icon: <MdVolunteerActivism size={24} />,
    href: '/admin/volunteers',
  },
  {
    name: 'Feature Requests',
    description: 'Review product suggestions submitted directly by yogis.',
    icon: <MdLightbulb size={24} />,
    href: '/admin/feature-requests',
  },
  {
    name: 'Event Requests',
    description: 'Approve or reject requested pujas, sessions, and gatherings.',
    icon: <MdEvent size={24} />,
    href: '/admin/event-requests',
  },
  {
    name: 'Analytics',
    description: 'Monitor registrations, seekers, conversions, and center engagement.',
    icon: <MdInsights size={24} />,
    href: '/admin/analytics',
  },
  {
    name: 'Document Uploads',
    description: 'Review seeker registration documents uploaded by volunteers.',
    icon: <MdUpload size={24} />,
    href: '/admin/document-uploads',
  },
  {
    name: 'Manage Centers',
    description: 'Expand and maintain center details, announcements, and updates.',
    icon: <MdAddLocation size={24} />,
    href: '/admin/add-center',
  },
];

const cardIconClasses =
  'inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(135deg,_color-mix(in_srgb,var(--surface)_92%,transparent),_color-mix(in_srgb,var(--surface-2)_86%,transparent))] text-[color:var(--primary)] shadow-sm transition-colors duration-300 group-hover:bg-[linear-gradient(135deg,_color-mix(in_srgb,var(--surface)_96%,transparent),_color-mix(in_srgb,var(--accent-200)_34%,transparent))] dark:text-[color:var(--accent)]';

export default async function AdminDashboard() {
  const session: CustomSession | null = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="admin-card overflow-hidden">
        <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">Admin overview</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--ink)] md:text-4xl">
              Keep the admin workspace aligned with the public site.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] md:text-base">
              Review messages, manage events, monitor registrations, and maintain seeker follow-up from a single dashboard that matches the same visual system and dark-mode behavior as the rest of the website.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-2)_85%,transparent)] p-5">
              <div className={cardIconClasses}>
                <MdDashboard size={24} />
              </div>
              <p className="mt-4 text-sm font-semibold text-[color:var(--ink)]">Signed in as</p>
              <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">{session?.user?.email ?? 'Admin user'}</p>
            </div>
            <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-2)_85%,transparent)] p-5">
              <p className="text-sm font-semibold text-[color:var(--ink)]">Quick start</p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Use the cards below to jump into the sections with the highest operational activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="admin-card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={cardIconClasses}>
                  {item.icon}
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[color:var(--ink)]">{item.name}</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
