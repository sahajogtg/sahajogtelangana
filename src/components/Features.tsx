import { FEATURES } from '../../constants'
import Image from 'next/image'
import React from 'react'

const Features = () => {
  return (
    <section className="flex-col flexCenter overflow-hidden bg-gradient-to-r from-[#F44336] via-[#E91E63] to-[#FF9800] py-20 w-full">
      <div className="max-container relative w-full flex flex-col items-center px-6 md:px-10">
        {/* Decorative elements */}
        <div className="absolute top-12 left-10 w-24 h-24 rounded-full bg-white/10 blur-xl hidden lg:block"></div>
        <div className="absolute bottom-12 right-10 w-32 h-32 rounded-full bg-white/20 blur-xl hidden lg:block"></div>
        
        {/* Title with decorative underline */}
        <div className="text-center mb-14 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Benefits of Sahaja Yoga
          </h2>
          <div className="w-40 h-1 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Main image and content */}
        <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-2/5 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
              <Image
                src="/3.png"
                alt="Meditation"
                width={500}
                height={700}
                className="w-full object-cover"
              />
            </div>
            <div className="absolute -z-0 w-full h-full rounded-2xl bg-[#F44336]/30 blur-xl -bottom-3 -right-3"></div>
          </div>

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

const FeatureItem = ({ title, icon, description, index }: FeatureItem) => {
  return (
    <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all hover:bg-white/20 hover:shadow-xl hover:-translate-y-1 duration-300">
      <div className="flex items-start gap-4">
        <div className="rounded-full p-3 flex-shrink-0 bg-white shadow-lg">
          <Image src={icon} alt={title} width={28} height={28} />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-white/90 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Features
