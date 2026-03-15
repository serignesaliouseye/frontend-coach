import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  date_fin_suspension: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sanction: Sanction | null;
  stagiaires: Stagiaire[];
  onSave: (data: any) => void;
}

const SanctionFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sanction,
  stagiaires,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    stagiaire_id: '',
    niveau: 'avertissement',
    motif: '',
    description: '',
    date_fin_suspension: '',
  });

  useEffect(() => {
    if (sanction) {
      setFormData({
        stagiaire_id: sanction.stagiaire_id.toString(),
        niveau: sanction.niveau,
        motif: sanction.motif,
        description: sanction.description,
        date_fin_suspension: sanction.date_fin_suspension || '',
      });
    } else {
      setFormData({
        stagiaire_id: '',
        niveau: 'avertissement',
        motif: '',
        description: '',
        date_fin_suspension: '',
      });
    }
  }, [sanction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      stagiaire_id: parseInt(formData.stagiaire_id),
    });
  };

  const showDateFin = formData.niveau === 'suspension';

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
                    {sanction ? 'Modifier la sanction' : 'Nouvelle sanction'}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stagiaire *
                    </label>
                    <select
                      value={formData.stagiaire_id}
                      onChange={(e) => setFormData({ ...formData, stagiaire_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sélectionner un stagiaire</option>
                      {stagiaires.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.prenom} {s.nom} - {s.promotion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau *
                    </label>
                    <select
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="avertissement">Avertissement</option>
                      <option value="blame">Blâme</option>
                      <option value="suspension">Suspension</option>
                      <option value="exclusion">Exclusion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif *
                    </label>
                    <input
                      type="text"
                      value={formData.motif}
                      onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Ex: Retards répétés"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Description détaillée..."
                    />
                  </div>

                  {showDateFin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date fin de suspension *
                      </label>
                      <input
                        type="date"
                        value={formData.date_fin_suspension}
                        onChange={(e) => setFormData({ ...formData, date_fin_suspension: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {sanction ? 'Modifier' : 'Créer'}
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

export default SanctionFormModal;