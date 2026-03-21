import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsAPI } from '../services/api'
import useAuthStore from '../store/authStore'
import { Settings as SettingsIcon, Building2, Users, Lock, Bell, Loader2, Save, Check } from 'lucide-react'
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

const TABS = [
  { id: 'organisation', icon: Building2, label: 'Organisation' },
  { id: 'profile',      icon: Users,     label: 'Mon Profil' },
  { id: 'security',     icon: Lock,      label: 'Sécurité' },
  { id: 'team',         icon: Users,     label: 'Équipe' },
]

export default function Settings() {
  const [tab, setTab] = useState('organisation')
  const { user, updateUser } = useAuthStore()
  const qc = useQueryClient()

  // Organisation
  const [orgForm, setOrgForm] = useState({ name:'', sector:'', website:'', phone:'', city:'' })
  const [orgLoaded, setOrgLoaded] = useState(false)

  const { data: org } = useQuery({
    queryKey: ['settings-org'],
    queryFn: () => settingsAPI.getOrg().then(r => r.data),
    onSuccess: (d) => {
      if (!orgLoaded) {
        setOrgForm({ name: d.name, sector: d.sector, website: d.website||'', phone: d.phone||'', city: d.city||'' })
        setOrgLoaded(true)
      }
    },
  })

  const { data: team } = useQuery({
    queryKey: ['settings-team'],
    queryFn: () => settingsAPI.getTeam().then(r => r.data),
    enabled: tab === 'team',
  })

  const updateOrgMut = useMutation({
    mutationFn: () => settingsAPI.updateOrg(orgForm),
    onSuccess: () => { toast.success('Organisation mise à jour'); qc.invalidateQueries(['settings-org']) },
    onError: () => toast.error('Erreur'),
  })

  // Profile
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' })
  const updateProfileMut = useMutation({
    mutationFn: () => settingsAPI.updateProfile(profileForm),
    onSuccess: (res) => { toast.success('Profil mis à jour'); updateUser(res.data) },
    onError: () => toast.error('Erreur'),
  })

  // Password
  const [pwdForm, setPwdForm] = useState({ currentPassword:'', newPassword:'' })
  const updatePwdMut = useMutation({
    mutationFn: () => settingsAPI.updatePassword(pwdForm),
    onSuccess: () => { toast.success('Mot de passe modifié'); setPwdForm({ currentPassword:'', newPassword:'' }) },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  })

  const setOF = (k) => (e) => setOrgForm(f => ({ ...f, [k]: e.target.value }))
  const setPF = (k) => (e) => setProfileForm(f => ({ ...f, [k]: e.target.value }))
  const setPW = (k) => (e) => setPwdForm(f => ({ ...f, [k]: e.target.value }))

  const PLAN_FEATURES = {
    FREE:       { color: 'text-gray-400', contenu: 20,  campagnes: 2,   clients: 100 },
    STARTER:    { color: 'text-blue-400', contenu: 100, campagnes: 10,  clients: 1000 },
    PRO:        { color: 'text-brand-400',contenu: 500, campagnes: 50,  clients: 10000 },
    ENTERPRISE: { color: 'text-accent-400',contenu: '∞', campagnes: '∞', clients: '∞' },
  }
  const plan = org?.plan || 'FREE'
  const planFeats = PLAN_FEATURES[plan]

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <SettingsIcon size={22} className="text-gray-400" /> Paramètres
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Gérez votre compte et votre organisation</p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar tabs */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${tab === id ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>

          {/* Plan card */}
          <div className="mt-5 p-3.5 rounded-xl border border-surface-border bg-surface-card">
            <p className="text-xs text-gray-500 mb-1">Plan actuel</p>
            <p className={`font-display font-bold text-lg ${planFeats.color}`}>{plan}</p>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between"><span>Contenus IA/mois</span><span className="text-white">{planFeats.contenu}</span></div>
              <div className="flex justify-between"><span>Campagnes</span><span className="text-white">{planFeats.campagnes}</span></div>
              <div className="flex justify-between"><span>Clients</span><span className="text-white">{planFeats.clients}</span></div>
            </div>
            {plan === 'FREE' && (
              <button className="btn-accent w-full justify-center mt-3 text-xs py-2">Passer à PRO</button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Organisation */}
          {tab === 'organisation' && (
            <div className="card space-y-4">
              <h2 className="font-display font-bold text-white">Informations de l'organisation</h2>
              <div>
                <label className="label">Nom de l'entreprise</label>
                <input className="input" value={orgForm.name} onChange={setOF('name')} placeholder="Nom de l'entreprise" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Secteur d'activité</label>
                  <select className="select" value={orgForm.sector} onChange={setOF('sector')}>
                    {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Ville</label>
                  <input className="input" value={orgForm.city} onChange={setOF('city')} placeholder="Yaoundé" />
                </div>
              </div>
              <div>
                <label className="label">Site web</label>
                <input className="input" value={orgForm.website} onChange={setOF('website')} placeholder="https://monentreprise.cm" />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" value={orgForm.phone} onChange={setOF('phone')} placeholder="+237 6XX XXX XXX" />
              </div>
              <button onClick={() => updateOrgMut.mutate()} disabled={updateOrgMut.isPending} className="btn-primary">
                {updateOrgMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Enregistrer
              </button>
            </div>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <div className="card space-y-4">
              <h2 className="font-display font-bold text-white">Mon profil</h2>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-input border border-surface-border">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-xl font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                  <span className="badge-blue text-xs mt-1">{user?.role}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Prénom</label><input className="input" value={profileForm.firstName} onChange={setPF('firstName')} /></div>
                <div><label className="label">Nom</label><input className="input" value={profileForm.lastName} onChange={setPF('lastName')} /></div>
              </div>
              <button onClick={() => updateProfileMut.mutate()} disabled={updateProfileMut.isPending} className="btn-primary">
                {updateProfileMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Sauvegarder
              </button>
            </div>
          )}

          {/* Security */}
          {tab === 'security' && (
            <div className="card space-y-4">
              <h2 className="font-display font-bold text-white">Changer le mot de passe</h2>
              <div>
                <label className="label">Mot de passe actuel</label>
                <input className="input" type="password" value={pwdForm.currentPassword} onChange={setPW('currentPassword')} placeholder="••••••••" />
              </div>
              <div>
                <label className="label">Nouveau mot de passe</label>
                <input className="input" type="password" value={pwdForm.newPassword} onChange={setPW('newPassword')} placeholder="Min. 8 car., majuscule + chiffre" />
              </div>
              <button onClick={() => updatePwdMut.mutate()} disabled={updatePwdMut.isPending || !pwdForm.currentPassword || !pwdForm.newPassword} className="btn-primary">
                {updatePwdMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                Changer le mot de passe
              </button>
            </div>
          )}

          {/* Team */}
          {tab === 'team' && (
            <div className="card">
              <h2 className="font-display font-bold text-white mb-4">Membres de l'équipe</h2>
              {!team ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-14 skeleton rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {team.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-input border border-surface-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                          {m.firstName?.[0]}{m.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.isActive && <span className="badge-green text-[10px]">Actif</span>}
                        <span className="badge-blue text-[10px]">{m.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
