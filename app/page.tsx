"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Zap, Download, Upload, FileText, ArrowLeft, 
  Sparkles, Shield, Layers, Cpu, Globe, Lock, 
  CheckCircle, Activity, X, DownloadCloud
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const supabase = createClient(
  "https://vecwracghzskshbfspaq.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlY3dyYWNnaHpza3NoYmZzcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzE1MjEsImV4cCI6MjA5MjQ0NzUyMX0.BJ7aRh-p8oR4Y2fhOrVCTGviFcfUs0J9d3bq6Dae_3A" 
);

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string[]>(new Array(6).fill(""));
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("System Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleReset = () => { window.location.href = window.location.origin; };
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view]);

  // --- TURBO AUTO UPLOAD (PARALLEL) ---
  const autoUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    setIsSyncing(true);
    setStatus("Syncing...");
    setProgress(15); // Instant kickstart

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(timer); return 95; }
        return prev + 10; // Rapid movement
      });
    }, 40);

    const shareId = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      // Parallel upload to save time
      await Promise.all(selectedFiles.map(file => 
        supabase.storage.from("qshare-files").upload(`${shareId}/${file.name}`, file, { upsert: true })
      ));
      
      setMyId(shareId);
      clearInterval(timer);
      setProgress(100);
      setStatus("Live ✅");
    } catch (err) { 
      clearInterval(timer);
      setStatus("Upload Fail"); 
      setProgress(0);
    } finally { 
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

  const deleteFile = async (fileName: string, index: number) => {
    if (myId) {
      await supabase.storage.from("qshare-files").remove([`${myId}/${fileName}`]);
      setFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const forceDownload = async (fileName: string, id: string) => {
    setStatus("Downloading...");
    try {
      const { data, error } = await supabase.storage.from("qshare-files").download(`${id}/${fileName}`);
      if (error) throw error;
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { setStatus("Expired"); }
  };

  const downloadAll = async () => {
    const id = targetId.join("");
    setStatus("Extracting...");
    for (const file of receivedFiles) { await forceDownload(file.name, id); }
    setStatus("All Saved ✅");
  };

  const handleReceive = async () => {
    const id = targetId.join("");
    if (id.length < 6) return;
    setIsSyncing(true);
    setStatus("Intercepting...");
    setProgress(20);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(timer); return 95; }
        return prev + 12;
      });
    }, 30);

    try {
      const { data } = await supabase.storage.from("qshare-files").list(id);
      if (data && data.length > 0) {
        setReceivedFiles(data);
        clearInterval(timer);
        setProgress(100);
        setStatus("Found! ✅");
      } else { 
        clearInterval(timer);
        setProgress(0);
        setStatus("Empty Mesh"); 
      }
    } catch (err) { setStatus("Fail"); }
    finally { setTimeout(() => setIsSyncing(false), 400); }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    const newTargetId = [...targetId];
    newTargetId[index] = value.substring(value.length - 1);
    setTargetId(newTargetId);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && index === 5) setTimeout(() => handleReceive(), 200);
  };

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-50 max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:rotate-6 transition-all">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">QShare</span>
        </div>
        <div className="flex gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl items-center">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 leading-none">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center justify-center min-h-[80vh]">
        {view === "home" && (
          <div className="text-center animate-in fade-in duration-1000 w-full flex flex-col items-center">
            <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[2px] mb-10 leading-none flex items-center gap-2">
              <Globe size={12} /> Instant File Sharing
            </div>
            <h1 className="text-5xl md:text-[110px] font-black italic tracking-tighter uppercase leading-[0.8] mb-10">
              Move Assets. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-black italic leading-[0.8]">Instantly.</span>
            </h1>
            <p className="max-w-xl text-gray-500 text-sm md:text-xl mb-14 font-medium px-6 leading-relaxed">
              High-performance node-to-node file exchange. <br className="hidden md:block" /> 
              No logins, no latency—just pure speed.
            </p>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl justify-center items-center px-4">
              <button onClick={() => setView("send")} className="group w-full p-12 rounded-[56px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-indigo-500/40 transition-all text-left shadow-2xl relative overflow-hidden">
                <div className="bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-all duration-500 shadow-lg shadow-indigo-500/10"><Upload className="text-indigo-400 group-hover:text-white" size={28} /></div>
                <h3 className="text-4xl font-black italic uppercase text-white mb-2 leading-none">Transfer</h3>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-none">Drop Assets to Node</p>
              </button>
              <button onClick={() => setView("receive")} className="group w-full p-12 rounded-[56px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-emerald-500/40 transition-all text-left shadow-2xl relative overflow-hidden">
                <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-all duration-500 shadow-lg shadow-emerald-500/10"><Download className="text-emerald-400 group-hover:text-white" size={28} /></div>
                <h3 className="text-4xl font-black italic uppercase text-white mb-2 leading-none">Receive</h3>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-none">Sync from Access Token</p>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="w-full max-w-5xl animate-in zoom-in-95 duration-500 px-4">
            <button onClick={handleReset} className="flex items-center gap-2 text-[11px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[4px] mb-12 italic leading-none"><ArrowLeft size={16} /> Close Mesh</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 bg-[#0a0a0b] border border-white/10 rounded-[64px] p-10 md:p-14 shadow-2xl relative overflow-hidden">
                {isSyncing && (
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 ease-out"
                      style={{width: `${progress}%`}}
                    />
                  </div>
                )}
                
                {view === "send" ? (
                  <div className="space-y-10 text-center w-full flex flex-col items-center">
                    {!myId ? (
                      <div className="relative border-2 border-dashed border-white/10 rounded-[48px] py-20 px-10 hover:border-indigo-500/50 transition-all cursor-pointer group bg-black/40 w-full">
                        <input type="file" multiple onChange={(e) => { const sFiles = Array.from(e.target.files || []); setFiles(sFiles); autoUpload(sFiles); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="bg-indigo-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform"><Upload className="text-indigo-500" size={36} /></div>
                        <p className="text-[11px] font-black uppercase tracking-[4px] text-gray-400 leading-none">Deploy Assets</p>
                      </div>
                    ) : (
                      <div className="animate-in zoom-in-90 duration-500 w-full flex flex-col items-center">
                        <div className="bg-white p-6 inline-block rounded-[56px] shadow-2xl mb-10 border-[14px] border-white/5 mx-auto">
                          <QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={200} level="H" />
                        </div>
                        <div className="flex justify-center gap-2 mb-8 w-full max-w-xs">
                          {myId.split("").map((digit, i) => (
                            <div key={i} className="flex-1 aspect-[2/3] max-w-[55px] flex items-center justify-center bg-[#151516] border border-white/10 rounded-2xl text-3xl font-black italic text-white leading-none shadow-2xl">{digit}</div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400">
                           <CheckCircle size={14} /> <span className="text-[10px] font-black uppercase tracking-[4px]">Sync Complete</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-14 text-center w-full flex flex-col items-center">
                    <div className="flex justify-center gap-2 w-full max-w-md px-2">
                      {targetId.map((data, index) => (
                        <input key={index} type="text" inputMode="numeric" ref={(el) => { inputRefs.current[index] = el; }} value={data} onChange={(e) => handleOtpChange(e, index)} className="flex-1 aspect-[2/3] max-w-[65px] bg-black border border-white/10 rounded-2xl text-4xl font-black text-center text-indigo-500 outline-none focus:border-indigo-500 transition-all shadow-inner" placeholder="0" />
                      ))}
                    </div>
                    <button onClick={handleReceive} className="w-full bg-indigo-600 hover:bg-indigo-500 py-8 rounded-[48px] font-black uppercase text-sm tracking-[4px] text-white shadow-2xl active:scale-95 transition-all"> ESTABLISH MESH </button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 space-y-6 w-full">
                <div className="bg-white/[0.01] border border-white/5 rounded-[64px] p-8 md:p-10 backdrop-blur-3xl flex flex-col min-h-[440px] shadow-2xl overflow-hidden relative">
                  <div className="flex justify-between items-center mb-10 px-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[5px] text-gray-600 flex items-center gap-3 italic leading-none">
                      <Activity size={12} className="text-indigo-500 animate-pulse" /> Asset Stream
                    </h4>
                    {receivedFiles.length > 1 && view === "receive" && (
                      <button onClick={downloadAll} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-xl">
                        <DownloadCloud size={16} /> Save All
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                    {(view === "send" ? files : receivedFiles).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-[0.03]"><Cpu size={100} /></div>
                    ) : (
                      (view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-[36px] group hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-5 overflow-hidden text-left">
                             <div className="p-4 bg-indigo-500/10 rounded-2xl"><FileText size={22} className="text-indigo-400" /></div>
                             <div className="overflow-hidden leading-tight">
                                <p className="text-sm font-black text-gray-200 truncate italic leading-none mb-2">{f.name}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none italic">Asset Ready</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             {view === "send" && (
                               <button onClick={() => deleteFile(f.name, i)} className="p-3.5 bg-red-500/5 text-red-500/50 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={18}/></button>
                             )}
                             {view === "receive" && (
                               <button onClick={() => forceDownload(f.name, targetId.join(""))} className="p-5 bg-white text-black rounded-[24px] hover:scale-110 transition-all active:scale-95 shadow-2xl"><Download size={22} /></button>
                             )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#0a0a0b] border border-white/5 rounded-[40px] p-8 flex items-center gap-6 shadow-xl">
                   <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner"><Lock size={26} /></div>
                   <div className="text-left leading-tight">
                      <p className="text-[11px] font-black uppercase tracking-[3px] text-indigo-500 mb-1.5 leading-none">Security Node</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase italic leading-tight">Assets are auto-purged from mesh <br /> upon session termination.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-20 text-center opacity-40 mt-10">
        <p className="text-[11px] font-black uppercase tracking-[15px] italic text-white/60 mb-3 ml-4">Developed by Masrur Siam</p>
        <p className="text-[9px] font-black uppercase tracking-[10px] italic text-indigo-500/60 leading-none underline decoration-1 underline-offset-4">The Mango Programmer</p>
      </footer>
    </div>
  );
}
