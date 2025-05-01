'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import SectionTitle from './SectionTitle';

type ContactErrorType = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  message?: string;
};

const ContactUs = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: ''
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
      console.error("Error submitting contact form:", err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ name: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-[#F44336] via-[#E91E63] to-[#FF9800] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white">Contact Us!</h2>
        </div>
        
        <div className="bg-[#E91E63]/90 rounded-xl shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5 p-8">
              <h3 className="text-3xl font-bold mb-6">FREE Meditation Sessions!</h3>
              <p className="mb-4">We offer free meditation programs for:</p>
              <ul className="list-disc list-inside mb-6 space-y-2">
                <li>Corporate organizations</li>
                <li>Schools and universities</li>
                <li>Other institutions</li>
              </ul>
              <p className="text-sm md:text-base">
                Experience the transformative power of Sahaja Yoga meditation in your organization. 
                Reach out to us for a tailored, free meditation session.
              </p>
            </div>
            
            <div className="md:w-3/5 bg-white rounded-l-xl p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-6">Your message has been sent successfully. We'll get back to you soon.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="bg-[#8A1457] text-white px-6 py-2 rounded-md hover:bg-[#6A0F43] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      required
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                      required
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-1">Message</label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E91E63] resize-none"
                      required
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#8A1457] text-white font-medium px-6 py-2 rounded-md hover:bg-[#6A0F43] transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                    
                    <div className="text-gray-600 text-sm">
                      <span className="mr-2">OR</span>
                      <a 
                        href="#" 
                        className="text-[#8A1457] hover:underline"
                      >
                        Schedule a Session
                      </a>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs; 