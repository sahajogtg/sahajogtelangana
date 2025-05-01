'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const GetApp = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        message: ''
      })
      const [errors, setErrors] = useState<contactErrorType>({})
      const [loading, setLoading] = useState(false)
    
      const handleSubmit = async () => {
        setLoading(true)
        axios
          .post('/api/auth/contact', formData)
          .then((res) => {
            setLoading(false);
            console.log("The response is: ", res.data);
            const response = res.data;
            if(response.status == 200) {
                setFormData({ name: '', email: '', phoneNumber: '', message: '' })
                router.push('/');
            } else {
                setErrors({});
            }
          })
          .catch((err) => {
                setLoading(false);
                console.log("The error is: ", err);
                if (err.response && err.response.data && err.response.data.errors) {
                    setErrors(err.response.data.errors);
                } else {
                    setErrors({ name: 'An unexpected error occurred. Please try again.' });
                }
            });
      }


  return (
    <section className="flexCenter w-full flex-col pb-[100px]">
        <h1 className="mx-auto bold-40 text-green-600 lg:bold-64 xl:max-w-[420px] ">Contact Us!</h1>
      <div className="get-app sm:gap-2">
        <div className="z-20 flex w-full flex-1 flex-col items-start justify-center gap-6  xl:w-8/12">
        <h1 className="mt-4 bold-30 lg:bold-40 ">FREE Meditation Sessions!</h1>
        <p className=" text-white  regular-24 ">
            We offer free meditation programs for:
          </p>
          <ul className="list-disc list-inside regular-24 text-white">
            <li>Corporate organizations</li>
            <li>Schools and universities</li>
            <li>Other institutions</li>
          </ul>
          <p className="regular-20 text-white mb-8">
            Experience the transformative power of Sahaja Yoga meditation in your organization. Reach out to us for a tailored, free meditation session.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center lg:w-1/2 p-6">
          <form method="POST" onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-white bold-20">Name</label>
              <input
                type="text"
                id="name"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 p-2 block text-green-800 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              <span className="text-red-500 font-bold">
                {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
              </span>
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-white bold-20">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 p-2 block text-green-800 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              <span className="text-red-500 font-bold">
                {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
              </span>
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-white bold-20">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="mt-1 p-2 block text-green-800 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
              <span className="text-red-500 font-bold">
                {errors.phoneNumber && <p className="text-red-500 text-xs italic">{errors.phoneNumber}</p>}
              </span>
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-white bold-20">Message</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="mt-1 p-2 block text-green-800 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              ></textarea>
              <span className="text-red-500 font-bold">
                {errors.message && <p className="text-red-500 text-xs italic">{errors.message}</p>}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className={`bg-white hover:bg-green-100 text-green-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <span className="mx-2 text-white">OR</span>
              <button
                type="button"
                className="bg-green-600 font-thin hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline underline"
                onClick={() => router.push('/corporate-register')}
              >
                Schedule a Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default GetApp