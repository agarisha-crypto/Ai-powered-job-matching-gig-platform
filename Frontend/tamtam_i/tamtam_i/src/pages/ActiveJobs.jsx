import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import ApplyJobModal from "../components/ApplyJobModal"
import { applyToJob, fetchActiveJobs, logoutUser } from "../services/api"
import "./ActiveJobs.css"


const getJobId = (job) => job?._id || job?.id || job?.jobId?._id || job?.jobId || ""

  

const getJobStatus = (job) =>
  typeof (job?.jobId?.status || job?.status) === "string"
    ? (job.jobId?.status || job.status).toLowerCase()
    : "unknown"

const canApplyToJob = (job) => getJobStatus(job) === "open"

const getDisplayStatus = (status) => {
  if (!status || status === "unknown") {
    return "Unknown"
  }

  if (status === "active") {
    return "Matched"
  }

  return status
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const getStatusClassName = (status) =>
  `status-${(status || "unknown").replace(/[\s_]+/g, "-")}`

const getJobTitle = (job) =>
  job?.jobId?.title || job?.title || "Untitled Job"

const getJobDescription = (job) =>
  job?.jobId?.description || job?.description || "No description available."

const getJobBudget = (job) =>
  job?.jobId?.budget ?? job?.budget ?? "Not specified"

const getRequiredSkills = (job) =>
  job?.jobId?.requiredSkills || job?.requiredSkills || "Not specified"

const getCreatedDate = (job) => {
  const value =
    job?.updatedAt ||
    job?.createdAt ||
    job?.jobId?.updatedAt ||
    job?.jobId?.createdAt

  if (!value) {
    return "Date unavailable"
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable"
  }

  return parsedDate.toLocaleDateString()
}

function ActiveJobs() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeJobs, setActiveJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedJob, setSelectedJob] = useState(null)
  const [applyingJobId, setApplyingJobId] = useState("")
  const [applyMessage, setApplyMessage] = useState("")

 

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      navigate("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (parseError) {
      console.error("Error parsing user data:", parseError)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/login")
      return
    }

    const loadActiveJobs = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchActiveJobs()
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : []

        setActiveJobs(items)
      } catch (loadError) {
        console.error("Failed to fetch active jobs:", loadError)
        setError("Failed to load active jobs. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadActiveJobs()
  }, [navigate])

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

  const handleApply = async (formData) => {
    const job = selectedJob
    const jobId = getJobId(job)

    if (!jobId) {
      setApplyMessage("Unable to apply: missing job id.")
      return
    }

    setApplyingJobId(jobId)
    setApplyMessage("")

    try {
      await applyToJob(jobId, formData)
      setApplyMessage("Application submitted successfully.")
      setSelectedJob(null)
    } catch (applyError) {
      console.error("Failed to apply for job:", applyError)
      setApplyMessage(
        applyError?.response?.data?.message ||
        "Failed to apply for this job. Please try again."
      )
    } finally {
      setApplyingJobId("")
    }
  }

  if (loading) {
    return (
      <div className="active-jobs-loading">
        <div className="loading-spinner"></div>
        <p>Loading active jobs...</p>
      </div>
    )
  }

  return (
    <div className="active-jobs-page">
      <Sidebar user={user} />
      <div className="active-jobs-main">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="active-jobs-content">
          <div className="active-jobs-header">
            <h1>Active Jobs</h1>
            <p>Jobs from your applications that are still active.</p>
          </div>

          {error && <div className="active-jobs-error">{error}</div>}
          {applyMessage && <div className="active-jobs-message">{applyMessage}</div>}

          {!error && activeJobs.length === 0 && (
            <div className="active-jobs-empty">No active jobs found.</div>
          )}

          <div className="active-jobs-grid">
            {activeJobs.map((job) => {
              const jobId = getJobId(job)
              const jobStatus = getJobStatus(job)
              const isApplying = applyingJobId === jobId
              const canApply = canApplyToJob(job)

              return (
                <article
                  className="active-job-card"
                  key={jobId || `${getJobTitle(job)}-${jobStatus}`}
                >
                  <div className="active-job-card-header">
                    <h2 className="active-job-title">{getJobTitle(job)}</h2>
                    <span className={`active-job-status ${getStatusClassName(jobStatus)}`}>
                      {getDisplayStatus(jobStatus)}
                    </span>
                  </div>

                  <p className="active-job-description">{getJobDescription(job)}</p>

                  <div className="active-job-meta">
                    <p>
                      <strong>Job Status:</strong> {getDisplayStatus(jobStatus)}
                    </p>
                    <p>
                      <strong>Budget:</strong> {getJobBudget(job)}
                    </p>
                    <p>
                      <strong>Required Skills:</strong> {getRequiredSkills(job)}
                    </p>
                    <p>
                      <strong>Created On:</strong> {getCreatedDate(job)}
                    </p>
                  </div>

                  <button
                    className="active-job-apply-button"
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    disabled={isApplying || !canApply}
                  >
                    {isApplying ? "Applying..." : canApply ? "Apply" : "Unavailable"}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <ApplyJobModal
        job={selectedJob}
        isSubmitting={applyingJobId === getJobId(selectedJob)}
        onClose={() => setSelectedJob(null)}
        onSubmit={handleApply}
      />
    </div>
  )
}

export default ActiveJobs
