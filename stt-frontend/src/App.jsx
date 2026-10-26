import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Mic, History, Sparkles, Cpu } from "lucide-react";
import RecordPage from "./pages/RecordPage";
import HistoryPage from "./pages/HistoryPage";

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Record", icon: <Mic className="w-5 h-5 mr-2" /> },
    { path: "/history", label: "History", icon: <History className="w-5 h-5 mr-2" /> },
  ];

  return (
    <nav className="flex justify-center gap-4 mb-14 relative z-20 animate-slide-up delay-100">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              isActive
                ? "bg-indigo-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.5)] scale-105"
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
        
        {/* Ambient Background Glow */}
        <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none z-0"></div>
        
        {/* ✨ THE 3D GRID GROUND ✨ */}
        <div className="bg-grid-3d"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
          
          {/* Header Section */}
          <header className="text-center mb-12 flex flex-col items-center relative z-20">
            
            <div className="animate-float mb-6">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-center">
                  <Cpu className="w-10 h-10 text-indigo-400" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4 animate-slide-up delay-100">
              Speech to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Text</span>
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg animate-slide-up delay-200 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Transform your voice into text instantly with AI
            </p>
          </header>

          <Navigation />

          {/* Page Content */}
          <main className="w-full flex justify-center relative z-20 animate-slide-up delay-200">
            <Routes>
              <Route path="/" element={<RecordPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>

        </div>
      </div>
    </Router>
  );
}