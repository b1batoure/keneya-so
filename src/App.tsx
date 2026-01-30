import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { PatientList } from '@/pages/patients/PatientList';
import { AddPatient } from '@/pages/patients/AddPatient';
import { PatientDetails } from '@/pages/patients/PatientDetails';
import { StaffList } from '@/pages/personnel/StaffList';
import { AddStaff } from '@/pages/personnel/AddStaff';
import { StaffPlanning } from '@/pages/personnel/StaffPlanning';
import { AppointmentList } from '@/pages/appointments/AppointmentList';
import { AddAppointment } from '@/pages/appointments/AddAppointment';
import { UserManagement } from '@/pages/admin/UserManagement';
import { SalleList } from '@/pages/ressources/SalleList';
import { LitList } from '@/pages/ressources/LitList';
import { FactureList } from '@/pages/facturation/FactureList';
import { PharmacieList } from '@/pages/pharmacie/PharmacieList';
import { LaboratoireList } from '@/pages/laboratoire/LaboratoireList';
import { UrgencesList } from '@/pages/urgences/UrgencesList';
import { MessageList } from '@/pages/messagerie/MessageList';
import { OrdonnancesList } from '@/pages/ordonnances/OrdonnancesList';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/ajouter"
        element={
          <ProtectedRoute allowedRoles={['admin', 'agent']}>
            <AddPatient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <PatientDetails />
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/personnel"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personnel/ajouter"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AddStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personnel/planning"
        element={
          <ProtectedRoute allowedRoles={['admin', 'medecin']}>
            <StaffPlanning />
          </ProtectedRoute>
        }
      />

      {/* Appointment Routes */}
      <Route
        path="/rendez-vous"
        element={
          <ProtectedRoute>
            <AppointmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rendez-vous/ajouter"
        element={
          <ProtectedRoute allowedRoles={['admin', 'agent']}>
            <AddAppointment />
          </ProtectedRoute>
        }
      />

      {/* Resource Routes */}
      <Route
        path="/salles"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SalleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lits"
        element={
          <ProtectedRoute allowedRoles={['admin', 'agent']}>
            <LitList />
          </ProtectedRoute>
        }
      />

      {/* Billing Routes */}
      <Route
        path="/factures"
        element={
          <ProtectedRoute allowedRoles={['admin', 'agent']}>
            <FactureList />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/utilisateurs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Pharmacie Route */}
      <Route
        path="/pharmacie"
        element={
          <ProtectedRoute allowedRoles={['admin', 'agent']}>
            <PharmacieList />
          </ProtectedRoute>
        }
      />

      {/* Laboratoire Route */}
      <Route
        path="/laboratoire"
        element={
          <ProtectedRoute allowedRoles={['admin', 'medecin', 'agent']}>
            <LaboratoireList />
          </ProtectedRoute>
        }
      />

      {/* Urgences Route */}
      <Route
        path="/urgences"
        element={
          <ProtectedRoute allowedRoles={['admin', 'medecin', 'agent']}>
            <UrgencesList />
          </ProtectedRoute>
        }
      />

      {/* Messagerie Route */}
      <Route
        path="/messagerie"
        element={
          <ProtectedRoute>
            <MessageList />
          </ProtectedRoute>
        }
      />

      {/* Ordonnances Route */}
      <Route
        path="/ordonnances"
        element={
          <ProtectedRoute allowedRoles={['admin', 'medecin']}>
            <OrdonnancesList />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
