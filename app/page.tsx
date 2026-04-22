"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, Share2, Download, Upload, FileText, DownloadCloud, MonitorPlay, 
  ArrowLeft, Trash2, Sparkles, Radio, Activity, Gauge, Wifi, ShieldCheck
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState("System Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const peerInstance = useRef<any>(null);

  // --- Chunk Transfer Logic ---
  const CHUNK_SIZE = 16384; // 16KB small chunks for mobile stability

  const sendFileInChunks = (conn: any, file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const buffer = e.target.result;
      conn.send({ type: "start", name: file.name, mime: file.type, size: file.size });
      
      let offset = 0;
      while (offset < buffer.byteLength) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        conn.send({ type: "chunk", data: chunk });
        offset += CHUNK_SIZE;
      }
      conn.send({ type: "end" });
    };
    reader.readAsArrayBuffer(file);
  };

  // --- Peer Initialization ---
  useEffect(() => {
    const initPeer = async () => {
      if (peerInstance.current) return;
      const { default: Peer } = await import("peerjs");
      const customId = Math.floor(100000 + Math.random() * 900000).toString();
      
      const newPeer = new Peer(customId, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun.cloudflare.com:3478" }
          ],
        },
      });

      newPeer.on("open", (id) => {
        setMyId(id);
        setPeer(newPeer);
        peerInstance.current = newPeer;
      });

      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setStatus("Streaming...");
          files.forEach((f) => sendFileInChunks(conn, f));
          setTimeout(() => setStatus("Sent! ✅"), 2000);
        });
      });
    };
    initPeer();
  }, [files]);

  // --- Receiver Connect & Chunk Reassembly ---
  const handleReceiveConnect = (manualId?: string) => {
    const idToConnect = manualId || targetId;
    if (!idToConnect || !peer) return;

    setStatus("Handshaking...");
    const conn = peer.connect(idToConnect, { reliable: true });

    let incomingFile: { name: string, mime: string, chunks: any[] } | null = null;

    conn.on("data", (data: any) => {
      if (data.type === "start") {
        incomingFile = { name: data.name, mime: data.mime, chunks: [] };
        setStatus(`Getting: ${data.name}`);
      } else if (data.type === "chunk" && incomingFile) {
        incomingFile.chunks.push(data.data);
      } else if (data.type === "end" && incomingFile) {
        const blob = new Blob(incomingFile.chunks, { type: incomingFile.mime });
        const url = URL.createObjectURL(blob);
        setReceivedFiles((prev) => [...prev, { url, name: incomingFile!.name, type: incomingFile!.mime }]);
        setStatus("Received! ✅");
        incomingFile = null;
      }
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("id");
    if (codeFromUrl && peer) {
      setTargetId(codeFromUrl);
      setView("receive");
      setTimeout(() => handleReceiveConnect(codeFromUrl), 1000);
    }
  }, [peer]);

  return (
    <div className="min-h-screen bg-[#020203] text-[#f4f4f5] font-sans flex flex-col p-4 md:p-0">
      <nav className="relative z-10 max-w-[1000px] mx-auto px-6 py-8 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-indigo-600 p-2 rounded-2xl"><Zap fill="white" size={20} /></div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">QSHARE PRO</h1>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">
          {status}
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-[1000px] mx-auto w-full flex flex-col justify-center px-4">
        {view === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <button onClick={() => setView("send")} className="bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all shadow-2xl">
              <Share2 className="text-indigo-500 mb-6" size={64} />
              <h3 className="text-4xl font-black italic text-white uppercase">Send</h3>
            </button>
            <button onClick={() => setView("receive")} className="bg-white/5 border border-white/10 p-12 rounded-[56px] text-left hover:bg-white/[0.08] transition-all shadow-2xl">
              <DownloadCloud className="text-emerald-500 mb-6" size={64} />
              <h3 className="text-4xl font-black italic text-white uppercase">Get</h3>
            </button>
          </div>
        )}

        {view === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in zoom-in">
            <div className="md:col-span-5 bg-white/5 border border-white/10 p-8 rounded-[56px] text-center">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-8 uppercase italic"><ArrowLeft size={16} /> Deck</button>
              <div className="relative border-2 border-dashed border-white/10 rounded-[40px] p-12 bg-black/40 cursor-pointer">
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="text-indigo-500 mx-auto mb-4" size={48} />
                <p className="text-[10px] font-black uppercase text-gray-500">Add Files</p>
              </div>
              {files.length > 0 && (
                <div className="mt-8">
                  <div className="bg-white p-4 inline-block rounded-[32px] mb-6 border-[8px] border-white/10">
                    <QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={160} level="H" />
                  </div>
                  <div className="text-5xl font-mono font-black text-white tracking-[12px]">{myId}</div>
                </div>
              )}
            </div>
            <div className="md:col-span-7">
              {files.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-8 rounded-[56px] h-full max-h-[500px] overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] mb-4">
                      <div className="flex items-center gap-4 overflow-hidden text-left"><FileText className="text-indigo-400" size={24}/><p className="text-sm font-black text-white truncate italic">{f.name}</p></div>
                      <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-700 hover:text-red-500"><Trash2 size={22} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === "receive" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in zoom-in">
            <div className={`md:col-span-6 bg-white/5 border border-white/10 p-10 rounded-[56px] ${!receivedFiles.length ? 'md:col-start-4' : ''}`}>
               <button onClick={() => setView("home")} className="text-[10px] font-black text-gray-500 mb-10 uppercase italic leading-none flex items-center gap-2"><ArrowLeft size={16} /> Deck</button>
               {!receivedFiles.length ? (
                 <div className="space-y-12 text-center">
                    <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-white/5 border border-white/10 p-10 rounded-[40px] outline-none text-7xl text-emerald-400 font-mono text-center tracking-[12px]" onChange={(e) => setTargetId(e.target.value)} />
                    <button onClick={() => handleReceiveConnect()} className="w-full bg-emerald-600 py-7 rounded-[40px] font-black uppercase text-xs text-white"> Handshake </button>
                 </div>
               ) : (
                 <div className="bg-emerald-500/10 p-12 rounded-[56px] text-center border border-emerald-500/20">
                    <DownloadCloud size={72} className="text-white animate-bounce mx-auto mb-8" />
                    <button onClick={() => receivedFiles.forEach(f => {const link=document.createElement('a');link.href=f.url;link.download=f.name;link.click();})} className="w-full bg-white text-black py-7 rounded-[40px] font-black uppercase text-xs"> Save All </button>
                 </div>
               )}
            </div>
            {receivedFiles.length > 0 && (
                <div className="md:col-span-6 bg-white/5 border border-white/10 p-8 rounded-[56px] h-full max-h-[500px] overflow-y-auto">
                  {receivedFiles.map((f, i) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-emerald-500/5 rounded-[32px] border border-emerald-500/10 mb-4">
                       <div className="flex items-center gap-4 text-left overflow-hidden"><FileText className="text-emerald-400" size={24} /><p className="text-sm font-black italic text-white truncate">{f.name}</p></div>
                       <a href={f.url} download={f.name} className="p-3 bg-white text-black rounded-2xl shadow-xl"><Download size={20} /></a>
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}
      </main>
      <footer className="py-12 text-center opacity-30 text-[9px] font-black tracking-[12px] uppercase italic text-white">QShare Pro</footer>
    </div>
  );
}
