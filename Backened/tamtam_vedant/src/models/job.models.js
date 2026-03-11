// models/job.model.js

import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  requiredSkills:{
    type:String,
    required: true
  },

  budget: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: [
      "open",
      "matched",
      "done",
    ],
    default: "open"
  },

}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);