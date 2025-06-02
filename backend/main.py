from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pdfplumber
import io

app = FastAPI()

# Allow frontend (localhost:3000) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pdf = pdfplumber.open(io.BytesIO(contents))

        full_text = ""
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"
        pdf.close()

        # Mock summary logic (split into concept cards)
        summary = [
            {
                "title": "Summary Block 1",
                "summary": full_text[:300] + "..."  # just a preview
            },
            {
                "title": "Summary Block 2",
                "summary": "This is a placeholder for a second summary point."
            }
        ]

        return JSONResponse(content={"summary": summary})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)