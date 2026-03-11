import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { fetchApplicationsForJob, fetchJobs, logoutUser } from "../services/api"
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

const getOwnerId = (job) =>
  job?.hirerId?._id ||
  job?.hirerId ||
  job?.createdBy?._id ||
  job?.createdBy ||
  ""

const getApplicantId = (application) =>
  application?.applicantId?._id || application?.applicantId || application?._id || ""

const getApplicantName = (application) =>
  application?.applicantId?.fullName ||
  application?.applicantId?.username ||
  application?.fullName ||
  application?.username ||
  "Unknown Applicant"

function MyJobs() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applicantsByJob, setApplicantsByJob] = useState({})
  const [expandedJobId, setExpandedJobId] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      navigate("/login")
      return
    }

    let parsedUser
    try {
      parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (parseError) {
      console.error("Error parsing user data:", parseError)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/login")
      return
    }

    const loadMyJobs = async () => {
      setLoading(true)
      setError("")

      try {
        const jobsResponse = await fetchJobs()
        const allJobs = Array.isArray(jobsResponse.data)
          ? jobsResponse.data
          : Array.isArray(jobsResponse.data?.data)
            ? jobsResponse.data.data
            : []

        const userId = parsedUser?._id || parsedUser?.id || ""
        const myJobs = allJobs.filter((job) => String(getOwnerId(job)) === String(userId))
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
    }

    loadMyJobs()
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

  const toggleApplicants = (jobId) => {
    setExpandedJobId((currentJobId) => (currentJobId === jobId ? "" : jobId))
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

              return (
                <article className="my-job-card" key={jobId || job.title}>
                  <h2 className="my-job-title">{job.title || "Untitled Job"}</h2>
                  <p className="my-job-description">{job.description || "No description available."}</p>
                  <p className="my-job-detail">
                    <strong>Budget:</strong> {job.budget ?? "Not specified"}
                  </p>
                  <p className="my-job-detail">
                    <strong>Required Skills:</strong> {normalizeSkills(job.requiredSkills)}
                  </p>
                  <p className="my-job-detail">
                    <strong>Job Status:</strong> {job.status || "Unknown"}
                  </p>
                  <p className="my-job-detail">
                    <strong>Number of Applicants:</strong> {applicants.length}
                  </p>

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
                          {applicants.map((application) => (
                            <div
                              className="my-job-applicant-item"
                              key={application?._id || getApplicantId(application)}
                            >
                              <span className="my-job-applicant-name">
                                {getApplicantName(application)}
                              </span>
                              <span className="my-job-applicant-amount">
                                Proposed: {application?.amountProposed ?? "Not provided"}
                              </span>
                            </div>
                          ))}
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
