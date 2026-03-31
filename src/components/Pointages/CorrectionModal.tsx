import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Pointage {
  id: number;
  user_id: number;
  date: string;
  heure_arrivee: string | null;
  heure_sortie: string | null;
  statut: 'present' | 'retard' | 'absent' | 'justifie';
  note: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pointage: Pointage | null;
  onSave: (data: any) => void;
}

const CorrectionModal: React.FC<Props> = ({ isOpen, onClose, pointage, onSave }) => {
  const [formData, setFormData] = useState({
    statut: 'present',
    heure_arrivee: '',
    heure_sortie: '',
    note: '',
    justificatif: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pointage) {
      // Formater les heures existantes (enlever les secondes pour l'affichage)
      const formatHeureForInput = (heure: string | null) => {
        if (!heure) return '';
        // Si l'heure est au format "HH:MM:SS", on prend seulement "HH:MM"
        if (heure.length >= 5) {
          return heure.substring(0, 5);
        }
        return heure;
      };

      setFormData({
        statut: pointage.statut,
        heure_arrivee: formatHeureForInput(pointage.heure_arrivee),
        heure_sortie: formatHeureForInput(pointage.heure_sortie),
        note: pointage.note || '',
        justificatif: null,
      });
    }
  }, [pointage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ CORRECTION: Formater les heures avec les secondes pour l'API
      const dataToSend: any = {
        statut: formData.statut,
        note: formData.note,
      };

      // Ajouter l'heure d'arrivée avec le format HH:MM:SS
      if (formData.heure_arrivee) {
        dataToSend.heure_arrivee = `${formData.heure_arrivee}:00`;
      }

      // Ajouter l'heure de départ avec le format HH:MM:SS
      if (formData.heure_sortie) {
        dataToSend.heure_sortie = `${formData.heure_sortie}:00`;
      }

      // S'il y a un justificatif, utiliser FormData
      if (formData.justificatif) {
        const formDataToSend = new FormData();
        formDataToSend.append('statut', dataToSend.statut);
        formDataToSend.append('note', dataToSend.note || '');
        
        if (dataToSend.heure_arrivee) {
          formDataToSend.append('heure_arrivee', dataToSend.heure_arrivee);
        }
        if (dataToSend.heure_sortie) {
          formDataToSend.append('heure_sortie', dataToSend.heure_sortie);
        }
        formDataToSend.append('justificatif', formData.justificatif);
        
        onSave(formDataToSend);
      } else {
        onSave(dataToSend);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setFormData({ ...formData, justificatif: file });
    }
  };

  const removeJustificatif = () => {
    setFormData({ ...formData, justificatif: null });
  };

  if (!pointage) return null;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Corriger le pointage du {new Date(pointage.date).toLocaleDateString('fr-FR')}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="present">✅ Présent</option>
                      <option value="retard">⚠️ Retard</option>
                      <option value="absent">❌ Absent</option>
                      <option value="justifie">📄 Justifié</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure arrivée
                      </label>
                      <input
                        type="time"
                        value={formData.heure_arrivee}
                        onChange={(e) => setFormData({ ...formData, heure_arrivee: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure départ
                      </label>
                      <input
                        type="time"
                        value={formData.heure_sortie}
                        onChange={(e) => setFormData({ ...formData, heure_sortie: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ajouter une note..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Justificatif (PDF, image max 5MB)
                    </label>
                    {formData.justificatif ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-600">{formData.justificatif.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeJustificatif}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <span>Enregistrer</span>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CorrectionModal;