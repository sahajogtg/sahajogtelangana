// models/Seeker.ts
import mongoose, { Schema } from "mongoose";

const seekerSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  addedBy: { 
    type: String, 
    required: true 
  },
  addedAt: { type: Date, default: Date.now }
});

export const Seeker = mongoose.models.Seeker || mongoose.model("Seeker", seekerSchema);