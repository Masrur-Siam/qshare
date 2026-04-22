"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Zap, Share2, Download, Upload, FileText, DownloadCloud, 
  ArrowLeft, Trash2, ShieldCheck, CheckCircle2, Sparkles, 
  Globe, Activity, Link as LinkIcon
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

// --- SUPABASE CONFIG ---
const supabase = createClient(
  "https://vecwracghzskshbfspaq.supabase.co", 
  "sb_publishable_Jjk2Inwcx_laMMBf8Tcgtw_B2Y9LscW_M0uGv6oX7fS_Vf7p-lZ2V6X0m_M0uGv6oX7fS_Vf7p-lZ2V6X0m" 
);

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("System Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus("Broadcasting...");
    const shareId = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      for (const file of files) {
        const filePath = `${shareId}/${file.name}`;
        const { error } = await supabase.storage.from("qshare-files").upload(filePath, file);
        if (error) throw error;
      }
      setMyId(shareId);
      setStatus("Live ✅");
    } catch (err) {
      setStatus("Upload Error ❌");
    } finally {
      setUploading(false);
    }
  };

  const handleReceive = async (manualId?: string) => {
    const id = manualId || targetId;
    if (!id || id.length < 6) return;
    setStatus("Searching...");
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
        setStatus("Not Found ⚠️");
      }
    } catch (err) { setStatus("Error Fetching"); }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("id");
    if (code) { setTargetId(code); setView("receive"); handleReceive(code); }
  }, []);

  return (
    <div className="min-h-screen bg-[#020204] text-[#f4f4f5] font-sans flex flex-col overflow-x-hidden selection:bg-indigo-500/30">
      {/* Abstract Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[140px] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <nav className="relative z-10 max-w-[1100px] mx-auto px-6 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">QSHARE <span className="text-indigo-500">HYBRID</span></h1>
            <p className="text-[7px] font-bold text-gray-500 tracking-[3px] uppercase mt-1">Cloud Mesh v4.2</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1100px] mx-auto w-full flex flex-col justify-center px-4 pb-20">
        {view === "home" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">Fastest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 text-glow">Sync.</span></h2>
              <p className="mt-6 text-gray-500 font-medium text-sm md:text-base">Break network barriers with hybrid mesh technology. <br className="hidden md:block"/> Instant file sharing, everywhere.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <button onClick={() => setView("send")} className="group relative overflow-hidden bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all hover:border-indigo-500/30">
                <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><Share2 size={160} /></div>
                <div className="bg-indigo-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-8"><Share2 className="text-indigo-500" size={32} /></div>
                <h3 className="text-4xl font-black italic text-white uppercase">Transmit</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mt-2 italic">Broadcast to cloud</p>
              </button>

              <button onClick={() => setView("receive")} className="group relative overflow-hidden bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all hover:border-emerald-500/30">
                <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity -rotate-12"><DownloadCloud size={160} /></div>
                <div className="bg-emerald-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-8"><DownloadCloud className="text-emerald-500" size={32} /></div>
                <h3 className="text-4xl font-black italic text-white uppercase">Intercept</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mt-2 italic">Fetch from mesh</p>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="animate-in zoom-in-95 duration-500 max-w-5xl mx-auto w-full">
            <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-10 hover:text-white transition-colors uppercase italic tracking-widest"><ArrowLeft size={16} /> Back to Deck</button>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Action Panel */}
              <div className="md:col-span-5 bg-white/5 border border-white/10 p-10 rounded-[56px] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                {view === "send" ? (
                  <div className="space-y-8">
                    <div className="relative border-2 border-dashed border-white/10 rounded-[40px] p-12 bg-black/40 hover:border-indigo-500/50 transition-all cursor-pointer group text-center">
                      <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Upload className="text-indigo-500 mx-auto mb-4 group-hover:-translate-y-2 transition-transform" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[4px] text-gray-500 leading-none">Drop Files</p>
                    </div>
                    <button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[2px] disabled:opacity-30 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                      {uploading ? "Uploading to Mesh..." : "Start Broadcast"}
                    </button>
                    {myId && (
                      <div className="pt-8 text-center animate-in zoom-in">
                        <div className="bg-white p-5 inline-block rounded-[40px] shadow-2xl border-[10px] border-white/5 mb-8">
                          <QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={180} level="H" />
                        </div>
                        <div className="text-6xl font-mono font-black tracking-[12px] text-white uppercase">{myId}</div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[4px] mt-3">Mesh Token</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-10 text-center py-6">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-4"><Activity className="text-indigo-500" size={40} /></div>
                    <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-black/40 border border-white/10 p-10 rounded-[40px] text-7xl text-indigo-500 font-mono text-center tracking-[12px] outline-none focus:ring-2 ring-indigo-500/20 transition-all placeholder:opacity-5" onChange={(e) => setTargetId(e.target.value)} />
                    <button onClick={() => handleReceive()} className="w-full bg-indigo-600 hover:bg-indigo-500 py-7 rounded-[40px] font-black tracking-widest uppercase text-xs text-white shadow-2xl active:scale-95 transition-all"> Establish Connection </button>
                  </div>
                )}
              </div>

              {/* Right Result Panel */}
              <div className="md:col-span-7 bg-white/5 border border-white/10 p-8 rounded-[56px] backdrop-blur-2xl flex flex-col min-h-[400px]">
                <h3 className="text-[10px] font-black uppercase tracking-[6px] text-gray-500 mb-8 italic px-4">Mesh Assets</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {(view === "send" ? files : receivedFiles).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
                      <Sparkles size={80} />
                      <p className="text-xs font-black uppercase mt-4 tracking-[4px]">Empty Stream</p>
                    </div>
                  ) : (
                    (view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/[0.08] transition-all group">
                        <div className="flex items-center gap-5 overflow-hidden">
                          <div className={`p-4 rounded-2xl ${view === "send" ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}><FileText size={24}/></div>
                          <div className="text-left overflow-hidden">
                             <p className="text-sm font-black text-white/90 truncate italic">{f.name}</p>
                             <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Asset Ready</p>
                          </div>
                        </div>
                        {view === "send" ? (
                          <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-3 text-gray-700 hover:text-red-500 transition-colors"><Trash2 size={22} /></button>
                        ) : (
                          <a href={f.url} target="_blank" className="p-4 bg-white text-black rounded-2xl hover:scale-110 transition-transform shadow-xl"><Download size={20} /></a>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {receivedFiles.length > 0 && view === "receive" && (
                  <button onClick={() => receivedFiles.forEach(f => window.open(f.url, '_blank'))} className="mt-6 w-full bg-white text-black py-6 rounded-[32px] font-black uppercase text-xs shadow-2xl hover:bg-gray-200 transition-all"> Save All Assets </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 py-12 text-center">
        <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl shadow-2xl">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          <p className="text-[9px] font-black uppercase tracking-[8px] italic leading-none text-gray-500">QShare Hybrid Pro — Masrur Siam</p>
        </div>
      </footer>
    </div>
  );
}
