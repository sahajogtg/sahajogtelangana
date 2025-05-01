import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: [true, "Name field is required."],
    minLength: [2, "Name must be at least 2 characters long."],
    trim: true,
  },
  email: {
    type: Schema.Types.String,
    required: [true, "Email field is required."],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phoneNumber: {
    type: Schema.Types.String,
    required: [true, "Phone number is required."],
    trim: true,
  },
  message: {
    type: Schema.Types.String,
    required: [true, "Message field is required."],
    minLength: [2, "Message must be at least 10 characters long."],
    maxLength: [1000, "Message cannot exceed 1000 characters."],
  },
  createdAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  status: {
    type: Schema.Types.String,
    enum: ['New', 'In Progress', 'Done', 'Following Up'],
    default: 'New',
  },
});

export const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);