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
  const [status, setStatus] = useState("Ready");
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const peerInstance = useRef<any>(null);

  // --- Send Logic (Chunked for Stability) ---
  const sendFiles = (conn: any) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const buffer = e.target.result;
        conn.send({ type: "metadata", name: file.name, mime: file.type });
        
        const CHUNK_SIZE = 16384; 
        let offset = 0;
        while (offset < buffer.byteLength) {
          conn.send({ type: "data", chunk: buffer.slice(offset, offset + CHUNK_SIZE) });
          offset += CHUNK_SIZE;
        }
        conn.send({ type: "complete" });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // --- Peer Init ---
  useEffect(() => {
    const initPeer = async () => {
      if (peerInstance.current) return;
      const { default: Peer } = await import("peerjs");
      const id = Math.floor(100000 + Math.random() * 900000).toString();
      const newPeer = new Peer(id, {
        config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
      });
      newPeer.on("open", (id) => { setMyId(id); setPeer(newPeer); peerInstance.current = newPeer; });
      newPeer.on("connection", (conn: any) => {
        conn.on("open", () => {
          setStatus("Sending...");
          sendFiles(conn);
          setTimeout(() => setStatus("Sent ✅"), 2000);
        });
      });
    };
    initPeer();
  }, [files]);

  // --- Receive Logic ---
  const handleConnect = (manualId?: string) => {
    const id = manualId || targetId;
    if (!id || !peer) return;
    setStatus("Connecting...");
    const conn = peer.connect(id, { reliable: true });
    
    let currentFile: { name: string, mime: string, chunks: any[] } | null = null;

    conn.on("data", (data: any) => {
      if (data.type === "metadata") {
        currentFile = { name: data.name, mime: data.mime, chunks: [] };
        setStatus("Receiving...");
      } else if (data.type === "data" && currentFile) {
        currentFile.chunks.push(data.chunk);
      } else if (data.type === "complete" && currentFile) {
        const blob = new Blob(currentFile.chunks, { type: currentFile.mime });
        const url = URL.createObjectURL(blob);
        setReceivedFiles(prev => [...prev, { url, name: currentFile!.name }]);
        setStatus("Received ✅");
        currentFile = null;
      }
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("id");
    if (code && peer) {
      setTargetId(code);
      setView("receive");
      setTimeout(() => handleConnect(code), 1000);
    }
  }, [peer]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col p-4 md:p-10">
      <nav className="max-w-4xl mx-auto w-full flex justify-between items-center mb-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href="/"}>
          <div className="bg-blue-600 p-2 rounded-lg"><Zap size={20} fill="white" /></div>
          <h1 className="text-xl font-bold tracking-tight">QSHARE PRO</h1>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
          {status}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
        {view === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <button onClick={() => setView("send")} className="bg-gray-900 border border-gray-800 p-12 rounded-3xl hover:bg-gray-800 transition-all text-left shadow-2xl">
              <Share2 className="text-blue-500 mb-4" size={48} />
              <h2 className="text-3xl font-black italic uppercase">Send</h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">Fast P2P Transfer</p>
            </button>
            <button onClick={() => setView("receive")} className="bg-gray-900 border border-gray-800 p-12 rounded-3xl hover:bg-gray-800 transition-all text-left shadow-2xl">
              <DownloadCloud className="text-green-500 mb-4" size={48} />
              <h2 className="text-3xl font-black italic uppercase">Receive</h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">Intercept Files</p>
            </button>
          </div>
        )}

        {view === "send" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center shadow-2xl">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6 hover:text-white uppercase"><ArrowLeft size={16} /> Back</button>
              <div className="relative border-2 border-dashed border-gray-800 rounded-2xl p-10 bg-black/20 hover:border-blue-500/50 transition-all cursor-pointer">
                <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="text-blue-500 mx-auto mb-2" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase">Select Files</p>
              </div>
              {files.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="bg-white p-4 inline-block rounded-2xl shadow-2xl"><QRCodeCanvas value={`https://qshare69.vercel.app?id=${myId}`} size={160} /></div>
                  <div className="text-5xl font-mono font-black tracking-widest">{myId}</div>
                </div>
              )}
            </div>
            {files.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl overflow-y-auto max-h-[450px]">
                <h3 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest italic">Queue</h3>
                {files.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl mb-2 border border-gray-800">
                    <p className="text-sm font-bold truncate italic flex-1 mr-4">{f.name}</p>
                    <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}><Trash2 size={18} className="text-gray-600 hover:text-red-500" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "receive" && (
          <div className="max-w-md mx-auto w-full animate-in zoom-in">
            <div className="bg-gray-900 border border-gray-800 p-10 rounded-3xl shadow-2xl">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-8 hover:text-white uppercase"><ArrowLeft size={16} /> Back</button>
              {!receivedFiles.length ? (
                <div className="space-y-8 text-center">
                  <input type="text" value={targetId} maxLength={6} placeholder="000000" className="w-full bg-black/40 border border-gray-800 p-6 rounded-2xl text-6xl text-blue-500 font-mono text-center tracking-widest outline-none focus:border-blue-500/50 transition-all" onChange={(e) => setTargetId(e.target.value)} />
                  <button onClick={() => handleConnect()} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase text-sm shadow-xl transition-all active:scale-95"> Connect Mesh </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                    <DownloadCloud className="text-green-500 mx-auto mb-4" size={48} />
                    <button onClick={() => receivedFiles.forEach(f => {const l=document.createElement('a');l.href=f.url;l.download=f.name;l.click();})} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs"> Download All </button>
                  </div>
                  <div className="space-y-2">
                    {receivedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-gray-800">
                        <p className="text-xs font-bold italic truncate flex-1">{f.name}</p>
                        <a href={f.url} download={f.name} className="text-blue-500 ml-4"><Download size={18} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-10 opacity-30 text-[10px] font-bold tracking-[8px] uppercase italic text-white">QShare Pro</footer>
    </div>
  );
}
