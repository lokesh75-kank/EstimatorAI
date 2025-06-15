🧾 Step 2.2 — Upload Input Files (Advanced MVP UX)
📌 Objective
Deliver a modern, intelligent, and user-friendly experience to upload and review project documents. The interface should:

Support multi-file upload

Auto-classify and parse documents using AI

Surface key project metadata for user review and confirmation

Guide users to complete missing fields and proceed confidently to estimation

📐 UI Layout
🖼️ 1. Fullscreen Upload Workspace
Top Panel

Large drag-and-drop zone with “Browse Files” fallback

Accepts: .pdf, .docx, .jpg, .png, .zip

Instant feedback chips (uploading, parsed, error)

🗂️ 2. File Card Components (Per File)
Each file uploaded becomes a dynamic card:

Detected Type (e.g., Floorplan, Scope of Work)

Parsed Fields:

Building Type

Floors (AI confidence %)

Square Footage

Device Types/Counts

Actions: ✅ Accept, ✏️ Edit, 🔍 View Original, 🗑️ Remove

📊 3. Right Sidebar – Metadata Console
Consolidated view of all extracted project data:

yaml
Copy
Edit
Building Type: Warehouse
Floors: 3
Zones: 5
Detectors: 48 (32 Smoke, 12 Horn, 4 Strobe)
Highlights missing fields

Prompts for manual input if AI confidence < 70%

🛠️ 4. Bottom Bar – Navigation
🟢 Continue → Proceeds to Estimation Form if all required fields are filled

🔁 Retry Parsing → Re-process with updated file or manual override

📝 Feedback → Optional UX feedback point

🧠 AI Integration Logic
GPT-4 Vision: Primary parser for blueprints, images, and documents

Fallbacks:

OCR (e.g., Tesseract) for scans

Traditional NLP for structured text

Confidence Logic:

85% = Green (auto-accept with review option)

70–85% = Yellow (suggest review)

<70% = Red (require user input)

💡 Smart Features
Feature	Description
Auto File Classification	Floorplan, RFP, SOW, Spec Sheet
Smart Field Extraction	Floors, building type, zones, devices, area
Confidence Scoring	Color-coded feedback per field
Inline Edit & Override	User can manually adjust any field
Real-Time JSON Preview	Parsed results ready for downstream estimation logic
Multi-file Grouping	Auto-tag files to same project batch

🎨 Visual Design Notes
Aesthetic: Light theme, clean grid layout, large typography

Animations: Card slide-in, loading pulse, confidence badge transition

Font: Inter / Roboto (clean system fonts)

Color Tokens:

Green → Confident

Yellow → Needs review

Red → Incomplete/missing

✅ Success Criteria
90%+ files auto-classified correctly

<2 manual inputs required on average per user session

100% data passed cleanly to Step 2.3 Estimation Form