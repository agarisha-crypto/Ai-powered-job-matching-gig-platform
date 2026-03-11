import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { logoutUser } from "../services/api"
import "./Profile.css"

const normalizeSkillsForInput = (skills) => {
  if (Array.isArray(skills)) {
    return skills.join(", ")
  }
  if (typeof skills === "string") {
    return skills
  }
  return ""
}

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
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    skills: "",
    education: "",
    profileSummary: "",
    rating: 0,
    profilePicture: null,
  })

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
        setFormData({
          fullName: parsedUser.fullName || "",
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          phoneNumber: parsedUser.phoneNumber || "",
          skills: normalizeSkillsForInput(parsedUser.skills),
          education: parsedUser.education || "",
          profileSummary: parsedUser.profileSummary || "",
          rating: parsedUser.rating || 0,
        profilePicture: null,
      })
      setLoading(false)
    } catch (error) {
      console.error("Error loading profile:", error)
      navigate("/login")
    }
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }))
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage("")

    try {
      // In a real app, you would send this to the backend API
      // For now, we'll update local storage and show a success message
      
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        skills: formData.skills,
        education: formData.education,
        profileSummary: formData.profileSummary,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setMessage("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

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
            {!isEditing && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {message && <div className="profile-message">{message}</div>}

          <div className="profile-card">
            {/* Profile Picture Section */}
            <div className="profile-picture-section">
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
              {isEditing && (
                <div className="picture-upload">
                  <input
                    id="picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="picture-input">Change Picture</label>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <div className="profile-form">
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      disabled
                      className="form-input disabled"
                    />
                    <small>Username cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Skills (comma-separated)</label>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="e.g., Python, React, Node.js"
                    />
                  </div>

                  <div className="form-group">
                    <label>Education</label>
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="e.g., Bachelor's in Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label>Profile Summary</label>
                    <textarea
                      name="profileSummary"
                      value={formData.profileSummary}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="save-button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-info">
                    <div className="info-group">
                      <span className="label">Name:</span>
                      <span className="value">{user.fullName || "Not set"}</span>
                    </div>

                    <div className="info-group">
                      <span className="label">Username:</span>
                      <span className="value">@{user.username || "Not set"}</span>
                    </div>

                    <div className="info-group">
                      <span className="label">Email:</span>
                      <span className="value">{user.email || "Not set"}</span>
                    </div>

                    <div className="info-group">
                      <span className="label">Phone:</span>
                      <span className="value">{user.phoneNumber || "Not set"}</span>
                    </div>

                    {displaySkills.length > 0 && (
                      <div className="info-group">
                        <span className="label">Skills:</span>
                        <div className="skills-display">
                          {displaySkills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.education && (
                      <div className="info-group">
                        <span className="label">Education:</span>
                        <span className="value">{user.education}</span>
                      </div>
                    )}

                    {user.profileSummary && (
                      <div className="info-group">
                        <span className="label">About:</span>
                        <span className="value description">{user.profileSummary}</span>
                      </div>
                    )}

                    {user.rating && (
                      <div className="info-group">
                        <span className="label">Rating:</span>
                        <span className="value">
                          {"⭐".repeat(Math.floor(user.rating))}
                          {user.rating % 1 !== 0 && "✨"}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
