import React from "react";
import Link from "next/link";
import { MdDashboard, MdPeople, MdMessage, MdEvent, MdAddLocation, MdSupervisorAccount, MdCalendarToday, MdHowToReg } from "react-icons/md";

const menuItems = [
  { name: "Dashboard", icon: <MdDashboard size={24} />, href: "/admin/dashboard" },
  { name: "All Users", icon: <MdSupervisorAccount size={24} />, href: "/admin/all-users" },
  { name: "Seekers", icon: <MdPeople size={24} />, href: "/admin/seekers" },
  { name: "Events", icon: <MdCalendarToday size={24} />, href: "/admin/events" },
  { name: "Event Registrations", icon: <MdHowToReg size={24} />, href: "/admin/event-registrations" },
  { name: "Messages", icon: <MdMessage size={24} />, href: "/admin/messages" },
  { name: "Program Requests", icon: <MdEvent size={24} />, href: "/admin/program-requests" },
  // { name: "Add New Center", icon: <MdAddLocation size={24} />, href: "/admin/add-center" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#8A1457] shadow-md hidden md:block">
        <div className="p-4">
          <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-6 py-3 text-white hover:bg-[#6A0F43] transition-colors duration-200"
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
