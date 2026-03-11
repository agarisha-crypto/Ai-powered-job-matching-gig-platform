import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { fetchMyApplications, logoutUser } from "../services/api"
import "./ActiveJobs.css"

const ACTIVE_STATUSES = new Set(["open", "matched"])

const getJobId = (application) => application?.jobId?._id || application?.jobId || application?._id || ""

const getJobStatus = (application) => {
  const status = application?.jobId?.status
  return typeof status === "string" ? status.toLowerCase() : "unknown"
}

const formatStatusLabel = (status) => {
  if (!status || status === "unknown") {
    return "Unknown"
  }

  if (status === "done") {
    return "Done"
  }

  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusClassName = (status) =>
  `status-${(status || "unknown").replace(/[\s_]+/g, "-")}`

const getJobTitle = (application) => application?.jobId?.title || "Untitled Job"

const getJobDescription = (application) =>
  application?.jobId?.description || "No description available."

const getJobBudget = (application) =>
  application?.jobId?.budget ?? "Not specified"

const getCreatedDate = (application) => {
  const value = application?.jobId?.createdAt || application?.createdAt

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

    const loadActiveJobs = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchMyApplications()
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : []

        const activeApplications = items.filter((application) =>
          ACTIVE_STATUSES.has(getJobStatus(application))
        )

        setActiveJobs(activeApplications)
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
            <p>Jobs you have already applied to that are still open or matched.</p>
          </div>

          {error && <div className="active-jobs-error">{error}</div>}

          {!error && activeJobs.length === 0 && (
            <div className="active-jobs-empty">No active jobs found.</div>
          )}

          <div className="active-jobs-grid">
            {activeJobs.map((application) => {
              const jobId = getJobId(application)
              const jobStatus = getJobStatus(application)

              return (
                <article
                  className="active-job-card"
                  key={jobId || application?._id || `${getJobTitle(application)}-${jobStatus}`}
                >
                  <div className="active-job-card-header">
                    <h2 className="active-job-title">{getJobTitle(application)}</h2>
                    <span className={`active-job-status ${getStatusClassName(jobStatus)}`}>
                      {formatStatusLabel(jobStatus)}
                    </span>
                  </div>

                  <p className="active-job-description">{getJobDescription(application)}</p>

                  <div className="active-job-meta">
                    <p>
                      <strong>Job Status:</strong> {formatStatusLabel(jobStatus)}
                    </p>
                    <p>
                      <strong>Budget:</strong> {getJobBudget(application)}
                    </p>
                    <p>
                      <strong>Your Proposed Amount:</strong> {application?.amountProposed ?? "Not provided"}
                    </p>
                    <p>
                      <strong>Applied On:</strong> {getCreatedDate(application)}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActiveJobs
