import { useRef, useState } from "react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Idle");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 👇 IMPROVEMENT 1: Force high-quality Opus codec and 128kbps bitrate
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000, 
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);
        streamRef.current.getTracks().forEach((track) => track.stop());
      };

      // 👇 IMPROVEMENT 2: Record in 1-second chunks to prevent corruption
      mediaRecorder.start(1000);
      
      setIsRecording(true);
      setStatus("Recording...");
      setTranscript("");
    } catch (err) {
      setStatus(`Error: Microphone access denied.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Processing...");
    }
  };

  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const response = await fetch("https://stt-backend-usxc.onrender.com/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscript(data.text);
      setStatus("Done");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl">
      
      {/* Status Bar */}
      <div className="h-10 mb-10 flex items-center justify-center px-6 rounded-full bg-slate-800/50 border border-slate-700/50">
        {status === "Processing..." && (
          <span className="flex items-center text-indigo-400 font-semibold"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Transcribing Audio...</span>
        )}
        {status === "Recording..." && (
          <span className="text-rose-400 font-semibold animate-pulse flex items-center"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-2.5 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></span> Listening...</span>
        )}
        {status === "Done" && (
          <span className="flex items-center text-emerald-400 font-semibold"><CheckCircle2 className="w-4 h-4 mr-2" /> Transcription Complete</span>
        )}
        {status.includes("Error") && (
          <span className="text-rose-500 font-semibold flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {status}</span>
        )}
        {status === "Idle" && (
          <span className="text-slate-400 font-semibold">Tap the microphone to start</span>
        )}
      </div>

      {/* Mic Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={status === "Processing..."}
        className={`group relative flex items-center justify-center w-36 h-36 rounded-full transition-all duration-500 ${
          isRecording 
            ? "bg-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.5)] scale-110" 
            : "bg-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.4)] hover:scale-105 hover:bg-indigo-500 hover:shadow-[0_0_70px_rgba(79,70,229,0.6)]"
        } ${status === "Processing..." ? "opacity-60 cursor-wait" : ""}`}
      >
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30"></span>
            <span className="absolute -inset-4 rounded-full border border-rose-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
          </>
        )}
        {isRecording ? (
          <Square className="w-12 h-12 text-white fill-white relative z-10" />
        ) : (
          <Mic className="w-14 h-14 text-white relative z-10" />
        )}
      </button>

      {/* Latest Transcript */}
      {transcript && (
        <div className="mt-12 w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
            <SparklesIcon /> Transcription Result
          </h3>
          <p className="text-lg text-slate-200 leading-relaxed font-medium">
            "{transcript}"
          </p>
        </div>
      )}
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}