"use client";
import React, { useState, useEffect } from "react";
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

  // --- CORE FUNCTIONS ---
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

  useEffect(() => {
    const initPeer = async () => {
      const { default: Peer } = await import("peerjs");
      const customId = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newPeer = new Peer(customId, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      newPeer.on("open", (id: string) => { setMyId(id); setPeer(newPeer); });

      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setIsTransferring(true);
          setStatus("Sharing...");
          files.forEach((f) => conn.send({ type: "file-transfer", file: f, fileName: f.name, fileType: f.type }));
          if (shareText.trim()) {
            const textBlob = new Blob([shareText], { type: "text/plain" });
            conn.send({ type: "file-transfer", file: textBlob, fileName: "Shared_Text.txt", fileType: "text/plain" });
          }
          setTimeout(() => { setIsTransferring(false); setStatus("Sent! ✅"); }, 1000);
        });
      });
    };
    initPeer();
  }, [files, shareText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setShareText(""); 
      setFiles(Array.from(e.target.files));
    }
  };

  const handleReceiveConnect = () => {
    if (!targetId || !peer) return;
    setIsTransferring(true);
    setStatus("Connecting...");
    const conn = peer.connect(targetId, { reliable: true });
    conn.on("data", (data: any) => {
      if (data.type === "file-transfer") {
        const blob = new Blob([data.file], { type: data.fileType });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: data.fileName, type: data.fileType }]);
        setStatus("Success! ⚡");
      }
    });
  };

  const TopTutorial = () => {
    const steps = {
      home: { icon: <Sparkles />, color: "text-blue-400", title: "HI FRIEND!", msg: "Tap Send to share or Receive to get files." },
      send: { icon: <Share2 />, color: "text-indigo-400", title: "SENDING...", msg: (files.length > 0 || shareText) ? `Handshake Code: ${myId}` : "Upload your assets to begin." },
      receive: { icon: <Download />, color: "text-emerald-400", title: "GETTING...", msg: receivedFiles.length > 0 ? "Files received! Save them below." : "Enter the 6-digit code." }
    };
    const current = steps[view];

    return (
      <div className="w-full max-w-xl mx-auto mb-4 animate-in slide-in-from-top-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-[24px] flex items-center gap-4 shadow-2xl">
          <div className={`p-2.5 rounded-xl bg-white/5 ${current.color} animate-pulse`}>{current.icon}</div>
          <div className="flex-1 text-left text-white">
            <span className={`text-[8px] font-black uppercase tracking-[3px] ${current.color} italic block mb-0.5`}>{current.title}</span>
            <p className="text-[12px] font-bold italic leading-tight">"{current.msg}"</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#e4e4e7] font-sans selection:bg-indigo-500/30 flex flex-col p-4 md:p-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 py-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
          <div className="bg-indigo-600 p-1.5 rounded-lg"><Zap fill="white" size={16} /></div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic text-white">QSHARE</h1>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-400 italic">
          {status}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1200px] mx-auto w-full flex flex-col justify-start md:justify-center pb-10">
        <TopTutorial />

        <div className="flex-1 flex flex-col justify-center px-2">
          {view === "home" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-500">
              <button onClick={() => setView("send")} className="group bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-indigo-500/5 transition-all text-left shadow-xl active:scale-95">
                 <Share2 className="text-indigo-500 mb-4" size={48} />
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Send</h2>
                 <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Files, Text or Links</p>
              </button>
              <button onClick={() => setView("receive")} className="group bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-emerald-500/5 transition-all text-left shadow-xl active:scale-95">
                 <Download className="text-emerald-500 mb-4" size={48} />
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Receive</h2>
                 <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Get assets instantly</p>
              </button>
            </div>
          )}

          {view === "send" && (
            <div className="flex flex-col md:flex-row gap-6 animate-in zoom-in w-full max-w-4xl mx-auto">
              <div className={`bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col shadow-2xl transition-all w-full ${files.length > 0 || shareText ? 'md:w-[45%]' : 'max-w-lg mx-auto'}`}>
                 <button onClick={() => {setView("home"); setFiles([]); setShareText("");}} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-6 hover:text-white uppercase italic leading-none"><ArrowLeft size={14} /> Back</button>
                 <div className="space-y-4 text-center">
                    {!shareText && (
                        <div className="relative border-2 border-dashed border-white/10 rounded-[30px] p-10 bg-black/20 group transition-all">
                            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="mx-auto mb-2 text-gray-600 group-hover:text-indigo-400" size={32} />
                            <p className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest">Select Files</p>
                        </div>
                    )}
                    {files.length === 0 && (
                        <div className="relative bg-black/40 border border-white/10 rounded-[30px] p-5 text-left">
                            <textarea className="w-full bg-transparent outline-none text-sm text-indigo-100 placeholder:text-gray-800 resize-none h-24 italic font-medium" placeholder="Paste link or text here..." value={shareText} onChange={(e) => {setFiles([]); setShareText(e.target.value)}} />
                        </div>
                    )}
                 </div>
                 {(files.length > 0 || shareText) && (
                   <div className="mt-8 bg-indigo-500/10 p-6 rounded-[35px] border border-indigo-500/20 text-center animate-in zoom-in">
                      <p className="text-[9px] text-indigo-400 font-black uppercase mb-2 tracking-[4px] italic">Handshake Code</p>
                      <div className="text-5xl font-mono font-black text-white tracking-[8px] mb-6">{myId}</div>
                      <div className="bg-white p-3 inline-block rounded-2xl shadow-2xl shadow-indigo-500/20"><QRCodeCanvas value={myId} size={100} /></div>
                   </div>
                 )}
              </div>

              {(files.length > 0 || shareText) && (
                <div className="w-full md:w-[55%] bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col shadow-xl animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-500 mb-4 italic leading-none">In Queue</h3>
                  <div className="space-y-3">
                    {shareText && <div className="flex items-center justify-between p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20"><div className="flex items-center gap-3 overflow-hidden text-white"><LinkIcon size={16} className="text-indigo-400"/><p className="text-xs font-bold truncate italic">Text Content</p></div><button onClick={() => setShareText("")} className="text-red-500/50 hover:text-red-500"><Trash2 size={16}/></button></div>}
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"><div className="flex items-center gap-3 overflow-hidden text-white"><FileText size={16} className="text-gray-500"/><p className="text-xs font-bold truncate italic text-white">{f.name}</p></div><button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500/50 hover:text-red-500"><Trash2 size={16}/></button></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "receive" && (
            <div className="flex flex-col md:flex-row gap-6 animate-in zoom-in w-full max-w-4xl mx-auto text-left">
              <div className={`bg-white/5 border border-white/10 p-10 rounded-[40px] flex flex-col shadow-2xl w-full ${receivedFiles.length > 0 ? 'md:w-[45%]' : 'max-w-lg mx-auto'}`}>
                 <button onClick={() => {setView("home"); setReceivedFiles([]);}} className="flex items-center gap-2 text-[10px] font-black text-gray-600 mb-8 hover:text-white uppercase italic leading-none"><ArrowLeft size={14} /> Back</button>
                 {!receivedFiles.length ? (
                   <div className="space-y-10 text-center">
                      <MonitorPlay className="mx-auto text-gray-800 animate-pulse" size={48} />
                      <input type="text" maxLength={6} placeholder="000000" className="w-full bg-black/40 border border-white/10 p-8 rounded-[30px] outline-none focus:ring-2 ring-emerald-500/50 font-mono text-center text-6xl text-emerald-400 tracking-[10px] shadow-inner" onChange={(e) => setTargetId(e.target.value)} />
                      <button onClick={handleReceiveConnect} className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-[30px] font-black tracking-widest uppercase text-[11px] active:scale-95 transition-all shadow-xl shadow-emerald-900/20 text-white"> Get Assets </button>
                   </div>
                 ) : (
                   <div className="bg-emerald-500/10 p-10 rounded-[40px] border border-emerald-500/20 text-center animate-in zoom-in h-full flex flex-col justify-center items-center">
                      <DownloadCloud size={48} className="text-emerald-500 animate-bounce mb-8" />
                      <h3 className="text-2xl font-black uppercase italic text-white leading-none">Success!</h3>
                      <button onClick={downloadAll} className="w-full bg-white text-black py-5 rounded-[25px] font-black tracking-widest uppercase text-xs transition-all active:scale-95 shadow-2xl mt-10"> Save Everything </button>
                   </div>
                 )}
              </div>
              {receivedFiles.length > 0 && (
                <div className="w-full md:w-[55%] bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col shadow-xl animate-in slide-in-from-bottom-8 md:slide-in-from-right-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[3px] text-emerald-500 mb-4 italic leading-none">Inbox</h3>
                  <div className="space-y-3">
                    {receivedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                         <div className="flex items-center gap-3 overflow-hidden text-left"><FileText size={18} className="text-emerald-400" /><p className="text-xs font-bold truncate italic text-white">{f.name}</p></div>
                         <a href={f.url} download={f.name} className="p-2.5 bg-white text-black rounded-xl hover:scale-110 transition-transform"><Download size={16} /></a>
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
