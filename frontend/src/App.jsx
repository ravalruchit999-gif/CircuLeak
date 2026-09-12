import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FacilityProvider } from './context/FacilityContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth & Admin Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminPanel } from './pages/AdminPanel';

// Core Application Pages
import Dashboard from './pages/Dashboard';
import Facility from './pages/Facility';
import DataUpload from './pages/DataUpload';
import Emissions from './pages/Emissions';
import Leaks from './pages/Leaks';
import LeakDetails from './pages/LeakDetails';
import Recommendations from './pages/Recommendations';
import ActionPlanner from './pages/ActionPlanner';
import Simulation from './pages/Simulation';
import Trajectory from './pages/Trajectory';
import Benchmark from './pages/Benchmark';
import Circularity from './pages/Circularity';
import AuditReport from './pages/AuditReport';

export function App() {
  return (
    <AuthProvider>
      <FacilityProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="facility" element={<Facility />} />
              <Route path="data-upload" element={<DataUpload />} />
              <Route path="emissions" element={<Emissions />} />
              <Route path="leaks" element={<Leaks />} />
              <Route path="leaks/:id" element={<LeakDetails />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="action-planner" element={<ActionPlanner />} />
              <Route path="simulation" element={<Simulation />} />
              <Route path="trajectory" element={<Trajectory />} />
              <Route path="benchmark" element={<Benchmark />} />
              <Route path="circularity" element={<Circularity />} />
              <Route path="audit-report" element={<AuditReport />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FacilityProvider>
    </AuthProvider>
  );
}

export default App;
