#!/usr/bin/env python3
import requests
import json
import os
import uuid
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

def register_teacher():
    """Register a teacher and return the token"""
    print("\n🔍 Registering teacher...")
    url = f"{API_URL}/auth/register"
    email = f"teacher_test_{uuid.uuid4()}@example.com"
    payload = {
        "email": email,
        "password": "SecurePass123!",
        "name": "Test Teacher",
        "user_type": "teacher",
        "school_name": "Test School"
    }
    
    response = requests.post(url, json=payload)
    print(f"Registration response: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        teacher_id = data.get("user", {}).get("id")
        print(f"Registered teacher with ID: {teacher_id}")
        return token, teacher_id
    else:
        print(f"Failed to register teacher: {response.text}")
        return None, None

def register_student():
    """Register a student and return the token"""
    print("\n🔍 Registering student...")
    url = f"{API_URL}/auth/register"
    email = f"student_test_{uuid.uuid4()}@example.com"
    payload = {
        "email": email,
        "password": "SecurePass123!",
        "name": "Test Student",
        "user_type": "student",
        "grade_level": "10th"
    }
    
    response = requests.post(url, json=payload)
    print(f"Registration response: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        student_id = data.get("user", {}).get("id")
        print(f"Registered student with ID: {student_id}")
        return token, student_id
    else:
        print(f"Failed to register student: {response.text}")
        return None, None

def create_class(teacher_token):
    """Create a class and return the class ID and join code"""
    print("\n🔍 Creating class...")
    url = f"{API_URL}/teacher/classes"
    headers = {"Authorization": f"Bearer {teacher_token}"}
    payload = {
        "subject": "math",
        "class_name": "Test Math Class",
        "grade_level": "10th",
        "description": "Test class for analytics"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    print(f"Create class response: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        class_id = data.get("class_id")
        join_code = data.get("join_code")
        print(f"Created class with ID: {class_id} and join code: {join_code}")
        return class_id, join_code
    else:
        print(f"Failed to create class: {response.text}")
        return None, None

def join_class(student_token, join_code):
    """Join a student to a class"""
    print(f"\n🔍 Joining class with code: {join_code}...")
    url = f"{API_URL}/student/join-class"
    headers = {"Authorization": f"Bearer {student_token}"}
    payload = {"join_code": join_code}
    
    response = requests.post(url, json=payload, headers=headers)
    print(f"Join class response: {response.status_code}")
    
    if response.status_code == 200:
        print("Successfully joined class")
        return True
    else:
        print(f"Failed to join class: {response.text}")
        return False

def generate_practice_test(student_token):
    """Generate a practice test and return the test ID and questions"""
    print("\n🔍 Generating practice test...")
    url = f"{API_URL}/practice/generate"
    headers = {"Authorization": f"Bearer {student_token}"}
    payload = {
        "subject": "math",
        "topics": ["Algebra"],
        "difficulty": "medium",
        "question_count": 5
    }
    
    response = requests.post(url, json=payload, headers=headers)
    print(f"Generate test response: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        test_id = data.get("test_id")
        questions = data.get("questions", [])
        print(f"Generated test with ID: {test_id} and {len(questions)} questions")
        return test_id, questions
    else:
        print(f"Failed to generate test: {response.text}")
        return None, []

def submit_practice_test(student_token, test_id, questions, score_percentage=80):
    """Submit a practice test with a target score percentage"""
    print(f"\n🔍 Submitting practice test with target score: {score_percentage}%...")
    url = f"{API_URL}/practice/submit"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Create student answers to achieve target score
    student_answers = {}
    question_ids = []
    correct_count = int((score_percentage / 100) * len(questions))
    
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
    
    payload = {
        "test_id": test_id,
        "questions": question_ids,
        "student_answers": student_answers,
        "time_taken": 300  # 5 minutes
    }
    
    response = requests.post(url, json=payload, headers=headers)
    print(f"Submit test response: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        actual_score = data.get("score")
        print(f"Submitted test with actual score: {actual_score}%")
        return True
    else:
        print(f"Failed to submit test: {response.text}")
        return False

def test_teacher_analytics_endpoints(teacher_token, class_id, student_id):
    """Test the teacher analytics endpoints"""
    headers = {"Authorization": f"Bearer {teacher_token}"}
    
    # Test overview endpoint
    print("\n🔍 Testing Teacher Analytics Overview endpoint...")
    overview_url = f"{API_URL}/teacher/analytics/overview"
    overview_response = requests.get(overview_url, headers=headers)
    print(f"Overview response: {overview_response.status_code}")
    if overview_response.status_code == 200:
        overview_data = overview_response.json()
        print(f"Overview data: {json.dumps(overview_data, indent=2)[:500]}...")
    else:
        print(f"Overview error: {overview_response.text}")
    
    # Test test-results endpoint
    print("\n🔍 Testing Teacher Analytics Test Results endpoint...")
    results_url = f"{API_URL}/teacher/analytics/test-results"
    results_response = requests.get(results_url, headers=headers)
    print(f"Test results response: {results_response.status_code}")
    if results_response.status_code == 200:
        results_data = results_response.json()
        print(f"Test results data: {json.dumps(results_data, indent=2)[:500]}...")
    else:
        print(f"Test results error: {results_response.text}")
    
    # Test test-results with class filter
    print("\n🔍 Testing Teacher Analytics Test Results with class filter...")
    class_results_url = f"{API_URL}/teacher/analytics/test-results?class_id={class_id}"
    class_results_response = requests.get(class_results_url, headers=headers)
    print(f"Class test results response: {class_results_response.status_code}")
    if class_results_response.status_code == 200:
        class_results_data = class_results_response.json()
        print(f"Class test results data: {json.dumps(class_results_data, indent=2)[:500]}...")
    else:
        print(f"Class test results error: {class_results_response.text}")
    
    # Test test-results with student filter
    print("\n🔍 Testing Teacher Analytics Test Results with student filter...")
    student_results_url = f"{API_URL}/teacher/analytics/test-results?student_id={student_id}"
    student_results_response = requests.get(student_results_url, headers=headers)
    print(f"Student test results response: {student_results_response.status_code}")
    if student_results_response.status_code == 200:
        student_results_data = student_results_response.json()
        print(f"Student test results data: {json.dumps(student_results_data, indent=2)[:500]}...")
    else:
        print(f"Student test results error: {student_results_response.text}")
    
    # Test class-performance endpoint
    print("\n🔍 Testing Teacher Analytics Class Performance endpoint...")
    performance_url = f"{API_URL}/teacher/analytics/class-performance/{class_id}"
    performance_response = requests.get(performance_url, headers=headers)
    print(f"Class performance response: {performance_response.status_code}")
    if performance_response.status_code == 200:
        performance_data = performance_response.json()
        print(f"Class performance data: {json.dumps(performance_data, indent=2)[:500]}...")
    else:
        print(f"Class performance error: {performance_response.text}")

def main():
    """Main function to run the tests"""
    # Register teacher and student
    teacher_token, teacher_id = register_teacher()
    student_token, student_id = register_student()
    
    if not teacher_token or not student_token:
        print("Failed to register teacher or student")
        return
    
    # Create class
    class_id, join_code = create_class(teacher_token)
    if not class_id or not join_code:
        print("Failed to create class")
        return
    
    # Join student to class
    if not join_class(student_token, join_code):
        print("Failed to join class")
        return
    
    # Generate and submit practice tests
    for _ in range(3):  # Submit multiple tests
        test_id, questions = generate_practice_test(student_token)
        if test_id and questions:
            submit_practice_test(student_token, test_id, questions, score_percentage=80)
    
    # Test teacher analytics endpoints
    test_teacher_analytics_endpoints(teacher_token, class_id, student_id)

if __name__ == "__main__":
    main()