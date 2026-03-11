import express from "express";

//middle ware import here
import {verifyJWT} from '../middlewares/auth.middleware.js';
const jobRouter = express.Router();

import {postJob, getActiveJobs, selectApplicant,jobComplete, getMyPostedJob} from '../controllers/job.controllers.js';


jobRouter.route("/post-job").post(
    verifyJWT,
    postJob
);

// poster confirms an application
jobRouter.post("/:jobId/applications/:applicationId/select", verifyJWT, selectApplicant);

jobRouter.route("/active-jobs").get(
    getActiveJobs
);


jobRouter.route("/job-complete").get(
    verifyJWT,
    jobComplete
);
jobRouter.route("/my-posted-jobs").get(
    verifyJWT,
    getMyPostedJob
);



export default jobRouter;