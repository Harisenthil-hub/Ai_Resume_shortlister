# database.py
# Database design and operations for the AI Resume Shortlister

import sqlite3
import json
import os
import logging

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Database Configuration
# -------------------------------------------------------------------
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resumes.db')
DEFAULT_DB_URL = f'sqlite:///{DB_PATH}'


# -------------------------------------------------------------------
# Schema Definition
# -------------------------------------------------------------------
# Table: resumes
#
# +----------------+-----------+----------------------------------------------+
# | Column         | Type      | Description                                  |
# +----------------+-----------+----------------------------------------------+
# | id             | INTEGER   | Primary key, auto-incremented                |
# | filename       | TEXT      | Original name of the uploaded resume file    |
# | content        | TEXT      | Extracted plain text from the resume         |
# | role           | TEXT      | Target job role selected by the user         |
# | score          | INTEGER   | AI-generated match score (0-100)             |
# | analysis_json  | TEXT      | Full AI analysis result stored as JSON       |
# | timestamp      | DATETIME  | When the analysis was performed (auto-set)   |
# +----------------+-----------+----------------------------------------------+

SCHEMA_SQL = '''
CREATE TABLE IF NOT EXISTS resumes (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    filename       TEXT,
    content        TEXT,
    role           TEXT,
    score          INTEGER,
    analysis_json  TEXT,
    timestamp      DATETIME DEFAULT CURRENT_TIMESTAMP
)
'''


# -------------------------------------------------------------------
# Helper: Get a database connection
# -------------------------------------------------------------------
def _get_connection(database_url=DEFAULT_DB_URL):
    """Parse the database URL and return a sqlite3 connection."""
    if database_url.startswith('sqlite:///'):
        path = database_url.replace('sqlite:///', '')
        return sqlite3.connect(path)
    raise ValueError(f"Unsupported database URL: {database_url}")


# -------------------------------------------------------------------
# Database Operations
# -------------------------------------------------------------------
def init_db(database_url=DEFAULT_DB_URL):
    """Create the resumes table if it doesn't already exist."""
    conn = _get_connection(database_url)
    conn.cursor().execute(SCHEMA_SQL)
    conn.commit()
    conn.close()
    logger.info(f"Database initialized at: {database_url}")


def save_resume_to_db(filename, content, role=None, score=None, analysis=None, database_url=DEFAULT_DB_URL):
    """Insert a new resume analysis record into the database."""
    conn = _get_connection(database_url)
    c = conn.cursor()
    analysis_str = json.dumps(analysis) if analysis else None
    c.execute(
        'INSERT INTO resumes (filename, content, role, score, analysis_json) VALUES (?, ?, ?, ?, ?)',
        (filename, content, role, score, analysis_str)
    )
    conn.commit()
    conn.close()


def list_resumes_from_db(database_url=DEFAULT_DB_URL):
    """Retrieve all analyzed resumes, most recent first."""
    conn = _get_connection(database_url)
    c = conn.cursor()
    c.execute('SELECT id, filename, role, score, analysis_json, timestamp FROM resumes ORDER BY timestamp DESC')
    rows = c.fetchall()
    conn.close()

    results = []
    for r in rows:
        try:
            analysis = json.loads(r[4]) if r[4] else {}
        except Exception:
            analysis = {}
        results.append({
            'id': r[0],
            'filename': r[1],
            'role': r[2],
            'score': r[3],
            'analysis': analysis,
            'timestamp': r[5]
        })
    return results


def delete_resume_from_db(filename, database_url=DEFAULT_DB_URL):
    """Delete all resume records matching the given filename."""
    conn = _get_connection(database_url)
    c = conn.cursor()
    c.execute('DELETE FROM resumes WHERE filename = ?', (filename,))
    conn.commit()
    conn.close()
