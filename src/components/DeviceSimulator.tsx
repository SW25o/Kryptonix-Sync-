import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Wifi, 
  Battery, 
  Send, 
  Search, 
  Check, 
  CheckCheck, 
  AlertTriangle,
  Smartphone,
  Lock,
  LockKeyhole,
  Unlock,
  KeyRound,
  User,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Client-side encryption simulator (AES-GCM base64 output representation)
function simulateEncrypt(text: string): string {
  if (!text) return "";
  const mockSalt = "KTX-" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const base64Chars = btoa(unescape(encodeURIComponent(text))).replace(/=/g, "");
  return `gcm:${mockSalt}:${base64Chars.substring(0, 16)}`;
}

interface Message {
  id: string;
  senderId: string;
  isFromSelf: boolean;
  plaintext: string;
  encrypted: string;
  timestamp: number;
  deliveryState: number; // 0=Sent, 1=Delivered, 2=Read
}

interface DeviceSimulatorProps {
  clientBusinessId: string;
  setClientBusinessId: (id: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  activeCompanion: string | null;
  setActiveCompanion: (companion: string | null) => void;
}

export default function DeviceSimulator({
  clientBusinessId,
  setClientBusinessId,
  messages,
  setMessages,
  addLog,
  activeCompanion,
  setActiveCompanion
}: DeviceSimulatorProps) {
  const [bootState, setBootState] = useState<'splash' | 'setup' | 'dashboard'>('splash');
  const [splashProgress, setSplashProgress] = useState(0);
  const [splashStatus, setSplashStatus] = useState("Accessing device key enclave...");
  const [username, setUsername] = useState("");
  const [hardwareKeyGen, setHardwareKeyGen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clock for status bar
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // System Splash Cold Start Sequence Simulation
  useEffect(() => {
    if (bootState === 'splash') {
      const steps = [
        { progress: 15, status: "Checking Secure Storage..." },
        { progress: 35, status: "Loading Room DB path 'kryptonix_secure.db'..." },
        { progress: 55, status: "Mounting SQLite SQLCipher hardware encryption..." },
        { progress: 75, status: "Decrypting key store mappings..." },
        { progress: 95, status: "Bypassing biometric authorization..." },
        { progress: 100, status: "System Ready." }
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setSplashProgress(steps[currentStep].progress);
          setSplashStatus(steps[currentStep].status);
          currentStep++;
        } else {
          clearInterval(interval);
          // Load local credentials representation
          const savedId = localStorage.getItem("kryptonix_business_id");
          const savedUser = localStorage.getItem("kryptonix_username");
          if (savedId && savedUser) {
            setClientBusinessId(savedId);
            setUsername(savedUser);
            setBootState('dashboard');
            addLog(`Session autorestore succeeded. Unique ID: ${savedId}`, 'success');
          } else {
            setBootState('setup');
          }
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [bootState]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeCompanion]);

  // Handle unique ID initialization
  const handleKeyGeneration = () => {
    if (!username.trim()) {
      addLog("Registration failed: Screen name is blank", "error");
      return;
    }
    setHardwareKeyGen(true);
    addLog("Initializing secure hardware-backed cryptographic environment...", "info");
    
    setTimeout(() => {
      const randSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `KTX-USER-${randSuffix}`;
      setClientBusinessId(generatedId);
      localStorage.setItem("kryptonix_business_id", generatedId);
      localStorage.setItem("kryptonix_username", username);
      
      addLog("AES-GCM-256 local keystore key created in Secure-Element enclave.", "success");
      addLog(`Local credentials safely persisted. Registered ID: ${generatedId}`, "success");
      setBootState('dashboard');
    }, 1500);
  };

  // Directory ID discovery search query handle
  const handleSearchVerify = () => {
    const formatted = searchQuery.trim().toUpperCase();
    if (!formatted) return;

    addLog(`Searching directories for secure identifier ${formatted}...`, "info");
    
    // Simulate API query delayed trigger
    setTimeout(() => {
      if (formatted === "KTX-ADMIN-MAIN") {
        setActiveCompanion("KTX-ADMIN-MAIN");
        setSearchError(null);
        addLog("Secure handshake succeeded with corporate administrator: KTX-ADMIN-MAIN", "success");
      } else {
        setSearchError(`RESOLVE_ERROR: Alphanumeric node "${formatted}" could not be reached in cryptographic directory registry. Double-check syntax.`);
        addLog(`Query failed: ID match for "${formatted}" could not be resolved.`, "error");
      }
    }, 400);
  };

  // User sends secure E2E Message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeCompanion) return;
    
    const plain = messageInput.trim();
    const enc = simulateEncrypt(plain);
    
    addLog(`Client-side E2EE activated for: "${plain}"`, "info");
    addLog(`AES-GCM encrypted ciphertext base64: [${enc}]`, "warning");

    const newMsg: Message = {
      id: "MSG-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      senderId: clientBusinessId,
      isFromSelf: true,
      plaintext: plain,
      encrypted: enc,
      timestamp: Date.now(),
      deliveryState: 0 // Sent
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput("");

    // Simulate standard packet transit times
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMsg.id ? { ...m, deliveryState: 1 } : m)
      );
      addLog(`Payload delivery receipt acknowledged from Ktor backend for message ID ${newMsg.id}`, "success");
    }, 600);

    // Read by companion simulation
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === newMsg.id ? { ...m, deliveryState: 2 } : m)
      );
      addLog(`Status: message ID ${newMsg.id} flagged read by administrative client.`, "info");
    }, 2000);
  };

  // Reset simulator
  const handleWipeData = () => {
    localStorage.clear();
    setClientBusinessId("");
    setUsername("");
    setMessages([]);
    setActiveCompanion(null);
    setSearchQuery("");
    setBootState('splash');
    addLog("Secure hardware parameters fully zeroized. Cryptographic keys purged.", "warning");
  };

  return (
    <div id="device-simulator-frame" className="relative mx-auto max-w-[340px] w-full aspect-[9/19] bg-[#020509] rounded-[40px] border-4 border-slate-800 p-2.5 shadow-2xl overflow-hidden ring-1 ring-slate-700/50 flex flex-col">
      {/* Top phone components */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-12 h-1 bg-slate-900 rounded-full mb-1"></div>
        <div className="w-3 h-3 bg-slate-900 rounded-full ml-3 mb-1"></div>
      </div>

      {/* Screen Frame */}
      <div className="flex-1 w-full h-full bg-[#0A0E17] rounded-[30px] overflow-hidden flex flex-col relative font-sans text-slate-100">
        
        {/* Status Bar */}
        <div className="h-7 w-full pt-2 px-5 flex justify-between items-center text-[10px] text-slate-400 font-semibold select-none z-40 bg-[#0A0E17]/80 backdrop-blur-md">
          <span>{currentTime || "18:22"}</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={10} className="text-cyan-400" />
            <span className="text-[9px]">LTE</span>
            <Battery size={11} className="text-cyan-400" />
          </div>
        </div>

        {/* Dynamic Screens */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          <AnimatePresence mode="wait">
            
            {/* Screen 1: Splash Routing */}
            {bootState === 'splash' && (
              <motion.div 
                key="splash-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col justify-between items-center p-6 bg-[#0A0E17]"
              >
                <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center">
                  <div className="relative p-4 rounded-full bg-slate-900/40 border border-cyan-500/10">
                    <div className="absolute inset-0 rounded-full border-t border-cyan-400 animate-spin"></div>
                    <Shield size={36} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-[0.2em] text-cyan-400 font-mono">KRYPTONIX SYNC</h2>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider">Secure Bridge v1.8.0</p>
                  </div>
                </div>

                <div className="w-full space-y-2 mb-4">
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <span>{splashStatus}</span>
                    <span>{splashProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-300" 
                      style={{ width: `${splashProgress}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Screen 2: Local Cryptography Generation */}
            {bootState === 'setup' && (
              <motion.div 
                key="setup-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 p-5 flex flex-col justify-between bg-[#0A0E17] font-mono text-xs overflow-y-auto pt-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                    <KeyRound size={16} className="text-purple-400" />
                    <span className="font-bold text-slate-300">SECURE HARDWARE ENROLL</span>
                  </div>
                  
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Kryptonix Sync utilizes cryptographic end-to-end local enclaves. Your identity starts by mapping an exclusive alphanumeric Business ID on the secure sandbox.
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] text-cyan-400 font-semibold uppercase">Client Node Alias</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Finance Admin A"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#141A29] border border-slate-800 focus:border-cyan-400 outline-none rounded-lg px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-600 transition"
                      disabled={hardwareKeyGen}
                    />
                  </div>

                  <div className="p-3 bg-[#111622] rounded-lg border border-slate-900 space-y-1">
                    <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider block">Local Host Isolation</span>
                    <p className="text-[9px] text-slate-500 leading-tight">
                      Onboard credentials and messages will write exclusively onto your encrypted Room Database utilizing SQLite <span className="text-slate-300 font-bold">SQLCipher v4</span> with physical key bindings on security hardware.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleKeyGeneration}
                    disabled={hardwareKeyGen || !username.trim()}
                    className={`w-full py-2.5 rounded-lg font-bold text-center flex items-center justify-center gap-2 tracking-wide transition uppercase ${
                      hardwareKeyGen || !username.trim()
                        ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/10'
                    }`}
                  >
                    {hardwareKeyGen ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Provisioning Keys...</span>
                      </>
                    ) : (
                      <>
                        <LockKeyhole size={13} />
                        <span>Activate Enclave</span>
                      </>
                    )}
                  </button>
                  <span className="text-[8px] text-slate-600 text-center block mt-2">AES-GCM (256-bit) Hardware-backed Keystore Hook</span>
                </div>
              </motion.div>
            )}

            {/* Screen 3: Compose Direct Messaging Dashboard */}
            {bootState === 'dashboard' && (
              <motion.div 
                key="dashboard-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col justify-between bg-[#0A0E17]"
              >
                {/* Header Profile Info inside app */}
                <div className="bg-[#141A29]/90 border-b border-slate-900/60 p-3 flex justify-between items-center z-20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center relative">
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900"></span>
                      <User size={13} className="text-cyan-400" />
                    </div>
                    <div className="leading-none">
                      <span className="text-[10px] font-bold text-slate-200 block truncate max-w-[120px]">{username || "Client Node"}</span>
                      <span className="text-[8px] font-mono text-cyan-400 max-w-[120px] truncate block mt-0.5">{clientBusinessId}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleWipeData}
                    className="text-[8px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition px-2 py-1 rounded"
                  >
                    PURGE
                  </button>
                </div>

                {!activeCompanion ? (
                  /* Screen State: Searching / ID discovery */
                  <div className="flex-1 flex flex-col p-4 justify-between pt-6 font-mono text-xs">
                    <div className="space-y-4">
                      <div className="bg-[#101420] border border-cyan-500/10 p-3 rounded-lg flex items-start gap-2.5">
                        <Activity size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-200 block">ENCRYPTION ACTIVE</span>
                          <p className="text-[9px] text-slate-500 leading-snug">
                            Private routing tunnels require direct, authorized alphanumeric ids. Contacts are searchable via Kryptonix directory parameters.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 uppercase font-semibold">Verify Recipient Business ID</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="e.g. KTX-ADMIN-MAIN"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                            className="w-full bg-[#111622] border border-slate-900 focus:border-cyan-400 outline-none rounded-lg pl-3 pr-8 py-2 text-[11px] text-slate-100 placeholder:text-slate-600 font-mono"
                          />
                          <button 
                            onClick={handleSearchVerify}
                            className="absolute right-2 top-2 text-cyan-400 hover:text-cyan-300"
                          >
                            <Search size={14} />
                          </button>
                        </div>
                      </div>

                      {searchError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] leading-relaxed flex gap-2">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <span>{searchError}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-900/60 text-center">
                      <p className="text-[10px] text-slate-500">
                        Type <span className="text-cyan-400 font-bold">KTX-ADMIN-MAIN</span> in the query search bar above to create a secure tunnel with company administrators.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Screen State: Chat Active */
                  <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
                    
                    {/* Tunnel Top bar info */}
                    <div className="bg-[#0e121d] py-1.5 px-3 flex justify-between items-center text-[9px] font-mono border-b border-slate-900/40 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Lock size={9} className="text-cyan-400" />
                        <span>E2E TUNNEL ESTABLISHED</span>
                      </div>
                      <span className="text-[8px] text-slate-500">AES-256 GCM</span>
                    </div>

                    {/* Messages Scroll Box */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* Sticky Date Header */}
                      <div className="text-center">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/60 px-2 py-0.5 rounded-full">
                          Today, 31 May 2026
                        </span>
                      </div>

                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-slate-600 gap-1 font-mono">
                          <Lock size={16} />
                          <span className="text-[10px]">No transmitted payloads</span>
                          <span className="text-[8px]">Secure handshake initialized. Say Hello.</span>
                        </div>
                      ) : (
                        messages.map((m) => (
                          <div 
                            key={m.id}
                            className={`flex flex-col max-w-[85%] ${m.isFromSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <div className="flex items-center gap-1 mb-0.5 text-[8px] font-mono text-slate-500 select-none">
                              <span>{m.isFromSelf ? `${username}` : 'KTX-ADMIN'}</span>
                            </div>

                            <div className={`p-2.5 rounded-2xl relative border ${
                              m.isFromSelf 
                                ? 'bg-[#142035] text-slate-100 border-cyan-500/10 rounded-br-sm' 
                                : 'bg-[#1E1428] text-slate-100 border-purple-500/10 rounded-bl-sm'
                            }`}>
                              <p className="text-[11px] leading-relaxed break-words">{m.plaintext}</p>
                              
                              <div className="mt-1 flex items-center justify-between text-[8px] text-slate-400 font-mono gap-4 leading-none">
                                <span className="text-[7.5px] text-slate-500 truncate max-w-[130px]" title={m.encrypted}>
                                  CIPHER: {m.encrypted.length > 20 ? `${m.encrypted.substring(0, 18)}...` : m.encrypted}
                                </span>
                                
                                <div className="flex items-center gap-1 shrink-0 select-none">
                                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                  {m.isFromSelf && (
                                    <span>
                                      {m.deliveryState === 0 && <Check size={8} />}
                                      {m.deliveryState === 1 && <CheckCheck size={8} className="text-slate-500" />}
                                      {m.deliveryState === 2 && <CheckCheck size={8} className="text-cyan-400" />}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      <div ref={bottomRef}></div>
                    </div>

                    {/* Chat Input controls */}
                    <div className="p-2 bg-[#121724]/90 border-t border-slate-950 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Write encrypted message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-[#090D15] border border-slate-800 outline-none rounded-2xl focus:border-cyan-400 px-3.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 font-mono"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className={`p-2 rounded-2xl shrink-0 transition ${
                          messageInput.trim() 
                            ? 'bg-cyan-500 text-slate-900 hover:scale-105' 
                            : 'bg-slate-900 text-slate-600'
                        }`}
                      >
                        <Send size={11} />
                      </button>
                    </div>

                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
