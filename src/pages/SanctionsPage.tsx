import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import sanctionService from '../services/sanctionService';
import pointageService from '../services/pointageService';
import SanctionFormModal from '../components/Sanctions/SanctionFormModal';

interface Stagiaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  promotion: string;
}

interface Sanction {
  id: number;
  stagiaire_id: number;
  niveau: 'avertissement' | 'blame' | 'suspension' | 'exclusion';
  motif: string;
  description: string;
  date_sanction: string;
  date_fin_suspension: string | null;
  stagiaire: {
    nom: string;
    prenom: string;
    promotion: string;
  };
}

const SanctionsPage: React.FC = () => {
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSanction, setSelectedSanction] = useState<Sanction | null>(null);
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sanctionsData, stagiairesData] = await Promise.all([
        sanctionService.getSanctions(),
        pointageService.getStagiaires(),
      ]);
      setSanctions(sanctionsData);
      setStagiaires(stagiairesData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSanction = () => {
    setSelectedSanction(null);
    setModalOpen(true);
  };

  const handleEditSanction = (sanction: Sanction) => {
    setSelectedSanction(sanction);
    setModalOpen(true);
  };

  const handleDeleteSanction = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sanction ?')) {
      try {
        await sanctionService.deleteSanction(id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const handleSaveSanction = async (data: any) => {
    try {
      if (selectedSanction) {
        await sanctionService.updateSanction(selectedSanction.id, data);
      } else {
        await sanctionService.createSanction(data);
      }
      loadData();
      setModalOpen(false);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const getNiveauBadge = (niveau: string) => {
    const classes = {
      avertissement: 'bg-yellow-100 text-yellow-800',
      blame: 'bg-orange-100 text-orange-800',
      suspension: 'bg-red-100 text-red-800',
      exclusion: 'bg-red-100 text-red-800 font-bold',
    };
    
    const labels = {
      avertissement: '⚠️ Avertissement',
      blame: '📝 Blâme',
      suspension: '🔇 Suspension',
      exclusion: '❌ Exclusion',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${classes[niveau as keyof typeof classes]}`}>
        {labels[niveau as keyof typeof labels]}
      </span>
    );
  };

  const filteredSanctions = filter === 'tous' 
    ? sanctions 
    : sanctions.filter(s => s.niveau === filter);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des sanctions</h1>
        <button
          onClick={handleCreateSanction}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle sanction
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('tous')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'tous'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('avertissement')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'avertissement'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Avertissements
          </button>
          <button
            onClick={() => setFilter('blame')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'blame'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            Blâmes
          </button>
          <button
            onClick={() => setFilter('suspension')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'suspension'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Suspensions
          </button>
        </div>
      </div>

      {/* Liste des sanctions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSanctions.map((sanction) => (
              <div key={sanction.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getNiveauBadge(sanction.niveau)}
                      <span className="text-sm text-gray-500">
                        {format(new Date(sanction.date_sanction), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {sanction.stagiaire.prenom} {sanction.stagiaire.nom}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{sanction.stagiaire.promotion}</p>
                    
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Motif : {sanction.motif}</p>
                      <p className="text-sm text-gray-600 mt-1">{sanction.description}</p>
                    </div>

                    {sanction.date_fin_suspension && (
                      <p className="text-sm text-red-600 mt-2">
                        Suspension jusqu'au {format(new Date(sanction.date_fin_suspension), 'dd/MM/yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSanction(sanction)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteSanction(sanction.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredSanctions.length === 0 && (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune sanction trouvée</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal formulaire sanction */}
      <SanctionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sanction={selectedSanction}
        stagiaires={stagiaires}
        onSave={handleSaveSanction}
      />
    </div>
  );
};

export default SanctionsPage;