# AI Resume Shortlister

An AI-powered resume evaluation system that analyzes resumes against job roles using the **Groq AI API** (LLaMA 3.1). Upload a resume, select a target role, and get an instant AI-generated analysis with a score, strengths, weaknesses, and suggestions.

---

## 📋 Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Groq API Key** — [Get one free](https://console.groq.com/keys)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd resume_ai_shortlister
```

### 2. Set Up the Backend

```bash
# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### 4. Set Up the Frontend

```bash
cd frontend
npm install
cd ..
```

### 5. Run the Application

Open **two terminals**:

**Terminal 1 — Backend (Flask API on port 5000):**
```bash
# From the project root, with venv activated
python app.py
```

**Terminal 2 — Frontend (Vite dev server on port 5173):**
```bash
cd frontend
npm run dev
```

### 6. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## 🎯 How to Use

1. **Select a Target Role** — Choose from Software Engineer, Data Scientist, Product Manager, etc.
2. **Upload a Resume** — Drag & drop or click to upload a `.pdf` or `.txt` file.
3. **Click "Analyze Resume"** — Wait for the AI to evaluate the resume.
4. **View Results** — See the score (0-100), shortlisted status, strengths, weaknesses, and suggestions.

---

## 📁 Project Structure

```
resume_ai_shortlister/
├── app.py              # Flask backend (API routes)
├── llm_client.py       # Groq AI client (LLM integration)
├── utils.py            # File parsing & database helpers
├── requirements.txt    # Python dependencies
├── .env                # API keys (not committed)
├── resumes.db          # SQLite database (auto-created)
├── sample_data/        # Sample resumes for testing
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── UploadPage.jsx
│   │   ├── ResultPage.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-resume` | Upload a resume for AI analysis |
| `GET`  | `/api/resumes` | List all previously analyzed resumes |
| `GET`  | `/health` | Server health check |

---

## ⚙️ Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your Groq API key | *(required)* |
| `GROQ_MODEL` | AI model to use | `llama-3.1-8b-instant` |

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| `AI Service Timeout or Error` | Check that `GROQ_API_KEY` in `.env` is valid |
| `ECONNREFUSED :5000` | Make sure the backend is running (`python app.py`) |
| Frontend shows blank page | Run `npm run dev` in the `frontend/` directory |
| `no such column` errors | Delete `resumes.db` and restart the backend |
