from flask import Blueprint, request, jsonify
import re
from datetime import datetime
import models

job_bp = Blueprint('job', __name__)


def serialize_job_row(r):
    return {
        'id': r['id'],
        'title': r['title'],
        'location': r['location'],
        'type': r['type'],
        'skills': (r['skills'] or '').split(',') if r['skills'] else [],
        'summary': r['summary']
    }


@job_bp.route('/jobs', methods=['GET'])
def list_jobs():
    conn = models.connect(); cur = conn.cursor()
    cur.execute('SELECT id,title,location,type,skills,summary FROM jobs ORDER BY id DESC')
    rows = cur.fetchall(); conn.close()
    return jsonify(jobs=[serialize_job_row(r) for r in rows])


@job_bp.route('/jobs/apply', methods=['POST'])
def apply_job():
    # Form-based application
    data = request.form.to_dict()
    job_id = int(data.get('job_id', '1'))
    name = data.get('name'); email = data.get('email'); phone = data.get('phone')
    resume_text = data.get('resume_text','')

    # Fetch job for scoring
    conn = models.connect(); cur = conn.cursor()
    cur.execute('SELECT * FROM jobs WHERE id=?', (job_id,))
    job = cur.fetchone()
    skills = (job['skills'] or '').lower().split(',') if job else []

    tokens = resume_text.lower()
    matches = sum(1 for s in skills if s and s.strip() in tokens)
    score = min(100, 40 + matches * 15)

    # naive parsing
    parsed_skills = ','.join({s.strip() for s in skills if s and s.strip() in tokens})
    # experience heuristics
    years = 0
    m = re.search(r'(\d+)\+?\s*(years|yrs)', resume_text.lower())
    if m:
        years = int(m.group(1))

    cur.execute('INSERT INTO applications (job_id,name,email,phone,resume_text,score,parsed_skills,experience_years,education,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
                (job_id, name, email, phone, resume_text, score, parsed_skills, years, '', datetime.utcnow().isoformat()))
    conn.commit(); conn.close()

    return jsonify(ok=True, score=score, feedback=f"Estimated fit based on skills overlap: {matches} matches.")


@job_bp.route('/jobs/upload', methods=['POST'])
def upload_resume():
    # Analyzer on uploaded file
    file = request.files.get('resume')
    job_id = int(request.form.get('job_id', '1'))

    if not file:
        return jsonify(error='No file'), 400

    text = ''
    try:
        raw = file.read()
        try:
            text = raw.decode('utf-8')
        except Exception:
            text = raw.decode('latin-1', errors='ignore')
    except Exception:
        text = ''

    conn = models.connect(); cur = conn.cursor()
    cur.execute('SELECT * FROM jobs WHERE id=?', (job_id,))
    job = cur.fetchone()
    skills = (job['skills'] or '').split(',') if job else []

    tokens = text.lower()
    matches = sum(1 for s in skills if s.lower() in tokens)
    score = min(100, 40 + matches * 15)  # 40 base + 15 per skill
    feedback = (
        f"Match for '{(job['title'] if job else 'Job')}': {matches}/{len(skills)} key skills mentioned. "
        f"Consider emphasizing: {', '.join(skills)}."
    )

    # Store application
    cur.execute('INSERT INTO applications (job_id,name,email,phone,resume_text,score,parsed_skills,experience_years,education,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
                (job_id, '', '', '', text, score, ','.join({s for s in skills if s.lower() in tokens}), None, '', datetime.utcnow().isoformat()))
    conn.commit(); conn.close()

    return jsonify(score=score, feedback=feedback)
