import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiAPI } from '../services/api'
import {
  Sparkles, Copy, Heart, Loader2, ChevronDown, Globe,
  MessageSquare, Mail, Phone, Instagram, Facebook, Twitter,
  Linkedin, History, RefreshCw, Star, BookOpen, Target,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const PLATFORMS = [
  { value: 'facebook',      label: 'Facebook',           icon: Facebook,      color: 'text-blue-400' },
  { value: 'instagram',     label: 'Instagram',          icon: Instagram,     color: 'text-pink-400' },
  { value: 'twitter',       label: 'Twitter / X',        icon: Twitter,       color: 'text-sky-400' },
  { value: 'linkedin',      label: 'LinkedIn',           icon: Linkedin,      color: 'text-blue-500' },
  { value: 'whatsapp',      label: 'WhatsApp Business',  icon: Phone,         color: 'text-green-400' },
  { value: 'email_body',    label: 'Email Marketing',    icon: Mail,          color: 'text-accent-400' },
  { value: 'email_subject', label: 'Objet d\'email',     icon: Mail,          color: 'text-orange-400' },
  { value: 'sms',           label: 'SMS',                icon: MessageSquare, color: 'text-purple-400' },
]

const TONES = [
  { value: 'professional', label: '👔 Professionnel' },
  { value: 'friendly',     label: '😊 Amical' },
  { value: 'urgent',       label: '🔥 Urgent' },
  { value: 'inspiring',    label: '✨ Inspirant' },
  { value: 'humorous',     label: '😄 Humoristique' },
  { value: 'informative',  label: '📚 Informatif' },
]

const LANGUAGES = [
  { value: 'fr',     label: '🇫🇷 Français' },
  { value: 'en',     label: '🇬🇧 English' },
  { value: 'pidgin', label: '🇨🇲 Pidgin' },
]

export default function AIGenerator() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('generate') // 'generate' | 'strategy' | 'history'

  const [form, setForm] = useState({
    platform: 'facebook',
    productOrService: '',
    targetAudience: '',
    tone: 'professional',
    language: 'fr',
    additionalContext: '',
  })
  const [result, setResult] = useState(null)

  const [stratForm, setStratForm] = useState({
    currentChallenges: '',
    budget: '',
    targetAudience: '',
  })
  const [stratResult, setStratResult] = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setSF = (k) => (e) => setStratForm(f => ({ ...f, [k]: e.target.value }))

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: ['ai-history'],
    queryFn: () => aiAPI.history({ limit: 15 }).then(r => r.data),
    enabled: activeTab === 'history',
  })

  const generateMut = useMutation({
    mutationFn: () => aiAPI.generateContent({ ...form, type: form.platform }),
    onSuccess: (res) => {
      setResult(res.data.content)
      qc.invalidateQueries(['ai-history'])
      toast.success('Contenu généré !')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur IA'),
  })

  const stratMut = useMutation({
    mutationFn: () => aiAPI.suggestStrategy(stratForm),
    onSuccess: (res) => {
      setStratResult(res.data.strategy)
      toast.success('Stratégie générée !')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur IA'),
  })

  const toggleFav = useMutation({
    mutationFn: (id) => aiAPI.toggleFavorite(id),
    onSuccess: () => qc.invalidateQueries(['ai-history']),
  })

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers !')
  }

  const selectedPlatform = PLATFORMS.find(p => p.value === form.platform)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <Sparkles size={22} className="text-brand-400" /> Générateur de contenu IA
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Créez du contenu marketing adapté au marché camerounais</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-card border border-surface-border rounded-xl w-fit">
        {[
          { id: 'generate', icon: Sparkles, label: 'Générer' },
          { id: 'strategy', icon: Target,   label: 'Stratégie' },
          { id: 'history',  icon: History,  label: 'Historique' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === id ? 'bg-brand-600/20 text-brand-400 border border-brand-600/20' : 'text-gray-500 hover:text-gray-300'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: GENERATE ─────────────────────────────────────────── */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Form */}
          <div className="card space-y-4">
            <h2 className="font-display font-bold text-white">Paramètres du contenu</h2>

            {/* Platform selector */}
            <div>
              <label className="label">Plateforme / Canal</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(({ value, label, icon: Icon, color }) => (
                  <button key={value} onClick={() => setForm(f => ({ ...f, platform: value }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all
                            ${form.platform === value
                              ? 'border-brand-600/40 bg-brand-600/10 text-white'
                              : 'border-surface-border bg-surface-input text-gray-400 hover:border-surface-hover hover:text-gray-200'
                            }`}>
                    <Icon size={15} className={form.platform === value ? color : ''} />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Produit ou Service</label>
              <input className="input" value={form.productOrService} onChange={set('productOrService')}
                     placeholder="Ex: Robes africaines en wax, livraison Yaoundé" />
            </div>

            <div>
              <label className="label">Public cible</label>
              <input className="input" value={form.targetAudience} onChange={set('targetAudience')}
                     placeholder="Ex: Femmes 25-45 ans, professionnelles, Douala/Yaoundé" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Ton</label>
                <select className="select" value={form.tone} onChange={set('tone')}>
                  {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Langue</label>
                <select className="select" value={form.language} onChange={set('language')}>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Contexte supplémentaire <span className="normal-case text-gray-600">(optionnel)</span></label>
              <textarea className="textarea" rows={2} value={form.additionalContext} onChange={set('additionalContext')}
                        placeholder="Ex: Promo spéciale fête des mères -30%, code MAMAN30" />
            </div>

            <button
              onClick={() => generateMut.mutate()}
              disabled={generateMut.isPending || !form.productOrService || !form.targetAudience}
              className="btn-primary w-full justify-center py-3 font-semibold"
            >
              {generateMut.isPending
                ? <><Loader2 size={16} className="animate-spin" /> Génération en cours…</>
                : <><Sparkles size={16} /> Générer avec l'IA</>
              }
            </button>
          </div>

          {/* Result */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white">Résultat</h2>
              {result && (
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(result)} className="btn-secondary text-xs py-1.5 px-3">
                    <Copy size={13} /> Copier
                  </button>
                  <button onClick={() => generateMut.mutate()} className="btn-ghost text-xs py-1.5 px-3">
                    <RefreshCw size={13} /> Régénérer
                  </button>
                </div>
              )}
            </div>

            {generateMut.isPending && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
                <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center animate-pulse">
                  <Sparkles size={24} className="text-brand-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">L'IA génère votre contenu…</p>
                  <p className="text-gray-500 text-sm mt-1">Adapté au marché camerounais</p>
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
                         style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {!result && !generateMut.isPending && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center">
                {selectedPlatform && (
                  <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center">
                    <selectedPlatform.icon size={28} className={selectedPlatform.color} />
                  </div>
                )}
                <p className="text-gray-400 text-sm">Remplissez le formulaire et lancez la génération</p>
                <p className="text-gray-600 text-xs">Le contenu sera adapté au contexte camerounais</p>
              </div>
            )}

            {result && !generateMut.isPending && (
              <div className="flex-1">
                <div className="p-4 rounded-xl bg-surface-input border border-surface-border text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {result}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <selectedPlatform.icon size={14} className={selectedPlatform.color} />
                    <span className="text-xs text-gray-500">{selectedPlatform.label}</span>
                  </div>
                  <span className="text-xs text-gray-600">{result.length} caractères</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: STRATEGY ─────────────────────────────────────────── */}
      {activeTab === 'strategy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card space-y-4">
            <h2 className="font-display font-bold text-white">Générer une stratégie 3 mois</h2>
            <p className="text-sm text-gray-400">L'IA crée un plan de communication personnalisé pour votre PME</p>

            <div>
              <label className="label">Défis actuels de communication</label>
              <textarea className="textarea" rows={3} value={stratForm.currentChallenges} onChange={setSF('currentChallenges')}
                        placeholder="Ex: Peu de visibilité en ligne, concurrence des grandes enseignes, clients ne savent pas qu'on existe…" />
            </div>
            <div>
              <label className="label">Public cible principal</label>
              <input className="input" value={stratForm.targetAudience} onChange={setSF('targetAudience')}
                     placeholder="Ex: Ménages yaoundéens 30-50 ans, revenus intermédiaires" />
            </div>
            <div>
              <label className="label">Budget mensuel marketing (FCFA)</label>
              <input className="input" type="number" value={stratForm.budget} onChange={setSF('budget')}
                     placeholder="Ex: 50000" />
            </div>

            <button
              onClick={() => stratMut.mutate()}
              disabled={stratMut.isPending || !stratForm.currentChallenges || !stratForm.targetAudience}
              className="btn-primary w-full justify-center py-3 font-semibold"
            >
              {stratMut.isPending
                ? <><Loader2 size={16} className="animate-spin" /> Création de la stratégie…</>
                : <><Target size={16} /> Générer ma stratégie</>
              }
            </button>
          </div>

          <div className="card">
            <h2 className="font-display font-bold text-white mb-4">Votre stratégie</h2>
            {stratMut.isPending && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={28} className="text-brand-400 animate-spin" />
                <p className="text-gray-400 text-sm">Analyse de votre marché camerounais…</p>
              </div>
            )}
            {stratResult && !stratMut.isPending && (
              <div className="relative">
                <div className="prose-sm text-gray-300 leading-relaxed whitespace-pre-wrap text-sm max-h-[500px] overflow-y-auto scrollbar-none">
                  {stratResult}
                </div>
                <button onClick={() => copyToClipboard(stratResult)}
                        className="mt-4 btn-secondary text-xs w-full justify-center">
                  <Copy size={13} /> Copier la stratégie
                </button>
              </div>
            )}
            {!stratResult && !stratMut.isPending && (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <BookOpen size={32} className="text-gray-600" />
                <p className="text-gray-500 text-sm">Votre stratégie personnalisée apparaîtra ici</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: HISTORY ──────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="card">
          <h2 className="font-display font-bold text-white mb-5">Historique des générations</h2>
          {histLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-lg" />)}
            </div>
          )}
          {!histLoading && history?.data?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <History size={32} className="mx-auto mb-3 text-gray-600" />
              <p>Aucun contenu généré pour l'instant</p>
            </div>
          )}
          {!histLoading && history?.data?.length > 0 && (
            <div className="space-y-3">
              {history.data.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-surface-input border border-surface-border hover:border-surface-hover transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-blue text-xs">{item.platform || item.type}</span>
                        <span className="badge-gray text-xs">{item.language}</span>
                        {item.isFavorited && <Star size={12} className="text-accent-400 fill-accent-400" />}
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{item.result}</p>
                      <p className="text-xs text-gray-600 mt-1.5">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        {' • '}{item.tokens} tokens
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => copyToClipboard(item.result)}
                              className="p-2 rounded-lg hover:bg-surface-hover text-gray-500 hover:text-gray-300 transition-colors">
                        <Copy size={14} />
                      </button>
                      <button onClick={() => toggleFav.mutate(item.id)}
                              className={`p-2 rounded-lg transition-colors ${item.isFavorited ? 'text-accent-400' : 'text-gray-600 hover:text-accent-400 hover:bg-surface-hover'}`}>
                        <Heart size={14} fill={item.isFavorited ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
