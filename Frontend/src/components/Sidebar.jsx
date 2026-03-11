import { NavLink } from "react-router-dom"
import "./Sidebar.css"

function Sidebar({ user }) {
  return (
    <div className="sidebar">
      <div className="sidebar-profile">
        {user && (
          <>
            {user.profilePicture ? (
              <img
                className="sidebar-avatar"
                src={
                  user.profilePicture.startsWith("http")
                    ? user.profilePicture
                    : `http://localhost:8000${user.profilePicture}`
                }
                alt="avatar"
              />
            ) : (
              <div className="sidebar-avatar default">{user.fullName?.charAt(0).toUpperCase() || "U"}</div>
            )}
            <span className="sidebar-username">{user.username}</span>
            <span className="sidebar-role">Welcome back</span>
          </>
        )}
      </div>
      <nav className="sidebar-nav">
        <p className="sidebar-nav-title">Main Menu</p>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">Dashboard</span>
        </NavLink>
        <NavLink to="/my-profile" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">My Profile</span>
        </NavLink>
        <NavLink to="/jobs-marketplace" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">Jobs Marketplace</span>
        </NavLink>
        <NavLink to="/post-jobs" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">Post Jobs</span>
        </NavLink>
        <NavLink to="/my-jobs" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">My Jobs</span>
        </NavLink>
        <NavLink to="/my-applications" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">My Applications</span>
        </NavLink>
        <NavLink to="/active-jobs" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">Active Jobs</span>
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">Wallet</span>
        </NavLink>
        <NavLink to="/ai-assistant" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">AI Assistant</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
          <span className="sidebar-link-text">Settings</span>
        </NavLink>
      </nav>
    </div>
  )
}

export default Sidebar
