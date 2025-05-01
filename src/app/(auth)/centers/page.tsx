"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface Center {
  _id: string;
  address: string;
  day: string;
  time: string;
  contactPersons: string;
  contactNumbers: string;
}

const CentersTable: React.FC = () => {
  const [centers, setCenters] = useState<Center[]>([]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await axios.get('/api/auth/centers');
        setCenters(response.data);
      } catch (error) {
        console.error('Error fetching centers:', error);
      }
    };

    fetchCenters();
  }, []);

  return (
    <div className="overflow-x-auto mx-4 lg:mx-6">
      <h1 className="text-4xl text-[#8A1457] font-bold text-center mb-8">Do Visit Us 😇</h1>
      <div className="border-4 border-green-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 text-left text-white">Address</th>
                <th className="p-2 text-left text-white">Day</th>
                <th className="p-2 text-left text-white">Time</th>
                <th className="p-2 text-left text-white">Contact Person</th>
                <th className="p-2 text-left text-white">Contact No.</th>
              </tr>
            </thead>
            <tbody>
              {centers.map((center, index) => (
                <tr key={center._id} className={index % 2 === 0 ? 'bg-white text-gray-50 regular' : 'bg-[#8A1457] text-white'}>
                  <td className="p-2">{center.address}</td>
                  <td className="p-2">{center.day}</td>
                  <td className="p-2">{center.time}</td>
                  <td className="p-2">{center.contactPersons}</td>
                  <td className="p-2">{center.contactNumbers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-2xl font-bold text-[#8A1457] mb-4">IT'S ALWAYS FREE!</p>
        <p className="text-lg">
          If you want to find centers apart from Chhattisgarh state, please find them{' '}
          <a 
            href="https://sycenters.org/centers" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            here
          </a>
        </p>
      </div>
      <hr className="m-10"></hr>
    </div>
  );
};

const Page: React.FC = () => {
  return (
    <div className="page-container pb-6 lg:px-20">
      <CentersTable />
    </div>
  );
};

export default Page;