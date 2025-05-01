'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CorporateRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: { name: '', position: '', email: '', phone: '' },
    officeAddress: { street: '', city: '', state: ''},
    preferredProgramDate: new Date(), // Change this to a Date object
    additionalRemarks: ''
  })
  const [errors, setError] = useState<corporateRegisterErrorType>({});

  const handleSubmit = async () => {
    setLoading(true);
    console.log("The payload is: ", formData);
    
    axios
        .post("/api/auth/corporate-register", formData)
        .then((res) => {
            setLoading(false);
            console.log("The response is: ", res.data);
            const response = res.data;
            if(response.status == 200) {
                router.push('/');
            } else {
                setError({});
            }
        })
        .catch((err) => {
        setLoading(false);
        console.log("The error is: ", err);
        if (err.response && err.response.data && err.response.data.errors) {
            setError(err.response.data.errors);
        } else {
            setError({ companyName: 'An unexpected error occurred. Please try again.' });
        }
        });
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Corporate Program Registration
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Please fill out the form below to register your company for our corporate program.
          </p>
        </div>
        <form action="#" method="POST" onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value})}
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <span className="text-red-500 font-bold">
                {errors?.companyName}
            </span>
            </div>

            <div>
              <label htmlFor="contactPerson.name" className="block text-sm font-medium text-gray-700">Contact Person Name</label>
              <input
                type="text"
                name="contactPerson.name"
                id="contactPerson.name"
                onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPerson: {
                        ...formData.contactPerson,
                        name: e.target.value,
                      },
                    })
                  }
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <span className="text-red-500 font-bold">
                        {errors?.contactPerson?.name}
                    </span>
            </div>

            <div>
              <label htmlFor="contactPerson.position" className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                name="contactPerson.position"
                id="contactPerson.position"
                onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPerson: {
                        ...formData.contactPerson,
                        position: e.target.value,
                      },
                    })
                  }
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <span className="text-red-500 font-bold">
                    {errors?.contactPerson?.position}
                </span>
            </div>

            <div>
              <label htmlFor="contactPerson.email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="contactPerson.email"
                id="contactPerson.email"
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        contactPerson: {
                            ...formData.contactPerson,
                            email: e.target.value,
                        },
                    })
                  }
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
                <span className="text-red-500 font-bold">
                        {errors?.contactPerson?.email}
                    </span>
            </div>

            <div>
              <label htmlFor="contactPerson.phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="contactPerson.phone"
                id="contactPerson.phone"
                onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPerson: {
                        ...formData.contactPerson,
                        phone: e.target.value,
                      },
                    })
                  }
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <span className="text-red-500 font-bold">
                        {errors?.contactPerson?.phone}
                    </span>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="officeAddress.street" className="block text-sm font-medium text-gray-700">Street Address</label>
              <input
                type="text"
                name="officeAddress.street"
                id="officeAddress.street"
                onChange={(e) =>
                    setFormData({
                      ...formData,
                      officeAddress: {
                        ...formData.officeAddress,
                        street: e.target.value,
                      },
                    })
                  }
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <span className="text-red-500 font-bold">
                {errors?.officeAddress?.street}
            </span>
            </div>

            <div>
              <label htmlFor="officeAddress.city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="officeAddress.city"
                id="officeAddress.city"
                onChange={(e) =>
                    setFormData({
                      ...formData,
                      officeAddress: {
                        ...formData.officeAddress,
                        city: e.target.value,
                      },
                    })
                  }
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <span className="text-red-500 font-bold">
                {errors?.officeAddress?.city}
            </span>
            </div>

            <div>
              <label htmlFor="officeAddress.state" className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="officeAddress.state"
                id="officeAddress.state"
                onChange={(e) =>
                    setFormData({
                      ...formData,
                      officeAddress: {
                        ...formData.officeAddress,
                        state: e.target.value,
                      },
                    })
                  }
                required
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
              <span className="text-red-500 font-bold">
                {errors?.officeAddress?.state}
            </span>
            </div>

           <div className="sm:col-span-2">
            <label htmlFor="preferredProgramDate" className="block text-sm font-medium text-gray-700">
                Preferred Program Date
            </label>
            <DatePicker
                name="preferredProgramDate"
                id="preferredProgramDate"
                selected={formData.preferredProgramDate}
                onChange={(date: Date | null) => setFormData({ ...formData, preferredProgramDate: date || new Date() })}
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                dateFormat="yyyy-MM-dd"
            />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="additionalRemarks" className="block text-sm font-medium text-gray-700">Additional Remarks</label>
              <textarea
                name="additionalRemarks"
                id="additionalRemarks"
                onChange={(e) => setFormData({ ...formData, additionalRemarks: e.target.value})}
                rows={3}
                className="mt-1 p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>

          <div className="mt-6">
            <button
                type="button"
                className={`inline-flex w-full items-center justify-center rounded-md  px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80 ${
                    loading ? "bg-gray-700" : "bg-black"
                }`}
                onClick={handleSubmit}
                disabled={loading}
                >
                {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}