from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
import os
import pdfplumber
from io import BytesIO

# Load environment variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/summarize/")
async def summarize_pdf(file: UploadFile = File(...)):
    try:
        # Read and extract text from PDF
        file_bytes = await file.read()
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if not text.strip():
            return {"error": "No readable text found in the PDF."}

        # Create AI prompt
        prompt = f"""
You are an AI teacher. Break down the following notes into clear and engaging teaching cards.
Each card should explain:
- What the concept is
- Why it matters
- Any tips/formulas
- A motivating example if useful

TEXT:
{text[:3000]}
        """

        # Request summary from GPT-3.5
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a patient, exam-focused AI teacher."},
                {"role": "user", "content": prompt}
            ]
        )

        summary_text = response.choices[0].message.content.strip()

        return {
            "summary": [
                {
                    "title": "Summary Block 1",
                    "summary": summary_text
                }
            ]
        }

    except Exception as e:
        return {"error": str(e)}
