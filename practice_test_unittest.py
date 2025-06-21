#!/usr/bin/env python3
import requests
import json
import unittest
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

class TestPracticeTestGeneration(unittest.TestCase):
    """Test cases for practice test generation functionality"""

    def setUp(self):
        """Set up test case - create student account"""
        self.student_token = None
        self.student_id = None
        self.register_student()

    def register_student(self):
        """Register a student for testing"""
        print("\n🔍 Registering a student account...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"student_practice_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Practice Test Student",
            "user_type": "student",
            "grade_level": "10th"
        }
        
        try:
            response = requests.post(url, json=payload)
            print(f"Student Registration Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to register student")
            data = response.json()
            self.student_token = data.get("access_token")
            self.student_id = data.get("user", {}).get("id")
            
            print(f"Registered student with ID: {self.student_id}")
            self.assertIsNotNone(self.student_token, "Student token should not be None")
            self.assertIsNotNone(self.student_id, "Student ID should not be None")
        except Exception as e:
            print(f"Error registering student: {str(e)}")
            self.fail(f"Student registration failed: {str(e)}")

    def test_01_validation_requirements(self):
        """Test practice test generation validation requirements"""
        print("\n🔍 Testing Practice Test Generation Validation Requirements...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Test with question_count below minimum (should fail)
        min_payload = {
            "subject": "math",
            "topics": ["Algebra"],
            "difficulty": "medium",
            "question_count": 3
        }
        
        response = requests.post(url, json=min_payload, headers=headers)
        print(f"Response with question_count=3: {response.status_code}")
        self.assertEqual(response.status_code, 422, "Should reject question_count < 5")
        
        # Test with question_count at minimum (should succeed)
        valid_payload = {
            "subject": "math",
            "topics": ["Algebra"],
            "difficulty": "medium",
            "question_count": 5
        }
        
        response = requests.post(url, json=valid_payload, headers=headers)
        print(f"Response with question_count=5: {response.status_code}")
        self.assertEqual(response.status_code, 200, "Should accept question_count = 5")
        
        # Test with question_count above maximum (should fail)
        max_payload = {
            "subject": "math",
            "topics": ["Algebra"],
            "difficulty": "medium",
            "question_count": 51
        }
        
        response = requests.post(url, json=max_payload, headers=headers)
        print(f"Response with question_count=51: {response.status_code}")
        self.assertEqual(response.status_code, 422, "Should reject question_count > 50")

    def test_02_different_subjects(self):
        """Test practice test generation with different subjects"""
        print("\n🔍 Testing Practice Test Generation with Different Subjects...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        subjects = ["math", "physics", "chemistry", "biology", "english", "history", "geography"]
        
        for subject in subjects:
            payload = {
                "subject": subject,
                "topics": ["General"],
                "difficulty": "medium",
                "question_count": 5
            }
            
            print(f"\nTesting subject: {subject}")
            response = requests.post(url, json=payload, headers=headers)
            print(f"Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, f"Failed to generate practice test for {subject}")
            
            data = response.json()
            questions = data.get("questions", [])
            self.assertTrue(len(questions) > 0, f"No questions generated for {subject}")
            
            # Check the first question
            first_question = questions[0]
            self.assertEqual(first_question.get("subject"), subject, f"Question subject mismatch for {subject}")
            print(f"Generated {len(questions)} questions for {subject}")

    def test_03_different_difficulties(self):
        """Test practice test generation with different difficulty levels"""
        print("\n🔍 Testing Practice Test Generation with Different Difficulty Levels...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        difficulties = ["easy", "medium", "hard", "mixed"]
        
        for difficulty in difficulties:
            payload = {
                "subject": "math",
                "topics": ["Algebra"],
                "difficulty": difficulty,
                "question_count": 5
            }
            
            print(f"\nTesting difficulty: {difficulty}")
            response = requests.post(url, json=payload, headers=headers)
            print(f"Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, f"Failed to generate practice test for difficulty {difficulty}")
            
            data = response.json()
            questions = data.get("questions", [])
            self.assertTrue(len(questions) > 0, f"No questions generated for difficulty {difficulty}")
            
            # Check the first question
            first_question = questions[0]
            self.assertEqual(first_question.get("difficulty"), difficulty, f"Question difficulty mismatch for {difficulty}")
            print(f"Generated {len(questions)} questions for difficulty {difficulty}")

    def test_04_json_parsing(self):
        """Test JSON parsing in the PracticeTestBot.generate_practice_questions method"""
        print("\n🔍 Testing JSON Parsing in Practice Test Generation...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        payload = {
            "subject": "math",
            "topics": ["Algebra"],
            "difficulty": "medium",
            "question_count": 5
        }
        
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response: {response.status_code}")
        
        self.assertEqual(response.status_code, 200, "Failed to generate practice test")
        
        data = response.json()
        questions = data.get("questions", [])
        self.assertTrue(len(questions) > 0, "No questions generated")
        
        # Check required fields in all questions
        required_fields = ["id", "subject", "topics", "question_type", "difficulty", 
                          "question_text", "correct_answer", "explanation"]
        
        for i, question in enumerate(questions):
            for field in required_fields:
                self.assertIn(field, question, f"Question {i+1} missing required field: {field}")
            
            # Check if MCQ questions have options
            if question.get("question_type") == "mcq":
                self.assertTrue(len(question.get("options", [])) >= 2, 
                               f"MCQ Question {i+1} has insufficient options")
        
        print(f"Successfully validated {len(questions)} questions with proper JSON structure")
        
        # Print the structure of the first question for reference
        if questions:
            print("\nQuestion Structure Example:")
            print(json.dumps(questions[0], indent=2))

    def test_05_authentication_requirement(self):
        """Test that practice test generation requires authentication"""
        print("\n🔍 Testing Authentication Requirement for Practice Test Generation...")
        
        url = f"{API_URL}/practice/generate"
        
        payload = {
            "subject": "math",
            "topics": ["Algebra"],
            "difficulty": "medium",
            "question_count": 5
        }
        
        # Test without authentication
        response = requests.post(url, json=payload)
        print(f"Response without authentication: {response.status_code}")
        
        self.assertEqual(response.status_code, 401, "Practice test generation should require authentication")
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid.token.here"}
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response with invalid token: {response.status_code}")
        
        self.assertEqual(response.status_code, 401, "Practice test generation should reject invalid tokens")

if __name__ == "__main__":
    unittest.main()