import React, { useState } from 'react';
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

  return <>{children}</>;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navbar onMenuClick={toggleSidebar} />
                <div className="flex">
                  {/* Sidebar - desktop toujours visible, mobile conditionnel */}
                  <div className={`
                    fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  `}>
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                  </div>
                  
                  {/* Overlay pour fermer le sidebar sur mobile */}
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}
                  
                  <main className="flex-1 p-6">
                    <DashboardPage onMenuClick={toggleSidebar} />
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/pointages"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navbar onMenuClick={toggleSidebar} />
                <div className="flex">
                  <div className={`
                    fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  `}>
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                  </div>
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}
                  <main className="flex-1 p-6">
                    <PointagesPage />
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/sanctions"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navbar onMenuClick={toggleSidebar} />
                <div className="flex">
                  <div className={`
                    fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  `}>
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                  </div>
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}
                  <main className="flex-1 p-6">
                    <SanctionsPage />
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/stagiaires"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-50">
                <Navbar onMenuClick={toggleSidebar} />
                <div className="flex">
                  <div className={`
                    fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  `}>
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                  </div>
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}
                  <main className="flex-1 p-6">
                    <StagiairesPage />
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;