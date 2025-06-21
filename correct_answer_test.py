#!/usr/bin/env python3
import requests
import json
import uuid
from dotenv import load_dotenv
import os
import sys

# Load environment variables from frontend/.env to get the backend URL
load_dotenv('/app/frontend/.env')

# Get the backend URL from environment variables
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in environment variables")
    sys.exit(1)

# Add /api prefix to the backend URL
API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

def test_correct_answer_validation():
    """Test practice test generation with focus on correct_answer field validation"""
    print("\n🔍 Testing Practice Test Generation with focus on correct_answer field...")
    
    # Register a student
    url = f"{API_URL}/auth/register"
    payload = {
        "email": f"student_validation_{uuid.uuid4()}@example.com",
        "password": "SecurePass123!",
        "name": "Validation Test Student",
        "user_type": "student",
        "grade_level": "10th"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Student Registration Response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Failed to register student: {response.status_code}")
            print(f"Response: {response.text}")
            return
        
        data = response.json()
        student_token = data.get("access_token")
        student_id = data.get("user", {}).get("id")
        
        print(f"Registered student with ID: {student_id}")
        
        # Test with different subjects that might have numerical answers
        test_url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {student_token}"}
        
        subjects = ["math", "physics", "chemistry"]
        
        for subject in subjects:
            payload = {
                "subject": subject,
                "topics": ["General"],
                "difficulty": "medium",
                "question_count": 5
            }
            
            print(f"\nTesting {subject} with focus on correct_answer field")
            print(f"Payload: {json.dumps(payload)}")
            
            response = requests.post(test_url, json=payload, headers=headers)
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                questions = data.get("questions", [])
                print(f"✅ Successfully generated {len(questions)} questions")
                
                # Check the correct_answer field for each question
                for i, question in enumerate(questions):
                    answer = question.get("correct_answer")
                    answer_type = type(answer).__name__
                    print(f"Question {i+1} - Answer: '{answer}' (Type: {answer_type})")
                    
                    # Check if the answer is a string
                    if not isinstance(answer, str):
                        print(f"❌ WARNING: Question {i+1} has non-string answer: {answer} (Type: {answer_type})")
            else:
                print(f"❌ Failed to generate practice test: {response.status_code}")
                print(f"Response: {response.text}")
                
                # If we got a 500 error, try to get more details
                if response.status_code == 500:
                    print("\nChecking backend logs for error details...")
                    try:
                        import subprocess
                        logs = subprocess.check_output(["tail", "-n", "50", "/var/log/supervisor/backend.err.log"]).decode()
                        print(f"Backend error logs:\n{logs}")
                    except Exception as e:
                        print(f"Could not retrieve backend logs: {str(e)}")
    
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")

if __name__ == "__main__":
    test_correct_answer_validation()