'use client';

import Image from 'next/image';

export default function AboutSahajaYogaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-[#6B1E6E] font-bold text-center mb-8">
        About Sahaja Yoga
      </h1>

      {/* Introduction Section */}
      <section className="flex flex-col md:flex-row items-center mb-12">
        <div className="md:w-1/2 md:pr-8">
          <h2 className="text-2xl text-[#6B1E6E] font-semibold mb-4">
            What is Sahaja Yoga?
          </h2>
          <p className="mb-4 text-gray-700 text-justify">
            Sahaja Yoga is a unique method of meditation that leads to a state of thoughtless awareness and self-realization. Founded by Shri Mataji Nirmala Devi in 1970, it involves the awakening of the dormant Kundalini energy within us, facilitating a spontaneous connection with the all-pervading power of the universe.
          </p>
          <p className="mb-4 text-gray-700 text-justify">
            This practice transcends mental, emotional, and physical activities, allowing individuals to experience their true selves. The term 'Sahaja' means 'born with', and 'Yoga' means 'union', signifying the innate union with the divine that each person possesses.
          </p>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0">
          <Image
            src="/sahaja5.jpg"
            alt="What is Sahaja Yoga?"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Video Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-center text-[#6B1E6E] mb-4">
          Your First Meditation with Shri Mataji
        </h2>
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/hcSJrufqdq0?si=qK9Tykvqq7NUzJKy"
            title="Your First Meditation with Shri Mataji"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Unique Features Section */}
      <section className="flex flex-col md:flex-row items-center mb-12 bg-[#F3E8F5] p-6 rounded-lg shadow-inner">
        <div className="md:w-1/2 md:pr-8">
          <h2 className="text-2xl font-semibold text-[#6B1E6E] mb-4">
            How is Sahaja Yoga Different?
          </h2>
          <p className="mb-4 text-gray-700 text-justify">
            Unlike other meditation techniques, Sahaja Yoga facilitates a spontaneous state of thoughtless awareness without the need for rigorous mental control. This natural experience allows individuals to transcend the mind, leading to inner peace and self-realization.
          </p>
          <p className="mb-4 text-gray-700 text-justify">
            The practice is accessible to everyone, free of charge, and does not require any prior experience. It empowers individuals to become their own masters, fostering personal growth and transformation.
          </p>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0">
          <Image
            src="/sahaja2.jpg"
            alt="Unique Features of Sahaja Yoga"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Origins Section */}
      <section className="flex flex-col md:flex-row items-center mb-12">
        <div className="md:w-1/2 md:pr-8">
          <h2 className="text-2xl font-semibold text-[#6B1E6E] mb-4">
            Origins of Sahaja Yoga
          </h2>
          <p className="mb-4 text-gray-700 text-justify">
            Shri Mataji Nirmala Devi, born in 1923 in Chhindwara, India, founded Sahaja Yoga in 1970. Observing the innate seeking in humanity, she developed this method to help individuals achieve true peace and self-realization. Her teachings have since spread globally, offering free meditation sessions in over 95 countries.
          </p>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0">
          <Image
            src="/sahaja3.jpg"
            alt="Origins of Sahaja Yoga"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="flex flex-col md:flex-row items-center mb-12 bg-[#F3E8F5] p-6 rounded-lg shadow-inner">
        <div className="md:w-1/2 md:pr-8">
          <h2 className="text-2xl font-semibold text-[#6B1E6E] mb-4">
            Benefits of Sahaja Yoga
          </h2>
          <p className="mb-4 text-gray-700 text-justify">
            Regular practice of Sahaja Yoga meditation has been associated with numerous benefits, including stress reduction, improved emotional well-being, and enhanced self-awareness. Scientific studies have shown increased gray matter in brain regions linked to attention and self-control among long-term practitioners.
          </p>
          <p className="mb-4 text-gray-700 text-justify">
            Additionally, Sahaja Yoga has been found effective in managing conditions like asthma, epilepsy, and depression, highlighting its potential as a complementary approach to holistic health.
          </p>
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0">
          <Image
            src="/sahaja4.jpg"
            alt="Benefits of Sahaja Yoga"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Awards and Recognitions Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-center text-[#6B1E6E] mb-4">
          Awards and Recognitions
        </h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>
            <strong>1986, Italy:</strong> Shri Mataji was declared "Personality of the Year" by the Italian Government.
          </li>
          <li>
            <strong>1989, Moscow:</strong> Following a meeting with the USSR Minister of Health, Sahaja Yoga received full government sponsorship, including funding for scientific research.
          </li>
          <li>
            <strong>1990-1994, New York:</strong> Shri Mataji was invited by the United Nations for four consecutive years to speak on achieving world peace.
          </li>
          <li>
            <strong>2003, Russia:</strong> Sahaja Yoga was awarded "Best diagnosis and therapies of regenerative medicine" by the Russian Ministry of Health.
          </li>
          <li>
            <strong>2006, Italy:</strong> Shri Mataji was awarded Honorary Citizenship of Cabella Ligure by the local assembly.
          </li>
        </ul>
      </section>

      {/* Scientific Research Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-center text-[#6B1E6E] mb-4">
          Scientific Research on Sahaja Yoga
        </h2>
        <p className="mb-4 text-gray-700 text-justify">
          Numerous scientific studies have explored the effects of Sahaja Yoga meditation. Research indicates that long-term practitioners exhibit increased gray matter in brain regions associated with attention, self-control, and compassion. Functional MRI studies have also shown enhanced connectivity in areas related to emotional regulation and interoceptive awareness.
        </p>
        <p className="mb-4 text-gray-700 text-justify">
          Clinical trials have demonstrated the efficacy of Sahaja Yoga in managing conditions such as asthma, epilepsy, ADHD, and depression. These findings underscore its potential as a complementary approach to mental and physical health.
        </p>
      </section>

      {/* Conclusion Section */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold text-[#6B1E6E] mb-4">
          Embrace Inner Peace
        </h2>
        <p className="mb-4 text-gray-700">
          Sahaja Yoga offers a transformative journey towards self-realization and inner peace. Accessible to all, it empowers individuals to connect with their true selves and experience the joy of thoughtless awareness.
        </p>
        <p className="text-gray-700">
          Begin your journey today and discover the profound benefits of Sahaja Yoga meditation.
        </p>
      </section>
    </div>
  );
}
