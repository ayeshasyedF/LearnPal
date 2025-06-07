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

def cheeky_ta_prompt(text: str) -> str:
    return f"""
I’m giving you a structured or, for that matter, an unstructured or poorly-organized lecture extract.
Your mission: Summarize the main topics and subtopics, even if you have to reorganize or re-interpret the flow to make it logical for a student.

Cheeky TA Style Guide:

Use your intelligence to:

Identify main topics and subtopics.
Reorder and group the material logically (teach the basics before the advanced, fill in gaps if needed, skip redundancy).
Only introduce advanced concepts after the foundational ones.
For each topic:
Give a quick, playful summary (“What’s the big idea here?”).
Break it into subtopics as needed, with fun, memorable headings.
Explain clearly, step by step, in simple language.
List the most important takeaways for each subtopic as bullet points.
End with a cheeky recap or a playful quiz.
Make transitions obvious and fun (“Now that you’ve survived that, let’s tackle the next thing!”).
Prioritize clarity and learning flow over sticking to the original order.
Keep your tone playful, witty, and never boring.

Your task:
Using this guide, summarize and reorganize the following lecture content for a student who wants to actually understand the material:

LECTURE TEXT:
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

    prompt = cheeky_ta_prompt(text)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Summarize and reorganize as instructed. Prioritize clarity and flow. Keep it playful and witty."},
            {"role": "user", "content": prompt}
        ]
    )
    result = response.choices[0].message.content.strip()
    return {"outline": result}
