import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, EnvelopeIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline';
import pointageService from '../../services/pointageService';

interface Stagiaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  promotion: string;
  telephone?: string;
  date_debut?: string;
  date_fin?: string;
}

interface Pointage {
  id: number;
  date: string;
  heure_arrivee: string | null;
  heure_sortie: string | null;
  statut: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stagiaire: Stagiaire | null;
}

const StagiaireDetailModal: React.FC<Props> = ({ isOpen, onClose, stagiaire }) => {
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    presents: 0,
    retards: 0,
    absents: 0,
    justifies: 0,
  });

  useEffect(() => {
    if (stagiaire && isOpen) {
      loadPointages();
    }
  }, [stagiaire, isOpen]);

  const loadPointages = async () => {
    if (!stagiaire) return;
    
    setLoading(true);
    try {
      const data = await pointageService.getPointagesByStagiaire(stagiaire.id, {
        date_debut: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        date_fin: new Date().toISOString().split('T')[0],
      });

      setPointages(data);

      // Calculer les stats
      const newStats = {
        presents: data.filter((p: Pointage) => p.statut === 'present').length,
        retards: data.filter((p: Pointage) => p.statut === 'retard').length,
        absents: data.filter((p: Pointage) => p.statut === 'absent').length,
        justifies: data.filter((p: Pointage) => p.statut === 'justifie').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const classes = {
      present: 'bg-green-100 text-green-800',
      retard: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      justifie: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[statut as keyof typeof classes] || 'bg-gray-100'}`}>
        {statut}
      </span>
    );
  };

  if (!stagiaire) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Détails du stagiaire
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Profil */}
                <div className="flex items-start space-x-6 mb-8">
                  <div className="flex-shrink-0">
                    {stagiaire.photo ? (
                      <img
                        className="h-24 w-24 rounded-full object-cover"
                        src={`http://127.0.0.1:8000/storage/${stagiaire.photo}`}
                        alt=""
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-2xl text-indigo-600 font-medium">
                          {stagiaire.prenom[0]}{stagiaire.nom[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {stagiaire.prenom} {stagiaire.nom}
                    </h2>
                    <p className="text-gray-600">{stagiaire.promotion}</p>
                    
                    <div className="mt-4 space-y-2">
                      {stagiaire.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          {stagiaire.email}
                        </div>
                      )}
                      {stagiaire.telephone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {stagiaire.telephone}
                        </div>
                      )}
                      {stagiaire.date_debut && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Inscrit depuis le {new Date(stagiaire.date_debut).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.presents}</p>
                    <p className="text-xs text-gray-600">Présents</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.retards}</p>
                    <p className="text-xs text-gray-600">Retards</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.absents}</p>
                    <p className="text-xs text-gray-600">Absents</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.justifies}</p>
                    <p className="text-xs text-gray-600">Justifiés</p>
                  </div>
                </div>

                {/* Historique des pointages */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Derniers pointages (30 jours)
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {pointages.map((pointage) => (
                        <div
                          key={pointage.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(pointage.date).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-sm text-gray-600">
                              {pointage.heure_arrivee || '--:--'} - {pointage.heure_sortie || '--:--'}
                            </span>
                          </div>
                          {getStatusBadge(pointage.statut)}
                        </div>
                      ))}

                      {pointages.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          Aucun pointage trouvé
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default StagiaireDetailModal;