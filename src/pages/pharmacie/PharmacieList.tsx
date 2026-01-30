import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Edit2, Trash2, X, Pill, AlertTriangle, Package } from 'lucide-react';
import { Medicament } from '@/types';

export function PharmacieList() {
  const { medicaments, addMedicament, updateMedicament, deleteMedicament } = useData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicament | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    dosage: '',
    forme: 'comprime' as Medicament['forme'],
    quantiteStock: 0,
    seuilAlerte: 50,
    prixUnitaire: 0,
    dateExpiration: '',
    fournisseur: ''
  });

  const filteredMeds = medicaments.filter(m =>
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    m.categorie.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = medicaments.filter(m => m.quantiteStock <= m.seuilAlerte);
  const expiringSoon = medicaments.filter(m => {
    const exp = new Date(m.dateExpiration);
    const now = new Date();
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  });

  const resetForm = () => {
    setFormData({
      nom: '',
      categorie: '',
      dosage: '',
      forme: 'comprime',
      quantiteStock: 0,
      seuilAlerte: 50,
      prixUnitaire: 0,
      dateExpiration: '',
      fournisseur: ''
    });
    setEditingMed(null);
  };

  const openEditModal = (med: Medicament) => {
    setFormData({
      nom: med.nom,
      categorie: med.categorie,
      dosage: med.dosage,
      forme: med.forme,
      quantiteStock: med.quantiteStock,
      seuilAlerte: med.seuilAlerte,
      prixUnitaire: med.prixUnitaire,
      dateExpiration: med.dateExpiration,
      fournisseur: med.fournisseur
    });
    setEditingMed(med);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      updateMedicament(editingMed.id, formData);
    } else {
      addMedicament(formData);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string, nom: string) => {
    if (confirm(`Supprimer ${nom} ?`)) {
      deleteMedicament(id);
    }
  };

  const getFormeLabel = (forme: string) => {
    const labels: Record<string, string> = {
      comprime: 'Comprimé',
      sirop: 'Sirop',
      injection: 'Injection',
      pommade: 'Pommade',
      gouttes: 'Gouttes',
      autre: 'Autre'
    };
    return labels[forme] || forme;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pharmacie</h1>
          <p className="text-gray-500">{medicaments.length} médicaments en stock</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter médicament
        </button>
      </div>

      {/* Alertes */}
      {(lowStock.length > 0 || expiringSoon.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStock.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Stock faible ({lowStock.length})</span>
              </div>
              <ul className="text-sm text-orange-600 space-y-1">
                {lowStock.slice(0, 3).map(m => (
                  <li key={m.id}>• {m.nom}: {m.quantiteStock} restants</li>
                ))}
              </ul>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Expiration proche ({expiringSoon.length})</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {expiringSoon.slice(0, 3).map(m => (
                  <li key={m.id}>• {m.nom}: expire le {new Date(m.dateExpiration).toLocaleDateString('fr-FR')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-800">{medicaments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En stock</p>
              <p className="text-xl font-bold text-green-600">{medicaments.filter(m => m.quantiteStock > m.seuilAlerte).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock faible</p>
              <p className="text-xl font-bold text-orange-600">{lowStock.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expire bientôt</p>
              <p className="text-xl font-bold text-red-600">{expiringSoon.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un médicament..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Médicament</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Forme</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prix</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiration</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMeds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Aucun médicament trouvé
                  </td>
                </tr>
              ) : (
                filteredMeds.map((med) => {
                  const isLowStock = med.quantiteStock <= med.seuilAlerte;
                  const expDate = new Date(med.dateExpiration);
                  const daysUntilExp = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isExpiringSoon = daysUntilExp <= 90 && daysUntilExp > 0;
                  const isExpired = daysUntilExp <= 0;
                  
                  return (
                    <tr key={med.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{med.nom}</p>
                          <p className="text-xs text-gray-500">{med.dosage}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {med.categorie}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {getFormeLabel(med.forme)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${isLowStock ? 'text-orange-600' : 'text-gray-800'}`}>
                          {med.quantiteStock}
                        </span>
                        {isLowStock && (
                          <AlertTriangle className="inline w-4 h-4 ml-1 text-orange-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {med.prixUnitaire.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
                          {expDate.toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(med)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(med.id, med.nom)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingMed ? 'Modifier' : 'Ajouter'} un médicament
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(p => ({ ...p, nom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <input
                    type="text"
                    value={formData.categorie}
                    onChange={(e) => setFormData(p => ({ ...p, categorie: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="Ex: Antibiotique"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData(p => ({ ...p, dosage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="Ex: 500mg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forme</label>
                  <select
                    value={formData.forme}
                    onChange={(e) => setFormData(p => ({ ...p, forme: e.target.value as Medicament['forme'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  >
                    <option value="comprime">Comprimé</option>
                    <option value="sirop">Sirop</option>
                    <option value="injection">Injection</option>
                    <option value="pommade">Pommade</option>
                    <option value="gouttes">Gouttes</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prixUnitaire}
                    onChange={(e) => setFormData(p => ({ ...p, prixUnitaire: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en stock</label>
                  <input
                    type="number"
                    value={formData.quantiteStock}
                    onChange={(e) => setFormData(p => ({ ...p, quantiteStock: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte</label>
                  <input
                    type="number"
                    value={formData.seuilAlerte}
                    onChange={(e) => setFormData(p => ({ ...p, seuilAlerte: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration *</label>
                  <input
                    type="date"
                    value={formData.dateExpiration}
                    onChange={(e) => setFormData(p => ({ ...p, dateExpiration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <input
                    type="text"
                    value={formData.fournisseur}
                    onChange={(e) => setFormData(p => ({ ...p, fournisseur: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                  {editingMed ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
