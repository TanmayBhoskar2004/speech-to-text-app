import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Mic, History, Sparkles } from "lucide-react";
import RecordPage from "./pages/RecordPage";
import HistoryPage from "./pages/HistoryPage";

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Record", icon: <Mic className="w-5 h-5 mr-2" /> },
    { path: "/history", label: "History", icon: <History className="w-5 h-5 mr-2" /> },
  ];

  return (
    <nav className="flex justify-center gap-4 mb-12">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              isActive
                ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]"
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
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
        
        {/* Ambient Background Glow */}
        <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
          
          {/* Header */}
          <header className="text-center mb-12 flex flex-col items-center">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] rounded-2xl mb-6 shadow-2xl shadow-indigo-500/20">
              <div className="bg-slate-900 p-4 rounded-2xl">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
              AI Speech<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">2</span>Text
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Powered by Groq Whisper & Firebase
            </p>
          </header>

          <Navigation />

          {/* Page Content */}
          <main className="w-full flex justify-center">
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