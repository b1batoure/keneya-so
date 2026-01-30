import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, X, AlertTriangle, Clock, UserCheck, LogOut, Siren } from 'lucide-react';
import { Urgence } from '@/types';

export function UrgencesList() {
  const { urgences, patients, personnel, addUrgence, updateUrgence, deleteUrgence } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    patientNom: '',
    patientId: '',
    motif: '',
    niveau: 3 as Urgence['niveau'],
    observations: ''
  });

  const medecins = personnel.filter(p => p.type === 'medecin');

  const sortedUrgences = [...urgences].sort((a, b) => {
    // D'abord par statut (en_cours puis en_attente)
    if (a.statut === 'en_cours' && b.statut !== 'en_cours') return -1;
    if (b.statut === 'en_cours' && a.statut !== 'en_cours') return 1;
    if (a.statut === 'en_attente' && b.statut !== 'en_attente') return -1;
    if (b.statut === 'en_attente' && a.statut !== 'en_attente') return 1;
    // Puis par niveau (1 = le plus urgent)
    return a.niveau - b.niveau;
  });

  const activeUrgences = urgences.filter(u => u.statut === 'en_attente' || u.statut === 'en_cours');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    addUrgence({
      ...formData,
      dateArrivee: now.toISOString().split('T')[0],
      heureArrivee: now.toTimeString().slice(0, 5),
      statut: 'en_attente'
    });
    setShowAddModal(false);
    setFormData({
      patientNom: '',
      patientId: '',
      motif: '',
      niveau: 3,
      observations: ''
    });
  };

  const handlePriseEnCharge = (id: string, medecinId: string, medecinNom: string) => {
    updateUrgence(id, { statut: 'en_cours', medecinId, medecinNom });
  };

  const handleSortie = (id: string) => {
    if (confirm('Confirmer la sortie du patient ?')) {
      updateUrgence(id, { statut: 'sorti' });
    }
  };

  const handleTransfert = (id: string) => {
    if (confirm('Transférer ce patient vers un autre service ?')) {
      updateUrgence(id, { statut: 'transfere' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette urgence ?')) {
      deleteUrgence(id);
    }
  };

  const getNiveauBadge = (niveau: number) => {
    const config: Record<number, { bg: string; text: string; label: string }> = {
      1: { bg: 'bg-red-600', text: 'text-white', label: 'CRITIQUE' },
      2: { bg: 'bg-orange-500', text: 'text-white', label: 'URGENT' },
      3: { bg: 'bg-yellow-400', text: 'text-yellow-900', label: 'MODÉRÉ' },
      4: { bg: 'bg-green-500', text: 'text-white', label: 'FAIBLE' },
      5: { bg: 'bg-blue-400', text: 'text-white', label: 'MINEUR' }
    };
    const cfg = config[niveau] || config[3];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  };

  const getStatutBadge = (statut: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      en_cours: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En cours' },
      transfere: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Transféré' },
      sorti: { bg: 'bg-green-100', text: 'text-green-700', label: 'Sorti' }
    };
    const cfg = config[statut] || config.en_attente;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Siren className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Urgences</h1>
            <p className="text-gray-500">{activeUrgences.length} cas actifs</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle urgence
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(niveau => {
          const count = activeUrgences.filter(u => u.niveau === niveau).length;
          const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-yellow-100 text-yellow-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600'];
          const labels = ['Critique', 'Urgent', 'Modéré', 'Faible', 'Mineur'];
          return (
            <div key={niveau} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className={`text-xs font-medium ${colors[niveau - 1].split(' ')[1]}`}>Niveau {niveau}</p>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
              <p className="text-xs text-gray-500">{labels[niveau - 1]}</p>
            </div>
          );
        })}
      </div>

      {/* Liste des urgences */}
      <div className="space-y-4">
        {sortedUrgences.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune urgence en cours</p>
          </div>
        ) : (
          sortedUrgences.map((urgence) => (
            <div
              key={urgence.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${
                urgence.niveau === 1 ? 'border-l-red-600' :
                urgence.niveau === 2 ? 'border-l-orange-500' :
                urgence.niveau === 3 ? 'border-l-yellow-400' :
                urgence.niveau === 4 ? 'border-l-green-500' : 'border-l-blue-400'
              } ${urgence.statut === 'sorti' || urgence.statut === 'transfere' ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {getNiveauBadge(urgence.niveau)}
                    {getStatutBadge(urgence.statut)}
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {urgence.heureArrivee}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 text-lg">{urgence.patientNom}</h3>
                  <p className="text-gray-600 mt-1">{urgence.motif}</p>
                  
                  {urgence.observations && (
                    <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                      {urgence.observations}
                    </p>
                  )}
                  
                  {urgence.medecinNom && (
                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      Pris en charge par: {urgence.medecinNom}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {urgence.statut === 'en_attente' && (
                    <div className="flex flex-col gap-2">
                      <select
                        onChange={(e) => {
                          const med = medecins.find(m => m.id === e.target.value);
                          if (med) {
                            handlePriseEnCharge(urgence.id, med.id, `Dr. ${med.nom}`);
                          }
                        }}
                        className="px-3 py-2 border border-blue-300 rounded-lg text-sm text-black bg-blue-50"
                        defaultValue=""
                      >
                        <option value="" disabled>Assigner médecin</option>
                        {medecins.map(m => (
                          <option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {urgence.statut === 'en_cours' && (
                    <>
                      <button
                        onClick={() => handleSortie(urgence.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Sortie
                      </button>
                      <button
                        onClick={() => handleTransfert(urgence.id)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                      >
                        Transférer
                      </button>
                    </>
                  )}
                  
                  {(urgence.statut === 'sorti' || urgence.statut === 'transfere') && (
                    <button
                      onClick={() => handleDelete(urgence.id)}
                      className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg"
                    >
                      Archiver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-600" />
                Nouvelle Urgence
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient existant (optionnel)
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => {
                    const patient = patients.find(p => p.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      patientId: e.target.value,
                      patientNom: patient ? `${patient.nom} ${patient.prenom}` : prev.patientNom
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                >
                  <option value="">Nouveau patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                  ))}
                </select>
              </div>

              {!formData.patientId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du patient *</label>
                  <input
                    type="text"
                    value={formData.patientNom}
                    onChange={(e) => setFormData(p => ({ ...p, patientNom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="Nom du patient ou inconnu"
                    required={!formData.patientId}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
                <input
                  type="text"
                  value={formData.motif}
                  onChange={(e) => setFormData(p => ({ ...p, motif: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Raison de l'admission en urgence"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'urgence *</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const colors = [
                      'border-red-500 bg-red-50 text-red-700',
                      'border-orange-500 bg-orange-50 text-orange-700',
                      'border-yellow-500 bg-yellow-50 text-yellow-700',
                      'border-green-500 bg-green-50 text-green-700',
                      'border-blue-500 bg-blue-50 text-blue-700'
                    ];
                    const labels = ['1', '2', '3', '4', '5'];
                    const selected = formData.niveau === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, niveau: n as Urgence['niveau'] }))}
                        className={`p-3 rounded-lg border-2 text-center font-bold transition-all ${
                          selected ? colors[n - 1] + ' ring-2 ring-offset-1' : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                      >
                        {labels[n - 1]}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                  <span>Critique</span>
                  <span>Mineur</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData(p => ({ ...p, observations: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Observations initiales..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
