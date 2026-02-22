# llm_client.py
import os
import json
import logging
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
API_URL = "https://api.groq.com/openai/v1/chat/completions"

if not API_KEY:
    logger.warning("GROQ_API_KEY is not set in .env file. API calls will fail.")

class LLMClient:
    def __init__(self):
        self.api_key = API_KEY
        self.model = MODEL
        self.url = API_URL

    def _call_api(self, messages, temperature=0.1):
        """Helper to call Groq API via requests."""
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "response_format": {"type": "json_object"}
        }

        try:
            response = requests.post(
                self.url, 
                headers=headers, 
                json=payload, 
                timeout=30  # HARD TIMEOUT 30s
            )
            response.raise_for_status()
            
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content']
            return None
            
        except requests.exceptions.Timeout:
            logger.error("Groq API request timed out (30s).")
            return None
        except Exception as e:
            logger.error(f"Groq API Request Failed: {e}")
            return None

    def evaluate_resume(self, resume_text, job_role):
        """
        Evaluates a resume summary against a role using Groq.
        """
        prompt = f"""You are an expert AI resume evaluator.

Carefully evaluate the resume below for the given role. Consider:
- Relevance of skills and experience to the role
- Years of experience and career progression
- Education and certifications
- Project quality and technical depth
- Communication and presentation

Role: {job_role}

Resume:
{resume_text}

Return ONLY valid JSON with these fields:
{{
  "score": <integer from 0 to 100, where 0=completely unqualified, 50=average, 75=strong, 90+=exceptional>,
  "shortlisted": <true if score >= 60, false otherwise>,
  "strengths": ["list of 2-4 specific strengths"],
  "weaknesses": ["list of 2-4 specific weaknesses or gaps"],
  "suggestions": ["list of 2-3 actionable improvement suggestions"]
}}
"""
        
        messages = [
            {"role": "system", "content": "You are a helpful AI assistant. You output ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]

        # Call API
        response_text = self._call_api(messages, temperature=0.1)
        
        # Handle Empty/Error
        if not response_text:
            return {
                "score": 0, 
                "shortlisted": False, 
                "strengths": [], 
                "weaknesses": [], 
                "suggestions": ["AI Service Timeout or Error"]
            }

        # JSON Extraction
        import re
        parsed_data = {}
        try:
             # Try direct load
             parsed_data = json.loads(response_text)
        except:
             # Try clean code blocks
             try:
                clean_text = re.sub(r"```json\s*", "", response_text)
                clean_text = re.sub(r"```", "", clean_text).strip()
                parsed_data = json.loads(clean_text)
             except:
                logger.error(f"Failed to parse JSON. Raw: {response_text}")
                return {
                    "score": 0, 
                    "shortlisted": False, 
                    "strengths": [], 
                    "weaknesses": [], 
                    "suggestions": ["Parsing Error"]
                }
        
        # --- NORMALIZATION & SAFETY CHECKS ---
        score = parsed_data.get('score', 0)
        
        # Clamp to 0-100
        try:
            score = int(score)
        except:
            score = 0
        score = max(0, min(100, score))
        
        # 3. Force Shortlist Rule (Single Source of Truth)
        # shortlisted = true only if score >= 60
        is_shortlisted = (score >= 60)
        
        return {
            "score": score,
            "shortlisted": is_shortlisted,
            "strengths": parsed_data.get("strengths", []),
            "weaknesses": parsed_data.get("weaknesses", []),
            "suggestions": parsed_data.get("suggestions", [])
        }
    
    # Keeping this for compatibility if app.py calls it, though it wasn't in the simplified instructions
    def generate_summary(self, text):
        return "Summary feature not available in simplified mode."

# Singleton instance
llm = LLMClient()
