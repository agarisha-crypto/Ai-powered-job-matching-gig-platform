import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import ApplyJobModal from "../components/ApplyJobModal"
import { applyToJob, fetchJobs, logoutUser } from "../services/api"
import "./JobsMarketplace.css"

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => (typeof skill === "string" ? skill.trim() : ""))
      .filter(Boolean)
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
  }

  return []
}

const getJobId = (job) => job?._id || job?.id || job?.jobId || ""
const canApplyToJob = (job) => (job?.status || "open") === "open"
const getHirerName = (job) =>
  job?.createdBy?.fullName || job?.createdBy?.username || "Unknown Hirer"
const getHirerUsername = (job) =>
  job?.createdBy?.username ? `@${job.createdBy.username}` : ""
const getHirerProfilePicture = (job) => job?.createdBy?.profilePicture || ""

function JobsMarketplace() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applyingJobId, setApplyingJobId] = useState("")
  const [applyMessage, setApplyMessage] = useState("")
  const [selectedJob, setSelectedJob] = useState(null)

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

    const loadJobs = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchJobs()
        const receivedJobs = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : []

        setJobs(receivedJobs)
      } catch (loadError) {
        console.error("Failed to load jobs:", loadError)
        setError("Failed to fetch jobs. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      console.warn("Backend logout failed", err)
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
      <div className="jobs-loading">
        <div className="loading-spinner"></div>
        <p>Loading jobs...</p>
      </div>
    )
  }

  return (
    <div className="jobs-marketplace-container">
      <Sidebar user={user} />
      <div className="jobs-main">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="jobs-content">
          <div className="jobs-header">
            <h1>Jobs Marketplace</h1>
            <p>Browse open jobs and apply directly.</p>
          </div>

          {error && <div className="jobs-error">{error}</div>}
          {applyMessage && <div className="jobs-message">{applyMessage}</div>}

          <div className="jobs-grid">
            {jobs.map((job) => {
              const jobId = getJobId(job)
              const requiredSkills = normalizeSkills(job.requiredSkills || job.skills)
              const isApplying = applyingJobId === jobId
              const canApply = canApplyToJob(job)

              return (
                <article className="job-card" key={jobId || `${job.title}-${job.budget}`}>
                  <div className="job-card-header">
                    <h2 className="job-title">{job.title || "Untitled Job"}</h2>
                    <span className="job-budget-chip">{job.budget ?? "Not specified"}</span>
                  </div>

                  <p className="job-description">{job.description || "No description available."}</p>

                  <div className="job-hirer">
                    {getHirerProfilePicture(job) ? (
                      <img
                        src={getHirerProfilePicture(job)}
                        alt={getHirerName(job)}
                        className="job-hirer-image"
                      />
                    ) : (
                      <div className="job-hirer-fallback">
                        {getHirerName(job).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="job-hirer-meta">
                      <span className="job-hirer-name">{getHirerName(job)}</span>
                      {getHirerUsername(job) && (
                        <span className="job-hirer-username">{getHirerUsername(job)}</span>
                      )}
                    </div>
                  </div>

                  <div className="job-skills">
                    {requiredSkills.length > 0 ? (
                      <div className="job-skill-tags">
                        {requiredSkills.map((skill, index) => (
                          <span className="job-skill-tag" key={`${skill}-${index}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="no-skills">No skills specified</span>
                    )}
                  </div>

                  <button
                    className="apply-button"
                    onClick={() => setSelectedJob(job)}
                    disabled={isApplying || !canApply}
                  >
                    {isApplying ? "Applying..." : canApply ? "Apply Now" : "Unavailable"}
                  </button>
                </article>
              )
            })}
          </div>

          {!error && jobs.length === 0 && (
            <div className="jobs-empty">
              <p>No jobs available right now.</p>
            </div>
          )}
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

export default JobsMarketplace
