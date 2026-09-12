import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FacilityProvider } from './context/FacilityContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
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
    <FacilityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
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
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FacilityProvider>
  );
}

export default App;
