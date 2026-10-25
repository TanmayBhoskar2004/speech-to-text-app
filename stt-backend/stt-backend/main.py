import os
import json
import shutil
import tempfile
from datetime import datetime, timezone

import firebase_admin
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore
from groq import Groq

# --- Initialize Firebase Admin SDK ---
# Check if we are in the cloud (Render) using the environment variable
service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if service_account_json:
    # Cloud deployment: Load from the Render Secret
    cred = credentials.Certificate(json.loads(service_account_json))
else:
    # Local deployment: Load from the local file
    cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Initialize Groq Client ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="Speech-to-Text API")

# --- SECURED CORS ---
# Now only allows requests from your live Firebase Hosting URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://speech-recognition-5ad50.web.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "running"}


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Accepts an audio file, transcribes it via Groq Whisper,
    saves the result to Firestore, and returns the text.
    """
    # 1. Validate file type
    allowed_types = {
        "audio/wav", "audio/mpeg", "audio/webm",
        "audio/ogg", "audio/flac", "audio/mp4", "audio/x-m4a",
    }
    if file.content_type not in allowed_types and not file.filename.endswith(
        (".wav", ".mp3", ".webm", ".ogg", ".flac", ".m4a")
    ):
        raise HTTPException(status_code=400, detail="Unsupported audio format.")

    # 2. Save uploaded file to a temporary location
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"stt_{datetime.now().timestamp()}_{file.filename}")

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 3. Send to Groq Whisper
        with open(temp_path, "rb") as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3-turbo",
                response_format="json",
                language="en",
            )

        text = transcription.text

        # 4. Save to Firestore
        doc_ref = db.collection("transcriptions").add({
            "text": text,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "created_at": datetime.now(timezone.utc),
            "model_used": "whisper-large-v3-turbo",
        })

        return {
            "text": text,
            "firestore_id": doc_ref[1].id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    finally:
        # 5. Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)


# --- Fetch History Endpoint ---
@app.get("/history")
def get_history():
    """Fetches the 20 most recent transcriptions from Firestore."""
    try:
        docs = (
            db.collection("transcriptions")
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(20)
            .stream()
        )
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            history.append({
                "id": doc.id,
                "text": data.get("text", ""),
                "created_at": data.get("created_at").isoformat() if data.get("created_at") else None
            })
            
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")