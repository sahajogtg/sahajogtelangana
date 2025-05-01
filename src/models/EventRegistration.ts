import mongoose, { Schema } from "mongoose";

const eventRegistrationSchema = new Schema({
  eventId: {
    type: Schema.Types.String,
    required: [true, "Event ID is required."],
    trim: true,
  },
  eventTitle: {
    type: Schema.Types.String,
    required: [true, "Event title is required."],
    trim: true,
  },
  name: {
    type: Schema.Types.String,
    required: [true, "Name is required."],
    trim: true,
  },
  email: {
    type: Schema.Types.String,
    required: [true, "Email is required."],
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  state: {
    type: Schema.Types.String,
    required: [true, "State is required."],
    trim: true,
  },
  city: {
    type: Schema.Types.String,
    required: [true, "City is required."],
    trim: true,
  },
  age: {
    type: Schema.Types.Number,
    required: [true, "Age is required."],
  },
  transactionNumber: {
    type: Schema.Types.String,
    required: [true, "Transaction number is required."],
    trim: true,
  },
  amountPaid: {
    type: Schema.Types.Number,
    required: [true, "Amount paid is required."],
  },
  registeredAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
});

export const EventRegistration = mongoose.models.EventRegistration || 
  mongoose.model("EventRegistration", eventRegistrationSchema); 