from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
import pdfplumber
from io import BytesIO

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def outline_prompt(text: str) -> str:
    return f"""
You are an expert note-taker. For the text below, extract:
- The MAIN topic (as a string)
- A 1-2 sentence OVERVIEW (as a string)
- 4-10 major topics/subtopics (as a simple list)
Respond ONLY in JSON, for example:
{{
  "main_topic": "Red-Black Trees",
  "overview": "Red-black trees are balanced search trees used in CS...",
  "topics": [
    "Properties of Red-Black Trees",
    "Insertion",
    "Deletion",
    "Rotations",
    "Applications"
  ]
}}
LECTURE NOTES:
{text[:4000]}
"""

@app.post("/outline/")
async def extract_outline(file: UploadFile = File(...)):
    file_bytes = await file.read()
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    if not text.strip():
        return {"error": "No readable text found in the PDF."}

    prompt = outline_prompt(text)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Extract only outline as JSON. No extra text."},
            {"role": "user", "content": prompt}
        ]
    )
    raw = response.choices[0].message.content.strip()
    # Try to parse code blocks or smart quotes if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
    raw = raw.replace("“", "\"").replace("”", "\"")
    return {"outline": raw}
