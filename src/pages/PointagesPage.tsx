import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import pointageService from '../services/pointageService';
import CorrectionModal from '../components/Pointages/CorrectionModal';

interface Stagiaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  promotion: string;
}

interface Pointage {
  id: number;
  user_id: number;
  date: string;
  heure_arrivee: string | null;
  heure_sortie: string | null;
  statut: 'present' | 'retard' | 'absent' | 'justifie';
  note: string | null;
  user: {
    nom: string;
    prenom: string;
  };
}

const PointagesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'liste' | 'calendrier'>('liste');
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStagiaire, setSelectedStagiaire] = useState<number | 'tous'>('tous');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedPointage, setSelectedPointage] = useState<Pointage | null>(null);
  const [dateDebut, setDateDebut] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateFin, setDateFin] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadStagiaires();
    loadPointages();
  }, []);

  useEffect(() => {
    if (viewMode === 'liste') {
      loadPointages();
    }
  }, [selectedDate, selectedStagiaire, selectedStatut]);

  const loadStagiaires = async () => {
    try {
      const data = await pointageService.getStagiaires();
      setStagiaires(data);
    } catch (error) {
      console.error('Erreur chargement stagiaires:', error);
    }
  };

  const loadPointages = async () => {
    setLoading(true);
    try {
      const filters: any = {
        date_debut: format(dateDebut, 'yyyy-MM-dd'),
        date_fin: format(dateFin, 'yyyy-MM-dd'),
      };
      
      if (selectedStagiaire !== 'tous') {
        filters.user_id = selectedStagiaire;
      }
      
      if (selectedStatut !== 'tous') {
        filters.statut = selectedStatut;
      }

      const data = await pointageService.getPointages(filters);
      setPointages(data);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrection = (pointage: Pointage) => {
    setSelectedPointage(pointage);
    setCorrectionModalOpen(true);
  };

  const handleCorrectionSave = async (data: any) => {
    if (!selectedPointage) return;
    
    try {
      await pointageService.corrigerPointage(selectedPointage.id, data);
      loadPointages();
      setCorrectionModalOpen(false);
    } catch (error) {
      console.error('Erreur correction:', error);
    }
  };

  const getStatusBadge = (statut: string) => {
    const classes = {
      present: 'bg-green-100 text-green-800',
      retard: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      justifie: 'bg-blue-100 text-blue-800',
    };
    
    const labels = {
      present: 'Présent',
      retard: 'Retard',
      absent: 'Absent',
      justifie: 'Justifié',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${classes[statut as keyof typeof classes] || 'bg-gray-100'}`}>
        {labels[statut as keyof typeof labels] || statut}
      </span>
    );
  };

  const getJourSemaine = (date: string) => {
    return format(new Date(date), 'EEEE d', { locale: fr });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'present': return 'bg-green-500';
      case 'retard': return 'bg-yellow-500';
      case 'absent': return 'bg-red-500';
      case 'justifie': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des pointages</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('liste')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'liste'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setViewMode('calendrier')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'calendrier'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Calendrier
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stagiaire
            </label>
            <select
              value={selectedStagiaire}
              onChange={(e) => setSelectedStagiaire(e.target.value === 'tous' ? 'tous' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="tous">Tous les stagiaires</option>
              {stagiaires.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.prenom} {s.nom} - {s.promotion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="present">Présent</option>
              <option value="retard">Retard</option>
              <option value="absent">Absent</option>
              <option value="justifie">Justifié</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={loadPointages}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Appliquer les filtres
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <ArrowDownTrayIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Vue Liste */}
      {viewMode === 'liste' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stagiaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arrivée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Départ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pointages.map((pointage) => (
                    <tr key={pointage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(pointage.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pointage.user.prenom} {pointage.user.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointage.heure_arrivee || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pointage.heure_sortie || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pointage.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleCorrection(pointage)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Corriger
                        </button>
                        {pointage.note && (
                          <span className="text-gray-500 text-xs">
                            Note: {pointage.note}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pointages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun pointage trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Vue Calendrier */}
      {viewMode === 'calendrier' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeDate(-7)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium">
              Semaine du {format(selectedDate, 'dd/MM/yyyy')}
            </h2>
            <button
              onClick={() => changeDate(7)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour) => (
              <div key={jour} className="text-center font-medium text-gray-600 py-2">
                {jour}
              </div>
            ))}
            
            {/* Cases du calendrier à implémenter */}
          </div>
        </div>
      )}

      {/* Modal de correction */}
      <CorrectionModal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        pointage={selectedPointage}
        onSave={handleCorrectionSave}
      />
    </div>
  );
};

export default PointagesPage;