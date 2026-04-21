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
      const newPeer = new Peer(customId);
      newPeer.on("open", (id: string) => { setMyId(id); setPeer(newPeer); });

      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setIsTransferring(true);
          setStatus("Sending...");
          files.forEach((f) => conn.send({ type: "file-transfer", file: f, fileName: f.name, fileType: f.type }));
          if (shareText.trim()) {
            const textBlob = new Blob([shareText], { type: "text/plain" });
            conn.send({ type: "file-transfer", file: textBlob, fileName: "Shared_Text.txt", fileType: "text/plain" });
          }
          setTimeout(() => { setIsTransferring(false); setStatus("Sent! ✅"); }, 1500);
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

  const handleTextChange = (val: string) => {
    setFiles([]); 
    setShareText(val);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReceiveConnect = () => {
    if (!targetId || !peer) return;
    setIsTransferring(true);
    setStatus("Connecting...");
    const conn = peer.connect(targetId);
    conn.on("data", (data: any) => {
      if (data.type === "file-transfer") {
        const blob = new Blob([data.file], { type: data.fileType });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: data.fileName, type: data.fileType }]);
        setStatus("Got it! ⚡");
      }
    });
  };

  const downloadAll = () => {
    receivedFiles.forEach((f) => {
      const link = document.createElement("a"); link.href = f.url; link.download = f.name; link.click();
    });
  };

  // --- 7TH GRADE EASY TUTORIAL ---
  const TopTutorial = () => {
    const steps = {
      home: { icon: <Sparkles />, color: "text-blue-400", title: "HI THERE!", msg: "Click 'Send' to give files, or 'Receive' to get files from a friend." },
      send: { icon: <Share2 />, color: "text-indigo-400", title: "SENDING MODE", msg: (files.length > 0 || shareText) ? `Done! Now tell your friend this code: ${myId}` : "Step 1: Pick a file OR type some text in the box below." },
      receive: { icon: <Download />, color: "text-emerald-400", title: "RECEIVING MODE", msg: receivedFiles.length > 0 ? "Yay! Files are here. Click 'Batch Save' to keep them." : "Step 1: Type the 6-digit code your friend gave you." }
    };
    const current = steps[view];

    return (
      <div className="w-full max-w-xl mx-auto mb-6 animate-in slide-in-from-top-4 duration-700">
        <div className="bg-[#0f0f13]/80 border border-white/5 backdrop-blur-3xl p-4 rounded-[28px] flex items-center gap-4 shadow-xl">
          <div className={`p-2.5 rounded-xl bg-white/5 ${current.color} animate-bounce`}>{current.icon}</div>
          <div className="flex-1 text-left">
            <span className={`text-[8px] font-black uppercase tracking-[4px] ${current.color} italic block mb-0.5`}>{current.title}</span>
            <p className="text-[13px] text-gray-200 font-bold italic leading-tight">"{current.msg}"</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#050507] text-[#e4e4e7] font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      
      <nav className="relative z-10 max-w-[1200px] mx-auto px-6 py-5 flex justify-between items-center w-full border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("home")}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
            <Zap fill="white" size={18} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic tracking-widest leading-none">QSHARE PRO</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest italic leading-none">
          {status}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1200px] mx-auto px-6 w-full flex flex-col justify-center py-4 overflow-hidden">
        <TopTutorial />

        <div className="flex-1 flex flex-col justify-center">
          {view === "home" && (
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center h-full animate-in fade-in">
              <button onClick={() => setView("send")} className="flex-1 w-full max-w-sm group bg-[#0f0f13] border border-white/5 p-10 rounded-[40px] hover:border-indigo-500/50 transition-all text-left shadow-2xl relative overflow-hidden">
                 <Share2 className="text-indigo-500 mb-6" size={48} />
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 leading-none">Send</h2>
                 <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 italic leading-none">Files or Messages</p>
                 <div className="flex items-center gap-3 opacity-20"><Laptop size={18}/><div className="flex-1 h-[1px] bg-indigo-900 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-1/3 animate-ping"></div></div><Smartphone size={18}/></div>
              </button>
              <button onClick={() => setView("receive")} className="flex-1 w-full max-w-sm group bg-[#0f0f12] border border-white/5 p-10 rounded-[40px] hover:border-emerald-500/50 transition-all text-left shadow-2xl relative overflow-hidden">
                 <Download className="text-emerald-500 mb-6" size={48} />
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 leading-none">Receive</h2>
                 <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 italic leading-none">Get it now</p>
                 <div className="flex items-center gap-3 opacity-20"><Smartphone size={18}/><div className="flex-1 h-[1px] bg-emerald-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-1/3 animate-ping" style={{animationDirection: "reverse"}}></div></div><Laptop size={18}/></div>
              </button>
            </div>
          )}

          {view === "send" && (
            <div className="h-full flex flex-col md:flex-row gap-6 animate-in zoom-in overflow-hidden text-left">
              <div className={`flex flex-col bg-[#0f0f13] border border-white/5 p-8 rounded-[40px] shadow-2xl transition-all duration-500 ${files.length > 0 || shareText ? 'w-full md:w-[45%]' : 'w-full max-w-xl mx-auto h-full justify-center'}`}>
                 <button onClick={() => {setView("home"); setFiles([]); setShareText("");}} className="flex items-center gap-2 text-[10px] font-black text-gray-600 mb-6 hover:text-white uppercase tracking-[3px] italic leading-none w-fit"><ArrowLeft size={16} /> Back</button>
                 
                 <div className="space-y-4">
                    {!shareText && (
                        <div className="relative border-2 border-dashed border-white/10 rounded-[30px] p-8 text-center hover:border-indigo-500/40 bg-black/20 group cursor-pointer transition-all">
                            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="mx-auto mb-2 text-gray-700 group-hover:text-indigo-500 transition-colors" size={32} />
                            <p className="text-[9px] font-black text-gray-500 uppercase italic tracking-widest leading-none">Choose Files</p>
                        </div>
                    )}
                    {files.length === 0 && (
                        <div className="relative bg-black/40 border border-white/10 rounded-[30px] p-4">
                            <div className="flex items-center gap-2 mb-2 text-gray-600"><LinkIcon size={14}/><span className="text-[9px] font-black uppercase italic tracking-widest">Type Text or Link</span></div>
                            <textarea className="w-full bg-transparent outline-none text-xs text-indigo-100 placeholder:text-gray-800 resize-none h-24 italic font-medium" placeholder="Write here..." value={shareText} onChange={(e) => handleTextChange(e.target.value)} />
                        </div>
                    )}
                 </div>

                 {(files.length > 0 || shareText) && (
                   <div className="mt-6 bg-indigo-600/5 p-6 rounded-[35px] border border-indigo-500/10 text-center animate-in zoom-in">
                      <p className="text-[9px] text-indigo-500 font-black uppercase mb-3 tracking-[5px] italic leading-none">Your Code</p>
                      <div className="text-5xl font-mono font-black text-white tracking-[8px] mb-4">{myId}</div>
                      <div className="bg-white p-2 inline-block rounded-2xl shadow-xl"><QRCodeCanvas value={myId} size={100} /></div>
                   </div>
                 )}
              </div>

              {(files.length > 0 || shareText) && (
                <div className="w-full md:w-[55%] bg-[#0f0f13] border border-white/5 p-8 rounded-[40px] shadow-2xl animate-in slide-in-from-right-10 flex flex-col overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-[5px] text-gray-500 mb-6 flex items-center gap-2 italic leading-none"><Files size={14} className="text-indigo-500" /> Sending Now</h3>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[450px]">
                    {shareText && (
                        <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 group">
                            <div className="flex items-center gap-3 overflow-hidden text-left">
                                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400"><LinkIcon size={16} /></div>
                                <p className="text-xs font-bold truncate text-gray-300 italic leading-none">Your Message</p>
                            </div>
                            <button onClick={() => setShareText("")} className="p-2 text-red-500/40 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group animate-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-3 overflow-hidden text-left">
                            <div className="p-2 rounded-xl bg-white/5 text-gray-500"><FileText size={16} /></div>
                            <p className="text-xs font-bold truncate text-gray-300 italic leading-none">{f.name}</p>
                         </div>
                         <button onClick={() => removeFile(i)} className="p-2 text-red-500/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "receive" && (
            <div className="h-full flex flex-col md:flex-row gap-6 animate-in zoom-in overflow-hidden text-left">
              <div className={`flex flex-col bg-[#0f0f12] border border-white/5 p-8 rounded-[40px] shadow-2xl ${receivedFiles.length > 0 ? 'md:w-1/2' : 'w-full max-w-xl mx-auto h-full justify-center'}`}>
                 <button onClick={() => {setView("home"); setReceivedFiles([]);}} className="flex items-center gap-2 text-[10px] font-black text-gray-600 mb-8 hover:text-white uppercase tracking-[3px] italic leading-none w-fit"><ArrowLeft size={16} /> Back</button>
                 {!receivedFiles.length ? (
                   <div className="space-y-10 text-center">
                      <MonitorPlay className="mx-auto text-gray-800 animate-pulse" size={40} />
                      <input type="text" maxLength={6} placeholder="000000" className="w-full bg-black/40 border border-white/10 p-8 rounded-[30px] outline-none focus:ring-1 ring-emerald-500 font-mono text-center text-7xl md:text-8xl text-emerald-400 tracking-[10px]" onChange={(e) => setTargetId(e.target.value)} />
                      <button onClick={handleReceiveConnect} className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-[30px] font-black tracking-widest uppercase text-xs active:scale-95 transition-all shadow-xl shadow-emerald-900/20"> Get Files </button>
                   </div>
                 ) : (
                   <div className="bg-emerald-500/5 p-10 rounded-[45px] border border-emerald-500/20 text-center animate-in zoom-in h-full flex flex-col justify-center items-center">
                      <DownloadCloud size={40} className="text-emerald-500 animate-bounce mb-6" />
                      <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter text-white">Files Received!</h3>
                      <button onClick={downloadAll} className="w-full bg-white text-black py-5 rounded-[25px] font-black tracking-widest hover:bg-gray-200 uppercase text-xs transition-all active:scale-95 shadow-2xl mt-8"> Save All Files </button>
                   </div>
                 )}
              </div>
              {receivedFiles.length > 0 && (
                <div className="w-full md:w-1/2 bg-[#0f0f13] border border-white/5 p-8 rounded-[40px] shadow-2xl animate-in slide-in-from-right-10 flex flex-col overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-[5px] text-emerald-500 mb-6 flex items-center gap-2 italic leading-none"><Files size={14} /> Inbox</h3>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[450px]">
                    {receivedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 group text-left animate-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-4 overflow-hidden"><div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400"><FileText size={18} /></div><p className="text-xs font-bold truncate text-white italic leading-none">{f.name}</p></div>
                         <a href={f.url} download={f.name} className="bg-white text-black p-2.5 rounded-xl hover:scale-110 transition-transform shadow-lg"><Download size={16} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center opacity-30 mt-auto">
        <p className="text-[9px] font-black uppercase tracking-[10px] italic leading-none">Developer: Masrur Siam The Mango Programmer</p>
      </footer>
    </div>
  );
}