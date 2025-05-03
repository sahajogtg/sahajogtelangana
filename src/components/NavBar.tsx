'use client'

import { useState, useEffect } from "react";
import { NAV_LINKS } from "../../constants";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";

const Navbar = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Add scroll event listener to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = (session?.user as CustomUser)?.role === "Admin";

  return (
    <nav className={`w-full transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-9 w-36">
              <Image src="/logo-green.svg" alt="Sahaja Yoga Telangana" fill className="object-contain" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            {NAV_LINKS.map((link) => (
              <Link 
                href={link.href} 
                key={link.key} 
                className="px-3 py-1.5 text-gray-700 hover:text-[#8A1457] font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-2 ml-2">
              {/* Action Buttons */}
              {/* <Link 
                href="/register-event" 
                className="px-4 py-1.5 text-white bg-[#8A1457] hover:bg-[#6A0F43] rounded-md transition-colors text-sm font-medium"
              >
                Register
              </Link> */}
              
              {/* <Link 
                href="/download-receipt" 
                className="px-4 py-1.5 text-white bg-[#E39321] hover:bg-[#C37D1D] rounded-md transition-colors text-sm font-medium"
              >
                Receipt
              </Link> */}
              
              {/* Admin Button */}
              {isAdmin && (
                <Link 
                  href="/admin/event-registrations" 
                  className="px-4 py-1.5 text-white bg-[#4B8B3B] hover:bg-[#396B2B] rounded-md transition-colors text-sm font-medium"
                >
                  Admin
                </Link>
              )}
              
              {/* Auth Button */}
              {session ? (
                <button
                  className="px-4 py-1.5 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                  onClick={async () => {
                    localStorage.clear();
                    document.cookie.split(";").forEach((c) => {
                      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });
                    await signOut({ callbackUrl: "/", redirect: true });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              ) : (
                <button 
                  onClick={() => signIn()} 
                  className="px-4 py-1.5 text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg py-2">
          <div className="px-4 py-2 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link 
                href={link.href} 
                key={link.key} 
                className="block py-2.5 px-4 text-base text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}
            
            {/* <div className="grid grid-cols-2 gap-2 py-2"> */}
              {/* <Link 
                href="/register-event" 
                className="py-2.5 px-4 text-center text-white bg-[#8A1457] hover:bg-[#6A0F43] rounded-md transition-colors text-base"
                onClick={toggleMenu}
              >
                Register Event
              </Link> */}
              
              {/* <Link 
                href="/download-receipt" 
                className="py-2.5 px-4 text-center text-white bg-[#E39321] hover:bg-[#C37D1D] rounded-md transition-colors text-base"
                onClick={toggleMenu}
              >
                Download Receipt
              </Link> */}
            {/* </div> */}
            
            {isAdmin && (
              <Link 
                href="/admin/event-registrations" 
                className="block py-2.5 px-4 text-center text-white bg-[#4B8B3B] hover:bg-[#396B2B] rounded-md transition-colors text-base"
                onClick={toggleMenu}
              >
                Admin Dashboard
              </Link>
            )}
            
            {session ? (
              <button
                className="w-full mt-2 py-2.5 px-4 text-center text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-colors text-base flex items-center justify-center gap-2"
                onClick={async () => {
                  localStorage.clear();
                  document.cookie.split(";").forEach((c) => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                  });
                  await signOut({ callbackUrl: "/", redirect: true });
                  toggleMenu();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            ) : (
              <button 
                className="w-full mt-2 py-2.5 px-4 text-center text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-colors text-base flex items-center justify-center gap-2"
                onClick={() => {
                  signIn();
                  toggleMenu();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;