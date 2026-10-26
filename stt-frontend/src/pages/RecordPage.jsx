import { useRef, useState } from "react";
import { Mic, Square, Loader2, CheckCircle2 } from "lucide-react";

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

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
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

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("Recording...");
      setTranscript("");
    } catch (err) {
      setStatus(`Microphone Error: ${err.message}`);
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
      // 👇 YOUR RENDER URL IS ALREADY HERE
      const response = await fetch("https://stt-backend-usxc.onrender.com/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Transcription failed");
      }

      const data = await response.json();
      setTranscript(data.text);
      setStatus("Done");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
      
      {/* Recorder Card */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Status Badge */}
        <div className="h-10 mb-8 flex items-center justify-center px-4 rounded-full bg-slate-800/50 border border-slate-700/50">
          {status === "Processing..." ? (
            <span className="flex items-center text-indigo-400 font-medium">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Transcribing...
            </span>
          ) : status === "Recording..." ? (
            <span className="text-rose-400 font-medium animate-pulse flex items-center">
              <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span> Listening...
            </span>
          ) : status === "Done" ? (
            <span className="flex items-center text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Transcription Complete
            </span>
          ) : status.includes("Error") ? (
            <span className="text-rose-500 font-medium">{status}</span>
          ) : (
            <span className="text-slate-400 font-medium">Tap to speak</span>
          )}
        </div>

        {/* Big Microphone Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={status === "Processing..."}
          className={`group relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-500 ${
            isRecording 
              ? "bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)]" 
              : "bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:scale-105 hover:bg-indigo-500"
          } ${status === "Processing..." ? "opacity-70 cursor-wait" : ""}`}
        >
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40"></span>
          )}
          {isRecording ? (
            <Square className="w-10 h-10 text-white fill-white relative z-10" />
          ) : (
            <Mic className="w-12 h-12 text-white relative z-10" />
          )}
        </button>

        {/* Latest Transcript Result */}
        {transcript && (
          <div className="mt-10 w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Transcription
            </h3>
            <p className="text-lg text-slate-200 leading-relaxed font-medium">
              "{transcript}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}