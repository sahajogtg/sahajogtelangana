'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';

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
    location: 'Puri, Odisha',
    image: '/ShriMatajiKrishnaPuja.jpg'
  }
];

export default function Events() {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center my-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-[#8A1457]">Upcoming Events</h2>
        <p className="mt-4">No upcoming events at the moment. Please check back later.</p>
      </div>
    );
  }

  return (
    <section id="other-events" className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#8A1457] mb-10">More Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link href={`/register-event/${event._id}`} key={event._id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer">
                {event.image ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-[#F8ECF2] flex items-center justify-center">
                    <span className="text-[#8A1457] text-5xl">🧘</span>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#F8ECF2] text-[#8A1457] text-xs font-medium rounded-full px-3 py-1">
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="ml-2 text-gray-600 text-sm">{event.time}</div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="flex items-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="mt-4">
                    <span className="inline-block bg-[#8A1457] text-white py-2 px-4 rounded-md hover:bg-[#6A0F43] transition-colors duration-200">
                      Register Now
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 