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

def test_english_subject():
    """Test practice test generation specifically for English subject"""
    print("\n🔍 Testing Practice Test Generation for English Subject...")
    
    # Register a student
    url = f"{API_URL}/auth/register"
    payload = {
        "email": f"student_english_{uuid.uuid4()}@example.com",
        "password": "SecurePass123!",
        "name": "English Test Student",
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
        
        # Test English subject with different topics
        test_url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {student_token}"}
        
        english_topics = [
            ["Grammar"],
            ["Literature"],
            ["Poetry"],
            ["Essay Writing"],
            ["Reading Comprehension"],
            ["Creative Writing"],
            ["General"]  # Generic topic
        ]
        
        for topics in english_topics:
            payload = {
                "subject": "english",
                "topics": topics,
                "difficulty": "medium",
                "question_count": 5
            }
            
            print(f"\nTesting English with topics: {topics}")
            print(f"Payload: {json.dumps(payload)}")
            
            response = requests.post(test_url, json=payload, headers=headers)
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                questions = data.get("questions", [])
                print(f"✅ Successfully generated {len(questions)} questions")
                
                # Print the first question as a sample
                if questions:
                    first_question = questions[0]
                    print("\nSample Question:")
                    print(f"Question: {first_question.get('question_text')}")
                    print(f"Type: {first_question.get('question_type')}")
                    if first_question.get('options'):
                        print(f"Options: {first_question.get('options')}")
                    print(f"Answer: {first_question.get('correct_answer')}")
            else:
                print(f"❌ Failed to generate practice test: {response.status_code}")
                print(f"Response: {response.text}")
                
                # If we got a 500 error, try to get more details
                if response.status_code == 500:
                    print("\nChecking backend logs for error details...")
                    try:
                        # This assumes you have access to the backend logs
                        import subprocess
                        logs = subprocess.check_output(["tail", "-n", "50", "/var/log/supervisor/backend.err.log"]).decode()
                        print(f"Backend error logs:\n{logs}")
                    except Exception as e:
                        print(f"Could not retrieve backend logs: {str(e)}")
    
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")

if __name__ == "__main__":
    test_english_subject()