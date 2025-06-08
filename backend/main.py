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
    topic_list = "\n- ".join(topics)
    base_text = f"Course: {data.course}\nTopics:\n- {topic_list}"
    if data.custom_syllabus.strip():
        base_text += "\n\nCustom Syllabus Provided:\n" + data.custom_syllabus

    # Updated Meme Lord prompt: force markdown section headers for accordion UI!
    prompt = (
    "You are a savage, meme-loving college TA who roasts and helps students the night before their exam. "
    "For EACH topic, format your output using ONLY the following markdown structure:\n\n"
    "## [Topic Name]\n"
    "### Theory\n"
    "Theory goes here\n"
    "### Formulae\n"
    "Formulae (with LaTeX) go here\n"
    "### Example\n"
    "Worked example goes here\n"
    "### Flashcard\n"
    "3-5 bullet cram-sheet facts go here\n"
    "### Meme Advice\n"
    "Short spicy meme or roast goes here\n\n"
    "Repeat this entire structure for each topic, using only these markdown headings. "
    "DO NOT SKIP ANY HEADING, EVEN IF THE SECTION IS SHORT."
    f"\n\nTopics:\n- " + "\n- ".join(topics)
)


    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,  # Increased for more thorough output
            temperature=0.85,
        )
        content = response.choices[0].message.content
        return {"result": content}
    except Exception as e:
        return {"result": f"AI is napping: {str(e)}"}
