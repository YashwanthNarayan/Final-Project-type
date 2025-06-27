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

class QuestionType(str, Enum):
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    NUMERICAL = "numerical"

class TestTeacherAnalyticsAPI(unittest.TestCase):
    """Test cases for Teacher Analytics API endpoints"""

    def setUp(self):
        """Set up test case - create teacher, students, classes, and test data"""
        self.teacher_token = None
        self.teacher_id = None
        self.student_tokens = []
        self.student_ids = []
        self.class_ids = []
        self.join_codes = []
        self.test_ids = []
        
        # Register teacher
        self.register_teacher()
        
        # Register multiple students
        for i in range(3):
            self.register_student(f"Student {i+1}")
        
        # Create multiple classes
        self.create_class(Subject.MATH.value, "Mathematics Class", GradeLevel.GRADE_10.value)
        self.create_class(Subject.PHYSICS.value, "Physics Class", GradeLevel.GRADE_11.value)
        
        # Join students to classes
        self.join_students_to_classes()
        
        # Generate practice tests and submit results
        self.generate_and_submit_practice_tests()

    def register_teacher(self):
        """Register a teacher for testing"""
        print("\n🔍 Setting up teacher account...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"teacher_analytics_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Priya Sharma",
            "user_type": UserType.TEACHER.value,
            "school_name": "Delhi Public School"
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                self.teacher_token = data.get("access_token")
                self.teacher_id = data.get("user", {}).get("id")
                print(f"Registered teacher with ID: {self.teacher_id}")
            else:
                print(f"Failed to register teacher: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error registering teacher: {str(e)}")

    def register_student(self, name):
        """Register a student for testing"""
        print(f"\n🔍 Setting up student account: {name}...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"student_analytics_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": name,
            "user_type": UserType.STUDENT.value,
            "grade_level": GradeLevel.GRADE_10.value
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                self.student_tokens.append(data.get("access_token"))
                self.student_ids.append(data.get("user", {}).get("id"))
                print(f"Registered student with ID: {self.student_ids[-1]}")
            else:
                print(f"Failed to register student: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error registering student: {str(e)}")

    def create_class(self, subject, class_name, grade_level):
        """Create a class for testing"""
        print(f"\n🔍 Creating class: {class_name}...")
        url = f"{API_URL}/teacher/classes"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        payload = {
            "subject": subject,
            "class_name": class_name,
            "grade_level": grade_level,
            "description": f"Test class for {subject}"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.class_ids.append(data.get("class_id"))
                self.join_codes.append(data.get("join_code"))
                print(f"Created class with ID: {self.class_ids[-1]} and join code: {self.join_codes[-1]}")
            else:
                print(f"Failed to create class: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error creating class: {str(e)}")

    def join_students_to_classes(self):
        """Join students to classes"""
        print("\n🔍 Joining students to classes...")
        
        # Join each student to each class
        for i, student_token in enumerate(self.student_tokens):
            for j, join_code in enumerate(self.join_codes):
                url = f"{API_URL}/student/join-class"
                headers = {"Authorization": f"Bearer {student_token}"}
                payload = {"join_code": join_code}
                
                try:
                    response = requests.post(url, json=payload, headers=headers)
                    if response.status_code == 200:
                        print(f"Student {i+1} joined class with join code: {join_code}")
                    else:
                        print(f"Failed to join class: {response.status_code} - {response.text}")
                except Exception as e:
                    print(f"Error joining class: {str(e)}")

    def generate_and_submit_practice_tests(self):
        """Generate practice tests and submit results for each student"""
        print("\n🔍 Generating and submitting practice tests...")
        
        # For each student
        for i, student_token in enumerate(self.student_tokens):
            # Generate and submit multiple tests with different scores
            self.generate_and_submit_test(student_token, Subject.MATH.value, ["Algebra"], DifficultyLevel.EASY.value, 90)
            self.generate_and_submit_test(student_token, Subject.MATH.value, ["Geometry"], DifficultyLevel.MEDIUM.value, 75)
            self.generate_and_submit_test(student_token, Subject.PHYSICS.value, ["Mechanics"], DifficultyLevel.HARD.value, 60)
            
            # Add a test with lower score for some students to test struggling topics
            if i == 1:  # Second student struggles more
                self.generate_and_submit_test(student_token, Subject.MATH.value, ["Calculus"], DifficultyLevel.HARD.value, 40)
                self.generate_and_submit_test(student_token, Subject.PHYSICS.value, ["Thermodynamics"], DifficultyLevel.MEDIUM.value, 50)

    def generate_and_submit_test(self, student_token, subject, topics, difficulty, target_score):
        """Generate a practice test and submit with a specific score"""
        headers = {"Authorization": f"Bearer {student_token}"}
        
        # Generate test
        gen_url = f"{API_URL}/practice/generate"
        gen_payload = {
            "subject": subject,
            "topics": topics,
            "difficulty": difficulty,
            "question_count": 5
        }
        
        try:
            gen_response = requests.post(gen_url, json=gen_payload, headers=headers)
            if gen_response.status_code != 200:
                print(f"Failed to generate test: {gen_response.status_code} - {gen_response.text}")
                return
            
            gen_data = gen_response.json()
            test_id = gen_data.get("test_id")
            questions = gen_data.get("questions", [])
            
            if not questions:
                print("No questions generated")
                return
            
            # Create student answers to achieve target score
            student_answers = {}
            question_ids = []
            correct_count = int((target_score / 100) * len(questions))
            
            for i, question in enumerate(questions):
                question_id = question.get("id")
                question_ids.append(question_id)
                
                # Make some answers correct and some incorrect to achieve target score
                if i < correct_count:
                    student_answers[question_id] = question.get("correct_answer")
                else:
                    # Provide an incorrect answer
                    if question.get("question_type") == "mcq" and question.get("options"):
                        # For MCQ, choose a different option
                        options = question.get("options")
                        correct = question.get("correct_answer")
                        incorrect = next((opt for opt in options if opt != correct), options[0])
                        student_answers[question_id] = incorrect
                    else:
                        # For other types, just provide a wrong answer
                        student_answers[question_id] = "Wrong answer"
            
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
                self.test_ids.append(test_id)
                print(f"Submitted test with ID: {test_id} and score: {target_score}%")
            else:
                print(f"Failed to submit test: {submit_response.status_code} - {submit_response.text}")
        except Exception as e:
            print(f"Error in test generation/submission: {str(e)}")

    def test_01_detailed_test_results_no_filters(self):
        """Test detailed test results endpoint with no filters"""
        print("\n🔍 Testing Detailed Test Results API (No Filters)...")
        
        if not self.teacher_token:
            self.skipTest("Teacher token not available")
        
        url = f"{API_URL}/teacher/analytics/test-results"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Detailed Test Results Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get detailed test results")
            data = response.json()
            
            # Verify the structure of the response
            self.assertIn("test_results", data, "Test results not found in response")
            self.assertIn("total_results", data, "Total results not found in response")
            self.assertIn("filters_applied", data, "Filters applied not found in response")
            
            test_results = data.get("test_results", [])
            print(f"Retrieved {len(test_results)} test results")
            
            # Verify we have results
            self.assertTrue(len(test_results) > 0, "Should have at least one test result")
            
            # Verify the structure of a test result
            if test_results:
                result = test_results[0]
                self.assertIn("attempt_id", result, "Attempt ID not found in result")
                self.assertIn("student_id", result, "Student ID not found in result")
                self.assertIn("student_name", result, "Student name not found in result")
                self.assertIn("subject", result, "Subject not found in result")
                self.assertIn("score", result, "Score not found in result")
                self.assertIn("question_analysis", result, "Question analysis not found in result")
                
                # Verify question-level analysis
                question_analysis = result.get("question_analysis", [])
                self.assertTrue(len(question_analysis) > 0, "Should have question-level analysis")
                
                if question_analysis:
                    question = question_analysis[0]
                    self.assertIn("question_id", question, "Question ID not found in analysis")
                    self.assertIn("question_text", question, "Question text not found in analysis")
                    self.assertIn("is_correct", question, "Correctness not found in analysis")
                    self.assertIn("student_answer", question, "Student answer not found in analysis")
                    self.assertIn("correct_answer", question, "Correct answer not found in analysis")
            
            print("✅ Detailed test results (no filters) test passed")
        except Exception as e:
            print(f"❌ Detailed test results test failed: {str(e)}")
            self.fail(str(e))

    def test_02_detailed_test_results_with_class_filter(self):
        """Test detailed test results endpoint with class filter"""
        print("\n🔍 Testing Detailed Test Results API (Class Filter)...")
        
        if not self.teacher_token or not self.class_ids:
            self.skipTest("Teacher token or class ID not available")
        
        url = f"{API_URL}/teacher/analytics/test-results?class_id={self.class_ids[0]}"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Detailed Test Results (Class Filter) Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get detailed test results with class filter")
            data = response.json()
            
            # Verify the filters were applied
            filters = data.get("filters_applied", {})
            self.assertEqual(filters.get("class_id"), self.class_ids[0], "Class ID filter not applied correctly")
            
            print(f"Retrieved {len(data.get('test_results', []))} test results for class {self.class_ids[0]}")
            print("✅ Detailed test results (class filter) test passed")
        except Exception as e:
            print(f"❌ Detailed test results (class filter) test failed: {str(e)}")
            self.fail(str(e))

    def test_03_detailed_test_results_with_student_filter(self):
        """Test detailed test results endpoint with student filter"""
        print("\n🔍 Testing Detailed Test Results API (Student Filter)...")
        
        if not self.teacher_token or not self.student_ids:
            self.skipTest("Teacher token or student ID not available")
        
        url = f"{API_URL}/teacher/analytics/test-results?student_id={self.student_ids[0]}"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Detailed Test Results (Student Filter) Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get detailed test results with student filter")
            data = response.json()
            
            # Verify the filters were applied
            filters = data.get("filters_applied", {})
            self.assertEqual(filters.get("student_id"), self.student_ids[0], "Student ID filter not applied correctly")
            
            # Verify all results are for the specified student
            test_results = data.get("test_results", [])
            for result in test_results:
                self.assertEqual(result.get("student_id"), self.student_ids[0], 
                                "Result contains data for a different student")
            
            print(f"Retrieved {len(test_results)} test results for student {self.student_ids[0]}")
            print("✅ Detailed test results (student filter) test passed")
        except Exception as e:
            print(f"❌ Detailed test results (student filter) test failed: {str(e)}")
            self.fail(str(e))

    def test_04_detailed_test_results_with_subject_filter(self):
        """Test detailed test results endpoint with subject filter"""
        print("\n🔍 Testing Detailed Test Results API (Subject Filter)...")
        
        if not self.teacher_token:
            self.skipTest("Teacher token not available")
        
        url = f"{API_URL}/teacher/analytics/test-results?subject={Subject.MATH.value}"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Detailed Test Results (Subject Filter) Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get detailed test results with subject filter")
            data = response.json()
            
            # Verify the filters were applied
            filters = data.get("filters_applied", {})
            self.assertEqual(filters.get("subject"), Subject.MATH.value, "Subject filter not applied correctly")
            
            # Verify all results are for the specified subject
            test_results = data.get("test_results", [])
            for result in test_results:
                self.assertEqual(result.get("subject"), Subject.MATH.value, 
                                "Result contains data for a different subject")
            
            print(f"Retrieved {len(test_results)} test results for subject {Subject.MATH.value}")
            print("✅ Detailed test results (subject filter) test passed")
        except Exception as e:
            print(f"❌ Detailed test results (subject filter) test failed: {str(e)}")
            self.fail(str(e))

    def test_05_detailed_test_results_with_combined_filters(self):
        """Test detailed test results endpoint with combined filters"""
        print("\n🔍 Testing Detailed Test Results API (Combined Filters)...")
        
        if not self.teacher_token or not self.class_ids or not self.student_ids:
            self.skipTest("Teacher token, class ID, or student ID not available")
        
        url = f"{API_URL}/teacher/analytics/test-results?class_id={self.class_ids[0]}&subject={Subject.MATH.value}"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Detailed Test Results (Combined Filters) Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get detailed test results with combined filters")
            data = response.json()
            
            # Verify the filters were applied
            filters = data.get("filters_applied", {})
            self.assertEqual(filters.get("class_id"), self.class_ids[0], "Class ID filter not applied correctly")
            self.assertEqual(filters.get("subject"), Subject.MATH.value, "Subject filter not applied correctly")
            
            # Verify all results match the filters
            test_results = data.get("test_results", [])
            for result in test_results:
                self.assertEqual(result.get("subject"), Subject.MATH.value, 
                                "Result contains data for a different subject")
            
            print(f"Retrieved {len(test_results)} test results for class {self.class_ids[0]} and subject {Subject.MATH.value}")
            print("✅ Detailed test results (combined filters) test passed")
        except Exception as e:
            print(f"❌ Detailed test results (combined filters) test failed: {str(e)}")
            self.fail(str(e))

    def test_06_class_performance_analysis(self):
        """Test class performance analysis endpoint"""
        print("\n🔍 Testing Class Performance Analysis API...")
        
        if not self.teacher_token or not self.class_ids:
            self.skipTest("Teacher token or class ID not available")
        
        url = f"{API_URL}/teacher/analytics/class-performance/{self.class_ids[0]}"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Class Performance Analysis Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get class performance analysis")
            data = response.json()
            
            # Verify the structure of the response
            self.assertIn("class_info", data, "Class info not found in response")
            self.assertIn("student_count", data, "Student count not found in response")
            self.assertIn("performance_summary", data, "Performance summary not found in response")
            self.assertIn("subject_analysis", data, "Subject analysis not found in response")
            self.assertIn("struggling_topics", data, "Struggling topics not found in response")
            self.assertIn("top_performers", data, "Top performers not found in response")
            self.assertIn("students_needing_help", data, "Students needing help not found in response")
            
            # Verify class info
            class_info = data.get("class_info", {})
            self.assertEqual(class_info.get("class_id"), self.class_ids[0], "Class ID mismatch")
            
            # Verify performance summary
            performance_summary = data.get("performance_summary", {})
            self.assertIn("total_tests", performance_summary, "Total tests not found in performance summary")
            self.assertIn("average_score", performance_summary, "Average score not found in performance summary")
            self.assertIn("highest_score", performance_summary, "Highest score not found in performance summary")
            self.assertIn("lowest_score", performance_summary, "Lowest score not found in performance summary")
            
            print(f"Class has {data.get('student_count')} students and {performance_summary.get('total_tests')} tests")
            print(f"Average score: {performance_summary.get('average_score'):.2f}%")
            print("✅ Class performance analysis test passed")
        except Exception as e:
            print(f"❌ Class performance analysis test failed: {str(e)}")
            self.fail(str(e))

    def test_07_class_performance_invalid_class(self):
        """Test class performance analysis with invalid class ID"""
        print("\n🔍 Testing Class Performance Analysis API (Invalid Class)...")
        
        if not self.teacher_token:
            self.skipTest("Teacher token not available")
        
        invalid_class_id = str(uuid.uuid4())
        url = f"{API_URL}/teacher/analytics/class-performance/{invalid_class_id}"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Class Performance Analysis (Invalid Class) Response: {response.status_code}")
            
            # Should return 403 for invalid class ID
            self.assertEqual(response.status_code, 403, "Should return 403 for invalid class ID")
            
            print("✅ Class performance analysis (invalid class) test passed")
        except Exception as e:
            print(f"❌ Class performance analysis (invalid class) test failed: {str(e)}")
            self.fail(str(e))

    def test_08_enhanced_overview_analytics(self):
        """Test enhanced overview analytics endpoint"""
        print("\n🔍 Testing Enhanced Overview Analytics API...")
        
        if not self.teacher_token:
            self.skipTest("Teacher token not available")
        
        url = f"{API_URL}/teacher/analytics/overview"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Enhanced Overview Analytics Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get enhanced overview analytics")
            data = response.json()
            
            # Verify the structure of the response
            self.assertIn("overview_metrics", data, "Overview metrics not found in response")
            self.assertIn("class_summary", data, "Class summary not found in response")
            self.assertIn("subject_distribution", data, "Subject distribution not found in response")
            
            # Verify overview metrics
            metrics = data.get("overview_metrics", {})
            self.assertIn("total_classes", metrics, "Total classes not found in metrics")
            self.assertIn("total_students", metrics, "Total students not found in metrics")
            self.assertIn("total_messages", metrics, "Total messages not found in metrics")
            self.assertIn("total_tests", metrics, "Total tests not found in metrics")
            self.assertIn("average_score", metrics, "Average score not found in metrics")
            
            # Verify class summary
            class_summary = data.get("class_summary", [])
            self.assertEqual(len(class_summary), len(self.class_ids), "Class summary count mismatch")
            
            if class_summary:
                first_class = class_summary[0]
                self.assertIn("class_info", first_class, "Class info not found in class summary")
                self.assertIn("student_count", first_class, "Student count not found in class summary")
                self.assertIn("average_xp", first_class, "Average XP not found in class summary")
                self.assertIn("average_score", first_class, "Average score not found in class summary")
            
            print(f"Teacher has {metrics.get('total_classes')} classes with {metrics.get('total_students')} students")
            print(f"Students have taken {metrics.get('total_tests')} tests with average score {metrics.get('average_score'):.2f}%")
            print("✅ Enhanced overview analytics test passed")
        except Exception as e:
            print(f"❌ Enhanced overview analytics test failed: {str(e)}")
            self.fail(str(e))

    def test_09_authorization_student_access_denied(self):
        """Test that students cannot access teacher analytics endpoints"""
        print("\n🔍 Testing Authorization (Student Access Denied)...")
        
        if not self.student_tokens:
            self.skipTest("Student token not available")
        
        student_token = self.student_tokens[0]
        headers = {"Authorization": f"Bearer {student_token}"}
        
        endpoints = [
            f"{API_URL}/teacher/analytics/overview",
            f"{API_URL}/teacher/analytics/test-results",
            f"{API_URL}/teacher/analytics/class-performance/{self.class_ids[0] if self.class_ids else 'test'}"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(endpoint, headers=headers)
                print(f"Student Access to {endpoint}: {response.status_code}")
                
                # Should return 403 for student access
                self.assertEqual(response.status_code, 403, f"Student should be denied access to {endpoint}")
            except Exception as e:
                print(f"❌ Authorization test failed for {endpoint}: {str(e)}")
                self.fail(str(e))
        
        print("✅ Authorization (student access denied) test passed")

    def test_10_data_isolation_other_teacher(self):
        """Test that teachers cannot access other teachers' data"""
        print("\n🔍 Testing Data Isolation (Other Teacher)...")
        
        # Register another teacher
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"teacher_other_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Another Teacher",
            "user_type": UserType.TEACHER.value,
            "school_name": "Another School"
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code != 200:
                self.skipTest("Failed to register another teacher")
            
            other_teacher_token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {other_teacher_token}"}
            
            # Try to access first teacher's class
            if self.class_ids:
                class_url = f"{API_URL}/teacher/analytics/class-performance/{self.class_ids[0]}"
                class_response = requests.get(class_url, headers=headers)
                print(f"Other Teacher Access to Class: {class_response.status_code}")
                
                # Should return 403 for other teacher access
                self.assertEqual(class_response.status_code, 403, "Other teacher should be denied access to class")
            
            print("✅ Data isolation (other teacher) test passed")
        except Exception as e:
            print(f"❌ Data isolation test failed: {str(e)}")
            self.fail(str(e))

    def test_11_edge_case_empty_class(self):
        """Test analytics for a class with no students"""
        print("\n🔍 Testing Edge Case (Empty Class)...")
        
        if not self.teacher_token:
            self.skipTest("Teacher token not available")
        
        # Create an empty class
        url = f"{API_URL}/teacher/classes"
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        payload = {
            "subject": Subject.ENGLISH.value,
            "class_name": "Empty Class",
            "grade_level": GradeLevel.GRADE_9.value,
            "description": "Test class with no students"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                self.skipTest("Failed to create empty class")
            
            empty_class_id = response.json().get("class_id")
            
            # Test class performance for empty class
            perf_url = f"{API_URL}/teacher/analytics/class-performance/{empty_class_id}"
            perf_response = requests.get(perf_url, headers=headers)
            print(f"Empty Class Performance Response: {perf_response.status_code}")
            
            self.assertEqual(perf_response.status_code, 200, "Should handle empty class gracefully")
            
            data = perf_response.json()
            self.assertEqual(data.get("student_count"), 0, "Empty class should have 0 students")
            
            # Verify empty performance data
            performance_summary = data.get("performance_summary", {})
            self.assertEqual(performance_summary.get("total_tests", -1), 0, "Empty class should have 0 tests")
            
            print("✅ Edge case (empty class) test passed")
        except Exception as e:
            print(f"❌ Edge case (empty class) test failed: {str(e)}")
            self.fail(str(e))

if __name__ == "__main__":
    # Run the Teacher Analytics API tests
    print("\n==== TESTING TEACHER ANALYTICS API ====\n")
    unittest.main(argv=['first-arg-is-ignored'], exit=False)