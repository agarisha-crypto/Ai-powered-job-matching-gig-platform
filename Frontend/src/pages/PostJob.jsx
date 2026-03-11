import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { createJob, logoutUser } from "../services/api"
import "./PostJob.css"

function PostJob() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [requiredSkills, setRequiredSkills] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
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
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setSubmitting(true)

    const skillsArray = requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)

    try {
      await createJob({
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        requiredSkills: skillsArray.join(", "),
      })

      setMessage("Job posted successfully.")
      setTitle("")
      setDescription("")
      setBudget("")
      setRequiredSkills("")

      // Optional redirect if/when /my-jobs page is implemented:
      // navigate("/my-jobs")
    } catch (submitError) {
      console.error("Failed to create job:", submitError)
      setError("Failed to post job. Please check inputs and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="post-job-page">
      <Sidebar user={user} />
      <div className="post-job-main">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="post-job-content">
          <div className="post-job-card">
            <div className="post-job-header">
              <h1>Post Job</h1>
              <p>Create a new job for freelancers in TAMTAM.</p>
            </div>

            {message && <div className="post-job-message">{message}</div>}
            {error && <div className="post-job-error">{error}</div>}

            <form className="post-job-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="job-title">Job Title</label>
                <input
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  id="job-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-budget">Budget</label>
                <input
                  id="job-budget"
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-skills">Required Skills (comma separated)</label>
                <input
                  id="job-skills"
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="plumbing, painting, electrician"
                  required
                />
              </div>

              <button className="post-job-button" type="submit" disabled={submitting}>
                {submitting ? "Posting..." : "Post Job"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostJob
