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

  // --- DOWNLOAD ALL FUNCTION (FIXED) ---
  const downloadAll = () => {
    receivedFiles.forEach((f) => {
      const link = document.createElement("a");
      link.href = f.url;
      link.download = f.name;
      link.click();
    });
  };

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
      home: { icon: <Sparkles />, color: "text-blue-400", title: "HI FRIEND!", msg: "Want to share something? Tap Send. Want to get something? Tap Receive." },
      send: { icon: <Share2 />, color: "text-indigo-400", title: "SENDING...", msg: (files.length > 0 || shareText) ? `Ready! Give this code to your friend: ${myId}` : "Pick a file or write a message to start sharing." },
      receive: { icon: <Download />, color: "text-emerald-400", title: "GETTING...", msg: receivedFiles.length > 0 ? "Got it! Tap 'Save Everything' to download." : "Type the 6-digit code your friend gave you." }
    };
    const current = steps[view];

    return (
      <div className="w-full max-w-xl mx-auto mb-4 animate-in slide-in-from-top-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-[24px] flex items-center gap-4 shadow-2xl">
          <div className={`p-2.5 rounded-xl bg-white/5 ${current.color} animate-pulse`}>{current.icon}</div>
          <div className="flex-1 text-left">
            <span className={`text-[8px] font-black uppercase tracking-[3px] ${current.color} italic block mb-0.5`}>{current.title}</span>
            <p className="text-[13px] text-gray-200 font-bold italic leading-tight">"{current.msg}"</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#050507] text-[#e4e4e7] font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col p-4 md:p-0">
      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
          <div className="bg-indigo-600 p-1.5 rounded-lg"><Zap fill="white" size={16} /></div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic text-white">QSHARE</h1>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-400 italic">
          {status}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1200px] mx-auto w-full flex flex-col justify-center overflow-hidden">
        <TopTutorial />

        <div className="flex-1 flex flex-col justify-center px-2">
          {view === "home" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-500">
              <button onClick={() => setView("send")} className="group bg-white/5 border border-white/10 p-8 rounded-[35px] hover:bg-indigo-500/5 transition-all text-left shadow-xl active:scale-95">
                 <Share2 className="text-indigo-500 mb-4" size={40} />
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Send</h2>
                 <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Files, Text or Links</p>
              </button>
              <button onClick={() => setView("receive")} className="group bg-white/5 border border-white/10 p-8 rounded-[35px] hover:bg-emerald-500/5 transition-all text-left shadow-xl active:scale-95">
                 <Download className="text-emerald-500 mb-4" size={40} />
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Receive</h2>
                 <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Get assets instantly</p>
              </button>
            </div>
          )}

          {view === "send" && (
            <div className="h-full flex flex-col md:flex-row gap-4 animate-in zoom-in overflow-hidden">
              <div className={`bg-white/5 border border-white/10 p-6 rounded-[35px] flex flex-col shadow-2xl transition-all ${files.length > 0 || shareText ? 'w-full md:w-[45%]' : 'w-full max-w-lg mx-auto h-[450px] justify-center'}`}>
                 <button onClick={() => {setView("home"); setFiles([]); setShareText("");}} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-6 hover:text-white uppercase italic leading-none"><ArrowLeft size={14} /> Back</button>
                 <div className="space-y-4 text-center">
                    {!shareText && (
                        <div className="relative border-2 border-dashed border-white/10 rounded-[25px] p-8 bg-black/20 group transition-all">
                            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="mx-auto mb-2 text-gray-600 group-hover:text-indigo-400" size={28} />
                            <p className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest">Select Files</p>
                        </div>
                    )}
                    {files.length === 0 && (
                        <div className="relative bg-black/40 border border-white/10 rounded-[25px] p-4 text-left">
                            <textarea className="w-full bg-transparent outline-none text-xs text-indigo-100 placeholder:text-gray-800 resize-none h-20 italic font-medium" placeholder="Paste link or text here..." value={shareText} onChange={(e) => {setFiles([]); setShareText(e.target.value)}} />
                        </div>
                    )}
                 </div>
                 {(files.length > 0 || shareText) && (
                   <div className="mt-6 bg-indigo-500/10 p-4 rounded-[25px] border border-indigo-500/20 text-center animate-in zoom-in">
                      <p className="text-[9px] text-indigo-400 font-black uppercase mb-2 tracking-[4px] italic">Handshake Code</p>
                      <div className="text-4xl font-mono font-black text-white tracking-[6px] mb-4">{myId}</div>
                      <div className="bg-white p-2 inline-block rounded-xl"><QRCodeCanvas value={myId} size={80} /></div>
                   </div>
                 )}
              </div>

              {(files.length > 0 || shareText) && (
                <div className="w-full md:w-[55%] bg-white/5 border border-white/10 p-6 rounded-[35px] flex flex-col overflow-hidden animate-in slide-in-from-right-8 text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-500 mb-4 italic leading-none">In Queue</h3>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-2 max-h-[350px] custom-scrollbar">
                    {shareText && <div className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20"><div className="flex items-center gap-3 overflow-hidden"><LinkIcon size={14} className="text-indigo-400"/><p className="text-xs font-bold truncate italic">Text Content</p></div><button onClick={() => setShareText("")} className="text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button></div>}
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"><div className="flex items-center gap-3 overflow-hidden"><FileText size={14} className="text-gray-500"/><p className="text-xs font-bold truncate italic">{f.name}</p></div><button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "receive" && (
            <div className="h-full flex flex-col md:flex-row gap-4 animate-in zoom-in overflow-hidden text-left">
              <div className={`bg-white/5 border border-white/10 p-8 rounded-[35px] flex flex-col shadow-2xl ${receivedFiles.length > 0 ? 'w-full md:w-[45%]' : 'w-full max-w-lg mx-auto h-full justify-center'}`}>
                 <button onClick={() => {setView("home"); setReceivedFiles([]);}} className="flex items-center gap-2 text-[10px] font-black text-gray-600 mb-8 hover:text-white uppercase italic leading-none"><ArrowLeft size={14} /> Back</button>
                 {!receivedFiles.length ? (
                   <div className="space-y-8 text-center py-4">
                      <MonitorPlay className="mx-auto text-gray-800 animate-pulse" size={40} />
                      <input type="text" maxLength={6} placeholder="000000" className="w-full bg-black/40 border border-white/10 p-6 rounded-[25px] outline-none focus:ring-1 ring-emerald-500 font-mono text-center text-6xl text-emerald-400 tracking-[8px]" onChange={(e) => setTargetId(e.target.value)} />
                      <button onClick={handleReceiveConnect} className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-[25px] font-black tracking-widest uppercase text-xs active:scale-95 transition-all"> Get Assets </button>
                   </div>
                 ) : (
                   <div className="bg-emerald-500/10 p-10 rounded-[35px] border border-emerald-500/20 text-center animate-in zoom-in h-full flex flex-col justify-center items-center">
                      <DownloadCloud size={40} className="text-emerald-500 animate-bounce mb-6" />
                      <h3 className="text-xl font-black uppercase italic text-white leading-none">Success!</h3>
                      <button onClick={downloadAll} className="w-full bg-white text-black py-4 rounded-[20px] font-black tracking-widest uppercase text-xs transition-all active:scale-95 shadow-2xl mt-8"> Save Everything </button>
                   </div>
                 )}
              </div>
              {receivedFiles.length > 0 && (
                <div className="w-full md:w-[55%] bg-white/5 border border-white/10 p-6 rounded-[35px] flex flex-col overflow-hidden animate-in slide-in-from-right-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[3px] text-emerald-500 mb-4 italic leading-none">Inbox</h3>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-2 max-h-[450px] custom-scrollbar">
                    {receivedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                         <div className="flex items-center gap-3 overflow-hidden text-left"><FileText size={16} className="text-emerald-400" /><p className="text-xs font-bold truncate italic text-white">{f.name}</p></div>
                         <a href={f.url} download={f.name} className="p-2 bg-white text-black rounded-lg hover:scale-110 transition-transform"><Download size={14} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center opacity-40 mt-auto">
        <p className="text-[8px] font-black uppercase tracking-[8px] italic leading-none">Developer: Masrur Siam The Mango Programmer</p>
      </footer>
    </div>
  );
}
