import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './lib/auth'
import AppShell from './components/AppShell'
import { Spinner } from './components/States'

// Route-level code splitting: each page loads only when visited
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Modules = lazy(() => import('./pages/Modules'))
const ModuleDetail = lazy(() => import('./pages/ModuleDetail'))
const CheckpointDetail = lazy(() => import('./pages/CheckpointDetail'))
const History = lazy(() => import('./pages/History'))
const Reports = lazy(() => import('./pages/Reports'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles'))
const AdminDepartments = lazy(() => import('./pages/admin/AdminDepartments'))
const AdminModules = lazy(() => import('./pages/admin/AdminModules'))
const AdminCheckpoints = lazy(() => import('./pages/admin/AdminCheckpoints'))
const AdminAssignments = lazy(() => import('./pages/admin/AdminAssignments'))
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions'))
const AdminEvidence = lazy(() => import('./pages/admin/AdminEvidence'))
const AdminTracking = lazy(() => import('./pages/admin/AdminTracking'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const SupervisorDashboard = lazy(() => import('./pages/supervisor/SupervisorDashboard'))
const SupervisorApprovals = lazy(() => import('./pages/supervisor/SupervisorApprovals'))
const SupervisorDepartments = lazy(() => import('./pages/supervisor/SupervisorDepartments'))
const SupervisorEmployees = lazy(() => import('./pages/supervisor/SupervisorEmployees'))
const SupervisorProjects = lazy(() => import('./pages/supervisor/SupervisorProjects'))
const SupervisorActivity = lazy(() => import('./pages/supervisor/SupervisorActivity'))
const SupervisorProfile = lazy(() => import('./pages/supervisor/SupervisorProfile'))
const SupervisorReports = lazy(() => import('./pages/supervisor/SupervisorReports'))

function PageLoader() {
  return (
    <div className="min-h-[300px] flex items-center justify-center">
      <Spinner text="Loading page..." />
    </div>
  )
}

const Lazy = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
)

function Protected({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner text="Checking session..." />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (roles && !roles.includes(user.roleName)) {
    return <Navigate to={user.roleName === 'ADMIN' ? '/admin' : user.roleName === 'SUPERVISOR' || user.roleName === 'MANAGER' ? '/supervisor' : '/dashboard'} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Lazy>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

      <Route
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/modules/:slug" element={<ModuleDetail />} />
        <Route path="/checkpoints/:id" element={<CheckpointDetail />} />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/admin"
          element={
            <Protected roles={['ADMIN']}>
              <Outlet />
            </Protected>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tracking" element={<AdminTracking />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="modules" element={<AdminModules />} />
          <Route path="checkpoints" element={<AdminCheckpoints />} />
          <Route path="assignments" element={<AdminAssignments />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="evidence" element={<AdminEvidence />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route
          path="/supervisor"
          element={
            <Protected roles={['SUPERVISOR', 'MANAGER', 'ADMIN']}>
              <Outlet />
            </Protected>
          }
        >
          <Route index element={<SupervisorDashboard />} />
          <Route path="approvals" element={<SupervisorApprovals />} />
          <Route path="departments" element={<SupervisorDepartments />} />
          <Route path="employees" element={<SupervisorEmployees />} />
          <Route path="projects" element={<SupervisorProjects />} />
          <Route path="activity" element={<SupervisorActivity />} />
          <Route path="profile" element={<SupervisorProfile />} />
          <Route path="reports" element={<SupervisorReports />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Lazy>
  )
}
