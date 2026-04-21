"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, Share2, Download, Upload, FileText, DownloadCloud, MonitorPlay, 
  ArrowLeft, Trash2, Sparkles, Radio, Activity, Gauge, Wifi, ShieldAlert
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState("Initializing...");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const peerInstance = useRef<any>(null);

  // 1. Force Download Function
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

  // 2. High-Stability Peer Initialization
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
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
          iceCandidatePoolSize: 10,
        },
      });

      newPeer.on("open", (id) => {
        setMyId(id);
        setPeer(newPeer);
        peerInstance.current = newPeer;
        setStatus("System Ready");
      });

      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setStatus("Sharing...");
          setProgress(20);
          files.forEach((f, i) => {
            conn.send({ 
              type: "stream", 
              file: f, 
              name: f.name, 
              mime: f.type 
            });
            setProgress(Math.round(((i + 1) / files.length) * 100));
          });
          setTimeout(() => { setStatus("Sent ✅"); setProgress(0); }, 2000);
        });
        conn.on("error", () => setStatus("Link Error ⚠️"));
      });

      newPeer.on("error", (err) => {
        console.error(err);
        setStatus("Network Error");
      });
    };
    initPeer();
  }, [files]);

  // 3. Receive Logic with Auto-Connect
  const handleReceiveConnect = (manualId?: string) => {
    const idToConnect = manualId || targetId;
    if (!idToConnect || !peer) return;

    setStatus("Handshaking...");
    setProgress(30);

    const conn = peer.connect(idToConnect, { 
      reliable: true,
      serialization: 'binary' 
    });

    conn.on("open", () => {
      setStatus("Connected ⚡");
      setProgress(50);
    });

    conn.on("data", (data: any) => {
      if (data.type === "stream") {
        setStatus("Acquiring...");
        const blob = new Blob([data.file], { type: data.mime });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: data.name, type: data.mime }]);
        setStatus("Received ✅");
        setProgress(100);
        setTimeout(() => setProgress(0), 1000);
      }
    });

    conn.on("error", () => {
      setStatus("Failed. Retry.");
      setProgress(0);
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("id");
    if (codeFromUrl && peer) {
      setTargetId(codeFromUrl);
      setView("receive");
      const t = setTimeout(() => handleReceiveConnect(codeFromUrl), 1000);
      return () => clearTimeout(t);
    }
  }, [peer]);

  const shareLink = typeof window !== 'undefined' ? `https://qshare69.vercel.app?id=${myId}` : "";

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans flex flex-col p-4 md:p-0 overflow-y-auto overflow-x-hidden">
      
      {/* Visual Ambiance */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/30 blur-[150px] rounded-full"></div>
      </div>

      <nav className="relative z-10 max-w-[1000px] mx-auto px-6 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-2 rounded-2xl shadow-lg shadow-indigo-600/40"><Zap fill="white" size={20} /></div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter">QSHARE <span className="text-indigo-500">PRO</span></h1>
            <p className="text-[7px] font-bold text-gray-500 tracking-[3px] uppercase italic">The Mango Programmer</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${status.includes("Ready") || status.includes("✅") ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
            </div>
            {progress > 0 && <div className="w-24 h-1 bg-white/5 mt-2 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${progress}%`}}></div></div>}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1000px] mx-auto w-full flex flex-col justify-start md:justify-center px-4 pb-12">
        {view === "home" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 text-center py-10">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[3px]">
                    <Wifi size={12}/> P2P Mesh Optimized
                </div>
                <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Flash <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-400">Transfer.</span></h2>
                <p className="text-gray-500 text-sm font-medium tracking-tight">Encrypted device-to-device streaming. No middleman.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button onClick={() => setView("send")} className="group bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all active:scale-95 shadow-2xl relative overflow-hidden">
                <Share2 className="text-indigo-500 mb-6 group-hover:rotate-12 transition-transform" size={64} />
                <h3 className="text-4xl font-black italic text-white uppercase leading-none">Send</h3>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Broadcast Assets</p>
                <div className="absolute top-0 right-0 p-8 opacity-5"><Share2 size={120}/></div>
              </button>
              <button onClick={() => setView("receive")} className="group bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all active:scale-95 shadow-2xl relative overflow-hidden">
                <DownloadCloud className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={64} />
                <h3 className="text-4xl font-black italic text-white uppercase leading-none">Get</h3>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Intercept Assets</p>
                <div className="absolute top-0 right-0 p-8 opacity-5"><DownloadCloud size={120}/></div>
              </button>
            </div>
          </div>
        )}

        {view === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in zoom-in duration-500">
            <div className="md:col-span-5 bg-white/5 border border-white/10 p-8 rounded-[56px] backdrop-blur-3xl flex flex-col items-center">
              <button onClick={() => setView("home")} className="self-start flex items-center gap-2 text-[10px] font-black text-gray-500 mb-8 hover:text-white transition-colors uppercase italic"><ArrowLeft size={16} /> Deck</button>
              
              <div className="w-full relative border-2 border-dashed border-white/10 rounded-[40px] p-12 bg-black/40 group text-center cursor-pointer hover:border-indigo-500/50 transition-all mb-8">
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="text-indigo-500 mx-auto mb-4 group-hover:-translate-y-2 transition-transform" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-gray-500">Upload Files</p>
              </div>

              {files.length > 0 && (
                <div className="w-full text-center space-y-6 animate-in zoom-in">
                  <div className="bg-white p-5 inline-block rounded-[40px] shadow-2xl shadow-indigo-500/40 border-[8px] border-white/10"><QRCodeCanvas value={shareLink} size={180} level="H" /></div>
                  <div>
                    <div className="text-5xl font-mono font-black text-white tracking-[12px]">{myId}</div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[6px] mt-2">Identity Token</p>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-7">
              {files.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-8 rounded-[56px] h-full max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[4px] text-gray-500 italic">Transfer Queue</h3>
                    <button onClick={() => setFiles([])} className="text-gray-500 hover:text-red-500 text-[10px] font-black uppercase italic">Clear All</button>
                  </div>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/5 mb-4 hover:border-indigo-500/20 transition-all group">
                      <div className="flex items-center gap-4 overflow-hidden"><div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><FileText size={24}/></div><div className="text-left overflow-hidden"><p className="text-sm font-black text-white truncate italic">{f.name}</p><p className="text-[9px] text-gray-600 font-bold uppercase">{(f.size / (1024*1024)).toFixed(2)} MB</p></div></div>
                      <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-gray-700 hover:text-red-500 group-hover:scale-110 transition-transform"><Trash2 size={22} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === "receive" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in zoom-in duration-500">
            <div className={`md:col-span-6 bg-white/5 border border-white/10 p-10 rounded-[56px] ${!receivedFiles.length ? 'md:col-start-4' : ''}`}>
               <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-10 hover:text-white transition-colors uppercase italic"><ArrowLeft size={16} /> Deck</button>
               {!receivedFiles.length ? (
                 <div className="space-y-12 text-center">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto animate-pulse">
                      <MonitorPlay className="text-emerald-500" size={56} />
                    </div>
                    <div className="space-y-4">
                        <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-white/5 border border-white/10 p-10 rounded-[40px] outline-none text-7xl text-emerald-400 font-mono text-center tracking-[12px] focus:ring-2 ring-emerald-500/30" onChange={(e) => setTargetId(e.target.value)} />
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[6px] italic leading-none">Enter Mesh Token</p>
                    </div>
                    <button onClick={() => handleReceiveConnect()} className="w-full bg-emerald-600 hover:bg-emerald-500 py-7 rounded-[40px] font-black tracking-widest uppercase text-xs text-white shadow-2xl shadow-emerald-600/40 active:scale-95 transition-all"> Establish Handshake </button>
                 </div>
               ) : (
                 <div className="bg-emerald-500/10 p-12 rounded-[56px] text-center border border-emerald-500/20 shadow-2xl">
                    <DownloadCloud size={72} className="text-white animate-bounce mx-auto mb-8" />
                    <h3 className="text-3xl font-black uppercase italic text-white mb-2 leading-none">Assets Decoded</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-12 italic leading-none">Everything is ready for extraction</p>
                    <button onClick={downloadAll} className="w-full bg-white text-black py-7 rounded-[40px] font-black tracking-widest uppercase text-xs shadow-2xl active:scale-95 hover:bg-gray-100 transition-all leading-none"> Extract All Assets </button>
                 </div>
               )}
            </div>
            {receivedFiles.length > 0 && (
                <div className="md:col-span-6 bg-white/5 border border-white/10 p-8 rounded-[56px] h-full max-h-[600px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-[10px] font-black uppercase tracking-[6px] text-emerald-500 mb-8 italic">Extraction Chamber</h3>
                  {receivedFiles.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-emerald-500/5 rounded-[32px] border border-emerald-500/10 mb-4 hover:border-emerald-500/30 transition-all">
                       <div className="flex items-center gap-4 overflow-hidden text-left"><div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400"><FileText size={24} /></div><div className="overflow-hidden"><p className="text-sm font-black italic text-white truncate">{f.name}</p></div></div>
                       <a href={f.url} download={f.name} className="p-3 bg-white text-black rounded-2xl hover:scale-110 transition-transform shadow-xl"><Download size={20} /></a>
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-12 text-center opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[12px] italic leading-none text-white">Project: QShare Pro by Masrur Siam</p>
      </footer>
    </div>
  );
}
