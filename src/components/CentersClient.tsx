"use client";

import React, { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLocale } from "@/app/provider/localeProvider";
import type { PublicCenter } from "@/lib/centers";
import { centerSlug, formatCenterTime } from "@/lib/centers";
import Reveal from "@/components/motion/Reveal";

type Connection = {
  centerId: string;
  connectionType: "joined";
};

const languageCopy = {
  en: {
    title: "Centers",
    finder: "Find a center near you",
    welcome: "All sessions are always free. It would be our honour to have you visit our meditation centers.",
    address: "Address",
    day: "Day",
    time: "Time",
    contact: "Contact",
    join: "Follow",
    joined: "Following",
    updates: "Updates",
    announcements: "Announcements",
    search: "Search by zone, city, or address",
    always_free: "All sessions are always free",
    outside: "Looking for centers outside Telangana? Find them",
    here: "here",
    loading: "Loading centers",
    load_error: "Failed to load centers.",
    default_city: "Hyderabad",
    view_details: "View details",
    centers_count: "centers",
    no_results: "No centers match your search — try a different zone or clear the filters.",
  },
  te: {
    title: "కేంద్రాలు",
    finder: "మీకు దగ్గరలోని కేంద్రాన్ని కనుగొనండి",
    welcome: "అన్ని సెషన్లు ఎప్పుడూ ఉచితం. మా ధ్యాన కేంద్రాలను సందర్శించడం మాకు గౌరవంగా ఉంటుంది.",
    address: "చిరునామా",
    day: "రోజు",
    time: "సమయం",
    contact: "సంప్రదింపు",
    join: "ఫాలో అవ్వండి",
    joined: "ఫాలో అవుతున్నారు",
    updates: "అప్‌డేట్లు",
    announcements: "ప్రకటనలు",
    search: "జోన్, నగరం లేదా చిరునామా ద్వారా వెతకండి",
    always_free: "అన్ని సెషన్లు ఎప్పుడూ ఉచితం",
    outside: "తెలంగాణ వెలుపల కేంద్రాలను కనుగొనాలంటే",
    here: "ఇక్కడ",
    loading: "కేంద్రాలు లోడ్ అవుతున్నాయి",
    load_error: "కేంద్రాలను లోడ్ చేయలేకపోయాం.",
    default_city: "హైదరాబాద్",
    view_details: "వివరాలు చూడండి",
    centers_count: "కేంద్రాలు",
    no_results: "మీ శోధనకు సరిపోయే కేంద్రాలు లేవు — వేరే జోన్ ప్రయత్నించండి లేదా ఫిల్టర్లను తీసివేయండి.",
  },
} as const;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
};

const normalizeConnection = (item: any): Connection => ({
  centerId: String(item.centerId),
  connectionType: "joined",
});

export default function CentersClient({ initialCenters }: { initialCenters: PublicCenter[] }) {
  const { status } = useSession();
  const { locale } = useLocale();
  const {
    data: centers = initialCenters,
    error,
    isLoading,
  } = useSWR<PublicCenter[]>("/api/auth/centers", fetcher, {
    fallbackData: initialCenters,
    dedupingInterval: 60000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });
  const { data: connectionsResponse } = useSWR(status === "authenticated" ? "/api/center-connections" : null, fetcher);
  const [query, setQuery] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const connections = ((connectionsResponse?.data || []) as any[]).map(normalizeConnection);
  const copy = languageCopy[locale as keyof typeof languageCopy] || languageCopy.en;

  const allZones = useMemo(() => {
    const zoneSet = new Set(centers.map((c) => c.zone));
    return Array.from(zoneSet).sort();
  }, [centers]);

  const filteredCenters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return centers;
    }

    return centers.filter((center) =>
      [center.zone, center.city, center.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [centers, query]);

  const isFollowing = (centerId: string) =>
    connections.some((item) => item.centerId === String(centerId) && item.connectionType === "joined");

  const toggleConnection = async (centerId: string) => {
    const normalizedCenterId = String(centerId);
    const exists = isFollowing(normalizedCenterId);
    const connectionType = "joined";
    const url = `/api/center-connections?centerId=${encodeURIComponent(normalizedCenterId)}&connectionType=${connectionType}`;
    const key = `${normalizedCenterId}-${connectionType}`;

    setPendingKey(key);

    const optimistic = exists
      ? connections.filter((item) => !(item.centerId === normalizedCenterId && item.connectionType === "joined"))
      : [...connections, { centerId: normalizedCenterId, connectionType }];

    mutate("/api/center-connections", { status: 200, data: optimistic }, false);

    try {
      const response = await fetch(url, {
        method: exists ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: exists ? undefined : JSON.stringify({ centerId: normalizedCenterId, connectionType }),
      });

      if (!response.ok) {
        throw new Error("Unable to update center preference.");
      }

      await mutate("/api/center-connections");
    } catch (toggleError) {
      console.error(toggleError);
      await mutate("/api/center-connections");
    } finally {
      setPendingKey(null);
    }
  };

  if (error) return <div className="mt-4 text-center text-red-600">{copy.load_error}</div>;
  if (isLoading && centers.length === 0) return <div className="mt-4 text-center">{copy.loading}</div>;

  const zoneChips = allZones.filter((z) =>
    z.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4 pt-6 lg:px-6 lg:pt-8">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[radial-gradient(70%_120%_at_12%_0%,color-mix(in_srgb,var(--accent)_9%,transparent),transparent_55%),linear-gradient(135deg,color-mix(in_srgb,var(--surface)_94%,transparent),color-mix(in_srgb,var(--surface-2)_86%,transparent))] px-6 py-10 shadow-card md:px-10 md:py-12">
        <div aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rotate-45 border border-[color:color-mix(in_srgb,var(--accent)_25%,transparent)]" />
        <p className="eyebrow">{copy.finder}</p>
        <h1 className="mt-3 font-display text-[clamp(28px,3.4vw,40px)] leading-[1.15] tracking-[-0.015em] text-[color:var(--ink)]">
          {copy.title}
        </h1>
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-[color:var(--muted)]">
          {copy.welcome}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-1.5 text-[13px] font-semibold text-[color:var(--accent)]">
            <span className="h-1.5 w-1.5 rotate-45 bg-[color:var(--accent)]" aria-hidden />
            {copy.always_free}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_80%,transparent)] px-4 py-1.5 text-[13px] font-medium text-[color:var(--muted)]">
            {query.trim() ? `${filteredCenters.length} / ` : ""}{centers.length} {copy.centers_count}
          </span>
        </div>
      </div>

      <div className="relative mb-6 mt-6">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="admin-input admin-input-with-icon w-full"
          placeholder={copy.search}
        />
      </div>

      {allZones.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setQuery("")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              query.trim() === ""
                ? "bg-[color:var(--primary)] text-[color:var(--on-primary)]"
                : "border border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
            }`}
          >
            All
          </button>
          {(query.trim() ? zoneChips : allZones).slice(0, 9).map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setQuery(zone)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                query.trim().toLowerCase() === zone.toLowerCase()
                  ? "bg-[color:var(--primary)] text-[color:var(--on-primary)]"
                  : "border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      )}

      {filteredCenters.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] py-20 text-center">
          <span className="mx-auto block h-2.5 w-2.5 rotate-45 bg-[color:color-mix(in_srgb,var(--accent)_60%,transparent)]" aria-hidden />
          <p className="mt-4 text-[color:var(--muted)]">{copy.no_results}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCenters.map((center, idx) => {
            const joined = isFollowing(center._id);

            return (
              <Reveal key={center._id} delay={Math.min(idx * 80, 400)}>
              <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/centers/${centerSlug(center)}`}
                      className="font-display text-lg font-medium leading-snug text-[color:var(--ink)] transition-colors hover:text-[color:var(--primary)]"
                    >
                      {center.zone}
                    </Link>
                    <p className="mt-0.5 text-sm text-[color:var(--muted)]">{center.city || copy.default_city}</p>
                  </div>
                  {status === "authenticated" ? (
                    <button
                      type="button"
                      onClick={() => toggleConnection(center._id)}
                      disabled={pendingKey === `${center._id}-joined`}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        joined
                          ? "bg-[color:var(--primary)] text-[color:var(--on-primary)]"
                          : "border border-[color:var(--border)] text-[color:var(--ink)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                      }`}
                    >
                      {pendingKey === `${center._id}-joined` ? "..." : joined ? copy.joined : copy.join}
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 flex-1 space-y-2.5 text-sm text-[color:var(--muted)]">
                  <div className="flex gap-2">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="h-1 w-1 rotate-45 bg-[color:var(--accent)]" aria-hidden />
                    </span>
                    <span className="shrink-0 font-medium text-[color:var(--ink)]">{copy.day}</span>
                    <span>{center.day}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="h-1 w-1 rotate-45 bg-[color:var(--accent)]" aria-hidden />
                    </span>
                    <span className="shrink-0 font-medium text-[color:var(--ink)]">{copy.time}</span>
                    <span className="numeric-font">{formatCenterTime(center.time)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="h-1 w-1 rotate-45 bg-[color:var(--accent)]" aria-hidden />
                    </span>
                    <span className="shrink-0 font-medium text-[color:var(--ink)]">{copy.contact}</span>
                    <span className="numeric-font">{center.contactNumbers}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[color:var(--border)]">
                    <p className="leading-relaxed">
                      <span className="font-medium text-[color:var(--ink)]">{copy.address}: </span>
                      {center.address}
                    </p>
                  </div>

                  {center.weeklyUpdate ? (
                    <p className="pt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                      <span className="font-medium text-[color:var(--ink)]">{copy.updates}: </span>
                      {center.weeklyUpdate}
                    </p>
                  ) : null}

                  {center.announcement ? (
                    <p className="text-sm leading-relaxed text-[color:var(--ink)]">
                      <span className="font-medium">{copy.announcements}: </span>
                      {center.announcement}
                    </p>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <Link
                    href={`/centers/${centerSlug(center)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--primary)] transition-colors hover:underline"
                  >
                    {copy.view_details}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                  {center.link ? (
                    <a
                      href={center.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium text-[color:var(--muted)] transition-colors hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Open Maps
                    </a>
                  ) : null}
                </div>
              </article>
              </Reveal>
            );
          })}
        </div>
      )}

      <div className="my-12 text-center">
        <p className="text-sm text-[color:var(--muted)]">
          {copy.outside}{" "}
          <a
            href="https://sycenters.org/centers"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[color:var(--primary)] underline"
          >
            {copy.here}
          </a>
        </p>
      </div>
    </div>
  );
}
