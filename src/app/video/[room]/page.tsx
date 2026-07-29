'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, Users, Hand,
  MonitorUp, Clock, X, User, MoreVertical, Maximize, Minimize,
  PictureInPicture2, Circle, StopCircle, LayoutGrid, Columns,
  LayoutPanelLeft, Layout, EyeOff, Flag, Mail, ChevronRight, Check,
} from 'lucide-react';

type ViewLayout = 'auto' | 'tiled' | 'spotlight' | 'sidebar';
const TILE_STEPS = [1, 2, 4, 6, 9, 16];

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
  icon?: string;
}

export default function VideoCallPage() {
  const { room } = useParams();
  const { data: session } = useSession();

  // Media state
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // View / layout state
  const [viewLayout, setViewLayout] = useState<ViewLayout>('auto');
  const [tileCountIdx, setTileCountIdx] = useState(1);
  const [hideTilesNoVideo, setHideTilesNoVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuSection, setMenuSection] = useState<'view'|'report'>('view');

  // UI state
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const toastCounterRef = useRef(0);

  const exchangeId = room ? room.toString().split('-')[1] : null;

  // ── Toast helpers ──────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast['type'] = 'success', icon?: string) => {
    const id = ++toastCounterRef.current;
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Init media ─────────────────────────────────────────────────
  useEffect(() => {
    if (exchangeId) {
      fetch(`/api/exchanges/${exchangeId}/start-call`, { method: 'POST' }).catch(() => {});
    }

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Camera/mic access denied:', err);
          addToast('Could not access camera or microphone', 'warning', '⚠️');
        });
    }

    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);

    return () => {
      clearInterval(timer);
      // Stop all local tracks on unmount
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      if (exchangeId) {
        fetch(`/api/exchanges/${exchangeId}/end-call`, { method: 'POST' }).catch(() => {});
      }
    };
  }, [room, exchangeId, addToast]);

  // ── Mute / Unmute ──────────────────────────────────────────────
  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // flip: if currently muted → enable
      });
    }
    setIsMuted(prev => !prev);
  };

  // ── Camera on / off ─────────────────────────────────────────────
  const toggleCamera = async () => {
    if (!isCameraOff) {
      localStreamRef.current?.getVideoTracks().forEach(t => t.stop());
      setIsCameraOff(true);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(t => localStreamRef.current!.removeTrack(t));
          localStreamRef.current.addTrack(newVideoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsCameraOff(false);
      } catch {
        addToast('Could not restart camera', 'warning', '⚠️');
      }
    }
  };

  // ── Screen share ──────────────────────────────────────────────
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share, restore camera
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;

      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setIsScreenSharing(false);
      addToast('Screen sharing stopped', 'info', '🖥️');
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = screenStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Auto-stop when user clicks "Stop sharing" in browser native UI
        screenStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          screenStreamRef.current = null;
          setIsScreenSharing(false);
          addToast('Screen sharing stopped', 'info', '🖥️');
        };

        setIsScreenSharing(true);
        addToast('You are now sharing your screen', 'success', '🖥️');
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          addToast('Could not start screen sharing', 'warning', '⚠️');
        }
      }
    }
  };

  // ── Hand raise ────────────────────────────────────────────────
  const toggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (nextState) {
      addToast('✋ You raised your hand — participants have been notified', 'success', '✋');
    } else {
      addToast('Hand lowered', 'info', '👇');
    }
  };

  // ── Fullscreen ────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ── Picture-in-Picture ────────────────────────────────────────
  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        addToast('Picture-in-Picture closed', 'info', '🪟');
        return;
      }
      // Prefer remote video; fall back to local if no remote stream
      const hasRemote = !!(remoteVideoRef.current?.srcObject);
      const target = hasRemote ? remoteVideoRef.current! : localVideoRef.current!;
      if (!target) { addToast('No active video to show in PiP', 'warning', '⚠️'); return; }
      // Ensure video is playing
      if (target.paused) await target.play().catch(() => {});
      await target.requestPictureInPicture();
      addToast('Picture-in-Picture active — your camera feed', 'success', '🪟');
    } catch (e: any) {
      const msg = e?.name === 'NotAllowedError'
        ? 'Interact with the page first, then try PiP'
        : e?.name === 'NotSupportedError'
        ? 'PiP requires HTTPS or is blocked by the browser'
        : 'PiP failed: ' + (e?.message ?? 'unknown');
      addToast(msg, 'warning', '⚠️');
    }
  };

  // ── Meeting Recording ─────────────────────────────────────────
  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      addToast('Recording saved', 'success', '💾');
    } else {
      const stream = localStreamRef.current;
      if (!stream) { addToast('No stream to record', 'warning', '⚠️'); return; }
      try {
        const rec = new MediaRecorder(stream);
        recordedChunksRef.current = [];
        rec.ondataavailable = e => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `call-${Date.now()}.webm`; a.click();
          URL.revokeObjectURL(url);
        };
        rec.start();
        mediaRecorderRef.current = rec;
        setIsRecording(true);
        addToast('Recording started', 'success', '🔴');
      } catch { addToast('Recording not supported', 'warning', '⚠️'); }
    }
  };

  // ── Report Problem (mailto) ───────────────────────────────────
  const reportProblem = () => {
    const sub = encodeURIComponent(`Video Call Issue – Room: ${room}`);
    const body = encodeURIComponent(
      `Hi,\n\nI encountered a problem during my video call.\n\nRoom: ${room}\nTime: ${new Date().toISOString()}\nUser: ${session?.user?.email ?? 'unknown'}\n\nIssue description:\n[Please describe here]`
    );
    window.open(`mailto:ashish.deo.tripathi@gmail.com?subject=${sub}&body=${body}`);
    setShowMenu(false);
  };

  // ── Report Abuse ──────────────────────────────────────────────
  const reportAbuse = async () => {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'abuse', context: 'video_call', room,
          reportedBy: session?.user?.email ?? 'unknown',
          timestamp: new Date().toISOString(),
        }),
      });
      addToast('Abuse report submitted to admin', 'success', '🚨');
    } catch { addToast('Failed to submit report', 'warning', '⚠️'); }
    setShowMenu(false);
  };

  // ── Hang up ───────────────────────────────────────────────────
  const hangUp = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaRecorderRef.current?.stop();
    window.location.href = '/exchanges';
  };

  // ── Three-dots menu ───────────────────────────────────────────
  const MoreMenu = () => (
    <div className="absolute bottom-20 right-4 w-72 bg-[#1e1e2e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['view','report'] as const).map(s => (
          <button key={s} onClick={() => setMenuSection(s)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
              menuSection === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
            }`}>
            {s === 'view' ? '⚙️ View & Layout' : '🚨 Help & Report'}
          </button>
        ))}
      </div>

      {menuSection === 'view' && (
        <div className="p-4 space-y-4">
          {/* Layout options */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Layout</p>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { id:'auto', label:'Auto', icon:<Layout size={14}/> },
                { id:'tiled', label:'Tiled', icon:<LayoutGrid size={14}/> },
                { id:'spotlight', label:'Spotlight', icon:<LayoutPanelLeft size={14}/> },
                { id:'sidebar', label:'Sidebar', icon:<Columns size={14}/> },
              ] as const).map(({id,label,icon}) => (
                <button key={id} onClick={() => setViewLayout(id as ViewLayout)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    viewLayout === id ? 'bg-primary-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}>
                  {icon}{label}
                  {viewLayout === id && <Check size={11} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tile count rocker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tiles</p>
              <span className="text-xs font-semibold text-primary-400">{TILE_STEPS[tileCountIdx]}</span>
            </div>
            <input type="range" min={0} max={5} step={1} value={tileCountIdx}
              onChange={e => setTileCountIdx(Number(e.target.value))}
              className="w-full accent-primary-500 cursor-pointer"
            />
            <div className="flex justify-between mt-1">
              {TILE_STEPS.map(n => (
                <span key={n} className="text-[9px] text-white/30">{n}</span>
              ))}
            </div>
          </div>

          {/* Hide no-video tiles */}
          <button onClick={() => setHideTilesNoVideo(v => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 transition-all">
            <EyeOff size={14} className="text-white/50" />
            <span className="text-white/70">Hide tiles without video</span>
            <div className={`ml-auto w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${
              hideTilesNoVideo ? 'bg-primary-600' : 'bg-white/20'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                hideTilesNoVideo ? 'translate-x-4' : ''
              }`} />
            </div>
          </button>

          {/* Fullscreen + PiP */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10">
            <button onClick={() => { toggleFullscreen(); setShowMenu(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 transition-all">
              {isFullscreen ? <Minimize size={14}/> : <Maximize size={14}/>}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <button onClick={() => { togglePiP(); setShowMenu(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 transition-all">
              <PictureInPicture2 size={14}/> Picture-in-Picture
            </button>
          </div>
        </div>
      )}

      {menuSection === 'report' && (
        <div className="p-4 space-y-2">
          <button onClick={reportProblem}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 bg-white/5 hover:bg-white/10 transition-all">
            <Mail size={16} className="text-blue-400" />
            <div className="text-left">
              <p className="font-semibold text-white/90 text-xs">Report a Problem</p>
              <p className="text-[10px] text-white/40">Email the support team</p>
            </div>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </button>
          <button onClick={reportAbuse}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 bg-white/5 hover:bg-red-500/10 transition-all">
            <Flag size={16} className="text-red-400" />
            <div className="text-left">
              <p className="font-semibold text-red-300 text-xs">Report Abuse</p>
              <p className="text-[10px] text-white/40">Notify admin &amp; test team</p>
            </div>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </button>
        </div>
      )}
    </div>
  );

  // ── Formatting ────────────────────────────────────────────────
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const toastBg: Record<Toast['type'], string> = {
    success: 'bg-green-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="fixed inset-0 bg-meet-bg text-white flex flex-col select-none">

      {/* ── Toast stack ─────────────────────────────────────────── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`${toastBg[t.type]} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 pointer-events-auto animate-fade-in`}
          >
            {t.icon && <span className="text-base leading-none">{t.icon}</span>}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="bg-meet-surface px-4 py-3 flex items-center gap-4">
        <h1 className="text-base font-semibold">Video Call</h1>
        <div className="flex items-center gap-1.5 text-meet-text">
          <Clock size={14} />
          <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 ml-2">
          {isMuted && (
            <span className="flex items-center gap-1 bg-error-500/20 border border-error-500/40 text-error-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              <MicOff size={11} /> Muted
            </span>
          )}
          {isCameraOff && (
            <span className="flex items-center gap-1 bg-error-500/20 border border-error-500/40 text-error-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              <VideoOff size={11} /> Camera off
            </span>
          )}
          {isScreenSharing && (
            <span className="flex items-center gap-1 bg-primary-500/20 border border-primary-500/40 text-primary-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              <MonitorUp size={11} /> Sharing
            </span>
          )}
          {isHandRaised && (
            <span className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
              ✋ Hand raised
            </span>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">

        {/* ── Video tile grid — layout driven by viewLayout + tileCountIdx ── */}
        {(() => {
          const count = TILE_STEPS[tileCountIdx];

          // Fake participant slots (slot 0 = local, rest = remote placeholders)
          const slots = Array.from({ length: count }, (_, i) => i);

          // Grid column classes by count
          const gridCols: Record<number, string> = {
            1: 'grid-cols-1', 2: 'grid-cols-2',
            4: 'grid-cols-2', 6: 'grid-cols-3',
            9: 'grid-cols-3', 16: 'grid-cols-4',
          };
          const cols = gridCols[count] ?? 'grid-cols-2';

          if (viewLayout === 'spotlight') {
            return (
              <div className="flex-1 flex flex-col gap-2">
                {/* Large spotlight */}
                <div className="flex-1 bg-meet-surface rounded-xl overflow-hidden relative">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-meet-hover flex items-center justify-center mb-2">
                      <User size={28} className="opacity-40" />
                    </div>
                    <p className="text-xs opacity-40">Spotlight participant</p>
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded">Remote User</div>
                </div>
                {/* Thumbnail strip */}
                <div className="flex gap-2 h-24">
                  {[0,1].map(i => (
                    <div key={i} className="flex-1 bg-meet-surface rounded-lg overflow-hidden relative">
                      {i === 0 ? (
                        isCameraOff ? (
                          <div className="w-full h-full flex items-center justify-center bg-meet-hover">
                            <User size={18} className="text-meet-text" />
                          </div>
                        ) : <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-meet-hover">
                          <User size={18} className="opacity-30" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 text-[9px] bg-black/50 px-1 rounded">{i === 0 ? 'You' : `Participant ${i+1}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (viewLayout === 'sidebar') {
            return (
              <div className="flex-1 flex gap-2">
                {/* Main large video */}
                <div className="flex-1 bg-meet-surface rounded-xl overflow-hidden relative">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <User size={32} className="opacity-30 mb-1" />
                    <p className="text-xs opacity-30">Waiting for participant…</p>
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded">Remote User</div>
                </div>
                {/* Sidebar strip */}
                <div className="flex flex-col gap-2 w-36">
                  {slots.slice(0, 4).map(i => (
                    <div key={i} className="flex-1 bg-meet-surface rounded-lg overflow-hidden relative">
                      {i === 0 ? (
                        isCameraOff ? (
                          <div className="w-full h-full flex items-center justify-center bg-meet-hover">
                            <User size={16} className="text-meet-text" />
                          </div>
                        ) : <video ref={i === 0 ? localVideoRef : undefined} autoPlay playsInline muted className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-meet-hover">
                          <User size={16} className="opacity-30" />
                        </div>
                      )}
                      {i === 0 && isMuted && (
                        <div className="absolute top-1 right-1 bg-error-500 rounded-full p-0.5">
                          <MicOff size={8} />
                        </div>
                      )}
                      <div className="absolute bottom-0.5 left-1 text-[8px] bg-black/50 px-1 rounded">{i === 0 ? 'You' : `P${i+1}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // auto / tiled — grid layout
          return (
            <div className={`flex-1 grid ${cols} gap-2`}>
              {slots.map(i => (
                <div key={i} className="bg-meet-surface rounded-xl overflow-hidden relative min-h-0">
                  {i === 0 ? (
                    isCameraOff ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-meet-hover gap-1">
                        <div className="w-10 h-10 rounded-full bg-meet-surface flex items-center justify-center">
                          <User size={20} className="text-meet-text" />
                        </div>
                        <span className="text-xs text-meet-text">Camera off</span>
                      </div>
                    ) : (
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    )
                  ) : i === 1 ? (
                    <>
                      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <User size={32} className="opacity-20" />
                      </div>
                    </>
                  ) : (
                    hideTilesNoVideo ? null : (
                      <div className="w-full h-full flex items-center justify-center bg-meet-hover">
                        <User size={24} className="opacity-20" />
                      </div>
                    )
                  )}
                  {i === 0 && isMuted && (
                    <div className="absolute top-1.5 right-1.5 bg-error-500 rounded-full p-1">
                      <MicOff size={10} />
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-black/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    {i === 0 ? <>You {isHandRaised && '✋'}</> : i === 1 ? 'Remote User' : `Participant ${i+1}`}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Right sidebar – chat / participants */}
        {(showChat || showParticipants) && (
          <div className="w-72 bg-meet-surface rounded-xl flex flex-col border border-meet-hover overflow-hidden">
            {/* Sidebar tabs */}
            <div className="flex border-b border-meet-hover">
              <button
                onClick={() => { setShowParticipants(true); setShowChat(false); }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  showParticipants ? 'border-b-2 border-primary-500 text-primary-400' : 'text-meet-text hover:bg-meet-hover'
                }`}
              >
                <Users size={15} /> Participants
              </button>
              <button
                onClick={() => { setShowChat(true); setShowParticipants(false); }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  showChat ? 'border-b-2 border-primary-500 text-primary-400' : 'text-meet-text hover:bg-meet-hover'
                }`}
              >
                <MessageCircle size={15} /> Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {showParticipants && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-meet-hover flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-meet-text mt-0.5">Connected</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-meet-hover flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">You {isHandRaised ? '✋' : ''}</p>
                      <p className="text-xs text-meet-text mt-0.5">Host {isMuted ? '· Muted' : ''}</p>
                    </div>
                    {isHandRaised && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">
                        Hand raised
                      </span>
                    )}
                  </div>
                </div>
              )}
              {showChat && (
                <div className="space-y-3">
                  <div className="bg-meet-hover rounded-lg p-3">
                    <p className="text-xs text-meet-text mb-1">10:30 AM</p>
                    <p className="text-sm">Hi, can you see me?</p>
                  </div>
                  <div className="bg-primary-700 rounded-lg p-3 ml-4">
                    <p className="text-xs text-primary-300 mb-1">10:31 AM</p>
                    <p className="text-sm">Yes, loud and clear!</p>
                  </div>
                </div>
              )}
            </div>

            {showChat && (
              <div className="border-t border-meet-hover p-3">
                <input
                  type="text"
                  placeholder="Send a message…"
                  className="w-full bg-meet-hover text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-meet-text"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Control bar ──────────────────────────────────────────── */}
      <div className="bg-meet-surface px-4 py-4 flex items-center justify-center gap-2 flex-wrap">

        {/* Mute */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className={`flex flex-col items-center gap-1 group`}
        >
          <div className={`p-3 rounded-full transition-all ${
            isMuted ? 'bg-error-500 hover:bg-error-600' : 'bg-meet-hover hover:bg-white/10'
          }`}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          title={isCameraOff ? 'Start video' : 'Stop video'}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full transition-all ${
            isCameraOff ? 'bg-error-500 hover:bg-error-600' : 'bg-meet-hover hover:bg-white/10'
          }`}>
            {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">
            {isCameraOff ? 'Start Video' : 'Stop Video'}
          </span>
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full transition-all ${
            isScreenSharing ? 'bg-primary-600 hover:bg-primary-700' : 'bg-meet-hover hover:bg-white/10'
          }`}>
            <MonitorUp size={20} />
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">
            {isScreenSharing ? 'Stop Share' : 'Share Screen'}
          </span>
        </button>

        {/* Hand Raise */}
        <button
          onClick={toggleHandRaise}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full transition-all ${
            isHandRaised ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-meet-hover hover:bg-white/10'
          }`}>
            <Hand size={20} className={isHandRaised ? 'text-white' : ''} />
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">
            {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          </span>
        </button>

        {/* Chat */}
        <button
          onClick={() => { setShowChat(v => !v); setShowParticipants(false); }}
          title="Chat"
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full transition-all ${
            showChat ? 'bg-primary-600 hover:bg-primary-700' : 'bg-meet-hover hover:bg-white/10'
          }`}>
            <MessageCircle size={20} />
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">Chat</span>
        </button>

        {/* Participants */}
        <button
          onClick={() => { setShowParticipants(v => !v); setShowChat(false); }}
          title="Participants"
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full transition-all ${
            showParticipants ? 'bg-primary-600 hover:bg-primary-700' : 'bg-meet-hover hover:bg-white/10'
          }`}>
            <Users size={20} />
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">People</span>
        </button>

        {/* Recording */}
        <button onClick={toggleRecording} title={isRecording ? 'Stop recording' : 'Record meeting'}
          className="flex flex-col items-center gap-1 group">
          <div className={`p-3 rounded-full transition-all ${
            isRecording ? 'bg-error-500 hover:bg-error-600 animate-pulse' : 'bg-meet-hover hover:bg-white/10'
          }`}>
            {isRecording ? <StopCircle size={20} /> : <Circle size={20} />}
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">
            {isRecording ? 'Stop Rec' : 'Record'}
          </span>
        </button>

        {/* Three-dots menu */}
        <div className="relative">
          {showMenu && <MoreMenu />}
          <button onClick={() => setShowMenu(v => !v)} title="More options"
            className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-full transition-all ${
              showMenu ? 'bg-primary-600 hover:bg-primary-700' : 'bg-meet-hover hover:bg-white/10'
            }`}>
              <MoreVertical size={20} />
            </div>
            <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">More</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-meet-hover mx-1" />

        {/* Leave */}
        <button onClick={hangUp} title="Leave call" className="flex flex-col items-center gap-1 group">
          <div className="p-3 rounded-full bg-error-500 hover:bg-error-600 transition-all">
            <PhoneOff size={20} />
          </div>
          <span className="text-[10px] text-meet-text group-hover:text-white transition-colors">Leave</span>
        </button>
      </div>
    </div>
  );
}
