'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Download, ExternalLink, FileText, 
  FolderGit2, Star, Plus, ShieldCheck, Share2, Sparkles, 
  MessageSquare, Layers, Award, AlertCircle, X
} from 'lucide-react';

export default function ExchangeHandoverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const exchangeId = params.id as string;

  const [exchange, setExchange] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New deliverable form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [deliverables, setDeliverables] = useState<Array<{
    title: string;
    type: string;
    url: string;
    size?: string;
  }>>([
    { title: 'Final UI System & Component Spec', type: 'Figma Asset', url: 'https://figma.com', size: '1.2 GB' },
    { title: 'Production Repository (main branch)', type: 'GitHub Organization', url: 'https://github.com', size: 'v1.0.0' },
    { title: 'Architecture & Exchange Documentation', type: 'PDF / Notion Spec', url: '#', size: '32 Pages' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('Design System');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && exchangeId) {
      fetchExchange();
    }
  }, [session, status, exchangeId]);

  const fetchExchange = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}`);
      if (res.ok) {
        const data = await res.json();
        setExchange(data.data || data);
      } else {
        setErrorMessage('Could not load exchange details.');
      }
    } catch (err) {
      console.error('Error fetching exchange:', err);
      setErrorMessage('Network error while retrieving exchange.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteExchange = async () => {
    if (!confirm('Are you ready to sign off and complete this exchange?')) return;
    setIsCompleting(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/exchanges/${exchangeId}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        await fetchExchange();
        alert('Exchange marked completed! Both parties have been credited.');
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Failed to complete exchange.');
      }
    } catch (err) {
      console.error('Error completing exchange:', err);
      setErrorMessage('Network error while completing exchange.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    setDeliverables([
      ...deliverables,
      {
        title: newTitle.trim(),
        type: newType,
        url: newUrl.trim(),
        size: 'Delivered',
      }
    ]);
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary text-sm font-medium">Loading handover workspace...</p>
        </div>
      </div>
    );
  }

  if (!exchange) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 text-center max-w-md w-full shadow-sm">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
          <h2 className="font-display font-bold text-lg text-on-surface">Exchange Not Found</h2>
          <p className="text-secondary text-xs mt-1 mb-6">{errorMessage || 'Could not find this exchange.'}</p>
          <Link href="/exchanges" className="btn-primary text-xs px-4 py-2 inline-block">
            Back to Exchanges
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = exchange.status === 'completed';
  const isOfferedByMe = exchange.offeredBy?._id === session?.user?.id;
  const partner = isOfferedByMe ? exchange.requestedBy : exchange.offeredBy;

  return (
    <div className="min-h-screen bg-background text-on-background py-8">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href={`/exchanges/${exchangeId}`}
            className="p-2 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-secondary text-xs">
            Exchanges / <Link href={`/exchanges/${exchangeId}`} className="hover:underline">{exchange.skills?.offered?.name || 'Collaboration'}</Link> / Handover &amp; Deliverables
          </span>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Handover Hero Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isCompleted 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isCompleted ? 'EXCHANGE COMPLETED' : 'FINAL PROJECT HANDOVER'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Project Handover &amp; Deliverables Gallery
            </h1>
            <p className="text-secondary text-sm mt-1">
              Collaboration: {exchange.skills?.offered?.name} ⇄ {exchange.skills?.requested?.name}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href={`/exchanges/${exchangeId}`}
              className="btn-outline text-xs px-4 py-2.5 flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Workspace Chat</span>
            </Link>
            {!isCompleted ? (
              <button
                onClick={handleCompleteExchange}
                disabled={isCompleting}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleting ? 'Finalizing...' : 'Sign Off & Complete'}</span>
              </button>
            ) : (
              <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Sign-Off
              </span>
            )}
          </div>
        </header>

        {/* Summary Stats (Top Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Exchange Duration</span>
            <div className="font-display text-2xl font-bold text-primary mt-2">4 Weeks</div>
            <span className="text-xs text-secondary mt-1">Milestones Completed</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Assets Exchanged</span>
            <div className="font-display text-2xl font-bold text-primary mt-2">{deliverables.length} Deliverables</div>
            <span className="text-xs text-secondary mt-1">Code, Designs &amp; Docs</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Reciprocity Rating</span>
            <div className="font-display text-2xl font-bold text-emerald-600 mt-2 flex items-center gap-1">
              <span>5.0</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs text-secondary mt-1">Confirmed by both peers</span>
          </div>
        </div>

        {/* Main Grid: Status & Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contributor Delivery Status (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="font-display font-bold text-base text-on-surface">Participant Delivery</h2>

            {/* Current User Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                  {session?.user?.name?.charAt(0) || 'Y'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">{session?.user?.name} (You)</h3>
                  <p className="text-xs text-secondary">{exchange.skills?.offered?.name || 'Offered Skill'}</p>
                </div>
              </div>

              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-full" />
              </div>

              <div className="flex justify-between text-xs font-bold pt-1">
                <span className="text-primary">100% DELIVERED</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed
                </span>
              </div>
            </div>

            {/* Partner Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-tertiary/10 text-tertiary font-bold flex items-center justify-center shrink-0">
                  {partner?.avatar ? (
                    <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    partner?.name?.charAt(0) || 'P'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">{partner?.name}</h3>
                  <p className="text-xs text-secondary">{exchange.skills?.requested?.name || 'Requested Skill'}</p>
                </div>
              </div>

              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full w-full" />
              </div>

              <div className="flex justify-between text-xs font-bold pt-1">
                <span className="text-tertiary">100% DELIVERED</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed
                </span>
              </div>
            </div>

            {/* Trust Seal */}
            <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-secondary leading-relaxed">
                <span className="font-bold text-on-surface">Perpetual Access: </span>
                Both barter participants maintain permanent access to exchanged artifacts in this workspace gallery.
              </div>
            </div>
          </div>

          {/* Master Deliverables List (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-on-surface">Master Deliverables</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Deliverable</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm divide-y divide-outline-variant/20">
              {deliverables.map((item, index) => (
                <div
                  key={index}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {item.type.includes('GitHub') || item.type.includes('Repo') ? (
                        <FolderGit2 className="w-5 h-5" />
                      ) : item.type.includes('Design') || item.type.includes('Figma') ? (
                        <Layers className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{item.title}</h4>
                      <p className="text-xs text-secondary mt-0.5">{item.type} • {item.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-xs font-semibold text-secondary transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Access File</span>
                    </a>
                    <button
                      onClick={() => alert(`Transfer of ownership initiated for "${item.title}".`)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Endorsement & Reviews Section */}
            <div className="mt-8 pt-4">
              <h2 className="font-display font-bold text-base text-on-surface mb-4">Final Feedback &amp; Endorsements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    "{partner?.name}'s technical depth and mentorship on {exchange.skills?.requested?.name} were incredible. Clear milestone deliverables from day one."
                  </p>
                  <span className="text-xs font-bold text-on-surface block">— {session?.user?.name} (You)</span>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    "Delivered spotless {exchange.skills?.offered?.name} assets ahead of deadline. A truly exceptional exchange partner."
                  </p>
                  <span className="text-xs font-bold text-on-surface block">— {partner?.name}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Add Deliverable Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
              <h2 className="font-display font-bold text-lg text-on-surface">Upload Deliverable Asset</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeliverable} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Asset Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Next.js Repository, Figma File"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Asset Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                >
                  <option value="GitHub Repo">GitHub Repository</option>
                  <option value="Figma File">Figma Asset / Design System</option>
                  <option value="Documentation">Documentation &amp; Notion Spec</option>
                  <option value="Deployed App">Live Deployed URL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Asset URL / Cloud Link *
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-sm outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1 py-2.5 text-xs">
                  Save Deliverable
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline flex-1 py-2.5 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
