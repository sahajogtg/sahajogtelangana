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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
  },
  addedBy: { 
    type: String, 
    required: true 
  },
  locality: {
    type: String,
    trim: true,
    default: "",
  },
  source: {
    type: String,
    trim: true,
    default: "Website",
  },
  eventInterest: {
    type: String,
    trim: true,
    default: "",
  },
  centerInterest: {
    type: String,
    trim: true,
    default: "",
  },
  preferredLanguage: {
    type: String,
    trim: true,
    default: "English",
  },
  followUpStatus: {
    type: String,
    trim: true,
    default: "New",
  },
  seekerPhase: {
    type: String,
    trim: true,
    default: "New Seeker",
  },
  assignedVolunteer: {
    type: String,
    trim: true,
    default: "",
  },
  volunteerFollowUpCompletedAt: {
    type: Date,
    required: false,
  },
  volunteerFollowUpCompletedBy: {
    type: String,
    trim: true,
    default: "",
  },
  lastContactDate: {
    type: Date,
    required: false,
  },
  snoozedUntil: {
    type: Date,
    required: false,
  },
  snoozedBy: {
    type: String,
    trim: true,
    default: "",
  },
  snoozeReason: {
    type: String,
    trim: true,
    default: "",
  },
  gender: {
    type: String,
    trim: true,
    enum: ["Male", "Female", "Unknown"],
    default: "Unknown",
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  journeySessionId: {
    type: Schema.Types.ObjectId,
    ref: "JourneySession",
    required: false,
  },
  journeySource: {
    type: String,
    trim: true,
    default: "",
  },
  recommendationAccepted: {
    type: Boolean,
    default: false,
  },
  addedAt: { type: Date, default: Date.now }
});

seekerSchema.index({ addedAt: -1 });
seekerSchema.index({ city: 1, followUpStatus: 1 });
seekerSchema.index({ assignedVolunteer: 1, followUpStatus: 1 });
seekerSchema.index({ assignedVolunteer: 1, volunteerFollowUpCompletedAt: 1 });
seekerSchema.index({ snoozedUntil: 1 });

const existingSeekerModel = mongoose.models.Seeker as any;

if (existingSeekerModel) {
  existingSeekerModel.schema.add({
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    locality: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "Website",
    },
    eventInterest: {
      type: String,
      trim: true,
      default: "",
    },
    centerInterest: {
      type: String,
      trim: true,
      default: "",
    },
    preferredLanguage: {
      type: String,
      trim: true,
      default: "English",
    },
    followUpStatus: {
      type: String,
      trim: true,
      default: "New",
    },
    seekerPhase: {
      type: String,
      trim: true,
      default: "New Seeker",
    },
    assignedVolunteer: {
      type: String,
      trim: true,
      default: "",
    },
    volunteerFollowUpCompletedAt: {
      type: Date,
      required: false,
    },
    volunteerFollowUpCompletedBy: {
      type: String,
      trim: true,
      default: "",
    },
    lastContactDate: {
      type: Date,
      required: false,
    },
    snoozedUntil: {
      type: Date,
      required: false,
    },
    snoozedBy: {
      type: String,
      trim: true,
      default: "",
    },
    snoozeReason: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      trim: true,
      enum: ["Male", "Female", "Unknown"],
      default: "Unknown",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    journeySessionId: {
      type: Schema.Types.ObjectId,
      ref: "JourneySession",
      required: false,
    },
    journeySource: {
      type: String,
      trim: true,
      default: "",
    },
    recommendationAccepted: {
      type: Boolean,
      default: false,
    },
  });
}

export const Seeker = existingSeekerModel || mongoose.model("Seeker", seekerSchema);
