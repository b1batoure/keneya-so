import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCog,
  Calendar,
  CalendarPlus,
  Settings,
  LogOut,
  Menu,
  X,
  Hospital,
  Clock,
  Building,
  Bed,
  Receipt,
  Bell,
  Check,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pill,
  FlaskConical,
  Siren,
  Mail,
  FileText
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = getUnreadNotificationsCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'medecin', 'agent'] },
    { path: '/urgences', label: 'Urgences', icon: Siren, roles: ['admin', 'medecin', 'agent'] },
    { path: '/patients', label: 'Liste des patients', icon: Users, roles: ['admin', 'medecin', 'agent'] },
    { path: '/patients/ajouter', label: 'Ajouter patient', icon: UserPlus, roles: ['admin', 'agent'] },
    { path: '/rendez-vous', label: 'Rendez-vous', icon: Calendar, roles: ['admin', 'medecin', 'agent'] },
    { path: '/rendez-vous/ajouter', label: 'Nouveau RDV', icon: CalendarPlus, roles: ['admin', 'agent'] },
    { path: '/laboratoire', label: 'Laboratoire', icon: FlaskConical, roles: ['admin', 'medecin', 'agent'] },
    { path: '/pharmacie', label: 'Pharmacie', icon: Pill, roles: ['admin', 'agent'] },
    { path: '/ordonnances', label: 'Ordonnances', icon: FileText, roles: ['admin', 'medecin'] },
    { path: '/personnel', label: 'Personnel', icon: UserCog, roles: ['admin'] },
    { path: '/personnel/planning', label: 'Planning', icon: Clock, roles: ['admin', 'medecin'] },
    { path: '/salles', label: 'Salles', icon: Building, roles: ['admin'] },
    { path: '/lits', label: 'Lits', icon: Bed, roles: ['admin', 'agent'] },
    { path: '/factures', label: 'Facturation', icon: Receipt, roles: ['admin', 'agent'] },
    { path: '/messagerie', label: 'Messagerie', icon: Mail, roles: ['admin', 'medecin', 'agent'] },
    { path: '/utilisateurs', label: 'Utilisateurs', icon: Settings, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      medecin: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800'
    };
    const labels = {
      admin: 'Administrateur',
      medecin: 'Médecin',
      agent: 'Agent'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role as keyof typeof badges]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 p-4 border-b border-blue-800">
          <Hospital className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-lg">Keneya-so</h1>
            <p className="text-xs text-blue-300">Gestion Hospitalière</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-blue-800">
          <p className="font-medium">{user?.nom}</p>
          <p className="text-sm text-blue-300">{user?.email}</p>
          <div className="mt-2">
            {user && getRoleBadge(user.role)}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="font-semibold text-gray-800">
                {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'HospiGest'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllNotificationsAsRead()}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {recentNotifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">Aucune notification</p>
                      ) : (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                              !notif.lu ? 'bg-blue-50' : ''
                            }`}
                          >
                            {getNotificationIcon(notif.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm">{notif.titre}</p>
                              <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.date).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            {!notif.lu && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden sm:block text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
