import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { 
  Plus, Search, Eye, CreditCard, Trash2, X,
  CheckCircle, Clock, XCircle
} from 'lucide-react';
import { Facture } from '@/types';

export function FactureList() {
  const { factures, patients, addFacture, payerFacture, deleteFacture } = useData();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [modePaiement, setModePaiement] = useState<'especes' | 'carte' | 'virement' | 'assurance'>('carte');

  const [formData, setFormData] = useState({
    patientId: '',
    patientNom: '',
    items: [{ description: '', quantite: 1, prixUnitaire: 0 }]
  });

  const filteredFactures = factures.filter(f => {
    const matchSearch = f.patientNom.toLowerCase().includes(search.toLowerCase()) ||
                       f.numero.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || f.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const sortedFactures = [...filteredFactures].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
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

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantite: 1, prixUnitaire: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);
  };

  const handleAddFacture = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsWithIds = formData.items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`
    }));
    
    addFacture({
      patientId: formData.patientId,
      patientNom: formData.patientNom,
      date: new Date().toISOString().split('T')[0],
      items: itemsWithIds,
      total: calculateTotal(),
      statut: 'en_attente'
    });
    
    setShowAddModal(false);
    setFormData({
      patientId: '',
      patientNom: '',
      items: [{ description: '', quantite: 1, prixUnitaire: 0 }]
    });
  };

  const openPayModal = (facture: Facture) => {
    setSelectedFacture(facture);
    setModePaiement('carte');
    setShowPayModal(true);
  };

  const handlePayer = () => {
    if (selectedFacture) {
      payerFacture(selectedFacture.id, modePaiement);
      setShowPayModal(false);
      setSelectedFacture(null);
    }
  };

  const handleDelete = (id: string, numero: string) => {
    if (confirm(`Supprimer la facture ${numero} ?`)) {
      deleteFacture(id);
    }
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      payee: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      annulee: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    const badge = badges[statut] || badges.en_attente;
    const Icon = badge.icon;
    const labels: Record<string, string> = {
      en_attente: 'En attente',
      payee: 'Payée',
      annulee: 'Annulée'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {labels[statut]}
      </span>
    );
  };

  const stats = {
    total: factures.length,
    enAttente: factures.filter(f => f.statut === 'en_attente').length,
    montantEnAttente: factures.filter(f => f.statut === 'en_attente').reduce((sum, f) => sum + f.total, 0),
    montantPaye: factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + f.total, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Facturation</h1>
          <p className="text-gray-500">{factures.length} factures</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle facture
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total factures</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">À encaisser</p>
          <p className="text-2xl font-bold text-orange-600">{stats.montantEnAttente.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Encaissé</p>
          <p className="text-2xl font-bold text-green-600">{stats.montantPaye.toFixed(2)} €</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou numéro..."
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
          <option value="payee">Payée</option>
          <option value="annulee">Annulée</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">N° Facture</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedFactures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                sortedFactures.map((facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{facture.numero}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {new Date(facture.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{facture.patientNom}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{facture.total.toFixed(2)} €</td>
                    <td className="px-6 py-4">{getStatutBadge(facture.statut)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedFacture(facture); setShowDetailModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {facture.statut === 'en_attente' && (
                          <button
                            onClick={() => openPayModal(facture)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Payer"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(facture.id, facture.numero)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Facture Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">Nouvelle Facture</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddFacture} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.patientId}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Articles</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Ajouter un article
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qté"
                        value={item.quantite}
                        onChange={(e) => updateItem(index, 'quantite', parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-black"
                        min="1"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Prix"
                        value={item.prixUnitaire}
                        onChange={(e) => updateItem(index, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-black"
                        min="0"
                        step="0.01"
                        required
                      />
                      <span className="w-24 py-2 text-right font-medium text-gray-800">
                        {(item.quantite * item.prixUnitaire).toFixed(2)} €
                      </span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-blue-600">{calculateTotal().toFixed(2)} €</span>
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
                  Créer la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedFacture && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Facture {selectedFacture.numero}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Patient:</span>
                <span className="font-medium text-gray-800">{selectedFacture.patientNom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-800">{new Date(selectedFacture.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Statut:</span>
                {getStatutBadge(selectedFacture.statut)}
              </div>
              {selectedFacture.modePaiement && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode de paiement:</span>
                  <span className="text-gray-800 capitalize">{selectedFacture.modePaiement}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-800 mb-2">Articles:</h4>
                <div className="space-y-2">
                  {selectedFacture.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.description} x{item.quantite}
                      </span>
                      <span className="text-gray-800">{(item.quantite * item.prixUnitaire).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold text-blue-800">Total:</span>
                <span className="text-xl font-bold text-blue-600">{selectedFacture.total.toFixed(2)} €</span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && selectedFacture && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Paiement</h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600">Montant à payer</p>
                <p className="text-3xl font-bold text-blue-700">{selectedFacture.total.toFixed(2)} €</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['especes', 'carte', 'virement', 'assurance'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setModePaiement(mode as typeof modePaiement)}
                      className={`p-3 rounded-lg border-2 text-center capitalize transition-colors ${
                        modePaiement === mode 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {mode === 'especes' ? 'Espèces' : mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePayer}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
