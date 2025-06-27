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

def test_analytics_endpoints():
    """Test the teacher analytics endpoints with a focus on the issue"""
    
    # Register teacher
    print("\n🔍 Registering teacher...")
    teacher_email = f"teacher_test_{uuid.uuid4()}@example.com"
    teacher_payload = {
        "email": teacher_email,
        "password": "SecurePass123!",
        "name": "Test Teacher",
        "user_type": "teacher",
        "school_name": "Test School"
    }
    
    teacher_response = requests.post(f"{API_URL}/auth/register", json=teacher_payload)
    if teacher_response.status_code != 200:
        print(f"Failed to register teacher: {teacher_response.text}")
        return
    
    teacher_data = teacher_response.json()
    teacher_token = teacher_data.get("access_token")
    teacher_id = teacher_data.get("user", {}).get("id")
    print(f"Registered teacher with ID: {teacher_id}")
    
    # Create class
    print("\n🔍 Creating class...")
    class_payload = {
        "subject": "math",
        "class_name": "Test Math Class",
        "grade_level": "10th",
        "description": "Test class for analytics"
    }
    
    class_response = requests.post(
        f"{API_URL}/teacher/classes", 
        json=class_payload, 
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    if class_response.status_code != 200:
        print(f"Failed to create class: {class_response.text}")
        return
    
    class_data = class_response.json()
    class_id = class_data.get("class_id")
    join_code = class_data.get("join_code")
    print(f"Created class with ID: {class_id} and join code: {join_code}")
    
    # Register student
    print("\n🔍 Registering student...")
    student_email = f"student_test_{uuid.uuid4()}@example.com"
    student_payload = {
        "email": student_email,
        "password": "SecurePass123!",
        "name": "Test Student",
        "user_type": "student",
        "grade_level": "10th"
    }
    
    student_response = requests.post(f"{API_URL}/auth/register", json=student_payload)
    if student_response.status_code != 200:
        print(f"Failed to register student: {student_response.text}")
        return
    
    student_data = student_response.json()
    student_token = student_data.get("access_token")
    student_id = student_data.get("user", {}).get("id")
    print(f"Registered student with ID: {student_id}")
    
    # Join class
    print("\n🔍 Joining class...")
    join_payload = {"join_code": join_code}
    join_response = requests.post(
        f"{API_URL}/student/join-class", 
        json=join_payload, 
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    if join_response.status_code != 200:
        print(f"Failed to join class: {join_response.text}")
        return
    
    print("Student successfully joined class")
    
    # Get student profile to check joined_classes
    print("\n🔍 Checking student profile...")
    profile_response = requests.get(
        f"{API_URL}/student/profile", 
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    if profile_response.status_code != 200:
        print(f"Failed to get student profile: {profile_response.text}")
        return
    
    profile_data = profile_response.json()
    joined_classes = profile_data.get("joined_classes", [])
    print(f"Student joined_classes: {joined_classes}")
    
    # Check if class_id field exists
    class_id_field = profile_data.get("class_id")
    print(f"Student class_id field: {class_id_field}")
    
    # Test class performance endpoint
    print("\n🔍 Testing class performance endpoint...")
    performance_response = requests.get(
        f"{API_URL}/teacher/analytics/class-performance/{class_id}", 
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    print(f"Class performance response: {performance_response.status_code}")
    if performance_response.status_code == 200:
        performance_data = performance_response.json()
        print(f"Class performance data: {json.dumps(performance_data, indent=2)}")
    else:
        print(f"Class performance error: {performance_response.text}")
    
    # Test test results endpoint with class filter
    print("\n🔍 Testing test results with class filter...")
    results_response = requests.get(
        f"{API_URL}/teacher/analytics/test-results?class_id={class_id}", 
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    
    print(f"Test results response: {results_response.status_code}")
    if results_response.status_code == 200:
        results_data = results_response.json()
        print(f"Test results data: {json.dumps(results_data, indent=2)}")
    else:
        print(f"Test results error: {results_response.text}")

if __name__ == "__main__":
    test_analytics_endpoints()