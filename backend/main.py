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

# Models
class SyllabusRequest(BaseModel):
    faculty: str  # "mechanical", "electrical", "computer"
    course: str   # e.g., "Statics"
    topics: list[str] = []
    custom_syllabus: str = ""

@app.get("/courses")
def get_courses():
    return COURSES

@app.post("/generate")
async def generate_content(data: SyllabusRequest):
    course_info = next(
        (c for c in COURSES[data.faculty] if c["name"] == data.course),
        None,
    )
    topics = data.topics or (course_info["topics"] if course_info else [])
    base_text = f"Course: {data.course}\nTopics:\n- " + "\n- ".join(topics)
    if data.custom_syllabus.strip():
        base_text += "\n\nCustom Syllabus Provided:\n" + data.custom_syllabus

    # Meme Lord prompt
    prompt = (
    "You are a savage, meme-loving college TA who roasts and helps students the night before their exam. "
    "You always include the real content: for each topic, start with a cheeky intro, then give the BASICS like the student has learned nothing. "
    "Include core definitions, the most important formulas, and any named laws/theorems (with LaTeX if relevant). "
    "Give at least one example, then a detailed cram-sheet style flashcard (3-5 must-know bullets, common mistakes, and key tips). "
    "If the topic is math/engineering/science, include formulas in LaTeX, and mark them with $$ so they can be rendered. "
    "Finish with spicy meme advice. Use Markdown for formatting (e.g., bold, bullet lists, code, formulas).\n\n"
    "FORMAT:\nFor each topic:\n- Cheeky Intro\n- Definition & Core Concepts\n- Formulae/Laws (with LaTeX and $$)\n- Example\n- Cram-Flashcard (3-5 bullets)\n- Meme Advice\n"
    f"\nTopics:\n- " + "\n- ".join(topics)
)
    if data.custom_syllabus.strip():
        prompt += f"\n\nCustom Syllabus Provided:\n{data.custom_syllabus}"


    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1200,
            temperature=0.85,
        )
        content = response.choices[0].message.content
        return {"result": content}
    except Exception as e:
        return {"result": f"AI is napping: {str(e)}"}
