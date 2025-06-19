import os
import json
import sqlite3
from uuid import uuid4
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# --- FastAPI setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file path (for uploads)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- Load courses ---
with open("courses.json", "r") as f:
    COURSES = json.load(f)

@app.get("/courses")
def get_courses():
    return COURSES

# --- Dummy Login Users ---
DUMMY_USERS = [
    {"username": "you", "password": "unicorn123", "role": "admin"},
    {"username": "your_friend", "password": "banana42", "role": "user"},
    {"username": "sneaky_rat", "password": "cheese99", "role": "user"},
    {"username": "electro_girl", "password": "voltage88", "role": "user"},
]

class LoginInput(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(data: LoginInput):
    user = next(
        (u for u in DUMMY_USERS if u["username"] == data.username and u["password"] == data.password),
        None
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = f"fake-{user['username']}-token"
    return {"username": user["username"], "role": user["role"], "token": token}
# --- Roast Explain Endpoint ---
class RoastRequest(BaseModel):
    course: str
    topic: str

@app.post("/roast-explain")
async def roast_explain(data: RoastRequest):
    prompt = (
    f"You are an insanely sarcastic, yet genius engineering TA. "
    f"You're here to break down the topic '{data.topic}' from the course '{data.course}' in a way that makes the student learn *despite themselves*.\n\n"
    f"Here’s your structure:\n"
    f"1. Start with a sarcastic roast about why they clearly didn’t get it (1-2 lines).\n"
    f"2. List ALL the key subtopics or concepts they should have understood.\n"
    f"3. For each concept:\n"
    f"   - Explain it in clear, step-by-step teaching.\n"
    f"   - Call out common mistakes *with sass*.\n"
    f"   - Drop analogies or mnemonics if needed (but no fluff).\n"
    f"4. End with a mic-drop line or roast that they’ll never forget.\n\n"
    f"Make it funny, structured, ruthless — but make sure they **learn** everything properly by the end."
    f"Feel free to include formulas or equations using LaTeX-style syntax (e.g., $E = mc^2$ or $$PV = nRT$$), especially when explaining technical concepts — the frontend can render them. Wrap inline formulas in $...$ and block formulas in $$...$$ for LaTeX rendering."

    )

    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.85,
            max_tokens=5000,
        )
        explanation = response.choices[0].message.content.strip()
        return {"roast": explanation}
    except Exception as e:
        return {"error": str(e)}

# --- Visual Description & SVG Generation ---
class ShortPrompt(BaseModel):
    prompt: str

@app.post("/describe-visual")
async def describe_visual(data: ShortPrompt):
    prompt = f"""
You are a visual learning assistant helping engineering students understand concepts through diagrams.
Please keep in mind angles, and have a 2-dimensional spacial awareness to make quality diagrams for engineering students.
Given a short concept, generate a **precise and structured** diagram description that is clear, teachable, and easy to convert into an SVG.

Follow these rules:
1. Begin with a 1-line overview of what the diagram shows.
2. Describe the main objects or elements in the diagram.
3. Explain the relationships between them using arrows, labels, or positions.
4. Mention any important directions (e.g., left/right, up/down, in/out of paper).
5. Keep it concise but technically helpful.
6. Avoid using icons, metaphors, or unnecessary decoration.
7. Use plain terms like “circle labeled ___”, “arrow from ___ to ___”, “rectangle showing ___”.

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
You are an SVG diagram generator specialized in academic-style illustrations.

Convert the following structured description into a **clean**, **minimal** SVG:

"{data.description}"

**Rules:**
1. Use only essential SVG primitives: 
   - `<svg>` with explicit `xmlns`, `width`, `height`, and `viewBox`.
   - `<defs>` for reusable markers (e.g., arrowheads).
   - `<line>`, `<path>`, `<circle>`, `<rect>`, `<polygon>`, `<text>` as needed.
2. Define any arrowhead or other markers **once** in `<defs>` and reuse with `marker-end`.
3. Group related elements via `<g>` (e.g., axes, components, labels).
4. Maintain **consistent stroke widths**:
   - Main objects (e.g. cube edges, wires, boxes) at `stroke-width="2"`.
   - Reference axes or helper lines at `stroke-width="1.5"`.
5. Ensure all labels are **legible**, don’t overlap, and lie **within** the `viewBox`.
6. Keep the SVG **self-contained**—no external CSS or scripts.
7. **Respond ONLY** with the `<svg>…</svg>` code, no extra text.
"""
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="o4-mini-2025-04-16",
            messages=[{"role": "user", "content": prompt}]
        )
        svg_output = response.choices[0].message.content.strip()
        return {"svg": svg_output if svg_output else "No SVG generated."}
    except Exception as e:
        return {"error": str(e)}
# --- Database setup for EPIC Resources ---
DB_PATH = "epic_resources.db"
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    title TEXT,
    type TEXT,
    url TEXT,
    submitted_by TEXT,
    tags TEXT,
    ratings TEXT,
    avg_rating REAL,
    created_at TIMESTAMP
)
''')
conn.commit()

# --- Upload resource with tags ---
@app.post("/upload-resource")
async def upload_resource(
    title: str = Form(...),
    type: str = Form(...),
    submitted_by: str = Form(...),
    tags: str = Form(""),
    url: str = Form(""),
    file: UploadFile = File(None)
):
    resource_id = str(uuid4())
    filepath = url

    if file:
        ext = os.path.splitext(file.filename)[1]
        filename = f"{resource_id}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename).replace("\\", "/")
        with open(filepath, "wb") as f:
            f.write(await file.read())


    cursor.execute('''
        INSERT INTO resources (id, title, type, url, submitted_by, tags, ratings, avg_rating, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (resource_id, title, type, filepath, submitted_by, tags, json.dumps([]), 0.0, datetime.utcnow()))
    conn.commit()

    return {"success": True, "id": resource_id}

# --- Get all resources (sorted by avg rating) ---
@app.get("/epic-resources")
def get_epic_resources():
    cursor.execute("SELECT * FROM resources ORDER BY avg_rating DESC")
    rows = cursor.fetchall()
    keys = [desc[0] for desc in cursor.description]
    resources = [dict(zip(keys, row)) for row in rows]
    return resources
# --- Rate a resource (one-time per user) ---
@app.post("/rate-resource")
async def rate_resource(
    resource_id: str = Form(...),
    rating: int = Form(...),
    Authorization: str = Header(...)
):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")

    token = Authorization.replace("Bearer ", "")
    username = token.replace("fake-", "").replace("-token", "")
    user = next((u for u in DUMMY_USERS if u["username"] == username), None)

    if not user:
        raise HTTPException(status_code=403, detail="Invalid user")

    cursor.execute("SELECT ratings FROM resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()
    if not row:
        return JSONResponse(status_code=404, content={"error": "Resource not found"})

    try:
        ratings = json.loads(row[0]) if row[0] else []
    except:
        ratings = []

    # Check if user already rated
    if any(r["user"] == username for r in ratings):
        return JSONResponse(status_code=400, content={"error": "You have already rated this resource."})

    ratings.append({"user": username, "rating": rating})
    avg = sum(r["rating"] for r in ratings) / len(ratings)

    cursor.execute("UPDATE resources SET ratings = ?, avg_rating = ? WHERE id = ?",
                   (json.dumps(ratings), avg, resource_id))
    conn.commit()

    return {"success": True, "new_avg": avg}

# --- Delete a resource (admin only) ---
@app.delete("/delete-resource/{resource_id}")
def delete_resource(resource_id: str, Authorization: str = Header(...)):
    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")

    token = Authorization.replace("Bearer ", "")
    username = token.replace("fake-", "").replace("-token", "")
    user = next((u for u in DUMMY_USERS if u["username"] == username), None)

    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    cursor.execute("SELECT url FROM resources WHERE id = ?", (resource_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Resource not found")

    filepath = row[0]
    if filepath and os.path.exists(filepath):
        try:
            os.remove(filepath)
        except:
            pass

    cursor.execute("DELETE FROM resources WHERE id = ?", (resource_id,))
    conn.commit()

    return {"success": True, "message": "Resource deleted"}
