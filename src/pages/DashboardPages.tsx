import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Stagiaire } from '../types';

const DashboardPage: React.FC = () => {
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStagiaires();
  }, []);

  const fetchStagiaires = async () => {
    try {
      const response = await api.get('/coach/stagiaires');
      setStagiaires(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStagiaires = stagiaires.filter(
    (s) =>
      s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: stagiaires.length,
    presents: stagiaires.filter((s) => s.statut_aujourdhui === 'present').length,
    retards: stagiaires.filter((s) => s.statut_aujourdhui === 'retard').length,
    absents: stagiaires.filter((s) => s.statut_aujourdhui === 'absent').length,
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'present':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Présent</span>;
      case 'retard':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Retard</span>;
      case 'absent':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Absent</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Stagiaires</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Présents</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.presents}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Retards</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.retards}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Absents</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.absents}</dd>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white shadow rounded-lg p-4">
        <input
          type="text"
          placeholder="Rechercher un stagiaire..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Liste des stagiaires */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredStagiaires.map((stagiaire) => (
            <li key={stagiaire.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {stagiaire.photo ? (
                    <img
                        className="h-10 w-10 rounded-full object-cover"
                        // ✅ Corrigé : ajout de l'URL du backend
                        src={`http://127.0.0.1:8000/storage/${stagiaire.photo}`}
                        alt=""
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                            {stagiaire.prenom[0]}{stagiaire.nom[0]}
                        </span>
                    </div>
                )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {stagiaire.prenom} {stagiaire.nom}
                  </p>
                  <p className="text-sm text-gray-500">{stagiaire.email}</p>
                  <p className="text-xs text-gray-400">Promotion: {stagiaire.promotion}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Retards: {stagiaire.total_retards}</p>
                    {stagiaire.heure_arrivee && (
                      <p className="text-xs text-gray-400">Arrivée: {stagiaire.heure_arrivee}</p>
                    )}
                  </div>
                  {getStatusBadge(stagiaire.statut_aujourdhui)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;