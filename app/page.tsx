"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, Share2, Download, Upload, FileText, DownloadCloud, MonitorPlay, 
  ArrowLeft, Trash2, Sparkles, Radio, Activity, Gauge
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState("Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const peerInstance = useRef<any>(null);

  // --- TURBO DOWNLOAD FUNCTION ---
  const downloadAll = () => {
    receivedFiles.forEach((f) => {
      const link = document.createElement("a");
      link.href = f.url;
      link.download = f.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // --- HIGH-SPEED CONNECTION HANDLER ---
  const handleReceiveConnect = (manualId?: string) => {
    const idToConnect = manualId || targetId;
    if (!idToConnect || !peer) return;

    setStatus("Handshaking...");
    setProgress(10);

    // High Reliability & Speed Config
    const conn = peer.connect(idToConnect, { 
      reliable: true,
      serialization: 'binary' // Binary transfer for maximum speed
    });

    conn.on("open", () => {
      setProgress(40);
      setStatus("Connected ⚡");
    });

    conn.on("data", (data: any) => {
      if (data.type === "stream") {
        setProgress(80);
        const blob = new Blob([data.file], { type: data.mime });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: data.name, type: data.mime }]);
        setStatus("Success ✅");
        setProgress(100);
        setTimeout(() => setProgress(0), 2000);
      }
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("id");
    if (codeFromUrl && peer) {
      setTargetId(codeFromUrl);
      setView("receive");
      setTimeout(() => handleReceiveConnect(codeFromUrl), 500);
    }
  }, [peer]);

  // --- PEER INITIALIZATION WITH MULTI-STUN ---
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
            { urls: "stun:stun3.l.google.com:19302" },
          ],
        },
      });

      newPeer.on("open", (id) => {
        setMyId(id);
        setPeer(newPeer);
        peerInstance.current = newPeer;
      });

      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setStatus("Streaming...");
          setProgress(30);
          files.forEach((f, index) => {
            conn.send({ type: "stream", file: f, name: f.name, mime: f.type });
            const progressVal = Math.round(((index + 1) / files.length) * 100);
            setProgress(progressVal);
          });
          setTimeout(() => { setStatus("Sent! ✅"); setProgress(0); }, 1500);
        });
      });
    };
    initPeer();
  }, [files]);

  const shareLink = typeof window !== 'undefined' ? `https://qshare69.vercel.app?id=${myId}` : "";

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans flex flex-col p-4 md:p-0 overflow-y-auto">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600 blur-[120px]"></div>
      </div>

      <nav className="relative z-10 max-w-[1000px] mx-auto px-6 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-2 rounded-2xl shadow-lg shadow-indigo-600/30"><Zap fill="white" size={20} /></div>
          <h1 className="text-xl font-black italic text-white leading-none tracking-tighter">QSHARE PRO</h1>
        </div>
        <div className="flex flex-col items-end">
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {status}
            </div>
            {progress > 0 && <div className="w-24 h-1 bg-white/10 mt-2 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-300" style={{width: `${progress}%`}}></div></div>}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1000px] mx-auto w-full flex flex-col justify-start md:justify-center pb-12">
        {view === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center py-10">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-[2px] mb-4">
                    <Gauge size={12}/> Turbo Stream Enabled
                </div>
                <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-tight">Mesh <span className="text-indigo-500">Speed.</span><br/>Zero Server.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setView("send")} className="group bg-white/5 border border-white/10 p-12 rounded-[48px] text-left hover:bg-white/[0.08] transition-all active:scale-95 shadow-2xl">
                <Share2 className="text-indigo-500 mb-6 group-hover:rotate-12 transition-transform" size={56} />
                <h3 className="text-3xl font-black italic text-white uppercase">Transmit</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">P2P File Transfer</p>
              </button>
              <button onClick={() => setView("receive")} className="group bg-white/5 border border-white/10 p-12 rounded-[48px] text-left hover:bg-white/[0.08] transition-all active:scale-95 shadow-2xl">
                <DownloadCloud className="text-emerald-500 mb-6 group-hover:bounce transition-transform" size={56} />
                <h3 className="text-3xl font-black italic text-white uppercase">Receive</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Intercept Assets</p>
              </button>
            </div>
          </div>
        )}

        {view === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in zoom-in duration-500 px-2">
            <div className="md:col-span-5 bg-white/5 border border-white/10 p-8 rounded-[48px] backdrop-blur-xl">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-8 hover:text-white transition-colors uppercase italic"><ArrowLeft size={16} /> Deck</button>
              <div className="relative border-2 border-dashed border-white/10 rounded-[32px] p-12 bg-black/20 group text-center cursor-pointer hover:border-indigo-500/50 transition-all">
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="text-indigo-500 mx-auto mb-4" size={40} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Load Assets</p>
              </div>
              {files.length > 0 && (
                <div className="mt-8 text-center animate-in zoom-in">
                  <div className="bg-white p-4 inline-block rounded-[32px] mb-6 shadow-2xl shadow-indigo-500/40"><QRCodeCanvas value={shareLink} size={160} level="H" /></div>
                  <div className="text-5xl font-mono font-black text-white tracking-[12px] mb-2">{myId}</div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[4px]">Handshake Identity</p>
                </div>
              )}
            </div>
            <div className="md:col-span-7">
              {files.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-8 rounded-[48px] h-full overflow-y-auto max-h-[550px] shadow-2xl">
                  <h3 className="text-[11px] font-black uppercase tracking-[4px] text-gray-500 mb-6">Stream Queue</h3>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 mb-4 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4 overflow-hidden"><FileText className="text-indigo-400" size={24}/><div className="text-left overflow-hidden"><p className="text-sm font-bold text-white truncate italic">{f.name}</p><p className="text-[9px] text-gray-600 uppercase font-black">{(f.size / (1024*1024)).toFixed(2)} MB</p></div></div>
                      <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-700 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === "receive" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in zoom-in duration-500 px-2">
            <div className={`md:col-span-6 bg-white/5 border border-white/10 p-10 rounded-[48px] ${!receivedFiles.length ? 'md:col-start-4' : ''}`}>
               <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-10 uppercase italic"><ArrowLeft size={16} /> Deck</button>
               {!receivedFiles.length ? (
                 <div className="space-y-10 text-center">
                    <MonitorPlay className="text-emerald-500 mx-auto animate-pulse" size={56} />
                    <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-white/5 border border-white/10 p-8 rounded-[35px] outline-none text-7xl text-emerald-400 font-mono text-center tracking-[12px] focus:ring-1 ring-emerald-500/50" onChange={(e) => setTargetId(e.target.value)} />
                    <button onClick={() => handleReceiveConnect()} className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-[35px] font-black tracking-widest uppercase text-xs text-white shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"> Intercept Mesh </button>
                 </div>
               ) : (
                 <div className="bg-emerald-500/10 p-12 rounded-[48px] text-center border border-emerald-500/20 shadow-2xl">
                    <DownloadCloud size={64} className="text-white animate-bounce mx-auto mb-8" />
                    <h3 className="text-3xl font-black uppercase italic text-white mb-2 leading-none">Assets Decoded</h3>
                    <button onClick={downloadAll} className="w-full bg-white text-black py-6 rounded-[35px] font-black tracking-widest uppercase text-[11px] shadow-2xl mt-10 active:scale-95 hover:bg-gray-100 transition-all"> Extract All Files </button>
                 </div>
               )}
            </div>
            {receivedFiles.length > 0 && (
                <div className="md:col-span-6 bg-white/5 border border-white/10 p-8 rounded-[48px] h-full overflow-y-auto max-h-[550px] shadow-2xl">
                  <h3 className="text-[11px] font-black uppercase tracking-[4px] text-emerald-500 mb-6 italic">Secure Inbox</h3>
                  {receivedFiles.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 mb-4">
                       <div className="flex items-center gap-4 overflow-hidden text-left"><FileText className="text-emerald-400" size={24} /><div className="overflow-hidden"><p className="text-sm font-bold italic text-white truncate">{f.name}</p></div></div>
                       <a href={f.url} download={f.name} className="p-3 bg-white text-black rounded-2xl hover:scale-110 transition-transform shadow-xl"><Download size={20} /></a>
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-10 text-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[10px] italic leading-none text-white">Developer: Masrur Siam The Mango Programmer</p>
      </footer>
    </div>
  );
}
