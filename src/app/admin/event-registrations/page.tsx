'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

type EventRegistration = {
  _id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  state: string;
  city: string;
  age: number;
  transactionNumber: string;
  amountPaid: number;
  registeredAt: string;
};

export default function EventRegistrationsAdmin() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [events, setEvents] = useState<{ _id: string; title: string }[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    // Fetch all events for the filter dropdown
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        if (response.data.status === 200) {
          setEvents(response.data.data.map((event: any) => ({
            _id: event._id,
            title: event.title
          })));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Add sample event if API fails
        setEvents([{
          _id: 'krishna-puja-2025',
          title: 'Shri Krishna Puja 2025'
        }]);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Fetch registrations
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        
        const url = selectedEventId 
          ? `/api/event-registrations?eventId=${selectedEventId}`
          : '/api/event-registrations';
          
        const response = await axios.get(url);
        
        if (response.data.status === 200) {
          setRegistrations(response.data.data);
        } else {
          setError('Failed to fetch registrations');
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setError('An error occurred while fetching registrations');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [selectedEventId]);

  const handleEventFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEventId(e.target.value);
  };

  // Handle export to Excel
  const handleExportToExcel = async () => {
    try {
      setExportLoading(true);
      const url = selectedEventId 
        ? `/api/event-registrations/export?eventId=${selectedEventId}`
        : '/api/event-registrations/export';
        
      // Use fetch with blob response type for file download
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `event-registrations-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export registrations to Excel');
    } finally {
      setExportLoading(false);
    }
  };

  // Calculate totals
  const totalRegistrations = registrations.length;
  const totalAmountCollected = registrations.reduce((sum, reg) => sum + reg.amountPaid, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#8A1457] mb-4">Event Registrations</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="eventFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Event:
            </label>
            <select
              id="eventFilter"
              value={selectedEventId || ''}
              onChange={handleEventFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A1457]"
            >
              <option value="">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:self-end">
            <button
              onClick={handleExportToExcel}
              disabled={exportLoading || loading || registrations.length === 0}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                exportLoading || loading || registrations.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#8A1457] hover:bg-[#6A0F43]'
              } transition-colors flex items-center`}
            >
              {exportLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Export to Excel
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FBECDF] p-4 rounded-md border-l-4 border-[#8A1457]">
            <p className="text-sm text-gray-600">Total Registrations</p>
            <p className="text-2xl font-bold text-[#8A1457]">{totalRegistrations}</p>
          </div>
          <div className="bg-[#FBECDF] p-4 rounded-md border-l-4 border-[#E39321]">
            <p className="text-sm text-gray-600">Total Amount Collected</p>
            <p className="text-2xl font-bold text-[#E39321]">₹{totalAmountCollected.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-2"></div>
            <p>Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered On
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {registration.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.eventTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.city}, {registration.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{registration.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.transactionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(registration.registeredAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 