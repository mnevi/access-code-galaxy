# Created by Max Neville
# Backend to handle server & database operations
# Using Flask & SQLite

import os
import sqlite3
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import subprocess
import tempfile

DB_PATH = os.environ.get('GALAXY_DB_PATH', 'galaxy.db')
MIGRATIONS_PATH = os.path.join(os.path.dirname(__file__), 'migrations', '001_create_tables.sql')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def run_migrations():
    db = sqlite3.connect(DB_PATH)
    with open(MIGRATIONS_PATH, 'r', encoding='utf-8') as f:
        db.executescript(f.read())
    db.close()

app = Flask(__name__)
CORS(app)
app.teardown_appcontext(close_db)

# Run migrations on startup
run_migrations()

# --- User Profile Endpoints ---

# Create or update a user profile
@app.route('/api/profile', methods=['POST'])
def upsert_profile():
    data = request.get_json()
    user_id = data.get('id')
    username = data.get('username')
    display_name = data.get('display_name')
    avatar_url = data.get('avatar_url')
    accessibility_mode = data.get('accessibility_mode')
    db = get_db()
    try:
        cur = db.execute(
            'UPDATE profiles SET username=?, display_name=?, avatar_url=?, accessibility_mode=?, updated_at=datetime("now") WHERE id=?',
            (username, display_name, avatar_url, accessibility_mode, user_id)
        )
        if cur.rowcount == 0:
            db.execute(
                'INSERT INTO profiles (id, username, display_name, avatar_url, accessibility_mode) VALUES (?, ?, ?, ?, ?)',
                (user_id, username, display_name, avatar_url, accessibility_mode)
            )
        db.commit()
        return jsonify({'status': 'profile upserted'})
    except Exception as e:
        db.rollback()
        print(f"SQLite error: {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

# Get a user profile by user_id -- NOT USED
@app.route('/api/profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    db = get_db()
    cur = db.execute('SELECT * FROM profiles WHERE id=?', (user_id,))
    row = cur.fetchone()
    if row:
        return jsonify(dict(row))
    else:
        return jsonify({'error': 'Profile not found'}), 404

# Get a user profile by username
@app.route('/api/profile/username/<username>', methods=['GET'])
def get_profile_by_username(username):
    db = get_db()
    cur = db.execute('SELECT * FROM profiles WHERE username=?', (username,))
    row = cur.fetchone()
    if row:
        return jsonify(dict(row))
    else:
        return jsonify({'error': 'Profile not found'}), 404

# --- Challenge Progress Endpoints ---

# Get all challenge progress for a user
@app.route('/api/progress/<user_id>', methods=['GET'])
def get_user_progress(user_id):
    db = get_db()
    cur = db.execute('SELECT * FROM challenge_progress WHERE user_id=?', (user_id,))
    rows = cur.fetchall()
    return jsonify([dict(row) for row in rows])

# Get a specific challenge progress for a user
@app.route('/api/progress/<user_id>/<challenge_id>', methods=['GET'])
def get_challenge_progress(user_id, challenge_id):
    db = get_db()
    cur = db.execute('SELECT * FROM challenge_progress WHERE user_id=? AND challenge_id=?', (user_id, challenge_id))
    row = cur.fetchone()
    if row:
        return jsonify(dict(row))
    else:
        return jsonify({'error': 'Progress not found'}), 404

# Endpoint to update challenge progress in SQLite
@app.route('/api/progress', methods=['POST'])
def post_progress():
    data = request.get_json()
    user_id = data.get('user_id')
    challenge_id = data.get('challenge_id')
    completed = data.get('completed')
    progress = data.get('progress')
    xp_earned = data.get('xp_earned', 0)
    completed_at = data.get('completed_at')
    db = get_db()
    try:
        # Try to update existing row
        cur = db.execute(
            'UPDATE challenge_progress SET completed=?, progress=?, xp_earned=?, completed_at=?, updated_at=datetime("now") WHERE user_id=? AND challenge_id=?',
            (completed, progress, xp_earned, completed_at, user_id, challenge_id)
        )
        if cur.rowcount == 0:
            # Insert new row
            import uuid
            db.execute(
                'INSERT INTO challenge_progress (id, user_id, challenge_id, completed, progress, xp_earned, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                (str(uuid.uuid4()), user_id, challenge_id, completed, progress, xp_earned, completed_at)
            )
        db.commit()
        return jsonify({'status': 'progress updated'})
    except Exception as e:
        db.rollback()
        print(f"SQLite error: {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/run', methods=['POST'])
def run_code():
    data = request.get_json()
    code = data.get('code', '')

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as temp:
            temp.write(code.encode())
            temp_path = temp.name

        result = subprocess.run(['python', temp_path], capture_output=True, text=True, timeout=5)

        os.unlink(temp_path)

        return jsonify({
            'output': result.stdout + result.stderr
        })

    except subprocess.TimeoutExpired:
        return jsonify({'output': 'Error: Execution timed out after 5 seconds'})
    except Exception as e:
        return jsonify({'output': f'Error: {str(e)}'})


@app.route('/run-output', methods=['POST'])
def run_output():
    data = request.get_json()
    code = data.get('code', '')

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as temp:
            temp.write(code.encode())
            temp_path = temp.name

        result = subprocess.run(['python', temp_path], capture_output=True, text=True, timeout=5)

        os.unlink(temp_path)

        return jsonify({'output': result.stdout + result.stderr})

    except subprocess.TimeoutExpired:
        return jsonify({'output': 'Error: Execution timed out after 5 seconds'})
    except Exception as e:
        return jsonify({'output': f'Error: {str(e)}'})


@app.route('/evaluate-output', methods=['POST'])
def evaluate_output():
    data = request.get_json()
    output = data.get('output', '').strip()

    # Hardcoded check for now — make this dynamic later
    expected_output = "hello\nhello"

    # Print output for debug in console
    print(f"Received output: {repr(output)}")

    success = output == expected_output
    return jsonify({'success': success})


if __name__ == '__main__':
    app.run(debug=True)