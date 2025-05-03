"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const AddCenterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: "",
    day: "",
    time: "",
    contactPersons: "",
    contactNumbers: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/admin/centers", formData);
      console.log("✅ Center added response:", response.data);

      setMessage(response.data.msg);
      setFormData({
        address: "",
        day: "",
        time: "",
        contactPersons: "",
        contactNumbers: "",
      });

      mutate("/api/auth/centers");

      setTimeout(() => {
        router.push("/centers");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error adding center:", error);
      if (error.response?.data?.errors?.length) {
        const firstError = error.response.data.errors[0];
        setMessage(firstError?.message || "Validation error.");
      } else if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
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
          <select
            id="day"
            name="day"
            value={formData.day}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select a day</option>
            {daysOfWeek.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="time" className="block mb-1">Time:</label>
          <input
            type="time"
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
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
};

export default AddCenterPage;
