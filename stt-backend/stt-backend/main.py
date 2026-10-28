import os
import json
import shutil
import tempfile
import time
from datetime import datetime, timezone

import firebase_admin
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore
from groq import Groq
from pydantic import BaseModel

# --- Initialize Firebase Admin SDK ---
service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if service_account_json:
    cred = credentials.Certificate(json.loads(service_account_json))
else:
    cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Initialize Groq Client ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="Speech-to-Text API")

# --- SECURED CORS ---
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
    allowed_types = {
        "audio/wav", "audio/mpeg", "audio/webm",
        "audio/ogg", "audio/flac", "audio/mp4", "audio/x-m4a",
    }
    if file.content_type not in allowed_types and not file.filename.endswith(
        (".wav", ".mp3", ".webm", ".ogg", ".flac", ".m4a")
    ):
        raise HTTPException(status_code=400, detail="Unsupported audio format.")

    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"stt_{datetime.now().timestamp()}_{file.filename}")

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with open(temp_path, "rb") as audio_file:
                    transcription = groq_client.audio.transcriptions.create(
                        file=audio_file,
                        model="whisper-large-v3", 
                        response_format="json",
                        language="en",
                        prompt="Transcribe accurately with proper punctuation and capitalization.",
                    )
                break 
            except Exception as e:
                if "429" in str(e) and attempt < max_retries - 1:
                    time.sleep(2 ** attempt) 
                else:
                    raise e 

        text = transcription.text

        doc_ref = db.collection("transcriptions").add({
            "text": text,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "created_at": datetime.now(timezone.utc),
            "model_used": "whisper-large-v3",
        })

        return {
            "text": text,
            "firestore_id": doc_ref[1].id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/history")
def get_history():
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


# --- Translate to Hindi Endpoint ---
class TranslationRequest(BaseModel):
    text: str

@app.post("/translate")
def translate_text(request: TranslationRequest):
    try:
        print(f"🔄 Translating text: {request.text}") # Debugging log
        
        response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional translator. Translate the following text accurately into Hindi. Only return the translated Hindi text, do not include any explanations or English text."
                },
                {
                    "role": "user",
                    "content": request.text
                }
            ],
            model="llama-3.1-8b-instant", # CHANGED: Switched to the fastest, most stable free-tier model
            temperature=0.1,
        )
        
        hindi_text = response.choices[0].message.content
        print(f"✅ Translation success: {hindi_text}") # Debugging log
        return {"translated_text": hindi_text}
        
    except Exception as e:
        print(f"❌ TRANSLATION ERROR: {str(e)}") # This will show in Render logs if it fails
        raise HTTPException(status_code=500, detail=str(e))