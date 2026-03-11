import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/applications.models.js";
import { Job } from "../models/job.models.js";


const applyToJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const applicantId = req.user._id;
  const { amountProposed } = req.body;

  if (!amountProposed) {
    throw new ApiError(400, "amountProposed is required");
  }


  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  if (job.status !== "open") {
    throw new ApiError(400, "Cannot apply to a job that is not open");
  }


  const application = await Application.create({
    jobId,
    applicantId,
    amountProposed,
  });

  res
    .status(201)
    .json(new ApiResponse(201, application, "Application submitted successfully"));
});

const getApplicationsForJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  // ensure the job exists and requester is the creator
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  if (job.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden: only the job poster can view applications");
  }

  const applications = await Application.find({ jobId })
    .populate("applicantId", "username fullName profilePicture skills");
  res
    .status(200)
    .json(new ApiResponse(200, applications, "Applications fetched"));
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applicantId = req.user._id;
  const applications = await Application.find({ applicantId })
    .populate("jobId", "title description budget status");
  res
    .status(200)
    .json(new ApiResponse(200, applications, "Your applications"));
});

export { applyToJob, getApplicationsForJob, getMyApplications };