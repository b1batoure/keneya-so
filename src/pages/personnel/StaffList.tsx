import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Search, UserPlus, Trash2, Stethoscope, UserCog, Users, FileDown } from 'lucide-react';
import { exportPersonnelPDF } from '@/utils/pdfExport';

export function StaffList() {
  const { personnel, deletePersonnel } = useData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredPersonnel = personnel.filter(p => {
    const matchSearch = 
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.prenom.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    
    const matchType = filterType === 'all' || p.type === filterType;
    
    return matchSearch && matchType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medecin':
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'infirmier':
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <UserCog className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      medecin: 'bg-blue-100 text-blue-700',
      infirmier: 'bg-green-100 text-green-700',
      agent: 'bg-purple-100 text-purple-700'
    };
    const labels = {
      medecin: 'Médecin',
      infirmier: 'Infirmier',
      agent: 'Agent'
    };
    return (
      <span className={`px-2 py-1 text-sm font-medium rounded ${badges[type as keyof typeof badges]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  const handleDelete = (id: string, nom: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${nom} ?`)) {
      deletePersonnel(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Personnel</h1>
          <p className="text-gray-500">{personnel.length} membres du personnel</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportPersonnelPDF(personnel)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FileDown className="w-5 h-5" />
            Exporter PDF
          </button>
          <Link
            to="/personnel/ajouter"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Nouveau personnel
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        >
          <option value="all">Tous les types</option>
          <option value="medecin">Médecins</option>
          <option value="infirmier">Infirmiers</option>
          <option value="agent">Agents</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun personnel trouvé
          </div>
        ) : (
          filteredPersonnel.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  person.type === 'medecin' ? 'bg-blue-100' :
                  person.type === 'infirmier' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {getTypeIcon(person.type)}
                </div>
                <button
                  onClick={() => handleDelete(person.id, `${person.nom} ${person.prenom}`)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-gray-800">
                {person.type === 'medecin' && 'Dr. '}
                {person.nom} {person.prenom}
              </h3>
              
              <div className="mt-2">
                {getTypeBadge(person.type)}
              </div>

              {person.specialite && (
                <p className="mt-2 text-sm text-gray-500">
                  Spécialité: {person.specialite}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="text-gray-400">Email:</span> {person.email}
                </p>
                <p className="text-gray-600">
                  <span className="text-gray-400">Tél:</span> {person.telephone}
                </p>
                <p className="text-gray-600">
                  <span className="text-gray-400">Depuis:</span>{' '}
                  {new Date(person.dateEmbauche).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
