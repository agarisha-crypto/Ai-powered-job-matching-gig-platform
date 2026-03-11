import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import {
  fetchApplicationsForJob,
  fetchMyPostedJobs,
  logoutUser,
  selectApplicantForJob,
} from "../services/api"
import "./MyJobs.css"

const getJobId = (job) => job?._id || job?.id || ""

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
      .filter(Boolean)
      .join(", ")
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .join(", ")
  }

  return "Not specified"
}

const getApplicantId = (application) =>
  application?.applicantId?._id || application?.applicantId || application?._id || ""

const getApplicantName = (application) =>
  application?.applicantId?.fullName ||
  application?.applicantId?.username ||
  application?.fullName ||
  application?.username ||
  "Unknown Applicant"

const getApplicantUsername = (application) =>
  application?.applicantId?.username ? `@${application.applicantId.username}` : ""

const getApplicantProfilePicture = (application) => application?.applicantId?.profilePicture || ""

const getApplicantSkills = (application) => {
  const skills = application?.applicantId?.skills

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
      .filter(Boolean)
  }

  return []
}

const formatAppliedDate = (application) => {
  const value = application?.createdAt

  if (!value) {
    return "Date unavailable"
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable"
  }

  return parsedDate.toLocaleDateString()
}

function MyJobs() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [applicantsByJob, setApplicantsByJob] = useState({})
  const [expandedJobId, setExpandedJobId] = useState("")
  const [selectingApplicationId, setSelectingApplicationId] = useState("")

  const loadMyJobs = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const jobsResponse = await fetchMyPostedJobs()
      const myJobs = Array.isArray(jobsResponse.data)
        ? jobsResponse.data
        : Array.isArray(jobsResponse.data?.data)
          ? jobsResponse.data.data
          : []
      setJobs(myJobs)

      const applicantsEntries = await Promise.all(
        myJobs.map(async (job) => {
          const jobId = getJobId(job)

          try {
            const response = await fetchApplicationsForJob(jobId)
            const applications = Array.isArray(response.data)
              ? response.data
              : Array.isArray(response.data?.data)
                ? response.data.data
                : []
            return [jobId, { items: applications, error: "" }]
          } catch (applicationsError) {
            console.error(`Failed to fetch applicants for job ${jobId}:`, applicationsError)
            return [jobId, { items: [], error: "Failed to load applicants." }]
          }
        })
      )

      setApplicantsByJob(Object.fromEntries(applicantsEntries))
    } catch (loadError) {
      console.error("Failed to load your jobs:", loadError)
      setError("Failed to load your jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      navigate("/login")
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (parseError) {
      console.error("Error parsing user data:", parseError)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/login")
      return
    }

    loadMyJobs()
  }, [loadMyJobs, navigate])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (logoutError) {
      console.warn("Backend logout failed", logoutError)
    }

    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("sessionCookie")
    navigate("/")
  }

  const toggleApplicants = (jobId) => {
    setExpandedJobId((currentJobId) => (currentJobId === jobId ? "" : jobId))
  }

  const handleSelectApplicant = async (jobId, applicationId) => {
    if (!jobId || !applicationId) {
      setError("Unable to select applicant: missing job or application id.")
      return
    }

    setSelectingApplicationId(applicationId)
    setError("")
    setMessage("")

    try {
      await selectApplicantForJob(jobId, applicationId)
      setMessage("Applicant selected successfully.")
      await loadMyJobs()
      setExpandedJobId(jobId)
    } catch (selectionError) {
      console.error("Failed to select applicant:", selectionError)
      setError(
        selectionError?.response?.data?.message ||
        "Failed to select applicant. Please try again."
      )
    } finally {
      setSelectingApplicationId("")
    }
  }

  if (loading) {
    return (
      <div className="my-jobs-loading">
        <div className="loading-spinner"></div>
        <p>Loading your jobs...</p>
      </div>
    )
  }

  return (
    <div className="my-jobs-page">
      <Sidebar user={user} />
      <div className="my-jobs-main">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="my-jobs-content">
          <div className="my-jobs-header">
            <h1>My Jobs</h1>
            <p>All jobs posted by your account.</p>
          </div>

          {message && <div className="my-jobs-success">{message}</div>}
          {error && <div className="my-jobs-error">{error}</div>}

          {!error && jobs.length === 0 && (
            <div className="my-jobs-empty">You have not posted any jobs yet.</div>
          )}

          <div className="my-jobs-grid">
            {jobs.map((job) => {
              const jobId = getJobId(job)
              const applicantsState = applicantsByJob[jobId] || { items: [], error: "" }
              const applicants = applicantsState.items
              const isExpanded = expandedJobId === jobId
              const isJobOpen = job?.status === "open"
              const jobStatus = (job?.status || "unknown").toLowerCase()

              return (
                <article className="my-job-card" key={jobId || job.title}>
                  <div className="my-job-header">
                    <h2 className="my-job-title">{job.title || "Untitled Job"}</h2>
                    <span className={`my-job-status status-${jobStatus}`}>
                      {job.status || "Unknown"}
                    </span>
                  </div>

                  <p className="my-job-description">{job.description || "No description available."}</p>

                  <div className="my-job-details-grid">
                    <p className="my-job-detail">
                      <strong>Budget:</strong> {job.budget ?? "Not specified"}
                    </p>
                    <p className="my-job-detail">
                      <strong>Required Skills:</strong> {normalizeSkills(job.requiredSkills)}
                    </p>
                    <p className="my-job-detail">
                      <strong>Applicants:</strong> {applicants.length}
                    </p>
                  </div>

                  <button
                    className="my-job-applicants-button"
                    type="button"
                    onClick={() => toggleApplicants(jobId)}
                  >
                    {isExpanded ? "Hide Applicants" : "View Applicants"}
                  </button>

                  {isExpanded && (
                    <div className="my-job-applicants-panel">
                      {applicantsState.error && (
                        <div className="my-job-applicants-error">{applicantsState.error}</div>
                      )}

                      {!applicantsState.error && applicants.length === 0 && (
                        <div className="my-job-applicants-empty">No applicants yet.</div>
                      )}

                      {!applicantsState.error && applicants.length > 0 && (
                        <div className="my-job-applicants-list">
                          {applicants.map((application) => {
                            const applicationId = application?._id || getApplicantId(application)
                            const isSelecting = selectingApplicationId === applicationId
                            const applicantSkills = getApplicantSkills(application)

                            return (
                              <div
                                className="my-job-applicant-item"
                                key={applicationId}
                              >
                                <div className="my-job-applicant-summary">
                                  <div className="my-job-applicant-header">
                                    {getApplicantProfilePicture(application) ? (
                                      <img
                                        src={getApplicantProfilePicture(application)}
                                        alt={getApplicantName(application)}
                                        className="my-job-applicant-image"
                                      />
                                    ) : (
                                      <div className="my-job-applicant-fallback">
                                        {getApplicantName(application).charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="my-job-applicant-meta">
                                      <span className="my-job-applicant-name">
                                        {getApplicantName(application)}
                                      </span>
                                      {getApplicantUsername(application) && (
                                        <span className="my-job-applicant-username">
                                          {getApplicantUsername(application)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="my-job-applicant-amount">
                                    Proposed: {application?.amountProposed ?? "Not provided"}
                                  </span>
                                  <span className="my-job-applicant-date">
                                    Applied: {formatAppliedDate(application)}
                                  </span>
                                  {applicantSkills.length > 0 && (
                                    <div className="my-job-applicant-skills">
                                      {applicantSkills.map((skill, idx) => (
                                        <span
                                          className="my-job-applicant-skill"
                                          key={`${skill}-${idx}`}
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {isJobOpen ? (
                                  <button
                                    className="my-job-select-button"
                                    type="button"
                                    onClick={() => handleSelectApplicant(jobId, application?._id)}
                                    disabled={isSelecting || !!selectingApplicationId}
                                  >
                                    {isSelecting ? "Selecting..." : "Select Applicant"}
                                  </button>
                                ) : (
                                  <span className="my-job-matched-badge">Job Matched</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyJobs
