import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Landing from "./pages/Landingpage"
import UserDashboard from "./pages/UserDashboard"
import Profile from "./pages/Profile"

const JobsMarketplace = lazy(() => import("./pages/JobsMarketplace"))
const MyApplications = lazy(() => import("./pages/MyApplications"))
const MyJobs = lazy(() => import("./pages/MyJobs"))
const PostJob = lazy(() => import("./pages/PostJob"))
const ActiveJobs = lazy(() => import("./pages/ActiveJobs"))

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<UserDashboard />} />

        <Route path="/my-profile" element={<Profile />} />
        <Route
          path="/jobs-marketplace"
          element={
            <Suspense fallback={<div>Loading jobs marketplace...</div>}>
              <JobsMarketplace />
            </Suspense>
          }
        />
        <Route
         
          path="/my-applications"
          element={
            <Suspense fallback={<div>Loading applications...</div>}>
              <MyApplications />
            </Suspense>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <Suspense fallback={<div>Loading your jobs...</div>}>
              <MyJobs />
            </Suspense>
          }
        />
        <Route
          path="/post-jobs"
          element={
            <Suspense fallback={<div>Loading post job...</div>}>
              <PostJob />
            </Suspense>
          }
        />
        <Route
          path="/active-jobs"
          element={
            <Suspense fallback={<div>Loading active jobs...</div>}>
              <ActiveJobs />
            </Suspense>
          }
        />

      </Routes>

    </BrowserRouter>
  )

}

export default App
