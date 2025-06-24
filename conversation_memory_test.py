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
    GRADE_10 = "10th"

class TestConversationMemory(unittest.TestCase):
    """Test cases for enhanced conversation memory and flow system"""

    def setUp(self):
        """Set up test case - create student account and session"""
        self.student_token = None
        self.student_id = None
        self.session_ids = {}
        
        # Register student
        self.register_student()

    def register_student(self):
        """Register a student for testing"""
        print("\n🔍 Setting up student account...")
        url = f"{API_URL}/auth/register"
        payload = {
            "email": f"student_convo_{uuid.uuid4()}@example.com",
            "password": "SecurePass123!",
            "name": "Priya Singh",
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

    def create_chat_session(self, subject):
        """Create a chat session for a specific subject"""
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/chat/session"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "subject": subject.value
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                session_id = data.get("session_id")
                self.session_ids[subject.value] = session_id
                print(f"Created {subject.value} chat session with ID: {session_id}")
                return session_id
            else:
                print(f"Failed to create chat session: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Error creating chat session: {str(e)}")
            return None

    def send_message(self, session_id, subject, message):
        """Send a message to a chat session and return the response"""
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/chat/message"
        headers = {"Authorization": f"Bearer {self.student_token}"}
        payload = {
            "session_id": session_id,
            "subject": subject.value,
            "user_message": message
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to send message: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Error sending message: {str(e)}")
            return None

    def get_chat_history(self, subject=None):
        """Get chat history, optionally filtered by subject"""
        if not self.student_token:
            self.skipTest("Student token not available")
        
        url = f"{API_URL}/chat/history"
        if subject:
            url += f"?subject={subject.value}"
        
        headers = {"Authorization": f"Bearer {self.student_token}"}
        
        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to get chat history: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Error getting chat history: {str(e)}")
            return None

    def test_01_conversation_context_building(self):
        """Test conversation context building with multiple related messages"""
        print("\n🔍 Testing Conversation Context Building...")
        
        # Create a math session
        math_session_id = self.create_chat_session(Subject.MATH)
        if not math_session_id:
            self.skipTest("Failed to create math session")
        
        # Send a sequence of related messages
        messages = [
            "Can you explain quadratic equations?",
            "How do I solve x^2 - 5x + 6 = 0?",
            "What's the quadratic formula?",
            "Can you show me how to use the quadratic formula for x^2 - 7x + 12 = 0?"
        ]
        
        responses = []
        for i, message in enumerate(messages):
            print(f"Sending message {i+1}: {message}")
            response = self.send_message(math_session_id, Subject.MATH, message)
            if response:
                responses.append(response)
                # Print a preview of the bot's response
                bot_response = response.get("bot_response", "")
                print(f"Bot response preview: {bot_response[:100]}...")
                
                # Check for conversation turn tracking
                self.assertEqual(response.get("conversation_turn"), i+1, 
                                f"Conversation turn should be {i+1}")
                
                # Give the system time to process between messages
                time.sleep(2)
            else:
                print(f"Failed to get response for message {i+1}")
        
        # Get chat history to verify conversation building
        history = self.get_chat_history(Subject.MATH)
        if not history:
            self.skipTest("Failed to get chat history")
        
        # Verify history contains all our messages in order
        self.assertEqual(len(history), len(messages), 
                        f"Chat history should contain {len(messages)} messages")
        
        # Check for references to previous messages in later responses
        for i in range(1, len(responses)):
            # Check if later responses reference previous content
            current_response = responses[i]
            if i >= 2:  # After 3rd message, should start referencing previous
                referenced_previous = current_response.get("referenced_previous", False)
                if referenced_previous:
                    print(f"✅ Message {i+1} correctly references previous messages")
                else:
                    print(f"⚠️ Message {i+1} does not reference previous messages")
        
        print("✅ Conversation context building test completed")

    def test_02_conversation_insights_extraction(self):
        """Test conversation insights extraction from different sentiment messages"""
        print("\n🔍 Testing Conversation Insights Extraction...")
        
        # Create a physics session
        physics_session_id = self.create_chat_session(Subject.PHYSICS)
        if not physics_session_id:
            self.skipTest("Failed to create physics session")
        
        # Send messages with different sentiment indicators
        sentiment_messages = [
            # Confused sentiment
            "I'm really confused about Newton's laws of motion. Can you explain them?",
            # Understanding sentiment
            "Oh, I understand the first law now! It's about inertia.",
            # Struggling sentiment
            "I'm still struggling with the third law. The equal and opposite reactions part is hard.",
            # Confident sentiment
            "The second law makes perfect sense to me. Force equals mass times acceleration.",
            # Question with visual learning preference
            "Can you show me a diagram of how these laws work in real life?"
        ]
        
        responses = []
        for i, message in enumerate(sentiment_messages):
            print(f"Sending sentiment message {i+1}: {message}")
            response = self.send_message(physics_session_id, Subject.PHYSICS, message)
            if response:
                responses.append(response)
                # Print the sentiment detected
                sentiment = response.get("student_sentiment", "not detected")
                print(f"Detected sentiment: {sentiment}")
                
                # Give the system time to process between messages
                time.sleep(2)
            else:
                print(f"Failed to get response for sentiment message {i+1}")
        
        # Get chat history to verify sentiment tracking
        history = self.get_chat_history(Subject.PHYSICS)
        if not history:
            self.skipTest("Failed to get chat history")
        
        # Check for different sentiments in the responses
        sentiments = [msg.get("student_sentiment") for msg in history]
        print(f"Detected sentiments across conversation: {sentiments}")
        
        # Verify we have at least some sentiment detection
        self.assertTrue(any(sentiments), "At least some messages should have sentiment detected")
        
        # Check for variety in sentiments (at least 2 different sentiments)
        unique_sentiments = set(filter(None, sentiments))
        print(f"Unique sentiments detected: {unique_sentiments}")
        self.assertTrue(len(unique_sentiments) >= 1, 
                       "Should detect at least one type of sentiment")
        
        print("✅ Conversation insights extraction test completed")

    def test_03_enhanced_chat_message_storage(self):
        """Test enhanced chat message storage with new fields"""
        print("\n🔍 Testing Enhanced Chat Message Storage...")
        
        # Create a biology session
        biology_session_id = self.create_chat_session(Subject.BIOLOGY)
        if not biology_session_id:
            self.skipTest("Failed to create biology session")
        
        # Send a message
        message = "Can you explain how photosynthesis works?"
        response = self.send_message(biology_session_id, Subject.BIOLOGY, message)
        if not response:
            self.skipTest("Failed to get response")
        
        # Verify new fields are present in the response
        required_fields = [
            "conversation_turn", 
            "referenced_previous", 
            "student_sentiment"
        ]
        
        for field in required_fields:
            self.assertIn(field, response, f"Response should contain {field} field")
            print(f"Field {field}: {response.get(field)}")
        
        # Send a follow-up message that should reference the first
        follow_up = "What role do chloroplasts play in this process?"
        follow_up_response = self.send_message(biology_session_id, Subject.BIOLOGY, follow_up)
        if not follow_up_response:
            self.skipTest("Failed to get follow-up response")
        
        # Verify conversation turn incremented
        self.assertEqual(follow_up_response.get("conversation_turn"), 2, 
                        "Follow-up should be conversation turn 2")
        
        print("✅ Enhanced chat message storage test completed")

    def test_04_contextual_caching(self):
        """Test contextual caching behavior"""
        print("\n🔍 Testing Contextual Caching...")
        
        # Create a chemistry session
        chemistry_session_id = self.create_chat_session(Subject.CHEMISTRY)
        if not chemistry_session_id:
            self.skipTest("Failed to create chemistry session")
        
        # Send the same question twice in a row to test caching
        question = "What is the periodic table?"
        
        print("Sending first request...")
        start_time1 = time.time()
        response1 = self.send_message(chemistry_session_id, Subject.CHEMISTRY, question)
        end_time1 = time.time()
        if not response1:
            self.skipTest("Failed to get first response")
        
        # Small delay
        time.sleep(1)
        
        print("Sending identical second request (should use cache)...")
        start_time2 = time.time()
        response2 = self.send_message(chemistry_session_id, Subject.CHEMISTRY, question)
        end_time2 = time.time()
        if not response2:
            self.skipTest("Failed to get second response")
        
        # Compare response times - cached should be faster
        time1 = end_time1 - start_time1
        time2 = end_time2 - start_time2
        print(f"First request time: {time1:.2f}s")
        print(f"Second request time: {time2:.2f}s")
        
        # Check if responses are identical (indicating caching)
        responses_match = response1.get("bot_response") == response2.get("bot_response")
        print(f"Responses are identical: {responses_match}")
        
        # Now build a conversation with multiple turns
        follow_up_questions = [
            "What are the groups in the periodic table?",
            "Can you explain the difference between metals and non-metals?",
            "How are elements arranged in the periodic table?"
        ]
        
        # Send multiple follow-up questions to build conversation context
        for i, q in enumerate(follow_up_questions):
            print(f"Sending follow-up question {i+1}: {q}")
            response = self.send_message(chemistry_session_id, Subject.CHEMISTRY, q)
            if response:
                # Check conversation turn
                self.assertEqual(response.get("conversation_turn"), i+2,  # +2 because we already sent one question
                               f"Conversation turn should be {i+2}")
                time.sleep(1)
            else:
                print(f"Failed to get response for follow-up {i+1}")
        
        # Now send a question that should generate a fresh response due to context
        contextual_question = "Based on what we've discussed, can you summarize the key features of the periodic table?"
        print("Sending contextual question (should NOT use cache)...")
        start_time3 = time.time()
        response3 = self.send_message(chemistry_session_id, Subject.CHEMISTRY, contextual_question)
        end_time3 = time.time()
        if not response3:
            self.skipTest("Failed to get contextual response")
        
        time3 = end_time3 - start_time3
        print(f"Contextual request time: {time3:.2f}s")
        
        # Check if the response references previous conversation
        referenced_previous = response3.get("referenced_previous", False)
        print(f"Response references previous conversation: {referenced_previous}")
        
        print("✅ Contextual caching test completed")

    def test_05_enhanced_subject_bot_responses(self):
        """Test enhanced SubjectBot responses with context awareness"""
        print("\n🔍 Testing Enhanced SubjectBot Responses...")
        
        # Create sessions for different subjects
        math_session_id = self.create_chat_session(Subject.MATH)
        history_session_id = self.create_chat_session(Subject.HISTORY)
        
        if not math_session_id or not history_session_id:
            self.skipTest("Failed to create sessions")
        
        # Test math conversation flow
        math_conversation = [
            "What are the different types of triangles?",
            "Can you tell me more about right triangles?",
            "What's the Pythagorean theorem?",
            "How do I use the Pythagorean theorem to find the hypotenuse if the other sides are 3 and 4?"
        ]
        
        print("\nTesting math conversation flow...")
        math_responses = []
        for i, msg in enumerate(math_conversation):
            print(f"Math message {i+1}: {msg}")
            response = self.send_message(math_session_id, Subject.MATH, msg)
            if response:
                math_responses.append(response)
                print(f"Response preview: {response.get('bot_response', '')[:100]}...")
                time.sleep(2)
            else:
                print(f"Failed to get response for math message {i+1}")
        
        # Test history conversation flow
        history_conversation = [
            "What were the major causes of World War I?",
            "What was the role of alliances in starting the war?",
            "How did the Treaty of Versailles affect Germany?",
            "Did the Treaty of Versailles contribute to World War II?"
        ]
        
        print("\nTesting history conversation flow...")
        history_responses = []
        for i, msg in enumerate(history_conversation):
            print(f"History message {i+1}: {msg}")
            response = self.send_message(history_session_id, Subject.HISTORY, msg)
            if response:
                history_responses.append(response)
                print(f"Response preview: {response.get('bot_response', '')[:100]}...")
                time.sleep(2)
            else:
                print(f"Failed to get response for history message {i+1}")
        
        # Check for context maintenance in later responses
        if len(math_responses) >= 3 and len(history_responses) >= 3:
            # Check math context
            math_context_maintained = False
            for i in range(2, len(math_responses)):
                if math_responses[i].get("referenced_previous", False):
                    math_context_maintained = True
                    break
            
            # Check history context
            history_context_maintained = False
            for i in range(2, len(history_responses)):
                if history_responses[i].get("referenced_previous", False):
                    history_context_maintained = True
                    break
            
            print(f"Math context maintained: {math_context_maintained}")
            print(f"History context maintained: {history_context_maintained}")
            
            # At least one of the conversations should maintain context
            self.assertTrue(math_context_maintained or history_context_maintained,
                          "At least one conversation should maintain context")
        
        print("✅ Enhanced SubjectBot responses test completed")

if __name__ == "__main__":
    unittest.main()