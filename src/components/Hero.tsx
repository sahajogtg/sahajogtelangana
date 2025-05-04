import Image from 'next/image'

const Hero = () => {
  return (
    <section className="relative w-full bg-white text-[#5B2C41] overflow-hidden py-10 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center">
        
        {/* Left Content */}
        <div className="z-10 w-full md:w-1/2 space-y-6 mb-12 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">Sahaja Yoga</h1>
          <h2 className="text-lg md:text-2xl font-medium text-[#7C3A58]">Know Thyself: Through Sahaja Yoga</h2>
          
          <blockquote className="border-l-4 border-[#8A1457] pl-4 italic text-lg md:text-xl text-[#5B2C41]">
            "Yoga means union with the divine. When you become one with the divine, 
            the divine starts flowing through you and you become part and parcel of 
            the whole."
            <footer className="text-right mt-2 text-sm text-[#7C3A58]">— H. H. Shri Mataji Nirmala Devi</footer>
          </blockquote>
          
          <p className="text-base md:text-lg leading-relaxed text-[#4B2E39]">
            Sahaja Yoga teaches a unique method of meditation rooted in ancient spiritual knowledge.
            You can achieve a state of balance in just 10 minutes. Try it out!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#VirtualTour" 
              className="bg-[#8A1457] hover:bg-[#6A0F43] text-white py-3 px-6 rounded-full text-center font-semibold shadow-md transition-all"
            >
              Meditate Now!
            </a>
            <a 
              href="/sahaja-yoga" 
              className="bg-white hover:bg-gray-100 text-[#5B2C41] py-3 px-6 rounded-full text-center font-semibold flex items-center justify-center shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Read More
            </a>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 flex justify-center relative">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src="/maaa-with-hand.jpg"
                alt="Shri Mataji Nirmala Devi"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
        
      </div>
    </section>
  )
}

export default Hero
