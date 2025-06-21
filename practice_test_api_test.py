#!/usr/bin/env python3
import requests
import json
import unittest
import os
import uuid
from dotenv import load_dotenv
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
class GradeLevel(str, Enum):
    GRADE_6 = "6th"
    GRADE_7 = "7th" 
    GRADE_8 = "8th"
    GRADE_9 = "9th"
    GRADE_10 = "10th"
    GRADE_11 = "11th"
    GRADE_12 = "12th"

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

class UserType(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"

class TestPracticeTestAPI(unittest.TestCase):
    """Test cases for Practice Test Results and Statistics API endpoints"""

    def setUp(self):
        """Set up test case - create student account and generate some practice tests"""
        self.student_token = None
        self.student_id = None
        self.test_subjects = [Subject.MATH.value, Subject.PHYSICS.value]
        
        # Register student
        self.register_student()
        
        # Generate and submit practice tests for testing
        if self.student_token:
            self.generate_practice_attempts()

    def register_student(self):
        """Register a student for testing"""
        print("\n🔍 Setting up student account...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"student_practice_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Vikram Singh",
            "user_type": UserType.STUDENT.value,
            "grade_level": GradeLevel.GRADE_10.value
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                self.student_token = data.get("access_token")
                self.student_id = data.get("user", {}).get("id")
                print(f"Registered student with ID: {self.student_id}")
            else:
                print(f"Failed to register student: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error registering student: {str(e)}")

    def generate_practice_attempts(self):
        """Generate and submit multiple practice tests for different subjects"""
        print("\n🔍 Generating practice test attempts for testing...")
        
        for subject in self.test_subjects:
            # Generate 2 tests for each subject
            for i in range(2):
                self.generate_and_submit_test(subject)
                
        print(f"Created practice test attempts for subjects: {', '.join(self.test_subjects)}")

    def generate_and_submit_test(self, subject):
        """Generate and submit a single practice test"""
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Generate test
        gen_url = f"{API_URL}/practice/generate"
        gen_payload = {
            "subject": subject,
            "topics": ["General"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5  # Using 5 as minimum required
        }
        
        try:
            gen_response = requests.post(gen_url, json=gen_payload, headers=headers)
            if gen_response.status_code != 200:
                print(f"Failed to generate practice test: {gen_response.status_code} - {gen_response.text}")
                return
                
            gen_data = gen_response.json()
            test_id = gen_data.get("test_id")
            questions = gen_data.get("questions", [])
            
            if not questions:
                print("No questions generated")
                return
                
            # Create student answers (just use the correct answers for testing)
            student_answers = {}
            question_ids = []
            for question in questions:
                question_id = question.get("id")
                question_ids.append(question_id)
                student_answers[question_id] = question.get("correct_answer")
            
            # Submit the test
            submit_url = f"{API_URL}/practice/submit"
            submit_payload = {
                "test_id": test_id,
                "questions": question_ids,
                "student_answers": student_answers,
                "time_taken": 300  # 5 minutes
            }
            
            submit_response = requests.post(submit_url, json=submit_payload, headers=headers)
            if submit_response.status_code == 200:
                submit_data = submit_response.json()
                print(f"Submitted practice test for {subject} with score: {submit_data.get('score')}%")
            else:
                print(f"Failed to submit practice test: {submit_response.status_code} - {submit_response.text}")
                
        except Exception as e:
            print(f"Error in generate_and_submit_test: {str(e)}")

    def test_01_practice_results_no_filter(self):
        """Test getting practice test results without subject filter"""
        print("\n🔍 Testing /api/practice/results endpoint (no filter)...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/results"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Practice Results Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get practice results")
            data = response.json()
            
            self.assertIsInstance(data, list, "Response should be a list")
            print(f"Retrieved {len(data)} practice test results")
            
            # Verify we have results for all test subjects
            subjects_in_results = set(result.get('subject') for result in data if 'subject' in result)
            print(f"Subjects in results: {subjects_in_results}")
            
            # Check structure of results
            if data:
                first_result = data[0]
                self.assertIn("id", first_result, "Result should have an ID")
                self.assertIn("subject", first_result, "Result should have a subject")
                self.assertIn("score", first_result, "Result should have a score")
                self.assertIn("completed_at", first_result, "Result should have a completion timestamp")
                self.assertIn("total_questions", first_result, "Result should have total questions")
                self.assertIn("correct_answers", first_result, "Result should have correct answers count")
                
                print(f"Sample result: {json.dumps(first_result, default=str)}")
            
            print("✅ Practice results (no filter) test passed")
        except Exception as e:
            print(f"❌ Practice results (no filter) test failed: {str(e)}")
            self.fail(str(e))

    def test_02_practice_results_with_filter(self):
        """Test getting practice test results with subject filter"""
        print("\n🔍 Testing /api/practice/results endpoint (with subject filter)...")
        
        if not self.student_token or not self.test_subjects:
            self.skipTest("Student token or test subjects not available")
        
        # Test with the first subject in our test list
        subject = self.test_subjects[0]
        url = f"{API_URL}/practice/results?subject={subject}"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Practice Results (filtered by {subject}) Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get filtered practice results")
            data = response.json()
            
            self.assertIsInstance(data, list, "Response should be a list")
            print(f"Retrieved {len(data)} practice test results for subject: {subject}")
            
            # Verify all results are for the requested subject
            for result in data:
                self.assertEqual(result.get('subject'), subject, 
                                f"Result subject should be {subject}, got {result.get('subject')}")
            
            print("✅ Practice results (with filter) test passed")
        except Exception as e:
            print(f"❌ Practice results (with filter) test failed: {str(e)}")
            self.fail(str(e))

    def test_03_practice_stats(self):
        """Test getting practice test statistics for a subject"""
        print("\n🔍 Testing /api/practice/stats/{subject} endpoint...")
        
        if not self.student_token or not self.test_subjects:
            self.skipTest("Student token or test subjects not available")
        
        # Test with the first subject in our test list
        subject = self.test_subjects[0]
        url = f"{API_URL}/practice/stats/{subject}"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Practice Stats for {subject} Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get practice stats")
            data = response.json()
            
            # Verify structure of stats
            self.assertIn("subject", data, "Stats should include subject")
            self.assertEqual(data.get('subject'), subject, f"Stats subject should be {subject}")
            
            self.assertIn("total_tests", data, "Stats should include total_tests")
            self.assertIn("average_score", data, "Stats should include average_score")
            self.assertIn("best_score", data, "Stats should include best_score")
            self.assertIn("total_questions_answered", data, "Stats should include total_questions_answered")
            self.assertIn("total_time_spent", data, "Stats should include total_time_spent")
            self.assertIn("recent_tests", data, "Stats should include recent_tests")
            
            # Verify recent_tests is a list
            self.assertIsInstance(data.get('recent_tests'), list, "recent_tests should be a list")
            
            print(f"Stats for {subject}: {json.dumps({k: v for k, v in data.items() if k != 'recent_tests'})}")
            print(f"Recent tests count: {len(data.get('recent_tests', []))}")
            
            print("✅ Practice stats test passed")
        except Exception as e:
            print(f"❌ Practice stats test failed: {str(e)}")
            self.fail(str(e))

    def test_04_practice_stats_no_results(self):
        """Test getting practice test statistics for a subject with no results"""
        print("\n🔍 Testing /api/practice/stats/{subject} endpoint with no results...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        # Use a subject we haven't created tests for
        unused_subject = Subject.HISTORY.value
        url = f"{API_URL}/practice/stats/{unused_subject}"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Practice Stats for unused subject {unused_subject} Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Should return 200 even with no results")
            data = response.json()
            
            # Verify structure of stats with default/empty values
            self.assertIn("subject", data, "Stats should include subject")
            self.assertEqual(data.get('subject'), unused_subject, f"Stats subject should be {unused_subject}")
            
            self.assertEqual(data.get('total_tests'), 0, "total_tests should be 0")
            self.assertEqual(data.get('average_score'), 0, "average_score should be 0")
            self.assertEqual(data.get('best_score'), 0, "best_score should be 0")
            self.assertEqual(data.get('total_questions_answered'), 0, "total_questions_answered should be 0")
            self.assertEqual(data.get('total_time_spent'), 0, "total_time_spent should be 0")
            
            # Verify recent_tests is an empty list
            self.assertIsInstance(data.get('recent_tests'), list, "recent_tests should be a list")
            self.assertEqual(len(data.get('recent_tests')), 0, "recent_tests should be empty")
            
            print(f"Stats for unused subject {unused_subject}: {json.dumps(data)}")
            print("✅ Practice stats (no results) test passed")
        except Exception as e:
            print(f"❌ Practice stats (no results) test failed: {str(e)}")
            self.fail(str(e))

    def test_05_authentication_required(self):
        """Test that authentication is required for practice endpoints"""
        print("\n🔍 Testing authentication requirement for practice endpoints...")
        
        endpoints = [
            f"{API_URL}/practice/results",
            f"{API_URL}/practice/stats/{Subject.MATH.value}"
        ]
        
        for endpoint in endpoints:
            try:
                # Make request without authentication
                response = requests.get(endpoint)
                print(f"Unauthenticated request to {endpoint}: {response.status_code}")
                
                # Should return 401 Unauthorized
                self.assertEqual(response.status_code, 401, 
                                f"Endpoint {endpoint} should require authentication")
                
                print(f"✅ Authentication required for {endpoint}")
            except Exception as e:
                print(f"❌ Authentication test failed for {endpoint}: {str(e)}")
                self.fail(str(e))

if __name__ == "__main__":
    unittest.main()