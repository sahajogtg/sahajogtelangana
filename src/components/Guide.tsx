import Image from 'next/image'
import React from 'react'
import Button from './Button'

const Guide = () => {
  return (
    <section className="py-10 -mt-10"> {/* Added mb-20 */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col mx-4 px-4 lg:flex-row justify-between items-center gap-0">
          <div className='lg:w-5/12'>
            <Image src="/shri-mataji2.svg" alt="camp" width={700} height={300} />
          </div>
          <div className='lg:w-6/12'>
            <p className="uppercase bold-24 mt-4 mb-2 text-[#8A1457]">
              OUR MOTHER
            </p>
            <div className='flex flex-row items-center gap-4 mb-6'>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#8A1457]">
                Shri Mataji
              </h2>
              <Button 
                type="button" 
                title="Know More" 
                icon="/play.svg"
                variant="btn_white_text" 
              />
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Shri Mataji Nirmala Devi was an extremely charismatic, dynamic and divine personality who radiated nothing but love. She had absolute unconditional love – nirvajya prema (निर्व्याज प्रेम) – with which she saw the spiritual potential of people and the heart of divinity in all creation. It emanated from her like a relentless magnetic force. To see this magnetism in action in one of her many thousands of programs was to bear witness to the care, compassion, and command with which she attended to the woes and worries of those who sought her guidance until each question had found its answer, all sound was replaced with profound silence, and a glint of light shone bright in eyes that beheld that which was right. Truly an awe inspiring personality.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-20 relative">
        <Image 
          src="/boat1.png"
          alt="Farming landscape"
          width={1440}
          height={380}
          className="w-full h-auto object-cover object-center rounded-lg"
        />
        <div className="relative lg:absolute lg:left-12 top-4 lg:top-12 bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto lg:mx-0 mt-4 lg:mt-0">
        <div className='flex flex-row items-center gap-4 mb-6'>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#8A1457]">
            Sahaja Krishi
          </h2>
          <Button 
            type="button" 
            title="Read More 🍏" 
            // icon="/play.svg"
            variant="btn_white_text" 
          />
        </div>
        <p className="text-lg text-gray-600">Any agricultural production or Animal Farming using Sahaja Yoga Techniques is called Sahaja Krishi. An electromagnetic vibration called "Param Chaitanya" which governs five elements (Earth, Water, Fire, Wind, Sky) can bring positive transformation in Plants, Animals, Fish, Birds etc. The "Param Chaitanya" can transform agricultural products such as Seeds, Feeds, Water etc., which are then used for routine Agricultural Production.</p>
        <h3 className="text-2xl font-bold text-[#8A1457] mb-4 mt-4 text-center">Our Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Countries Reached', value: '120+' },
            { label: 'Agricultural Products', value: '6K+' },
            { label: 'Happy Farmers', value: '10K+' },
            { label: 'Years of Excellence', value: '45+' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-[#8A1457]">{item.value}</p>
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
