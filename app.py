from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import os
import logging
from io import BytesIO
from utils import extract_text_from_file
from llm_client import llm

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='frontend/dist', template_folder='templates')

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    """
    Simple POST endpoint.
    Accepts: resume (file), role (string).
    Returns: JSON analysis or error.
    """
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file uploaded'}), 400
        
        file = request.files['resume']
        role = request.form.get('role', 'General')
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # 1. Read File
        file_content = file.read()
        
        # 2. Extract Text
        file_obj = BytesIO(file_content)
        file_obj.filename = file.filename
        text = extract_text_from_file(file_obj)
        
        if not text.strip():
             return jsonify({'error': 'Could not extract text from file'}), 400

        # 3. Call AI (Synchronous, Timeout protected)
        result = llm.evaluate_resume(text, role)
        
        return jsonify({
            'filename': file.filename,
            'role': role,
            'analysis': result
        })

    except Exception as e:
        logger.error(f"Analysis Failed: {e}")
        return jsonify({'error': str(e)}), 500

# Serve frontend static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    dist = os.path.join(app.static_folder)
    if path != "" and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    index = os.path.join(dist, 'index.html')
    if os.path.exists(index):
        return send_from_directory(dist, 'index.html')
    return "Frontend not built. Please run the React app build (or use dev server)."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
