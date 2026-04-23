"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Zap, Download, Upload, FileText, ArrowLeft, 
  Sparkles, Shield, Layers, Cpu, Globe, Lock, 
  CheckCircle, Loader2, Activity // <--- Ekhane Activity add kora hoyeche
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

// --- SUPABASE CONFIG ---
const supabase = createClient(
  "https://vecwracghzskshbfspaq.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlY3dyYWNnaHpza3NoYmZzcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzE1MjEsImV4cCI6MjA5MjQ0NzUyMX0.BJ7aRh-p8oR4Y2fhOrVCTGviFcfUs0J9d3bq6Dae_3A" 
);

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("System Active");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleReset = () => {
    window.location.href = window.location.origin;
  };

  // --- AUTO UPLOAD ---
  const autoUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    setIsSyncing(true);
    setStatus("Syncing Assets...");
    const shareId = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      for (const file of selectedFiles) {
        const filePath = `${shareId}/${file.name}`;
        await supabase.storage.from("qshare-files").upload(filePath, file, { upsert: true });
      }
      setMyId(shareId);
      setStatus("Broadcast Live ✅");
    } catch (err) {
      setStatus("Upload Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- FORCE DOWNLOAD IN SAME TAB ---
  const forceDownload = async (fileName: string, id: string) => {
    setStatus("Downloading...");
    try {
      const { data, error } = await supabase.storage
        .from("qshare-files")
        .download(`${id}/${fileName}`);

      if (error) throw error;

      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setStatus("Download Complete ✅");
    } catch (err) {
      setStatus("Error: Expired");
    }
  };

  const handleReceive = async (manualId?: string) => {
    const id = manualId || targetId;
    if (!id || id.length < 6) return;
    setStatus("Intercepting...");
    try {
      const { data, error } = await supabase.storage.from("qshare-files").list(id);
      if (data && data.length > 0) {
        setReceivedFiles(data);
        setStatus("Assets Found! ✅");
      } else {
        setStatus("No Assets Found ⚠️");
      }
    } catch (err) { setStatus("Mesh Error"); }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[140px] rounded-full" />
      </div>

      <nav className="relative z-50 max-w-7xl mx-auto px-8 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-2xl shadow-indigo-600/30 group-hover:rotate-12 transition-all">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic text-white">QShare</span>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {view === "home" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-1000">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[3px] mb-10">
              <Globe size={14} /> Global Instant File Sharing
            </div>
            <h1 className="text-6xl md:text-[140px] font-black italic tracking-tighter uppercase leading-[0.8] mb-12">
              Share. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-400">Instantly.</span>
            </h1>
            <p className="max-w-2xl text-gray-500 text-base md:text-xl mb-16 font-medium leading-relaxed">
              Experience the fastest way to move assets between devices. <br />
              No logins, no tracking—just pure sharing speed.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <button onClick={() => setView("send")} className="group p-12 rounded-[60px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-indigo-500/40 transition-all text-left relative overflow-hidden shadow-2xl">
                <div className="bg-indigo-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-indigo-500 transition-all duration-500"><Upload className="text-indigo-400 group-hover:text-white" size={32} /></div>
                <h3 className="text-4xl font-black italic uppercase text-white mb-2 leading-none">Transfer</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Blast files to the mesh</p>
              </button>
              <button onClick={() => setView("receive")} className="group p-12 rounded-[60px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-emerald-500/40 transition-all text-left relative overflow-hidden shadow-2xl">
                <div className="bg-emerald-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 transition-all duration-500"><Download className="text-emerald-400 group-hover:text-white" size={32} /></div>
                <h3 className="text-4xl font-black italic uppercase text-white mb-2 leading-none">Receive</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Fetch files with a code</p>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500">
            <button onClick={handleReset} className="flex items-center gap-2 text-[12px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[4px] mb-16 italic"><ArrowLeft size={18} /> Reset Mesh</button>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-6 bg-white/[0.02] border border-white/10 rounded-[64px] p-16 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                {view === "send" ? (
                  <div className="space-y-10 text-center">
                    {!myId ? (
                      <div className="relative border-2 border-dashed border-white/10 rounded-[48px] p-20 hover:border-indigo-500/50 transition-all cursor-pointer group bg-black/40">
                        <input type="file" multiple onChange={(e) => {
                          const selFiles = Array.from(e.target.files || []);
                          setFiles(selFiles);
                          autoUpload(selFiles);
                        }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="bg-indigo-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-inner">
                           <Upload className="text-indigo-500" size={36} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[4px] text-gray-400">Select Asset</p>
                      </div>
                    ) : (
                      <div className="animate-in zoom-in-90 duration-500">
                        <div className="bg-white p-7 inline-block rounded-[56px] shadow-2xl mb-10 border-[12px] border-white/5">
                          <QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={220} level="H" />
                        </div>
                        <div className="text-8xl font-black tracking-[12px] text-white italic uppercase leading-none mb-6">{myId}</div>
                        <div className="flex items-center justify-center gap-2 text-indigo-400">
                          <CheckCircle size={14} /> <span className="text-[11px] font-black uppercase tracking-[4px]">Access Token Ready</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-14 py-6 text-center">
                    <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-black border border-white/10 p-12 rounded-[48px] text-[100px] text-indigo-500 font-black text-center tracking-[12px] outline-none placeholder:opacity-5 shadow-2xl" onChange={(e) => setTargetId(e.target.value)} />
                    <button onClick={() => handleReceive()} className="w-full bg-indigo-600 hover:bg-indigo-500 py-8 rounded-[48px] font-black uppercase text-sm tracking-[3px] text-white shadow-2xl active:scale-95 transition-all"> Establish Mesh </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-6 space-y-8">
                <div className="bg-white/[0.02] border border-white/10 rounded-[64px] p-10 backdrop-blur-3xl flex flex-col min-h-[400px] shadow-2xl relative overflow-hidden">
                  <h4 className="text-[11px] font-black uppercase tracking-[6px] text-gray-600 mb-10 px-4 italic flex items-center gap-2">
                    <Activity size={12} className="text-indigo-500" /> Active Assets
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                    {(view === "send" ? files : receivedFiles).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-5"><Cpu size={80} /></div>
                    ) : (
                      (view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/5 rounded-[36px] hover:bg-white/5 transition-all group">
                          <div className="flex items-center gap-5 overflow-hidden text-left">
                             <div className="p-4 bg-indigo-500/10 rounded-2xl"><FileText size={22} className="text-indigo-400" /></div>
                             <div className="overflow-hidden leading-tight">
                                <p className="text-sm font-black text-gray-100 truncate italic mb-1">{f.name}</p>
                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Asset Sync'd</p>
                             </div>
                          </div>
                          {view === "receive" && (
                            <button 
                              onClick={() => forceDownload(f.name, targetId)} 
                              className="p-5 bg-white text-black rounded-3xl hover:scale-110 active:scale-90 transition-all shadow-2xl"
                            >
                              <Download size={22} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-8 flex items-center gap-6">
                   <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner animate-pulse"><Lock size={24} /></div>
                   <div className="text-left">
                      <p className="text-[11px] font-black uppercase tracking-[4px] text-indigo-500 mb-1">Encrypted Node</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase italic leading-none">Files are wiped from existence <br /> after mesh reset.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-24 text-center">
        <div className="inline-block relative">
          <p className="text-[11px] font-black uppercase tracking-[15px] italic text-white/40 mb-4 ml-4">
            Developed by Masrur Siam
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[8px] italic text-indigo-500/50">The Mango Programmer</p>
          <div className="mt-8 h-[1px] w-48 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto opacity-30" />
        </div>
      </footer>
    </div>
  );
}
