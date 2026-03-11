import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {Job} from '../models/job.models.js';
import { Application } from '../models/applications.models.js';
import { Deal } from '../models/deal.models.js';
import { User } from '../models/user.models.js';

const postJob = asyncHandler(async (req, res) => {

    const { title, description, requiredSkills, budget } = req.body;  

    if (!title || !description || !requiredSkills || !budget) {
     throw new ApiError(400, "All fields are required");}  

    const job = await Job.create({
        createdBy: req.user._id,
        title,
        description,
        requiredSkills,
        budget,
        status: "open"
    });

    res.status(201).json(
        new ApiResponse(201, job, "Job posted successfully")
    );
});

const getActiveJobs = asyncHandler(async (req,res) => {
    const { page = 1, limit = 10 } = req.query;
  const filter = { status: "open" };
  const jobs = await Job.find(filter)
                        .populate("createdBy","username fullName profilePicture")
                        .sort({ createdAt: -1 })
                        .skip((page-1)*limit)
                        .limit(+limit);
  res.status(200).json(new ApiResponse(200,jobs,"Active jobs fetched"));
});

const getMyPostedJob = asyncHandler(async (req,res) => {
    const { page = 1, limit = 10 } = req.query;
  // const filter = { status: "open", createdBy: req.user._id };
  const filter = { createdBy: req.user._id };
  const jobs = await Job.find(filter)
                        .populate("createdBy","username fullName profilePicture")
                        .sort({ createdAt: -1 })
                        .skip((page-1)*limit)
                        .limit(+limit);
  res.status(200).json(new ApiResponse(200,jobs,"Active jobs fetched"));
});

// job poster selects an applicant, updates job status and creates a deal
const selectApplicant = asyncHandler(async (req, res) => {
  const { jobId, applicationId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  if (job.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the job poster can select an applicant");
  }
  if (job.status !== "open") {
    throw new ApiError(400, "Cannot select applicant for job that is not open");
  }

  const application = await Application.findById(applicationId);
  if (!application || application.jobId.toString() !== jobId) {
    throw new ApiError(404, "Application not found for this job");
  }

  // update job status
  job.status = "matched";
  await job.save();

  // create deal
  const deal = await Deal.create({
    jobId: job._id,
    clientId: job.createdBy,
    freelancerId: application.applicantId,
    agreedBudget: application.amountProposed,
    // status: "active",
    status: "matched",
  });

  res
    .status(201)
    .json(new ApiResponse(201, { job, deal }, "Applicant selected and deal created"));
});

const jobComplete = asyncHandler(async (req, res) => {
    const jobId = req.params.jobId;
    const userId = User.findById(req.user._id);
    const deal = await Deal.findOne({
        jobId: jobId,
        clientId: userId
    });

    deal.status = "done";
    await deal.save();
    const job = await Job.findById(jobId);
    job.status = "done";
    await job.save();
});



export {postJob, getActiveJobs,selectApplicant, jobComplete,getMyPostedJob};