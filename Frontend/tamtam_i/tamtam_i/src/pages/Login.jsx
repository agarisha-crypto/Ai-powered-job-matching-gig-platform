import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser, logoutUser } from "../services/api"
import "./Login.css"

function Login(){
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

 const handleLogin = async (e) => {

  e.preventDefault()
  setError("")
  setLoading(true)

  try{

   const res = await loginUser({
     email: email,
     passwordHash: password // Backend expects 'passwordHash'
   })

   console.log(res.data)

   // Store user data and token in localStorage
   if (res.data && res.data.success) {
     // Extract token from possible locations (root, data, or accessToken)
     const token = res.data.token || res.data.accessToken || res.data.data?.token || res.data.data?.accessToken
     if (token) {
       localStorage.setItem('token', token)
     }
     // capture any Set-Cookie header sent by backend and persist it
     const setCookie = res.headers?.['set-cookie'] || res.headers?.['Set-Cookie']
     if (setCookie) {
       // axios may return an array; stringify for storage
       localStorage.setItem('sessionCookie', Array.isArray(setCookie) ? setCookie.join('; ') : setCookie)
       console.log('Stored session cookie in localStorage:', setCookie)
     }
     // Determine what should be stored as the "user" object
     if (res.data.data) {
       let userPayload = res.data.data
       // unwrap if backend nests the actual user under a "user" key
       if (userPayload.user) {
         userPayload = userPayload.user
       }
       localStorage.setItem('user', JSON.stringify(userPayload))
       console.log('Stored user data:', userPayload)
     } else {
       console.error('No user data found in response')
       setError('Login successful but no user data received')
       setLoading(false)
       return
     }

     console.log('Login successful, navigating to dashboard...')
     setIsLoggedIn(true)
     navigate('/dashboard') // Navigate to dashboard after successful login
   } else {
     console.error('Login response indicates failure:', res.data)
     setError('Login failed. Please check your credentials.')
     setLoading(false)
   }

  }
  catch(err){
   console.error('Login error:', err)
   setError(err.response?.data?.message || 'Please Register first.')
   setLoading(false)
  }

 }

 const handleLogout = async () => {
   try {
     // Attempt to inform backend
     await logoutUser()
     console.log('Backend logout successful')
   } catch (err) {
     console.warn('Backend logout failed, clearing local data anyway:', err)
   }

   // Clear all stored authentication data
   localStorage.removeItem('token')
   localStorage.removeItem('user')
   localStorage.removeItem('sessionCookie')
   setIsLoggedIn(false)
   setError("")
   console.log('Logged out and cleared all tokens/cookies')
 }

 return(
  <div className="login-page">
    <div className="login-container">

     <h2 className="login-title">Login</h2>

     {isLoggedIn ? (
       <div className="login-logged-in">
         <p>You are already logged in.</p>
         <button className="login-button" onClick={() => navigate('/dashboard')}>
           Go to Dashboard
         </button>
         <button className="logout-button" onClick={handleLogout}>
           Logout
         </button>
       </div>
     ) : (
       <>
         {error && <div className="login-error">{error}</div>}
         <form className="login-form" onSubmit={handleLogin}>

          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button className="login-button" type="submit" disabled={loading}>
           {loading ? 'Logging in...' : 'Login'}
          </button>

         </form>
       </>
     )}

     <div className="login-link">
       Don't have an account? <a href="/register">Register here</a>
     </div>

    </div>
  </div>

 )

}

export default Login
