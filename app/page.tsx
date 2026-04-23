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

  // --- QR SCAN AUTO-RECEIVE ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("id");
    if (code && code.length === 6) {
      setView("receive");
      setTargetId(code.split(""));
      setTimeout(() => triggerReceive(code), 500);
    }
  }, []);

  const triggerReceive = async (id: string) => {
    setIsSyncing(true);
    setStatus("Intercepting...");
    setProgress(10);
    const timer = setInterval(() => setProgress(p => p < 90 ? p + 5 : 90), 50);
    try {
      const { data } = await supabase.storage.from("qshare-files").list(id);
      if (data && data.length > 0) {
        setReceivedFiles(data);
        clearInterval(timer);
        setProgress(100);
        setStatus("Found! ✅");
      } else { setStatus("Node Empty"); setProgress(0); }
    } catch (err) { setStatus("Error"); }
    finally { clearInterval(timer); setTimeout(() => setIsSyncing(false), 500); }
  };

  const autoUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    setIsSyncing(true);
    setStatus("Syncing...");
    setProgress(10);
    const timer = setInterval(() => setProgress(p => p < 95 ? p + 10 : 95), 40);
    const shareId = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await Promise.all(selectedFiles.map(file => 
        supabase.storage.from("qshare-files").upload(`${shareId}/${file.name}`, file, { upsert: true })
      ));
      setMyId(shareId);
      clearInterval(timer);
      setProgress(100);
      setStatus("Live ✅");
    } catch (err) { setStatus("Fail"); setProgress(0); }
    finally { clearInterval(timer); setTimeout(() => setIsSyncing(false), 400); }
  };

  const deleteFile = async (fileName: string, index: number) => {
    if (myId) await supabase.storage.from("qshare-files").remove([`${myId}/${fileName}`]);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const forceDownload = async (fileName: string, id: string) => {
    try {
      const { data } = await supabase.storage.from("qshare-files").download(`${id}/${fileName}`);
      if (!data) return;
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { console.error(err); }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;
    const newTargetId = [...targetId];
    newTargetId[index] = value.substring(value.length - 1);
    setTargetId(newTargetId);
    if (index < 5) inputRefs.current[index + 1]?.focus();
    if (index === 5) setTimeout(() => triggerReceive(newTargetId.join("")), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      const newTargetId = [...targetId];
      if (targetId[index]) { newTargetId[index] = ""; } 
      else if (index > 0) { newTargetId[index - 1] = ""; inputRefs.current[index - 1]?.focus(); }
      setTargetId(newTargetId);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans selection:bg-indigo-500/30">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="bg-indigo-600 p-2 rounded-xl"><Zap size={18} fill="white" /></div>
          <span className="text-xl font-black italic uppercase italic">QShare</span>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          {status}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh]">
        {view === "home" && (
          <div className="text-center animate-in fade-in duration-700 flex flex-col items-center">
            <h1 className="text-5xl md:text-[100px] font-black italic tracking-tighter uppercase leading-[0.85] mb-8">
              Move Assets. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-black italic">Instantly.</span>
            </h1>
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl px-4 mt-4">
              <button onClick={() => setView("send")} className="w-full p-8 rounded-[40px] bg-white/[0.02] border border-white/10 hover:border-indigo-500/50 transition-all text-left group">
                <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-all"><Upload size={24} className="text-indigo-400 group-hover:text-white" /></div>
                <h3 className="text-2xl font-black italic uppercase">Transfer</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Deploy to Mesh</p>
              </button>
              <button onClick={() => setView("receive")} className="w-full p-8 rounded-[40px] bg-white/[0.02] border border-white/10 hover:border-emerald-500/50 transition-all text-left group">
                <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-all"><Download size={24} className="text-emerald-400 group-hover:text-white" /></div>
                <h3 className="text-2xl font-black italic uppercase">Receive</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sync from Code</p>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="w-full max-w-4xl space-y-6">
            <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"><ArrowLeft size={14} /> Back</button>
            
            <div className="bg-[#0a0a0b] border border-white/10 rounded-[48px] p-8 md:p-12 relative overflow-hidden text-center">
              {isSyncing && <div className="absolute top-0 left-0 h-1 bg-indigo-500 transition-all duration-300" style={{width: `${progress}%`}} />}
              
              {view === "send" ? (
                <div className="flex flex-col items-center gap-8">
                  {!myId ? (
                    <div className="relative border-2 border-dashed border-white/10 rounded-[32px] py-20 px-10 hover:border-indigo-500/50 transition-all cursor-pointer group bg-black/40 w-full max-w-md">
                      <input type="file" multiple onChange={(e) => autoUpload(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <Upload className="text-indigo-500 mx-auto mb-4" size={32} />
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Select Asset</p>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in zoom-in duration-300">
                      <div className="bg-white p-4 inline-block rounded-[32px] shadow-2xl border-[8px] border-white/5"><QRCodeCanvas value={`${window.location.origin}?id=${myId}`} size={160} level="H" /></div>
                      <div className="flex justify-center gap-1.5">
                        {myId.split("").map((digit, i) => (
                          <div key={i} className="w-10 h-14 md:w-12 md:h-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-xl font-black italic text-white">{digit}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex justify-center gap-1 md:gap-2 w-full max-w-xs md:max-w-md">
                    {targetId.map((data, index) => (
                      <input key={index} type="text" inputMode="numeric" ref={(el) => { inputRefs.current[index] = el; }} value={data} onChange={(e) => handleOtpChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} className="flex-1 aspect-[2/3] bg-black border border-white/10 rounded-xl text-2xl font-black text-center text-indigo-500 outline-none focus:border-indigo-500 transition-all" />
                    ))}
                  </div>
                  {receivedFiles.length > 1 && (
                    <button onClick={() => receivedFiles.forEach(f => forceDownload(f.name, targetId.join("")))} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-600/20"><DownloadCloud size={16} /> Save All Assets</button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-6 min-h-[250px]">
              <h4 className="text-[9px] font-black uppercase tracking-[4px] text-gray-600 italic mb-6">Asset Queue</h4>
              <div className="space-y-3">
                {(view === "send" ? files : receivedFiles).length === 0 ? (
                  <div className="h-40 flex items-center justify-center opacity-5"><Activity size={40} /></div>
                ) : (
                  (view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-3 overflow-hidden text-left">
                        <FileText size={18} className="text-indigo-400 flex-shrink-0" />
                        <p className="text-xs font-black text-gray-200 truncate italic">{f.name}</p>
                      </div>
                      {view === "send" ? (
                        <button onClick={() => deleteFile(f.name, i)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={16}/></button>
                      ) : (
                        <button onClick={() => forceDownload(f.name, targetId.join(""))} className="p-3 bg-white text-black rounded-xl hover:scale-105 transition-all"><Download size={16}/></button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[10px] italic text-white/50 mb-2 leading-none">Developed by Masrur Siam</p>
        <p className="text-[8px] font-bold uppercase tracking-[6px] italic text-indigo-500/50 leading-none underline decoration-1 underline-offset-4">The Mango Programmer</p>
      </footer>
    </div>
  );
}
