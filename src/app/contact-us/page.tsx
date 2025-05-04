'use client';

import React, { useState } from 'react';
import axios from 'axios';

type ContactErrorType = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  message?: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactErrorType>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/contact', formData);

      if (response.data.status === 200) {
        setFormData({ name: '', email: '', phoneNumber: '', message: '' });
        setSuccess(true);
        setErrors({});
      } else {
        setErrors({});
      }
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          name: 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-us" className="py-20 bg-[#FEF5E7] text-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#8A1457]">Contact Us!</h2>
          <p className="text-gray-600 mt-4 text-lg max-w-xl mx-auto">
            Reach out for a tailored Sahaja Yoga session at your organization, school, or institution.
          </p>
        </div>

        <div className="bg-white shadow-soft rounded-3xl overflow-hidden md:flex">
          {/* Left Content */}
          <div className="bg-gradient-to-br from-[#d0f7f2e6]/90 via-[#F5D8A7]/90 to-[#FBECDF] md:w-1/2 p-8 md:p-10 space-y-6">
            <h3 className="text-3xl font-bold text-[#8A1457]">FREE Meditation Sessions!</h3>
            <p className="text-gray-700">We offer free meditation programs for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Corporate organizations</li>
              <li>Schools and universities</li>
              <li>Other institutions</li>
            </ul>
            <p className="text-sm md:text-base text-gray-700">
              Experience the transformative power of Sahaja Yoga meditation. Contact us for a free,
              customized session.
            </p>
          </div>

          {/* Right Form */}
          <div className="md:w-1/2 bg-white p-8 md:p-10">
            {success ? (
              <div className="text-center py-10">
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-6">Your message has been sent successfully. We'll be in touch soon.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-[#8A1457] text-white px-6 py-2 rounded-md hover:bg-[#6A0F43] transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E39321] outline-none"
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E39321] outline-none"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E39321] outline-none"
                    required
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E39321] outline-none resize-none"
                    required
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#8A1457] text-white px-6 py-2 rounded-md hover:bg-[#6A0F43] transition disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <a href="/corporate-register" className="text-[#8A1457] hover:underline text-sm font-medium">
                    Or schedule a session
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
