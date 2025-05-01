'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AddCenterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: '',
    day: '',
    time: '',
    contactPersons: '',
    contactNumbers: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/admin/centers', formData);
      setMessage(response.data.msg);
      setFormData({
        address: '',
        day: '',
        time: '',
        contactPersons: '',
        contactNumbers: '',
      });
      
      // Show success message for a brief moment before redirecting
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500); // Redirect after 1.5 seconds
    } catch (error) {
      setMessage('Error adding center. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Add New Center</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block mb-1">Address:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="day" className="block mb-1">Day:</label>
          <input
            type="text"
            id="day"
            name="day"
            value={formData.day}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="time" className="block mb-1">Time:</label>
          <input
            type="text"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="contactPersons" className="block mb-1">Contact Persons:</label>
          <input
            type="text"
            id="contactPersons"
            name="contactPersons"
            value={formData.contactPersons}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="contactNumbers" className="block mb-1">Contact Numbers:</label>
          <input
            type="text"
            id="contactNumbers"
            name="contactNumbers"
            value={formData.contactNumbers}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Center
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default AddCenterPage;