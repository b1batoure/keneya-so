import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  CalendarPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileDown
} from 'lucide-react';
import { exportRendezVousPDF } from '@/utils/pdfExport';

export function AppointmentList() {
  const { rendezVous, updateRendezVous, deleteRendezVous } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRdv = rendezVous.filter(r => {
    const matchSearch = 
      r.patientNom.toLowerCase().includes(search.toLowerCase()) ||
      r.medecinNom.toLowerCase().includes(search.toLowerCase());
    
    const matchDate = !filterDate || r.date === filterDate;
    const matchStatus = filterStatus === 'all' || r.statut === filterStatus;
    
    return matchSearch && matchDate && matchStatus;
  });

  const sortedRdv = [...filteredRdv].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.heure}`);
    const dateB = new Date(`${b.date}T${b.heure}`);
    return dateB.getTime() - dateA.getTime();
  });

  const handleStatusChange = (id: string, statut: 'planifie' | 'termine' | 'annule') => {
    updateRendezVous(id, { statut });
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      deleteRendezVous(id);
    }
  };

  const getStatusBadge = (statut: string) => {
    const badges = {
      planifie: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Planifié' },
      termine: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Terminé' },
      annule: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Annulé' }
    };
    const badge = badges[statut as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const rdvAujourdhui = rendezVous.filter(r => r.date === today).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rendez-vous</h1>
          <p className="text-gray-500">
            {rendezVous.length} rendez-vous • {rdvAujourdhui} aujourd'hui
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportRendezVousPDF(rendezVous)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FileDown className="w-5 h-5" />
            Exporter PDF
          </button>
          {(user?.role === 'admin' || user?.role === 'agent') && (
            <Link
              to="/rendez-vous/ajouter"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CalendarPlus className="w-5 h-5" />
              Nouveau RDV
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou médecin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        >
          <option value="all">Tous les statuts</option>
          <option value="planifie">Planifié</option>
          <option value="termine">Terminé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date & Heure
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Médecin
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Motif
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRdv.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun rendez-vous trouvé
                  </td>
                </tr>
              ) : (
                sortedRdv.map((rdv) => (
                  <tr key={rdv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {new Date(rdv.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                          <p className="text-sm text-gray-500">{rdv.heure}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {rdv.patientNom}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {rdv.medecinNom}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {rdv.motif}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(rdv.statut)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {rdv.statut === 'planifie' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(rdv.id, 'termine')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Marquer comme terminé"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(rdv.id, 'annule')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Annuler"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(rdv.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
