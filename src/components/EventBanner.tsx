'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
}

// Sample event data for demonstration
const sampleEvents: Event[] = [
  {
    _id: 'krishna-puja-2025',
    title: 'Shri Krishna Puja 2025',
    description: 'Join us for the auspicious celebration of Shri Krishna Puja 2025. This three-day event will feature meditation, music, collective gatherings, and special pujas dedicated to Lord Krishna. All Sahaja Yogis and seekers are welcome to attend.',
    date: '2025-08-15T00:00:00.000Z',
    time: 'August 15-17, 9:00 AM - 7:00 PM',
    location: 'Hyderabad, Telangana',
    image: '/ShriMatajiKrishnaPuja.jpg'
  }
];

export default function EventBanner() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Try to fetch events from API
        const response = await axios.get('/api/events');
        
        if (response.data.status === 200 && response.data.data.length > 0) {
          setEvents(response.data.data);
        } else {
          // If API returns no events, use sample events
          console.log('No events from API, using sample events');
          setEvents(sampleEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Use sample events in case of error
        console.log('Error fetching events, using sample events');
        setEvents(sampleEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    adaptiveHeight: true
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  // If there's an error but we have sample events, we'll still show them
  // Only show the "no events" message if there are truly no events

  if (events.length === 0) {
    return (
      <div id="events" className="bg-[#FBECDF] py-8 w-full">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#8A1457] mb-2">Upcoming Events</h2>
          <p className="text-gray-600">Stay tuned for our upcoming events! Check back soon for new meditation programs and spiritual gatherings.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="events" className="bg-[#FBECDF] py-10 w-full">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        {/* Left Block - Org Name */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-[#E39321] text-3xl md:text-4xl font-semibold leading-snug">
            Sahaja Yoga Telangana
          </h2>
          <p className="text-[#8A1457] mt-2 text-base md:text-lg font-medium">
            Spreading Inner Peace Through Meditation
          </p>
        </div>
  
        {/* Right Block - Title */}
        <div className="md:w-1/2 text-center">
          <h3 className="text-[#8A1457] text-2xl md:text-3xl font-bold tracking-wide">
            ✨ Upcoming Events ✨
          </h3>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Join our collective meditations and pujas across Telangana.
          </p>
        </div>
      </div>
        
        <Slider {...sliderSettings}>
          {events.map((event) => (
            <div key={event._id} className="focus:outline-none px-2">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden p-5 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/4 flex justify-center md:justify-start mb-4 md:mb-0">
                    {event.image ? (
                      <div className="h-32 w-full overflow-hidden rounded-xl border-2 border-[#8A1457] shadow-sm">
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-lg bg-[#FBECDF] flex items-center justify-center border-2 border-[#8A1457]">
                        <span className="text-[#8A1457] text-5xl">🧘</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-2/4 text-center md:text-left px-4">
                    <div className="inline-flex items-center mb-2 bg-[#FBECDF] text-[#8A1457] text-sm font-medium rounded-full px-3 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold mb-1 text-[#8A1457]">{event.title}</h3>
                    
                    <div className="flex items-center justify-center md:justify-start text-gray-600 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="md:w-1/4 flex justify-center items-center mt-4 md:mt-0">
                    <Link href={`/register-event/${event._id}`}>
                      <span className="inline-block bg-[#8A1457] text-white py-2 px-6 rounded-md hover:bg-[#6A0F43] transition-colors duration-200 font-medium">
                        Register Now
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
} 