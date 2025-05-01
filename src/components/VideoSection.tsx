import React, { useEffect, useState } from 'react';

export default function VideoSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className={`my-12 transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        <h2 className="text-2xl font-bold text-center py-4 bg-blue-600 text-white">Experience Self-Realization with Shri Mataji</h2>
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
        <div className="p-4 bg-blue-100">
          <p className="text-center text-lg font-semibold">
            Discover the power of Sahaja Yoga meditation guided by Shri Mataji herself.
          </p>
        </div>
      </div>
    </section>
  );
}
