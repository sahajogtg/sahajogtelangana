import mongoose, { Schema } from "mongoose";

const volunteerProfileSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: [true, "Volunteer name is required."],
    trim: true,
  },
  email: {
    type: Schema.Types.String,
    required: [true, "Volunteer email is required."],
    trim: true,
    lowercase: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  phone: {
    type: Schema.Types.String,
    trim: true,
    default: "",
  },
  city: {
    type: Schema.Types.String,
    trim: true,
    default: "",
  },
  state: {
    type: Schema.Types.String,
    trim: true,
    default: "",
  },
  language: {
    type: Schema.Types.String,
    trim: true,
    default: "",
  },
  gender: {
    type: Schema.Types.String,
    trim: true,
    enum: ["Male", "Female", "Unknown"],
    default: "Unknown",
  },
  interests: {
    type: [Schema.Types.String],
    default: [],
  },
  roles: {
    type: [Schema.Types.String],
    default: [],
  },
  assignments: {
    type: [Schema.Types.String],
    default: [],
  },
  availability: {
    type: Schema.Types.String,
    trim: true,
    default: "",
  },
  staffingFocus: {
    type: Schema.Types.String,
    trim: true,
    default: "",
  },
  notes: {
    type: Schema.Types.String,
    trim: true,
    default: "",
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

volunteerProfileSchema.index({ createdAt: -1 });
volunteerProfileSchema.index({ email: 1 }, { unique: true });
volunteerProfileSchema.index({ userId: 1 });
volunteerProfileSchema.index({ language: 1, isActive: 1 });

export const VolunteerProfile =
  mongoose.models.VolunteerProfile ||
  mongoose.model("VolunteerProfile", volunteerProfileSchema);
