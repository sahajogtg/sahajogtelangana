"use client";

import React from "react";
import axios from "axios";
import useSWR from "swr";

interface Center {
  _id: string;
  address: string;
  day: string;
  time: string;
  contactPersons: string;
  contactNumbers: string;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const CentersTable: React.FC = () => {
  const { data: centers = [], error, isLoading } = useSWR<Center[]>("/api/auth/centers", fetcher);

  if (error) return <div className="text-red-600 text-center mt-4">Failed to load centers.</div>;
  if (isLoading) return <div className="text-center mt-4">Loading centers...</div>;

  return (
    <div className="mx-4 lg:mx-6">
      <h1 className="text-4xl text-[#8A1457] font-bold text-center mb-8">Do Visit Us 😇</h1>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#9d5a5a]">
              <th className="p-2 text-left text-white">Address</th>
              <th className="p-2 text-left text-white">Day</th>
              <th className="p-2 text-left text-white">Time</th>
              <th className="p-2 text-left text-white">Contact Person</th>
              <th className="p-2 text-left text-white">Contact No.</th>
            </tr>
          </thead>
          <tbody>
            {centers.map((center, index) => (
              <tr key={center._id} className={index % 2 === 0 ? "bg-white text-black" : "bg-[#9d5a5a] text-white"}>
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

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {centers.map(center => (
          <div key={center._id} className="bg-white rounded-lg shadow-md p-4 border">
            <p className="text-sm"><span className="font-semibold">Address:</span> {center.address}</p>
            <p className="text-sm"><span className="font-semibold">Day:</span> {center.day}</p>
            <p className="text-sm"><span className="font-semibold">Time:</span> {center.time}</p>
            <p className="text-sm"><span className="font-semibold">Contact Person:</span> {center.contactPersons}</p>
            <p className="text-sm"><span className="font-semibold">Contact No.:</span> {center.contactNumbers}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-2xl font-bold text-[#8A1457] mb-4">IT'S ALWAYS FREE!</p>
        <p className="text-lg">
          If you want to find centers apart from Telangana state, please find them{" "}
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

      <hr className="m-10" />
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
