import Image from 'next/image'
import Button from './Button'

const Hero = () => {
  return (
    <section className="relative w-full bg-gradient-to-r from-[#F44336] via-[#E91E63] to-[#FF9800] text-white overflow-hidden py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center">
        <div className="z-10 w-full md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-5xl md:text-6xl font-bold mb-2">Sahaja Yoga</h1>
          <h2 className="text-xl md:text-2xl font-medium mb-6">Know Thyself: Through Sahaja Yoga</h2>
          
          <div className="border-l-4 border-white pl-4 my-6">
            <p className="italic text-lg md:text-xl">
              "Yoga means union with the divine. When you become one with the divine, 
              the divine starts flowing through you and you become part and parcel of 
              the whole."
            </p>
            <p className="text-right mt-2">— H. H. Shri Mataji Nirmala Devi</p>
          </div>
          
          <p className="text-lg md:text-xl mb-8">
            Sahaja Yoga teaches a unique method of meditation, 
            rooted in ancient spiritual knowledge. You can achieve a 
            state of balance in just 10 minutes. Try it out!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#" 
              className="bg-[#8A1457] hover:bg-[#6A0F43] text-white py-3 px-6 rounded-full text-center font-medium transition-colors"
            >
              Meditate Now!
            </a>
            <a 
              href="#" 
              className="bg-white hover:bg-gray-100 text-gray-800 py-3 px-6 rounded-full text-center font-medium transition-colors flex items-center justify-center sm:justify-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Read More
            </a>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 relative">
          <div className="aspect-square md:aspect-auto relative h-[300px] md:h-[450px]">
            <div className="absolute inset-0 rounded-[50%] overflow-hidden">
              <Image
                src="/shri-mataji3.jpg"
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