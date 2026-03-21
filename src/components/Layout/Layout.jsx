import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Megaphone, BarChart3,
  Users, Settings, LogOut, Menu, X, Bell, ChevronRight,
  Zap,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/ai',        icon: Sparkles,        label: 'IA Contenu'  },
  { to: '/campaigns', icon: Megaphone,       label: 'Campagnes'   },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics'   },
  { to: '/clients',   icon: Users,           label: 'Clients'     },
  { to: '/settings',  icon: Settings,        label: 'Paramètres'  },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnexion réussie')
    navigate('/login')
  }

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-surface-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-900/40">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">CamerAI</h1>
            <p className="text-xs text-gray-500 mt-0.5">Digital Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
               ${isActive
                 ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                 : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && isActive && <ChevronRight size={14} className="ml-auto text-brand-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Plan badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-brand-900/40 to-accent-900/20 border border-brand-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-brand-400">Plan {user?.organisation?.plan || 'FREE'}</span>
            <span className="badge-green text-[10px]">Actif</span>
          </div>
          <div className="w-full bg-surface-border rounded-full h-1">
            <div className="bg-gradient-to-r from-brand-600 to-brand-400 h-1 rounded-full w-3/4" />
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">75 / 100 contenus IA ce mois</p>
        </div>
      )}

      {/* User */}
      <div className={`border-t border-surface-border p-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
          {initials}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.organisation?.name}</p>
          </div>
        )}
        {!collapsed && (
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors" title="Déconnexion">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 border-r border-surface-border transition-all duration-300
                    ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: '#0c1016' }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-surface-border" style={{ background: '#0c1016' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-surface-border bg-surface/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-hover text-gray-400"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-surface-hover text-gray-400 transition-colors"
              title={collapsed ? 'Développer' : 'Réduire'}
            >
              {collapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-surface-hover text-gray-400 hover:text-gray-200 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-5 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
