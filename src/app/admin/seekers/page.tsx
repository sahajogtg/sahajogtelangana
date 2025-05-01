// src/app/admin/seekers/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Seeker {
  _id: string;
  name: string;
  city: string;
  phone: string;
  addedBy: string;
  addedAt: string;
}

export default function SeekersPage() {
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeekers() {
      try {
        const response = await fetch('/api/auth/admin/seekers');
        if (!response.ok) {
          throw new Error('Failed to fetch seekers');
        }
        const data = await response.json();
        setSeekers(data);
      } catch (err) {
        setError('An error occurred while fetching seekers');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSeekers();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seekers</h1>
        <Link href="https://sy.sahajayogatelangana.org/add-seeker" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Seeker
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">City</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Added By</th>
              <th className="py-2 px-4 border-b text-left">Added At</th>
            </tr>
          </thead>
          <tbody>
            {seekers.map((seeker) => (
              <tr key={seeker._id}>
                <td className="py-2 px-4 border-b">{seeker.name}</td>
                <td className="py-2 px-4 border-b">{seeker.city}</td>
                <td className="py-2 px-4 border-b">{seeker.phone}</td>
                <td className="py-2 px-4 border-b">{seeker.addedBy}</td>
                <td className="py-2 px-4 border-b">{new Date(seeker.addedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}