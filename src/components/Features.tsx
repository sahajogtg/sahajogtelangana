// Features.tsx

import { FEATURES } from '../../constants'
import Image from 'next/image'
import React from 'react'

const Features = () => {
  return (
    <section className="flex-col flexCenter overflow-hidden bg-gradient-to-r from-[#FCEFF9] via-[#FAF5FF] to-[#FEF5E7] py-20 w-full">
      <div className="max-container relative w-full flex flex-col items-center px-6 md:px-10">
        
        {/* Decorative elements */}
        <div className="absolute top-12 left-10 w-24 h-24 rounded-full bg-[#F9D8E5]/40 blur-3xl hidden lg:block"></div>
        <div className="absolute bottom-12 right-10 w-32 h-32 rounded-full bg-[#FDE9D4]/40 blur-3xl hidden lg:block"></div>
        
        {/* Title */}
        <div className="text-center mb-14 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5B2C41] mb-4 tracking-tight">
            Benefits of Sahaja Yoga
          </h2>
          <div className="w-40 h-1 bg-[#8A1457] mx-auto rounded-full"></div>
        </div>

        {/* Main content */}
        <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Image */}
          <div className="lg:w-2/5 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden">
              <Image
                src="/boy-beach.svg"
                alt="Meditation"
                width={500}
                height={700}
                className="w-full h-auto object-cover rounded-2xl"
              />
            </div>

            {/* Subtle soft background glow */}
            <div className="absolute inset-0 rounded-2xl bg-[#f9e1ea]/40 blur-2xl scale-105 -z-10"></div>
          </div>

          {/* Features Grid */}
          <div className="lg:w-3/5 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {FEATURES.map((feature, index) => (
                <FeatureItem 
                  key={feature.title}
                  title={feature.title} 
                  icon={feature.icon}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type FeatureItem = {
  title: string;
  icon: string;
  description: string;
  index: number;
}

const FeatureItem = ({ title, icon, description }: FeatureItem) => {
  return (
    <div className="group bg-white/30 backdrop-blur-md rounded-xl p-6 transition-all hover:bg-white/50 hover:shadow-xl hover:-translate-y-1 duration-300">
      <div className="flex items-start gap-4">
        
        {/* Icon container with subtle pink-toned background for contrast */}
        <div className="rounded-full p-3 flex-shrink-0 bg-[#8A1457] shadow-md">
          <Image src={icon} alt={title} width={28} height={28} />
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-bold text-[#5B2C41] mb-2">
            {title}
          </h3>
          <p className="text-[#4B2E39] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Features
