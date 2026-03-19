import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
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
  // États principaux
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [filteredStagiaires, setFilteredStagiaires] = useState<Stagiaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState<string>('toutes');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [promotions, setPromotions] = useState<string[]>([]);
  
  // États pour les modals
  const [selectedStagiaire, setSelectedStagiaire] = useState<Stagiaire | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [showQRForStagiaire, setShowQRForStagiaire] = useState<Stagiaire | null>(null);
  
  // États pour le QR code
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrValidite, setQrValidite] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  // Chargement initial des données
  useEffect(() => {
    loadStagiaires();
    loadQRCode();
  }, []);

  // Filtrage quand les critères changent
  useEffect(() => {
    filterStagiaires();
  }, [searchTerm, selectedPromotion, selectedStatut, stagiaires]);

  // Charger les stagiaires
  const loadStagiaires = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pointageService.getStagiaires();
      console.log('✅ Données reçues:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setStagiaires(data);
        
        // Extraire les promotions uniques
        const uniquePromos = [...new Set(data.map((s: Stagiaire) => s.promotion))].filter(Boolean) as string[];
        setPromotions(uniquePromos);
      } else {
        console.log('ℹ️ Aucun stagiaire trouvé');
        setStagiaires([]);
        setPromotions([]);
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement stagiaires:', error);
      setError(error.message || 'Erreur lors du chargement des stagiaires');
    } finally {
      setLoading(false);
    }
  };

  // Charger le QR code
  const loadQRCode = async () => {
    setQrError(null);
    try {
      const response = await api.get('/qr-codes/actuel');
      console.log('📱 QR Code reçu:', response.data);
      
      // Adapter selon le format de réponse
      const qrData = response.data?.data || response.data;
      
      if (qrData?.qr_code) {
        const qrBase64 = qrData.qr_code;
        setQrCode(qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`);
        setQrValidite(qrData);
      } else {
        setQrCode(null);
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement QR code:', error);
      setQrError(error.response?.data?.message || 'Erreur de chargement du QR code');
      setQrCode(null);
    }
  };

  // Générer un nouveau QR code
  const handleRegenerateQR = async () => {
    setQrLoading(true);
    setQrError(null);
    try {
      const response = await api.post('/qr-codes/generer');
      console.log('🆕 QR Code généré:', response.data);
      
      const qrData = response.data?.data || response.data;
      
      if (qrData?.qr_code) {
        const qrBase64 = qrData.qr_code;
        setQrCode(qrBase64.startsWith('data:') ? qrBase64 : `data:image/png;base64,${qrBase64}`);
        setQrValidite(qrData);
      }
    } catch (error: any) {
      console.error('❌ Erreur génération QR code:', error);
      setQrError(error.response?.data?.message || 'Erreur de génération du QR code');
    } finally {
      setQrLoading(false);
    }
  };

  // Télécharger le QR code
  const handleDownloadQR = () => {
    if (!qrCode) return;
    try {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
    }
  };

  // Afficher le QR pour un stagiaire spécifique
  const handleShowQRForStagiaire = (stagiaire: Stagiaire) => {
    setShowQRForStagiaire(stagiaire);
    setQrModalOpen(true);
  };

  // Filtrer les stagiaires
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

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedPromotion('toutes');
    setSelectedStatut('tous');
    setSearchTerm('');
  };

  // Obtenir l'URL complète de la photo
  const getPhotoUrl = (photo?: string) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('data:')) return photo;
    return `http://127.0.0.1:8000/storage/${photo}`;
  };

  // Obtenir le badge de statut
  const getStatusBadge = (statut: string) => {
    const classes: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      retard: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      justifie: 'bg-blue-100 text-blue-800',
    };
    const labels: Record<string, string> = {
      present: 'Présent',
      retard: 'Retard',
      absent: 'Absent',
      justifie: 'Justifié',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${classes[statut] || 'bg-gray-100 text-gray-800'}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  // Obtenir la couleur de performance
  const getPerformanceColor = (moyenne: number) => {
    if (moyenne >= 80) return 'text-green-600';
    if (moyenne >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Formater l'heure
  const formatHeure = (heure?: string) => {
    if (!heure) return '';
    return heure.length >= 5 ? heure.substring(0, 5) : heure;
  };

  // Calculer les statistiques
  const stats = {
    total: stagiaires.length,
    presents: stagiaires.filter(s => s.statut_aujourdhui === 'present').length,
    retards: stagiaires.filter(s => s.statut_aujourdhui === 'retard').length,
    absents: stagiaires.filter(s => s.statut_aujourdhui === 'absent').length,
    justifies: stagiaires.filter(s => s.statut_aujourdhui === 'justifie').length,
  };

  // Statistiques à afficher
  const statCards = [
    { label: 'Total', value: stats.total, color: 'text-gray-900' },
    { label: 'Présents', value: stats.presents, color: 'text-green-600' },
    { label: 'Retards', value: stats.retards, color: 'text-yellow-600' },
    { label: 'Absents', value: stats.absents, color: 'text-red-600' },
    { label: 'Justifiés', value: stats.justifies, color: 'text-blue-600' },
  ];

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadStagiaires}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec QR Code */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Mes Stagiaires</h1>

        {/* Widget QR Code */}
        <div className="bg-white rounded-lg shadow-sm p-4 w-full sm:w-auto">
          {qrLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <span className="text-sm text-gray-600">Génération...</span>
            </div>
          ) : qrCode ? (
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setQrModalOpen(true)} 
                className="relative group flex-shrink-0"
                title="Agrandir le QR code"
              >
                <div className="w-12 h-12 border-2 border-gray-200 rounded-lg overflow-hidden hover:border-indigo-500 transition-all">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erreur chargement image QR');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
              </button>

              <div className="text-xs flex-1">
                <p className="font-medium text-gray-900">QR Code du jour</p>
                <p className="text-gray-500">
                  {qrValidite?.heure_debut ? formatHeure(qrValidite.heure_debut) : '08:00'} -{' '}
                  {qrValidite?.heure_fin ? formatHeure(qrValidite.heure_fin) : '18:00'}
                </p>
                {qrError && <p className="text-red-600 text-xs mt-1">{qrError}</p>}
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Agrandir"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Télécharger"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleRegenerateQR}
                  disabled={qrLoading}
                  className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  title="Régénérer"
                >
                  <svg className={`h-5 w-5 ${qrLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleRegenerateQR}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-900 w-full justify-center"
            >
              <QrCodeIcon className="h-5 w-5" />
              <span>Générer QR code</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </button>

          {(selectedPromotion !== 'toutes' || selectedStatut !== 'tous' || searchTerm) && (
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promotion</label>
              <select
                value={selectedPromotion}
                onChange={(e) => setSelectedPromotion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="toutes">Toutes les promotions</option>
                {promotions.map((promo) => (
                  <option key={promo} value={promo}>{promo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut aujourd'hui</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      </div>

      {/* Liste des stagiaires */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredStagiaires.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">Aucun stagiaire trouvé</p>
            <p className="text-sm text-gray-400">
              {stagiaires.length === 0 
                ? "Vous n'avez pas encore de stagiaires assignés." 
                : "Aucun stagiaire ne correspond aux filtres sélectionnés."}
            </p>
          </div>
        ) : (
          <>
            {/* Version Desktop (table) */}
            <div className="hidden md:block overflow-x-auto">
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
                    <tr key={stagiaire.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {stagiaire.photo ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={getPhotoUrl(stagiaire.photo) || ''}
                                alt=""
                                onError={(e) => {
                                  console.error('Erreur chargement photo:', stagiaire.photo);
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
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {stagiaire.prenom} {stagiaire.nom}
                            </div>
                            <div className="text-sm text-gray-500">{stagiaire.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stagiaire.promotion}</div>
                        {stagiaire.date_debut && (
                          <div className="text-xs text-gray-500">
                            Depuis le {new Date(stagiaire.date_debut).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stagiaire.telephone && (
                          <div className="text-sm text-gray-900">{stagiaire.telephone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="mb-2">{getStatusBadge(stagiaire.statut_aujourdhui)}</div>
                        {stagiaire.heure_arrivee && (
                          <div className="text-xs text-gray-500">
                            Arrivée: {formatHeure(stagiaire.heure_arrivee)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Retards:</span>
                            <span className="text-sm font-medium text-yellow-600">{stagiaire.total_retards}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Présence:</span>
                            <span className={`text-sm font-medium ${getPerformanceColor(stagiaire.moyenne_presence || 0)}`}>
                              {stagiaire.moyenne_presence || 0}%
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
                          className="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => handleShowQRForStagiaire(stagiaire)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Afficher QR code"
                        >
                          <QrCodeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Version Mobile (cards) */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredStagiaires.map((stagiaire) => (
                <div key={stagiaire.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {stagiaire.photo ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={getPhotoUrl(stagiaire.photo) || ''}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {stagiaire.prenom[0]}{stagiaire.nom[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{stagiaire.prenom} {stagiaire.nom}</h3>
                          <p className="text-sm text-gray-500">{stagiaire.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{stagiaire.promotion}</p>
                        </div>
                        {getStatusBadge(stagiaire.statut_aujourdhui)}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-4">
                        {stagiaire.telephone && (
                          <div className="text-xs text-gray-600">📞 {stagiaire.telephone}</div>
                        )}
                        {stagiaire.heure_arrivee && (
                          <div className="text-xs text-gray-600">🕐 Arrivée: {formatHeure(stagiaire.heure_arrivee)}</div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs">
                          <span className="text-yellow-600 font-medium">{stagiaire.total_retards} retards</span>
                          <span className="mx-2">•</span>
                          <span className={getPerformanceColor(stagiaire.moyenne_presence || 0)}>
                            {stagiaire.moyenne_presence || 0}% présence
                          </span>
                        </div>
                        <div className="space-x-3">
                          <button
                            onClick={() => { 
                              setSelectedStagiaire(stagiaire); 
                              setModalOpen(true); 
                            }}
                            className="text-indigo-600 text-sm hover:text-indigo-900"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => handleShowQRForStagiaire(stagiaire)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <QrCodeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <StagiaireDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        stagiaire={selectedStagiaire}
      />

      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => { 
          setQrModalOpen(false); 
          setShowQRForStagiaire(null); 
        }}
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