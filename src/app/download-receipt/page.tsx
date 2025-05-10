'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { format } from 'date-fns';

type RegistrationResponse = {
  _id: string;
  name: string;
  eventTitle: string;
  age: number;
  amountPaid: number;
  state: string;
  city: string;
  email: string;
  transactionNumber: string;
  createdAt: string;
};

export default function DownloadReceipt() {
  const router = useRouter();
  const [transactionNumber, setTransactionNumber] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationResponse[] | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionNumber.trim() && !name.trim()) {
      setError('Please enter a transaction number or name');
      return;
    }
    
    setLoading(true);
    setError('');
    setRegistrations(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (transactionNumber.trim()) {
        params.append('transactionNumber', transactionNumber);
      }
      if (name.trim()) {
        params.append('name', name);
      }
      
      const response = await axios.get(`/api/receipts?${params.toString()}`);
      
      if (response.data.status === 200) {
        setRegistrations(response.data.data);
      } else {
        setError(response.data.message || 'Error fetching receipts');
      }
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      setError(error.response?.data?.message || 'No registrations found with the provided information. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Reload the page to restore React state
      window.location.reload();
    }
  };

  const handleDownloadPDF = () => {
    if (registrations && registrations.length > 0) {
      // For transaction number-based search, use that as parameter
      if (transactionNumber) {
        window.open(`/api/generate-pdf-receipt?transactionNumber=${transactionNumber}`, '_blank');
      } 
      // For name-based search with a single result, use registration ID
      else if (registrations.length === 1) {
        window.open(`/api/generate-pdf-receipt?registrationId=${registrations[0]._id}`, '_blank');
      }
      // For name-based search with multiple results, use first registration's transaction number
      else if (registrations.length > 1) {
        window.open(`/api/generate-pdf-receipt?transactionNumber=${registrations[0].transactionNumber}`, '_blank');
      }
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendEmail = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    
    setSendingEmail(true);
    setEmailError('');
    
    try {
      // For bulk registrations, send separate emails for each registration
      if (registrations && registrations.length > 1) {
        for (const registration of registrations) {
          await axios.post('/api/email-receipt', {
            email,
            registrationId: registration._id
          });
        }
      } else if (registrations && registrations.length === 1) {
        // For single registration
        await axios.post('/api/email-receipt', {
          email,
          registrationId: registrations[0]._id
        });
      }
      
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-[#8A1457] hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-[#8A1457] mb-6">Download Registration Receipt</h2>
          
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="transactionNumber" className="block text-gray-700 font-medium mb-2">
                  Transaction Number
                </label>
                <input
                  type="text"
                  id="transactionNumber"
                  value={transactionNumber}
                  onChange={(e) => {
                    setTransactionNumber(e.target.value);
                    setError('');
                  }}
                  className="w-full p-2 border rounded text-gray-800 border-gray-300"
                  placeholder="Enter your payment transaction ID"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  className="w-full p-2 border rounded text-gray-800 border-gray-300"
                  placeholder="Enter your name as provided during registration"
                />
              </div>
              
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
              
              <button
                type="submit"
                className="w-full bg-[#8A1457] hover:bg-[#6A0F43] text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Find My Receipt'}
              </button>
            </form>
            
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Enter either your transaction number or name to find and download your registration receipt.</p>
            </div>
          </div>
          
          {registrations && registrations.length > 0 && (
            <div className="mb-8">
              <div className="bg-[#F8ECF2] border border-[#8A1457] text-[#8A1457] rounded-lg p-6 mb-4">
                <h3 className="text-xl font-bold text-[#8A1457] text-center mb-4">Receipt Found!</h3>
                <p className="text-center mb-6">Your registration receipt is available below. You can download or print it for your records.</p>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4" ref={receiptRef}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">Sahaja Yoga Telangana</h4>
                      <p className="text-sm text-gray-600">Event Registration Receipt</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Receipt #: {registrations[0]?._id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">Date: {
                        // Safely format the date with a fallback
                        registrations[0]?.createdAt 
                          ? format(new Date(registrations[0].createdAt), 'dd MMM yyyy') 
                          : new Date().toLocaleDateString()
                      }</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-gray-200 py-4 mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Event Details</h5>
                    <p className="text-gray-800 font-medium">{registrations[0]?.eventTitle}</p>
                  </div>
                  
                  {/* Participant Information - Single Registration */}
                  {registrations.length === 1 && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-3">Participant Information</h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Name:</p>
                          <p className="font-medium">{registrations[0].name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age:</p>
                          <p className="font-medium">{registrations[0].age} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location:</p>
                          <p className="font-medium">{registrations[0].city}, {registrations[0].state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email:</p>
                          <p className="font-medium">{registrations[0].email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Registration ID:</p>
                          <p className="font-medium">{registrations[0]._id}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Participant Information - Bulk Registration */}
                  {registrations.length > 1 && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-3">Participants Information</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {registrations.map((registration, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {registration.name}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {registration.age} years
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {registration.city}, {registration.state}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  ₹{registration.amountPaid.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Payment Information</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid:</p>
                        <p className="font-medium">₹{
                          registrations.reduce((sum, reg) => sum + reg.amountPaid, 0).toLocaleString()
                        }</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID:</p>
                        <p className="font-medium">{registrations[0]?.transactionNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Status:</p>
                        <p className="font-medium text-[#8A1457]">Confirmed</p>
                      </div>
                      {registrations.length > 1 && (
                        <div>
                          <p className="text-sm text-gray-600">Participants:</p>
                          <p className="font-medium">{registrations.length}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center mt-8 text-sm text-gray-600">
                    <p>Thank you for registering for the event!</p>
                    <p>For any inquiries, please contact us at info@sahajayogatelangana.org</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={handlePrintReceipt} 
                    className="bg-[#8A1457] hover:bg-[#6A0F43] text-white font-bold py-2 px-4 rounded flex items-center justify-center mr-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Receipt
                  </button>
                  
                  <button 
                    onClick={handleDownloadPDF} 
                    className="bg-[#E39321] hover:bg-[#C37D1D] text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-center font-medium mb-4">Email Receipt</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex">
                        <input
                          type="email"
                          placeholder="Enter email address"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError('');
                            setEmailSent(false);
                          }}
                          className={`flex-1 p-2 border rounded-l text-gray-800 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <button
                          onClick={handleSendEmail}
                          disabled={sendingEmail || emailSent}
                          className={`bg-[#E39321] hover:bg-[#C37D1D] text-white font-bold py-2 px-4 rounded-r disabled:bg-gray-400 whitespace-nowrap`}
                        >
                          {sendingEmail ? 'Sending...' : emailSent ? 'Sent!' : 'Email Receipt'}
                        </button>
                      </div>
                      {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                      {emailSent && <p className="text-[#8A1457] text-sm mt-1">Receipt has been sent to your email!</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 