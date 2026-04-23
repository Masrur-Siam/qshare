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
  const [status, setStatus] = useState("System Active");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleReset = () => { window.location.href = window.location.origin; };

  // --- QR SCAN AUTO-RECEIVE LOGIC ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("id");
    if (code && code.length === 6) {
      setView("receive");
      const codeArray = code.split("");
      setTargetId(codeArray);
      // Small delay to ensure state is set before fetching
      setTimeout(() => triggerReceive(code), 500);
    }
  }, []);

  const triggerReceive = async (id: string) => {
    setIsSyncing(true);
    setStatus("Intercepting Node...");
    setProgress(20);
    try {
      const { data } = await supabase.storage.from("qshare-files").list(id);
      if (data && data.length > 0) {
        setReceivedFiles(data);
        setProgress(100);
        setStatus("Assets Found ✅");
      } else { setStatus("Node Expired"); }
    } catch (err) { setStatus("Fail"); }
    finally { setTimeout(() => setIsSyncing(false), 500); }
  };

  const autoUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    setIsSyncing(true);
    setStatus("Syncing...");
    setProgress(15);
    const shareId = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await Promise.all(selectedFiles.map(file => 
        supabase.storage.from("qshare-files").upload(`${shareId}/${file.name}`, file, { upsert: true })
      ));
      setMyId(shareId);
      setProgress(100);
      setStatus("Live ✅");
    } catch (err) { setStatus("Fail"); }
    finally { setTimeout(() => setIsSyncing(false), 400); }
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
    } catch (err) { setStatus("Error"); }
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
      if (targetId[index]) {
        newTargetId[index] = "";
      } else if (index > 0) {
        newTargetId[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }
      setTargetId(newTargetId);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans overflow-x-hidden">
      <nav className="relative z-50 max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20"><Zap size={18} className="text-white fill-white" /></div>
          <span className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">QShare</span>
        </div>
        <div className="flex gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl items-center">
          <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{status}</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh]">
        {view === "home" && (
          <div className="text-center animate-in fade-in duration-700 flex flex-col items-center">
            <h1 className="text-5xl md:text-[100px] font-black italic tracking-tighter uppercase leading-[0.85] mb-10">
              Move Assets. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-black italic">Instantly.</span>
            </h1>
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl px-4">
              <button onClick={() => setView("send")} className="group w-full p-8 rounded-[40px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all text-left relative overflow-hidden">
                <div className="bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 pointer-events-none group-hover:bg-indigo-500 transition-all"><Upload className="text-indigo-400 group-hover:text-white" size={24} /></div>
                <h3 className="text-2xl font-black italic uppercase text-white mb-1 pointer-events-none">Transfer</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pointer-events-none">Deploy to Node</p>
              </button>
              <button onClick={() => setView("receive")} className="group w-full p-8 rounded-[40px] bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all text-left relative overflow-hidden">
                <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 pointer-events-none group-hover:bg-emerald-500 transition-all"><Download className="text-emerald-400 group-hover:text-white" size={24} /></div>
                <h3 className="text-2xl font-black italic uppercase text-white mb-1 pointer-events-none">Receive</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pointer-events-none">Sync with Code</p>
              </button>
            </div>
          </div>
        )}

        {(view === "send" || view === "receive") && (
          <div className="w-full max-w-5xl animate-in zoom-in-95 duration-500">
            <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[3px] mb-8 italic"><ArrowLeft size={14} /> Back</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 bg-[#0a0a0b] border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative">
                {isSyncing && <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500 transition-all" style={{width: `${progress}%`}} />}
                
                {view === "send" ? (
                  <div className="text-center w-full flex flex-col items-center">
                    {!myId ? (
                      <div className="relative border-2 border-dashed border-white/10 rounded-[32px] py-16 px-10 hover:border-indigo-500/50 transition-all cursor-pointer group bg-black/40 w-full">
                        <input type="file" multiple onChange={(e) => autoUpload(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <Upload className="text-indigo-500 mx-auto mb-4 pointer-events-none" size={32} />
                        <p className="text-[9px] font-black uppercase tracking-[3px] text-gray-400 pointer-events-none">Deploy Assets</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white p-4 inline-block rounded-[32px] shadow-2xl mb-8 border-[8px] border-white/5"><QRCodeCanvas value={`${window.location.origin}?id=${myId}`} size={160} level="H" /></div>
                        <div className="flex justify-center gap-1.5 w-full max-w-xs mx-auto">
                          {myId.split("").map((digit, i) => (
                            <div key={i} className="flex-1 aspect-[2/3] max-w-[45px] flex items-center justify-center bg-[#151516] border border-white/10 rounded-xl text-xl font-black italic text-white">{digit}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center w-full flex flex-col items-center">
                    <div className="flex justify-center gap-1.5 w-full max-w-md mb-8">
                      {targetId.map((data, index) => (
                        <input key={index} type="text" inputMode="numeric" ref={(el) => { inputRefs.current[index] = el; }} value={data} onChange={(e) => handleOtpChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} className="flex-1 aspect-[2/3] max-w-[45px] bg-black border border-white/10 rounded-xl text-2xl font-black text-center text-indigo-500 outline-none focus:border-indigo-500 transition-all" />
                      ))}
                    </div>
                    <button onClick={() => triggerReceive(targetId.join(""))} className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-[32px] font-black uppercase text-xs tracking-[3px] text-white">Establish Mesh</button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 space-y-4 w-full">
                <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-6 flex flex-col min-h-[300px] shadow-2xl relative">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[9px] font-black uppercase tracking-[4px] text-gray-600 italic">Active Assets</h4>
                    {receivedFiles.length > 0 && view === "receive" && (
                      <button onClick={() => receivedFiles.forEach(f => forceDownload(f.name, targetId.join("")))} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-indigo-400">Save All</button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {(view === "send" ? files : receivedFiles).map((f: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/5 rounded-2xl group">
                        <div className="flex items-center gap-3 overflow-hidden text-left">
                          <FileText size={18} className="text-indigo-400 flex-shrink-0" />
                          <p className="text-xs font-black text-gray-200 truncate italic">{f.name}</p>
                        </div>
                        {view === "receive" && <button onClick={() => forceDownload(f.name, targetId.join(""))} className="p-3 bg-white text-black rounded-xl"><Download size={16}/></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center opacity-30 mt-10">
        <p className="text-[10px] font-black uppercase tracking-[10px] italic text-white/50 mb-2">Developed by Masrur Siam</p>
        <p className="text-[8px] font-bold uppercase tracking-[6px] italic text-indigo-500/50 underline decoration-1 underline-offset-4">The Mango Programmer</p>
      </footer>
    </div>
  );
}
