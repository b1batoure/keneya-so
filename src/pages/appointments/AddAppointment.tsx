import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Save, ArrowLeft, Calendar } from 'lucide-react';

export function AddAppointment() {
  const navigate = useNavigate();
  const { patients, getMedecins, addRendezVous } = useData();
  const medecins = getMedecins();

  const [formData, setFormData] = useState({
    patientId: '',
    patientNom: '',
    medecinId: '',
    medecinNom: '',
    date: new Date().toISOString().split('T')[0],
    heure: '09:00',
    motif: '',
    statut: 'planifie' as const
  });

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientNom: patient ? `${patient.nom} ${patient.prenom}` : ''
    }));
  };

  const handleMedecinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medecinId = e.target.value;
    const medecin = medecins.find(m => m.id === medecinId);
    setFormData(prev => ({
      ...prev,
      medecinId,
      medecinNom: medecin ? `Dr. ${medecin.nom} ${medecin.prenom}` : ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRendezVous(formData);
    navigate('/rendez-vous');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rendez-vous')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nouveau Rendez-vous</h1>
          <p className="text-gray-500">Planifier un rendez-vous</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Détails du rendez-vous</h2>
            <p className="text-sm text-gray-500">Renseignez les informations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patientId}
              onChange={handlePatientChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nom} {p.prenom} - {p.numeroDossier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médecin <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.medecinId}
              onChange={handleMedecinChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            >
              <option value="">Sélectionner un médecin</option>
              {medecins.map(m => (
                <option key={m.id} value={m.id}>
                  Dr. {m.nom} {m.prenom} {m.specialite && `- ${m.specialite}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.heure}
              onChange={(e) => setFormData(prev => ({ ...prev, heure: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
            >
              {Array.from({ length: 10 }, (_, i) => {
                const hour = 8 + i;
                return (
                  <>
                    <option key={`${hour}:00`} value={`${String(hour).padStart(2, '0')}:00`}>
                      {String(hour).padStart(2, '0')}:00
                    </option>
                    <option key={`${hour}:30`} value={`${String(hour).padStart(2, '0')}:30`}>
                      {String(hour).padStart(2, '0')}:30
                    </option>
                  </>
                );
              })}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de la consultation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.motif}
              onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Décrivez le motif du rendez-vous..."
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/rendez-vous')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            Planifier
          </button>
        </div>
      </form>
    </div>
  );
}
