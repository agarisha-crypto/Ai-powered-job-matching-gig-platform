import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  agreedBudget: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: [
      "matched",
      "done",
    ],
    default: "matched"
  },

}, { timestamps: true });

export const Deal = mongoose.model("Deal", dealSchema);