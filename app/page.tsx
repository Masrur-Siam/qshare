"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, Share2, Download, Upload, Copy, CheckCircle, 
  Loader2, ArrowLeft, Info, FileText, Smartphone, 
  Laptop, Files, DownloadCloud, Activity, 
  ShieldCheck, Globe, MonitorPlay, Infinity, Sparkles, Trash2, Link as LinkIcon
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [shareText, setShareText] = useState("");
  const [status, setStatus] = useState("Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const peerInstance = useRef<any>(null);

  // 1. Direct Link & Auto Connect Logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("id");
    if (codeFromUrl) {
      setTargetId(codeFromUrl);
      setView("receive");
      // Auto-trigger connection after a small delay to ensure peer is ready
      const timer = setTimeout(() => {
        handleReceiveConnect(codeFromUrl);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [peer]);

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

  // 2. Optimized PeerJS Initialization
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
            { urls: "stun:stun2.l.google.com:19302" }
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
          setIsTransferring(true);
          setStatus("Sending...");
          files.forEach((f) => {
            conn.send({ type: "file-transfer", file: f, fileName: f.name, fileType: f.type });
          });
          if (shareText.trim()) {
            const textBlob = new Blob([shareText], { type: "text/plain" });
            conn.send({ type: "file-transfer", file: textBlob, fileName: "Shared_Text.txt", fileType: "text/plain" });
          }
          setTimeout(() => {
            setIsTransferring(false);
            setStatus("Sent! ✅");
          }, 2000);
        });
      });
    };
    initPeer();
  }, [files, shareText]);

  // 3. Receive Connection Handler (Supports manual and auto)
  const handleReceiveConnect = (manualId?: string) => {
    const idToConnect = manualId || targetId;
    if (!idToConnect || !peer) return;

    setIsTransferring(true);
    setStatus("Connecting...");

    const conn = peer.connect(idToConnect, { reliable: true });

    conn.on("data", (data: any) => {
      if (data.type === "file-transfer") {
        const blob = new Blob([data.file], { type: data.fileType });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: data.fileName, type: data.fileType }]);
        setStatus("Success! ⚡");
      }
    });

    conn.on("error", () => {
      setStatus("Retry Scan ⚠️");
      setIsTransferring(false);
    });
  };

  const shareLink = typeof window !== 'undefined' ? `https://qshare69.vercel.app?id=${myId}` : "";

  return (
    <div className="min-h-screen bg-[#050507] text-[#e4e4e7] font-sans selection:bg-indigo-500/30 flex flex-col p-4 md:p-0 overflow-y-auto overflow-x-hidden">
      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 py-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-1.5 rounded-lg"><Zap fill="white" size={16} /></div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic text-white leading-none">QSHARE PRO</h1>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-400 italic">
          {status}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1200px] mx-auto w-full flex flex-col justify-start md:justify-center pb-10">
        <div className="w-full max-w-xl mx-auto mb-4">
           <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-[24px] flex items-center gap-4 shadow-2xl">
              <div className={`p-2.5 rounded-xl bg-white/5 ${view === 'send' ? 'text-indigo-400' : 'text-emerald-400'} animate-pulse`}><Sparkles /></div>
              <div className="flex-1 text-left">
                <p className="text-[12px] font-bold italic text-gray-200 uppercase tracking-tighter">
                  {view === 'send' ? "Step: QR Scan korle receiver auto-connect hobe." : "Step: Code auto-filled. Waiting for Handshake..."}
                </p>
              </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-2">
          {view === "home" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
              <button onClick={() => setView("send")} className="bg-white/5 border border-white/10 p-10 rounded-[40px] text-left active:scale-95 transition-all shadow-xl">
                 <Share2 className="text-indigo-500 mb-4" size={48} />
                 <h2 className="text-3xl font-black uppercase italic text-white">Send</h2>
                 <p className="text-gray-500 text-[10px] font-bold uppercase mt-1">Direct Mesh Tunnel</p>
              </button>
              <button onClick={() => setView("receive")} className="bg-white/5 border border-white/10 p-10 rounded-[40px] text-left active:scale-95 transition-all shadow-xl">
                 <Download className="text-emerald-500 mb-4" size={48} />
                 <h2 className="text-3xl font-black uppercase italic text-white">Receive</h2>
                 <p className="text-gray-500 text-[10px] font-bold uppercase mt-1">Instant Grab</p>
              </button>
            </div>
          )}

          {view === "send" && (
            <div className="flex flex-col md:flex-row gap-6 animate-in zoom-in w-full max-w-4xl mx-auto">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col w-full md:w-[45%] text-left">
                 <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-6 hover:text-white uppercase italic"><ArrowLeft size={14} /> Back</button>
                 <div className="space-y-4">
                    {!shareText && (
                        <div className="relative border-2 border-dashed border-white/10 rounded-[30px] p-10 bg-black/20 text-center">
                            <input type="file" multiple onChange={(e) => {setFiles(Array.from(e.target.files || []))}} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="mx-auto mb-2 text-gray-600" size={32} />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Files</p>
                        </div>
                    )}
                 </div>
                 {(files.length > 0 || shareText) && (
                   <div className="mt-8 bg-indigo-500/10 p-6 rounded-[35px] border border-indigo-500/20 text-center">
                      <div className="bg-white p-3 inline-block rounded-2xl mb-4 shadow-2xl"><QRCodeCanvas value={shareLink} size={140} level="H" /></div>
                      <p className="text-[10px] text-white font-black tracking-[4px] uppercase italic">{myId}</p>
                   </div>
                 )}
              </div>
              {(files.length > 0) && (
                <div className="w-full md:w-[55%] bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col text-left">
                  <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4 italic leading-none">Queue</h3>
                  <div className="space-y-3">
                    {files.map((f, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center text-white"><FileText size={16}/><p className="text-xs italic truncate flex-1 ml-3">{f.name}</p><button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}><Trash2 size={16}/></button></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "receive" && (
            <div className="flex flex-col md:flex-row gap-6 animate-in zoom-in w-full max-w-4xl mx-auto text-left">
              <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] w-full md:w-[45%]">
                 <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-600 mb-8 hover:text-white uppercase italic"><ArrowLeft size={14} /> Back</button>
                 {!receivedFiles.length ? (
                   <div className="space-y-10 text-center">
                      <div className="text-xs font-black uppercase text-gray-500 italic tracking-[2px]">Connecting to: {targetId}</div>
                      <input type="text" value={targetId} readOnly className="w-full bg-black/40 border border-white/10 p-8 rounded-[30px] outline-none text-6xl text-emerald-400 font-mono text-center tracking-[10px]" />
                      <button onClick={() => handleReceiveConnect()} className="w-full bg-emerald-600 py-6 rounded-[30px] font-black tracking-widest uppercase text-xs text-white"> Manual Retry </button>
                   </div>
                 ) : (
                   <div className="bg-emerald-500/10 p-10 rounded-[40px] text-center">
                      <DownloadCloud size={48} className="text-emerald-500 animate-bounce mb-8 mx-auto" />
                      <button onClick={downloadAll} className="w-full bg-white text-black py-5 rounded-[25px] font-black tracking-widest uppercase text-xs shadow-2xl"> Save Everything </button>
                   </div>
                 )}
              </div>
              {receivedFiles.length > 0 && (
                <div className="w-full md:w-[55%] bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-4 italic">Inbox</h3>
                  <div className="space-y-3">
                    {receivedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-emerald-500/5 rounded-2xl text-white">
                         <div className="flex items-center gap-3"><FileText size={18}/><p className="text-xs italic truncate">{f.name}</p></div>
                         <a href={f.url} download={f.name} className="p-2 bg-white text-black rounded-xl"><Download size={16} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center opacity-40 mt-auto">
        <p className="text-[8px] font-black uppercase tracking-[8px] italic leading-none text-white">Developer: Masrur Siam The Mango Programmer</p>
      </footer>
    </div>
  );
}
