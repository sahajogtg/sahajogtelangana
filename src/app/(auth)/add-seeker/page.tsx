'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface SeekerEntry {
  name: string;
  city: string;
  phone: string;
}

export default function AddSeekerPage() {
  const [seekers, setSeekers] = useState<SeekerEntry[]>([{ name: '', city: '', phone: '' }]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [errors, setErrors] = useState<seekerErrorType>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            router.push('/login');
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, router]);

  const handleInputChange = (index: number, field: keyof SeekerEntry, value: string) => {
    const updatedSeekers = [...seekers];
    updatedSeekers[index][field] = value;
    setSeekers(updatedSeekers);
  };

  const addRow = () => {
    setSeekers([...seekers, { name: '', city: '', phone: '' }]);
  };

  const removeRow = (index: number) => {
    const updatedSeekers = seekers.filter((_, i) => i !== index);
    setSeekers(updatedSeekers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/add-seeker', seekers);

      if (response.status === 201) {
        alert('Seekers added successfully');
        setSeekers([{ name: '', city: '', phone: '' }]);
      } else {
        setErrors({});
      }
    } catch (error) {
      console.error('Error adding seekers:', error);
      alert('An error occurred while adding seekers');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl text-center font-bold mb-4 text-green-700">
          You must login first to add a seeker. Redirecting to login page in {countdown} seconds...
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Seekers</h1>
      <form onSubmit={handleSubmit}>
        {seekers.map((seeker, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Name"
              value={seeker.name}
              onChange={(e) => handleInputChange(index, 'name', e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
            <span className="text-red-500 font-bold">
                {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
              </span>
            <input
              type="text"
              placeholder="City"
              value={seeker.city}
              onChange={(e) => handleInputChange(index, 'city', e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
            <span className="text-red-500 font-bold">
                {errors.city && <p className="text-red-500 text-xs italic">{errors.city}</p>}
              </span>
            <input
              type="tel"
              placeholder="Phone"
              value={seeker.phone}
              onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
              className="p-2 border rounded w-full"
              required
            />
            <span className="text-red-500 font-bold">
                {errors.phoneNumber && <p className="text-red-500 text-xs italic">{errors.phoneNumber}</p>}
              </span>
            {seekers.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="bg-red-500 text-white p-2 rounded w-full sm:w-auto"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="bg-blue-500 text-white p-2 rounded mb-4"
        >
          Add Row
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white p-2 rounded w-full"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}