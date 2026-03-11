import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import {
  fetchApplicationsForJob,
  fetchJobs,
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
  application?.applicantId?._id ||
  application?.applicantId ||
  application?.userId?._id ||
  application?.userId ||
  ""

const getApplicationId = (application) => application?._id || ""

const getApplicantName = (application) =>
  application?.applicantId?.fullName ||
  application?.applicantId?.username ||
  application?.fullName ||
  application?.username ||
  "Unknown Applicant"

const getDisplayStatus = (status) => {
  const normalizedStatus =
    typeof status === "string" ? status.trim().toLowerCase() : ""

  if (!normalizedStatus) return "Unknown"

  if (normalizedStatus === "active") return "Matched"

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
}

const getApplicationStatus = (application) => {
  return getDisplayStatus(application?.status)
}

function MyJobs() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applicantsByJob, setApplicantsByJob] = useState({})

  const [expandedJobId, setExpandedJobId] = useState("auto")
  const [selectedApplicationByJob, setSelectedApplicationByJob] = useState({})
  const [selectionMessageByJob, setSelectionMessageByJob] = useState({})
  const [selectingByJob, setSelectingByJob] = useState({})

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
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/login")
      return
    }

    const loadMyJobs = async () => {
      setLoading(true)

      try {
        const jobsResponse = await fetchJobs()

        const allJobs = Array.isArray(jobsResponse.data)
          ? jobsResponse.data
          : Array.isArray(jobsResponse.data?.data)
          ? jobsResponse.data.data
          : []

        setJobs(allJobs)

        const applicantsEntries = await Promise.all(
          allJobs.map(async (job) => {
            const jobId = getJobId(job)

            try {
              const response = await fetchApplicationsForJob(jobId)

              const applications = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.data)
                ? response.data.data
                : []

              return [jobId, { items: applications, error: "" }]
            } catch {
              return [jobId, { items: [], error: "Failed to load applicants." }]
            }
          })
        )

        setApplicantsByJob(Object.fromEntries(applicantsEntries))
      } catch {
        setError("Failed to load your jobs.")
      } finally {
        setLoading(false)
      }
    }

    loadMyJobs()
  }, [navigate])

  const toggleApplicants = (jobId) => {
    setExpandedJobId((current) => (current === jobId ? "" : jobId))
  }

  const handleApplicationSelect = (jobId, applicationId) => {
    setSelectedApplicationByJob((current) => ({
      ...current,
      [jobId]: applicationId,
    }))
  }

  const handleSelectApplicant = async (jobId, selectedApplication) => {
    const applicationDbId = getApplicationId(selectedApplication)
    const applicantId = getApplicantId(selectedApplication)

    setSelectingByJob((current) => ({ ...current, [jobId]: true }))

    try {
      await selectApplicantForJob({ jobId, applicationDbId, applicantId })

      setSelectionMessageByJob((current) => ({
        ...current,
        [jobId]: "Applicant selected successfully.",
      }))
    } catch (selectionError) {
      setSelectionMessageByJob((current) => ({
        ...current,
        [jobId]: "Failed to select applicant.",
      }))
    } finally {
      setSelectingByJob((current) => ({ ...current, [jobId]: false }))
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
        <Navbar user={user} />

        <div className="my-jobs-content">
          <div className="my-jobs-header">
            <h1>My Jobs</h1>
            <p>All jobs posted by your account.</p>
          </div>

          <div className="my-jobs-grid">
            {jobs.map((job) => {
              const jobId = getJobId(job)
              const applicantsState = applicantsByJob[jobId] || { items: [] }
              const applicants = applicantsState.items

              const isExpanded =
                expandedJobId === "auto" || expandedJobId === jobId

              const selectedApplicationId =
                selectedApplicationByJob[jobId] || ""

              const selectedApplication = applicants.find(
                (application) =>
                  String(getApplicationId(application)) ===
                  String(selectedApplicationId)
              )

              const isSelecting = Boolean(selectingByJob[jobId])

              return (
                <article className="my-job-card" key={jobId}>
                  <h2 className="my-job-title">{job.title}</h2>

                  <p className="my-job-detail">
                    <strong>Job Status:</strong>{" "}
                    {getDisplayStatus(job.status)}
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

                      <div className="my-job-applicants-select-group">
                        <select
                          value={selectedApplicationId}
                          onChange={(event) =>
                            handleApplicationSelect(
                              jobId,
                              event.target.value
                            )
                          }
                        >
                          <option value="">Select Applicant</option>

                          {applicants.map((application) => {
                            const id = getApplicationId(application)

                            return (
                              <option key={id} value={id}>
                                {getApplicantName(application)} (
                                {getApplicationStatus(application)})
                              </option>
                            )
                          })}
                        </select>
                      </div>

                      {selectedApplication && (
                        <div className="my-job-applicant-item">
                          <span className="my-job-applicant-name">
                            {getApplicantName(selectedApplication)}
                          </span>

                          <span className="my-job-applicant-amount">
                            Proposed:{" "}
                            {selectedApplication?.amountProposed ??
                              "Not provided"}
                          </span>

                          <span className="my-job-applicant-amount">
                            Status:{" "}
                            {getApplicationStatus(selectedApplication)}
                          </span>
                        </div>
                      )}

                      <button
                        className="my-job-select-applicant-button"
                        onClick={() =>
                          handleSelectApplicant(jobId, selectedApplication)
                        }
                        disabled={!selectedApplication || isSelecting}
                      >
                        {isSelecting ? "Selecting..." : "Select Applicant"}
                      </button>

                      {selectionMessageByJob[jobId] && (
                        <div className="my-job-selection-message">
                          {selectionMessageByJob[jobId]}
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