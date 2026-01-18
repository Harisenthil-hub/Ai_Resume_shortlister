import requests
import os

def test_analysis():
    url = "http://127.0.0.1:5000/api/analyze-resume"
    
    # create a dummy resume file
    with open("test_resume.txt", "w") as f:
        f.write("John Doe\nSoftware Engineer with 5 years of Python experience.\nSkills: Python, Flask, React, SQL.")
        
    try:
        files = {'resume': open("test_resume.txt", "rb")}
        data = {'role': 'Software Engineer'}
        
        print(f"Sending request to {url}...")
        res = requests.post(url, files=files, data=data)
        
        print(f"Status: {res.status_code}")
        print("Response:")
        print(res.json())
        
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        if os.path.exists("test_resume.txt"):
            os.remove("test_resume.txt")

if __name__ == "__main__":
    test_analysis()
