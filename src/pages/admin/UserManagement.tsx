import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Trash2, Shield, X, Users } from 'lucide-react';

export function UserManagement() {
  const { users, addUser, deleteUser, user: currentUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    role: 'agent' as 'admin' | 'medecin' | 'agent'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData);
    setShowAddModal(false);
    setFormData({
      email: '',
      password: '',
      nom: '',
      role: 'agent'
    });
  };

  const handleDelete = (id: string, nom: string) => {
    if (id === currentUser?.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${nom} ?`)) {
      deleteUser(id);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Administrateur' },
      medecin: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Médecin' },
      agent: { bg: 'bg-green-100', text: 'text-green-700', label: 'Agent' }
    };
    const badge = badges[role as keyof typeof badges];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${badge.bg} ${badge.text}`}>
        <Shield className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
          <p className="text-gray-500">{users.length} utilisateurs enregistrés</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className={`bg-white rounded-xl shadow-sm border p-6 ${
              u.id === currentUser?.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {u.id !== currentUser?.id && (
                <button
                  onClick={() => handleDelete(u.id, u.nom)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <h3 className="font-semibold text-gray-800">{u.nom}</h3>
            <p className="text-sm text-gray-500 mt-1">{u.email}</p>
            
            <div className="mt-4">
              {getRoleBadge(u.role)}
            </div>

            {u.id === currentUser?.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-blue-600 font-medium">
                  (Compte actuel)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Role Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Permissions des rôles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Administrateur</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Accès complet au système</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Médecin</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Voir les patients</li>
              <li>• Ajouter des consultations</li>
              <li>• Voir les rendez-vous</li>
              <li>• Voir le planning</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Agent</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Voir les patients</li>
              <li>• Ajouter des patients</li>
              <li>• Gérer les rendez-vous</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Nouvel Utilisateur</h3>
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
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Nom complet"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="email@hospital.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'medecin' | 'agent' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                >
                  <option value="agent">Agent</option>
                  <option value="medecin">Médecin</option>
                  <option value="admin">Administrateur</option>
                </select>
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
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
