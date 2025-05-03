// pages/shri-mataji.tsx

import Image from 'next/image';

export default function ShriMatajiPage() {
  return (
    <div className="bg-[#FDF9F6] text-[#2C1A1D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-[#7B3F61] mb-10">
          About Shri Mataji Nirmala Devi
        </h1>

        {/* Introduction Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/shri-mataji2.jpg"
                alt="Shri Mataji Nirmala Devi"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold text-[#7B3F61] mb-4">
                The Founder of Sahaja Yoga
              </h2>
              <p className="mb-4 text-justify">
                Shri Mataji Nirmala Devi (1923–2011) was a renowned spiritual leader and the founder of Sahaja Yoga. Born in Chhindwara, India, she dedicated her life to the spiritual ascent of humanity through the practice of self-realization and meditation.
              </p>
              <p className="mb-4 text-justify">
                Her teachings emphasized the awakening of the inner energy, Kundalini, leading to a state of thoughtless awareness and inner peace. 
              </p>
            </div>
          </div>
        </section>

        {/* Early Life Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-[#7B3F61] mb-4 text-center">
            Early Life and Background
          </h2>
          <p className="mb-4 text-justify">
            Born to a Christian family, Shri Mataji's father was a scholar fluent in multiple languages, and her mother was the first woman in India to receive an honors degree in mathematics. She spent her childhood in Nagpur and was actively involved in India's struggle for independence, even being imprisoned for participating in the Quit India Movement.
          </p>
        </section>

        {/* Sahaja Yoga Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/shri-mataji3.jpg"
                alt="Shri Mataji Teaching"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold text-[#7B3F61] mb-4">
                The Birth of Sahaja Yoga
              </h2>
              <p className="mb-4 text-justify">
                In 1970, Shri Mataji introduced Sahaja Yoga, a meditation technique that enables individuals to experience self-realization. She traveled extensively, offering free public lectures and guiding people towards inner transformation. 
              </p>
              <p className="mb-4 text-justify">
                Her approach was unique in that she never charged for her teachings, emphasizing that spiritual growth is a birthright and should be accessible to all. 
              </p>
            </div>
          </div>
        </section>

        {/* Legacy Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-[#7B3F61] mb-4 text-center">
            Legacy and Impact
          </h2>
          <p className="mb-4 text-justify">
            Shri Mataji's contributions extend beyond spiritual teachings. She established various non-profit organizations, including health centers, educational institutions, and cultural academies, all aimed at promoting holistic well-being. 
          </p>
          <p className="mb-4 text-justify">
            Her legacy continues through the global Sahaja Yoga community, which upholds her vision of a world united through inner peace and self-awareness. 
          </p>
        </section>

        {/* Quote Section */}
        <section className="mb-16 bg-[#EDE7F6] p-6 rounded-lg shadow-md">
          <blockquote className="italic text-lg text-center text-[#5E35B1]">
            "You cannot know the meaning of your life until you are connected to the power that created you."
          </blockquote>
          <p className="text-right mt-4 text-sm text-[#5E35B1]">
            — Shri Mataji Nirmala Devi
          </p>
        </section>

        {/* Video Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-[#7B3F61] mb-4 text-center">
            Learn More About Shri Mataji
          </h2>
          <div className="relative w-full pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/UvjwfMsTDIc"
              title="Life of Shri Mataji Nirmala Devi"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </section>
      </div>
    </div>
  );
}
