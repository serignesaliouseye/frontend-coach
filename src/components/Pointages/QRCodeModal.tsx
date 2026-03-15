import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string | null;
  validite: any;
  stagiaire?: any;
  onRegenerate: () => void;
  onDownload: () => void;
}

const QRCodeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  qrCode,
  validite,
  stagiaire,
  onRegenerate,
  onDownload,
}) => {
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
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {stagiaire 
                      ? `QR Code pour ${stagiaire.prenom} ${stagiaire.nom}`
                      : 'QR Code de pointage'
                    }
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {qrCode ? (
                  <div className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <img 
                          src={qrCode} 
                          alt="QR Code" 
                          className="w-64 h-64"
                        />
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Valable le {new Date(validite?.date_validite).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-lg font-medium text-indigo-600">
                        de {validite?.heure_debut} à {validite?.heure_fin}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <p className="text-sm text-indigo-900">
                        <span className="font-medium">À faire :</span>
                      </p>
                      <ul className="mt-2 text-sm text-indigo-700 list-disc list-inside">
                        <li>Ouvrir l'application mobile</li>
                        <li>Aller dans l'onglet "Scanner"</li>
                        <li>Scanner ce QR code</li>
                      </ul>
                    </div>

                    {/* Boutons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={onDownload}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Télécharger
                      </button>
                      <button
                        onClick={onRegenerate}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Régénérer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucun QR code généré</p>
                    <button
                      onClick={onRegenerate}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Générer un QR code
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default QRCodeModal;