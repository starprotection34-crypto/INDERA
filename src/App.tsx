import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Search, Menu, X, Shield, Calendar, FileText, Users, Settings, Home as HomeIcon, ChevronRight, Grid, List as ListIcon, Lock, LogOut, Upload, MapPin, Activity, Cpu, Database, Eye, File, FileImage, FileSpreadsheet, Presentation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import sanctionsData from "./data/sanctions.json";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Types ---
interface CMSConfig {
  siteName: string;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  footerText: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  date: string;
}

interface User {
  email: string;
  role: string;
  username?: string;
}

const AuthContext = createContext<{
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {}
});

const CMSContext = createContext<{
  config: CMSConfig;
  posts: Post[];
  updateConfig: (c: CMSConfig) => void;
  updatePosts: (p: Post[]) => void;
  layout: "list" | "grid";
  setLayout: (l: "list" | "grid") => void;
  briefings: any[];
  addBriefing: (b: any) => void;
  setActiveBriefing: (b: any | null) => void;
}>({
  config: {
    siteName: "INDERA - Intelligence, Defense Research and Analysis",
    logoText: "INDERA",
    primaryColor: "#E31E24",
    secondaryColor: "#050505",
    fontFamily: "JetBrains Mono",
    footerText: "© 2026 INDERA - Intelligence, Defense Research and Analysis. All rights reserved."
  },
  posts: [],
  updateConfig: () => {},
  updatePosts: () => {},
  layout: "list",
  setLayout: () => {},
  briefings: [],
  addBriefing: () => {},
  setActiveBriefing: () => {}
});

// --- Components ---

const InderaLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center bg-black p-1 select-none ${className}`}>
    {/* Left Box with red D */}
    <div className="relative w-14 h-14 border-2 border-white flex items-center justify-center bg-black mr-3">
      <div className="absolute inset-0.5 border border-white/30"></div>
      <span className="text-5xl font-black text-[#E31E24] relative z-10 leading-none select-none" style={{ 
        fontFamily: 'serif', 
        textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 0 10px rgba(227,30,36,0.5)' 
      }}>D</span>
    </div>
    
    {/* Right part: INDERA and text bar */}
    <div className="flex flex-col">
      <div className="flex items-baseline">
        <span className="text-4xl font-black text-white tracking-tighter uppercase leading-none select-none" style={{ 
          fontFamily: 'serif',
          letterSpacing: '-0.05em'
        }}>
          INDER
          <span className="relative inline-block">
            A
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12px] text-black font-bold">★</span>
          </span>
        </span>
      </div>
      <div className="bg-[#E31E24] px-2 py-0.5 mt-1 shadow-[0_0_10px_rgba(227,30,36,0.3)]">
        <span className="text-[7px] font-black text-black uppercase tracking-wider whitespace-nowrap leading-none">
          Intelligence, Defense Research and Analysis
        </span>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("ADMIN");
  const [password, setPassword] = useState("Star");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      login(data.user);
      navigate("/");
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="sci-fi-grid absolute inset-0 opacity-20"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0A0A0A] p-8 border border-[#E31E24]/30 rounded-lg shadow-[0_0_30px_rgba(227,30,36,0.1)] relative z-10"
      >
        <div className="scanline absolute inset-0 pointer-events-none opacity-10"></div>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <InderaLogo className="scale-110" />
          </div>
          <div className="inline-flex p-4 border-2 border-[#E31E24] text-[#E31E24] rounded-full mb-4 glow-red">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase text-glow-red">Terminal Access</h2>
          <p className="text-gray-500 text-xs mt-2 font-mono">ENCRYPTION LEVEL: MAXIMUM</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono">
          <div>
            <label className="block text-[10px] font-bold text-[#E31E24] uppercase tracking-widest mb-2">User Identifier</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#E31E24] uppercase tracking-widest mb-2">Security Key</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-[#E31E24] text-xs font-bold animate-pulse">{error}</p>}
          <button 
            type="submit"
            className="w-full py-3 bg-[#E31E24] text-white font-black uppercase tracking-widest rounded hover:bg-[#C2181D] transition-all shadow-[0_0_15px_rgba(227,30,36,0.3)]"
          >
            Authenticate
          </button>
        </form>
        <div className="mt-6 text-center text-[8px] text-gray-600 uppercase tracking-[0.2em]">
          Unauthorised access attempts are monitored and logged by INDERA.
        </div>
      </motion.div>
    </div>
  );
};

const BriefingScreen = ({ briefing, onClose }: { briefing: any, onClose: () => void }) => {
  const [summary, setSummary] = useState("Initializing neural processing...");
  const [isProcessing, setIsProcessing] = useState(true);
  const { briefings } = useContext(CMSContext);

  const subjectName = briefing.name || briefing.fullName || "UNKNOWN";
  const subjectAlias = briefing.alias || (briefing.aliases && briefing.aliases?.[0]) || "NONE";

  useEffect(() => {
    const processData = async () => {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.error("Neural Link Error: GEMINI_API_KEY is missing from environment.");
          setSummary("Error: Neural link offline. API_KEY_NOT_FOUND. Contact administrator.");
          setIsProcessing(false);
          return;
        }

        // Find related briefings (same name or alias)
        const relatedBriefings = briefings.filter(b => 
          b.id !== briefing.id && 
          (
            (b.name && b.name.toLowerCase() === subjectName.toLowerCase()) || 
            (b.alias && b.alias.toLowerCase() === subjectName.toLowerCase()) ||
            (subjectAlias !== "NONE" && b.name && b.name.toLowerCase() === subjectAlias.toLowerCase())
          )
        );

        // Find related sanctions
        const relatedSanctions = sanctionsData.filter(s => 
          s.fullName.toLowerCase().includes(subjectName.toLowerCase()) ||
          (subjectAlias !== "NONE" && s.fullName.toLowerCase().includes(subjectAlias.toLowerCase())) ||
          (s.aliases && s.aliases.some(a => a.toLowerCase().includes(subjectName.toLowerCase())))
        );

        const genAI = new GoogleGenAI({ apiKey });
        
        // Prepare a condensed version of the data to avoid token limits
        const contextData = {
          subject: {
            name: subjectName,
            alias: subjectAlias,
            nationality: briefing.nationality || (Array.isArray(briefing.nationality) ? briefing.nationality.join(", ") : briefing.nationality),
            reference: briefing.reference || briefing.id
          },
          currentBriefing: {
            details: briefing.details || briefing.narrative || "No narrative provided.",
            files: briefing.files?.map((f: any) => f.name) || []
          },
          historicalData: relatedBriefings.slice(0, 3).map(b => ({
            date: b.timestamp,
            summary: b.details?.substring(0, 200) + "..."
          })),
          sanctionsRecords: relatedSanctions.slice(0, 2).map(s => ({
            ref: s.reference,
            narrative: s.narrative?.substring(0, 300) + "..."
          }))
        };

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `You are a high-level security intelligence officer for INDERA. 
          Perform a comprehensive neural analysis for the following subject profile:
          
          ${JSON.stringify(contextData)}
          
          Summarize the threat level, key associations, and any new actionable intelligence derived from this combined data set. 
          Format it as a concise, professional briefing report with a futuristic, sci-fi tone. 
          Use technical jargon like 'neural signature', 'orbital tracking', 'encrypted data-stream', 'biometric override', etc.
          
          Output should be structured with headers: [THREAT_LEVEL], [KEY_ASSOCIATIONS], [ACTIONABLE_INTELLIGENCE].
          Keep the total response under 400 words.`,
        });
        
        setSummary(response.text || "No intelligence gathered.");
      } catch (err: any) {
        console.error("Neural Link Failure:", err);
        if (err.message?.includes("max tokens") || err.message?.includes("429")) {
          setSummary("Error: Neural link overflow. Data payload too large or rate limit exceeded. [ERR_CODE: 0x404-T]");
        } else {
          setSummary("Error: Neural link failed. Manual review required. [ERR_CODE: 0x882-X]");
        }
      } finally {
        setIsProcessing(false);
      }
    };
    processData();
  }, [briefing, briefings, subjectName, subjectAlias]);

  const position: [number, number] = [
    briefing.latitude || 34.0522, 
    briefing.longitude || -118.2437
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] text-[#E31E24] font-mono overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto border border-[#E31E24]/30 rounded-lg bg-[#0A0A0A] shadow-[0_0_50px_rgba(227,30,36,0.1)] relative overflow-hidden">
        {/* Scanline Effect */}
        <div className="scanline absolute inset-0 pointer-events-none opacity-20 z-10"></div>
        
        {/* Header */}
        <div className="p-6 border-b border-[#E31E24]/30 flex justify-between items-center bg-[#111]">
          <div className="flex items-center gap-6">
            <InderaLogo className="scale-75 origin-left" />
            <div className="h-10 w-px bg-[#E31E24]/20 hidden sm:block"></div>
            <div>
              <h1 className="text-xl font-black tracking-widest uppercase text-glow-red">Intelligence Terminal</h1>
              <div className="flex gap-4 text-[10px] opacity-70">
                <span>STATUS: ENCRYPTED</span>
                <span>LEVEL: TOP SECRET</span>
                <span>REF: {briefing.reference || `NEW_ENTRY_${briefing.id}`}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 border border-[#E31E24]/30 hover:bg-[#E31E24]/10 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column: Visuals */}
          <div className="space-y-6">
            <div className="aspect-square bg-[#111] border border-[#E31E24]/30 relative flex items-center justify-center overflow-hidden group">
              {briefing.photo ? (
                <img src={briefing.photo} alt="Subject" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-2 opacity-30" />
                  <span className="text-xs opacity-50 font-black tracking-widest">NO PHOTO AVAILABLE</span>
                </div>
              )}
              <div className="absolute top-2 left-2 text-[10px] bg-black/80 px-2 py-1 border border-[#E31E24]/30">VISUAL_FEED_01</div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E31E24]/50 animate-[scan_2s_linear_infinite]"></div>
            </div>

            <div className="h-64 bg-[#111] border border-[#E31E24]/30 relative overflow-hidden flex flex-col">
              <div className="p-2 border-b border-[#E31E24]/10 text-[10px] uppercase opacity-70 flex justify-between">
                <span>Geolocation Data</span>
                <span>COORD: {position[0].toFixed(4)}° N, {position[1].toFixed(4)}° W</span>
              </div>
              <div className="flex-1 relative z-0">
                <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>
                      <span className="font-mono text-xs">LAST KNOWN LOCATION: {subjectName}</span>
                    </Popup>
                  </Marker>
                </MapContainer>
                {/* Overlay to keep it sci-fi */}
                <div className="absolute inset-0 pointer-events-none border border-[#E31E24]/20 z-10"></div>
              </div>
            </div>
          </div>

          {/* Middle Column: Details */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#111] border border-[#E31E24]/20 rounded">
                <div className="flex items-center gap-2 mb-4 text-[#E31E24]">
                  <Database size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Subject Profile</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-[#E31E24]/10 pb-1">
                    <span className="opacity-50">NAME:</span>
                    <span className="font-bold text-white uppercase tracking-tight">{subjectName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E31E24]/10 pb-1">
                    <span className="opacity-50">ALIAS:</span>
                    <span className="font-bold text-white uppercase tracking-tight">{subjectAlias}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E31E24]/10 pb-1">
                    <span className="opacity-50">ORIGIN:</span>
                    <span className="font-bold text-white uppercase tracking-tight">
                      {Array.isArray(briefing.nationality) ? briefing.nationality.join(", ") : (briefing.nationality || "UNKNOWN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E31E24]/10 pb-1">
                    <span className="opacity-50">FILE_TYPE:</span>
                    <span className="font-bold text-yellow-500 uppercase tracking-widest">{briefing.fileType || "DATABASE_RECORD"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#111] border border-[#E31E24]/20 rounded">
                <div className="flex items-center gap-2 mb-4 text-[#E31E24]">
                  <Activity size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Biometric Status</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      className="h-full bg-[#E31E24] shadow-[0_0_10px_#E31E24]"
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] opacity-50">
                    <span>THREAT_INDEX</span>
                    <span>75%</span>
                  </div>
                  <div className="flex gap-1 h-8 items-end">
                    {[...Array(20)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: [10, Math.random() * 30, 10] }}
                        transition={{ repeat: Infinity, duration: 1 + Math.random() }}
                        className="flex-1 bg-[#E31E24]/30"
                      ></motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Intelligence Materials Section */}
              <div className="p-4 bg-[#111] border border-[#E31E24]/20 rounded md:col-span-2">
                <div className="flex items-center gap-2 mb-4 text-[#E31E24]">
                  <FileText size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Intelligence Materials</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {briefing.files && briefing.files.length > 0 ? (
                    briefing.files.map((file: any, index: number) => {
                      const isImage = file.type.startsWith("image/");
                      const isPdf = file.type === "application/pdf";
                      const isExcel = file.type.includes("spreadsheet") || file.type.includes("excel");
                      const isPpt = file.type.includes("presentation") || file.type.includes("powerpoint");
                      
                      let Icon = File;
                      if (isImage) Icon = FileImage;
                      else if (isPdf) Icon = FileText;
                      else if (isExcel) Icon = FileSpreadsheet;
                      else if (isPpt) Icon = Presentation;

                      return (
                        <a 
                          key={index}
                          href={file.path}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-col items-center p-3 bg-black/40 border border-[#E31E24]/10 rounded hover:border-[#E31E24]/50 transition-all group"
                        >
                          <div className="w-10 h-10 flex items-center justify-center mb-2 text-gray-500 group-hover:text-[#E31E24] transition-colors">
                            <Icon size={24} />
                          </div>
                          <span className="text-[8px] text-gray-400 uppercase tracking-widest text-center truncate w-full">
                            {file.name}
                          </span>
                        </a>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-4 text-center border border-dashed border-gray-800 rounded">
                      <span className="text-[10px] text-gray-600 uppercase tracking-widest">No additional materials attached</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#111] border border-[#E31E24]/30 rounded relative min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 text-[#E31E24]">
                <Cpu size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Neural Intelligence Summary</span>
              </div>
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <div className="w-12 h-12 border-4 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin"></div>
                  <span className="text-xs animate-pulse tracking-widest">DECRYPTING_DATA_STREAM...</span>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300 font-mono"
                >
                  {summary}
                </motion.div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-1 h-1 bg-[#E31E24] rounded-full animate-ping"></div>
                <div className="w-1 h-1 bg-[#E31E24] rounded-full animate-ping [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-[#E31E24] rounded-full animate-ping [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="p-4 border-t border-[#E31E24]/10 bg-[#080808] flex justify-between text-[8px] opacity-40 uppercase tracking-widest">
          <span>SYSTEM_VERSION: 4.2.0-ALPHA</span>
          <span>UPTIME: 142:55:12</span>
          <span>OPERATIVE: {briefing.author || "SYSTEM"}</span>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { config } = useContext(CMSContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/", icon: <HomeIcon size={18} /> },
    { name: "About", path: "/about", icon: <Users size={18} /> },
    { name: "Programme of Work", path: "/programme", icon: <Calendar size={18} /> },
    { name: "Decisions & Outcomes", path: "/decisions", icon: <FileText size={18} /> },
    { name: "Meetings & Documents", path: "/meetings", icon: <FileText size={18} /> },
  ];

  return (
    <nav className="bg-[#0A0A0A] border-b border-[#E31E24]/30 sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <InderaLogo className="scale-90 sm:scale-100 origin-left transition-transform duration-300" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  location.pathname === link.path 
                    ? "bg-[#E31E24] text-white shadow-[0_0_10px_rgba(227,30,36,0.3)]" 
                    : "text-gray-400 hover:text-[#E31E24] hover:bg-[#E31E24]/10"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="h-6 w-px bg-gray-800 mx-4"></div>
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/portal" 
                  className="px-4 py-2 bg-[#E31E24] text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#C2181D] transition-all shadow-[0_0_10px_rgba(227,30,36,0.3)]"
                >
                  Search Portal
                </Link>
                <Link to="/admin" className="p-2 text-gray-400 hover:text-[#E31E24] transition-colors">
                  <Settings size={20} />
                </Link>
                <button 
                  onClick={logout} 
                  className="px-4 py-2 border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded hover:text-[#E31E24] hover:border-[#E31E24]/30 transition-all flex items-center gap-2"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="px-6 py-2 border-2 border-[#E31E24] text-[#E31E24] text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#E31E24]/10 transition-all glow-red"
              >
                Terminal Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-[#E31E24]">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0A0A0A] border-t border-[#E31E24]/30 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#E31E24] hover:bg-[#E31E24]/10"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-800 mt-4">
                {user ? (
                  <>
                    <Link to="/portal" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-[#E31E24] font-black uppercase tracking-widest">Search Portal</Link>
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-gray-400 font-black uppercase tracking-widest">Admin Panel</Link>
                    <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-[#E31E24] font-black uppercase tracking-widest">Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-[#E31E24] font-black uppercase tracking-widest">Terminal Login</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const { config } = useContext(CMSContext);
  return (
    <footer className="bg-[#050505] text-white py-12 border-t border-[#E31E24]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <InderaLogo className="scale-110 origin-left" />
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed font-mono text-xs">
              INDERA - Intelligence, Defense Research and Analysis. A specialized division for global security monitoring and strategic intelligence processing.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">Navigation</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/about" className="text-gray-400 hover:text-[#E31E24] transition-colors">About Division</Link></li>
              <li><Link to="/programme" className="text-gray-400 hover:text-[#E31E24] transition-colors">Strategic Plan</Link></li>
              <li><Link to="/decisions" className="text-gray-400 hover:text-[#E31E24] transition-colors">Directives</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">Protocols</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><a href="#" className="text-gray-400 hover:text-[#E31E24] transition-colors">Data Privacy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#E31E24] transition-colors">Access Control</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#E31E24] transition-colors">Encryption</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-[10px] font-mono">{config.footerText}</p>
          <div className="flex gap-6">
            <span className="text-[#E31E24] text-[8px] uppercase tracking-[0.2em] animate-pulse">SYSTEM_STATUS: ACTIVE</span>
            <span className="text-gray-600 text-[8px] uppercase tracking-[0.2em]">SECURE_LINK: ESTABLISHED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Home = () => {
  const { posts } = useContext(CMSContext);
  return (
    <div className="space-y-20 pb-20 relative">
      <div className="sci-fi-grid absolute inset-0 opacity-10 pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
            alt="Global Network" 
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#E31E24]/50 bg-[#E31E24]/10 rounded text-[#E31E24] text-[10px] font-black uppercase tracking-[0.3em] mb-8 glow-red">
              <Activity size={14} />
              Strategic Intelligence Interface
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase text-glow-red">
              DEFENSE <br />
              <span className="text-[#E31E24]">RESEARCH.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-12 leading-relaxed font-mono max-w-xl">
              Access the INDERA unified intelligence network. Monitor global sanctions, process strategic data, and generate neural briefings in real-time.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/portal" className="px-10 py-4 bg-[#E31E24] text-white font-black uppercase tracking-widest rounded hover:bg-[#C2181D] transition-all shadow-[0_0_20px_rgba(227,30,36,0.4)] flex items-center gap-3">
                Access Terminal <ChevronRight size={20} />
              </Link>
              <Link to="/about" className="px-10 py-4 border-2 border-[#E31E24] text-[#E31E24] font-black uppercase tracking-widest rounded hover:bg-[#E31E24]/10 transition-all glow-red">
                Division Info
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="scanline absolute inset-0 pointer-events-none opacity-10"></div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Neural Profiles", value: "2,450+", icon: <Users className="text-[#E31E24]" /> },
            { label: "Intelligence Briefs", value: "892", icon: <FileText className="text-[#E31E24]" /> },
            { label: "Network Nodes", value: "193", icon: <Shield className="text-[#E31E24]" /> },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg shadow-2xl flex items-center gap-6 group hover:border-[#E31E24]/50 transition-colors"
            >
              <div className="p-4 bg-[#E31E24]/10 border border-[#E31E24]/30 rounded group-hover:glow-red transition-all">{stat.icon}</div>
              <div>
                <div className="text-3xl font-black text-white tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest Updates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-white tracking-widest uppercase text-glow-red">Data Stream</h2>
            <p className="text-gray-500 font-mono text-xs mt-2">Recent intelligence updates from the network.</p>
          </div>
          <Link to="/portal" className="text-[#E31E24] font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-3 transition-all">
            Full Archive <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? posts.slice(0, 3).map((post) => (
            <div key={post.id} className="group bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg p-8 shadow-lg hover:border-[#E31E24]/50 transition-all cursor-pointer relative overflow-hidden">
              <div className="scanline absolute inset-0 pointer-events-none opacity-5"></div>
              <div className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-4">{post.date}</div>
              <h3 className="text-xl font-black text-white mb-4 group-hover:text-[#E31E24] transition-colors uppercase tracking-tight">{post.title}</h3>
              <p className="text-gray-400 text-xs font-mono line-clamp-3 leading-relaxed">{post.content}</p>
            </div>
          )) : (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-[#0A0A0A] border border-dashed border-[#E31E24]/20 rounded-lg p-8 flex items-center justify-center text-gray-600 font-black uppercase tracking-widest text-xs italic">
                Awaiting Data Feed {i}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const About = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 relative">
    <div className="sci-fi-grid absolute inset-0 opacity-5 pointer-events-none"></div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
      <h1 className="text-4xl font-black text-white mb-8 tracking-widest uppercase text-glow-red">About INDERA</h1>
      <div className="prose prose-invert prose-red leading-relaxed space-y-6 text-gray-400 font-mono text-sm">
        <p>
          INDERA (Intelligence, Defense Research and Analysis) is a premier strategic monitoring division established to maintain global security through advanced data processing and neural intelligence analysis.
        </p>
        <p>
          Our mission is to provide authorized operatives with high-fidelity tools to search, analyze, and track entities of interest. By utilizing the latest in neural link technology and real-time satellite integration, we ensure that strategic decisions are backed by the most accurate intelligence available in the network.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="p-6 bg-[#0A0A0A] border border-[#E31E24]/30 rounded-lg">
            <h3 className="font-black text-[#E31E24] mb-2 uppercase tracking-widest text-xs">Primary Directive</h3>
            <p className="text-xs opacity-70">To safeguard global stability through proactive intelligence gathering and analysis.</p>
          </div>
          <div className="p-6 bg-[#0A0A0A] border border-[#E31E24]/30 rounded-lg">
            <h3 className="font-black text-[#E31E24] mb-2 uppercase tracking-widest text-xs">Core Capabilities</h3>
            <p className="text-xs opacity-70">Neural briefings, real-time geolocation, and encrypted data synchronization.</p>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

const ProgrammeOfWork = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 relative">
    <div className="sci-fi-grid absolute inset-0 opacity-5 pointer-events-none"></div>
    <h1 className="text-4xl font-black text-white mb-12 tracking-widest uppercase text-glow-red relative z-10">Strategic Roadmap</h1>
    <div className="space-y-8 relative z-10">
      {[
        { quarter: "PHASE 01", focus: "Neural Link Upgrade", details: "Implementing advanced neural processing for multi-language document analysis." },
        { quarter: "PHASE 02", focus: "Network Interoperability", details: "Standardizing data exchange protocols with regional security agencies." },
        { quarter: "PHASE 03", focus: "Orbital Integration", details: "Adding real-time satellite imagery integration for high-priority subjects." },
      ].map((item, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-8 p-8 bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg group hover:border-[#E31E24]/50 transition-all">
          <div className="text-2xl font-black text-[#E31E24] whitespace-nowrap tracking-tighter">{item.quarter}</div>
          <div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{item.focus}</h3>
            <p className="text-gray-400 font-mono text-xs">{item.details}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DecisionsAndOutcomes = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 relative">
    <div className="sci-fi-grid absolute inset-0 opacity-5 pointer-events-none"></div>
    <h1 className="text-4xl font-black text-white mb-12 tracking-widest uppercase text-glow-red relative z-10">Directives & Outcomes</h1>
    <div className="space-y-6 relative z-10">
      {[
        { ref: "DIR-2026-001", title: "Expansion of Monitoring Protocols", date: "Jan 15, 2026" },
        { ref: "DIR-2026-002", title: "Adoption of AI Briefing Standards", date: "Feb 02, 2026" },
        { ref: "DIR-2026-003", title: "Update to High-Quality Alias Verification", date: "Mar 10, 2026" },
      ].map((res, i) => (
        <div key={i} className="p-6 bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg hover:border-[#E31E24]/50 transition-all flex justify-between items-center group cursor-pointer">
          <div>
            <div className="text-[10px] font-black text-[#E31E24] mb-1 tracking-widest">{res.ref}</div>
            <h3 className="font-black text-white group-hover:text-[#E31E24] transition-colors uppercase tracking-tight">{res.title}</h3>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">{res.date}</div>
        </div>
      ))}
    </div>
  </div>
);

const MeetingsAndDocuments = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 relative">
    <div className="sci-fi-grid absolute inset-0 opacity-5 pointer-events-none"></div>
    <h1 className="text-4xl font-black text-white mb-12 tracking-widest uppercase text-glow-red relative z-10">Briefings & Archives</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
      <div className="space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
          <Calendar className="text-[#E31E24]" /> Scheduled Briefings
        </h2>
        {[
          { title: "Strategic Council Review", date: "April 12, 2026" },
          { title: "Technical Working Group", date: "April 18, 2026" },
        ].map((m, i) => (
          <div key={i} className="p-4 bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg">
            <div className="font-black text-white uppercase tracking-tight text-sm">{m.title}</div>
            <div className="text-[10px] text-[#E31E24] mt-1 font-mono">{m.date}</div>
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
          <FileText className="text-[#E31E24]" /> Classified Documents
        </h2>
        {[
          { title: "Annual Security Report 2025", type: "PDF" },
          { title: "Sanctions Guidelines v4.2", type: "DOCX" },
        ].map((d, i) => (
          <div key={i} className="p-4 bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg flex justify-between items-center">
            <div className="font-black text-white uppercase tracking-tight text-sm">{d.title}</div>
            <div className="text-[8px] font-black bg-[#E31E24] text-white px-2 py-1 rounded uppercase tracking-widest">{d.type}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Portal = () => {
  const { user, logout } = useContext(AuthContext);
  const { layout, setLayout, briefings, setActiveBriefing } = useContext(CMSContext);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"sanctions" | "briefings">("sanctions");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "sanctions") {
      const filtered = sanctionsData.filter(s => 
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.reference.toLowerCase().includes(search.toLowerCase()) ||
        s.nationality.some(n => n.toLowerCase().includes(search.toLowerCase())) ||
        s.aliases.some(a => a.toLowerCase().includes(search.toLowerCase()))
      );
      setResults(filtered);
    } else {
      const filtered = briefings.filter(b => 
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.alias?.toLowerCase().includes(search.toLowerCase())
      );
      setResults(filtered);
    }
  }, [search, activeTab, briefings]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="sci-fi-grid absolute inset-0 opacity-5 pointer-events-none"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase text-glow-red">Intelligence Portal</h1>
          <p className="text-gray-500 font-mono text-xs mt-2">Access consolidated sanctions data and strategic briefings.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0A0A0A] p-1 rounded border border-[#E31E24]/30">
            <button 
              onClick={() => setLayout("list")}
              className={`p-2 rounded transition-all ${layout === "list" ? "bg-[#E31E24] text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
            >
              <ListIcon size={20} />
            </button>
            <button 
              onClick={() => setLayout("grid")}
              className={`p-2 rounded transition-all ${layout === "grid" ? "bg-[#E31E24] text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
            >
              <Grid size={20} />
            </button>
          </div>
          <button 
            onClick={logout} 
            className="px-4 py-2 border border-[#E31E24]/30 text-[#E31E24] text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#E31E24]/10 transition-all flex items-center gap-2"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 space-y-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E31E24]/50" size={20} />
            <input 
              type="text" 
              placeholder="Query by name, alias, ref..."
              className="w-full pl-12 pr-4 py-4 bg-[#0A0A0A] border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none shadow-lg font-mono text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg p-6 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">Data Source</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab("sanctions")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === "sanctions" ? "bg-[#E31E24] text-white shadow-lg" : "text-gray-500 hover:text-[#E31E24] hover:bg-[#E31E24]/10"}`}
              >
                <Shield size={16} /> Sanctions List
              </button>
              <button 
                onClick={() => setActiveTab("briefings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === "briefings" ? "bg-[#E31E24] text-white shadow-lg" : "text-gray-500 hover:text-[#E31E24] hover:bg-[#E31E24]/10"}`}
              >
                <Activity size={16} /> Neural Briefings
              </button>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1">
          <div className={`grid gap-6 ${layout === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            {results.length > 0 ? results.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveBriefing(item)}
                className={`bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg p-6 shadow-lg hover:border-[#E31E24]/50 transition-all cursor-pointer group relative overflow-hidden ${layout === "list" ? "flex items-center gap-6" : ""}`}
              >
                <div className="scanline absolute inset-0 pointer-events-none opacity-5"></div>
                <div className={`w-16 h-16 rounded border-2 flex items-center justify-center shrink-0 ${activeTab === "sanctions" ? "border-[#E31E24] text-[#E31E24] glow-red" : "border-yellow-500 text-yellow-500"}`}>
                  {activeTab === "sanctions" ? <Shield size={32} /> : <Activity size={32} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#E31E24] opacity-70 mb-1 font-mono">
                        {activeTab === "sanctions" ? item.reference : `REF: ${item.id || 'NEW'}`}
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-[#E31E24] transition-colors uppercase tracking-tight">
                        {activeTab === "sanctions" ? item.fullName : item.name}
                      </h3>
                    </div>
                    <div className="px-2 py-1 bg-[#E31E24]/10 border border-[#E31E24]/30 rounded text-[8px] font-black text-[#E31E24] uppercase tracking-widest">
                      {activeTab === "sanctions" ? item.nationality.join(", ") : item.fileType || "BRIEFING"}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono line-clamp-1">
                    {activeTab === "sanctions" 
                      ? `Aliases: ${item.aliases.join(", ") || "None"}`
                      : `Intelligence summary for ${item.name}. Status: Classified.`
                    }
                  </p>
                </div>
                {layout === "list" && <ChevronRight className="text-gray-700 group-hover:text-[#E31E24] transition-colors" />}
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-[#0A0A0A] border border-dashed border-[#E31E24]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-gray-700" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No results found</h3>
                <p className="text-gray-500 font-mono text-xs">The database returned no matches for your query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, logout } = useContext(AuthContext);
  const { config, updateConfig, addBriefing } = useContext(CMSContext);
  const [activeTab, setActiveTab] = useState<"briefing" | "config">("briefing");
  
  // Briefing Form State
  const [briefingForm, setBriefingForm] = useState({
    name: "",
    alias: "",
    nationality: "",
    latitude: "",
    longitude: "",
    files: [] as File[],
    isUploading: false
  });

  const handleBriefingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBriefingForm(prev => ({ ...prev, isUploading: true }));

    try {
      let uploadedFiles: any[] = [];
      
      if (briefingForm.files.length > 0) {
        const formData = new FormData();
        briefingForm.files.forEach(file => {
          formData.append("files", file);
        });

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedFiles = uploadData.files;
        }
      }

      const newBriefing = {
        name: briefingForm.name,
        alias: briefingForm.alias,
        nationality: briefingForm.nationality,
        latitude: parseFloat(briefingForm.latitude) || (Math.random() * 180 - 90),
        longitude: parseFloat(briefingForm.longitude) || (Math.random() * 360 - 180),
        files: uploadedFiles,
        photo: uploadedFiles.find(f => f.type.startsWith("image/"))?.path || null,
        author: "Admin User",
        date: new Date().toISOString()
      };

      await addBriefing(newBriefing);
      setBriefingForm({ name: "", alias: "", nationality: "", latitude: "", longitude: "", files: [], isUploading: false });
      alert("Intelligence briefing processed and launched successfully.");
    } catch (err) {
      console.error("Submission failed", err);
      alert("Neural link failed. Intelligence upload aborted.");
      setBriefingForm(prev => ({ ...prev, isUploading: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 relative">
      <div className="sci-fi-grid absolute inset-0 opacity-5 pointer-events-none"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-widest uppercase text-glow-red">Command Center</h1>
          <p className="text-gray-500 font-mono text-xs mt-2">Manage division configuration and intelligence data.</p>
        </div>
        <button 
          onClick={logout} 
          className="px-4 py-2 border border-[#E31E24]/30 text-[#E31E24] text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#E31E24]/10 transition-all flex items-center gap-2"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-gray-800 relative z-10">
        <button 
          onClick={() => setActiveTab("briefing")}
          className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === "briefing" ? "text-[#E31E24]" : "text-gray-500 hover:text-gray-300"}`}
        >
          New Field Briefing
          {activeTab === "briefing" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#E31E24] rounded-t-full glow-red" />}
        </button>
        <button 
          onClick={() => setActiveTab("config")}
          className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === "config" ? "text-[#E31E24]" : "text-gray-500 hover:text-gray-300"}`}
        >
          Portal Configuration
          {activeTab === "config" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#E31E24] rounded-t-full glow-red" />}
        </button>
      </div>

      <div className="bg-[#0A0A0A] border border-[#E31E24]/20 rounded-lg p-8 shadow-2xl relative z-10">
        <div className="scanline absolute inset-0 pointer-events-none opacity-5"></div>
        {activeTab === "briefing" ? (
          <form onSubmit={handleBriefingSubmit} className="space-y-8 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Subject Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                    value={briefingForm.name}
                    onChange={(e) => setBriefingForm({...briefingForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Known Aliases</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                    value={briefingForm.alias}
                    onChange={(e) => setBriefingForm({...briefingForm, alias: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Nationality / Origin</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                    value={briefingForm.nationality}
                    onChange={(e) => setBriefingForm({...briefingForm, nationality: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Latitude</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 34.0522"
                      className="w-full px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                      value={briefingForm.latitude}
                      onChange={(e) => setBriefingForm({...briefingForm, latitude: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Longitude</label>
                    <input 
                      type="text" 
                      placeholder="e.g. -118.2437"
                      className="w-full px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                      value={briefingForm.longitude}
                      onChange={(e) => setBriefingForm({...briefingForm, longitude: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Intelligence Materials (PDF, DOC, XLS, PPT, IMG)</label>
                  <div className="border-2 border-dashed border-[#E31E24]/30 rounded-lg p-8 text-center hover:border-[#E31E24] transition-colors cursor-pointer relative group bg-black/50">
                    <input 
                      type="file" 
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          setBriefingForm({...briefingForm, files});
                        }
                      }}
                    />
                    <Upload className="mx-auto mb-4 text-gray-600 group-hover:text-[#E31E24] transition-colors" size={40} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {briefingForm.files.length > 0 ? `${briefingForm.files.length} Files Selected` : "Upload Data Stream"}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {briefingForm.files.map((f, i) => (
                        <span key={i} className="text-[8px] bg-[#E31E24]/10 border border-[#E31E24]/30 px-2 py-1 rounded text-[#E31E24] truncate max-w-[100px]">
                          {f.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-[8px] text-gray-600 mt-2 uppercase tracking-widest">Maximum payload: 50MB per file</p>
                  </div>
                </div>
              </div>
            </div>
            <button 
              type="submit"
              disabled={briefingForm.isUploading}
              className={`w-full py-4 bg-[#E31E24] text-white font-black uppercase tracking-widest rounded hover:bg-[#C2181D] transition-all shadow-[0_0_20px_rgba(227,30,36,0.3)] flex items-center justify-center gap-3 ${briefingForm.isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {briefingForm.isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Uploading Intelligence...
                </>
              ) : (
                <>
                  <Activity size={20} /> Process & Launch Briefing
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-8 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Site Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                    value={config.siteName}
                    onChange={(e) => updateConfig({...config, siteName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Primary Brand Color</label>
                  <div className="flex gap-4">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded cursor-pointer bg-transparent border border-[#E31E24]/30"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig({...config, primaryColor: e.target.value})}
                    />
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig({...config, primaryColor: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#E31E24] uppercase tracking-widest mb-2">Footer Copyright Text</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-black border border-[#E31E24]/30 text-white rounded focus:border-[#E31E24] outline-none transition-colors text-sm"
                    value={config.footerText}
                    onChange={(e) => updateConfig({...config, footerText: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#E31E24]/10 rounded border border-[#E31E24]/30 flex items-center gap-4">
              <Shield className="text-[#E31E24]" size={24} />
              <p className="text-[10px] text-[#E31E24] font-black uppercase tracking-widest">Changes to portal configuration are applied in real-time across all authorized terminals.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [config, setConfig] = useState<CMSConfig>({
    siteName: "INDERA - Intelligence, Defense Research and Analysis",
    logoText: "INDERA",
    primaryColor: "#E31E24",
    secondaryColor: "#050505",
    fontFamily: "JetBrains Mono",
    footerText: "© 2026 INDERA - Intelligence, Defense Research and Analysis. All rights reserved."
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [briefings, setBriefings] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [loading, setLoading] = useState(true);
  const [activeBriefing, setActiveBriefing] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cmsRes, postsRes, briefingsRes] = await Promise.all([
          fetch("/api/cms"),
          fetch("/api/posts"),
          fetch("/api/briefings")
        ]);
        if (cmsRes.ok) setConfig(await cmsRes.json());
        if (postsRes.ok) setPosts(await postsRes.json());
        if (briefingsRes.ok) setBriefings(await briefingsRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);
  const addBriefing = async (b: any) => {
    try {
      const res = await fetch("/api/briefings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b)
      });
      const savedBriefing = await res.json();
      setBriefings([savedBriefing, ...briefings]);
      setActiveBriefing(savedBriefing);
    } catch (err) {
      console.error("Failed to save briefing", err);
      // Fallback to local state if server fails
      setBriefings([b, ...briefings]);
      setActiveBriefing(b);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-[#E31E24] font-mono">
      <div className="w-16 h-16 border-4 border-[#E31E24]/20 border-t-[#E31E24] rounded-full animate-spin mb-4"></div>
      <span className="text-xs animate-pulse tracking-[0.3em] uppercase">Initializing Neural Link...</span>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <CMSContext.Provider value={{ 
        config, 
        posts, 
        updateConfig: setConfig, 
        updatePosts: setPosts,
        layout,
        setLayout,
        briefings,
        addBriefing,
        setActiveBriefing
      }}>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#050505] text-gray-100" style={{ fontFamily: config.fontFamily }}>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/programme" element={<ProgrammeOfWork />} />
                <Route path="/decisions" element={<DecisionsAndOutcomes />} />
                <Route path="/meetings" element={<MeetingsAndDocuments />} />
                <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
          <AnimatePresence>
            {activeBriefing && (
              <BriefingScreen briefing={activeBriefing} onClose={() => setActiveBriefing(null)} />
            )}
          </AnimatePresence>
        </Router>
      </CMSContext.Provider>
    </AuthContext.Provider>
  );
}
