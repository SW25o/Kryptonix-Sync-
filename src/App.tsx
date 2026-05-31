/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  FolderOpen, 
  Smartphone, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import DeviceSimulator from './components/DeviceSimulator';
import KtorConsole from './components/KtorConsole';
import CodeExplorer from './components/CodeExplorer';

interface Message {
  id: string;
  senderId: string;
  isFromSelf: boolean;
  plaintext: string;
  encrypted: string;
  timestamp: number;
  deliveryState: number;
}

interface Log {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export default function App() {
  const [clientBusinessId, setClientBusinessId] = useState("");
  const [activeCompanion, setActiveCompanion] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'ktor' | 'workspace'>('ktor');
  
  // Console logging states
  const [logs, setLogs] = useState<Log[]>([
    {
      id: "log-1",
      text: "Ktor Web Gateway init. Loading network bindings...",
      type: "info",
      timestamp: "18:21:49"
    },
    {
      id: "log-2",
      text: "Port 3000 bound. Active routing tables register REST/WebSocket middleware listeners.",
      type: "success",
      timestamp: "18:21:50"
    },
    {
      id: "log-3",
      text: "SQLCipher database engine linked recursively to physical device file scopes.",
      type: "info",
      timestamp: "18:21:51"
    }
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        text,
        type,
        timestamp: timeStr
      }
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Console log stream purged manually.", "info");
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Universal Workspace Header */}
      <header className="border-b border-slate-900 bg-[#0A0E17]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <Shield className="text-cyan-400 w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-[0.25em] text-slate-100 uppercase font-mono">KRYPTONIX SYNC</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Enterprise Mobile Security & Gateway Sandbox Environment</p>
          </div>
        </div>

        {/* Diagnostic Metadata Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6 font-mono text-[10px]">
          <div className="border-l border-slate-900 pl-4">
            <span className="text-slate-500 block uppercase">COMPILE STAGE</span>
            <span className="text-emerald-400 font-bold">100% SUCCESSFUL</span>
          </div>
          <div className="border-l border-slate-900 pl-4">
            <span className="text-slate-500 block uppercase">CLIENT PARADIGM</span>
            <span className="text-cyan-400 font-bold">JETPACK COMPOSE</span>
          </div>
          <div className="border-l border-slate-900 pl-4">
            <span className="text-slate-500 block uppercase">BACKEND ECOSYSTEM</span>
            <span className="text-purple-400 font-bold">KTOR GATEWAY</span>
          </div>
        </div>
      </header>

      {/* Main Sandbox Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Android Compose UI Simulator Device (4 grid columns on large, centered) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center items-center py-4 bg-[#0A0F1D]/30 border border-slate-900/60 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition duration-1000"></div>
          
          <div className="w-full flex justify-between items-center mb-4 text-xs font-mono text-slate-400 z-10">
            <span className="flex items-center gap-1.5 uppercase font-bold text-[10.5px]">
              <Smartphone size={13} className="text-cyan-400" />
              Android Mobile Simulator
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              PHYSICAL DEVICE
            </span>
          </div>

          <DeviceSimulator 
            clientBusinessId={clientBusinessId}
            setClientBusinessId={setClientBusinessId}
            messages={messages}
            setMessages={setMessages}
            addLog={addLog}
            activeCompanion={activeCompanion}
            setActiveCompanion={setActiveCompanion}
          />

          <div className="mt-4 flex items-start gap-2.5 bg-slate-950/50 p-3 rounded-xl border border-slate-900/40 max-w-[340px] text-[10px] text-slate-500 font-sans leading-relaxed z-10">
            <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Provides an interactive high-performance Web Simulation of the Kotlin Jetpack Compose client interface. Complete the secure hardware enrollment inside the physical screen to unlock direct messaging.
            </p>
          </div>
        </section>

        {/* Right Column: Workstations (7 grid columns on large, togglable tabs) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[500px]">
          
          {/* Workstation Controls bar */}
          <div className="flex gap-2.5 border-b border-slate-900 pb-3 mb-4 select-none">
            <button
              onClick={() => setActiveWorkspaceTab('ktor')}
              className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider ${
                activeWorkspaceTab === 'ktor'
                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-md shadow-cyan-500/2'
                  : 'bg-[#0A0E17]/40 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Terminal size={12} />
              <span>Ktor Middleware Panel</span>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('workspace')}
              className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider ${
                activeWorkspaceTab === 'workspace'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-md shadow-purple-500/2'
                  : 'bg-[#0A0E17]/40 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              <FolderOpen size={12} />
              <span>Ecosystem Source Workspace</span>
            </button>
          </div>

          {/* Active Workstation container */}
          <div className="flex-1 min-h-0">
            {activeWorkspaceTab === 'ktor' ? (
              <KtorConsole 
                logs={logs}
                addLog={addLog}
                clearLogs={clearLogs}
                clientBusinessId={clientBusinessId}
                activeCompanion={activeCompanion}
                messages={messages}
                setMessages={setMessages}
              />
            ) : (
              <CodeExplorer 
                addLog={addLog}
              />
            )}
          </div>

        </section>

      </main>

      {/* Corporate Metadata Footer */}
      <footer className="border-t border-slate-900 bg-[#060911] px-6 py-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-mono gap-4 leading-none select-none">
        <div>
          <span>© 2026 KRYPTONIX SYNC. All Cryptographic Sessions Hardware Bound.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            SECURE PORTAL
          </span>
          <span className="text-slate-700">|</span>
          <span>RELEASE v1.8.0</span>
        </div>
      </footer>

    </div>
  );
}
