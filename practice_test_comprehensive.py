#!/usr/bin/env python3
import requests
import json
import uuid
from dotenv import load_dotenv
import os
import sys
from enum import Enum

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

# Enums to match backend
class Subject(str, Enum):
    MATH = "math"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    BIOLOGY = "biology"
    ENGLISH = "english"
    HISTORY = "history"
    GEOGRAPHY = "geography"

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"  
    HARD = "hard"
    MIXED = "mixed"

def register_student():
    """Register a student for testing"""
    print("\n🔍 Registering a student account...")
    email = f"student_practice_{uuid.uuid4()}@example.com"
    url = f"{API_URL}/auth/register"
    payload = {
        "email": email,
        "password": "SecurePass123!",
        "name": "Practice Test Student",
        "user_type": "student",
        "grade_level": "10th"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Student Registration Response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            student_token = data.get("access_token")
            student_id = data.get("user", {}).get("id")
            print(f"Registered student with ID: {student_id}")
            return student_token, student_id, email
        else:
            print(f"Failed to register student: {response.status_code}")
            print(f"Response: {response.text}")
            return None, None, None
    except Exception as e:
        print(f"Error registering student: {str(e)}")
        return None, None, None

def test_practice_test_validation():
    """Test practice test generation validation requirements"""
    print("\n🔍 Testing Practice Test Generation Validation...")
    
    # Register a student
    student_token, student_id, email = register_student()
    if not student_token:
        print("Failed to register student, cannot proceed with tests")
        return
    
    url = f"{API_URL}/practice/generate"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Test cases with different question_count values
    test_cases = [
        {"question_count": 3, "expected_status": 422, "description": "Too few questions (< 5)"},
        {"question_count": 4, "expected_status": 422, "description": "Too few questions (< 5)"},
        {"question_count": 5, "expected_status": 200, "description": "Minimum valid questions (= 5)"},
        {"question_count": 10, "expected_status": 200, "description": "Valid questions (10)"},
        {"question_count": 50, "expected_status": 200, "description": "Maximum valid questions (= 50)"},
        {"question_count": 51, "expected_status": 422, "description": "Too many questions (> 50)"},
        {"question_count": 100, "expected_status": 422, "description": "Too many questions (> 50)"}
    ]
    
    for test_case in test_cases:
        question_count = test_case["question_count"]
        expected_status = test_case["expected_status"]
        description = test_case["description"]
        
        print(f"\nTesting: {description} (question_count={question_count})")
        
        payload = {
            "subject": Subject.MATH.value,
            "topics": ["Algebra"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": question_count
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            status_code = response.status_code
            print(f"Response status: {status_code}")
            
            if status_code == expected_status:
                print(f"✅ Test passed: Got expected status code {expected_status}")
                if status_code == 200:
                    data = response.json()
                    questions = data.get("questions", [])
                    print(f"Generated {len(questions)} questions")
            else:
                print(f"❌ Test failed: Expected status code {expected_status}, got {status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error during test: {str(e)}")

def test_different_subjects_and_difficulties():
    """Test practice test generation with different subjects and difficulties"""
    print("\n🔍 Testing Practice Test Generation with Different Subjects and Difficulties...")
    
    # Register a student
    student_token, student_id, email = register_student()
    if not student_token:
        print("Failed to register student, cannot proceed with tests")
        return
    
    url = f"{API_URL}/practice/generate"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Test cases with different subjects and difficulties
    test_cases = [
        {"subject": Subject.MATH.value, "difficulty": DifficultyLevel.EASY.value, "topics": ["Algebra"]},
        {"subject": Subject.PHYSICS.value, "difficulty": DifficultyLevel.MEDIUM.value, "topics": ["Mechanics"]},
        {"subject": Subject.CHEMISTRY.value, "difficulty": DifficultyLevel.HARD.value, "topics": ["Organic Chemistry"]},
        {"subject": Subject.BIOLOGY.value, "difficulty": DifficultyLevel.MIXED.value, "topics": ["Cell Biology"]},
        {"subject": Subject.ENGLISH.value, "difficulty": DifficultyLevel.MEDIUM.value, "topics": ["Grammar"]},
        {"subject": Subject.HISTORY.value, "difficulty": DifficultyLevel.EASY.value, "topics": ["Ancient History"]},
        {"subject": Subject.GEOGRAPHY.value, "difficulty": DifficultyLevel.MEDIUM.value, "topics": ["Physical Geography"]}
    ]
    
    for test_case in test_cases:
        subject = test_case["subject"]
        difficulty = test_case["difficulty"]
        topics = test_case["topics"]
        
        print(f"\nTesting: Subject={subject}, Difficulty={difficulty}, Topics={topics}")
        
        payload = {
            "subject": subject,
            "topics": topics,
            "difficulty": difficulty,
            "question_count": 5  # Use minimum valid value
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            status_code = response.status_code
            print(f"Response status: {status_code}")
            
            if status_code == 200:
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
                print(f"❌ Failed to generate practice test: {status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error during test: {str(e)}")

def test_json_parsing():
    """Test the JSON parsing in the PracticeTestBot.generate_practice_questions method"""
    print("\n🔍 Testing JSON Parsing in Practice Test Generation...")
    
    # Register a student
    student_token, student_id, email = register_student()
    if not student_token:
        print("Failed to register student, cannot proceed with tests")
        return
    
    url = f"{API_URL}/practice/generate"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Use a payload that should generate a valid response
    payload = {
        "subject": Subject.MATH.value,
        "topics": ["Algebra"],
        "difficulty": DifficultyLevel.MEDIUM.value,
        "question_count": 5
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            questions = data.get("questions", [])
            print(f"Generated {len(questions)} practice questions")
            
            # Check if all questions have the required fields
            required_fields = ["id", "subject", "topics", "question_type", "difficulty", 
                              "question_text", "correct_answer", "explanation"]
            
            valid_questions = True
            for i, question in enumerate(questions):
                missing_fields = [field for field in required_fields if field not in question]
                
                if missing_fields:
                    valid_questions = False
                    print(f"❌ Question {i+1} is missing fields: {', '.join(missing_fields)}")
                
                # Check if MCQ questions have options
                if question.get("question_type") == "mcq" and (not question.get("options") or len(question.get("options", [])) < 2):
                    valid_questions = False
                    print(f"❌ MCQ Question {i+1} has invalid options: {question.get('options')}")
            
            if valid_questions:
                print("✅ All questions have valid structure - JSON parsing is working correctly")
            else:
                print("❌ Some questions have invalid structure - JSON parsing may have issues")
                
            # Print the structure of the first question for reference
            if questions:
                print("\nQuestion Structure Example:")
                print(json.dumps(questions[0], indent=2))
        else:
            print(f"❌ Failed to generate practice test: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")

def test_authentication_requirement():
    """Test that practice test generation requires authentication"""
    print("\n🔍 Testing Authentication Requirement for Practice Test Generation...")
    
    url = f"{API_URL}/practice/generate"
    
    # Test without authentication
    payload = {
        "subject": Subject.MATH.value,
        "topics": ["Algebra"],
        "difficulty": DifficultyLevel.MEDIUM.value,
        "question_count": 5
    }
    
    try:
        # Make request without authentication header
        response = requests.post(url, json=payload)
        status_code = response.status_code
        print(f"Response status without authentication: {status_code}")
        
        if status_code == 401:
            print("✅ Authentication is properly required (got 401 Unauthorized)")
        else:
            print(f"❌ Expected 401 Unauthorized, got {status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")

if __name__ == "__main__":
    print("\n==== COMPREHENSIVE TESTING OF PRACTICE TEST GENERATION ====\n")
    
    # Test validation requirements (especially question_count)
    test_practice_test_validation()
    
    # Test with different subjects and difficulties
    test_different_subjects_and_difficulties()
    
    # Test JSON parsing
    test_json_parsing()
    
    # Test authentication requirement
    test_authentication_requirement()
    
    print("\n==== PRACTICE TEST GENERATION TESTING COMPLETE ====\n")