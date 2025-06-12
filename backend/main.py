# FILE: main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
