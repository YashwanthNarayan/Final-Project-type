#!/usr/bin/env python3
import requests
import json
import uuid
from dotenv import load_dotenv
import os

# Load environment variables from frontend/.env to get the backend URL
load_dotenv('/app/frontend/.env')

# Get the backend URL from environment variables
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in environment variables")
    exit(1)

# Add /api prefix to the backend URL
API_URL = f"{BACKEND_URL}/api"
print(f"Using API URL: {API_URL}")

# Test the practice test generation with the correct parameters
def test_practice_test_generation():
    print("\n🔍 Testing Practice Test Generation with Correct Parameters...")
    
    # Register a student
    register_url = f"{API_URL}/auth/register"
    register_payload = {
        "email": f"student_practice_{uuid.uuid4()}@example.com",
        "password": "SecurePass123!",
        "name": "Vikram Singh",
        "user_type": "student",
        "grade_level": "10th"
    }
    
    try:
        register_response = requests.post(register_url, json=register_payload)
        if register_response.status_code != 200:
            print(f"❌ Failed to register student: {register_response.status_code}")
            return
        
        student_data = register_response.json()
        student_token = student_data.get("access_token")
        
        # Generate practice test with correct parameters
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {student_token}"}
        
        # Use the correct payload format with question_count >= 5
        payload = {
            "subject": "math",
            "topics": ["Algebra"],
            "difficulty": "medium",
            "question_count": 5  # Must be at least 5
        }
        
        print(f"Sending payload: {json.dumps(payload)}")
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Successfully generated practice test with {len(data.get('questions', []))} questions")
            print(f"Test ID: {data.get('test_id')}")
            
            # Print the first question as an example
            if data.get('questions'):
                first_question = data.get('questions')[0]
                print("\nExample Question:")
                print(f"Question: {first_question.get('question_text')}")
                print(f"Type: {first_question.get('question_type')}")
                print(f"Difficulty: {first_question.get('difficulty')}")
                if first_question.get('options'):
                    print(f"Options: {first_question.get('options')}")
                print(f"Correct Answer: {first_question.get('correct_answer')}")
        else:
            print(f"❌ Failed to generate practice test: {response.status_code}")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_practice_test_generation()