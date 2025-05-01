import Image from 'next/image';

export default function ShriMatajiPage() {
  return (
    <div className="container mx-auto lg:px-40 sm:px-2 py-8">
      <h1 className="text-4xl text-[#8A1457] font-bold text-center mb-8">About Shri Mataji</h1>

      <section className="flex flex-col md:flex-row items-center mb-12">
        <div className="md:w-1/2 px-4">
            <h2 className="text-2xl text-[#8A1457] font-semibold mb-4">The founder of Sahaja Yoga</h2>
            <p className="mb-4 text-gray-50 text-justify ">
            Shri Mataji Nirmala Devi discovered a unique method of meditation called "Sahaja Yoga" which allows the achievement of inner enlightenment and reveals the true potential of humanity. Shri Mataji devoted her entire life to the development and dissemination of this method, and today hundreds of thousands of people around the world practice Sahaja Yoga.
            </p>
        </div>
        <div className="md:w-1/2 flex justify-end">
            <Image
            src="/shri-mataji2.jpg"
            alt="Shri Mataji teaching Sahaja Yoga"
            width={500}
            height={300}
            className="rounded-lg px-4"
            />
        </div>
        </section>

        <section className="my-12 transition-all duration-1000 ease-in-out  px-4">
      <h2 className="text-2xl font-semibold mx-auto text-center text-[#8A1457] mb-4">Your First Meditation By Shri Mataji</h2>
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
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

      <section className="flex flex-col md:flex-row-reverse items-center mb-12 bg-[#8A1457] p-6 rounded-lg mx-4">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-white mb-4">The great master of yoga</h2>
          <p className="mb-4 text-white text-justify">
            Shri Mataji showed that within each person there is a motherly spiritual energy called Kundalini, the awakening of which leads to a state of spontaneous meditation. Unlike many ancient teachers who were only able to share this experience with a few individuals, Shri Mataji could raise the Kundalini in thousands of people, something previously considered impossible.
          </p>
          <p className="mb-4 text-white text-justify">
            The opportunity to awaken this inner spiritual energy distinguishes Sahaja Yoga from other methods of meditation. It is the extraordinary living experience that allows us to achieve a state of complete peace and satisfaction, touch the very essence of our beings, and uncover our very best qualities.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/shri-mataji3.jpg"
            alt="Shri Mataji as a master of yoga"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center mb-12">
        <div className="md:w-1/2 px-4">
          <h2 className="text-2xl font-semibold text-[#8A1457] mb-4">A life dedicated to humanity</h2>
          <p className="mb-4 text-gray-50 text-justify">
            Shri Mataji not only founded and spread the method of Sahaja Yoga far across the world but also created many non-profit organizations in various fields of public life.
          </p>
          <p className="mb-4 text-gray-50 text-justify">
            From a centre for destitute women and orphans, international schools with comprehensive and balanced curriculum, health centres using the methods of Sahaja Yoga to academies teaching classical arts - the list of Shri Mataji's achievements is striking in its diversity.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-end">
          <Image
            src="/shri-mataji4.jpg"
            alt="Shri Mataji's social work"
            width={500}
            height={300}
            className="rounded-lg px-4"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row-reverse items-center mb-12 bg-[#8A1457] p-6 rounded-lg mx-4">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-white mb-4">Sharing the experience</h2>
          <p className="mb-4 text-white  text-justify">
            The method of meditation discovered by Shri Mataji began to spread around the world after she and her family moved to London. She gave television and radio interviews, and held lectures in public halls across the country, never charging any money for these lectures or the experience of Self Realisation.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/shri-mataji5.jpg"
            alt="Sharing the experience"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center mb-12 mx-4">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-[#8A1457] mb-4">The global vision</h2>
          <p className="mb-4 text-gray-50 text-justify">
            From the 1980s onwards, Shri Mataji began to travel the world to bring her knowledge to all who wished to receive it. Her vision was global, aiming to change the world for the better by giving each person a method to achieve inner transformation and become their true selves.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-end">
          <Image
            src="/shri-mataji6.jpg"
            alt="The global vision"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row-reverse items-center mb-12 bg-[#8A1457] p-6 rounded-lg mx-4">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-white mb-4">Inner development as the foundation of a healthy society</h2>
          <p className="mb-4 text-white  text-justify">
            Shri Mataji, in her lectures and conversations, paid attention to many aspects of a person's life, saying that the inner state enlightened by the practice of meditation must find an outward manifestation in all spheres of human life.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/shri-mataji7.jpg"
            alt="Inner development"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center mb-12 px-4">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-[#8A1457] mb-4">From Nirmala to 'Shri Mataji'</h2>
          <p className="mb-4 text-gray-50 text-justify">
            Soon Shri Mataji began to teach this new method to a few close individuals in India, awakening their Kundalinis to give them 'Self-Realisation'. Her students reached a state of inner freedom and lightness, feeling a cool breeze on the palms and above the head. Due to her loving and selfless work, her students gave her the name Shri Mataji, meaning "respected holy mother."
          </p>
        </div>
        <div className="md:w-1/2  flex justify-end">
          <Image
            src="/shri-mataji8.jpg"
            alt="From Nirmala to Shri Mataji"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </section>
    
    </div>
  );
}
