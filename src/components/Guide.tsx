import Image from 'next/image'
import React from 'react'
import Button from './Button'

const Guide = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#FAF5FF] to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Image */}
          <div className="lg:w-5/12 flex justify-center">
            <Image
              src="/maaaa.jpg"
              alt="Shri Mataji"
              width={500}
              height={500}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Text Content */}
          <div className="lg:w-6/12 space-y-6">
            <p className="uppercase tracking-wide text-lg font-semibold text-[#7C3A58]">
              Our Mother
            </p>
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-bold text-[#7C3A58]">Shri Mataji</h2>
              <Button
                type="button"
                title="Know More"
                icon="/play.svg"
                variant="btn_white_text"
              />
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Shri Mataji Nirmala Devi was an extraordinarily charismatic and compassionate spiritual figure. Her presence radiated pure love — a divine force that saw the potential in every human soul. She addressed the seekers of truth with deep care, often transforming their confusion into clarity and silence with a single glance. Her legacy is not just in words, but in the awakening she offered to thousands around the world.
            </p>
          </div>
        </div>
      </div>

      {/* Sahaja Krishi Section */}
      <div className="container mx-auto px-4 mt-24 relative">
        <Image
          src="/boat1.png"
          alt="Farming landscape"
          width={1440}
          height={380}
          className="w-full h-auto object-cover rounded-xl shadow-md"
        />

        <div className="relative lg:absolute lg:left-16 top-4 lg:top-16 bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-xl mx-auto lg:mx-0 mt-6 lg:mt-0">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-[#7C3A58]">Sahaja Krishi</h2>
            <Button
              type="button"
              title="Read More 🍏"
              variant="btn_white_text"
            />
          </div>
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            Sahaja Krishi is the practice of agriculture guided by spiritual vibrations known as "Param Chaitanya". These vibrations can Hyderabadfy and energize elements like soil, seeds, and water, promoting harmonious growth in plants, animals, and the environment.
          </p>

          <h3 className="text-xl font-bold text-[#7C3A58] text-center mb-4">
            Our Impact
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: 'Countries Reached', value: '120+' },
              { label: 'Agricultural Products', value: '6K+' },
              { label: 'Happy Farmers', value: '10K+' },
              { label: 'Years of Excellence', value: '45+' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-[#7C3A58]">{item.value}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Guide
