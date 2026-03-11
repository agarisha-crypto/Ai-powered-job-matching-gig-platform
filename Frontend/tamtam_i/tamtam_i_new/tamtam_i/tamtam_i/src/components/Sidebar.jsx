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
          </>
        )}
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          Dashboard
        </NavLink>
        <NavLink to="/my-profile" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          👤 My Profile
        </NavLink>
        <NavLink to="/jobs-marketplace" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          Jobs Marketplace
        </NavLink>
        <NavLink to="/post-jobs" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          Post Jobs
        </NavLink>
        <NavLink to="/my-jobs" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          My Jobs
        </NavLink>
        <NavLink to="/my-applications" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          My Applications
        </NavLink>
        <NavLink to="/active-jobs" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          Active Jobs
        </NavLink>
        <NavLink to="/wallet" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          Wallet
        </NavLink>
        <NavLink to="/ai-assistant" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          AI Assistant
        </NavLink>
        <NavLink to="/settings" className={({isActive})=>isActive?"sidebar-link active":"sidebar-link"}>
          Settings
        </NavLink>
      </nav>
    </div>
  )
}

export default Sidebar
