import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AdminRoute from './routes/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import ChangePasswordForce from './pages/ChangePasswordForce';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventDetail from './pages/admin/AdminEventDetail';
import AdminUsers from './pages/admin/AdminUsers';
import StudentDashboard from './pages/student/StudentDashboard';
import ExploreEvents from './pages/student/ExploreEvents';
import StudentEventDetail from './pages/student/StudentEventDetail';
import StudentCalendar from './pages/student/StudentCalendar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Student/General Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <StudentDashboard />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <StudentCalendar />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <ExploreEvents />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore/:id"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <StudentEventDetail />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <StudentLayout>
                  <Profile />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password-force"
            element={
              <ProtectedRoute>
                <ChangePasswordForce />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminEvents />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/:id"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminEventDetail />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/:role"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
