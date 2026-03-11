import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { addUserSkill, changeUserPassword, fetchCurrentUser, logoutUser } from "../services/api"
import "./Profile.css"

const normalizeSkillsForDisplay = (skills) => {
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

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [newSkill, setNewSkill] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      navigate("/login")
      return
    }

    const loadProfile = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await fetchCurrentUser()
        const currentUser = response.data?.data

        if (!currentUser) {
          throw new Error("Current user payload missing")
        }

        localStorage.setItem("user", JSON.stringify(currentUser))
        setUser(currentUser)
      } catch (loadError) {
        console.error("Error loading profile:", loadError)

        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setError("Showing cached profile data. Backend profile refresh failed.")
        } catch (parseError) {
          console.error("Error parsing cached profile:", parseError)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          navigate("/login")
          return
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  const handleAddSkill = async () => {
    const trimmedSkill = newSkill.trim()

    if (!trimmedSkill) {
      setMessage("Enter a skill before saving.")
      return
    }

    setSaving(true)
    setMessage("")
    setError("")

    try {
      const response = await addUserSkill(trimmedSkill)
      const updatedSkills = Array.isArray(response.data?.skills) ? response.data.skills : []
      const updatedUser = {
        ...user,
        skills: updatedSkills,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setNewSkill("")
      setMessage("Skill added successfully.")
    } catch (saveError) {
      console.error("Error adding skill:", saveError)
      setError(saveError.response?.data?.message || "Failed to add skill.")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setMessage("")
    setError("")

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("All password fields are required.")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.")
      return
    }

    setChangingPassword(true)

    try {
      const response = await changeUserPassword(passwordForm)
      setMessage(response.data?.message || "Password changed successfully.")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (changeError) {
      console.error("Error changing password:", changeError)
      setError(changeError.response?.data?.message || "Failed to change password.")
    } finally {
      setChangingPassword(false)
    }
  }

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
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>Access Denied</h2>
        <p>Please log in to view your profile.</p>
        <button onClick={() => navigate("/login")} className="profile-button">
          Go to Login
        </button>
      </div>
    )
  }

  const displaySkills = normalizeSkillsForDisplay(user.skills)

  return (
    <div className="profile-container">
      <Sidebar user={user} />
      <div className="profile-main">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="profile-content">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your account details, skills, and password.</p>
          </div>

          {message && <div className="profile-message">{message}</div>}
          {error && <div className="profile-error-message">{error}</div>}

          <div className="profile-card">
            <aside className="profile-picture-section">
              <div className="profile-picture-wrapper">
                {user.profilePicture ? (
                  <img
                    src={
                      user.profilePicture.startsWith("http")
                        ? user.profilePicture
                        : `http://localhost:8000${user.profilePicture}`
                    }
                    alt="Profile"
                    className="profile-picture-img"
                  />
                ) : (
                  <div className="profile-picture-default">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="profile-picture-meta">
                <h2>{user.fullName || "Not set"}</h2>
                <p>@{user.username || "Not set"}</p>
              </div>
            </aside>

            <div className="profile-form">
              <div className="profile-info">
                <div className="info-group">
                  <span className="label">Name</span>
                  <span className="value">{user.fullName || "Not set"}</span>
                </div>

                <div className="info-group">
                  <span className="label">Username</span>
                  <span className="value">@{user.username || "Not set"}</span>
                </div>

                <div className="info-group">
                  <span className="label">Email</span>
                  <span className="value">{user.email || "Not set"}</span>
                </div>

                <div className="info-group">
                  <span className="label">Phone</span>
                  <span className="value">{user.phoneNumber || "Not set"}</span>
                </div>

                <div className="info-group skills-info-group">
                  <span className="label">Skills</span>
                  {displaySkills.length > 0 ? (
                    <div className="skills-display">
                      {displaySkills.map((skill, idx) => (
                        <span key={`${skill}-${idx}`} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="value">No skills added yet</span>
                  )}
                </div>

                <div className="add-skill-panel">
                  <div className="form-group">
                    <label htmlFor="new-skill">Add Skill</label>
                    <input
                      id="new-skill"
                      type="text"
                      value={newSkill}
                      onChange={(event) => setNewSkill(event.target.value)}
                      className="form-input"
                      placeholder="e.g., React"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="save-button"
                      type="button"
                      onClick={handleAddSkill}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Add Skill"}
                    </button>
                  </div>
                </div>

                <div className="info-group">
                  <span className="label">Profile Updates</span>
                  <span className="value description">
                    The current backend supports viewing your profile and adding skills only.
                  </span>
                </div>

                <form className="password-section" onSubmit={handleChangePassword}>
                  <h2 className="password-section-title">Change Password</h2>

                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="form-input"
                      autoComplete="current-password"
                      disabled={changingPassword}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="form-input"
                      autoComplete="new-password"
                      disabled={changingPassword}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="form-input"
                      autoComplete="new-password"
                      disabled={changingPassword}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="save-button"
                      type="submit"
                      disabled={changingPassword}
                    >
                      {changingPassword ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
