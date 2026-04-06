import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [imageError, setImageError] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPhotoUrl = () => {
    if (!user.photo || imageError) return null;
    return user.photo.startsWith('http')
      ? user.photo
      : `http://127.0.0.1:8000/storage/${user.photo}`;
  };

  const photoUrl = getPhotoUrl();

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Coach Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>

              {/* ✅ Cliquable pour ouvrir le modal profil */}
              <div
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="flex-shrink-0">
                  {photoUrl ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={photoUrl}
                      alt={user.prenom}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">
                    {user.prenom} {user.nom}
                  </p>
                  {/* ✅ Bouton déconnexion ouvre le modal de confirmation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLogoutModal(true);
                    }}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Modal Profil */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Mon Profil</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Photo et nom */}
              <div className="flex flex-col items-center mb-6">
                {photoUrl ? (
                  <img
                    className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100"
                    src={photoUrl}
                    alt={user.prenom}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-200">
                    <UserIcon className="h-12 w-12 text-indigo-600" />
                  </div>
                )}
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  {user.prenom} {user.nom}
                </h3>
                <span className="mt-1 px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 capitalize">
                  {user.role}
                </span>
              </div>

              {/* Informations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium text-gray-900">{user.email}</span>
                </div>
                {user.telephone && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Téléphone</span>
                    <span className="text-sm font-medium text-gray-900">{user.telephone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Statut</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    user.est_actif
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.est_actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowLogoutModal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal Déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Déconnexion</h2>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-gray-700 font-medium">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;