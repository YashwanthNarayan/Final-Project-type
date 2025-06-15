#!/usr/bin/env python3
import requests
import json
import os
from dotenv import load_dotenv

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

def register_student():
    """Register a student for testing"""
    print("\n🔍 Registering a student account...")
    url = f"{API_URL}/auth/register"
    payload = {
        "email": "student_practice_test@example.com",
        "password": "SecurePass123!",
        "name": "Vikram Singh",
        "user_type": "student",
        "grade_level": "10th"
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            student_token = data.get("access_token")
            student_id = data.get("user", {}).get("id")
            print(f"Registered student with ID: {student_id}")
            return student_token, student_id
        else:
            print(f"Failed to register student: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        print(f"Error registering student: {str(e)}")
        return None, None

def test_practice_test_generation(student_token):
    """Test practice test generation with correct request format"""
    print("\n🔍 Testing Practice Test Generation with correct parameters...")
    
    if not student_token:
        print("Student token not available")
        return False
    
    url = f"{API_URL}/practice/generate"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Correct payload format with question_count >= 5
    payload = {
        "subject": "math",
        "topics": ["Algebra"],
        "difficulty": "medium",
        "question_count": 5  # Must be at least 5
    }
    
    try:
        print(f"Sending payload: {json.dumps(payload)}")
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Generated {len(data.get('questions', []))} practice questions")
            print(f"Test ID: {data.get('test_id')}")
            
            # Print the first question as an example
            if data.get('questions'):
                first_question = data.get('questions')[0]
                print("\nExample Question:")
                print(f"Question: {first_question.get('question_text')}")
                print(f"Type: {first_question.get('question_type')}")
                print(f"Options: {first_question.get('options')}")
                print(f"Correct Answer: {first_question.get('correct_answer')}")
            
            return True
        else:
            print(f"Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {str(e)}")
        return False

if __name__ == "__main__":
    # Register a student and test practice test generation
    student_token, student_id = register_student()
    if student_token:
        success = test_practice_test_generation(student_token)
        if success:
            print("\n✅ Practice test generation works with the correct payload format!")
            print("The key is to use question_count >= 5")
        else:
            print("\n❌ Practice test generation still failed even with the correct payload format.")
    else:
        print("\n❌ Could not register student to test practice test generation.")