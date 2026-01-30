import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Plus,
  X,
  Stethoscope,
  FileDown
} from 'lucide-react';
import { exportPatientDossierPDF } from '@/utils/pdfExport';

export function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, addConsultation, getMedecins } = useData();
  const { user } = useAuth();
  const [showAddConsultation, setShowAddConsultation] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    medecinId: '',
    medecinNom: '',
    diagnostic: '',
    traitement: '',
    notes: ''
  });

  const patient = patients.find(p => p.id === id);
  const medecins = getMedecins();

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient non trouvé</p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleMedecinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medecinId = e.target.value;
    const medecin = medecins.find(m => m.id === medecinId);
    setConsultationForm(prev => ({
      ...prev,
      medecinId,
      medecinNom: medecin ? `Dr. ${medecin.nom} ${medecin.prenom}` : ''
    }));
  };

  const handleAddConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    addConsultation(patient.id, {
      ...consultationForm,
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddConsultation(false);
    setConsultationForm({
      medecinId: '',
      medecinNom: '',
      diagnostic: '',
      traitement: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dossier Patient</h1>
            <p className="text-gray-500">{patient.numeroDossier}</p>
          </div>
        </div>
        <button
          onClick={() => exportPatientDossierPDF(patient)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FileDown className="w-5 h-5" />
          Exporter PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                patient.sexe === 'M' ? 'bg-blue-100' : 'bg-pink-100'
              }`}>
                <User className={`w-10 h-10 ${
                  patient.sexe === 'M' ? 'text-blue-600' : 'text-pink-600'
                }`} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">
                {patient.nom} {patient.prenom}
              </h2>
              <span className={`inline-flex px-3 py-1 mt-2 text-sm font-medium rounded-full ${
                patient.sexe === 'M' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {patient.sexe === 'M' ? 'Masculin' : 'Féminin'} • {calculateAge(patient.dateNaissance)} ans
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="text-gray-800">{new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="text-gray-800">{patient.telephone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="text-gray-800">{patient.adresse}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date d'admission</p>
                  <p className="text-gray-800">{new Date(patient.dateAdmission).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Historique des consultations
              </h2>
              {(user?.role === 'admin' || user?.role === 'medecin') && (
                <button
                  onClick={() => setShowAddConsultation(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle consultation
                </button>
              )}
            </div>

            <div className="p-4">
              {patient.consultations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune consultation enregistrée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...patient.consultations].reverse().map((consultation) => (
                    <div
                      key={consultation.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-800">{consultation.medecinNom}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(consultation.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Diagnostic</p>
                          <p className="text-gray-800">{consultation.diagnostic}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Traitement</p>
                          <p className="text-gray-800">{consultation.traitement}</p>
                        </div>
                        {consultation.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Notes</p>
                            <p className="text-gray-800">{consultation.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Consultation Modal */}
      {showAddConsultation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Nouvelle Consultation</h3>
              <button
                onClick={() => setShowAddConsultation(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddConsultation} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médecin <span className="text-red-500">*</span>
                </label>
                <select
                  value={consultationForm.medecinId}
                  onChange={handleMedecinChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecins.map(m => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.nom} {m.prenom} - {m.specialite}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnostic <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={consultationForm.diagnostic}
                  onChange={(e) => setConsultationForm(prev => ({ ...prev, diagnostic: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Diagnostic médical"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traitement <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={consultationForm.traitement}
                  onChange={(e) => setConsultationForm(prev => ({ ...prev, traitement: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Prescription et traitement"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes complémentaires
                </label>
                <textarea
                  value={consultationForm.notes}
                  onChange={(e) => setConsultationForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Notes ou observations"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddConsultation(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
