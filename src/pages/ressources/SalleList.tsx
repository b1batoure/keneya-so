import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, Trash2, Edit2, X, Building, Users, Wrench } from 'lucide-react';

export function SalleList() {
  const { salles, lits, addSalle, updateSalle, deleteSalle } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingSalle, setEditingSalle] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    numero: '',
    type: 'consultation' as 'consultation' | 'operation' | 'urgence' | 'hospitalisation',
    capacite: 2,
    etage: 1,
    equipements: '',
    statut: 'disponible' as 'disponible' | 'occupee' | 'maintenance'
  });

  const resetForm = () => {
    setFormData({
      numero: '',
      type: 'consultation',
      capacite: 2,
      etage: 1,
      equipements: '',
      statut: 'disponible'
    });
    setEditingSalle(null);
  };

  const openEditModal = (salle: typeof salles[0]) => {
    setFormData({
      numero: salle.numero,
      type: salle.type,
      capacite: salle.capacite,
      etage: salle.etage,
      equipements: salle.equipements.join(', '),
      statut: salle.statut
    });
    setEditingSalle(salle.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salleData = {
      ...formData,
      equipements: formData.equipements.split(',').map(e => e.trim()).filter(e => e)
    };

    if (editingSalle) {
      updateSalle(editingSalle, salleData);
    } else {
      addSalle(salleData);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string, numero: string) => {
    const litsInSalle = lits.filter(l => l.salleId === id);
    if (litsInSalle.some(l => l.statut === 'occupe')) {
      alert('Impossible de supprimer une salle contenant des lits occupés');
      return;
    }
    if (confirm(`Supprimer la salle ${numero} ?`)) {
      deleteSalle(id);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      consultation: 'Consultation',
      operation: 'Opération',
      urgence: 'Urgence',
      hospitalisation: 'Hospitalisation'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      consultation: 'bg-blue-100 text-blue-700',
      operation: 'bg-purple-100 text-purple-700',
      urgence: 'bg-red-100 text-red-700',
      hospitalisation: 'bg-green-100 text-green-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { bg: string; text: string; icon: typeof Building }> = {
      disponible: { bg: 'bg-green-100', text: 'text-green-700', icon: Building },
      occupee: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Users },
      maintenance: { bg: 'bg-red-100', text: 'text-red-700', icon: Wrench }
    };
    const badge = badges[statut] || badges.disponible;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {statut.charAt(0).toUpperCase() + statut.slice(1)}
      </span>
    );
  };

  const getLitsCount = (salleId: string) => {
    const salleLits = lits.filter(l => l.salleId === salleId);
    const occupes = salleLits.filter(l => l.statut === 'occupe').length;
    return { total: salleLits.length, occupes };
  };

  const stats = {
    total: salles.length,
    disponibles: salles.filter(s => s.statut === 'disponible').length,
    occupees: salles.filter(s => s.statut === 'occupee').length,
    maintenance: salles.filter(s => s.statut === 'maintenance').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Salles</h1>
          <p className="text-gray-500">{salles.length} salles enregistrées</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle salle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total salles</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Occupées</p>
          <p className="text-2xl font-bold text-orange-600">{stats.occupees}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Maintenance</p>
          <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salles.map((salle) => {
          const litsInfo = getLitsCount(salle.id);
          return (
            <div key={salle.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{salle.numero}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded mt-1 ${getTypeColor(salle.type)}`}>
                    {getTypeLabel(salle.type)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(salle)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(salle.id, salle.numero)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Étage:</span>
                  <span className="text-gray-800 font-medium">{salle.etage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacité:</span>
                  <span className="text-gray-800 font-medium">{salle.capacite} places</span>
                </div>
                {salle.type === 'hospitalisation' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lits:</span>
                    <span className="text-gray-800 font-medium">
                      {litsInfo.occupes}/{litsInfo.total} occupés
                    </span>
                  </div>
                )}
              </div>

              {salle.equipements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Équipements:</p>
                  <div className="flex flex-wrap gap-1">
                    {salle.equipements.map((eq, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                {getStatutBadge(salle.statut)}
              </div>
            </div>
          );
        })}
      </div>

      {salles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune salle enregistrée</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingSalle ? 'Modifier la salle' : 'Nouvelle Salle'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de salle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ex: A-101"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as typeof formData.type }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="hospitalisation">Hospitalisation</option>
                    <option value="operation">Opération</option>
                    <option value="urgence">Urgence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as typeof formData.statut }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="occupee">Occupée</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Étage</label>
                  <input
                    type="number"
                    value={formData.etage}
                    onChange={(e) => setFormData(prev => ({ ...prev, etage: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
                  <input
                    type="number"
                    value={formData.capacite}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacite: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipements (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.equipements}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipements: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ex: ECG, Tensiomètre, Stéthoscope"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  {editingSalle ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
