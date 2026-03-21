import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../services/api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { BarChart3, TrendingUp, Users, Send, Eye, MousePointerClick } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name || p.dataKey}:</span>
          <span className="text-white font-bold">{typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsAPI.overview().then(r => r.data),
  })

  const { data: engagement = [], isLoading } = useQuery({
    queryKey: ['analytics-engagement-30'],
    queryFn: () => analyticsAPI.engagement({ days: 30 }).then(r => r.data),
  })

  const { data: channels = [] } = useQuery({
    queryKey: ['analytics-channels'],
    queryFn: () => analyticsAPI.channels().then(r => r.data),
  })

  const { data: audience } = useQuery({
    queryKey: ['analytics-audience'],
    queryFn: () => analyticsAPI.audience().then(r => r.data),
  })

  const chartData = engagement.map(d => ({
    date: format(new Date(d.date), 'dd/MM', { locale: fr }),
    Impressions: d.impressions,
    Clics: d.clicks,
    Conversions: d.conversions,
    Messages: d.messages,
  }))

  const radarData = channels.slice(0, 6).map(c => ({
    canal: c.channel,
    Ouvertures: parseFloat(c.openRate),
    Clics: parseFloat(c.clickRate),
  }))

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 skeleton rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-72 skeleton rounded-xl" />
          <div className="h-72 skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <BarChart3 size={22} className="text-purple-400" /> Analytics
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Performances de vos campagnes et canaux</p>
      </div>

      {/* Global metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Send,               label: 'Messages envoyés', value: overview?.performance?.sent?.toLocaleString('fr-FR') || '0',  color: 'text-blue-400' },
          { icon: Eye,                label: "Taux d'ouverture",  value: `${overview?.performance?.openRate || 0}%`,                  color: 'text-green-400' },
          { icon: MousePointerClick,  label: 'Taux de clic',     value: `${overview?.performance?.clickRate || 0}%`,                  color: 'text-accent-400' },
          { icon: Users,              label: 'Base clients',      value: overview?.clients?.total?.toLocaleString('fr-FR') || '0',    color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card-sm">
            <Icon size={18} className={`${color} mb-3`} />
            <div className="font-display font-black text-2xl text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Engagement timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white">Évolution de l'engagement</h3>
            <p className="text-xs text-gray-500">30 derniers jours — tous canaux</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              {[['imp','#22c55e'],['cli','#f59e0b'],['con','#3b82f6']].map(([id, c]) => (
                <linearGradient key={id} id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Impressions" stroke="#22c55e" fill="url(#g-imp)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Clics"       stroke="#f59e0b" fill="url(#g-cli)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Conversions" stroke="#3b82f6" fill="url(#g-con)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
          {[['#22c55e','Impressions'],['#f59e0b','Clics'],['#3b82f6','Conversions']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Channels + Audience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance par canal */}
        <div className="card">
          <h3 className="font-display font-bold text-white mb-1">Performance par canal</h3>
          <p className="text-xs text-gray-500 mb-4">Taux d'ouverture et de clic (%)</p>
          {channels.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={channels} barSize={20}>
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="openRate"  name="Taux ouv." fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="clickRate" name="Taux clic" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
              Lancez des campagnes pour voir les données
            </div>
          )}
        </div>

        {/* Top villes */}
        <div className="card">
          <h3 className="font-display font-bold text-white mb-1">Répartition géographique</h3>
          <p className="text-xs text-gray-500 mb-4">Top villes de votre base clients</p>
          {audience?.topCities?.length > 0 ? (
            <div className="space-y-3">
              {audience.topCities.map(({ city, count }, i) => {
                const max = audience.topCities[0].count
                const pct = ((count / max) * 100).toFixed(0)
                const colors = ['bg-brand-500','bg-accent-500','bg-blue-500','bg-purple-500','bg-pink-500']
                return (
                  <div key={city}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-300 font-medium">{city || 'Non renseigné'}</span>
                      <span className="text-gray-500 text-xs">{count} clients</span>
                    </div>
                    <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                      <div className={`h-full ${colors[i]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
              Ajoutez des clients pour voir la répartition
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-surface-border">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Score moyen clients</span>
              <span className="font-bold text-white">{audience?.avgScore || 0} / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* CA généré */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-400" /> Chiffre d'affaires généré
            </h3>
            <p className="text-xs text-gray-500">Par vos campagnes terminées</p>
          </div>
          <div className="text-right">
            <div className="font-display font-black text-2xl text-brand-400">
              {((overview?.performance?.revenue || 0) / 1000).toFixed(0)}K FCFA
            </div>
            <div className="text-xs text-gray-500">Total cumulé</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Campagnes terminées', value: overview?.campaigns?.completed || 0 },
            { label: 'Messages envoyés',    value: (overview?.performance?.sent || 0).toLocaleString('fr-FR') },
            { label: 'Contenu IA créés',    value: overview?.aiContents || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-lg bg-surface-input border border-surface-border">
              <div className="font-display font-black text-xl text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
