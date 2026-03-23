import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, Megaphone, TrendingUp, Zap, ArrowUpRight,
  ArrowDownRight, Send, Eye, MousePointerClick, DollarSign,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import useAuthStore from '../store/authStore'

const PIE_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444']

function KpiCard({ icon: Icon, label, value, sub, trend, color = 'brand' }) {
  const colors = {
    brand:  'from-brand-600 to-brand-400',
    yellow: 'from-accent-600 to-accent-400',
    blue:   'from-blue-600 to-blue-400',
    purple: 'from-purple-600 to-purple-400',
  }
  const up = trend >= 0
  return (
    <div className="stat-card group hover:border-surface-hover transition-colors duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
            ${up ? 'bg-brand-900/40 text-brand-400' : 'bg-red-900/40 text-red-400'}`}>
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="font-display font-black text-3xl text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-300">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300 capitalize">{p.dataKey}: </span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsAPI.overview().then(r => r.data),
  })

  const { data: engagement = [], isLoading: loadingEngagement } = useQuery({
    queryKey: ['analytics-engagement'],
    queryFn: () => analyticsAPI.engagement({ days: 30 }).then(r => r.data),
  })

  const { data: audience } = useQuery({
    queryKey: ['analytics-audience'],
    queryFn: () => analyticsAPI.audience().then(r => r.data),
  })

  const { data: channels = [] } = useQuery({
    queryKey: ['analytics-channels'],
    queryFn: () => analyticsAPI.channels().then(r => r.data),
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  // Formater les données d'engagement pour le graphique
  const engagementChart = engagement.map(d => ({
    date: format(new Date(d.date), 'dd/MM', { locale: fr }),
    Impressions: d.impressions,
    Clics: d.clicks,
    Conversions: d.conversions,
  }))

  // Segments pour le camembert
  const segmentData = audience?.segments?.map(s => ({
    name: s.segment,
    value: s.count,
  })) || []

  if (loadingOverview) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 skeleton rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-72 skeleton rounded-xl" />
          <div className="h-72 skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })} — {user?.organisation?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/ai" className="btn-accent text-sm">
            <Zap size={15} /> Générer du contenu
          </Link>
          <Link to="/campaigns" className="btn-secondary text-sm">
            <Send size={15} /> Nouvelle campagne
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users} label="Clients total"
          value={overview?.clients?.total?.toLocaleString() || 0}
          sub={`+${overview?.clients?.new || 0} ce mois`}
          trend={12} color="blue"
        />
        <KpiCard
          icon={Megaphone} label="Campagnes actives"
          value={overview?.campaigns?.active || 0}
          sub={`${overview?.campaigns?.total || 0} au total`}
          trend={5} color="purple"
        />
        <KpiCard
          icon={Eye} label="Taux d'ouverture"
          value={`${overview?.performance?.openRate || 0}%`}
          sub="Emails & SMS"
          trend={8} color="yellow"
        />
        <KpiCard
          icon={DollarSign} label="CA généré"
          value={`${((overview?.performance?.revenue || 0) / 1000).toFixed(0)}K FCFA`}
          sub="Via campagnes"
          trend={23} color="brand"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Engagement évolution */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white">Engagement 30 jours</h3>
              <p className="text-xs text-gray-500">Impressions, clics et conversions</p>
            </div>
            <span className="badge-green text-xs">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={engagementChart}>
              <defs>
                <linearGradient id="gImp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gClic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Impressions" stroke="#22c55e" fill="url(#gImp)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Clics"       stroke="#f59e0b" fill="url(#gClic)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Segments clients */}
        <div className="card">
          <h3 className="font-display font-bold text-white mb-1">Segments clients</h3>
          <p className="text-xs text-gray-500 mb-4">Répartition de votre base</p>
          {segmentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={segmentData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                       dataKey="value" paddingAngle={3}>
                    {segmentData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {segmentData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-400">{s.name}</span>
                    </div>
                    <span className="text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
              Aucun client encore
            </div>
          )}
        </div>
      </div>

      {/* Performance par canal */}
      {channels.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white">Performance par canal</h3>
              <p className="text-xs text-gray-500">Taux d'ouverture de vos campagnes terminées</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channels} barSize={32}>
              <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="openRate" name="Taux ouv." fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clickRate" name="Taux clic" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/ai',        icon: Zap,              label: 'Générer du contenu', desc: 'Post, email, SMS…', color: 'text-brand-400' },
          { href: '/campaigns', icon: Send,             label: 'Créer une campagne', desc: 'Multi-canal', color: 'text-accent-400' },
          { href: '/clients',   icon: Users,            label: 'Importer des clients', desc: 'CSV / manuel', color: 'text-blue-400' },
          { href: '/analytics', icon: TrendingUp,       label: 'Voir les analytics', desc: 'Rapports détaillés', color: 'text-purple-400' },
        ].map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} to={href}
             className="card-sm hover:border-surface-hover hover:bg-surface-hover transition-all duration-200 cursor-pointer group">
            <Icon size={22} className={`${color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
