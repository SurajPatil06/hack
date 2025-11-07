# Mastersolis AI Connect

AI-powered company website for Mastersolis Infotech with: Home, About, Services, Projects, Contact, Careers, Admin dashboard. Includes AI content generation stubs and a resume analyzer.

## Project Structure

```
mastersolis-ai-connect/
├── frontend/                 # HTML/CSS/JS static site
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── projects.html
│   ├── contact.html
│   ├── careers.html
│   ├── admin.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── backend/                  # Flask API (stubs ready)
│   ├── app.py
│   ├── models.py
│   └── routes/
│       ├── ai_routes.py
│       ├── contact_routes.py
│       └── job_routes.py
├── database/
│   └── mastersolis.db        # placeholder
└── README.md
```

## Quick start

Backend (Flask):

```sh
python -m venv .venv
. .venv/Scripts/activate
pip install flask flask-cors
python backend/app.py
```

Frontend (static server):

```sh
cd frontend
python -m http.server 8000
```

Open http://127.0.0.1:8000 in your browser. The frontend calls the backend at http://127.0.0.1:5000.

## Features implemented (Phase 2)

- Home: AI-generated tagline button
- About: AI-generated team intro
- Services: AI-improved service descriptions
- Projects: Filterable grid + AI summaries per project
- Contact: Form with AI auto-reply (stubbed)
- Careers: Job listings + resume upload and AI score (stubbed)
- Admin: Basic analytics + AI-generated summary

## Notes

- AI endpoints are stubbed; integrate a real LLM later (OpenAI, Azure OpenAI, etc.).
- CORS is enabled for local development.
- The resume analyzer is a simple keyword-matcher as a placeholder.
