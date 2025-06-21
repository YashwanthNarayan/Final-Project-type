#!/usr/bin/env python3
import requests
import json
import uuid
from dotenv import load_dotenv
import os
import sys
import time
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

def generate_practice_test(student_token, subject, topics, difficulty="medium", question_count=5):
    """Generate a practice test"""
    url = f"{API_URL}/practice/generate"
    headers = {"Authorization": f"Bearer {student_token}"}
    payload = {
        "subject": subject,
        "topics": topics,
        "difficulty": difficulty,
        "question_count": question_count
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to generate practice test: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error generating practice test: {str(e)}")
        return None

def submit_practice_test(student_token, test_data, correct_percentage=100):
    """Submit a practice test with specified percentage of correct answers"""
    url = f"{API_URL}/practice/submit"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Get questions and create student answers
    questions = test_data.get("questions", [])
    question_ids = [q.get("id") for q in questions]
    
    # Determine how many answers should be correct
    correct_count = int(len(questions) * (correct_percentage / 100))
    
    # Create student answers
    student_answers = {}
    for i, question in enumerate(questions):
        if i < correct_count:
            # Use correct answer
            student_answers[question.get("id")] = question.get("correct_answer")
        else:
            # Use incorrect answer (just use a different value)
            if question.get("question_type") == "mcq" and question.get("options"):
                # For MCQ, use a different option
                options = question.get("options")
                correct = question.get("correct_answer")
                # Find an option that's not the correct answer
                for option in options:
                    if option != correct:
                        student_answers[question.get("id")] = option
                        break
                else:
                    # If all options are the same (unlikely), just use the correct answer
                    student_answers[question.get("id")] = correct
            else:
                # For other question types, just add "wrong" to the correct answer
                student_answers[question.get("id")] = question.get("correct_answer") + " (wrong)"
    
    payload = {
        "test_id": test_data.get("test_id"),
        "questions": question_ids,
        "student_answers": student_answers,
        "time_taken": 300  # 5 minutes
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to submit practice test: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error submitting practice test: {str(e)}")
        return None

def create_practice_test_attempts(student_token, count=3):
    """Create multiple practice test attempts for testing"""
    print(f"\n🔍 Creating {count} practice test attempts for testing...")
    
    # Define different subjects and topics to test
    test_configs = [
        {"subject": Subject.MATH.value, "topics": ["Algebra"], "difficulty": DifficultyLevel.MEDIUM.value},
        {"subject": Subject.PHYSICS.value, "topics": ["Mechanics"], "difficulty": DifficultyLevel.EASY.value},
        {"subject": Subject.CHEMISTRY.value, "topics": ["Organic Chemistry"], "difficulty": DifficultyLevel.HARD.value},
        {"subject": Subject.BIOLOGY.value, "topics": ["Cell Biology"], "difficulty": DifficultyLevel.MEDIUM.value},
        {"subject": Subject.ENGLISH.value, "topics": ["Grammar"], "difficulty": DifficultyLevel.EASY.value}
    ]
    
    results = []
    
    # Create practice test attempts with different configurations
    for i in range(min(count, len(test_configs))):
        config = test_configs[i]
        print(f"\nCreating practice test attempt #{i+1}: {config['subject']}")
        
        # Generate test
        test_data = generate_practice_test(
            student_token, 
            config["subject"], 
            config["topics"], 
            config["difficulty"]
        )
        
        if not test_data:
            print(f"❌ Failed to generate practice test for {config['subject']}")
            continue
        
        # Submit test with varying scores
        correct_percentage = 100 if i == 0 else (70 if i == 1 else 40)  # First test 100%, second 70%, third 40%
        submission_result = submit_practice_test(student_token, test_data, correct_percentage)
        
        if submission_result:
            print(f"✅ Successfully submitted practice test for {config['subject']} with score {submission_result.get('score')}%")
            results.append({
                "subject": config["subject"],
                "score": submission_result.get("score"),
                "correct_answers": submission_result.get("correct_answers"),
                "total_questions": submission_result.get("total_questions")
            })
        else:
            print(f"❌ Failed to submit practice test for {config['subject']}")
    
    return results

def test_practice_results_endpoint(student_token):
    """Test the /api/practice/results endpoint"""
    print("\n🔍 Testing /api/practice/results endpoint...")
    
    url = f"{API_URL}/practice/results"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Test without subject filter
    try:
        response = requests.get(url, headers=headers)
        print(f"Response status (no filter): {response.status_code}")
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ Successfully retrieved {len(results)} practice test results")
            
            # Verify the structure of the results
            if results:
                first_result = results[0]
                print("\nVerifying result structure:")
                
                # Check required fields
                required_fields = ["id", "subject", "score", "total_questions", "time_taken", 
                                  "completed_at", "difficulty", "question_results", 
                                  "correct_count", "incorrect_count"]
                
                missing_fields = [field for field in required_fields if field not in first_result]
                if missing_fields:
                    print(f"❌ Missing fields in result: {', '.join(missing_fields)}")
                else:
                    print("✅ All required fields are present in the result")
                
                # Check question_results structure
                if "question_results" in first_result:
                    question_results = first_result["question_results"]
                    if question_results:
                        first_question = question_results[0]
                        question_fields = ["question_id", "question_text", "question_type", 
                                          "student_answer", "correct_answer", "is_correct", 
                                          "explanation"]
                        
                        missing_question_fields = [field for field in question_fields if field not in first_question]
                        if missing_question_fields:
                            print(f"❌ Missing fields in question result: {', '.join(missing_question_fields)}")
                        else:
                            print("✅ All required fields are present in question results")
                            
                            # Print example question result
                            print("\nExample Question Result:")
                            print(f"Question: {first_question.get('question_text')}")
                            print(f"Student Answer: {first_question.get('student_answer')}")
                            print(f"Correct Answer: {first_question.get('correct_answer')}")
                            print(f"Is Correct: {first_question.get('is_correct')}")
                    else:
                        print("❌ Question results array is empty")
                else:
                    print("❌ No question_results field in the result")
                
                # Verify correct_count and incorrect_count
                correct_count = first_result.get("correct_count", 0)
                incorrect_count = first_result.get("incorrect_count", 0)
                total_questions = first_result.get("total_questions", 0)
                
                if correct_count + incorrect_count == total_questions:
                    print(f"✅ Counts are consistent: {correct_count} correct + {incorrect_count} incorrect = {total_questions} total")
                else:
                    print(f"❌ Counts are inconsistent: {correct_count} correct + {incorrect_count} incorrect ≠ {total_questions} total")
        else:
            print(f"❌ Failed to retrieve practice test results: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing practice results endpoint: {str(e)}")
    
    # Test with subject filter
    if len(results) > 0:
        subject_to_filter = results[0]["subject"]
        try:
            filter_url = f"{url}?subject={subject_to_filter}"
            filter_response = requests.get(filter_url, headers=headers)
            print(f"\nResponse status (filtered by {subject_to_filter}): {filter_response.status_code}")
            
            if filter_response.status_code == 200:
                filtered_results = filter_response.json()
                print(f"✅ Successfully retrieved {len(filtered_results)} filtered practice test results")
                
                # Verify all results have the correct subject
                all_correct_subject = all(result["subject"] == subject_to_filter for result in filtered_results)
                if all_correct_subject:
                    print(f"✅ All filtered results have the correct subject: {subject_to_filter}")
                else:
                    print(f"❌ Some filtered results have incorrect subject (expected {subject_to_filter})")
            else:
                print(f"❌ Failed to retrieve filtered practice test results: {filter_response.status_code}")
                print(f"Response: {filter_response.text}")
        except Exception as e:
            print(f"❌ Error testing practice results with filter: {str(e)}")
    
    # Test with invalid authentication
    try:
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        invalid_response = requests.get(url, headers=invalid_headers)
        print(f"\nResponse status (invalid token): {invalid_response.status_code}")
        
        if invalid_response.status_code == 401:
            print("✅ Authentication is properly enforced (got 401 Unauthorized)")
        else:
            print(f"❌ Expected 401 Unauthorized, got {invalid_response.status_code}")
    except Exception as e:
        print(f"❌ Error testing with invalid token: {str(e)}")
    
    return results

def test_practice_result_details_endpoint(student_token, results):
    """Test the /api/practice/results/{result_id}/details endpoint"""
    print("\n🔍 Testing /api/practice/results/{result_id}/details endpoint...")
    
    if not results:
        print("❌ No practice test results available to test details endpoint")
        return
    
    # Get the first result ID
    result_id = results[0]["id"]
    url = f"{API_URL}/practice/results/{result_id}/details"
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # Test with valid result ID
    try:
        response = requests.get(url, headers=headers)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result_details = response.json()
            print(f"✅ Successfully retrieved details for result ID: {result_id}")
            
            # Verify the structure of the result details
            print("\nVerifying result details structure:")
            
            # Check required fields
            required_fields = ["id", "subject", "score", "total_questions", "correct_count", 
                              "incorrect_count", "time_taken", "completed_at", "question_details"]
            
            missing_fields = [field for field in required_fields if field not in result_details]
            if missing_fields:
                print(f"❌ Missing fields in result details: {', '.join(missing_fields)}")
            else:
                print("✅ All required fields are present in the result details")
            
            # Check question_details structure
            if "question_details" in result_details:
                question_details = result_details["question_details"]
                if question_details:
                    first_question = question_details[0]
                    question_fields = ["question_id", "question_text", "question_type", 
                                      "student_answer", "correct_answer", "is_correct", 
                                      "explanation", "topics", "difficulty"]
                    
                    missing_question_fields = [field for field in question_fields if field not in first_question]
                    if missing_question_fields:
                        print(f"❌ Missing fields in question details: {', '.join(missing_question_fields)}")
                    else:
                        print("✅ All required fields are present in question details")
                        
                        # Print example question details
                        print("\nExample Question Details:")
                        print(f"Question: {first_question.get('question_text')}")
                        print(f"Student Answer: {first_question.get('student_answer')}")
                        print(f"Correct Answer: {first_question.get('correct_answer')}")
                        print(f"Is Correct: {first_question.get('is_correct')}")
                        print(f"Explanation: {first_question.get('explanation')[:100]}...")  # Truncate long explanations
                else:
                    print("❌ Question details array is empty")
            else:
                print("❌ No question_details field in the result")
        else:
            print(f"❌ Failed to retrieve practice test result details: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing practice result details endpoint: {str(e)}")
    
    # Test with invalid result ID
    invalid_id = str(uuid.uuid4())
    invalid_url = f"{API_URL}/practice/results/{invalid_id}/details"
    
    try:
        invalid_response = requests.get(invalid_url, headers=headers)
        print(f"\nResponse status (invalid result ID): {invalid_response.status_code}")
        
        if invalid_response.status_code == 404:
            print("✅ Properly returns 404 for non-existent result ID")
        else:
            print(f"❌ Expected 404 Not Found, got {invalid_response.status_code}")
            print(f"Response: {invalid_response.text}")
    except Exception as e:
        print(f"❌ Error testing with invalid result ID: {str(e)}")
    
    # Test with invalid authentication
    try:
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        invalid_auth_response = requests.get(url, headers=invalid_headers)
        print(f"\nResponse status (invalid token): {invalid_auth_response.status_code}")
        
        if invalid_auth_response.status_code == 401:
            print("✅ Authentication is properly enforced (got 401 Unauthorized)")
        else:
            print(f"❌ Expected 401 Unauthorized, got {invalid_auth_response.status_code}")
    except Exception as e:
        print(f"❌ Error testing with invalid token: {str(e)}")

def test_empty_results(student_token):
    """Test the practice results endpoints with a new student who has no results"""
    print("\n🔍 Testing practice results endpoints with empty results...")
    
    # Register a new student who won't have any practice test results
    new_student_token, new_student_id, new_email = register_student()
    if not new_student_token:
        print("❌ Failed to register new student for empty results test")
        return
    
    # Test /api/practice/results endpoint
    url = f"{API_URL}/practice/results"
    headers = {"Authorization": f"Bearer {new_student_token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Response status (empty results): {response.status_code}")
        
        if response.status_code == 200:
            results = response.json()
            if len(results) == 0:
                print("✅ Correctly returns empty array for student with no practice tests")
            else:
                print(f"❌ Expected empty array, got {len(results)} results")
        else:
            print(f"❌ Failed to retrieve empty practice test results: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing empty practice results: {str(e)}")
    
    # Test /api/practice/stats/{subject} endpoint with a student who has no results
    stats_url = f"{API_URL}/practice/stats/math"
    
    try:
        stats_response = requests.get(stats_url, headers=headers)
        print(f"\nResponse status (empty stats): {stats_response.status_code}")
        
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print("✅ Stats endpoint handles empty results correctly")
            
            # Verify the structure has appropriate zero values
            if stats.get("total_tests") == 0 and stats.get("average_score") == 0:
                print("✅ Stats correctly show zero values for student with no practice tests")
            else:
                print(f"❌ Expected zero values, got: {json.dumps(stats)}")
        else:
            print(f"❌ Failed to retrieve empty practice test stats: {stats_response.status_code}")
            print(f"Response: {stats_response.text}")
    except Exception as e:
        print(f"❌ Error testing empty practice stats: {str(e)}")

if __name__ == "__main__":
    print("\n==== TESTING ENHANCED PRACTICE TEST RESULTS API ENDPOINTS ====\n")
    
    # Register a student
    student_token, student_id, email = register_student()
    if not student_token:
        print("Failed to register student, cannot proceed with tests")
        sys.exit(1)
    
    # Create practice test attempts
    create_practice_test_attempts(student_token)
    
    # Wait a moment for the database to update
    print("\nWaiting for database to update...")
    time.sleep(2)
    
    # Test the practice results endpoint
    results = test_practice_results_endpoint(student_token)
    
    # Test the practice result details endpoint
    if results:
        test_practice_result_details_endpoint(student_token, results)
    
    # Test with empty results
    test_empty_results(student_token)
    
    print("\n==== PRACTICE TEST RESULTS API TESTING COMPLETE ====\n")