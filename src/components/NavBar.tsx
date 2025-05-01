'use client'

import { useState } from "react";
import { NAV_LINKS } from "../../constants";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";

const Navbar = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Check if the user is an admin
  const isAdmin = (session?.user as CustomUser)?.role === "Admin";

  return (
    <nav className="relative z-30 flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <div className="relative h-14 w-44">
          <Image src="/logo-green.svg" alt="Sahaja Yoga Odisha" fill className="object-contain" />
        </div>
      </Link>

      {/* Main navigation - desktop */}
      <div className="flex items-center">
        <ul className="hidden h-full md:flex">
          {NAV_LINKS.map((link) => (
            <Link 
              href={link.href} 
              key={link.key} 
              className="px-4 py-2 text-gray-700 hover:text-[#8A1457] text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Event Registration Button */}
          <Link 
            href="/register-event" 
            className="ml-2 px-4 py-2 bg-[#8A1457] text-white text-sm font-medium rounded hover:bg-[#6A0F43] transition-colors"
          >
            Event Registration
          </Link>
          
          {/* Download Receipt Link */}
          <Link 
            href="/download-receipt" 
            className="ml-2 px-4 py-2 bg-[#E39321] text-white text-sm font-medium rounded hover:bg-[#C37D1D] transition-colors"
          >
            Download Receipt
          </Link>
          
          {/* Admin Dashboard Link - only shown for admin users */}
          {isAdmin && (
            <Link 
              href="/admin/event-registrations" 
              className="ml-2 px-4 py-2 bg-[#8A1457] text-white text-sm font-medium rounded hover:bg-[#6A0F43] transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          
          {/* Auth buttons */}
          {session ? (
            <div className="ml-2">
              <button
                className="px-4 py-2 bg-[#E39321] text-white text-sm font-medium rounded hover:bg-[#C37D1D] transition-colors"
                onClick={async () => {
                  // Clear local storage and cookies
                  localStorage.clear();
                  document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                      .replace(/^ +/, "")
                      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                  });
                  
                  // Perform sign out
                  await signOut({
                    callbackUrl: "/",
                    redirect: true,
                  });
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="ml-2">
              <button 
                onClick={() => signIn()} 
                className="px-4 py-2 bg-[#E39321] text-white text-sm font-medium rounded hover:bg-[#C37D1D] transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </ul>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-gray-700 focus:outline-none"
          onClick={toggleMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 w-full md:w-auto bg-white shadow-lg rounded-b z-50 md:hidden">
          <ul className="flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link 
                href={link.href} 
                key={link.key} 
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}
            
            <Link 
              href="/register-event" 
              className="px-4 py-2 text-[#8A1457] font-medium hover:bg-gray-100 text-sm"
              onClick={toggleMenu}
            >
              Event Registration
            </Link>
            
            {/* Download Receipt Link in mobile menu */}
            <Link 
              href="/download-receipt" 
              className="px-4 py-2 text-[#E39321] font-medium hover:bg-gray-100 text-sm"
              onClick={toggleMenu}
            >
              Download Receipt
            </Link>
            
            {/* Admin Dashboard Link in mobile menu - only shown for admin users */}
            {isAdmin && (
              <Link 
                href="/admin/event-registrations" 
                className="px-4 py-2 text-[#8A1457] font-medium hover:bg-gray-100 text-sm"
                onClick={toggleMenu}
              >
                Admin Dashboard
              </Link>
            )}
            
            {session ? (
              <button
                className="px-4 py-2 text-left text-[#E39321] font-medium hover:bg-gray-100 text-sm"
                onClick={() => {
                  signOut();
                  toggleMenu();
                }}
              >
                Sign Out
              </button>
            ) : (
              <button 
                className="px-4 py-2 text-left text-[#E39321] font-medium hover:bg-gray-100 text-sm"
                onClick={() => {
                  signIn();
                  toggleMenu();
                }}
              >
                Sign In
              </button>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
