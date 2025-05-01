'use client';

import { useState, useEffect } from 'react';
import Hero from "@/components/Hero";
import Camp from "@/components/Camp";
import Guide from "@/components/Guide";
import Features from "@/components/Features";
import IntroButton from "@/components/IntroButton";
import EventBanner from "@/components/EventBanner";
import AboutUs from "@/components/AboutUs";
import VirtualTour from "@/components/VirtualTour";
import ContactUs from "@/components/ContactUs";

export default function HomeClient() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (remove this in production)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FEF5E7]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#8A1457]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FEF5E7]">
      <EventBanner />
      <Hero/>
      <AboutUs />
      <VirtualTour />
      <IntroButton/>
      <Camp/>
      <Guide />
      <Features/>
      <ContactUs />
    </div>
  );
}