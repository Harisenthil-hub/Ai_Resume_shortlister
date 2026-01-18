def extract_text_from_file(file):
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

def init_db(database_url='sqlite:///resumes.db'):
    if database_url.startswith('sqlite:///'):
        path = database_url.replace('sqlite:///','')
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS resumes (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, content TEXT)''')
        conn.commit()
        conn.close()

def save_resume_to_db(filename, content, database_url='sqlite:///resumes.db'):
    if database_url.startswith('sqlite:///'):
        path = database_url.replace('sqlite:///','')
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute('INSERT INTO resumes (filename, content) VALUES (?,?)', (filename, content))
        conn.commit()
        conn.close()

def list_resumes_from_db(database_url='sqlite:///resumes.db'):
    if database_url.startswith('sqlite:///'):
        path = database_url.replace('sqlite:///','')
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute('SELECT filename, content FROM resumes')
        rows = c.fetchall()
        conn.close()
        return [{'filename': r[0], 'text': r[1]} for r in rows]
    return []

def delete_resume_from_db(filename, database_url='sqlite:///resumes.db'):
    if database_url.startswith('sqlite:///'):
        path = database_url.replace('sqlite:///','')
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute('DELETE FROM resumes WHERE filename = ?', (filename,))
        conn.commit()
        conn.close()
