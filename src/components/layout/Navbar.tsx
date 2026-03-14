import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, BellIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [imageError, setImageError] = useState(false);

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

            <div className="flex items-center space-x-3">
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
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;