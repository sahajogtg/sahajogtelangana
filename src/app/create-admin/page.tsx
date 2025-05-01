'use client';

import { useState } from 'react';
import axios from 'axios';

export default function CreateAdmin() {
  const [formData, setFormData] = useState({
    name: 'Admin',
    email: '',
    password: '',
    role: 'Admin'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAdmin = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      setMessage('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const response = await axios.post('/api/auth/create-admin', formData);
      
      if (response.data.status === 200) {
        setSuccess(true);
        setMessage(response.data.message);
      } else {
        setSuccess(false);
        setMessage(response.data.message || 'Failed to create admin user');
      }
    } catch (error: any) {
      setSuccess(false);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred while creating admin user');
      }
      console.error('Error creating admin:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF5E7] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#8A1457] mb-6 text-center">Create Admin User</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${success ? 'bg-[#F8ECF2] text-[#8A1457]' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter admin email"
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
              required
              disabled={loading || success}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter admin password"
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
              required
              disabled={loading || success}
            />
          </div>
          
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Admin name"
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
              disabled={loading || success}
            />
          </div>
        </div>
        
        <button
          onClick={handleCreateAdmin}
          disabled={loading || success || !formData.email || !formData.password}
          className={`w-full p-3 rounded ${
            success 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-[#8A1457] hover:bg-[#6A0F43]'
          } text-white font-medium transition-colors disabled:opacity-50`}
        >
          {loading ? 'Creating...' : success ? 'Admin Created Successfully' : 'Create Admin User'}
        </button>
        
        {success && (
          <div className="mt-4 text-center">
            <a href="/admin/login" className="text-[#8A1457] hover:underline">
              Go to Admin Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 