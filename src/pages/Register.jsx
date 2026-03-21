import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Loader2 } from 'lucide-react'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const SECTORS = [
  { value: 'FOOD_BEVERAGE', label: 'Alimentation & Boissons' },
  { value: 'RETAIL',        label: 'Commerce de détail' },
  { value: 'SERVICES',      label: 'Services' },
  { value: 'TECH',          label: 'Technologie' },
  { value: 'AGRICULTURE',   label: 'Agriculture' },
  { value: 'HEALTH',        label: 'Santé' },
  { value: 'EDUCATION',     label: 'Éducation' },
  { value: 'FASHION',       label: 'Mode & Habillement' },
  { value: 'CONSTRUCTION',  label: 'Construction & BTP' },
  { value: 'TRANSPORT',     label: 'Transport & Logistique' },
  { value: 'FINANCE',       label: 'Finance & Micro-finance' },
  { value: 'OTHER',         label: 'Autre' },
]

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', organisationName: '', sector: 'OTHER', city: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.register(form)
      await login(form.email, form.password)
      toast.success('Compte créé ! Bienvenue sur CamerAI 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-white text-xl">CamerAI</span>
        </div>

        <div className="card">
          <h1 className="font-display font-bold text-2xl text-white mb-1">Créer votre compte</h1>
          <p className="text-gray-400 text-sm mb-6">Commencez gratuitement, sans carte de crédit</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Jean" required />
              </div>
              <div>
                <label className="label">Nom</label>
                <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Kamga" required />
              </div>
            </div>

            <div>
              <label className="label">Email professionnel</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="jean@monentreprise.cm" required />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <input className="input" type="password" value={form.password} onChange={set('password')}
                     placeholder="Min. 8 caractères, majuscule + chiffre" required minLength={8} />
            </div>

            <div className="border-t border-surface-border pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Votre entreprise</p>
              <div className="space-y-3">
                <div>
                  <label className="label">Nom de l'entreprise</label>
                  <input className="input" value={form.organisationName} onChange={set('organisationName')} placeholder="Ma Boutique Yaoundé" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Secteur d'activité</label>
                    <select className="select" value={form.sector} onChange={set('sector')}>
                      {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Ville</label>
                    <input className="input" value={form.city} onChange={set('city')} placeholder="Yaoundé" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 font-semibold mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Créer mon compte <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
