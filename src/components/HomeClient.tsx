'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

import Hero from "@/components/Hero";
import Camp from "@/components/Camp";
import Guide from "@/components/Guide";
import Features from "@/components/Features";
import IntroButton from "@/components/IntroButton";
import EventBanner from "@/components/EventBanner";
import VirtualTour from "@/components/VirtualTour";
import ContactUs from "@/components/ContactUs";

export default function HomeClient() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading (for aesthetics only, can remove in production)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FEF5E7]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8A1457]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FEF5E7]">
      {session && <EventBanner />} {/* Show only when logged in */}
      <Hero />
      {/* <AboutUs /> */}
      <VirtualTour />
      <IntroButton />
      <Camp />
      <Guide />
      <Features />
      <ContactUs />
    </div>
  );
}
