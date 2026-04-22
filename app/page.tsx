"use client";
import React, { useState, useEffect, useRef } from "react";
import { Zap, Share2, Download, Upload, FileText, DownloadCloud, ArrowLeft, Trash2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QShare() {
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState("System Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const peerInstance = useRef<any>(null);

  // --- Optimized Chunk Sender ---
  const sendFiles = (conn: any) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        conn.send({ type: "header", name: file.name, size: file.size, mime: file.type });

        const CHUNK_SIZE = 16384; // 16KB for mobile reliability
        let offset = 0;
        
        const sendNextChunk = () => {
          if (offset < buffer.byteLength) {
            const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
            conn.send({ type: "chunk", data: chunk });
            offset += CHUNK_SIZE;
            // Immediate loop for speed, no artificial delay
            sendNextChunk(); 
          } else {
            conn.send({ type: "end" });
          }
        };
        sendNextChunk();
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // --- Initialize Peer ---
  useEffect(() => {
    const initPeer = async () => {
      if (peerInstance.current) return;
      const { default: Peer } = await import("peerjs");
      const id = Math.floor(100000 + Math.random() * 900000).toString();
      const newPeer = new Peer(id, {
        config: { 
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ] 
        }
      });

      newPeer.on("open", (id) => { 
        setMyId(id); 
        setPeer(newPeer); 
        peerInstance.current = newPeer; 
      });

      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setStatus("Streaming...");
          sendFiles(conn);
          setTimeout(() => setStatus("Success ✅"), 2000);
        });
      });
    };
    initPeer();
  }, [files]);

  // --- Connect & Reassemble Logic ---
  const handleConnect = (manualId?: string) => {
    const id = manualId || targetId;
    if (!id || !peer) return;

    setStatus("Handshaking...");
    const conn = peer.connect(id, { reliable: true });
    
    let currentFileChunks: any[] = [];
    let currentMetadata: any = null;

    conn.on("data", (data: any) => {
      if (data.type === "header") {
        currentFileChunks = [];
        currentMetadata = data;
        setStatus("Acquiring...");
      } else if (data.type === "chunk") {
        currentFileChunks.push(data.data);
      } else if (data.type === "end") {
        const blob = new Blob(currentFileChunks, { type: currentMetadata.mime });
        const url = URL.createObjectURL(blob);
        setReceivedFiles(prev => [...prev, { url, name: currentMetadata.name }]);
        setStatus("Received! ✅");
        currentFileChunks = [];
      }
    });
    
    conn.on("error", () => setStatus("Retry Link"));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("id");
    if (code && peer) {
      setTargetId(code);
      setView("receive");
      setTimeout(() => handleConnect(code), 800);
    }
  }, [peer]);

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col p-4 md:p-10 selection:bg-blue-500/30">
      <nav className="max-w-4xl mx-auto w-full flex justify-between items-center mb-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20"><Zap size={20} fill="white" /></div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">QSHARE PRO</h1>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
          {status}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
        {view === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <button onClick={() => setView("send")} className="bg-[#111418] border border-white/5 p-12 rounded-[40px] hover:bg-[#161a1f] transition-all text-left group">
              <Share2 className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={48} />
              <h2 className="text-4xl font-black italic uppercase leading-none">Send</h2>
              <p className="text-gray-500 text-xs mt-3 font-bold tracking-widest uppercase">Instant P2P Stream</p>
            </button>
            <button onClick={() => setView("receive")} className="bg-[#111418] border border-white/5 p-12 rounded-[40px] hover:bg-[#161a1f] transition-all text-left group">
              <DownloadCloud className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={48} />
              <h2 className="text-4xl font-black italic uppercase leading-none">Get</h2>
              <p className="text-gray-500 text-xs mt-3 font-bold tracking-widest uppercase">Direct Intercept</p>
            </button>
          </div>
        )}

        {view === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in duration-300">
            <div className="bg-[#111418] border border-white/5 p-10 rounded-[40px] text-center shadow-2xl">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-8 hover:text-white uppercase italic"><ArrowLeft size={16} /> Deck</button>
              <div className="relative border-2 border-dashed border-white/10 rounded-[30px] p-12 bg-black/20 hover:border-blue-500/50 transition-all cursor-pointer">
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="text-blue-500 mx-auto mb-4" size={40} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Assets</p>
              </div>
              {files.length > 0 && (
                <div className="mt-10 space-y-6">
                  <div className="bg-white p-4 inline-block rounded-[32px] shadow-2xl border-[6px] border-white/10"><QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={160} /></div>
                  <div className="text-5xl font-mono font-black tracking-[10px] text-white uppercase">{myId}</div>
                </div>
              )}
            </div>
            {files.length > 0 && (
              <div className="bg-[#111418] border border-white/5 p-8 rounded-[40px] overflow-y-auto max-h-[500px]">
                <h3 className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-[4px] italic">Queue</h3>
                {files.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-black/40 rounded-2xl mb-3 border border-white/5">
                    <p className="text-sm font-bold truncate italic flex-1 mr-4">{f.name}</p>
                    <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}><Trash2 size={20} className="text-gray-600 hover:text-red-500" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "receive" && (
          <div className="max-w-md mx-auto w-full animate-in zoom-in duration-300">
            <div className="bg-[#111418] border border-white/5 p-10 rounded-[40px] shadow-2xl">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-[10px] font-black text-gray-500 mb-10 hover:text-white uppercase italic"><ArrowLeft size={16} /> Deck</button>
              {!receivedFiles.length ? (
                <div className="space-y-10 text-center">
                  <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-black/40 border border-white/10 p-8 rounded-[30px] text-7xl text-blue-500 font-mono text-center tracking-[10px] outline-none" onChange={(e) => setTargetId(e.target.value)} />
                  <button onClick={() => handleConnect()} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[30px] font-black uppercase text-xs shadow-xl active:scale-95 transition-all"> Handshake </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-[30px] text-center">
                    <DownloadCloud className="text-emerald-500 mx-auto mb-6 animate-bounce" size={56} />
                    <button onClick={() => receivedFiles.forEach(f => {const l=document.createElement('a');l.href=f.url;l.download=f.name;l.click();})} className="w-full bg-white text-black py-5 rounded-[25px] font-black uppercase text-xs shadow-2xl"> Save Everything </button>
                  </div>
                  <div className="space-y-3">
                    {receivedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-5 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-xs font-bold italic truncate flex-1">{f.name}</p>
                        <a href={f.url} download={f.name} className="text-blue-500 ml-4"><Download size={20} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-12 opacity-30 text-[9px] font-black tracking-[10px] uppercase italic text-white leading-none">Project: QShare Pro by Masrur Siam</footer>
    </div>
  );
}
