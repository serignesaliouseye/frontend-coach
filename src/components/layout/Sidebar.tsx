// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  onClose?: () => void; // ✅ Ajoutez cette ligne
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Mes Stagiaires', href: '/stagiaires', icon: UserGroupIcon },
  { name: 'Pointages', href: '/pointages', icon: ClockIcon },
  { name: 'Sanctions', href: '/sanctions', icon: ExclamationTriangleIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => { // ✅ Ajoutez le paramètre
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getPhotoUrl = () => {
    if (!user.photo) return null;
    if (user.photo.startsWith('http')) return user.photo;
    return `https://backend-pointage-cwb8.onrender.com/storage/${user.photo}`;
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="flex flex-col w-64 h-full bg-white border-r border-gray-200">
      {/* En-tête avec bouton fermeture pour mobile */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:justify-center">
        <h1 className="text-xl font-semibold text-gray-900">Coach Dashboard</h1>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-500 lg:hidden"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose} // ✅ Ferme le sidebar sur mobile après clic
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Profil utilisateur */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={photoUrl}
                alt={user.prenom}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-indigo-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;