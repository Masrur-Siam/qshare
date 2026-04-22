"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Zap, Share2, Download, Upload, FileText, DownloadCloud, 
  ArrowLeft, Trash2, ShieldCheck, CheckCircle2, Sparkles, 
  Globe, Activity, Link as LinkIcon, AlertCircle
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

// --- SUPABASE CONFIG (ALREADY REPLACED WITH YOUR DETAILS) ---
const supabase = createClient(
  "https://vecwracghzskshbfspaq.supabase.co", 
  "sb_publishable_Jjk2Inwcx_laMMBf8Tcgtw_a6USXPon" 
);

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("System Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // --- UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (files.length === 0) {
      setStatus("No files selected!");
      return;
    }
    setUploading(true);
    setStatus("Connecting to Mesh...");
    
    const shareId = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      for (const file of files) {
        const filePath = `${shareId}/${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from("qshare-files")
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Upload Failed:", uploadError.message);
          setStatus(`Storage Blocked: Check Policies`);
          setUploading(false);
          return;
        }
      }

      setMyId(shareId);
      setStatus("Live ✅");
    } catch (err: any) {
      console.error("System Error:", err);
      setStatus("Network Failure ❌");
    } finally {
      setUploading(false);
    }
  };

  const handleReceive = async (manualId?: string) => {
    const id = manualId || targetId;
    if (!id || id.length < 6) {
      setStatus("Enter 6-digit code");
      return;
    }
    setStatus("Intercepting Assets...");
    try {
      const { data, error } = await supabase.storage.from("qshare-files").list(id);
      if (data && data.length > 0) {
        const fetchedFiles = data.map((f) => {
          const { data: urlData } = supabase.storage.from("qshare-files").getPublicUrl(`${id}/${f.name}`);
          return { name: f.name, url: urlData.publicUrl };
        });
        setReceivedFiles(fetchedFiles);
        setStatus("Assets Found! ⚡");
      } else {
        setStatus("Link Invalid ⚠️");
      }
    } catch (err) { 
      setStatus("Connection Error"); 
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("id");
    if (code) { setTargetId(code); setView("receive"); handleReceive(code); }
  }, []);

  return (
    <div className="min-h-screen bg-[#020204] text-[#f4f4f5] font-sans flex flex-col overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600 blur-[120px]"></div>
      </div>

      <nav className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20"><Zap size={22} fill="white" /></div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-white">QSHARE <span className="text-indigo-500">PRO</span></h1>
        </div>
        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400">
          <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1100px] mx-auto w-full flex flex-col justify-center px-4 pb-20">
        {view === "home" && (
          <div className="space-y-12 animate-in fade-in duration-700 text-center">
            <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Instant <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-400">Hybrid.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button onClick={() => setView("send")} className="bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all group shadow-2xl relative overflow-hidden">
                <Share2 className="text-indigo-500 mb-6 group-hover:rotate-12 transition-transform" size={56} />
                <h3 className="text-4xl font-black italic text-white uppercase leading-none">Transmit</h3>
              </button>
              <button onClick={() => setView("receive")} className="bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all group shadow-2xl relative overflow-hidden">
                <DownloadCloud className="text-emerald-500 mb-6 group-hover:bounce transition-transform" size={56} />
                <h3 className="text-4xl font-black italic text-white uppercase leading-none">Intercept</h3>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="animate-in zoom-in-95 duration-500 w-full max-w-5xl mx-auto">
            <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-10 hover:text-white transition-colors uppercase italic tracking-widest"><ArrowLeft size={16} /> Deck</button>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 bg-white/5 border border-white/10 p-10 rounded-[56px] backdrop-blur-3xl shadow-2xl">
                {view === "send" ? (
                  <div className="space-y-8">
                    <div className="relative border-2 border-dashed border-white/10 rounded-[40px] p-12 bg-black/40 hover:border-indigo-500/50 transition-all cursor-pointer group text-center">
                      <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Upload className="text-indigo-500 mx-auto mb-4 group-hover:-translate-y-2 transition-transform" size={48} />
                      <p className="text-[10px] font-black uppercase text-gray-500 italic">Load Assets</p>
                    </div>
                    <button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[2px] disabled:opacity-30 transition-all shadow-xl active:scale-95 shadow-indigo-600/20">
                      {uploading ? "Broadcasting..." : "Initialize Mesh"}
                    </button>
                    {myId && (
                      <div className="pt-8 text-center animate-in zoom-in">
                        <div className="bg-white p-5 inline-block rounded-[40px] shadow-2xl border-[8px] border-white/10 mb-8">
                          <QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={180} level="H" />
                        </div>
                        <div className="text-6xl font-mono font-black tracking-[12px] text-white uppercase leading-none">{myId}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-12 text-center py-6">
                    <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-black/40 border border-white/10 p-10 rounded-[40px] text-7xl text-indigo-500 font-mono text-center tracking-[12px] outline-none" onChange={(e) => setTargetId(e.target.value)} />
                    <button onClick={() => handleReceive()} className="w-full bg-indigo-600 hover:bg-indigo-500 py-7 rounded-[40px] font-black uppercase text-xs text-white shadow-2xl active:scale-95 transition-all"> Establish Sync </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-7 bg-white/5 border border-white/10 p-8 rounded-[56px] backdrop-blur-2xl flex flex-col min-h-[400px] shadow-2xl">
                <h3 className="text-[10px] font-black uppercase tracking-[6px] text-gray-500 mb-8 px-4 italic">Transfer Queue</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {(view === "send" ? files : receivedFiles).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale"><Activity size={80} /></div>
                  ) : (
                    (view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/[0.08] transition-all group">
                        <div className="flex items-center gap-4 overflow-hidden text-left">
                          <FileText size={24} className={view === "send" ? "text-indigo-400" : "text-emerald-400"} />
                          <div className="overflow-hidden"><p className="text-sm font-black text-white/90 truncate italic">{f.name}</p></div>
                        </div>
                        {view === "send" ? (
                          <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-3 text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={22} /></button>
                        ) : (
                          <a href={f.url} target="_blank" className="p-4 bg-white text-black rounded-2xl shadow-xl hover:scale-110 transition-transform"><Download size={20} /></a>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {receivedFiles.length > 0 && view === "receive" && (
                    <button onClick={() => receivedFiles.forEach(f => window.open(f.url, '_blank'))} className="mt-8 w-full bg-white text-black py-6 rounded-[32px] font-black uppercase text-xs shadow-2xl active:scale-95 transition-all"> Extraction Chamber (All Files) </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center opacity-20 text-[10px] font-black tracking-[12px] uppercase italic text-white leading-none">
        Developed by Masrur Siam — The Mango Programmer
      </footer>
    </div>
  );
}
