// src/app/admin/messages/page.tsx

'use client';

import React, { useEffect, useState } from 'react';

interface Message {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
  status: 'New' | 'In Progress' | 'Done' | 'Following Up';
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch('/api/auth/admin/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError('An error occurred while fetching messages');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Messages</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Phone Number</th>
              <th className="py-2 px-4 border-b text-left">Message</th>
              <th className="py-2 px-4 border-b text-left">Created At</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message._id}>
                <td className="py-2 px-4 border-b">{message.name}</td>
                <td className="py-2 px-4 border-b">{message.email}</td>
                <td className="py-2 px-4 border-b">{message.phoneNumber}</td>
                <td className="py-2 px-4 border-b">{message.message.substring(0, 50)}...</td>
                <td className="py-2 px-4 border-b">{new Date(message.createdAt).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">{message.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}