import { useEffect, useRef, useState } from "react";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Idle");
  const [history, setHistory] = useState([]); 
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Fetch history when the component mounts
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // 👇 CHANGE THIS URL TO YOUR RENDER URL
      const response = await fetch("https://YOUR-RENDER-URL.onrender.com/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await uploadAudio(audioBlob);
        streamRef.current.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("Recording...");
      setTranscript("");
    } catch (err) {
      setStatus(`Error accessing microphone: ${err.message}`);
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
      // 👇 CHANGE THIS URL TO YOUR RENDER URL
      const response = await fetch("https://YOUR-RENDER-URL.onrender.com/transcribe", {
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
      
      // Refresh the history list after a successful transcription!
      fetchHistory(); 
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h1>🎙️ Speech to Text Recognition System </h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={startRecording}
          disabled={isRecording}
          style={{ padding: "10px 20px", marginRight: 10, fontSize: 16 }}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          style={{ padding: "10px 20px", fontSize: 16 }}
        >
          Stop & Transcribe
        </button>
      </div>

      <p><strong>Status:</strong> {status}</p>

      {transcript && (
        <div
          style={{
            background: "#e8f5e9",
            padding: 20,
            borderRadius: 8,
            marginTop: 20,
            borderLeft: "5px solid #4caf50"
          }}
        >
          <h3>Latest Transcript:</h3>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "18px" }}>{transcript}</p>
        </div>
      )}

      {/* --- NEW HISTORY SECTION --- */}
      <hr style={{ margin: "40px 0" }} />
      <h3>📜 Past Transcriptions</h3>
      
      {history.length === 0 ? (
        <p>No history yet. Record something!</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {history.map((item) => (
            <li key={item.id} style={{ background: "#f5f5f5", padding: 15, marginBottom: 10, borderRadius: 8 }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "16px" }}>{item.text}</p>
              <small style={{ color: "#666" }}>
                {item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown time"}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;