import { useNavigate } from "react-router-dom"
import "./Landingpage.css"
 
 function Landing() {

  const navigate = useNavigate()

  const handleLoginClick = () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      // User is already logged in, go to dashboard
      navigate('/dashboard')
    } else {
      // User needs to login first
      navigate('/login')
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1 className="landing-title">Welcome to Skill Marketplace</h1>
        <p className="landing-subtitle">Show your skills and get job deals</p>
        <button className="landing-button" onClick={handleLoginClick}>Login</button>
      </div>
    </div>
  );
}

export default Landing;
