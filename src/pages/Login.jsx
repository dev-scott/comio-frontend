import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('demo@camerai.cm')
  const [password, setPassword] = useState('Demo@2024!')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Bienvenue sur CamerAI !')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #0c1016 0%, #0f1a12 50%, #0c1016 100%)' }}>
        {/* Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #22c55e, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', filter: 'blur(60px)' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-white text-xl">CamerAI</span>
          </div>

          <h2 className="font-display font-black text-5xl text-white leading-tight mb-6">
            Transformez votre<br />
            <span className="text-gradient">communication</span><br />
            digitale
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            La plateforme IA conçue pour les PME camerounaises. Créez, publiez et analysez vos campagnes avec l'intelligence artificielle.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          {[
            { value: '10x', label: 'plus rapide pour créer du contenu' },
            { value: '+45%', label: "taux d'engagement moyen" },
            { value: '500+', label: 'PME camerounaises' },
            { value: '3 min', label: 'pour lancer une campagne' },
          ].map(({ value, label }) => (
            <div key={value} className="p-4 rounded-xl border border-surface-border bg-surface-card/50">
              <div className="text-2xl font-display font-black text-gradient mb-1">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">CamerAI</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">Connexion</h1>
            <p className="text-gray-400">Accédez à votre tableau de bord</p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 p-3 rounded-lg border border-brand-800/30 bg-brand-900/10 text-sm text-brand-400">
            <span className="font-semibold">Compte démo :</span> Les identifiants sont préremplis.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.cm"
                required
              />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base font-semibold mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Se connecter <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
