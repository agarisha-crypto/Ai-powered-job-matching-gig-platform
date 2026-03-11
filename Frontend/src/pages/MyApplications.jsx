import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { fetchMyApplications, logoutUser } from "../services/api"
import "./MyApplications.css"

const normalizeStatus = (status) => {
  const value = typeof status === "string" ? status.toLowerCase() : "unknown"
  if (value === "open" || value === "matched" || value === "done") {
    return value
  }
  return "unknown"
}

const getTitle = (application) =>
  application?.jobId?.title ||
  "Untitled Job"

const getDescription = (application) =>
  application?.jobId?.description || "No description available."

const getBudget = (application) =>
  application?.jobId?.budget ?? "Not specified"

const getAmountProposed = (application) =>
  application?.amountProposed ?? "Not provided"

const formatStatus = (status) =>
  status === "unknown"
    ? "Unknown"
    : status === "done"
      ? "Done"
      : status.charAt(0).toUpperCase() + status.slice(1)

function MyApplications() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
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
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (parseError) {
      console.error("Error parsing user data:", parseError)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/login")
      return
    }

    const loadApplications = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchMyApplications()
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : []
        setApplications(items)
      } catch (loadError) {
        console.error("Failed to fetch applications:", loadError)
        setError("Failed to load your applications. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
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
      <div className="applications-loading">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="applications-page">
      <Sidebar user={user} />
      <div className="applications-main">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="applications-content">
          <div className="applications-header">
            <h1>My Applications</h1>
            <p>All jobs you have applied for.</p>
          </div>

          {error && <div className="applications-error">{error}</div>}

          {!error && applications.length === 0 && (
            <div className="applications-empty">No applications found.</div>
          )}

          <div className="applications-grid">
            {applications.map((application) => {
              const status = normalizeStatus(application?.jobId?.status)
              return (
                <article
                  className="application-card"
                  key={application?._id || application?.id || `${getTitle(application)}-${status}`}
                >
                  <div className="application-card-header">
                    <h2 className="application-job-title">{getTitle(application)}</h2>
                    <span className={`application-status-badge status-${status}`}>
                      {formatStatus(status)}
                    </span>
                  </div>

                  <p className="application-description">{getDescription(application)}</p>

                  <div className="application-metrics">
                    <div className="application-metric-card">
                      <span className="metric-label">Budget</span>
                      <span className="metric-value">{getBudget(application)}</span>
                    </div>
                    <div className="application-metric-card">
                      <span className="metric-label">Proposed</span>
                      <span className="metric-value">{getAmountProposed(application)}</span>
                    </div>
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

export default MyApplications
