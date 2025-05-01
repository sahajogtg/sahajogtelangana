import React from 'react';
import SectionTitle from './SectionTitle';

const VirtualTour = () => {
  return (
    <section className="py-16 bg-[#FEF5E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="Virtual Tour" />
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/jre0HE9ZSbI"
              title="Virtual Tour of Sahaja Yoga Center" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
          
          <div className="mt-8 flex justify-center">
            <a 
              href="#"
              className="bg-[#E75C3C] hover:bg-[#C33F23] text-white font-medium px-8 py-3 rounded-md inline-flex items-center transition-colors"
            >
              Let's Experience It
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualTour; 