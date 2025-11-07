from flask import Blueprint, request, jsonify
import os
from datetime import datetime
from functools import wraps

import models

admin_bp = Blueprint('admin', __name__)

# Demo credentials (replace in production)
ADMIN_USER = os.environ.get('ADMIN_USER', 'admin')
ADMIN_PASS = os.environ.get('ADMIN_PASS', 'admin123')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'demo-token')

def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token = auth.split(' ', 1)[1]
            if token == ADMIN_TOKEN:
                return f(*args, **kwargs)
        return jsonify(error='Unauthorized'), 401
    return wrapper


@admin_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    if data.get('username') == ADMIN_USER and data.get('password') == ADMIN_PASS:
        return jsonify(token=ADMIN_TOKEN)
    return jsonify(error='Invalid credentials'), 401


@admin_bp.route('/analytics', methods=['GET'])
@require_admin
def analytics():
    conn = models.connect()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM contacts'); contacts = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM applications'); apps = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM jobs'); jobs = cur.fetchone()[0]
    conn.close()
    return jsonify(visits=1240, leads=contacts, applications=apps, jobs=jobs)


@admin_bp.route('/jobs', methods=['POST'])
@require_admin
def add_job():
    data = request.get_json(force=True)
    title = data.get('title'); location = data.get('location'); jtype = data.get('type')
    skills = ','.join(data.get('skills', [])) if isinstance(data.get('skills'), list) else (data.get('skills') or '')
    summary = data.get('summary', '')
    conn = models.connect()
    cur = conn.cursor()
    cur.execute('INSERT INTO jobs (title,location,type,skills,summary,created_at) VALUES (?,?,?,?,?,?)',
                (title, location, jtype, skills, summary, datetime.utcnow().isoformat()))
    conn.commit(); job_id = cur.lastrowid; conn.close()
    return jsonify(ok=True, id=job_id)


@admin_bp.route('/posts', methods=['GET'])
@require_admin
def list_posts_admin():
    conn = models.connect(); cur = conn.cursor()
    cur.execute('SELECT id,title,content,created_at FROM posts ORDER BY id DESC')
    posts = [dict(r) for r in cur.fetchall()]
    conn.close(); return jsonify(posts=posts)


@admin_bp.route('/posts', methods=['POST'])
@require_admin
def add_post():
    data = request.get_json(force=True)
    title = data.get('title'); content = data.get('content','')
    conn = models.connect(); cur = conn.cursor()
    cur.execute('INSERT INTO posts (title,content,created_at) VALUES (?,?,?)',
                (title, content, datetime.utcnow().isoformat()))
    conn.commit(); post_id = cur.lastrowid; conn.close()
    return jsonify(ok=True, id=post_id)


@admin_bp.route('/testimonials', methods=['POST'])
@require_admin
def add_testimonial():
    data = request.get_json(force=True)
    author = data.get('author'); content = data.get('content','')
    conn = models.connect(); cur = conn.cursor()
    cur.execute('INSERT INTO testimonials (author,content,created_at) VALUES (?,?,?)',
                (author, content, datetime.utcnow().isoformat()))
    conn.commit(); tid = cur.lastrowid; conn.close()
    return jsonify(ok=True, id=tid)


@admin_bp.route('/applications', methods=['GET'])
@require_admin
def list_applications():
    conn = models.connect(); cur = conn.cursor()
    cur.execute('SELECT * FROM applications ORDER BY id DESC')
    apps = [dict(r) for r in cur.fetchall()]
    conn.close(); return jsonify(applications=apps)
