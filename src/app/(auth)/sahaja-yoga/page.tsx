'use client'

import Image from 'next/image';

export default function AboutSahajaYogaPage() {
  return (
    <div className="container mx-auto lg:px-40 sm:px-4 py-8">
      <h1 className="text-4xl text-[#8A1457] font-bold text-center mb-8">About Sahaja Yoga</h1>

      <section className="flex flex-col md:flex-row items-center mb-7">
        <div className="md:w-1/2 mx-4">
          <h2 className="text-2xl text-[#8A1457] font-semibold mb-4">What is Sahaja Yoga?</h2>
          <p className="mb-4 text-gray-50 text-justify">
            Sahaja Yoga is a method of meditation that takes you beyond mental, emotional, and physical activity and allows you to experience the true self which lies within. In Sanskrit, Sahaja means 'born with' ('Saha' is with, 'ja' is born), and Yoga means union. The name, therefore, translates to 'the union which one is born with.'
          </p>
          <p className="mb-4 text-gray-50 text-justify">
            This union is between your true self and the all-pervading power that permeates all elements of life. It is achieved through a process that awakens the dormant energy called Kundalini that exists within each human being. This process is known as Self Realisation. Once the Kundalini is awakened, the individual experiences a blissful state of thoughtless awareness, where the mind is silent and they simply witness the present moment.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-end mx-4">
          <Image
            src="/sahaja.jpg"
            alt="What is Sahaja Yoga?"
            width={500}
            height={300}
            className="rounded-lg sm:mx-4"
          />
        </div>
      </section>

      <section className="my-12 transition-all duration-1000 ease-in-out mx-4">
      <h2 className="text-2xl font-semibold mx-auto text-center text-[#8A1457] mb-4">Your First Meditation By Shri Mataji</h2>
        <div className="sm:mx-4 lg:mx-auto max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden">
          {/* <h2 className="text-2xl font-bold text-center py-4 bg-blue-600 text-white">Experience Self-Realization with Shri Mataji</h2> */}
          <div className="relative pb-16:9 h-0 youtube-container">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/hcSJrufqdq0?si=qK9Tykvqq7NUzJKy"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
          <div className="p-4 bg-[#8A1457]">
            <p className="text-center text-lg text-white font-semibold">
              Discover the power of Sahaja Yoga meditation guided by Shri Mataji herself.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row-reverse items-center mb-12 bg-[#8A1457] p-6 rounded-lg  mx-4">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-white mb-4">How is Sahaja Yoga different from other types of meditation?</h2>
          <p className="mb-4 text-white  text-justify">
            The method of Sahaja Yoga is unique: Through the experience of Kundalini awakening, the process of going into thoughtless awareness is completely spontaneous and does not require any kind of mental control. It is a living experience that takes us beyond the mind, allowing us to evolve a greater awareness, free from the constraints of our mental perceptions of ourselves and the world around us.
          </p>
          <p className="mb-4 text-white  text-justify">
            It is this state of thoughtless awareness that sets Sahaja Yoga apart from other types of meditation. It is a transformative state which alters our overall experience of life by naturally increasing our ability to feel joy and peace within. The effects of true meditation are long-lasting and increase with regular practice.
          </p>
          <p className="mb-4 text-white  text-justify">
            Another defining characteristic of Sahaja Yoga is that it empowers you to become the master of your own personal growth. There are no levels, qualifications, or hierarchies involved. All individuals who run meditation classes - either online or in-person - do so on a completely voluntary basis. The knowledge and experience of Sahaja Yoga is always and unconditionally 100% free.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/sahaja2.jpg"
            alt="How is Sahaja Yoga different from other types of meditation?"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center mb-12">
        <div className="md:w-1/2 mx-4">
          <h2 className="text-2xl font-semibold text-[#8A1457] mb-4">What are the origins of Sahaja Yoga?</h2>
          <p className="mb-4 text-gray-50 text-justify">
            Sahaja Yoga was founded in 1970 by Shri Mataji Nirmala Devi, born as Nirmala Salve in Chindawara, India. Through closely observing humanity from an early age, she could see that all human beings are innately seeking something, but most do not know what. Determined to find a way for people to experience true peace within, and thus fulfill their seeking, she developed a unique method of meditation.
          </p>
          <p className="mb-4 text-gray-50 text-justify">
            Seeing the tremendous effect of this method on a few individuals around her, Shri Mataji spent the rest of her life traveling the world to share the life-changing experience of Self Realisation. Her lectures and classes were always entirely free of charge, insisting that one cannot pay for something which is a birthright. Now Sahaja Yoga classes can be found in 95 countries around the world, completely for free.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-end mx-4">
          <Image
            src="/sahaja3.jpg"
            alt="Origins of Sahaja Yoga"
            width={500}
            height={300}
            className="rounded-lg  sm:mx-4"
          />
        </div>
      </section>

      <section className="flex mx-4 flex-col md:flex-row-reverse items-center mb-12 bg-[#8A1457] p-6 rounded-lg">
        <div className="md:w-1/2 ">
          <h2 className="text-2xl font-semibold text-white mb-4">What are the benefits of Sahaja Yoga?</h2>
          <p className="mb-4 text-white  text-justify">
            Sahaja Yoga meditation works directly on the central nervous system that controls all of our mental, physical and emotional activity. It, therefore, has the potential to dramatically improve our wellbeing by going directly to the source of any problem. The immediate effects of raising the Kundalini, and going into thoughtless awareness, can be felt as a gentle release from our mind and a spontaneous state of bliss where one merely witnesses and enjoys the present moment. However, the effects of reaching this state go far beyond those moments of mental silence.
          </p>
          <p className="mb-4 text-white  text-justify">
            When the Kundalini rises, she removes the tensions occurring on our central nervous system that cause negative mental, emotional, or physical sensations, and brings our system into balance. Without any concentrated effort, we are relieved from any stress, weight or pain that we may be feeling.
          </p>
          <p className="mb-4 text-white  text-justify">
            In the long term, this experience becomes stronger. With the regular practice of meditation, the central nervous system is regularly cleansed and becomes more resistant to imbalances. This is how we evolve into a more centered, satisfied and loving person and get closer and closer to the essence of ourselves.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/sahaja4.jpg"
            alt="Benefits of Sahaja Yoga"
            width={500}
            height={300}
            className="rounded-lg "
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center mb-12">
        <div className="md:w-1/2 mx-4">
          <h2 className="text-2xl font-semibold text-[#8A1457] mb-4">Who can benefit from Sahaja Yoga?</h2>
          <p className="mb-4 text-gray-50 text-justify">
            The benefits of Sahaja Yoga can be experienced by absolutely anyone. Neither gender, age, ethnicity, religion, wealth, or background matter, nor do you need to have any prior experience of meditation. Every human being is born equal with the same potential lying within in the form of their Kundalini energy. Everyone has the capacity to get their Self Realisation, establish the union with the all-pervading power of the universe, and with their true self.
          </p>
          <p className="mb-4 text-gray-50 text-justify">
            Sahaja Yoga is practiced in groups, or individually at home, by thousands of people all over the world. It is a practice that integrates effortlessly into everyday life. Once the Kundalini is awakened and you have reached the state of thoughtless awareness, you will be able to go into this state in almost any situation. Through regular meditation, you can go deeper into this experience and gain a better understanding of yourself and the energy centers within you. All you need is the desire to find something more in life and the willingness to meditate.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-end mx-4">
          <Image
            src="/sahaja5.jpg"
            alt="Who can benefit from Sahaja Yoga?"
            width={500}
            height={300}
            className="rounded-lg sm:mx-4"
          />
        </div>
      </section>
    </div>
  );
}
