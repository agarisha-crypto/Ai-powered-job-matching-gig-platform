import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // allow sending/receiving cookies
})

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    const shouldAttachAuth = !config.skipAuth

    // attach stored token to every request if available
    const token = localStorage.getItem('token')
    if (shouldAttachAuth && token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data)
    console.log('Response headers:', response.headers)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.message)
    console.log('Response headers (error):', error.response?.headers)
    return Promise.reject(error)
  }
)

export const loginUser = (data) => API.post("/api/v1/users/login", data)
export const registerUser = (data) => API.post("/api/v1/users/register", data)
export const fetchJobs = () => API.get("/api/v1/job/my-posted-jobs")
export const applyToJob = (jobId, data) =>
  API.post(`/api/v1/applications/job/${jobId}/apply`, data)

export const createJob = (data) => API.post("/api/v1/job/post-job", data)

export const fetchMyApplications = () => API.get("/api/v1/applications/job/my-application")

export const fetchActiveJobs = () => API.get("/api/v1/job/active-jobs")

export const fetchApplicationsForJob = (jobId) =>
  API.get(`/api/v1/applications/job/${jobId}/applications`)

export const selectApplicantForJob = async ({ jobId, applicationDbId, applicantId }) => {
  return API.post(`/api/v1/job/${jobId}/applications/${applicationDbId}/select`, {
    applicantId,
    status: "selected",
  })
}

export const logoutUser = async () => {
  const attempts = [
  
    { method: "get", url: "/api/v1/users/logout", skipAuth: false },
    { method: "get", url: "/api/v1/users/logout", skipAuth: true },
   
  ]

  let lastError

  for (const attempt of attempts) {
    try {
      const response = await API.request({
        method: attempt.method,
        url: attempt.url,
        skipAuth: attempt.skipAuth,
      })
      return response
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}
