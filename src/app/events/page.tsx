'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
};

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please log in to view events.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchEvents = async () => {
        try {
          const response = await axios.get('/api/events');
          if (response.data.status === 200) {
            setEvents(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching events:', error);
        } finally {
          setLoadingEvents(false);
        }
      };

      fetchEvents();
    }
  }, [status]);

  if (status === 'loading' || (status === 'authenticated' && loadingEvents)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FEF9F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A1457]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FEF9F5] py-12 px-4 md:px-10">
      <h1 className="text-4xl font-bold text-center text-[#8A1457] mb-8">All Events</h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-600">No events available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Link key={event._id} href={`/register-event/${event._id}`}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer">
                <div className="h-48 w-full overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-[#F8ECF2] h-full flex items-center justify-center">
                      <span className="text-[#8A1457] text-4xl">🧘</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 text-sm text-gray-600 flex items-center justify-between">
                    <span>{format(new Date(event.date), 'PPP')}</span>
                    <span>{event.time}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#8A1457] mb-2">{event.title}</h2>
                  <p className="text-gray-700 text-sm line-clamp-3">{event.description}</p>
                  <p className="mt-3 text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </p>
                  <div className="mt-4">
                    <span className="inline-block bg-[#8A1457] text-white py-2 px-4 rounded-md hover:bg-[#6A0F43] transition-colors text-sm">
                      Register Now
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
