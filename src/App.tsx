import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPages';
import DashboardPage from './pages/DashboardPages';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PointagesPage from './pages/PointagesPage';
import SanctionsPage from './pages/SanctionsPage';
import StagiairesPage from './pages/StagiairesPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'coach') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pointages"
          element={
            <PrivateRoute>
              <PointagesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/sanctions"
          element={
            <PrivateRoute>
              <SanctionsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/stagiaires"
          element={
            <PrivateRoute>
              <StagiairesPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;