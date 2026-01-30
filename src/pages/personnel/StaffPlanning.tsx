import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, Trash2, Clock, Calendar, X } from 'lucide-react';

export function StaffPlanning() {
  const { planning, personnel, addPlanning, deletePlanning } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    personnelId: '',
    personnelNom: '',
    jour: 'Lundi',
    heureDebut: '08:00',
    heureFin: '16:00'
  });

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handlePersonnelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const personnelId = e.target.value;
    const person = personnel.find(p => p.id === personnelId);
    setFormData(prev => ({
      ...prev,
      personnelId,
      personnelNom: person ? `${person.type === 'medecin' ? 'Dr. ' : ''}${person.nom} ${person.prenom}` : ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlanning(formData);
    setShowAddModal(false);
    setFormData({
      personnelId: '',
      personnelNom: '',
      jour: 'Lundi',
      heureDebut: '08:00',
      heureFin: '16:00'
    });
  };

  const getPlanningByDay = (jour: string) => {
    return planning.filter(p => p.jour === jour);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Planning du Personnel</h1>
          <p className="text-gray-500">Gestion des horaires hebdomadaires</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un créneau
        </button>
      </div>

      {/* Planning Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {jours.map((jour) => {
            const dayPlanning = getPlanningByDay(jour);
            return (
              <div key={jour} className="min-h-[200px]">
                <div className="bg-blue-600 text-white p-3 text-center font-medium">
                  {jour}
                </div>
                <div className="p-2 space-y-2">
                  {dayPlanning.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Aucun créneau</p>
                  ) : (
                    dayPlanning.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-2 group relative"
                      >
                        <button
                          onClick={() => deletePlanning(plan.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <p className="font-medium text-sm text-gray-800 pr-6">
                          {plan.personnelNom}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {plan.heureDebut} - {plan.heureFin}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* List View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Vue liste
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Personnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Jour
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Horaires
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {planning.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Aucun planning configuré
                  </td>
                </tr>
              ) : (
                planning.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {plan.personnelNom}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                        {plan.jour}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {plan.heureDebut} - {plan.heureFin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deletePlanning(plan.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Nouveau Créneau</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personnel <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.personnelId}
                  onChange={handlePersonnelChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                >
                  <option value="">Sélectionner</option>
                  {personnel.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.type === 'medecin' && 'Dr. '}{p.nom} {p.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jour}
                  onChange={(e) => setFormData(prev => ({ ...prev, jour: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                >
                  {jours.map(jour => (
                    <option key={jour} value={jour}>{jour}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={formData.heureDebut}
                    onChange={(e) => setFormData(prev => ({ ...prev, heureDebut: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure fin
                  </label>
                  <input
                    type="time"
                    value={formData.heureFin}
                    onChange={(e) => setFormData(prev => ({ ...prev, heureFin: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
