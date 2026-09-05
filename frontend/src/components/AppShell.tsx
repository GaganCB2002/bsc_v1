import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  History,
  FileBarChart,
  CalendarDays,
  UserCircle,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Users,
  Building2,
  ClipboardCheck,
  ListChecks,
  Paperclip,
  ScrollText,
  Settings,
  MapPin,
  Satellite,
  Activity,
  UserRound,
  Briefcase,
  Lock,
  CheckSquare,
  LayoutGrid,
} from 'lucide-react'
import { useAuth, can } from '../lib/auth'
import { useTracking } from '../lib/tracking'
import { get, patch, post } from '../lib/api'
import { timeAgo } from '../lib/format'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const USER_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/modules', label: 'My Modules', icon: FolderOpen },
  { to: '/history', label: 'My History', icon: History },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
]

const SUPERVISOR_NAV: NavItem[] = [
  { to: '/supervisor', label: 'Team Dashboard', icon: LayoutDashboard },
  { to: '/supervisor/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/supervisor/employees', label: 'Employees', icon: Users },
  { to: '/supervisor/departments', label: 'Departments', icon: Building2 },
  { to: '/supervisor/projects', label: 'Projects', icon: Briefcase },
  { to: '/supervisor/reports', label: 'Team Reports', icon: FileBarChart },
  { to: '/supervisor/activity', label: 'Activity Log', icon: Activity },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Admin Dashboard', icon: LayoutGrid },
  { to: '/admin/tracking', label: 'Live Tracking', icon: Satellite },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
  { to: '/admin/modules', label: 'Modules', icon: FolderOpen },
  { to: '/admin/checkpoints', label: 'Checkpoints', icon: ListChecks },
  { to: '/admin/assignments', label: 'Assignments', icon: CheckSquare },
  { to: '/admin/submissions', label: 'Submissions', icon: ClipboardCheck },
  { to: '/admin/evidence', label: 'Evidence', icon: Paperclip },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  linkUrl: string | null
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const tracking = useTracking()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [clock, setClock] = useState(new Date())
  const profileRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
    setProfileOpen(false)
    setBellOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await get<{ items: Notification[]; unreadCount: number }>('/api/notifications')
      setNotifications(data.items)
      setUnread(data.unreadCount)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    if (user) {
      void loadNotifications()
      const id = setInterval(() => void loadNotifications(), 60000)
      return () => clearInterval(id)
    }
  }, [user])

  if (!user) return null

  const isAdmin = user.roleName === 'ADMIN'
  const isSupervisor = ['SUPERVISOR', 'MANAGER'].includes(user.roleName)
  const nav = isAdmin ? ADMIN_NAV : isSupervisor ? [...SUPERVISOR_NAV, ...USER_NAV] : USER_NAV
  const home = isAdmin ? '/admin' : isSupervisor ? '/supervisor' : '/dashboard'

  const markAllRead = async () => {
    await post('/api/notifications/read-all')
    void loadNotifications()
  }
  const markRead = async (id: string) => {
    await patch(`/api/notifications/${id}/read`)
    void loadNotifications()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const NavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
      isActive
        ? 'bg-white/15 text-white shadow-inner'
        : 'text-sky-100/80 hover:bg-white/10 hover:text-white'
    }`

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-gradient-to-b from-sky-600 via-sky-700 to-blue-800 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">BSC Exclusive</p>
            <p className="text-sky-200 text-[10px] font-medium tracking-wide">PROCESS TRACKING</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/supervisor' || item.to === '/admin'} className={NavLinkClass}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <NavLink to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-sky-100/80 hover:bg-white/10 hover:text-white transition-colors">
            <UserCircle className="w-4 h-4" />
            My Profile
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-sky-100/80 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-20">
          <button className="lg:hidden text-text-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden sm:block">
            <p className="text-xs text-text-muted">{clock.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p className="text-sm font-bold text-text tabular-nums">{clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Live GPS indicator */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary-faint border border-primary-light text-[11px] font-semibold text-primary-deep"
              title={`Live location updates every 30 minutes. ${tracking.permissionDenied ? 'Permission denied — enable location access in your browser.' : tracking.lastSync ? `Last sync ${timeAgo(tracking.lastSync.toISOString())}` : 'Waiting for location...'}`}
            >
              <Satellite className="w-3.5 h-3.5 animate-pulse" />
              Live GPS
              <span className={`w-1.5 h-1.5 rounded-full ${tracking.lastSync ? 'bg-success' : 'bg-warning'}`} />
            </div>

            {/* Notifications */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => { setBellOpen(!bellOpen); if (!bellOpen) void loadNotifications() }}
                className="relative w-9 h-9 rounded-lg hover:bg-primary-faint flex items-center justify-center text-text-secondary transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 card shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-text">Notifications</p>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-[11px] text-primary hover:text-primary-dark font-semibold">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-xs text-text-muted">You're all caught up.</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { void markRead(n.id); setBellOpen(false); if (n.linkUrl) navigate(n.linkUrl) }}
                          className="w-full text-left px-4 py-3 border-b border-border-light hover:bg-primary-faint transition-colors flex gap-2.5"
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-border' : TYPE_COLORS[n.type] || 'bg-info'}`} />
                          <span>
                            <span className="block text-xs font-semibold text-text">{n.title}</span>
                            <span className="block text-[11px] text-text-secondary mt-0.5 line-clamp-2">{n.message}</span>
                            <span className="block text-[10px] text-text-muted mt-1">{timeAgo(n.createdAt)}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-primary-faint transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-text leading-tight">{user.fullName}</span>
                  <span className="block text-[10px] text-text-muted">{user.roleName}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 card shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-bold text-text">{user.fullName}</p>
                    <p className="text-[11px] text-text-muted">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-primary-light text-primary-deep text-[10px] font-bold">
                      {user.roleName} {user.departmentName ? `· ${user.departmentName}` : ''}
                    </span>
                  </div>
                  <button onClick={() => { setProfileOpen(false); navigate('/profile') }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-text-secondary hover:bg-primary-faint">
                    <UserRound className="w-4 h-4" /> My Profile
                  </button>
                  {can(user, 'settings:view') && (
                    <button onClick={() => { setProfileOpen(false); navigate('/admin/settings') }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-text-secondary hover:bg-primary-faint">
                      <Lock className="w-4 h-4" /> System Settings
                    </button>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-danger hover:bg-danger-bg border-t border-border-light">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>

        <footer className="px-6 py-3 border-t border-border bg-white text-[11px] text-text-muted flex items-center justify-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} BSC Exclusive — Process & Compliance Tracking</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-primary" /> Live tracking every 30 minutes · Auto-approval after 1 hour
          </span>
        </footer>
      </div>
    </div>
  )
}
