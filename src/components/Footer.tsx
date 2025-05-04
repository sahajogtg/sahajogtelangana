import { FOOTER_CONTACT_INFO, FOOTER_LINKS, SOCIALS } from '../../constants'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white pt-10 pb-4 border-t">
      <div className="shrine-container flex w-full flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="mb-6 md:mb-0 md:w-1/3">
            <Link href="/" className="mb-6 inline-block">
              <div className="relative h-14 w-56">
                <Image src="/logo-green.svg" alt="Sahaja Yoga Telangana" fill className="object-contain" />
              </div>
            </Link>
            <p className="mt-4 text-gray-600 text-sm">
              Sahaja Yoga is a unique method of meditation founded by Shri Mataji Nirmala Devi that allows us to attain a state of thoughtless awareness.
            </p>
            <div className="mt-6">
              <h4 className="text-[#8A1457] font-semibold mb-3">Connect With Us</h4>
              <ul className="flex gap-4">
                {SOCIALS.links.map((link, index) => (
                  <Link href="/" key={index} className="text-gray-500 hover:text-[#8A1457] transition-colors">
                    <Image src={link} alt="social" width={24} height={24} />
                  </Link>
                ))}
              </ul>
            </div>
          </div>

          <div className='flex flex-wrap gap-10 md:flex-1 justify-between'>
            {FOOTER_LINKS.map((columns) => (
              <FooterColumn title={columns.title} key={columns.title}>
                <ul className="flex flex-col gap-3 text-gray-600">
                  {columns.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.path} 
                        className="text-sm hover:text-[#8A1457] hover:underline transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            ))}

            <div className="flex flex-col gap-5">
              <FooterColumn title={FOOTER_CONTACT_INFO.title}>
                <ul className="flex flex-col gap-3">
                  {FOOTER_CONTACT_INFO.links.map((link) => (
                    <li key={link.label} className="flex flex-col md:flex-row gap-1 text-sm">
                      <span className="text-gray-700 font-medium">
                        {link.label}:
                      </span>
                      <span className="text-[#8A1457]">
                        {link.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-2" />
        <p className="text-sm text-center text-gray-500">© 2025 Sahaja Yoga Telangana | All rights reserved</p>
      </div>
    </footer>
  )
}

type FooterColumnProps = {
  title: string;
  children: React.ReactNode;
}

const FooterColumn = ({ title, children }: FooterColumnProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[#8A1457] font-semibold">{title}</h4>
      {children}
    </div>
  )
}

export default Footer
