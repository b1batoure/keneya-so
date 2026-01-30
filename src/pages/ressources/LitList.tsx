import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, X, Bed, User, Calendar, LogOut } from 'lucide-react';

export function LitList() {
  const { lits, salles, patients, addLit, updateLit, assignerLit, libererLit } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLit, setSelectedLit] = useState<string | null>(null);
  const [filterSalle, setFilterSalle] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');

  const [formData, setFormData] = useState({
    numero: '',
    salleId: '',
    salleNumero: ''
  });

  const [assignForm, setAssignForm] = useState({
    patientId: '',
    patientNom: '',
    dateSortiePrevue: ''
  });

  const hospitalisationSalles = salles.filter(s => s.type === 'hospitalisation');

  const filteredLits = lits.filter(l => {
    const matchSalle = filterSalle === 'all' || l.salleId === filterSalle;
    const matchStatut = filterStatut === 'all' || l.statut === filterStatut;
    return matchSalle && matchStatut;
  });

  const handleSalleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const salleId = e.target.value;
    const salle = salles.find(s => s.id === salleId);
    setFormData(prev => ({
      ...prev,
      salleId,
      salleNumero: salle ? salle.numero : ''
    }));
  };

  const handleAddLit = (e: React.FormEvent) => {
    e.preventDefault();
    addLit({
      numero: formData.numero,
      salleId: formData.salleId,
      salleNumero: formData.salleNumero,
      statut: 'libre'
    });
    setShowAddModal(false);
    setFormData({ numero: '', salleId: '', salleNumero: '' });
  };

  const openAssignModal = (litId: string) => {
    setSelectedLit(litId);
    setAssignForm({ patientId: '', patientNom: '', dateSortiePrevue: '' });
    setShowAssignModal(true);
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    setAssignForm(prev => ({
      ...prev,
      patientId,
      patientNom: patient ? `${patient.nom} ${patient.prenom}` : ''
    }));
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLit) {
      assignerLit(selectedLit, assignForm.patientId, assignForm.patientNom, assignForm.dateSortiePrevue);
    }
    setShowAssignModal(false);
    setSelectedLit(null);
  };

  const handleLiberer = (litId: string) => {
    if (confirm('Libérer ce lit ?')) {
      libererLit(litId);
    }
  };

  const handleChangeStatut = (litId: string, statut: 'libre' | 'reserve' | 'maintenance') => {
    updateLit(litId, { statut });
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      libre: { bg: 'bg-green-100', text: 'text-green-700' },
      occupe: { bg: 'bg-red-100', text: 'text-red-700' },
      reserve: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      maintenance: { bg: 'bg-gray-100', text: 'text-gray-700' }
    };
    const badge = badges[statut] || badges.libre;
    const labels: Record<string, string> = {
      libre: 'Libre',
      occupe: 'Occupé',
      reserve: 'Réservé',
      maintenance: 'Maintenance'
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
        {labels[statut]}
      </span>
    );
  };

  const stats = {
    total: lits.length,
    libres: lits.filter(l => l.statut === 'libre').length,
    occupes: lits.filter(l => l.statut === 'occupe').length,
    reserves: lits.filter(l => l.statut === 'reserve').length,
    maintenance: lits.filter(l => l.statut === 'maintenance').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Lits</h1>
          <p className="text-gray-500">{lits.length} lits au total</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau lit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Libres</p>
          <p className="text-2xl font-bold text-green-600">{stats.libres}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Occupés</p>
          <p className="text-2xl font-bold text-red-600">{stats.occupes}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Réservés</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.reserves}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Maintenance</p>
          <p className="text-2xl font-bold text-gray-600">{stats.maintenance}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterSalle}
          onChange={(e) => setFilterSalle(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="all">Toutes les salles</option>
          {hospitalisationSalles.map(s => (
            <option key={s.id} value={s.id}>{s.numero}</option>
          ))}
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
        >
          <option value="all">Tous les statuts</option>
          <option value="libre">Libre</option>
          <option value="occupe">Occupé</option>
          <option value="reserve">Réservé</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Lits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredLits.map((lit) => (
          <div
            key={lit.id}
            className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-colors ${
              lit.statut === 'occupe' ? 'border-red-200' :
              lit.statut === 'reserve' ? 'border-yellow-200' :
              lit.statut === 'maintenance' ? 'border-gray-300' :
              'border-green-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bed className={`w-5 h-5 ${
                  lit.statut === 'occupe' ? 'text-red-500' :
                  lit.statut === 'reserve' ? 'text-yellow-500' :
                  lit.statut === 'maintenance' ? 'text-gray-500' :
                  'text-green-500'
                }`} />
                <span className="font-bold text-gray-800">{lit.numero}</span>
              </div>
              {getStatutBadge(lit.statut)}
            </div>

            <p className="text-sm text-gray-500 mb-3">Salle: {lit.salleNumero}</p>

            {lit.statut === 'occupe' && lit.patientNom && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-800">{lit.patientNom}</span>
                </div>
                {lit.dateEntree && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    Entrée: {new Date(lit.dateEntree).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {lit.dateSortiePrevue && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    Sortie prévue: {new Date(lit.dateSortiePrevue).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {lit.statut === 'libre' && (
                <>
                  <button
                    onClick={() => openAssignModal(lit.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Assigner
                  </button>
                  <button
                    onClick={() => handleChangeStatut(lit.id, 'reserve')}
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Réserver
                  </button>
                </>
              )}
              {lit.statut === 'occupe' && (
                <button
                  onClick={() => handleLiberer(lit.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Libérer
                </button>
              )}
              {lit.statut === 'reserve' && (
                <>
                  <button
                    onClick={() => openAssignModal(lit.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Assigner
                  </button>
                  <button
                    onClick={() => handleChangeStatut(lit.id, 'libre')}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </>
              )}
              {lit.statut === 'maintenance' && (
                <button
                  onClick={() => handleChangeStatut(lit.id, 'libre')}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Disponible
                </button>
              )}
              {lit.statut !== 'occupe' && lit.statut !== 'maintenance' && (
                <button
                  onClick={() => handleChangeStatut(lit.id, 'maintenance')}
                  className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  title="Maintenance"
                >
                  🔧
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredLits.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bed className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun lit trouvé</p>
        </div>
      )}

      {/* Add Lit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Nouveau Lit</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddLit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro du lit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ex: L-201-5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.salleId}
                  onChange={handleSalleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="">Sélectionner une salle</option>
                  {hospitalisationSalles.map(s => (
                    <option key={s.id} value={s.id}>{s.numero} - {s.type}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
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
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Assigner le lit</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.patientId}
                  onChange={handlePatientChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} {p.prenom} - {p.numeroDossier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de sortie prévue <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={assignForm.dateSortiePrevue}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, dateSortiePrevue: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Assigner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
