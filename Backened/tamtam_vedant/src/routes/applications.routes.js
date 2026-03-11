import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
} from "../controllers/applications.controllers.js";

const router = express.Router();

// a user can apply to a job
router.post("/job/:jobId/apply", verifyJWT, applyToJob);

// job owner retrieves all applications (could add verify that req.user is owner)
router.get("/job/:jobId/applications", verifyJWT, getApplicationsForJob);

// authenticated user fetches his own applications
router.get("/job/my-application", verifyJWT, getMyApplications);

export default router;