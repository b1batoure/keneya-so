import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  UserCog,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { exportDashboardPDF } from '@/utils/pdfExport';

export function Dashboard() {
  const { patients, personnel, rendezVous } = useData();
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const rdvAujourdhui = rendezVous.filter(r => r.date === today);
  const rdvPlanifies = rdvAujourdhui.filter(r => r.statut === 'planifie');
  const rdvTermines = rdvAujourdhui.filter(r => r.statut === 'termine');

  const medecins = personnel.filter(p => p.type === 'medecin');
  const infirmiers = personnel.filter(p => p.type === 'infirmier');
  const agents = personnel.filter(p => p.type === 'agent');

  const stats = [
    {
      label: 'Total Patients',
      value: patients.length,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Personnel',
      value: personnel.length,
      icon: UserCog,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: "RDV Aujourd'hui",
      value: rdvAujourdhui.length,
      icon: Calendar,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'RDV En attente',
      value: rdvPlanifies.length,
      icon: Clock,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bienvenue, {user?.nom} 👋
            </h1>
            <p className="text-blue-100">
              Voici un aperçu de l'activité hospitalière d'aujourd'hui.
            </p>
          </div>
          <button
            onClick={() => exportDashboardPDF({
              totalPatients: patients.length,
              totalPersonnel: personnel.length,
              rdvAujourdhui: rdvAujourdhui.length,
              rdvPlanifies: rdvPlanifies.length,
              rdvTermines: rdvTermines.length,
              medecins: medecins.length,
              infirmiers: infirmiers.length,
              agents: agents.length
            })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <FileDown className="w-5 h-5" />
            Rapport PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.lightColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Rendez-vous du jour
            </h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {rdvAujourdhui.length} RDV
            </span>
          </div>
          <div className="p-4">
            {rdvAujourdhui.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun rendez-vous aujourd'hui</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {rdvAujourdhui.map((rdv) => (
                  <div key={rdv.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-12 rounded-full ${
                      rdv.statut === 'termine' ? 'bg-green-500' :
                      rdv.statut === 'annule' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{rdv.patientNom}</p>
                      <p className="text-sm text-gray-500">{rdv.medecinNom}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{rdv.heure}</p>
                      <p className="text-xs text-gray-500">{rdv.motif}</p>
                    </div>
                    <div>
                      {rdv.statut === 'termine' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : rdv.statut === 'annule' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Personnel Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-green-600" />
              Répartition du personnel
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">Médecins</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{medecins.length}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">Infirmiers</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{infirmiers.length}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">Agents administratifs</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">{agents.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">RDV Terminés</p>
              <p className="text-2xl font-bold text-gray-800">{rdvTermines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nouveaux cette semaine</p>
              <p className="text-2xl font-bold text-gray-800">{Math.min(patients.length, 5)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-gray-800">{rdvPlanifies.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
