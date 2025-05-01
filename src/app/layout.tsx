import './globals.css'
import type { Metadata } from 'next'
import NextAuthSessionProvider from "./provider/sessionProvider";
import Navbar from '@/components/NavBar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Sahaja Yoga Odisha',
  description: 'Official website of Sahaja Yoga Odisha',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>
          <div className="flex flex-col min-h-screen">
            {/* Logo and Main Navigation */}
            <header className="bg-white shadow-sm border-b">
              <div className="shrine-container py-2">
                <Navbar />
              </div>
            </header>

            <main className="flex-grow">
              {children}
            </main>

            {/* Bottom Banners */}
            <div className="bg-[#8A1457] text-white py-3">
              <div className="shrine-container text-center space-y-2">
                <div className="flex justify-center">
                  <a href="#" className="text-[#FDF5A6] hover:underline text-lg">
                    For Divine Donation Click Here
                  </a>
                </div>
                <div className="flex justify-center">
                  <a href="/register-event" className="text-[#FDF5A6] hover:underline text-lg">
                    For Event Registration Click Here
                  </a>
                </div>
                <div className="flex justify-center">
                  <a href="/download-receipt" className="text-[#FDF5A6] hover:underline text-lg">
                    Download Your Event Receipt Here
                  </a>
                </div>
              </div>
            </div>

            <Footer />
          </div>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}