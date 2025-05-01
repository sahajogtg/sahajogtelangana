// src/app/admin/program-requests/page.tsx

'use client';

import React, { useEffect, useState } from 'react';

interface ProgramRequest {
  _id: string;
  companyName: string;
  contactPerson: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  officeAddress: {
    street: string;
    city: string;
    state: string;
  };
  preferredProgramDate: string;
  additionalRemarks?: string;
  createdAt: string;
}

export default function ProgramRequestsPage() {
  const [programRequests, setProgramRequests] = useState<ProgramRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgramRequests() {
      try {
        const response = await fetch('/api/auth/admin/program-requests');
        if (!response.ok) {
          throw new Error('Failed to fetch program requests');
        }
        const data = await response.json();
        setProgramRequests(data);
      } catch (err) {
        setError('An error occurred while fetching program requests');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgramRequests();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Program Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Company</th>
              <th className="py-2 px-4 border-b text-left">Contact Person</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Location</th>
              <th className="py-2 px-4 border-b text-left">Preferred Date</th>
              <th className="py-2 px-4 border-b text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {programRequests.map((request) => (
              <tr key={request._id}>
                <td className="py-2 px-4 border-b">{request.companyName}</td>
                <td className="py-2 px-4 border-b">{request.contactPerson.name}</td>
                <td className="py-2 px-4 border-b">{request.contactPerson.email}</td>
                <td className="py-2 px-4 border-b">{request.contactPerson.phone}</td>
                <td className="py-2 px-4 border-b">{`${request.officeAddress.city}, ${request.officeAddress.state}`}</td>
                <td className="py-2 px-4 border-b">{new Date(request.preferredProgramDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{request.additionalRemarks || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}