"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Zap, Download, Upload, FileText, 
  ArrowLeft, Sparkles, Activity, Shield, 
  Layers, Cpu, Globe, Lock
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
  const [status, setStatus] = useState("System Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- REFRESH EVERYTHING ---
  const handleReset = () => {
    window.location.href = window.location.origin; // Pura page fresh kore home-e niye jabe
  };

  // --- AUTO UPLOAD ON SELECT ---
  const autoUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    
    setIsSyncing(true);
    setStatus("Uploading...");
    const shareId = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      for (const file of selectedFiles) {
        const filePath = `${shareId}/${file.name}`;
        const { error } = await supabase.storage
          .from("qshare-files")
          .upload(filePath, file, { upsert: true });

        if (error) throw error;
      }
      setMyId(shareId);
      setStatus("Ready to Share ✅");
    } catch (err: any) {
      setStatus("Upload Failed ❌");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReceive = async (manualId?: string) => {
    const id = manualId || targetId;
    if (!id || id.length < 6) return;
    setStatus("Searching for files...");
    try {
      const { data, error } = await supabase.storage.from("qshare-files").list(id);
      if (data && data.length > 0) {
        const fetchedFiles = data.map((f) => {
          const { data: urlData } = supabase.storage.from("qshare-files").getPublicUrl(`${id}/${f.name}`);
          return { name: f.name, url: urlData.publicUrl };
        });
        setReceivedFiles(fetchedFiles);
        setStatus("Files Found! ✅");

        // Temporary Storage: Delete from DB after listing
        const filePaths = data.map(f => `${id}/${f.name}`);
        await supabase.storage.from("qshare-files").remove(filePaths);
      } else {
        setStatus("Wrong Code or Files Expired");
      }
    } catch (err) { setStatus("Connection Error"); }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("id");
    if (code) { setTargetId(code); setView("receive"); handleReceive(code); }
  }, []);

  return (
    <div className="min-h-screen bg-[#070708] text-[#f0f0f0] font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* SaaS Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-all">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">QShare</span>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {view === "home" && (
          <div className="flex flex-col items-center justify-center min-h-[65vh] text-center animate-in fade-in duration-700">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[2px] mb-8">
              <Globe size={12} /> Instant File Sharing
            </div>
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
              Transfer <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Everything.</span>
            </h1>
            <p className="max-w-2xl text-gray-500 text-sm md:text-lg mb-14 font-medium leading-relaxed">
              Send photos, videos, and documents to any device in seconds. <br className="hidden md:block" /> 
              No login required. Just upload and share the code.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <button onClick={() => setView("send")} className="group p-10 rounded-[48px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-indigo-500/40 transition-all text-left shadow-2xl">
                <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors duration-500"><Upload className="text-indigo-400 group-hover:text-white" size={28} /></div>
                <h3 className="text-3xl font-black italic uppercase text-white mb-2 leading-none">Transfer</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Upload and get a code</p>
              </button>
              <button onClick={() => setView("receive")} className="group p-10 rounded-[48px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-emerald-500/40 transition-all text-left shadow-2xl">
                <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors duration-500"><Download className="text-emerald-400 group-hover:text-white" size={28} /></div>
                <h3 className="text-3xl font-black italic uppercase text-white mb-2 leading-none">Receive</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Enter code to download</p>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
            <button onClick={handleReset} className="flex items-center gap-2 text-[11px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[4px] mb-12 italic"><ArrowLeft size={16} /> Back to Home</button>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              <div className="md:col-span-6 bg-white/[0.03] border border-white/10 rounded-[56px] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                {view === "send" ? (
                  <div className="space-y-8 text-center">
                    {!myId ? (
                      <div className="relative border-2 border-dashed border-white/10 rounded-[40px] p-16 hover:border-indigo-500/50 transition-all cursor-pointer group bg-black/20">
                        <input type="file" multiple onChange={(e) => {
                          const selFiles = Array.from(e.target.files || []);
                          setFiles(selFiles);
                          autoUpload(selFiles);
                        }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                           <Upload className="text-indigo-500" size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Select Files</p>
                      </div>
                    ) : (
                      <div className="animate-in zoom-in-90 duration-500">
                        <div className="bg-white p-6 inline-block rounded-[40px] shadow-2xl mb-8 border-[10px] border-white/5">
                          <QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={200} level="H" />
                        </div>
                        <div className="text-7xl font-black tracking-[10px] text-white italic uppercase leading-none mb-4">{myId}</div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[6px]">Share this code</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-12 py-4 text-center">
                    <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-black border border-white/10 p-10 rounded-[40px] text-7xl text-indigo-500 font-black text-center tracking-[10px] outline-none placeholder:opacity-5 shadow-2xl" onChange={(e) => setTargetId(e.target.value)} />
                    <button onClick={() => handleReceive()} className="w-full bg-indigo-600 hover:bg-indigo-500 py-7 rounded-[40px] font-black uppercase text-xs tracking-[2px] text-white shadow-xl active:scale-95 transition-all"> Download Files </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-6 space-y-6">
                <div className="bg-white/[0.03] border border-white/10 rounded-[56px] p-8 backdrop-blur-2xl flex flex-col min-h-[350px] shadow-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[6px] text-gray-600 mb-8 px-4 italic leading-none">Files in Transit</h4>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {(view === "send" ? files : receivedFiles).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-10"><Activity size={60} /></div>
                    ) : (
                      (view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-[32px] group">
                          <div className="flex items-center gap-4 overflow-hidden text-left">
                             <div className="p-3 bg-indigo-500/10 rounded-2xl"><FileText size={20} className="text-indigo-400" /></div>
                             <div className="overflow-hidden">
                                <p className="text-sm font-black text-gray-200 truncate italic">{f.name}</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">Ready</p>
                             </div>
                          </div>
                          {view === "receive" && (
                            <a href={f.url} target="_blank" className="p-4 bg-white text-black rounded-2xl hover:scale-110 transition-transform shadow-xl"><Download size={20} /></a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Security Feature Badge */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[36px] p-6 flex items-center gap-5">
                   <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner"><Lock size={22} /></div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[3px] text-indigo-400 leading-none mb-2">Private & Secure</p>
                      <p className="text-[9px] text-gray-600 font-bold leading-tight uppercase italic">Files are automatically deleted <br /> once they are received.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-20 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[12px] italic text-white mb-4">Masrur Siam</p>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto"></div>
      </footer>
    </div>
  );
}
