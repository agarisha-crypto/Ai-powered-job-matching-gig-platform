import { useState, useRef, useEffect } from "react"
import "./Navbar.css"

function Navbar({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="navbar">
      <div className="navbar-left">
        <input
          type="text"
          className="navbar-search"
          placeholder="Search..."
        />
      </div>
      <div className="navbar-right">
        <button className="navbar-icon-btn" title="Notifications">
          🔔
        </button>
        <div className="navbar-profile" ref={dropdownRef}>
          <button
            className="navbar-profile-btn"
            onClick={() => setShowDropdown((v) => !v)}
            title="Profile Menu"
          >
            <span className="profile-avatar">👤</span>
            <span className="profile-name">{user?.username || "User"}</span>
            <span className="dropdown-arrow">⌄</span>
          </button>
          {showDropdown && (
            <div className="navbar-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <strong>{user?.fullName || user?.username || "User"}</strong>
                  <small>{user?.email || "user@example.com"}</small>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/my-profile" className="dropdown-item">
                👤 My Profile
              </a>
              <a href="/ratings-reviews" className="dropdown-item">
                ⭐ Ratings & Reviews
              </a>
              <a href="/wallet" className="dropdown-item">
                💳 Wallet
              </a>
              <a href="/my-activity" className="dropdown-item">
                📊 My Activity
              </a>
              <a href="/account-settings" className="dropdown-item">
                ⚙️ Account Settings
              </a>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={onLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
