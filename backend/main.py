# FILE: main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local testing; restrict in prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load courses from JSON
with open("courses.json", "r") as f:
    COURSES = json.load(f)

@app.get("/courses")
def get_courses():
    return COURSES

# ---------- NEW AI ROUTES ----------

class ShortPrompt(BaseModel):
    prompt: str

@app.post("/describe-visual")
async def describe_visual(data: ShortPrompt):
    prompt = f"""
You're a visual learning assistant. Given a short concept, expand it into a detailed diagram description helpful for engineering students.

Example:
Input: 'tension forces on a block hung on a string'
Output: 'A block is suspended from the ceiling by a string. An upward arrow labeled "Tension" is shown along the string. A downward arrow labeled "Weight" originates from the center of the block. The direction of forces, labels, and relative lengths should be visible.'

Now expand this one:

"{data.prompt}"
"""

    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        return {"description": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}

class VisualDescription(BaseModel):
    description: str

@app.post("/generate-svg")
async def generate_svg(data: VisualDescription):
    prompt = f"""
You're an SVG generator. Given a description of an educational diagram, return a simple SVG code with only essential shapes and labels. Keep it under ~20 lines.

Description:
"{data.description}"

Respond ONLY with the SVG code.
"""

    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        return {"svg": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}
