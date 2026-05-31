import React, { useState } from 'react';
import { 
  Terminal, 
  Send, 
  Database, 
  Bell, 
  Cpu, 
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  FileJson
} from 'lucide-react';

interface Log {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface Message {
  id: string;
  senderId: string;
  isFromSelf: boolean;
  plaintext: string;
  encrypted: string;
  timestamp: number;
  deliveryState: number;
}

interface KtorConsoleProps {
  logs: Log[];
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  clearLogs: () => void;
  clientBusinessId: string;
  activeCompanion: string | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function KtorConsole({
  logs,
  addLog,
  clearLogs,
  clientBusinessId,
  activeCompanion,
  messages,
  setMessages
}: KtorConsoleProps) {
  const [adminMessage, setAdminMessage] = useState("");
  const [showJsonTemplate, setShowJsonTemplate] = useState(false);
  const [apiIsDispatching, setApiIsDispatching] = useState(false);

  const simulateAdminEncryptAndDispatch = () => {
    if (!adminMessage.trim()) return;
    if (!clientBusinessId) {
      addLog("Sync Error: Client Device ID is unregistered! Complete local hardware enroll first.", "error");
      return;
    }

    setApiIsDispatching(true);
    const text = adminMessage.trim();
    
    // Perform simulated admin side AES encryption
    const mockSalt = "KTX-ADMIN";
    const base64Str = btoa(unescape(encodeURIComponent(text))).replace(/=/g, "");
    const ciphertext = `gcm:${mockSalt}:${base64Str.substring(0, 16)}`;

    addLog(`Ktor Server: Received dispatch request POST /api/sync/dispatch`, "info");
    addLog(`Ktor Server: Encrypted payload internally with AESKeyAlias. Payload: "${text}"`, "info");
    addLog(`Ktor Server: Ciphertext: [${ciphertext}]`, "warning");

    setTimeout(() => {
      // Create new admin message
      const adminMessageObj: Message = {
        id: "MSG-ADMIN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        senderId: "KTX-ADMIN-MAIN",
        isFromSelf: false, // Sent from administrator
        plaintext: text,
        encrypted: ciphertext,
        timestamp: Date.now(),
        deliveryState: 2 // Already delivered/rendered
      };

      // Add to messages tree
      setMessages(prev => [...prev, adminMessageObj]);
      
      addLog(`Ktor Server: Saved E2EE message node recursively in Firestore branch: /rooms/${clientBusinessId}_KTX_ADMIN_MAIN/messages`, "success");
      addLog(`Ktor Server: Initializing high-priority Firebase Cloud Messaging (FCM) dispatch...`, "info");

      setTimeout(() => {
        addLog(`FCM API: Handshake success. High priority awaken broadcast context sent to device ID token: ${clientBusinessId}`, "success");
        setApiIsDispatching(false);
        setAdminMessage("");
      }, 500);

    }, 800);
  };

  const getEncryptedRepresentationSnippet = () => {
    if (!adminMessage.trim()) return "...";
    return btoa(adminMessage).substring(0, 12);
  };

  return (
    <div className="bg-[#0e1320] border border-slate-900 rounded-2xl shadow-xl flex flex-col overflow-hidden h-full">
      {/* Console Top Header bar */}
      <div className="bg-[#141A2B] border-b border-slate-950 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-cyan-400" />
          <h3 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-widest">Kryptonix Ktor Gateway Console</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[9px] text-emerald-400 font-bold">KTOR ONLINE : 3000</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Section 1: REST API Sync Middleware dispatcher */}
        <div className="bg-[#090D15] rounded-xl border border-slate-900 overflow-hidden">
          <div className="bg-[#101524] px-3 py-2 border-b border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-cyan-400">
              <Database size={11} /> 
              WEB-TO-MOBILE SYNCHRONIZER
            </span>
            <button 
              onClick={() => setShowJsonTemplate(!showJsonTemplate)}
              className="text-[9px] text-slate-500 hover:text-cyan-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded transition"
            >
              <FileJson size={10} />
              JSON SCHEMA
            </button>
          </div>

          <div className="p-3.5 space-y-3">
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Acts as the corporate administrator panel. Post any administrative message securely. This replicates an enterprise HTTP post onto Ktor backend routers.
            </p>

            {/* REST Request API form preview */}
            <div className="space-y-2.5 font-mono text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-1">
                <span>INTERACTIVE ENDPOINT</span>
                <span className="text-emerald-500">POST /api/sync/dispatch</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex text-[9px] text-slate-500 justify-between">
                  <span>RECIPIENT_ID</span>
                  <span className="text-cyan-400 font-semibold">{clientBusinessId || 'NOT_ENROLLED_YET'}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 block uppercase">ADMIN_PLAINTEXT_PAYLOAD</span>
                  <textarea
                    rows={2}
                    placeholder="Provide alert payload, task specifications, or server coordinates..."
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    className="w-full bg-[#111622] border border-slate-900 focus:border-cyan-400 outline-none rounded-md px-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-700 font-mono resize-none"
                    disabled={!clientBusinessId}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={simulateAdminEncryptAndDispatch}
              disabled={apiIsDispatching || !adminMessage.trim() || !clientBusinessId}
              className={`w-full py-2 rounded-lg font-bold text-center flex items-center justify-center gap-2 tracking-wide transition text-xs font-mono uppercase ${
                apiIsDispatching || !adminMessage.trim() || !clientBusinessId
                  ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
              }`}
            >
              {apiIsDispatching ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>TRANSMITTING PAYLOAD...</span>
                </>
              ) : (
                <>
                  <Send size={11} />
                  <span>DISPATCH ENCRYPTED TASK</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* JSON Schema visualizer */}
        {showJsonTemplate && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 space-y-2">
            <span className="text-[8.5px] text-purple-400 font-bold block">HTTP ENCRYPTED POST PAYLOAD FORM:</span>
            <pre className="text-cyan-300 leading-relaxed overflow-x-auto">
{`{
  "recipientBusinessId": "${clientBusinessId || 'KTX-USER-8921'}",
  "senderBusinessId": "KTX-ADMIN-MAIN",
  "base64EncryptedPayload": "gcm:KTX-ADMIN:${getEncryptedRepresentationSnippet()}...",
  "clientNotificationRequired": true
}`}
            </pre>
            <span className="text-[8.5px] text-slate-500 block border-t border-slate-900 pt-1.5">
              The Ktor middleware processes this structure, persists to Firebase buckets, and triggers Firebase Cloud Messaging (FCM) to awake subscribers.
            </span>
          </div>
        )}

        {/* Section 2: Realtime Live Server Log Console */}
        <div className="bg-[#090D15] rounded-xl border border-slate-900 overflow-hidden flex flex-col h-48">
          <div className="bg-[#101524] px-3 py-1.5 border-b border-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-400 shrink-0">
            <span className="font-bold flex items-center gap-1.5 text-orange-400">
              <Terminal size={11} /> 
              LIVE HTTP & WEB LOGSTREAM
            </span>
            <button 
              onClick={clearLogs}
              className="text-[9px] hover:text-cyan-400 bg-slate-900 px-2 py-0.5 rounded transition"
            >
              CLEAR
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 font-mono text-[10.5px] space-y-2">
            {logs.length === 0 ? (
              <p className="text-slate-600 text-center py-4">Waiting for gateway registrations or crypto actions...</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-tight">
                  <span className="text-[9px] text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={`break-words ${
                    log.type === 'error' ? 'text-rose-400' :
                    log.type === 'warning' ? 'text-cyan-400' :
                    log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
