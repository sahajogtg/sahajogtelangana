'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

type EventDetails = {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
};

type Participant = {
  name: string;
  state: string;
  city: string;
  age: string;
  amountPaid: number;
  email: string;
};

type RegistrationResponse = {
  _id: string;
  name: string;
  eventTitle: string;
  age: number;
  amountPaid: number;
  state: string;
  city: string;
  transactionNumber: string;
  createdAt: string;
}

export default function EventRegistration({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    city: '',
    age: '',
    email: '',
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isBulkRegistration, setIsBulkRegistration] = useState(false);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [participantErrors, setParticipantErrors] = useState<Record<number, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptData, setReceiptData] = useState<RegistrationResponse | null>(null);
  const [bulkReceiptData, setBulkReceiptData] = useState<RegistrationResponse[] | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch event details
    const fetchEvent = async () => {
      try {
        setLoading(true);
        
        // Attempt to fetch from API
        try {
          const response = await axios.get(`/api/events/${params.id}`);
          if (response.data.status === 200) {
            setEvent(response.data.data);
          }
        } catch (error) {
          // If API fails, check if this is the sample event
          if (params.id === 'krishna-puja-2025') {
            setEvent({
              _id: 'krishna-puja-2025',
              title: 'Shri Krishna Puja 2025',
              description: 'Join us for the auspicious celebration of Shri Krishna Puja 2025. This three-day event will feature meditation, music, collective gatherings, and special pujas dedicated to Lord Krishna. All Sahaja Yogis and seekers are welcome to attend.',
              date: '2025-08-15T00:00:00.000Z',
              time: 'August 15-17, 9:00 AM - 7:00 PM',
              location: 'Puri, Odisha',
              image: '/ShriMatajiKrishnaPuja.jpg'
            });
          } else {
            throw new Error('Event not found');
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, router]);

  useEffect(() => {
    // Calculate amount based on age for individual registration
    const age = parseInt(formData.age);
    if (!isNaN(age)) {
      if (age < 12) {
        setFormData(prev => ({ ...prev, amountPaid: 1000 }));
      } else if (age >= 12 && age < 25) {
        setFormData(prev => ({ ...prev, amountPaid: 1800 }));
      } else {
        setFormData(prev => ({ ...prev, amountPaid: 2600 }));
      }
    }
  }, [formData.age]);

  useEffect(() => {
    // Calculate total amount for all participants
    if (isBulkRegistration) {
      const total = participants.reduce((sum, participant) => {
        const amount = getAmountByAge(parseInt(participant.age));
        return sum + amount;
      }, 0);
      setTotalAmount(total);
    } else {
      const age = parseInt(formData.age);
      if (!isNaN(age)) {
        setTotalAmount(getAmountByAge(age));
      } else {
        setTotalAmount(0);
      }
    }
  }, [isBulkRegistration, participants, formData.age]);

  const getAmountByAge = (age: number): number => {
    if (isNaN(age)) return 0;
    if (age < 12) return 1000;
    if (age >= 12 && age < 25) return 1800;
    return 2600;
  };

  const handleToggleRegistrationType = () => {
    setIsBulkRegistration(!isBulkRegistration);
    // Reset errors when switching registration types
    setErrors({});
    setParticipantErrors({});
  };

  const handleAddParticipant = () => {
    // Validate current form data before adding participant
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(parseInt(formData.age)) || parseInt(formData.age) <= 0) {
      newErrors.age = 'Please enter a valid age';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Calculate amount for this participant
    const age = parseInt(formData.age);
    const amount = getAmountByAge(age);
    
    // Add participant to the list
    const newParticipant: Participant = {
      ...formData,
      amountPaid: amount
    };
    
    setParticipants([...participants, newParticipant]);
    
    // Clear form for next participant
    setFormData({
      name: '',
      state: '',
      city: '',
      age: '',
      email: '',
    });
    
    // Clear errors
    setErrors({});
  };

  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
    
    // Update participant errors
    const newParticipantErrors = { ...participantErrors };
    delete newParticipantErrors[index];
    
    // Reindex errors
    const reindexedErrors: Record<number, Record<string, string>> = {};
    Object.keys(newParticipantErrors).forEach((key) => {
      const keyNum = parseInt(key);
      if (keyNum > index) {
        reindexedErrors[keyNum - 1] = newParticipantErrors[keyNum];
      } else {
        reindexedErrors[keyNum] = newParticipantErrors[keyNum];
      }
    });
    
    setParticipantErrors(reindexedErrors);
  };

  const handleEditParticipant = (index: number) => {
    // Set form data to participant data for editing
    setFormData(participants[index]);
    
    // Remove participant from list
    handleRemoveParticipant(index);
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
    if (isBulkRegistration && bulkReceiptData && bulkReceiptData.length > 0) {
      window.open(`/api/generate-pdf-receipt?transactionNumber=${bulkReceiptData[0].transactionNumber}`, '_blank');
    } else if (receiptData) {
      window.open(`/api/generate-pdf-receipt?registrationId=${receiptData._id}`, '_blank');
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
      const response = await axios.post('/api/email-receipt', {
        email,
        registrationId: receiptData?._id
      });
      
      if (response.data.status === 200) {
        setEmailSent(true);
      } else {
        setEmailError('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    if (isBulkRegistration) {
      // For bulk registration, validate transaction number and participants
      const newErrors: Record<string, string> = {};
      
      if (!transactionNumber.trim()) {
        newErrors.transactionNumber = 'Transaction number is required';
      }
      
      if (participants.length === 0) {
        newErrors.participants = 'At least one participant is required';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } else {
      // For individual registration
      const newErrors: Record<string, string> = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      
      if (!formData.age.trim()) {
        newErrors.age = 'Age is required';
      } else if (isNaN(parseInt(formData.age)) || parseInt(formData.age) <= 0) {
        newErrors.age = 'Please enter a valid age';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!transactionNumber.trim()) {
        newErrors.transactionNumber = 'Transaction number is required';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      if (isBulkRegistration) {
        // Bulk registration
        const response = await axios.post('/api/event-registrations', {
          eventId: params.id,
          eventTitle: event?.title,
          transactionNumber,
          totalAmountPaid: totalAmount,
          participants: participants.map(p => ({
            ...p,
            age: parseInt(p.age)
          }))
        });
        
        if (response.data.status === 201) {
          setSuccessMessage('Bulk registration successful! Thank you for registering for the event.');
          // Store registration data for receipt
          setBulkReceiptData(response.data.data);
          setShowReceipt(true);
          
          // Send receipt to email of each participant
          for (const participant of response.data.data) {
            try {
              await axios.post('/api/email-receipt', {
                email: participant.email,
                registrationId: participant._id
              });
            } catch (error) {
              console.error('Error sending email receipt:', error);
            }
          }
          
          // Clear form
          setFormData({
            name: '',
            state: '',
            city: '',
            age: '',
            email: '',
          });
          setParticipants([]);
          setTransactionNumber('');
        } else {
          setErrorMessage('Failed to register. Please try again.');
        }
      } else {
        // Individual registration
        const response = await axios.post('/api/event-registrations', {
          eventId: params.id,
          eventTitle: event?.title,
          name: formData.name,
          state: formData.state,
          city: formData.city,
          age: parseInt(formData.age),
          email: formData.email,
          transactionNumber,
          amountPaid: totalAmount
        });
        
        if (response.data.status === 201) {
          setSuccessMessage('Registration successful! Thank you for registering for the event.');
          // Store registration data for receipt
          setReceiptData(response.data.data);
          setShowReceipt(true);
          
          // Automatically send receipt to email
          try {
            await axios.post('/api/email-receipt', {
              email: formData.email,
              registrationId: response.data.data._id
            });
            setEmailSent(true);
            setEmail(formData.email);
          } catch (error) {
            console.error('Error sending email receipt:', error);
          }
          
          // Clear form
          setFormData({
            name: '',
            state: '',
            city: '',
            age: '',
            email: '',
          });
          setTransactionNumber('');
        } else {
          setErrorMessage('Failed to register. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred while submitting your registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">Event not found</h1>
        <p className="mt-4">The event you are looking for does not exist or has been removed.</p>
        <Link href="/" className="mt-6 inline-block bg-[#8A1457] text-white px-6 py-2 rounded-md">
          Return to Home
        </Link>
      </div>
    );
  }

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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {event.image && (
            <div className="md:w-1/3">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center mb-4">
              <div className="bg-[#F8ECF2] text-[#8A1457] text-xs font-medium rounded-full px-3 py-1">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="ml-2 text-gray-600 text-sm">{event.time}</div>
            </div>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-[#8A1457] mb-6">Register for the Event</h2>
          
          {successMessage && !showReceipt && (
            <div className="bg-[#F8ECF2] border border-[#8A1457] text-[#8A1457] px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          {showReceipt && (receiptData || bulkReceiptData) ? (
            <div className="mb-8">
              <div className="bg-[#F8ECF2] border border-[#8A1457] text-[#8A1457] rounded-lg p-6 mb-4">
                <h3 className="text-xl font-bold text-[#8A1457] text-center mb-4">Registration Successful!</h3>
                <p className="text-center mb-6">Your registration has been confirmed. Please keep this receipt for your records.</p>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4" ref={receiptRef}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">Sahaja Yoga Telangana</h4>
                      <p className="text-sm text-gray-600">Event Registration Receipt</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Receipt #: {
                        bulkReceiptData 
                          ? bulkReceiptData[0]?._id.substring(0, 8) 
                          : receiptData?._id.substring(0, 8)
                      }</p>
                      <p className="text-sm text-gray-600">Date: {
                        // Safely format the date with a fallback
                        bulkReceiptData 
                          ? (bulkReceiptData[0]?.createdAt 
                            ? format(new Date(bulkReceiptData[0].createdAt), 'dd MMM yyyy') 
                            : new Date().toLocaleDateString())
                          : (receiptData?.createdAt 
                            ? format(new Date(receiptData.createdAt), 'dd MMM yyyy') 
                            : new Date().toLocaleDateString())
                      }</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-b border-gray-200 py-4 mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Event Details</h5>
                    <p className="text-gray-800 font-medium">{
                      bulkReceiptData ? bulkReceiptData[0]?.eventTitle : receiptData?.eventTitle
                    }</p>
                    <p className="text-gray-600">{event?.location}</p>
                    <p className="text-gray-600">{new Date(event?.date || '').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  
                  {/* Participant Information - Single Registration */}
                  {receiptData && !bulkReceiptData && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-3">Participant Information</h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Name:</p>
                          <p className="font-medium">{receiptData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age:</p>
                          <p className="font-medium">{receiptData.age} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location:</p>
                          <p className="font-medium">{receiptData.city}, {receiptData.state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Registration ID:</p>
                          <p className="font-medium">{receiptData._id}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Participant Information - Bulk Registration */}
                  {bulkReceiptData && (
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
                            {bulkReceiptData.map((registration, index) => (
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
                          bulkReceiptData 
                            ? bulkReceiptData.reduce((sum, reg) => sum + reg.amountPaid, 0).toLocaleString() 
                            : receiptData?.amountPaid.toLocaleString()
                        }</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID:</p>
                        <p className="font-medium">{
                          bulkReceiptData ? bulkReceiptData[0]?.transactionNumber : receiptData?.transactionNumber
                        }</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Status:</p>
                        <p className="font-medium text-[#8A1457]">Confirmed</p>
                      </div>
                      {bulkReceiptData && (
                        <div>
                          <p className="text-sm text-gray-600">Participants:</p>
                          <p className="font-medium">{bulkReceiptData.length}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center mt-8 text-sm text-gray-600">
                    <p>Thank you for registering for the event!</p>
                    <p>For any inquiries, please contact us at info@sahajayogaodisha.org</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button 
                    onClick={handlePrintReceipt} 
                    className="bg-[#8A1457] hover:bg-[#6A0F43] text-white font-bold py-2 px-4 rounded flex items-center justify-center"
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
                  
                  <div className="flex-1">
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
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
                
                <div className="text-center mt-6">
                  <Link href="/" className="text-blue-600 hover:underline">
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsBulkRegistration(false)}
                  className={`px-4 py-2 rounded ${!isBulkRegistration 
                    ? 'bg-[#8A1457] text-white' 
                    : 'bg-gray-200 text-gray-700'}`}
                >
                  Individual Registration
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkRegistration(true)}
                  className={`px-4 py-2 rounded ${isBulkRegistration 
                    ? 'bg-[#8A1457] text-white' 
                    : 'bg-gray-200 text-gray-700'}`}
                >
                  Bulk Registration
                </button>
              </div>
              
              <div className="md:flex">
                <div className="md:w-1/2 md:pr-6">
                  <form onSubmit={handleSubmit}>
                    {isBulkRegistration && (
                      <div className="bg-[#F8ECF2] rounded p-4 mb-4">
                        <h3 className="font-medium text-[#8A1457]">Bulk Registration</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Register multiple participants with a single payment. Add all participants before submitting.
                        </p>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                        {isBulkRegistration ? 'Participant Name *' : 'Name *'}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded text-gray-800 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter full name"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="state" className="block text-gray-700 font-medium mb-2">State *</label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full p-2 border rounded text-gray-800 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Your state"
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="city" className="block text-gray-700 font-medium mb-2">City *</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full p-2 border rounded text-gray-800 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Your city"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="age" className="block text-gray-700 font-medium mb-2">Age *</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded text-gray-800 ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Age"
                        min="1"
                      />
                      {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded text-gray-800 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter your email"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    {isBulkRegistration && (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={handleAddParticipant}
                          className="bg-[#E39321] hover:bg-[#C37D1D] text-white font-medium py-2 px-4 rounded flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Participant
                        </button>
                      </div>
                    )}
                    
                    {isBulkRegistration && participants.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-700 mb-2">Added Participants</h3>
                        <div className="border rounded-md overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {participants.map((participant, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-900">{participant.name}</div>
                                    <div className="text-gray-500 text-xs">{participant.city}, {participant.state}</div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{participant.age}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{participant.amountPaid.toLocaleString()}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      type="button"
                                      onClick={() => handleEditParticipant(index)}
                                      className="text-[#8A1457] hover:text-[#6A0F43] mr-3"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveParticipant(index)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {errors.participants && (
                          <p className="text-red-500 text-sm mt-1">{errors.participants}</p>
                        )}
                      </div>
                    )}
                    
                    {totalAmount > 0 && (
                      <div className="mb-4 p-3 bg-[#FBECDF] rounded-md">
                        <p className="font-medium text-[#8A1457]">
                          {isBulkRegistration 
                            ? `Total Registration Fee: ₹${totalAmount.toLocaleString()}`
                            : `Registration Fee: ₹${totalAmount.toLocaleString()}`
                          }
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Amount is based on age:
                          <br />
                          - Below 12 years: ₹1,000
                          <br />
                          - 12 to 24 years: ₹1,800
                          <br />
                          - 25 years and above: ₹2,600
                        </p>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label htmlFor="transactionNumber" className="block text-gray-700 font-medium mb-2">
                        Transaction ID / UPI Transaction ID *
                      </label>
                      <input
                        type="text"
                        id="transactionNumber"
                        name="transactionNumber"
                        value={transactionNumber}
                        onChange={(e) => {
                          setTransactionNumber(e.target.value);
                          if (errors.transactionNumber) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.transactionNumber;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full p-2 border rounded text-gray-800 ${errors.transactionNumber ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter payment transaction ID"
                      />
                      {errors.transactionNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.transactionNumber}</p>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-[#8A1457] hover:bg-[#6A0F43] text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                      disabled={submitting || (isBulkRegistration && participants.length === 0)}
                    >
                      {submitting ? 'Registering...' : 'Register for Event'}
                    </button>
                  </form>
                </div>
                
                <div className="md:w-1/2 md:pl-6 mt-8 md:mt-0">
                  <div className="p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-4 text-center">Payment Information</h3>
                    <p className="mb-4 text-center">Please scan the QR code to make the payment</p>
                    
                    <div className="flex justify-center mb-4">
                      <div className="rounded-md border border-gray-300 p-4 bg-white">
                        <img
                          src="/assets/images/TrustPaymentQR.png"
                          alt="Payment QR Code"
                          className="w-96 h-96 object-contain"
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-2">
                      <p className="font-medium text-center">Please complete the payment before submitting the form</p>
                      <p>1. Scan the QR code using any UPI app (GooglePay, PhonePe, Paytm, etc.)</p>
                      <p>2. Pay the registration fee amount {isBulkRegistration ? 'for all participants' : 'based on your category'}</p>
                      <p>3. Enter the transaction ID/reference number in the form</p>
                      <p>4. Submit the registration form</p>
                    </div>
                    
                    <div className="mt-6 p-4 bg-[#F8ECF2] rounded-md border border-[#8A1457]">
                      <h4 className="font-medium text-[#8A1457] text-center mb-2">Bank Transfer Details</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="font-medium">H.H SHRI MATAJI NIRMALA DEVI SAHAJA YOGA TRUST</p>
                        <p>Account No: 149612010001632</p>
                        <p>IFSC Code: UBIN0814962</p>
                        <p>Bank: UNION BANK OF INDIA</p>
                        <p>Branch: IRC VILLAGE, EKAMRA VILLA SQUARE</p>
                        <p>NAYAPLLI, BHUBNESWAR</p>
                        <p>PIN: 751015</p>
                      </div>
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