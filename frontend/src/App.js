import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import UserManagement from "./pages/UserManagement";
import JobManagement from "./pages/JobManagement";
import InterviewManagement from "./pages/InterviewManagement";
import OfferManagement from "./pages/OfferManagement";
import NotFoundPage from "./pages/NotFoundPage";
import NoAccess from "./pages/NoAccess.js";
import InterviewDetail from "./pages/InterviewDetail";
import OfferDetail from "./pages/OfferDetail";

import JobDetail from "./pages/JobDetail.js";
import CandidateManagerment from "./pages/CandidateManagerment";
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/no-access" />;
}


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem("isAuthenticated")) || false
  );

  useEffect(() => {
    localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/no-access" element={<NoAccess />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <JobManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <InterviewManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offer"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OfferManagement />
            </ProtectedRoute>
          }
        />
        <Route
         path="/offer/:id"
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><OfferDetail /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFoundPage />} />
        <Route path="/interview/:id" element={<InterviewDetail />} />
        <Route path="/job/:jobId" element={<JobDetail />} />
        <Route path="/candidate" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
           <CandidateManagerment/>
        </ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
