// src/app/admin/dashboard/page.tsx

import React from "react";
import Link from "next/link";
import { MdDashboard, MdPeople, MdMessage, MdEvent, MdAddLocation, MdSupervisorAccount } from "react-icons/md";
import { getServerSession } from "next-auth";
import { CustomSession, authOptions } from "@/app/api/auth/[...nextauth]/options";

const menuItems = [
  { name: "Dashboard", icon: <MdDashboard size={24} />, href: "/admin/dashboard" },
  { name: "All Users", icon: <MdSupervisorAccount size={24} />, href: "/admin/all-users" },
  { name: "Seekers", icon: <MdPeople size={24} />, href: "/admin/seekers" },
  { name: "Messages", icon: <MdMessage size={24} />, href: "/admin/messages" },
  { name: "Program Requests", icon: <MdEvent size={24} />, href: "/admin/program-requests" },
  // { name: "Add New Center", icon: <MdAddLocation size={24} />, href: "/admin/add-center" },
];

export default async function AdminDashboard() {
  const session: CustomSession | null = await getServerSession(authOptions);

  return (
    <>
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.slice(1).map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">View {item.name.toLowerCase()}</p>
              </div>
              <div className="text-3xl text-blue-500">{item.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Session Info (for debugging) */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Session Info:</h3>
        <pre className="text-sm overflow-auto">
          {session && JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </>
  );
}