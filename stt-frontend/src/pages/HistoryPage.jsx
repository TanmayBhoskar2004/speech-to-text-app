import { useEffect, useState } from "react";
import { History as HistoryIcon, Loader2, FileAudio, Clock } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("https://stt-backend-usxc.onrender.com/history");
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
        <p className="font-medium text-lg">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        
        <div className="flex items-center space-x-4 mb-8 border-b border-slate-800 pb-6">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
            <HistoryIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Past Transcriptions</h2>
            <p className="text-slate-400 text-sm">Your recent voice notes</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 text-slate-500 flex flex-col items-center">
            <FileAudio className="w-20 h-20 mb-4 opacity-20" />
            <p className="text-xl font-medium">No recordings yet.</p>
            <p className="text-sm mt-2">Go to the Record page and speak!</p>
          </div>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {history.map((item) => (
              <li 
                key={item.id} 
                className="group bg-slate-800/40 hover:bg-slate-800 transition-all duration-300 p-6 rounded-3xl border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <p className="text-slate-200 mb-4 text-lg font-medium leading-relaxed">
                  {item.text}
                </p>
                <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="w-4 h-4 mr-2 opacity-70" />
                  {item.created_at 
                    ? new Date(item.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }) 
                    : "Unknown time"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}