# utils.py
# Utility functions for file parsing

def extract_text_from_file(file):
    """Extract plain text from a PDF or text file."""
    name = getattr(file, 'filename', '').lower()
    text = ""
    try:
        # Reset file pointer just in case
        if hasattr(file, 'seek'):
            file.seek(0)
            
        # Read content into memory
        content = file.read()
        
        # Try PDF parsing if extension matches or header matches
        if name.endswith('.pdf') or content.startswith(b'%PDF'):
            try:
                from PyPDF2 import PdfReader
                from io import BytesIO
                reader = PdfReader(BytesIO(content))
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            except Exception as e:
                print(f"PDF Parse Error: {e}")
                pass
        
        # If no text yet, try plain text decode
        if not text.strip():
             text = content.decode('utf-8', errors='ignore')

        return text.strip()
    except Exception as e:
        print(f"File Read Error: {e}")
        return ""
