import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignAPI } from "../services/api";
import {
  Megaphone,
  Plus,
  Search,
  Send,
  Trash2,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  BarChart2,
  X,
  Mail,
  AlertTriangle,
  ExternalLink,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_BADGE = {
  DRAFT: { cls: "badge-gray", label: "Brouillon", icon: Clock },
  SCHEDULED: { cls: "badge-yellow", label: "Planifiée", icon: Calendar },
  RUNNING: { cls: "badge-blue", label: "En cours", icon: Loader2 },
  COMPLETED: { cls: "badge-green", label: "Terminée", icon: CheckCircle },
  CANCELLED: { cls: "badge-red", label: "Annulée", icon: X },
};

const TYPES = [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "SOCIAL_FACEBOOK", label: "Facebook" },
  { value: "SOCIAL_INSTAGRAM", label: "Instagram" },
  { value: "MULTI_CHANNEL", label: "Multi-canal" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

const CHANNELS_LIST = [
  "EMAIL",
  "SMS",
  "WHATSAPP",
  "FACEBOOK",
  "INSTAGRAM",
  "TWITTER",
  "LINKEDIN",
];

// ── Modal de confirmation d'envoi ──────────────────────────────────────────
function ConfirmSendModal({ campaign, onConfirm, onClose, isLoading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md card animate-slide-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <Send size={18} className="text-brand-400" /> Envoyer la campagne
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-ghost p-1.5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-surface-input border border-surface-border">
          <p className="text-sm font-semibold text-white mb-1">
            {campaign.name}
          </p>
          {campaign.subject && (
            <p className="text-xs text-gray-400">Objet : {campaign.subject}</p>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            {campaign.channel.map((c) => (
              <span key={c} className="badge-blue text-[10px]">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-accent-900/10 border border-accent-800/30">
          <div className="flex items-start gap-2">
            <Mail size={16} className="text-accent-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-accent-300">
              <p className="font-semibold mb-1">Ce qui va se passer :</p>
              <ul className="space-y-0.5 text-xs text-accent-400/80">
                <li>• Les emails seront envoyés à tous vos clients opt-in</li>
                <li>
                  • Seuls les clients avec une adresse email valide recevront le
                  message
                </li>
                <li>• Les stats seront mises à jour automatiquement</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary flex-1 justify-center"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-primary flex-1 justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Envoi en cours…
              </>
            ) : (
              <>
                <Send size={15} /> Confirmer l'envoi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de résultat après envoi ──────────────────────────────────────────
function SendResultModal({ result, onClose }) {
  const { stats, dev_preview_url } = result;
  const hasIssues = stats.emails_failed > 0 || stats.skipped_no_email > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md card animate-slide-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <CheckCircle size={18} className="text-brand-400" /> Résultat de
            l'envoi
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-brand-900/20 border border-brand-800/30 text-center">
            <div className="font-display font-black text-2xl text-brand-400">
              {stats.emails_sent}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Emails envoyés ✓</div>
          </div>
          <div className="p-3 rounded-lg bg-surface-input border border-surface-border text-center">
            <div className="font-display font-black text-2xl text-white">
              {stats.total_clients}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Clients ciblés</div>
          </div>
          {stats.emails_failed > 0 && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-center">
              <div className="font-display font-black text-2xl text-red-400">
                {stats.emails_failed}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Échecs d'envoi</div>
            </div>
          )}
          {stats.skipped_no_email > 0 && (
            <div className="p-3 rounded-lg bg-surface-input border border-surface-border text-center">
              <div className="font-display font-black text-2xl text-gray-400">
                {stats.skipped_no_email}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Sans email (ignorés)
              </div>
            </div>
          )}
        </div>

        {/* Alerte si des clients n'ont pas d'email */}
        {stats.skipped_no_email > 0 && (
          <div className="p-3 rounded-lg bg-surface-input border border-surface-border flex items-start gap-2">
            <Users size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              {stats.skipped_no_email} client(s) n'ont pas d'adresse email dans
              leur profil et n'ont pas reçu le message. Complétez leurs fiches
              dans{" "}
              <a href="/clients" className="text-brand-400 hover:underline">
                Clients
              </a>
              .
            </p>
          </div>
        )}

        {/* Lien preview Ethereal (mode dev) */}
        {dev_preview_url && (
          <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
            <p className="text-xs font-semibold text-blue-400 mb-1.5">
              📧 Mode DEV — Aperçu du dernier email :
            </p>
            <a
              href={dev_preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 hover:underline"
            >
              <ExternalLink size={12} />
              Voir l'email dans Ethereal Mail
            </a>
            <p className="text-[11px] text-blue-500 mt-1.5">
              En production, les emails seront vraiment envoyés avec votre SMTP
              configuré.
            </p>
          </div>
        )}

        <button onClick={onClose} className="btn-primary w-full justify-center">
          Fermer
        </button>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    type: "EMAIL",
    content: "",
    channel: ["EMAIL"],
    subject: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleChannel = (c) =>
    setForm((f) => ({
      ...f,
      channel: f.channel.includes(c)
        ? f.channel.filter((x) => x !== c)
        : [...f.channel, c],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await campaignAPI.create(form);
      toast.success("Campagne créée !");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg card animate-slide-up space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg">
            Nouvelle campagne
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nom de la campagne</label>
            <input
              className="input"
              value={form.name}
              onChange={set("name")}
              placeholder="Ex: Promo Fête Nationale"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select
                className="select"
                value={form.type}
                onChange={set("type")}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Objet (email)</label>
              <input
                className="input"
                value={form.subject}
                onChange={set("subject")}
                placeholder="Objet de l'email"
              />
            </div>
          </div>

          <div>
            <label className="label">Canaux</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS_LIST.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                          ${form.channel.includes(c) ? "bg-brand-600/20 border-brand-600/40 text-brand-400" : "border-surface-border text-gray-500 hover:border-surface-hover"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Contenu</label>
            <textarea
              className="textarea"
              rows={4}
              value={form.content}
              onChange={set("content")}
              placeholder="Rédigez votre message… ou collez un contenu généré par l'IA"
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 justify-center"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Créer la campagne"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [confirmSend, setConfirmSend] = useState(null); // campagne à confirmer
  const [sendResult, setSendResult] = useState(null); // résultat à afficher
  const [sendingId, setSendingId] = useState(null); // id en cours d'envoi
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", search, statusFilter],
    queryFn: () =>
      campaignAPI
        .list({ search, status: statusFilter || undefined })
        .then((r) => r.data),
  });

  const sendMut = useMutation({
    mutationFn: (id) => {
      setSendingId(id);
      return campaignAPI.send(id);
    },
    onSuccess: (res) => {
      setSendingId(null);
      setConfirmSend(null);
      qc.invalidateQueries(["campaigns"]);
      setSendResult(res.data);
      // Toast rapide en plus du modal
      const sent = res.data.stats?.emails_sent || 0;
      if (sent > 0) {
        toast.success(`${sent} email(s) envoyé(s) !`, { duration: 3000 });
      } else {
        toast.error("Aucun email envoyé. Vérifiez vos clients.", {
          duration: 5000,
        });
      }
    },
    onError: (err) => {
      setSendingId(null);
      setConfirmSend(null);
      const msg = err.response?.data?.error || "Erreur lors de l'envoi";
      const help = err.response?.data?.help;
      toast.error(help ? `${msg}\n${help}` : msg, { duration: 6000 });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => campaignAPI.delete(id),
    onSuccess: () => {
      toast.success("Campagne supprimée");
      qc.invalidateQueries(["campaigns"]);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Erreur"),
  });

  const campaigns = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Modals */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            qc.invalidateQueries(["campaigns"]);
          }}
        />
      )}
      {confirmSend && (
        <ConfirmSendModal
          campaign={confirmSend}
          isLoading={sendMut.isPending}
          onClose={() => !sendMut.isPending && setConfirmSend(null)}
          onConfirm={() => sendMut.mutate(confirmSend.id)}
        />
      )}
      {sendResult && (
        <SendResultModal
          result={sendResult}
          onClose={() => setSendResult(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <Megaphone size={22} className="text-accent-400" /> Campagnes
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Créez et pilotez vos campagnes marketing
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> Nouvelle campagne
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            className="input pl-9"
            placeholder="Rechercher une campagne…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_BADGE).map(([v, { label }]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            value: data?.pagination?.total || 0,
            color: "text-white",
          },
          {
            label: "Actives",
            value: campaigns.filter((c) =>
              ["RUNNING", "SCHEDULED"].includes(c.status),
            ).length,
            color: "text-blue-400",
          },
          {
            label: "Terminées",
            value: campaigns.filter((c) => c.status === "COMPLETED").length,
            color: "text-brand-400",
          },
          {
            label: "Brouillons",
            value: campaigns.filter((c) => c.status === "DRAFT").length,
            color: "text-gray-400",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-sm text-center">
            <div className={`font-display font-black text-2xl ${color}`}>
              {value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-lg" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Megaphone size={36} className="mx-auto mb-3 text-gray-600" />
            <p className="font-medium">Aucune campagne trouvée</p>
            <p className="text-sm mt-1">Créez votre première campagne</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Campagne
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Canaux
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Performance
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {campaigns.map((c) => {
                  const st = STATUS_BADGE[c.status] || STATUS_BADGE.DRAFT;
                  const isSending = sendingId === c.id;
                  const canSend = ["DRAFT", "SCHEDULED"].includes(c.status);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-hover/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-white truncate max-w-xs">
                          {c.name}
                        </p>
                        {c.subject && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                            ✉ {c.subject}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-0.5">{c.type}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={st.cls}>{st.label}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.channel.slice(0, 3).map((ch) => (
                            <span key={ch} className="badge-gray text-[10px]">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        {c.stats ? (
                          <div className="flex gap-3 text-xs text-gray-400">
                            <span title="Envoyés">
                              <Send size={11} className="inline mr-0.5" />
                              {c.stats.sent}
                            </span>
                            <span title="Livrés">
                              <Eye size={11} className="inline mr-0.5" />
                              {c.stats.delivered}
                            </span>
                            <span title="Conversions">
                              <BarChart2 size={11} className="inline mr-0.5" />
                              {c.stats.converted}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-xs text-gray-500">
                        {c.sentAt
                          ? format(new Date(c.sentAt), "dd MMM yy", {
                              locale: fr,
                            })
                          : c.scheduledAt
                            ? format(new Date(c.scheduledAt), "dd MMM yy", {
                                locale: fr,
                              })
                            : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5">
                          {canSend && (
                            <button
                              onClick={() => setConfirmSend(c)}
                              disabled={isSending}
                              title="Envoyer par email"
                              className="btn-primary text-xs py-1.5 px-2.5 gap-1"
                            >
                              {isSending ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <>
                                  <Mail size={12} /> Envoyer
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm("Supprimer cette campagne ?"))
                                deleteMut.mutate(c.id);
                            }}
                            className="btn-danger text-xs py-1.5 px-2.5"
                            title="Supprimer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
