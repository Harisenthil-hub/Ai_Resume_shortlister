from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import os
import logging
from io import BytesIO
from utils import extract_text_from_file
from database import init_db, save_resume_to_db, list_resumes_from_db
from llm_client import llm

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB on startup
init_db()

app = Flask(__name__, static_folder='frontend/dist', template_folder='templates')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

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
        
        logger.info(f"Received analysis request for file: {file.filename}, role: {role}")

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # 1. Read File
        file_content = file.read()
        
        # 2. Extract Text
        file_obj = BytesIO(file_content)
        file_obj.filename = file.filename
        text = extract_text_from_file(file_obj)
        
        logger.info(f"Extracted text length: {len(text)}")

        if not text.strip():
             logger.warning("Empty text extracted from file.")
             return jsonify({'error': 'Could not extract text from file'}), 400

        # 3. Call AI (Synchronous, Timeout protected)
        result = llm.evaluate_resume(text, role)
        
        # 4. Persistence: Save to DB
        try:
            save_resume_to_db(
                filename=file.filename,
                content=text,
                role=role,
                score=result.get('score'),
                analysis=result
            )
            logger.info(f"Saved analysis for {file.filename} to database.")
        except Exception as db_err:
            logger.error(f"Database Save Failed: {db_err}")

        return jsonify({
            'filename': file.filename,
            'role': role,
            'analysis': result
        })

    except Exception as e:
        logger.error(f"Analysis Failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes', methods=['GET'])
def get_resumes():
    """Returns a list of all analyzed resumes from the database."""
    try:
        resumes = list_resumes_from_db()
        return jsonify(resumes)
    except Exception as e:
        import traceback
        logger.error(f"Failed to fetch resumes: {e}")
        logger.error(traceback.format_exc())
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
