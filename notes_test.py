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

class UserType(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"

class GradeLevel(str, Enum):
    GRADE_6 = "6th"
    GRADE_7 = "7th" 
    GRADE_8 = "8th"
    GRADE_9 = "9th"
    GRADE_10 = "10th"
    GRADE_11 = "11th"
    GRADE_12 = "12th"

class TestNotesGenerationSystem(unittest.TestCase):
    """Test cases for Notes Generation System"""

    def setUp(self):
        """Set up test case - create student account"""
        self.student_token = None
        self.student_id = None
        self.note_ids = []
        
        # Register student
        self.register_student()

    def register_student(self):
        """Register a student for testing"""
        print("\n🔍 Setting up student account...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"student_notes_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Priya Sharma",
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

    def test_01_generate_notes_math(self):
        """Test generating notes for math subject"""
        print("\n🔍 Testing Notes Generation for Math...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.MATH.value,
            "topic": "Quadratic Equations",
            "note_type": "comprehensive"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Generate Math Notes Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate math notes")
            data = response.json()
            
            self.assertIn("note_id", data, "Note ID not found in response")
            self.assertIn("content", data, "Content not found in response")
            self.assertEqual(data.get("subject"), Subject.MATH.value, "Subject mismatch")
            self.assertEqual(data.get("topic"), "Quadratic Equations", "Topic mismatch")
            
            # Store note ID for later tests
            self.note_ids.append(data.get("note_id"))
            
            # Check content quality
            content = data.get("content", "")
            self.assertTrue(len(content) > 100, "Notes content is too short")
            self.assertIn("Quadratic", content, "Content doesn't seem to be about Quadratic Equations")
            
            print(f"Generated math notes with ID: {data.get('note_id')}")
            print(f"Content preview: {content[:100]}...")
            print("✅ Math notes generation test passed")
        except Exception as e:
            print(f"❌ Math notes generation test failed: {str(e)}")
            raise

    def test_02_generate_notes_physics(self):
        """Test generating notes for physics subject"""
        print("\n🔍 Testing Notes Generation for Physics...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.PHYSICS.value,
            "topic": "Newton's Laws of Motion",
            "note_type": "summary"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Generate Physics Notes Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate physics notes")
            data = response.json()
            
            self.assertIn("note_id", data, "Note ID not found in response")
            self.assertIn("content", data, "Content not found in response")
            self.assertEqual(data.get("subject"), Subject.PHYSICS.value, "Subject mismatch")
            self.assertEqual(data.get("topic"), "Newton's Laws of Motion", "Topic mismatch")
            
            # Store note ID for later tests
            self.note_ids.append(data.get("note_id"))
            
            # Check content quality
            content = data.get("content", "")
            self.assertTrue(len(content) > 100, "Notes content is too short")
            self.assertIn("Newton", content, "Content doesn't seem to be about Newton's Laws")
            
            print(f"Generated physics notes with ID: {data.get('note_id')}")
            print(f"Content preview: {content[:100]}...")
            print("✅ Physics notes generation test passed")
        except Exception as e:
            print(f"❌ Physics notes generation test failed: {str(e)}")
            raise

    def test_03_generate_notes_chemistry(self):
        """Test generating notes for chemistry subject with quick reference type"""
        print("\n🔍 Testing Notes Generation for Chemistry (Quick Reference)...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.CHEMISTRY.value,
            "topic": "Periodic Table",
            "note_type": "quick_reference"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Generate Chemistry Notes Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to generate chemistry notes")
            data = response.json()
            
            self.assertIn("note_id", data, "Note ID not found in response")
            self.assertIn("content", data, "Content not found in response")
            self.assertEqual(data.get("subject"), Subject.CHEMISTRY.value, "Subject mismatch")
            self.assertEqual(data.get("topic"), "Periodic Table", "Topic mismatch")
            
            # Store note ID for later tests
            self.note_ids.append(data.get("note_id"))
            
            # Check content quality
            content = data.get("content", "")
            self.assertTrue(len(content) > 100, "Notes content is too short")
            self.assertIn("Periodic", content, "Content doesn't seem to be about Periodic Table")
            
            print(f"Generated chemistry notes with ID: {data.get('note_id')}")
            print(f"Content preview: {content[:100]}...")
            print("✅ Chemistry notes generation test passed")
        except Exception as e:
            print(f"❌ Chemistry notes generation test failed: {str(e)}")
            raise

    def test_04_get_all_notes(self):
        """Test retrieving all student notes"""
        print("\n🔍 Testing Get All Notes...")
        
        if not self.student_token or not self.note_ids:
            self.skipTest("Student token or note IDs not available")
        
        url = f"{API_URL}/notes"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Get All Notes Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to get all notes")
            data = response.json()
            
            self.assertIsInstance(data, list, "Response should be a list")
            self.assertTrue(len(data) >= len(self.note_ids), f"Expected at least {len(self.note_ids)} notes")
            
            # Check if our created notes are in the list
            note_ids_in_response = [note.get("id") for note in data]
            for note_id in self.note_ids:
                self.assertIn(note_id, note_ids_in_response, f"Note ID {note_id} not found in response")
            
            print(f"Retrieved {len(data)} notes")
            print("✅ Get all notes test passed")
        except Exception as e:
            print(f"❌ Get all notes test failed: {str(e)}")
            raise

    def test_05_filter_notes_by_subject(self):
        """Test filtering notes by subject"""
        print("\n🔍 Testing Filter Notes by Subject...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes?subject={Subject.MATH.value}"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Filter Notes by Subject Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to filter notes by subject")
            data = response.json()
            
            self.assertIsInstance(data, list, "Response should be a list")
            
            # Check that all returned notes have the correct subject
            for note in data:
                self.assertEqual(note.get("subject"), Subject.MATH.value, "Subject mismatch in filtered notes")
            
            print(f"Retrieved {len(data)} math notes")
            print("✅ Filter notes by subject test passed")
        except Exception as e:
            print(f"❌ Filter notes by subject test failed: {str(e)}")
            raise

    def test_06_search_notes(self):
        """Test searching notes by keyword"""
        print("\n🔍 Testing Search Notes...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes?search=Quadratic"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            print(f"Search Notes Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to search notes")
            data = response.json()
            
            self.assertIsInstance(data, list, "Response should be a list")
            
            # Check that all returned notes contain the search term
            for note in data:
                search_term_found = False
                if "Quadratic" in note.get("topic", ""):
                    search_term_found = True
                elif "Quadratic" in note.get("content", ""):
                    search_term_found = True
                
                self.assertTrue(search_term_found, "Search term not found in note")
            
            print(f"Found {len(data)} notes matching search term 'Quadratic'")
            print("✅ Search notes test passed")
        except Exception as e:
            print(f"❌ Search notes test failed: {str(e)}")
            raise

    def test_07_get_note_details(self):
        """Test getting details of a specific note"""
        print("\n🔍 Testing Get Note Details...")
        
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
            
            self.assertEqual(data.get("id"), note_id, "Note ID mismatch")
            self.assertEqual(data.get("student_id"), self.student_id, "Student ID mismatch")
            self.assertIn("content", data, "Content not found in response")
            self.assertIn("created_at", data, "Created at not found in response")
            self.assertIn("last_accessed", data, "Last accessed not found in response")
            
            print(f"Retrieved details for note ID: {note_id}")
            print("✅ Get note details test passed")
        except Exception as e:
            print(f"❌ Get note details test failed: {str(e)}")
            raise

    def test_08_toggle_favorite(self):
        """Test toggling favorite status of a note"""
        print("\n🔍 Testing Toggle Favorite...")
        
        if not self.student_token or not self.note_ids:
            self.skipTest("Student token or note IDs not available")
        
        note_id = self.note_ids[0]
        url = f"{API_URL}/notes/{note_id}/favorite"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            # First, get the current favorite status
            get_url = f"{API_URL}/notes/{note_id}"
            get_response = requests.get(get_url, headers=headers)
            self.assertEqual(get_response.status_code, 200, "Failed to get note details")
            initial_data = get_response.json()
            initial_favorite = initial_data.get("is_favorite", False)
            
            # Toggle favorite status
            response = requests.put(url, headers=headers)
            print(f"Toggle Favorite Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to toggle favorite")
            data = response.json()
            
            self.assertEqual(data.get("note_id"), note_id, "Note ID mismatch")
            self.assertEqual(data.get("is_favorite"), not initial_favorite, "Favorite status not toggled")
            
            # Get the note again to verify the change
            get_response_after = requests.get(get_url, headers=headers)
            self.assertEqual(get_response_after.status_code, 200, "Failed to get note details after toggle")
            after_data = get_response_after.json()
            after_favorite = after_data.get("is_favorite", False)
            
            self.assertEqual(after_favorite, not initial_favorite, "Favorite status not updated in database")
            
            print(f"Toggled favorite status for note ID: {note_id} from {initial_favorite} to {after_favorite}")
            print("✅ Toggle favorite test passed")
        except Exception as e:
            print(f"❌ Toggle favorite test failed: {str(e)}")
            raise

    def test_09_filter_favorites(self):
        """Test filtering notes by favorite status"""
        print("\n🔍 Testing Filter Favorites...")
        
        if not self.student_token or not self.note_ids:
            self.skipTest("Student token or note IDs not available")
        
        # First, make sure at least one note is favorited
        note_id = self.note_ids[0]
        fav_url = f"{API_URL}/notes/{note_id}/favorite"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            # Get current favorite status
            get_url = f"{API_URL}/notes/{note_id}"
            get_response = requests.get(get_url, headers=headers)
            initial_data = get_response.json()
            initial_favorite = initial_data.get("is_favorite", False)
            
            # If not favorited, toggle to favorite
            if not initial_favorite:
                fav_response = requests.put(fav_url, headers=headers)
                self.assertEqual(fav_response.status_code, 200, "Failed to set favorite")
            
            # Now test filtering by favorites
            url = f"{API_URL}/notes?favorites_only=true"
            
            response = requests.get(url, headers=headers)
            print(f"Filter Favorites Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to filter favorites")
            data = response.json()
            
            self.assertIsInstance(data, list, "Response should be a list")
            self.assertTrue(len(data) > 0, "No favorite notes found")
            
            # Check that all returned notes are favorites
            for note in data:
                self.assertTrue(note.get("is_favorite"), "Non-favorite note in favorites filter")
            
            print(f"Found {len(data)} favorite notes")
            print("✅ Filter favorites test passed")
        except Exception as e:
            print(f"❌ Filter favorites test failed: {str(e)}")
            raise

    def test_10_delete_note(self):
        """Test deleting a note"""
        print("\n🔍 Testing Delete Note...")
        
        if not self.student_token or not self.note_ids:
            self.skipTest("Student token or note IDs not available")
        
        note_id = self.note_ids[-1]  # Use the last note
        url = f"{API_URL}/notes/{note_id}"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.delete(url, headers=headers)
            print(f"Delete Note Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 200, "Failed to delete note")
            data = response.json()
            
            self.assertIn("message", data, "Message not found in response")
            
            # Try to get the deleted note
            get_response = requests.get(url, headers=headers)
            self.assertEqual(get_response.status_code, 404, "Deleted note should not be found")
            
            print(f"Successfully deleted note ID: {note_id}")
            print("✅ Delete note test passed")
            
            # Remove from our list
            self.note_ids.remove(note_id)
        except Exception as e:
            print(f"❌ Delete note test failed: {str(e)}")
            raise

    def test_11_error_handling_invalid_subject(self):
        """Test error handling with invalid subject"""
        print("\n🔍 Testing Error Handling - Invalid Subject...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": "invalid_subject",
            "topic": "Test Topic",
            "note_type": "comprehensive"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Invalid Subject Response: {response.status_code}")
            
            self.assertNotEqual(response.status_code, 200, "Should not accept invalid subject")
            self.assertTrue(response.status_code in [400, 422], "Expected 400 or 422 status code")
            
            print("✅ Invalid subject error handling test passed")
        except Exception as e:
            print(f"❌ Invalid subject error handling test failed: {str(e)}")
            raise

    def test_12_error_handling_empty_topic(self):
        """Test error handling with empty topic"""
        print("\n🔍 Testing Error Handling - Empty Topic...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/notes/generate"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": Subject.MATH.value,
            "topic": "",
            "note_type": "comprehensive"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Empty Topic Response: {response.status_code}")
            
            self.assertNotEqual(response.status_code, 200, "Should not accept empty topic")
            self.assertTrue(response.status_code in [400, 422], "Expected 400 or 422 status code")
            
            print("✅ Empty topic error handling test passed")
        except Exception as e:
            print(f"❌ Empty topic error handling test failed: {str(e)}")
            raise

    def test_13_unauthorized_access(self):
        """Test unauthorized access to notes"""
        print("\n🔍 Testing Unauthorized Access...")
        
        url = f"{API_URL}/notes"
        
        try:
            # Try without token
            response = requests.get(url)
            print(f"Unauthorized Access Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 401, "Should return 401 for missing token")
            
            # Try with invalid token
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.get(url, headers=headers)
            print(f"Invalid Token Response: {response.status_code}")
            
            self.assertEqual(response.status_code, 401, "Should return 401 for invalid token")
            
            print("✅ Unauthorized access test passed")
        except Exception as e:
            print(f"❌ Unauthorized access test failed: {str(e)}")
            raise

    def test_14_xp_award(self):
        """Test XP award for generating notes"""
        print("\n🔍 Testing XP Award for Notes Generation...")
        
        if not self.student_token:
            self.skipTest("Student token not available")
        
        # First, get current XP
        profile_url = f"{API_URL}/student/profile"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            profile_response = requests.get(profile_url, headers=headers)
            self.assertEqual(profile_response.status_code, 200, "Failed to get student profile")
            profile_data = profile_response.json()
            initial_xp = profile_data.get("total_xp", 0)
            
            # Generate a new note
            notes_url = f"{API_URL}/notes/generate"
            payload = {
                "subject": Subject.BIOLOGY.value,
                "topic": "Cell Structure",
                "note_type": "comprehensive"
            }
            
            notes_response = requests.post(notes_url, json=payload, headers=headers)
            print(f"Generate Notes for XP Test Response: {notes_response.status_code}")
            
            self.assertEqual(notes_response.status_code, 200, "Failed to generate notes")
            
            # Get profile again to check XP
            profile_response_after = requests.get(profile_url, headers=headers)
            self.assertEqual(profile_response_after.status_code, 200, "Failed to get student profile after notes generation")
            profile_data_after = profile_response_after.json()
            after_xp = profile_data_after.get("total_xp", 0)
            
            # Check XP increase (should be +3 for notes generation)
            xp_increase = after_xp - initial_xp
            self.assertTrue(xp_increase >= 3, f"XP should increase by at least 3, but only increased by {xp_increase}")
            
            print(f"XP increased from {initial_xp} to {after_xp} (increase of {xp_increase})")
            print("✅ XP award test passed")
        except Exception as e:
            print(f"❌ XP award test failed: {str(e)}")
            raise

if __name__ == "__main__":
    print("\n==== TESTING NOTES GENERATION SYSTEM ====\n")
    unittest.main()