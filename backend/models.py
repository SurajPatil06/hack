import os
import sqlite3
from datetime import datetime

DB_PATH = None  # set by app at startup


def get_db():
    if not DB_PATH:
        # fallback to a relative path
        base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database'))
        return os.path.join(base, 'mastersolis.db')
    return DB_PATH


def connect():
    path = get_db()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = connect()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            location TEXT,
            type TEXT,
            skills TEXT,
            summary TEXT,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER,
            name TEXT,
            email TEXT,
            phone TEXT,
            resume_text TEXT,
            score INTEGER,
            parsed_skills TEXT,
            experience_years INTEGER,
            education TEXT,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS testimonials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            content TEXT,
            created_at TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS case_studies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            created_at TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def seed_jobs_if_empty():
    conn = connect()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS c FROM jobs")
    c = cur.fetchone()[0]
    if c == 0:
        now = datetime.utcnow().isoformat()
        jobs = [
            ("AI Engineer", "Bangalore, IN", "Full-time", "Python,ML,NLP,LLMs", "Build and deploy applied generative AI systems.", now),
            ("Frontend Developer", "Remote", "Full-time", "React,TypeScript,CSS", "Craft delightful web experiences with performance in mind.", now),
            ("Cloud DevOps Engineer", "Remote", "Contract", "AWS,Terraform,CI/CD", "Operate reliable, cost-efficient cloud infrastructure.", now),
        ]
        cur.executemany("INSERT INTO jobs (title,location,type,skills,summary,created_at) VALUES (?,?,?,?,?,?)", jobs)
        conn.commit()
    conn.close()
