// App.tsx - Version corrigée
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPages';
import DashboardPage from './pages/DashboardPages';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PointagesPage from './pages/PointagesPage';
import SanctionsPage from './pages/SanctionsPage';
import StagiairesPage from './pages/StagiairesPage';

// Layout component qui contient la structure commune
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        {/* Sidebar desktop - toujours visible sur grands écrans */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Sidebar mobile - overlay qui apparaît quand sidebarOpen est true */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={closeSidebar}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden">
              <Sidebar onClose={closeSidebar} />
            </div>
          </>
        )}

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'coach') {
    return <Navigate to="/login" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
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