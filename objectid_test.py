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
class Subject(str, Enum):
    MATH = "math"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"

class UserType(str, Enum):
    STUDENT = "student"

class GradeLevel(str, Enum):
    GRADE_10 = "10th"

class TestObjectIdSerialization(unittest.TestCase):
    """Test cases specifically for the ObjectId serialization issue"""

    def setUp(self):
        """Set up test case - create student account and generate test notes"""
        self.student_token = None
        self.student_id = None
        self.note_ids = []
        
        # Register student
        self.register_student()
        
        # Generate test notes if student registration was successful
        if self.student_token:
            self.generate_test_notes()

    def register_student(self):
        """Register a student for testing"""
        print("\n🔍 Setting up student account...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"student_objectid_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Aditya Patel",
            "user_type": UserType.STUDENT.value,
            "grade_level": GradeLevel.GRADE_10.value
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                self.student_token = data.get("access_token")
                self.student_id = data.get("user", {}).get("id")
                print(f"✅ Registered student with ID: {self.student_id}")
            else:
                print(f"❌ Failed to register student: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error registering student: {str(e)}")

    def generate_test_notes(self):
        """Generate test notes for different subjects"""
        if not self.student_token:
            return
            
        subjects = [Subject.MATH, Subject.PHYSICS, Subject.CHEMISTRY]
        topics = ["Algebra", "Mechanics", "Periodic Table"]
        
        print("\n🔍 Generating test notes...")
        
        for i, subject in enumerate(subjects):
            url = f"{API_URL}/notes/generate"
            headers = {"Authorization": f"Bearer {self.student_token}"}
            payload = {
                "subject": subject.value,
                "topic": topics[i],
                "note_type": "comprehensive"
            }
            
            try:
                response = requests.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    note_id = data.get("note_id")
                    self.note_ids.append(note_id)
                    print(f"✅ Generated notes for {payload['subject']} - {payload['topic']} with ID: {note_id}")
                else:
                    print(f"❌ Failed to generate notes: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"❌ Error generating notes: {str(e)}")

    def test_01_get_all_notes_objectid_serialization(self):
        """Test retrieving all notes to verify ObjectId serialization"""
        print("\n🔍 Testing GET /api/notes endpoint for ObjectId serialization...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Get All Notes Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get all notes")
            data = response.json()
            
            self.assertIsInstance(data, list, "Response should be a list")
            print(f"Retrieved {len(data)} notes")
            
            if len(data) > 0:
                # Check for ObjectId serialization in each note
                for note in data:
                    # Check that _id field is properly serialized (if present)
                    if "_id" in note:
                        self.assertIsInstance(note["_id"], str, "ObjectId _id should be serialized to string")
                    
                    # Check that id field is a string
                    self.assertIsInstance(note["id"], str, "Note ID should be a string")
                    
                    # Check for any nested ObjectIds
                    self.check_nested_objectids(note)
                
                print("✅ All ObjectIds are properly serialized to strings")
            
            print("✅ ObjectId serialization test passed")
            return data
        except Exception as e:
            print(f"❌ ObjectId serialization test failed: {str(e)}")
            self.fail(f"ObjectId serialization test failed: {str(e)}")
            return None

    def test_02_get_note_details_objectid_serialization(self):
        """Test retrieving a specific note to verify ObjectId serialization"""
        print("\n🔍 Testing GET /api/notes/{note_id} endpoint for ObjectId serialization...")
        
        if not self.student_token or not self.note_ids:
            self.skipTest("Student token or note IDs not available")
        
        note_id = self.note_ids[0]
        url = f"{API_URL}/notes/{note_id}"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Get Note Details Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get note details")
            data = response.json()
            
            # Check for ObjectId serialization
            if "_id" in data:
                self.assertIsInstance(data["_id"], str, "ObjectId _id should be serialized to string")
            
            self.assertIsInstance(data["id"], str, "Note ID should be a string")
            
            # Check for any nested ObjectIds
            self.check_nested_objectids(data)
            
            print("✅ All ObjectIds in note details are properly serialized to strings")
            print("✅ ObjectId serialization in note details test passed")
        except Exception as e:
            print(f"❌ ObjectId serialization in note details test failed: {str(e)}")
            self.fail(f"ObjectId serialization in note details test failed: {str(e)}")

    def check_nested_objectids(self, obj):
        """Recursively check for any ObjectId-like fields in the object"""
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == "_id" or key.endswith("_id"):
                    self.assertIsInstance(value, str, f"ObjectId field {key} should be serialized to string")
                self.check_nested_objectids(value)
        elif isinstance(obj, list):
            for item in obj:
                self.check_nested_objectids(item)

if __name__ == "__main__":
    print("\n==== TESTING OBJECTID SERIALIZATION FIX ====\n")
    unittest.main()