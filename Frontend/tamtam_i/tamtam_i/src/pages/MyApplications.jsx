import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { fetchMyApplications, logoutUser, } from "../services/api"
import "./MyApplications.css"

const normalizeStatus = (status) =>
  typeof status === "string" && status.trim() ? status.trim().toLowerCase() : "unknown"

const getDisplayStatus = (status) => {
  if (!status || status === "unknown") {
    return "Unknown"
  }

  if (status === "active") {
    return "Matched"
  }

  return status.charAt(0).toUpperCase() + status.slice(1)
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
              const status = normalizeStatus(application?.status)
              return (
                <article
                  className="application-card"
                  key={application?._id || application?.id || `${getTitle(application)}-${status}`}
                >
                  <h2 className="application-job-title">{getTitle(application)}</h2>
                  <p className="application-client">
                    <strong>Description:</strong> {getDescription(application)}
                  </p>
                  <p className="application-client">
                    <strong>Budget:</strong> {getBudget(application)}
                  </p>
                  <p className="application-client">
                    <strong>Proposed Amount:</strong> {getAmountProposed(application)}
                  </p>
                  <p className={`application-status status-${status}`}>
                    <strong>Status:</strong> {getDisplayStatus(status)}
                  </p>
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
