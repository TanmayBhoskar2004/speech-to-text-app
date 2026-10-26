import { useEffect, useState } from "react";
import { History as HistoryIcon, Loader2, Calendar, FileText } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 👇 YOUR RENDER URL IS ALREADY HERE
        const response = await fetch("https://stt-backend-usxc.onrender.com/history");
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p>Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="flex items-center space-x-3 mb-8 border-b border-slate-800 pb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <HistoryIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Past Transcriptions</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No recordings yet.</p>
            <p className="text-sm mt-2">Go to the Record page and speak!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {history.map((item) => (
              <li 
                key={item.id} 
                className="group bg-slate-800/40 hover:bg-slate-800 transition-all duration-200 p-5 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50"
              >
                <p className="text-slate-200 mb-4 text-lg font-medium leading-relaxed">
                  {item.text}
                </p>
                <div className="flex items-center text-xs font-semibold text-slate-500">
                  <Calendar className="w-4 h-4 mr-2 opacity-70" />
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