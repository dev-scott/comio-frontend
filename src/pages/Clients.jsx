import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientAPI, aiAPI } from '../services/api'
import {
  Users, Plus, Search, Trash2, Upload, Brain, X,
  Loader2, Star, MapPin, Tag,
} from 'lucide-react'
import toast from 'react-hot-toast'

const SEGMENTS = ['PROSPECT','LEAD','CUSTOMER','VIP','INACTIVE','CHURNED']
const SEGMENT_STYLE = {
  PROSPECT: 'badge-gray',  LEAD:     'badge-blue',
  CUSTOMER: 'badge-green', VIP:      'badge-yellow',
  INACTIVE: 'badge-gray',  CHURNED:  'badge-red',
}

function AddClientModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', city:'', company:'', segment:'PROSPECT' })
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await clientAPI.create(form)
      toast.success('Client ajouté !')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md card animate-slide-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg">Nouveau client</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Prénom</label><input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Jean" /></div>
            <div><label className="label">Nom</label><input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Kamga" /></div>
          </div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="jean@exemple.cm" /></div>
          <div><label className="label">Téléphone</label><input className="input" value={form.phone} onChange={set('phone')} placeholder="+237 6XX XXX XXX" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Entreprise</label><input className="input" value={form.company} onChange={set('company')} placeholder="Nom entreprise" /></div>
            <div><label className="label">Ville</label><input className="input" value={form.city} onChange={set('city')} placeholder="Yaoundé" /></div>
          </div>
          <div>
            <label className="label">Segment</label>
            <select className="select" value={form.segment} onChange={set('segment')}>
              {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AISegmentModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl card animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <Brain size={20} className="text-brand-400" /> Segmentation IA
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        {data?.insights && (
          <div className="mb-5 p-3 rounded-lg bg-brand-900/20 border border-brand-800/30 text-sm text-brand-300">
            💡 {data.insights}
          </div>
        )}
        <div className="grid gap-3">
          {data?.segments?.map((seg, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-input border border-surface-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{seg.name}</h3>
                <span className="badge-blue text-xs">{seg.size}</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{seg.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {seg.characteristics?.map(c => <span key={c} className="badge-gray text-xs">{c}</span>)}
              </div>
              <div className="mt-3 p-2.5 rounded-lg bg-surface-card border border-surface-border">
                <p className="text-xs font-semibold text-gray-400 mb-1">🎯 Action recommandée</p>
                <p className="text-sm text-gray-300">{seg.recommended_action}</p>
              </div>
              {seg.channels?.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">Canaux :</span>
                  {seg.channels.map(c => <span key={c} className="badge-purple text-xs">{c}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Clients() {
  const [search, setSearch] = useState('')
  const [segFilter, setSegFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search, segFilter],
    queryFn: () => clientAPI.list({ search: search || undefined, segment: segFilter || undefined, limit: 50 }).then(r => r.data),
  })

  const { data: segments } = useQuery({
    queryKey: ['client-segments'],
    queryFn: () => clientAPI.segments().then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => clientAPI.delete(id),
    onSuccess: () => { toast.success('Client supprimé'); qc.invalidateQueries(['clients']) },
    onError: () => toast.error('Erreur'),
  })

  const aiSegMut = useMutation({
    mutationFn: () => aiAPI.segmentClients(),
    onSuccess: (res) => setAiResult(res.data),
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur IA'),
  })

  const clients = data?.data || []
  const total = data?.pagination?.total || 0

  return (
    <div className="space-y-5 animate-fade-in">
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); qc.invalidateQueries(['clients']) }} />}
      {aiResult && <AISegmentModal data={aiResult} onClose={() => setAiResult(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <Users size={22} className="text-blue-400" /> Clients
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} contacts dans votre base</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => aiSegMut.mutate()} disabled={aiSegMut.isPending || total === 0}
                  className="btn-secondary text-sm">
            {aiSegMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
            Segmenter par IA
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {/* Segment stats */}
      {segments?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <button onClick={() => setSegFilter('')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex-shrink-0
                    ${!segFilter ? 'bg-white/10 border-white/20 text-white' : 'border-surface-border text-gray-500 hover:text-gray-300'}`}>
            Tous ({total})
          </button>
          {segments.map(s => (
            <button key={s.segment} onClick={() => setSegFilter(s.segment === segFilter ? '' : s.segment)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex-shrink-0
                      ${segFilter === s.segment ? 'bg-brand-600/20 border-brand-600/40 text-brand-400' : 'border-surface-border text-gray-500 hover:text-gray-300'}`}>
              {s.segment} ({s.count})
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input pl-9" placeholder="Rechercher par nom, email, téléphone…" value={search}
               onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Client list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={36} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 font-medium">Aucun client trouvé</p>
          <p className="text-gray-600 text-sm mt-1">Ajoutez votre premier client ou importez un CSV</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mx-auto mt-4 text-sm">
            <Plus size={14} /> Ajouter un client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map(c => (
            <div key={c.id} className="card-sm hover:border-surface-hover transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {(c.firstName?.[0] || c.company?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">
                      {c.firstName || ''} {c.lastName || ''}{!c.firstName && !c.lastName && (c.company || 'Anonyme')}
                    </p>
                    {c.company && (c.firstName || c.lastName) && <p className="text-xs text-gray-500 truncate">{c.company}</p>}
                  </div>
                </div>
                <span className={`${SEGMENT_STYLE[c.segment] || 'badge-gray'} text-[10px] flex-shrink-0`}>{c.segment}</span>
              </div>

              <div className="space-y-1 text-xs text-gray-500">
                {c.email && <p className="truncate">✉ {c.email}</p>}
                {c.phone && <p>📱 {c.phone}</p>}
                {c.city && (
                  <div className="flex items-center gap-1">
                    <MapPin size={11} /><span>{c.city}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {c.tags?.slice(0, 2).map(t => (
                    <span key={t} className="badge-gray text-[10px]">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-accent-400" />
                    <span className="text-xs text-gray-400">{c.score}</span>
                  </div>
                  <button
                    onClick={() => { if (confirm('Supprimer ce client ?')) deleteMut.mutate(c.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-900/30 text-gray-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
