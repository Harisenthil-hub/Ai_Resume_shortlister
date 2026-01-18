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
API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

if not API_KEY:
    logger.warning("OPENROUTER_API_KEY is not set in .env file. API calls will fail.")

class LLMClient:
    def __init__(self):
        self.api_key = API_KEY
        self.model = MODEL
        self.url = API_URL

    def _call_api(self, messages, temperature=0.1):
        """Helper to call OpenRouter API via requests."""
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Resume Analyzer"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            # Strict JSON mode is model-dependent, usually safest to rely on prompt for OpenRouter generic models
            # but we can try response_format if valid for the specific model. 
            # Llama 3 on OpenRouter generally respects prompts well.
            # "response_format": {"type": "json_object"} 
        }

        try:
            response = requests.post(
                self.url, 
                headers=headers, 
                json=payload, 
                timeout=15  # HARD TIMEOUT 15s
            )
            response.raise_for_status()
            
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content']
            return None
            
        except requests.exceptions.Timeout:
            logger.error("OpenRouter API request timed out (15s).")
            return None
        except Exception as e:
            logger.error(f"OpenRouter API Request Failed: {e}")
            return None

    def evaluate_resume(self, resume_text, job_role):
        """
        Evaluates a resume summary against a role using OpenRouter.
        """
        prompt = f"""You are an AI resume evaluator.

Evaluate the resume summary below for the given role.

Role: {job_role}

Resume Summary:
{resume_text}

Return ONLY valid JSON:
{{
  "score": number,
  "shortlisted": true/false,
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
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
        
        # 1. Normalize 1-10 to 10-100 if needed (common LLM mistake)
        if hasattr(score, 'real') and score <= 10 and score > 0:
            logger.info(f"Normalizing score from {score} to {score*10}")
            score *= 10
            
        # 2. Clamp to 0-100
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
