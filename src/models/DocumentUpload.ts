import mongoose, { Schema } from "mongoose";

const documentUploadSchema = new Schema({
  fileName: {
    type: String,
    required: [true, "File name is required."],
    trim: true,
  },
  fileData: {
    type: String,
    required: [true, "File data is required."],
  },
  fileType: {
    type: String,
    enum: ["image", "csv", "pdf"],
    required: [true, "File type is required."],
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  uploadedByName: {
    type: String,
    trim: true,
    default: "",
  },
  uploadedByEmail: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  processedSeekers: {
    type: Number,
    default: 0,
  },
  processedBy: {
    type: String,
    trim: true,
    default: "",
  },
  processedAt: {
    type: Date,
    required: false,
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

documentUploadSchema.index({ createdAt: -1 });
documentUploadSchema.index({ status: 1 });
documentUploadSchema.index({ uploadedByEmail: 1 });

export const DocumentUpload =
  mongoose.models.DocumentUpload ||
  mongoose.model("DocumentUpload", documentUploadSchema);
