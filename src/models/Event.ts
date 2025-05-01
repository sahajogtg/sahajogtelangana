import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema({
  title: {
    type: Schema.Types.String,
    required: [true, "Title field is required."],
    trim: true,
  },
  description: {
    type: Schema.Types.String,
    required: [true, "Description field is required."],
    trim: true,
  },
  date: {
    type: Schema.Types.Date,
    required: [true, "Date field is required."],
  },
  time: {
    type: Schema.Types.String,
    required: [true, "Time field is required."],
    trim: true,
  },
  location: {
    type: Schema.Types.String,
    required: [true, "Location field is required."],
    trim: true,
  },
  image: {
    type: Schema.Types.String,
    required: false,
    trim: true,
  },
  isActive: {
    type: Schema.Types.Boolean,
    default: true,
  },
  createdAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
});

export const Event = mongoose.models.Event || mongoose.model("Event", eventSchema); 