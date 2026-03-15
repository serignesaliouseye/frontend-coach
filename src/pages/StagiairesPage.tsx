import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import pointageService from '../services/pointageService';
import api from '../services/api';
import StagiaireDetailModal from '../components/Stagiaires/StagiaireDetailModal';
import QRCodeModal from '../components/Pointages/QRCodeModal';

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
  statut_aujourdhui: 'present' | 'retard' | 'absent' | 'justifie';
  heure_arrivee?: string;
  total_retards: number;
  total_absences: number;
  moyenne_presence: number;
}

const StagiairesPage: React.FC = () => {
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [filteredStagiaires, setFilteredStagiaires] = useState<Stagiaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState<string>('toutes');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStagiaire, setSelectedStagiaire] = useState<Stagiaire | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrValidite, setQrValidite] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [promotions, setPromotions] = useState<string[]>([]);
  const [showQRForStagiaire, setShowQRForStagiaire] = useState<Stagiaire | null>(null);

  useEffect(() => {
    loadStagiaires();
    loadQRCode();
  }, []);

  useEffect(() => {
    filterStagiaires();
  }, [searchTerm, selectedPromotion, selectedStatut, stagiaires]);

  const loadStagiaires = async () => {
    setLoading(true);
    try {
      const data = await pointageService.getStagiaires();
      setStagiaires(data);
      
      // Extraire les promotions uniques
      const uniquePromos = [...new Set(data.map((s: Stagiaire) => s.promotion))];
      setPromotions(uniquePromos as string[]);
    } catch (error) {
      console.error('Erreur chargement stagiaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQRCode = async () => {
    try {
      const response = await api.get('/qr-codes/actuel');
      setQrCode(response.data.qr_code);
      setQrValidite(response.data);
    } catch (error) {
      console.error('Erreur chargement QR code:', error);
    }
  };

  const handleRegenerateQR = async () => {
    setQrLoading(true);
    try {
      const response = await api.post('/qr-codes/generer');
      setQrCode(response.data.qr_code);
      setQrValidite(response.data);
    } catch (error) {
      console.error('Erreur génération QR code:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShowQRForStagiaire = (stagiaire: Stagiaire) => {
    setShowQRForStagiaire(stagiaire);
    setQrModalOpen(true);
  };

  const filterStagiaires = () => {
    let filtered = [...stagiaires];

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPromotion !== 'toutes') {
      filtered = filtered.filter((s) => s.promotion === selectedPromotion);
    }

    if (selectedStatut !== 'tous') {
      filtered = filtered.filter((s) => s.statut_aujourdhui === selectedStatut);
    }

    setFilteredStagiaires(filtered);
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

  const getPerformanceColor = (moyenne: number) => {
    if (moyenne >= 80) return 'text-green-600';
    if (moyenne >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = {
    total: stagiaires.length,
    presents: stagiaires.filter(s => s.statut_aujourdhui === 'present').length,
    retards: stagiaires.filter(s => s.statut_aujourdhui === 'retard').length,
    absents: stagiaires.filter(s => s.statut_aujourdhui === 'absent').length,
    justifies: stagiaires.filter(s => s.statut_aujourdhui === 'justifie').length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec QR Code */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold text-gray-900">Mes Stagiaires</h1>
        
        {/* Widget QR Code compact */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
          {qrCode ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12">
                  <img 
                    src={qrCode} 
                    alt="QR" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs">
                  <p className="font-medium text-gray-900">QR Code du jour</p>
                  <p className="text-gray-500">
                    {qrValidite?.heure_debut} - {qrValidite?.heure_fin}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                  title="Agrandir"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                  title="Télécharger"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleRegenerateQR}
                  disabled={qrLoading}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                  title="Régénérer"
                >
                  <svg className={`h-5 w-5 ${qrLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleRegenerateQR}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-900"
            >
              <QrCodeIcon className="h-5 w-5" />
              <span>Générer QR code</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Présents</p>
          <p className="text-2xl font-bold text-green-600">{stats.presents}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Retards</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.retards}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Absents</p>
          <p className="text-2xl font-bold text-red-600">{stats.absents}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Justifiés</p>
          <p className="text-2xl font-bold text-blue-600">{stats.justifies}</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promotion
              </label>
              <select
                value={selectedPromotion}
                onChange={(e) => setSelectedPromotion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="toutes">Toutes les promotions</option>
                {promotions.map((promo) => (
                  <option key={promo} value={promo}>
                    {promo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut aujourd'hui
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
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>
        </div>
      </div>

      {/* Liste des stagiaires */}
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
                    Stagiaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aujourd'hui
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStagiaires.map((stagiaire) => (
                  <tr key={stagiaire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {stagiaire.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`http://127.0.0.1:8000/storage/${stagiaire.photo}`}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {stagiaire.prenom[0]}{stagiaire.nom[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {stagiaire.prenom} {stagiaire.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stagiaire.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{stagiaire.promotion}</div>
                      {stagiaire.date_debut && (
                        <div className="text-xs text-gray-500">
                          Depuis {new Date(stagiaire.date_debut).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stagiaire.telephone && (
                        <div className="text-sm text-gray-900">{stagiaire.telephone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="mb-2">
                        {getStatusBadge(stagiaire.statut_aujourdhui)}
                      </div>
                      {stagiaire.heure_arrivee && (
                        <div className="text-xs text-gray-500">
                          Arrivée: {stagiaire.heure_arrivee}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Retards:</span>
                          <span className="text-sm font-medium text-yellow-600">
                            {stagiaire.total_retards}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Présence:</span>
                          <span className={`text-sm font-medium ${getPerformanceColor(stagiaire.moyenne_presence || 100)}`}>
                            {stagiaire.moyenne_presence || 100}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedStagiaire(stagiaire);
                          setModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => handleShowQRForStagiaire(stagiaire)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Afficher QR code pour ce stagiaire"
                      >
                        <QrCodeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStagiaires.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun stagiaire trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de détails stagiaire */}
      <StagiaireDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        stagiaire={selectedStagiaire}
      />

      {/* Modal QR Code */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrCode={qrCode}
        validite={qrValidite}
        stagiaire={showQRForStagiaire}
        onRegenerate={handleRegenerateQR}
        onDownload={handleDownloadQR}
      />
    </div>
  );
};

export default StagiairesPage;