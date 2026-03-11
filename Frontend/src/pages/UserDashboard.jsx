import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logoutUser } from "../services/api"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import "./UserDashboard.css"

function UserDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in and get data from localStorage (stored during login)
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      console.log('No authentication found, redirecting to login')
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      console.log('User data loaded from login:', parsedUser)
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      // Clear corrupted data and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
      return
    }

    setLoading(false)
  }, [navigate])

  const handleLogout = async () => {
    try {
      // inform backend so it can clear any server-side cookie
      await logoutUser()
      console.log('Logged out on backend')
    } catch (err) {
      console.warn('Backend logout failed, proceeding anyway', err)
    }

    // clear stored auth data including any session cookie
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('sessionCookie')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <h2>Access Denied</h2>
        <p>Please log in to access your dashboard.</p>
        <button onClick={() => navigate('/login')} className="login-button">
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="dashboard-main">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <p className="dashboard-eyebrow">Dashboard</p>
            <h1 className="dashboard-title">
              Welcome to <span className="dashboard-title-brand">TAMTAM</span>
            </h1>
            <p className="dashboard-subtitle">Your Job Saarthi</p>
            <p className="dashboard-description">
              Track opportunities, manage your applications, and keep your profile updated from one place.
            </p>
            <h2 className="dashboard-question">What do you want to do today?</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
