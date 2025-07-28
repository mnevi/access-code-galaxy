
from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import tempfile
import os
from supabase import create_client, Client


app = Flask(__name__)
CORS(app)

# Supabase config
SUPABASE_URL = 'https://fnizqjpesasfkykewofe.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# Endpoint to update challenge progress in Supabase
@app.route('/api/progress', methods=['POST'])
def post_progress():
    data = request.get_json()
    user_id = data.get('user_id')
    challenge_id = data.get('challenge_id')
    completed = data.get('completed')
    progress = data.get('progress')
    # Update or insert progress row for this user/challenge
    try:
        # Try to update existing row
        update_resp = supabase.table('challenge_progress').update({
            'completed': completed,
            'progress': progress
        }).eq('user_id', user_id).eq('challenge_id', challenge_id).execute()
        # If no row was updated, insert new
        if update_resp.data is not None and len(update_resp.data) == 0:
            supabase.table('challenge_progress').insert({
                'user_id': user_id,
                'challenge_id': challenge_id,
                'completed': completed,
                'progress': progress
            }).execute()
        return jsonify({'status': 'progress updated'})
    except Exception as e:
        print(f"Supabase error: {e}")
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