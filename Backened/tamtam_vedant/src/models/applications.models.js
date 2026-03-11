import mongoose from "mongoose";

const applicationsSchema = new mongoose.Schema({

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
    index: true
  },

  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  amountProposed: {
    type: Number,
    required: true
  },

}, { timestamps: true });

// prevent the same user applying to the same job more than once
applicationsSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationsSchema);