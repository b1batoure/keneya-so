import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Eye, Edit2, X, FlaskConical, Clock, CheckCircle, FileText } from 'lucide-react';
import { Examen } from '@/types';

export function LaboratoireList() {
  const { examens, patients, personnel, addExamen, updateExamen } = useData();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null);
  const [resultat, setResultat] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    patientNom: '',
    type: '',
    description: '',
    medecinPrescripteur: '',
    laborantin: ''
  });

  const medecins = personnel.filter(p => p.type === 'medecin');

  const filteredExamens = examens.filter(e => {
    const matchSearch = e.patientNom.toLowerCase().includes(search.toLowerCase()) ||
                       e.type.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || e.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const sortedExamens = [...filteredExamens].sort((a, b) =>
    new Date(b.datePrelevement).getTime() - new Date(a.datePrelevement).getTime()
  );

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientNom: patient ? `${patient.nom} ${patient.prenom}` : ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExamen({
      ...formData,
      datePrelevement: new Date().toISOString().split('T')[0],
      statut: 'en_attente'
    });
    setShowAddModal(false);
    setFormData({
      patientId: '',
      patientNom: '',
      type: '',
      description: '',
      medecinPrescripteur: '',
      laborantin: ''
    });
  };

  const handleStartExamen = (id: string) => {
    updateExamen(id, { statut: 'en_cours' });
  };

  const openResultModal = (examen: Examen) => {
    setSelectedExamen(examen);
    setResultat(examen.resultat || '');
    setShowResultModal(true);
  };

  const handleSaveResult = () => {
    if (selectedExamen) {
      updateExamen(selectedExamen.id, {
        statut: 'termine',
        resultat,
        dateResultat: new Date().toISOString().split('T')[0]
      });
      setShowResultModal(false);
      setSelectedExamen(null);
    }
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      en_cours: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FlaskConical },
      termine: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle }
    };
    const badge = badges[statut] || badges.en_attente;
    const Icon = badge.icon;
    const labels: Record<string, string> = {
      en_attente: 'En attente',
      en_cours: 'En cours',
      termine: 'Terminé'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {labels[statut]}
      </span>
    );
  };

  const stats = {
    total: examens.length,
    enAttente: examens.filter(e => e.statut === 'en_attente').length,
    enCours: examens.filter(e => e.statut === 'en_cours').length,
    termines: examens.filter(e => e.statut === 'termine').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laboratoire</h1>
          <p className="text-gray-500">Gestion des examens et analyses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel examen
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total examens</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">En cours</p>
          <p className="text-2xl font-bold text-blue-600">{stats.enCours}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Terminés</p>
          <p className="text-2xl font-bold text-green-600">{stats.termines}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou type d'examen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="all">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prescripteur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedExamens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Aucun examen trouvé
                  </td>
                </tr>
              ) : (
                sortedExamens.map((examen) => (
                  <tr key={examen.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">
                      {new Date(examen.datePrelevement).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {examen.patientNom}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{examen.type}</p>
                        <p className="text-xs text-gray-500">{examen.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {examen.medecinPrescripteur}
                    </td>
                    <td className="px-4 py-3">
                      {getStatutBadge(examen.statut)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {examen.statut === 'en_attente' && (
                          <button
                            onClick={() => handleStartExamen(examen.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                            title="Démarrer"
                          >
                            Démarrer
                          </button>
                        )}
                        {examen.statut === 'en_cours' && (
                          <button
                            onClick={() => openResultModal(examen)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Saisir résultat"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {examen.statut === 'termine' && (
                          <button
                            onClick={() => { setSelectedExamen(examen); setShowDetailModal(true); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Voir résultat"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Nouvel Examen</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'examen *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="Analyse sanguine">Analyse sanguine</option>
                  <option value="Analyse urinaire">Analyse urinaire</option>
                  <option value="Radiographie">Radiographie</option>
                  <option value="Échographie">Échographie</option>
                  <option value="Scanner">Scanner</option>
                  <option value="IRM">IRM</option>
                  <option value="ECG">ECG</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Détails de l'examen..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Médecin prescripteur *</label>
                <select
                  value={formData.medecinPrescripteur}
                  onChange={(e) => setFormData(p => ({ ...p, medecinPrescripteur: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  required
                >
                  <option value="">Sélectionner</option>
                  {medecins.map(m => (
                    <option key={m.id} value={`Dr. ${m.nom} ${m.prenom}`}>
                      Dr. {m.nom} {m.prenom}
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Prescrire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && selectedExamen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Saisir le résultat</h3>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Patient: <span className="text-gray-800 font-medium">{selectedExamen.patientNom}</span></p>
                <p className="text-sm text-gray-500">Examen: <span className="text-gray-800 font-medium">{selectedExamen.type}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Résultat *</label>
                <textarea
                  value={resultat}
                  onChange={(e) => setResultat(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Saisir le résultat de l'examen..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveResult}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedExamen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Résultat d'examen
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient</p>
                  <p className="font-medium text-gray-800">{selectedExamen.patientNom}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-800">{selectedExamen.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date prélèvement</p>
                  <p className="font-medium text-gray-800">
                    {new Date(selectedExamen.datePrelevement).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date résultat</p>
                  <p className="font-medium text-gray-800">
                    {selectedExamen.dateResultat 
                      ? new Date(selectedExamen.dateResultat).toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Prescripteur</p>
                <p className="text-gray-800">{selectedExamen.medecinPrescripteur}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm font-medium text-green-800 mb-2">Résultat:</p>
                <p className="text-green-700 whitespace-pre-wrap">{selectedExamen.resultat}</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
