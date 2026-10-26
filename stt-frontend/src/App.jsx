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
            className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
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
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
        {/* Background Glow Effect */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-indigo-500/20 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
          
          {/* Header */}
          <header className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-500/20 p-4 rounded-3xl border border-indigo-500/30">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              AI Speech<span className="text-indigo-400">2</span>Text
            </h1>
            <p className="text-slate-400 text-lg">
              Powered by Groq Whisper & Firebase
            </p>
          </header>

          <Navigation />

          {/* Page Content */}
          <main>
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