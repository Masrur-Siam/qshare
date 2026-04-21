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

  // --- CORE FUNCTIONS (TOP LEVEL TO PREVENT BUILD ERROR) ---
  const downloadAll = () => {
    if (receivedFiles.length === 0) return;
    receivedFiles.forEach((f) => {
      const link = document.createElement("a");
      link.href = f.url;
      link.download = f.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleReceiveConnect = (manualId?: string) => {
    const idToConnect = manualId || targetId;
    if (!idToConnect || !peer) return;
    setIsTransferring(true);
    setStatus("Handshaking...");
    const conn = peer.connect(idToConnect, { reliable: true });
    conn.on("data", (data: any) => {
      if (data.type === "file") {
        const blob = new Blob([data.file], { type: data.mime });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: data.name, type: data.mime }]);
        setStatus("Asset Received ⚡");
      }
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("id");
    if (codeFromUrl && peer) {
      setTargetId(codeFromUrl);
      setView("receive");
      setTimeout(() => handleReceiveConnect(codeFromUrl), 1000);
    }
  }, [peer]);

  useEffect(() => {
    const initPeer = async () => {
      if (peerInstance.current) return;
      const { default: Peer } = await import("peerjs");
      const customId = Math.floor(100000 + Math.random() * 900000).toString();
      const newPeer = new Peer(customId, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ],
        },
      });
      newPeer.on("open", (id) => { setMyId(id); setPeer(newPeer); peerInstance.current = newPeer; });
      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setIsTransferring(true);
          setStatus("Streaming...");
          files.forEach((f) => conn.send({ type: "file", file: f, name: f.name, mime: f.type }));
          setTimeout(() => { setIsTransferring(false); setStatus("Success! ✅"); }, 1500);
        });
      });
    };
    initPeer();
  }, [files]);

  const shareLink = typeof window !== 'undefined' ? `https://qshare69.vercel.app?id=${myId}` : "";

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans selection:bg-indigo-500/50 flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-indigo-600/5 blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-emerald-600/5 blur-[120px]"></div>
      </div>

      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-2 rounded-2xl"><Zap fill="white" size={20} /></div>
          <h1 className="text-xl font-black tracking-tight uppercase italic leading-none">QSHARE PRO</h1>
        </div>
        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
          {status}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1000px] mx-auto w-full flex flex-col justify-start md:justify-center px-4 pb-12">
        {view === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase">Direct <span className="text-indigo-500">Mesh</span> Transfer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <button onClick={() => setView("send")} className="bg-white/5 border border-white/10 p-12 rounded-[48px] text-left hover:bg-white/[0.08] transition-all active:scale-95">
                <Share2 className="text-indigo-500 mb-6" size={48} />
                <h3 className="text-3xl font-black italic text-white uppercase">Send</h3>
                <p className="text-gray-500 text-xs font-bold uppercase mt-2 tracking-widest">Broadcast Assets</p>
              </button>
              <button onClick={() => setView("receive")} className="bg-white/5 border border-white/10 p-12 rounded-[48px] text-left hover:bg-white/[0.08] transition-all active:scale-95">
                <DownloadCloud className="text-emerald-500 mb-6" size={48} />
                <h3 className="text-3xl font-black italic text-white uppercase">Receive</h3>
                <p className="text-gray-500 text-xs font-bold uppercase mt-2 tracking-widest">Intercept Stream</p>
              </button>
            </div>
          </div>
        )}

        {view === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in zoom-in duration-500">
            <div className="md:col-span-5 bg-white/5 border border-white/10 p-8 rounded-[48px] backdrop-blur-xl">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-8 uppercase italic"><ArrowLeft size={16} /> Back</button>
              <div className="relative border-2 border-dashed border-white/10 rounded-[32px] p-12 bg-black/20 group text-center cursor-pointer">
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="text-indigo-500 mx-auto mb-4" size={32} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Select Files</p>
              </div>
              {files.length > 0 && (
                <div className="mt-8 text-center animate-in fade-in">
                  <div className="bg-white p-4 inline-block rounded-[32px] mb-6 shadow-2xl shadow-indigo-500/20"><QRCodeCanvas value={shareLink} size={150} level="H" /></div>
                  <div className="text-4xl font-mono font-black text-white tracking-[12px]">{myId}</div>
                </div>
              )}
            </div>
            <div className="md:col-span-7">
              {files.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-8 rounded-[48px] h-full overflow-y-auto max-h-[500px]">
                  <h3 className="text-xs font-black uppercase tracking-[4px] text-gray-500 mb-6">Queue</h3>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5 mb-3">
                      <div className="flex items-center gap-4 overflow-hidden"><FileText className="text-indigo-400"/><p className="text-sm font-bold text-white truncate italic">{f.name}</p></div>
                      <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500/50 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === "receive" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in zoom-in duration-500">
            <div className={`md:col-span-5 bg-white/5 border border-white/10 p-10 rounded-[48px] ${!receivedFiles.length ? 'md:col-start-4' : ''}`}>
               <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-10 uppercase italic"><ArrowLeft size={16} /> Back</button>
               {!receivedFiles.length ? (
                 <div className="space-y-10 text-center">
                    <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-white/5 border border-white/10 p-8 rounded-[32px] outline-none text-6xl text-emerald-400 font-mono text-center tracking-[10px]" onChange={(e) => setTargetId(e.target.value)} />
                    <button onClick={() => handleReceiveConnect()} className="w-full bg-emerald-600 py-6 rounded-[32px] font-black tracking-widest uppercase text-xs text-white shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"> Establish Mesh </button>
                 </div>
               ) : (
                 <div className="bg-emerald-500/10 p-12 rounded-[40px] text-center border border-emerald-500/20">
                    <DownloadCloud size={48} className="text-white animate-bounce mx-auto mb-8" />
                    <h3 className="text-2xl font-black uppercase italic text-white mb-2 leading-none">Assets Acquired</h3>
                    <button onClick={downloadAll} className="w-full bg-white text-black py-6 rounded-[32px] font-black tracking-widest uppercase text-xs shadow-2xl mt-10 active:scale-95 transition-all"> Extract All </button>
                 </div>
               )}
            </div>
            {receivedFiles.length > 0 && (
                <div className="md:col-span-7 bg-white/5 border border-white/10 p-8 rounded-[48px] h-full overflow-y-auto max-h-[500px]">
                  <h3 className="text-[10px] font-black uppercase tracking-[4px] text-emerald-500 mb-6 italic leading-none">Inbox</h3>
                  {receivedFiles.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 mb-3">
                       <div className="flex items-center gap-4 overflow-hidden text-left"><FileText className="text-emerald-400" /><p className="text-sm font-bold italic text-white truncate">{f.name}</p></div>
                       <a href={f.url} download={f.name} className="p-3 bg-white text-black rounded-2xl hover:scale-110 transition-transform"><Download size={18} /></a>
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-10 text-center opacity-40">
        <p className="text-[8px] font-black uppercase tracking-[8px] italic leading-none text-white">Developer: Masrur Siam The Mango Programmer</p>
      </footer>
    </div>
  );
}
