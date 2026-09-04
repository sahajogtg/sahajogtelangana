import type { Metadata } from "next";
import Link from "next/link";
import SeoJsonLd from "@/components/SeoJsonLd";
import CenterRegistrationForm from "@/components/CenterRegistrationForm";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { centerIdFromSlug, centerSlug, formatCenterTime, getPublicCenters } from "@/lib/centers";
import { getRequestLocale } from "@/lib/serverLocale";

const copyByLocale = {
  en: {
    back: "All centers",
    subtitle: "Weekly Sahaja Yoga meditation center",
    details: "Center details",
    address: "Address",
    day: "Day",
    time: "Time",
    contact: "Contact",
    openMap: "Open in Maps",
    updates: "Center updates",
    announcements: "Announcements",
    registerTitle: "Register to attend",
    registerBody: "Enter your details below to register for meditation sessions at this center.",
    intro:
      "This center hosts free Sahaja Yoga meditation sessions for seekers and practitioners. Use the details below to plan your visit and connect with the local collective.",
    nextTitle: "Helpful next steps",
    nextLinks: [
      ["Learn the meditation basics", "/meditate"],
      ["Explore meditation in Hyderabad", "/meditation-hyderabad"],
      ["View upcoming events", "/events"],
      ["Contact the collective", "/contact-us"],
    ],
    notFound: "Center not found.",
  },
  te: {
    back: "అన్ని కేంద్రాలు",
    subtitle: "వారాంత సహజ యోగ ధ్యాన కేంద్రం",
    details: "కేంద్ర వివరాలు",
    address: "చిరునామా",
    day: "రోజు",
    time: "సమయం",
    contact: "సంప్రదింపు",
    openMap: "మ్యాప్స్‌లో తెరవండి",
    updates: "కేంద్ర అప్‌డేట్లు",
    announcements: "ప్రకటనలు",
    registerTitle: "హాజరు కావడానికి నమోదు చేయండి",
    registerBody: "ఈ కేంద్రంలో ధ్యాన సెషన్లకు హాజరు కావడానికి క్రింద మీ వివరాలు నమోదు చేయండి.",
    intro:
      "ఈ కేంద్రంలో ప్రారంభికులు మరియు సాధకుల కోసం ఉచిత సహజ యోగ ధ్యాన సెషన్లు జరుగుతాయి. మీ సందర్శనను సులభంగా ప్రణాళిక చేసుకోవడానికి మరియు స్థానిక సమష్టితో అనుసంధానానికి క్రింది వివరాలను ఉపయోగించండి.",
    nextTitle: "తదుపరి ఉపయోగకరమైన అడుగులు",
    nextLinks: [
      ["ధ్యానానికి పునాది నేర్చుకోండి", "/meditate"],
      ["హైదరాబాద్‌లో ధ్యానం గురించి తెలుసుకోండి", "/meditation-hyderabad"],
      ["రాబోయే కార్యక్రమాలు చూడండి", "/events"],
      ["సమష్టిని సంప్రదించండి", "/contact-us"],
    ],
    notFound: "కేంద్రం కనుగొనబడలేదు.",
  },
} as const;

type Params = { params: { slug: string } };

async function getCenterFromParams(slug: string) {
  const centers = await getPublicCenters();
  const center = centers.find((item) => item._id === centerIdFromSlug(slug));
  return { center, centers };
}

export async function generateStaticParams() {
  const centers = await getPublicCenters();
  return centers.map((center) => ({
    slug: centerSlug(center),
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { center } = await getCenterFromParams(params.slug);
  if (!center) {
    return pageMetadata({
      title: "Meditation Center",
      description: "Sahaja Yoga meditation center details.",
      path: `/centers/${params.slug}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: `${center.zone}, ${center.city || "Hyderabad"} Meditation Center`,
    description: `Visit the Sahaja Yoga meditation center in ${center.zone}, ${center.city || "Hyderabad"}. Find the weekly day, timing, address, and contact details for free meditation sessions.`,
    path: `/centers/${centerSlug(center)}`,
    keywords: [
      `meditation center ${center.zone}`,
      `meditation in ${center.city || "Hyderabad"}`,
      `Sahaja Yoga ${center.zone}`,
      "free meditation classes in Hyderabad",
      "Sahaja Yoga Telangana",
    ],
  });
}

export default async function CenterDetailPage({ params }: Params) {
  const locale = getRequestLocale();
  const copy = copyByLocale[locale];
  const { center } = await getCenterFromParams(params.slug);

  if (!center) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-lg text-[color:var(--muted)]">{copy.notFound}</p>
      </main>
    );
  }

  const centerUrl = absoluteUrl(`/centers/${centerSlug(center)}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: `Sahaja Yoga ${center.zone}`,
      url: centerUrl,
      description: `Free Sahaja Yoga meditation classes at ${center.zone}, ${center.city || "Hyderabad"}.`,
      telephone: center.contactNumbers,
      address: {
        "@type": "PostalAddress",
        streetAddress: center.address,
        addressLocality: center.city || "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
      areaServed: [center.city || "Hyderabad", "Telangana"],
      hasMap: center.link || undefined,
      openingHours: center.day && center.time ? [`${center.day} ${formatCenterTime(center.time)}`] : undefined,
      parentOrganization: {
        "@type": "Organization",
        name: "Sahaja Yoga Telangana",
        url: absoluteUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Centers", item: absoluteUrl("/centers") },
        { "@type": "ListItem", position: 3, name: `${center.zone}, ${center.city || "Hyderabad"}`, item: centerUrl },
      ],
    },
  ];

  return (
    <main className="bg-[color:var(--bg)] py-14">
      <SeoJsonLd json={jsonLd} />
      <div className="mx-auto max-w-5xl px-6">
        <Link href="/centers" className="text-sm font-semibold text-[color:var(--primary)] hover:underline">
          ← {copy.back}
        </Link>

        <div className="relative mt-6 h-48 overflow-hidden rounded-[32px] md:h-64">
          <img
            src="/images/center-hall.svg"
            alt={`${center.zone} meditation center`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{copy.subtitle}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {center.zone}
            </h1>
            <p className="mt-1 text-sm text-white/70 md:text-base">{center.city || "Hyderabad"}, Telangana</p>
          </div>
        </div>

        <section className="mt-6 rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-7 shadow-soft md:p-10">
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--muted)] md:text-base">{copy.intro}</p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft">
            <h2 className="text-2xl font-semibold text-[color:var(--ink)]">{copy.details}</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
              <p><span className="font-semibold text-[color:var(--ink)]">{copy.address}:</span> {center.address}</p>
              <p><span className="font-semibold text-[color:var(--ink)]">{copy.day}:</span> {center.day}</p>
              <p><span className="font-semibold text-[color:var(--ink)]">{copy.time}:</span> <span className="numeric-font">{formatCenterTime(center.time)}</span></p>
              <p><span className="font-semibold text-[color:var(--ink)]">{copy.contact}:</span> <span className="numeric-font">{center.contactNumbers}</span></p>
            </div>
            {center.link ? (
              <a
                href={center.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-[color:var(--on-primary)] transition-colors hover:bg-[color:var(--primary-600)]"
              >
                {copy.openMap}
              </a>
            ) : null}
          </div>

          <div className="space-y-6">
            {center.weeklyUpdate ? (
              <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft">
                <h2 className="text-2xl font-semibold text-[color:var(--ink)]">{copy.updates}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">{center.weeklyUpdate}</p>
              </div>
            ) : null}

            {center.announcement ? (
              <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft">
                <h2 className="text-2xl font-semibold text-[color:var(--ink)]">{copy.announcements}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--ink)] md:text-base">{center.announcement}</p>
              </div>
            ) : null}

            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft">
              <h2 className="text-2xl font-semibold text-[color:var(--ink)]">{copy.registerTitle}</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{copy.registerBody}</p>
              <div className="mt-4">
                <CenterRegistrationForm centerName={center.zone} centerId={center._id} />
              </div>
            </div>

            <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-soft">
              <h2 className="text-2xl font-semibold text-[color:var(--ink)]">{copy.nextTitle}</h2>
              <div className="mt-5 flex flex-col gap-3">
                {copy.nextLinks.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--surface-2)]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
