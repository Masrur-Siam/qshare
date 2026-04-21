"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, Share2, Download, Upload, Copy, CheckCircle, 
  Loader2, ArrowLeft, Info, FileText, Smartphone, 
  Laptop, Files, DownloadCloud, Activity, 
  ShieldCheck, Globe, MonitorPlay, Infinity, Sparkles, Trash2, Link as LinkIcon, Radio
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [shareText, setShareText] = useState("");
  const [status, setStatus] = useState("System Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const peerInstance = useRef<any>(null);

  // --- Auto-Connect System ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("id");
    if (codeFromUrl && peer) {
      setTargetId(codeFromUrl);
      setView("receive");
      const timer = setTimeout(() => handleReceiveConnect(codeFromUrl), 800);
      return () => clearTimeout(timer);
    }
  }, [peer]);

  // --- Fast Peer Initialization ---
  useEffect(() => {
    const initPeer = async () => {
      if (peerInstance.current) return;
      const { default: Peer } = await import("peerjs");
      const customId = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newPeer = new Peer(customId, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun.services.mozilla.com" }
          ],
          iceTransportPolicy: 'all',
        },
      });

      newPeer.on("open", (id) => {
        setMyId(id);
        setPeer(newPeer);
        peerInstance.current = newPeer;
      });

      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setIsTransferring(true);
          setStatus("Streaming...");
          files.forEach((f) => {
            conn.send({ type: "file", file: f, name: f.name, mime: f.type });
          });
          setTimeout(() => {
            setIsTransferring(false);
            setStatus("Success! ✅");
          }, 1500);
        });
      });
    };
    initPeer();
  }, [files]);

  const handleReceiveConnect = (manualId?: string) => {
    const idToConnect = manualId || targetId;
    if (!idToConnect || !peer) return;

    setIsTransferring(true);
    setStatus("Handshaking...");

    const conn = peer.connect(idToConnect, { 
        reliable: true,
        metadata: { fastMode: true }
    });

    conn.on("data", (data: any) => {
      if (data.type === "file") {
        const blob = new Blob([data.file], { type: data.mime });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: data.name, type: data.mime }]);
        setStatus("Asset Received ⚡");
      }
    });
  };

  const shareLink = typeof window !== 'undefined' ? `https://qshare69.vercel.app?id=${myId}` : "";

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans selection:bg-indigo-500/50 flex flex-col overflow-y-auto overflow-x-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
      </div>

      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-2 rounded-2xl shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
            <Zap fill="white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase italic leading-none">QSHARE <span className="text-indigo-500">PRO</span></h1>
            <p className="text-[7px] font-bold text-gray-500 tracking-[3px] uppercase mt-1">Mesh Network v3.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
          <div className={`w-1.5 h-1.5 rounded-full ${isTransferring ? 'bg-yellow-400 animate-ping' : 'bg-emerald-500'}`}></div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1000px] mx-auto w-full flex flex-col justify-start md:justify-center px-4 pb-12">
        
        {view === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">TRANSFER <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">ANYTHING.</span></h2>
              <p className="text-gray-500 text-sm font-medium">Ultra-secure peer-to-peer sharing. No servers, no logs, just speed.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setView("send")} className="group relative overflow-hidden bg-white/5 border border-white/10 p-10 rounded-[48px] text-left hover:bg-white/[0.08] transition-all active:scale-[0.98]">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Share2 size={120} />
                </div>
                <Share2 className="text-indigo-500 mb-6" size={48} />
                <h3 className="text-3xl font-black italic text-white uppercase">Transmit</h3>
                <p className="text-gray-500 text-xs font-bold uppercase mt-2 tracking-widest">Send Files & Assets</p>
              </button>

              <button onClick={() => setView("receive")} className="group relative overflow-hidden bg-white/5 border border-white/10 p-10 rounded-[48px] text-left hover:bg-white/[0.08] transition-all active:scale-[0.98]">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DownloadCloud size={120} />
                </div>
                <DownloadCloud className="text-emerald-500 mb-6" size={48} />
                <h3 className="text-3xl font-black italic text-white uppercase">Intercept</h3>
                <p className="text-gray-500 text-xs font-bold uppercase mt-2 tracking-widest">Receive Assets</p>
              </button>
            </div>
          </div>
        )}

        {view === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in zoom-in duration-500">
            <div className="md:col-span-5 bg-white/5 border border-white/10 p-8 rounded-[48px] backdrop-blur-xl flex flex-col">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-8 hover:text-white transition-colors uppercase italic"><ArrowLeft size={16} /> Back to Deck</button>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="relative border-2 border-dashed border-white/10 rounded-[32px] p-12 bg-black/20 hover:border-indigo-500/50 transition-all group text-center cursor-pointer">
                  <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-indigo-500" size={32} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Drop Assets Here</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <div className="bg-white p-4 inline-block rounded-[32px] shadow-2xl shadow-indigo-500/20 mb-6">
                    <QRCodeCanvas value={shareLink} size={150} level="H" />
                  </div>
                  <div className="text-4xl font-mono font-black text-white tracking-[12px] mb-2">{myId}</div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[4px]">Mesh Identity Code</p>
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              {files.length > 0 ? (
                <div className="bg-white/5 border border-white/10 p-8 rounded-[48px] h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[4px] text-gray-500">Transfer Queue</h3>
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">{files.length} Files</span>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[400px] custom-scrollbar">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><FileText size={20} /></div>
                          <div className="text-left overflow-hidden">
                            <p className="text-sm font-bold text-white truncate w-full italic">{f.name}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full bg-white/5 border border-white/10 rounded-[48px] flex flex-col items-center justify-center p-12 text-center opacity-50 grayscale">
                    <Radio className="text-gray-700 mb-4 animate-pulse" size={64} />
                    <p className="text-xs font-black uppercase tracking-[6px] text-gray-600 italic leading-tight">Waiting for <br/> asset selection</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "receive" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in zoom-in duration-500">
            <div className={`md:col-span-5 bg-white/5 border border-white/10 p-10 rounded-[48px] flex flex-col ${!receivedFiles.length ? 'md:col-start-4' : ''}`}>
               <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-10 hover:text-white transition-colors uppercase italic"><ArrowLeft size={16} /> Back to Deck</button>
               {!receivedFiles.length ? (
                 <div className="space-y-10 text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                      <MonitorPlay className="text-emerald-500" size={40} />
                    </div>
                    <div className="space-y-2">
                        <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-white/5 border border-white/10 p-8 rounded-[32px] outline-none text-6xl text-emerald-400 font-mono text-center tracking-[10px] focus:border-emerald-500/50 transition-all" onChange={(e) => setTargetId(e.target.value)} />
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[4px]">Intercept Identity Code</p>
                    </div>
                    <button onClick={() => handleReceiveConnect()} className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-[32px] font-black tracking-widest uppercase text-xs text-white shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all"> Establish Mesh </button>
                 </div>
               ) : (
                 <div className="bg-emerald-500/10 p-12 rounded-[40px] text-center border border-emerald-500/20">
                    <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40">
                      <DownloadCloud size={48} className="text-white animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic text-white mb-2">Assets Acquired</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-10">All files ready for extraction</p>
                    <button onClick={downloadAll} className="w-full bg-white text-black py-6 rounded-[32px] font-black tracking-widest uppercase text-xs shadow-2xl hover:bg-gray-100 transition-all active:scale-[0.95]"> Extract All Files </button>
                 </div>
               )}
            </div>

            {receivedFiles.length > 0 && (
                <div className="md:col-span-7 bg-white/5 border border-white/10 p-8 rounded-[48px] h-full flex flex-col text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-[4px] text-emerald-500 mb-6 italic leading-none">Extraction Chamber</h3>
                  <div className="space-y-3 overflow-y-auto pr-2 max-h-[450px] custom-scrollbar">
                    {receivedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                         <div className="flex items-center gap-4 overflow-hidden">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><FileText size={20} /></div>
                            <p className="text-sm font-bold italic text-white truncate max-w-[200px]">{f.name}</p>
                         </div>
                         <a href={f.url} download={f.name} className="p-3 bg-white text-black rounded-2xl hover:scale-110 transition-transform shadow-xl"><Download size={18} /></a>
                      </div>
                    ))}
                  </div>
                </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-10 text-center relative z-10">
        <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
            <p className="text-[8px] font-black uppercase tracking-[8px] italic leading-none text-gray-500">Developer: Masrur Siam The Mango Programmer</p>
        </div>
      </footer>
    </div>
  );
}
