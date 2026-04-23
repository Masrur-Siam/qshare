"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Zap, Download, Upload, FileText, ArrowLeft, 
  Sparkles, Shield, Layers, Cpu, Globe, Lock, 
  CheckCircle, Activity
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
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleReset = () => { window.location.href = window.location.origin; };
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view]);

  // --- AUTO UPLOAD ON FILE SELECT ---
  const autoUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    setIsSyncing(true);
    setStatus("Syncing Assets...");
    const shareId = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      for (const file of selectedFiles) {
        await supabase.storage.from("qshare-files").upload(`${shareId}/${file.name}`, file, { upsert: true });
      }
      setMyId(shareId);
      setStatus("Broadcast Live ✅");
    } catch (err) { setStatus("Upload Failed"); }
    finally { setIsSyncing(false); }
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
      setStatus("Download Complete ✅");
    } catch (err) { setStatus("Mesh Expired"); }
  };

  // --- RECEIVE LOGIC ---
  const handleReceive = async () => {
    const id = targetId.join("");
    if (id.length < 6) return;
    setStatus("Intercepting...");
    try {
      const { data, error } = await supabase.storage.from("qshare-files").list(id);
      if (data && data.length > 0) {
        setReceivedFiles(data);
        setStatus("Assets Found! ✅");
      } else { setStatus("Invalid Node ⚠️"); }
    } catch (err) { setStatus("Connection Fail"); }
  };

  // --- OTP & KEYBOARD HANDLERS ---
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newTargetId = [...targetId];
    newTargetId[index] = value.substring(value.length - 1);
    setTargetId(newTargetId);
    
    // Auto-focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } 
    
    // AUTO-EXECUTE on 6th digit
    if (value && index === 5) {
      setTimeout(() => handleReceive(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !targetId[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Enter key support
    if (e.key === "Enter" && targetId.join("").length === 6) {
      handleReceive();
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-50 max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-600/20 transition-all">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">QShare</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center justify-center min-h-[85vh]">
        {view === "home" && (
          <div className="text-center animate-in fade-in duration-700 w-full">
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[2px] mb-8 w-fit mx-auto leading-none">
              <Globe size={12} /> Instant File Sharing
            </div>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
              Share Assets. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-400">Instantly.</span>
            </h1>
            <p className="max-w-xl mx-auto text-gray-500 text-sm md:text-lg mb-12 font-medium">
              The fastest way to move assets between devices. <br />
              No logins, zero storage—just pure speed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <button onClick={() => setView("send")} className="group p-8 rounded-[40px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all text-left shadow-2xl">
                <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-all duration-300"><Upload className="text-indigo-400 group-hover:text-white" size={24} /></div>
                <h3 className="text-2xl font-black italic uppercase text-white mb-1">Transfer</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Drop files to Mesh</p>
              </button>
              <button onClick={() => setView("receive")} className="group p-8 rounded-[40px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all text-left shadow-2xl">
                <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-all duration-300"><Download className="text-emerald-400 group-hover:text-white" size={24} /></div>
                <h3 className="text-2xl font-black italic uppercase text-white mb-1">Receive</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Fetch with a code</p>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="w-full max-w-5xl animate-in zoom-in-95 duration-500">
            <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[3px] mb-8 italic leading-none"><ArrowLeft size={14} /> Reset Mesh</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 bg-white/[0.02] border border-white/10 rounded-[48px] p-8 md:p-12 backdrop-blur-3xl shadow-2xl">
                {view === "send" ? (
                  <div className="space-y-8 text-center">
                    {!myId ? (
                      <div className="relative border-2 border-dashed border-white/10 rounded-[32px] py-16 px-4 hover:border-indigo-500/50 transition-all cursor-pointer group bg-black/40">
                        <input type="file" multiple onChange={(e) => { const sFiles = Array.from(e.target.files || []); setFiles(sFiles); autoUpload(sFiles); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform"><Upload className="text-indigo-500" size={28} /></div>
                        <p className="text-[9px] font-black uppercase tracking-[3px] text-gray-400">Select Assets</p>
                      </div>
                    ) : (
                      <div className="animate-in zoom-in-90 duration-500">
                        <div className="bg-white p-4 inline-block rounded-[32px] shadow-2xl mb-8 border-[8px] border-white/5">
                          <QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={160} level="H" />
                        </div>
                        <div className="flex justify-center gap-2 mb-6">
                          {myId.split("").map((digit, i) => (
                            <div key={i} className="w-10 h-14 md:w-12 md:h-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-2xl md:text-4xl font-black italic text-white shadow-inner">{digit}</div>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-indigo-400">
                          <CheckCircle size={12} /> <span className="text-[9px] font-black uppercase tracking-[3px]">Access Token Ready</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-10 text-center">
                    <div className="flex justify-center gap-2">
                      {targetId.map((data, index) => (
                        <input key={index} type="text" ref={(el) => (inputRefs.current[index] = el)} value={data} maxLength={1} onChange={(e) => handleOtpChange(e.target.value, index)} onKeyDown={(e) => handleKeyDown(e, index)} className="w-10 h-14 md:w-14 md:h-20 bg-black/40 border border-white/10 rounded-xl text-3xl md:text-5xl font-black text-center text-indigo-500 outline-none focus:ring-2 ring-indigo-500/30 transition-all placeholder:opacity-5" placeholder="0" />
                      ))}
                    </div>
                    <button onClick={handleReceive} className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-[32px] font-black uppercase text-xs tracking-[2px] text-white shadow-2xl active:scale-95 transition-all"> Establish Mesh </button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-[48px] p-6 md:p-8 backdrop-blur-3xl flex flex-col min-h-[350px] shadow-2xl overflow-hidden">
                  <h4 className="text-[9px] font-black uppercase tracking-[4px] text-gray-600 mb-8 flex items-center gap-2 leading-none italic">
                    <Activity size={10} className="text-indigo-500" /> Active Assets
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {(view === "send" ? files : receivedFiles).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-5"><Cpu size={60} /></div>
                    ) : (
                      (view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/5 rounded-2xl group">
                          <div className="flex items-center gap-3 overflow-hidden text-left">
                             <div className="p-3 bg-indigo-500/10 rounded-xl flex-shrink-0"><FileText size={18} className="text-indigo-400" /></div>
                             <div className="overflow-hidden leading-tight">
                                <p className="text-xs font-black text-gray-200 truncate italic">{f.name}</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">Ready</p>
                             </div>
                          </div>
                          {view === "receive" && (
                            <button onClick={() => forceDownload(f.name, targetId.join(""))} className="p-4 bg-white text-black rounded-xl hover:scale-105 active:scale-90 transition-all shadow-xl"><Download size={18} /></button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[32px] p-6 flex items-center gap-4">
                   <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 animate-pulse"><Lock size={20} /></div>
                   <div className="text-left leading-tight">
                      <p className="text-[10px] font-black uppercase tracking-[2px] text-indigo-400 mb-1 leading-none">Encrypted Node</p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase italic">Wiped after mesh reset.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center opacity-30 mt-10">
        <p className="text-[10px] font-black uppercase tracking-[10px] italic text-white/50 mb-2">Developed by Masrur Siam</p>
        <p className="text-[8px] font-bold uppercase tracking-[6px] italic text-indigo-500/50 leading-none underline decoration-1 underline-offset-4">The Mango Programmer</p>
      </footer>
    </div>
  );
}
