#!/usr/bin/env python3
import requests
import json
import time
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

class QuestionType(str, Enum):
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    NUMERICAL = "numerical"

class TestEnhancedPracticeTestSystem(unittest.TestCase):
    """Test cases for the enhanced practice test system with new features"""

    def setUp(self):
        """Set up test case - create student account"""
        self.student_token = None
        self.student_id = None
        
        # Register student
        self.register_student()

    def register_student(self):
        """Register a student for testing"""
        print("\n🔍 Setting up student account...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"student_practice_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Vikram Singh",
            "user_type": UserType.STUDENT.value,
            "grade_level": "10th"
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

    def test_01_question_type_filtering_mcq_only(self):
        """Test practice test generation with MCQ questions only"""
        print("\n🔍 Testing Practice Test Generation with MCQ Questions Only...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.MATH.value,
            "topics": ["Algebra"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "question_types": [QuestionType.MCQ.value]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"MCQ Only Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate practice test with MCQ questions only")
            data = response.json()
            
            # Verify the response structure
            self.assertIn("test_id", data, "Test ID not found in response")
            self.assertIn("questions", data, "Questions not found in response")
            self.assertIn("total_questions", data, "Total questions not found in response")
            self.assertIn("question_types_generated", data, "Question types generated not found in response")
            self.assertIn("excluded_count", data, "Excluded count not found in response")
            
            # Verify all questions are MCQ
            questions = data.get("questions", [])
            self.assertTrue(len(questions) > 0, "Should have at least one question")
            
            for question in questions:
                self.assertEqual(question.get("question_type"), QuestionType.MCQ.value, 
                                f"Question should be MCQ, got {question.get('question_type')}")
                self.assertTrue(len(question.get("options", [])) > 0, "MCQ question should have options")
            
            # Verify question_types_generated field
            question_types_generated = data.get("question_types_generated", [])
            self.assertEqual(len(question_types_generated), 1, "Should only have one question type generated")
            self.assertEqual(question_types_generated[0], QuestionType.MCQ.value, "Should only have MCQ questions")
            
            print(f"Generated {len(questions)} MCQ questions")
            print("✅ MCQ only filtering test passed")
        except Exception as e:
            print(f"❌ MCQ only filtering test failed: {str(e)}")
            self.fail(str(e))

    def test_02_question_type_filtering_short_answer_only(self):
        """Test practice test generation with short answer questions only"""
        print("\n🔍 Testing Practice Test Generation with Short Answer Questions Only...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.ENGLISH.value,
            "topics": ["Grammar"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "question_types": [QuestionType.SHORT_ANSWER.value]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Short Answer Only Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate practice test with short answer questions only")
            data = response.json()
            
            # Verify all questions are short answer
            questions = data.get("questions", [])
            self.assertTrue(len(questions) > 0, "Should have at least one question")
            
            for question in questions:
                self.assertEqual(question.get("question_type"), QuestionType.SHORT_ANSWER.value, 
                                f"Question should be short answer, got {question.get('question_type')}")
            
            # Verify question_types_generated field
            question_types_generated = data.get("question_types_generated", [])
            self.assertEqual(len(question_types_generated), 1, "Should only have one question type generated")
            self.assertEqual(question_types_generated[0], QuestionType.SHORT_ANSWER.value, "Should only have short answer questions")
            
            print(f"Generated {len(questions)} short answer questions")
            print("✅ Short answer only filtering test passed")
        except Exception as e:
            print(f"❌ Short answer only filtering test failed: {str(e)}")
            self.fail(str(e))

    def test_03_question_type_filtering_numerical_only(self):
        """Test practice test generation with numerical questions only"""
        print("\n🔍 Testing Practice Test Generation with Numerical Questions Only...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.PHYSICS.value,
            "topics": ["Mechanics"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "question_types": [QuestionType.NUMERICAL.value]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Numerical Only Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate practice test with numerical questions only")
            data = response.json()
            
            # Verify all questions are numerical
            questions = data.get("questions", [])
            self.assertTrue(len(questions) > 0, "Should have at least one question")
            
            for question in questions:
                self.assertEqual(question.get("question_type"), QuestionType.NUMERICAL.value, 
                                f"Question should be numerical, got {question.get('question_type')}")
            
            # Verify question_types_generated field
            question_types_generated = data.get("question_types_generated", [])
            self.assertEqual(len(question_types_generated), 1, "Should only have one question type generated")
            self.assertEqual(question_types_generated[0], QuestionType.NUMERICAL.value, "Should only have numerical questions")
            
            print(f"Generated {len(questions)} numerical questions")
            print("✅ Numerical only filtering test passed")
        except Exception as e:
            print(f"❌ Numerical only filtering test failed: {str(e)}")
            self.fail(str(e))

    def test_04_question_type_filtering_mixed_types(self):
        """Test practice test generation with mixed question types (MCQ + numerical)"""
        print("\n🔍 Testing Practice Test Generation with Mixed Question Types (MCQ + Numerical)...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.PHYSICS.value,
            "topics": ["Mechanics"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "question_types": [QuestionType.MCQ.value, QuestionType.NUMERICAL.value]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Mixed Types Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate practice test with mixed question types")
            data = response.json()
            
            # Verify questions are either MCQ or numerical
            questions = data.get("questions", [])
            self.assertTrue(len(questions) > 0, "Should have at least one question")
            
            for question in questions:
                self.assertIn(question.get("question_type"), [QuestionType.MCQ.value, QuestionType.NUMERICAL.value], 
                             f"Question should be MCQ or numerical, got {question.get('question_type')}")
            
            # Verify question_types_generated field
            question_types_generated = data.get("question_types_generated", [])
            self.assertTrue(len(question_types_generated) > 0, "Should have at least one question type generated")
            for qtype in question_types_generated:
                self.assertIn(qtype, [QuestionType.MCQ.value, QuestionType.NUMERICAL.value], 
                             f"Generated question type should be MCQ or numerical, got {qtype}")
            
            print(f"Generated {len(questions)} mixed type questions")
            print("✅ Mixed question types filtering test passed")
        except Exception as e:
            print(f"❌ Mixed question types filtering test failed: {str(e)}")
            self.fail(str(e))

    def test_05_question_type_filtering_all_types(self):
        """Test practice test generation with all question types (no filter)"""
        print("\n🔍 Testing Practice Test Generation with All Question Types (No Filter)...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.MATH.value,
            "topics": ["Algebra"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5
            # No question_types parameter
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"All Types Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate practice test with all question types")
            data = response.json()
            
            # Verify questions are of any valid type
            questions = data.get("questions", [])
            self.assertTrue(len(questions) > 0, "Should have at least one question")
            
            valid_types = [qt.value for qt in QuestionType]
            for question in questions:
                self.assertIn(question.get("question_type"), valid_types, 
                             f"Question should have a valid type, got {question.get('question_type')}")
            
            # Verify question_types_generated field
            question_types_generated = data.get("question_types_generated", [])
            self.assertTrue(len(question_types_generated) > 0, "Should have at least one question type generated")
            
            print(f"Generated {len(questions)} questions with types: {', '.join(question_types_generated)}")
            print("✅ All question types (no filter) test passed")
        except Exception as e:
            print(f"❌ All question types (no filter) test failed: {str(e)}")
            self.fail(str(e))

    def test_06_duplicate_question_prevention(self):
        """Test duplicate question prevention by generating multiple tests with same parameters"""
        print("\n🔍 Testing Duplicate Question Prevention...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.MATH.value,
            "topics": ["Algebra"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "exclude_seen": True
        }
        
        try:
            # Generate first test
            print("Generating first test...")
            response1 = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response1.status_code, 200, "Failed to generate first practice test")
            data1 = response1.json()
            questions1 = data1.get("questions", [])
            question_ids1 = [q.get("id") for q in questions1]
            
            # Generate second test with same parameters
            print("Generating second test with exclude_seen=true...")
            response2 = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response2.status_code, 200, "Failed to generate second practice test")
            data2 = response2.json()
            questions2 = data2.get("questions", [])
            question_ids2 = [q.get("id") for q in questions2]
            
            # Verify no duplicate questions
            for qid in question_ids2:
                self.assertNotIn(qid, question_ids1, f"Question {qid} appears in both tests despite exclude_seen=true")
            
            # Check excluded_count in second response
            excluded_count = data2.get("excluded_count", 0)
            self.assertTrue(excluded_count > 0, "Second test should have excluded questions from first test")
            self.assertEqual(excluded_count, len(questions1), "Excluded count should match number of questions in first test")
            
            # Now try with exclude_seen=false
            payload["exclude_seen"] = False
            print("Generating third test with exclude_seen=false...")
            response3 = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response3.status_code, 200, "Failed to generate third practice test")
            data3 = response3.json()
            
            # Verify excluded_count is 0
            excluded_count3 = data3.get("excluded_count", -1)
            self.assertEqual(excluded_count3, 0, "Third test should have excluded_count=0 with exclude_seen=false")
            
            print("✅ Duplicate question prevention test passed")
        except Exception as e:
            print(f"❌ Duplicate question prevention test failed: {str(e)}")
            self.fail(str(e))

    def test_07_question_history_tracking(self):
        """Test question history tracking functions"""
        print("\n🔍 Testing Question History Tracking...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        # First generate a test to create some seen questions
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.PHYSICS.value,
            "topics": ["Optics"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5
        }
        
        try:
            # Generate test
            response = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response.status_code, 200, "Failed to generate practice test")
            data = response.json()
            questions = data.get("questions", [])
            question_ids = [q.get("id") for q in questions]
            test_id = data.get("test_id")
            
            # Verify questions are marked as seen
            # Generate another test with same parameters to check excluded_count
            response2 = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response2.status_code, 200, "Failed to generate second practice test")
            data2 = response2.json()
            excluded_count = data2.get("excluded_count", 0)
            self.assertEqual(excluded_count, len(questions), "Questions from first test should be marked as seen")
            
            # Now submit the test to mark questions as attempted
            submit_url = f"{API_URL}/practice/submit"
            submit_payload = {
                "test_id": test_id,
                "questions": question_ids,
                "student_answers": {qid: "Test answer" for qid in question_ids},
                "time_taken": 300  # 5 minutes
            }
            
            submit_response = requests.post(submit_url, json=submit_payload, headers=headers)
            self.assertEqual(submit_response.status_code, 200, "Failed to submit practice test")
            
            # Check practice results to verify questions were marked as attempted
            results_url = f"{API_URL}/practice/results"
            results_response = requests.get(results_url, headers=headers)
            self.assertEqual(results_response.status_code, 200, "Failed to get practice results")
            results_data = results_response.json()
            
            # Verify there's at least one result
            self.assertTrue(len(results_data) > 0, "Should have at least one practice test result")
            
            # Verify the first result has the correct test_id
            first_result = results_data[0]
            self.assertEqual(first_result.get("id"), submit_payload.get("test_id"), "Test ID mismatch in results")
            
            print("✅ Question history tracking test passed")
        except Exception as e:
            print(f"❌ Question history tracking test failed: {str(e)}")
            self.fail(str(e))

    def test_08_enhanced_api_response(self):
        """Test enhanced API response structure"""
        print("\n🔍 Testing Enhanced API Response Structure...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.CHEMISTRY.value,
            "topics": ["Periodic Table"],
            "difficulty": DifficultyLevel.EASY.value,
            "question_count": 5,
            "question_types": [QuestionType.MCQ.value, QuestionType.SHORT_ANSWER.value]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response.status_code, 200, "Failed to generate practice test")
            data = response.json()
            
            # Verify enhanced response structure
            self.assertIn("test_id", data, "Test ID not found in response")
            self.assertIn("questions", data, "Questions not found in response")
            self.assertIn("total_questions", data, "Total questions not found in response")
            self.assertIn("question_types_generated", data, "Question types generated not found in response")
            self.assertIn("excluded_count", data, "Excluded count not found in response")
            
            # Verify total_questions matches length of questions array
            self.assertEqual(data.get("total_questions"), len(data.get("questions", [])), 
                            "Total questions should match length of questions array")
            
            # Verify question_types_generated is a list
            self.assertIsInstance(data.get("question_types_generated"), list, 
                                 "Question types generated should be a list")
            
            # Verify excluded_count is a number
            self.assertIsInstance(data.get("excluded_count"), int, 
                                 "Excluded count should be a number")
            
            print("✅ Enhanced API response structure test passed")
        except Exception as e:
            print(f"❌ Enhanced API response structure test failed: {str(e)}")
            self.fail(str(e))

    def test_09_question_type_validation(self):
        """Test question type validation"""
        print("\n🔍 Testing Question Type Validation...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Test with valid question types
        valid_payload = {
            "subject": Subject.MATH.value,
            "topics": ["Algebra"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "question_types": [QuestionType.MCQ.value, QuestionType.SHORT_ANSWER.value, 
                              QuestionType.NUMERICAL.value, QuestionType.LONG_ANSWER.value]
        }
        
        # Test with invalid question type
        invalid_payload = {
            "subject": Subject.MATH.value,
            "topics": ["Algebra"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "question_types": ["invalid_type"]
        }
        
        # Test with empty question types array
        empty_payload = {
            "subject": Subject.MATH.value,
            "topics": ["Algebra"],
            "difficulty": DifficultyLevel.MEDIUM.value,
            "question_count": 5,
            "question_types": []
        }
        
        try:
            # Test with valid question types
            valid_response = requests.post(url, json=valid_payload, headers=headers)
            self.assertEqual(valid_response.status_code, 200, 
                            "Failed to generate practice test with valid question types")
            
            # Test with invalid question type
            invalid_response = requests.post(url, json=invalid_payload, headers=headers)
            print(f"Invalid Question Type Response: {invalid_response.status_code}")
            # This could either return an error or ignore the invalid type
            if invalid_response.status_code == 200:
                print("API accepted invalid question type (might be ignoring it)")
                invalid_data = invalid_response.json()
                question_types_generated = invalid_data.get("question_types_generated", [])
                for qtype in question_types_generated:
                    self.assertIn(qtype, [qt.value for qt in QuestionType], 
                                 f"Generated question type should be valid, got {qtype}")
            else:
                print(f"API rejected invalid question type with status {invalid_response.status_code}")
            
            # Test with empty question types array
            empty_response = requests.post(url, json=empty_payload, headers=headers)
            self.assertEqual(empty_response.status_code, 200, 
                            "Failed to generate practice test with empty question types array")
            empty_data = empty_response.json()
            self.assertTrue(len(empty_data.get("question_types_generated", [])) > 0, 
                           "Should generate questions with default types when empty array provided")
            
            print("✅ Question type validation test passed")
        except Exception as e:
            print(f"❌ Question type validation test failed: {str(e)}")
            self.fail(str(e))

    def test_10_edge_case_all_questions_seen(self):
        """Test edge case: what happens when all questions for a topic have been seen"""
        print("\n🔍 Testing Edge Case: All Questions Seen...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/practice/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        # Use a very specific topic to increase chances of exhausting questions
        payload = {
            "subject": Subject.GEOGRAPHY.value,
            "topics": ["Maps of India"],
            "difficulty": DifficultyLevel.EASY.value,
            "question_count": 5,
            "exclude_seen": True
        }
        
        try:
            # Generate first test
            response1 = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response1.status_code, 200, "Failed to generate first practice test")
            data1 = response1.json()
            questions1 = data1.get("questions", [])
            
            # If we got fewer than requested, it might already be exhausted
            if len(questions1) < payload["question_count"]:
                print(f"First test returned only {len(questions1)} questions, might already be exhausted")
            
            # Generate second test with same parameters
            response2 = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response2.status_code, 200, "Failed to generate second practice test")
            data2 = response2.json()
            questions2 = data2.get("questions", [])
            
            # Generate third test with same parameters
            response3 = requests.post(url, json=payload, headers=headers)
            self.assertEqual(response3.status_code, 200, "Failed to generate third practice test")
            data3 = response3.json()
            questions3 = data3.get("questions", [])
            
            # Check if we're getting fewer questions in subsequent tests
            print(f"First test: {len(questions1)} questions")
            print(f"Second test: {len(questions2)} questions")
            print(f"Third test: {len(questions3)} questions")
            
            # If we get 0 questions in the third test, it means all questions have been seen
            if len(questions3) == 0:
                print("All questions have been seen, API returned 0 questions")
                self.assertEqual(data3.get("total_questions"), 0, "Total questions should be 0 when all questions have been seen")
                self.assertTrue(data3.get("excluded_count") > 0, "Excluded count should be > 0 when all questions have been seen")
            else:
                print("API still returning questions after multiple tests with same parameters")
                # This is also acceptable behavior if the API generates new questions each time
            
            print("✅ Edge case test passed")
        except Exception as e:
            print(f"❌ Edge case test failed: {str(e)}")
            self.fail(str(e))

if __name__ == "__main__":
    # Run the enhanced practice test system tests
    print("\n==== TESTING ENHANCED PRACTICE TEST SYSTEM ====\n")
    unittest.main()