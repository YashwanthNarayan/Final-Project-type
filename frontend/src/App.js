import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Setup axios auth
const setupAxiosAuth = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Auth Portal Component
const AuthPortal = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    grade_level: '9th',
    school_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { ...formData, user_type: userType };

      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      
      // Store auth data
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_type', response.data.user_type);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Setup axios auth
      setupAxiosAuth(response.data.access_token);
      
      onAuthSuccess(response.data.user_type, response.data.user);
    } catch (error) {
      setError(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project K</h1>
          <p className="text-gray-600">AI-Powered Educational Platform</p>
        </div>

        {/* Toggle between Login/Register */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* User Type Selection for Registration */}
        {!isLogin && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  userType === 'student'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🎓</div>
                <div className="font-medium">Student</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('teacher')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  userType === 'teacher'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">👩‍🏫</div>
                <div className="font-medium">Teacher</div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {!isLogin && userType === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData(prev => ({ ...prev, grade_level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(grade => (
                  <option key={grade} value={grade}>{grade} Grade</option>
                ))}
              </select>
            </div>
          )}

          {!isLogin && userType === 'teacher' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                value={formData.school_name}
                onChange={(e) => setFormData(prev => ({ ...prev, school_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Practice Tests Component
const PracticeTestsComponent = ({ student, onNavigate }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]);
  const [excludeSeen, setExcludeSeen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResults, setTestResults] = useState(null);

  const subjects = {
    math: { name: 'Mathematics', topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'] },
    physics: { name: 'Physics', topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity', 'Waves'] },
    chemistry: { name: 'Chemistry', topics: ['Atomic Structure', 'Organic Chemistry', 'Acids & Bases', 'Chemical Bonding'] },
    biology: { name: 'Biology', topics: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Evolution'] },
    english: { name: 'English', topics: ['Grammar', 'Literature', 'Poetry', 'Essay Writing', 'Reading Comprehension'] },
    history: { name: 'History', topics: ['Ancient History', 'Medieval History', 'Modern History', 'World Wars'] },
    geography: { name: 'Geography', topics: ['Physical Geography', 'Human Geography', 'Climate', 'Natural Resources'] }
  };

  const questionTypes = [
    { id: 'mcq', name: 'Multiple Choice', description: 'Choose from multiple options', icon: '📝' },
    { id: 'short_answer', name: 'Short Answer', description: 'Brief written responses', icon: '✏️' },
    { id: 'numerical', name: 'Numerical', description: 'Mathematical calculations', icon: '🔢' },
    { id: 'long_answer', name: 'Long Answer', description: 'Detailed explanations', icon: '📄' }
  ];

  const handleTopicToggle = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleQuestionTypeToggle = (typeId) => {
    setSelectedQuestionTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const generateTest = async () => {
    if (!selectedSubject || selectedTopics.length === 0) return;
    
    // Ensure authentication token is set
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please log in to generate practice tests.');
      return;
    }
    
    // Force set the authorization header for this request
    setupAxiosAuth(token);
    
    // Debug authentication
    console.log('Debug - Token exists:', !!token);
    console.log('Debug - Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('Debug - Authorization header:', axios.defaults.headers.common['Authorization']);
    
    setIsGenerating(true);
    try {
      // Build request payload with new options
      const requestPayload = {
        subject: selectedSubject,
        topics: selectedTopics,
        difficulty: difficulty,
        question_count: questionCount,
        exclude_seen: excludeSeen
      };

      // Add question types if selected
      if (selectedQuestionTypes.length > 0) {
        requestPayload.question_types = selectedQuestionTypes;
      }

      // Explicitly include the authorization header in this request
      const response = await axios.post(`${API_BASE}/api/practice/generate`, requestPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCurrentTest(response.data);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setTimeLeft(questionCount * 120); // 2 minutes per question

      // Show success message with new features info
      const excludedCount = response.data.excluded_count || 0;
      const questionTypes = response.data.question_types_generated || [];
      
      console.log(`Generated ${response.data.total_questions} questions`);
      if (excludedCount > 0) {
        console.log(`Excluded ${excludedCount} previously seen questions`);
      }
      if (questionTypes.length > 0) {
        console.log(`Question types: ${questionTypes.join(', ')}`);
      }
    } catch (error) {
      console.error('Error generating test:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Error generating test. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to generate practice tests.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid test parameters. Please check your selections.';
      } else if (error.response?.data?.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitTest = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE}/api/practice/submit`, {
        test_id: currentTest.test_id,
        questions: currentTest.questions.map(q => q.id),
        student_answers: userAnswers,
        time_taken: (questionCount * 120) - timeLeft
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setTestResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      // Show results anyway
      setShowResults(true);
    }
  };

  // Timer effect
  useEffect(() => {
    if (currentTest && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, timeLeft, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Test Complete!</h2>
            {testResults && (
              <>
                <div className="text-4xl font-bold text-indigo-600 mb-6">{testResults.score.toFixed(1)}%</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{testResults.correct_answers}</div>
                    <div className="text-sm text-green-800">Correct Answers</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{testResults.total_questions}</div>
                    <div className="text-sm text-blue-800">Total Questions</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">+{testResults.xp_earned}</div>
                    <div className="text-sm text-purple-800">XP Earned</div>
                  </div>
                </div>
              </>
            )}
            <div className="space-x-4">
              <button
                onClick={() => {
                  setCurrentTest(null);
                  setShowResults(false);
                  setSelectedSubject('');
                  setSelectedTopics([]);
                }}
                className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600"
              >
                Take Another Test
              </button>
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentTest) {
    const currentQuestion = currentTest.questions[currentQuestionIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Practice Test - {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}</h2>
              <div className="flex items-center space-x-4">
                <div className="text-lg font-semibold text-indigo-600">{formatTime(timeLeft)}</div>
                <div className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {currentTest.questions.length}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / currentTest.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.question_text}</h3>
              
              {/* Question Type Badge */}
              <div className="mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full capitalize">
                  {currentQuestion.question_type?.replace('_', ' ') || 'Multiple Choice'}
                </span>
              </div>

              {/* Answer Input Based on Question Type */}
              {currentQuestion.question_type === 'mcq' || !currentQuestion.question_type ? (
                /* Multiple Choice Questions */
                <div className="space-y-3">
                  {currentQuestion.options && currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: option }))}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        userAnswers[currentQuestion.id] === option
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : currentQuestion.question_type === 'short_answer' ? (
                /* Short Answer Questions */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                  <input
                    type="text"
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter your answer here..."
                    maxLength="200"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {(userAnswers[currentQuestion.id] || '').length}/200 characters
                  </div>
                </div>
              ) : currentQuestion.question_type === 'numerical' ? (
                /* Numerical Questions */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                  <input
                    type="number"
                    step="any"
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter numerical answer..."
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Enter numbers only (decimals allowed)
                  </div>
                </div>
              ) : currentQuestion.question_type === 'long_answer' ? (
                /* Long Answer Questions */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                  <textarea
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    placeholder="Write your detailed answer here..."
                    rows="6"
                    maxLength="1000"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {(userAnswers[currentQuestion.id] || '').length}/1000 characters
                  </div>
                </div>
              ) : (
                /* Fallback for unknown question types */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                  <textarea
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter your answer here..."
                    rows="4"
                  />
                </div>
              )}

              {/* Show question explanation hint if available */}
              {currentQuestion.learning_objectives && currentQuestion.learning_objectives.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-1">💡 Learning Objective:</div>
                  <div className="text-sm text-blue-700">
                    {currentQuestion.learning_objectives[0]}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="bg-gray-200 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (currentQuestionIndex === currentTest.questions.length - 1) {
                    submitTest();
                  } else {
                    setCurrentQuestionIndex(prev => prev + 1);
                  }
                }}
                disabled={!userAnswers[currentQuestion.id] || userAnswers[currentQuestion.id].toString().trim() === ''}
                className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === currentTest.questions.length - 1 ? 'Finish Test' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="text-indigo-600 hover:text-indigo-700 mr-4"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📝 Practice Tests</h1>
            <p className="text-gray-600">Test your knowledge with adaptive quizzes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopics([]);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a subject</option>
                {Object.entries(subjects).map(([key, subject]) => (
                  <option key={key} value={key}>{subject.name}</option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topics (Select at least 1)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects[selectedSubject].topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleTopicToggle(topic)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTopics.includes(topic)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSubject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Types (Leave empty for all types)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questionTypes.map((questionType) => (
                    <button
                      key={questionType.id}
                      onClick={() => handleQuestionTypeToggle(questionType.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedQuestionTypes.includes(questionType.id)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{questionType.icon}</span>
                        <div>
                          <div className="font-medium">{questionType.name}</div>
                          <div className="text-sm text-gray-600">{questionType.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedQuestionTypes.length > 0 && (
                  <div className="mt-2 text-sm text-purple-600">
                    Selected: {selectedQuestionTypes.map(type => 
                      questionTypes.find(qt => qt.id === type)?.name
                    ).join(', ')}
                  </div>
                )}
              </div>
            )}

            {selectedSubject && (
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={excludeSeen}
                    onChange={(e) => setExcludeSeen(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Exclude Previously Seen Questions</span>
                    <div className="text-xs text-gray-500">Generate only new questions you haven't seen before</div>
                  </div>
                </label>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateTest}
              disabled={!selectedSubject || selectedTopics.length === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Test...' : 'Start Practice Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mindfulness Component
const MindfulnessComponent = ({ student, onNavigate }) => {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [showMoodCheck, setShowMoodCheck] = useState(false);

  const activities = [
    { 
      id: 'breathing', 
      name: 'Breathing Exercise', 
      icon: '🫁', 
      duration: 5, 
      description: '4-7-8 breathing technique for relaxation',
      instructions: 'Inhale for 4 counts, hold for 7 counts, exhale for 8 counts'
    },
    { 
      id: 'meditation', 
      name: 'Quick Meditation', 
      icon: '🧘', 
      duration: 3, 
      description: 'Short guided meditation session',
      instructions: 'Close your eyes, focus on your breath, and let thoughts pass without judgment'
    },
    { 
      id: 'stress_relief', 
      name: 'Stress Relief', 
      icon: '😌', 
      duration: 2, 
      description: 'Quick stress reduction techniques',
      instructions: 'Progressive muscle relaxation and positive visualization'
    },
    { 
      id: 'study_break', 
      name: 'Study Break', 
      icon: '☕', 
      duration: 5, 
      description: 'Refreshing break activities',
      instructions: 'Gentle stretching and mindful movement'
    }
  ];

  const startActivity = async (activity) => {
    setCurrentActivity(activity);
    setIsActive(true);
    setTimer(activity.duration * 60);
    setShowMoodCheck(true);
  };

  const completeActivity = async () => {
    try {
      await axios.post(`${API_BASE}/api/mindfulness/session`, {
        activity_type: currentActivity.id,
        duration: currentActivity.duration,
        mood_before: moodBefore,
        mood_after: moodAfter
      });
    } catch (error) {
      console.error('Error saving mindfulness session:', error);
    }
    
    setIsActive(false);
    setCurrentActivity(null);
    setTimer(0);
    setShowMoodCheck(false);
  };

  const stopActivity = () => {
    setIsActive(false);
    setCurrentActivity(null);
    setTimer(0);
    setShowMoodCheck(false);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => {
          if (timer <= 1) {
            setIsActive(false);
            setShowMoodCheck(true);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const MoodScale = ({ mood, setMood, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <span className="text-sm">😔</span>
        <input
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm">😊</span>
        <span className="text-sm font-medium w-8 text-center">{mood}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="text-indigo-600 hover:text-indigo-700 mr-4"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧘 Mindfulness Toolbox</h1>
            <p className="text-gray-600">Take care of your mental well-being</p>
          </div>
        </div>

        {showMoodCheck && currentActivity && !isActive ? (
          /* Mood Check After Activity */
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How do you feel now?</h2>
            <div className="max-w-md mx-auto">
              <MoodScale mood={moodAfter} setMood={setMoodAfter} label="Current Mood (1-10)" />
              <div className="flex space-x-3">
                <button
                  onClick={completeActivity}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Complete Session
                </button>
                <button
                  onClick={stopActivity}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        ) : currentActivity && isActive ? (
          /* Active Session */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-8xl mb-6">{currentActivity.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentActivity.name}</h2>
            <div className="text-6xl font-bold text-indigo-600 mb-6">{formatTime(timer)}</div>
            
            <div className="mb-8 max-w-md mx-auto">
              <p className="text-lg text-gray-700 mb-4">{currentActivity.instructions}</p>
              {currentActivity.id === 'breathing' && (
                <div className="space-y-2 text-gray-600">
                  <div>🔵 Inhale slowly for 4 counts</div>
                  <div>⏸️ Hold your breath for 7 counts</div>
                  <div>🔴 Exhale slowly for 8 counts</div>
                </div>
              )}
            </div>

            <button
              onClick={stopActivity}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Stop Session
            </button>
          </div>
        ) : showMoodCheck && currentActivity ? (
          /* Pre-Activity Mood Check */
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How are you feeling?</h2>
            <div className="max-w-md mx-auto">
              <MoodScale mood={moodBefore} setMood={setMoodBefore} label="Current Mood (1-10)" />
              <button
                onClick={() => {
                  setShowMoodCheck(false);
                  setIsActive(true);
                  setTimer(currentActivity.duration * 60);
                }}
                className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Start {currentActivity.name}
              </button>
            </div>
          </div>
        ) : (
          /* Activity Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => startActivity(activity)}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left"
              >
                <div className="text-6xl mb-4">{activity.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.name}</h3>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="text-sm text-indigo-600 font-medium">{activity.duration} minutes</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Progress Tracker Component
const ProgressTracker = ({ student, onNavigate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectStats, setSubjectStats] = useState(null);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [expandedTest, setExpandedTest] = useState(null);
  const [testDetails, setTestDetails] = useState({});

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectStats = async (subject) => {
    setSubjectLoading(true);
    try {
      const [statsResponse, resultsResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/practice/stats/${subject}`),
        axios.get(`${API_BASE}/api/practice/results?subject=${subject}`)
      ]);
      
      setSubjectStats({
        ...statsResponse.data,
        all_results: resultsResponse.data
      });
    } catch (error) {
      console.error('Error loading subject stats:', error);
      setSubjectStats(null);
    } finally {
      setSubjectLoading(false);
    }
  };

  const loadTestDetails = async (resultId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/practice/results/${resultId}/details`);
      setTestDetails(prev => ({ ...prev, [resultId]: response.data }));
    } catch (error) {
      console.error('Error loading test details:', error);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setExpandedTest(null);
    setTestDetails({});
    loadSubjectStats(subject);
  };

  const toggleTestExpansion = (testId) => {
    if (expandedTest === testId) {
      setExpandedTest(null);
    } else {
      setExpandedTest(testId);
      if (!testDetails[testId]) {
        loadTestDetails(testId);
      }
    }
  };

  const subjects = ['math', 'physics', 'chemistry', 'biology', 'english', 'history', 'geography'];
  
  const getSubjectProgress = (subject) => {
    // Calculate progress based on various factors
    const profile = dashboardData?.profile;
    const baseProgress = (profile?.level || 1) * 8;
    const xpBonus = Math.min(40, (profile?.total_xp || 0) / 10);
    const streakBonus = Math.min(10, (profile?.streak_days || 0) * 2);
    
    return Math.min(100, baseProgress + xpBonus + streakBonus + Math.random() * 15);
  };

  const getBadges = () => {
    const profile = dashboardData?.profile;
    const stats = dashboardData?.stats;
    const badges = [];

    if (stats?.total_messages >= 1) badges.push({ name: 'First Question', icon: '🥇', description: 'Asked your first question' });
    if (stats?.total_messages >= 10) badges.push({ name: 'Curious Learner', icon: '🤔', description: 'Asked 10 questions' });
    if (stats?.total_messages >= 50) badges.push({ name: 'Knowledge Seeker', icon: '🔍', description: 'Asked 50 questions' });
    if (profile?.streak_days >= 3) badges.push({ name: 'Study Streak', icon: '🔥', description: '3 days in a row' });
    if (profile?.streak_days >= 7) badges.push({ name: 'Dedicated Student', icon: '📚', description: '7 day streak' });
    if (profile?.total_xp >= 100) badges.push({ name: 'XP Collector', icon: '⭐', description: 'Earned 100 XP' });
    if (stats?.subjects_studied >= 3) badges.push({ name: 'Multi-Subject', icon: '🎓', description: 'Studied 3 subjects' });

    return badges;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Subject-specific view
  if (selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setSelectedSubject(null)}
              className="text-indigo-600 hover:text-indigo-700 mr-4"
            >
              ← Back to All Subjects
            </button>
            <div className="flex items-center">
              <div className="text-4xl mr-4">
                {selectedSubject === 'math' && '🧮'}
                {selectedSubject === 'physics' && '⚡'}
                {selectedSubject === 'chemistry' && '🧪'}
                {selectedSubject === 'biology' && '🧬'}
                {selectedSubject === 'english' && '📖'}
                {selectedSubject === 'history' && '🏛️'}
                {selectedSubject === 'geography' && '🌍'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">{selectedSubject} Progress</h1>
                <p className="text-gray-600">Detailed progress and practice test results</p>
              </div>
            </div>
          </div>

          {subjectLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : subjectStats ? (
            <div className="space-y-6">
              {/* Subject Statistics */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Test Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{subjectStats.total_tests}</div>
                    <div className="text-gray-600">Tests Taken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{subjectStats.average_score.toFixed(1)}%</div>
                    <div className="text-gray-600">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{subjectStats.best_score.toFixed(1)}%</div>
                    <div className="text-gray-600">Best Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">{subjectStats.total_questions_answered}</div>
                    <div className="text-gray-600">Questions Answered</div>
                  </div>
                </div>
              </div>

              {/* Recent Practice Tests */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Test History</h2>
                {subjectStats.all_results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p>No practice tests taken for {selectedSubject} yet.</p>
                    <button
                      onClick={() => onNavigate('practice')}
                      className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                    >
                      Take Your First Test
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjectStats.all_results.slice(0, 10).map((result, index) => (
                      <div key={result.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Test Summary */}
                        <button
                          onClick={() => toggleTestExpansion(result.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">
                              {result.score >= 80 && '🏆'}
                              {result.score >= 60 && result.score < 80 && '🥉'}
                              {result.score < 60 && '📝'}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900">
                                Test #{subjectStats.all_results.length - index}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(result.completed_at).toLocaleDateString()} • 
                                {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s • 
                                {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                result.score >= 80 ? 'text-green-600' : 
                                result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {result.score.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                {result.correct_count}/{result.total_questions} correct
                              </div>
                            </div>
                            <div className="text-gray-400">
                              {expandedTest === result.id ? '▼' : '▶'}
                            </div>
                          </div>
                        </button>

                        {/* Detailed Question Breakdown */}
                        {expandedTest === result.id && (
                          <div className="border-t border-gray-200 bg-white">
                            {testDetails[result.id] ? (
                              <div className="p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                  Question Breakdown
                                </h4>
                                <div className="space-y-4">
                                  {testDetails[result.id].question_details.map((question, qIndex) => (
                                    <div 
                                      key={question.question_id}
                                      className={`p-4 rounded-lg border-l-4 ${
                                        question.is_correct 
                                          ? 'border-green-500 bg-green-50' 
                                          : 'border-red-500 bg-red-50'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-600">
                                            Question {qIndex + 1}
                                          </span>
                                          <span className={`text-sm px-2 py-1 rounded ${
                                            question.is_correct 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {question.is_correct ? '✓ Correct' : '✗ Incorrect'}
                                          </span>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                                          {question.question_type.replace('_', ' ')}
                                        </span>
                                      </div>
                                      
                                      <div className="mb-3">
                                        <p className="text-gray-900 font-medium mb-2">
                                          {question.question_text}
                                        </p>
                                        
                                        {/* Show options for MCQ */}
                                        {question.question_type === 'mcq' && question.options.length > 0 && (
                                          <div className="ml-4 space-y-1">
                                            {question.options.map((option, optIndex) => (
                                              <div 
                                                key={optIndex}
                                                className={`text-sm p-2 rounded ${
                                                  option === question.correct_answer ? 'bg-green-100 text-green-800 font-medium' :
                                                  option === question.student_answer && !question.is_correct ? 'bg-red-100 text-red-800' :
                                                  'text-gray-600'
                                                }`}
                                              >
                                                {option}
                                                {option === question.correct_answer && ' ← Correct Answer'}
                                                {option === question.student_answer && option !== question.correct_answer && ' ← Your Answer'}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-start space-x-2">
                                          <span className="font-medium text-gray-700">Your Answer:</span>
                                          <span className={question.is_correct ? 'text-green-700' : 'text-red-700'}>
                                            {question.student_answer || 'No answer provided'}
                                          </span>
                                        </div>
                                        
                                        {!question.is_correct && (
                                          <div className="flex items-start space-x-2">
                                            <span className="font-medium text-gray-700">Correct Answer:</span>
                                            <span className="text-green-700 font-medium">
                                              {question.correct_answer}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {question.explanation && (
                                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                            <div className="font-medium text-blue-800 mb-1">Explanation:</div>
                                            <div className="text-blue-700 text-sm">
                                              {question.explanation}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="p-6 text-center">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-600">Loading question details...</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {subjectStats.all_results.length > 10 && (
                      <div className="text-center py-4">
                        <p className="text-gray-600">
                          Showing 10 most recent tests out of {subjectStats.all_results.length} total
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => onNavigate('practice')}
                    className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                  >
                    <span className="text-2xl">📝</span>
                    <span>Take New Practice Test</span>
                  </button>
                  <button
                    onClick={() => onNavigate('chat', selectedSubject)}
                    className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
                  >
                    <span className="text-2xl">🤖</span>
                    <span>Chat with {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} Tutor</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No data available for this subject.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="text-indigo-600 hover:text-indigo-700 mr-4"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Progress Tracker</h1>
            <p className="text-gray-600">Track your learning journey and achievements</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">{dashboardData?.profile?.level || 1}</div>
              <div className="text-gray-600">Current Level</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${((dashboardData?.profile?.total_xp || 0) % 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(dashboardData?.profile?.total_xp || 0) % 100}/100 XP to next level
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{dashboardData?.profile?.total_xp || 0}</div>
              <div className="text-gray-600">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{dashboardData?.profile?.streak_days || 0}</div>
              <div className="text-gray-600">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{dashboardData?.stats?.total_messages || 0}</div>
              <div className="text-gray-600">Questions Asked</div>
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject Mastery</h2>
          <div className="space-y-4">
            {subjects.map((subject) => {
              const progress = getSubjectProgress(subject);
              const isStudied = dashboardData?.subjects_progress?.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => handleSubjectClick(subject)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] ${
                    isStudied ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-12 text-2xl">
                    {subject === 'math' && '🧮'}
                    {subject === 'physics' && '⚡'}
                    {subject === 'chemistry' && '🧪'}
                    {subject === 'biology' && '🧬'}
                    {subject === 'english' && '📖'}
                    {subject === 'history' && '🏛️'}
                    {subject === 'geography' && '🌍'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium capitalize">{subject}</span>
                      <div className="flex items-center">
                        {isStudied && <span className="text-green-600 text-sm mr-2">✓ Studied</span>}
                        <span className="text-sm text-gray-600">{progress.toFixed(0)}%</span>
                        <span className="ml-2 text-indigo-600">→</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isStudied ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">👆 Click on any subject to view detailed progress and practice test results</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getBadges().map((badge, index) => (
              <div key={index} className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="font-medium text-gray-900">{badge.name}</div>
                <div className="text-sm text-gray-600">{badge.description}</div>
              </div>
            ))}
            {getBadges().length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏆</div>
                <p>Start learning to earn your first badge!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Component
const CalendarComponent = ({ student, onNavigate }) => {
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'study_session',
    subject: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/calendar/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/calendar/events`, newEvent);
      setShowAddEvent(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'study_session',
        subject: '',
        start_time: '',
        end_time: ''
      });
      loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start_time).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return eventDate >= tomorrow;
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="text-indigo-600 hover:text-indigo-700 mr-4"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📅 My Schedule</h1>
              <p className="text-gray-600">Manage your study schedule and events</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddEvent(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            + Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Schedule</h2>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>No events scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl">
                      {event.event_type === 'study_session' && '📚'}
                      {event.event_type === 'practice_test' && '📝'}
                      {event.event_type === 'assignment' && '📋'}
                      {event.event_type === 'exam' && '🎯'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                      </div>
                      {event.subject && (
                        <div className="text-sm text-indigo-600 capitalize">{event.subject}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🗓️</div>
                <p>No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">
                      {event.event_type === 'study_session' && '📚'}
                      {event.event_type === 'practice_test' && '📝'}
                      {event.event_type === 'assignment' && '📋'}
                      {event.event_type === 'exam' && '🎯'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString()}
                      </div>
                      {event.subject && (
                        <div className="text-sm text-indigo-600 capitalize">{event.subject}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Event</h2>
            <form onSubmit={addEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, event_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="study_session">Study Session</option>
                  <option value="practice_test">Practice Test</option>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Optional)</label>
                <select
                  value={newEvent.subject}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Subject</option>
                  <option value="math">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="english">English</option>
                  <option value="history">History</option>
                  <option value="geography">Geography</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Notifications Component
const NotificationsComponent = ({ student, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_BASE}/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system': return '🔔';
      case 'teacher_message': return '👩‍🏫';
      case 'reminder': return '⏰';
      case 'achievement': return '🏆';
      default: return '📢';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="text-indigo-600 hover:text-indigo-800 text-2xl"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">Stay updated with your learning journey</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{student?.name}</div>
              <div className="text-xs text-gray-600">Grade {student?.grade_level}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No notifications yet!</h2>
            <p className="text-gray-600 mb-6">
              We'll notify you about important updates, achievements, and messages from your teachers.
            </p>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Notifications ({notifications.filter(n => !n.is_read).length} unread)
              </h2>
            </div>
            
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  !notification.is_read ? 'border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-white' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{formatTime(notification.created_at)}</span>
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className={`${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <div className="mt-2">
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize">
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// My Classes Component
const MyClassesComponent = ({ student, onNavigate }) => {
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadStudentClasses();
  }, []);

  const loadStudentClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/student/classes`);
      setJoinedClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinClass = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoining(true);
    try {
      await axios.post(`${API_BASE}/api/student/join-class`, {
        join_code: joinCode.trim().toUpperCase()
      });
      setJoinCode('');
      setShowJoinClass(false);
      loadStudentClasses(); // Reload the classes
      alert('Successfully joined the class!');
    } catch (error) {
      console.error('Error joining class:', error);
      alert(error.response?.data?.detail || 'Failed to join class. Please check the join code.');
    } finally {
      setJoining(false);
    }
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      math: '🧮',
      physics: '⚡',
      chemistry: '🧪',
      biology: '🧬',
      english: '📖',
      history: '🏛️',
      geography: '🌍'
    };
    return icons[subject] || '📚';
  };

  const getSubjectColor = (subject) => {
    const colors = {
      math: 'bg-blue-100 border-blue-300',
      physics: 'bg-yellow-100 border-yellow-300',
      chemistry: 'bg-green-100 border-green-300',
      biology: 'bg-purple-100 border-purple-300',
      english: 'bg-red-100 border-red-300',
      history: 'bg-orange-100 border-orange-300',
      geography: 'bg-teal-100 border-teal-300'
    };
    return colors[subject] || 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="text-indigo-600 hover:text-indigo-800 text-2xl"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Classes</h1>
                <p className="text-sm text-gray-600">Manage your enrolled classes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowJoinClass(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                + Join Class
              </button>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{student?.name}</div>
                <div className="text-xs text-gray-600">Grade {student?.grade_level}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading your classes...</div>
          </div>
        ) : joinedClasses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No classes joined yet!</h2>
            <p className="text-gray-600 mb-6">
              Ask your teacher for a class join code to get started with collaborative learning.
            </p>
            <button
              onClick={() => setShowJoinClass(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all mr-4"
            >
              Join Your First Class
            </button>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Classes ({joinedClasses.length})
              </h2>
              <p className="text-gray-600">
                Connect with your teachers and classmates in these enrolled classes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedClasses.map((classRoom) => (
                <div
                  key={classRoom.id}
                  className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-2 ${getSubjectColor(classRoom.subject)}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{getSubjectIcon(classRoom.subject)}</div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{classRoom.class_name}</h3>
                  <p className="text-gray-600 text-sm mb-3 capitalize">
                    {classRoom.subject} • Grade {classRoom.grade_level}
                  </p>
                  
                  {classRoom.description && (
                    <p className="text-gray-600 text-sm mb-4">{classRoom.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500">Join Code:</div>
                      <div className="font-mono font-bold text-gray-900">{classRoom.join_code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Students:</div>
                      <div className="font-bold text-gray-900">{classRoom.students?.length || 0}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(classRoom.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      {showJoinClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join a Class</h2>
            
            <form onSubmit={joinClass} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Join Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code (e.g., ABC123)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center text-lg"
                  maxLength="6"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Ask your teacher for the class join code
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowJoinClass(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining || joinCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joining ? 'Joining...' : 'Join Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Student Dashboard Component
const StudentDashboard = ({ student, onNavigate, dashboardData, onLogout }) => {
  const subjects = ['math', 'physics', 'chemistry', 'biology', 'english', 'history', 'geography'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Project K</h1>
                <p className="text-sm text-gray-600">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{student?.name}</div>
                <div className="text-xs text-gray-600">Grade {student?.grade_level}</div>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome back, {student?.name}! 👋</h2>
              <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{dashboardData?.stats?.total_xp || 0} XP</div>
              <div className="text-sm text-gray-600">🔥 {dashboardData?.stats?.study_streak || 0} day streak</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.subjects_studied || 0}</div>
                <div className="text-sm text-gray-600">Subjects Studied</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.total_messages || 0}</div>
                <div className="text-sm text-gray-600">Questions Asked</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.profile?.level || 1}</div>
                <div className="text-sm text-gray-600">Current Level</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dashboardData?.notifications?.length || 0}</div>
                <div className="text-sm text-gray-600">New Notifications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <button
            onClick={() => onNavigate('subjects')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-semibold mb-2">Study with AI Tutor</h3>
            <p className="text-sm opacity-90">Get personalized help in any subject</p>
          </button>
          <button
            onClick={() => onNavigate('practice')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Practice Tests</h3>
            <p className="text-sm text-gray-600">Take adaptive quizzes to test your knowledge</p>
          </button>
          <button
            onClick={() => onNavigate('mindfulness')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">🧘</div>
            <h3 className="font-semibold text-gray-900 mb-2">Mindfulness</h3>
            <p className="text-sm text-gray-600">Breathing exercises and stress management</p>
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">My Schedule</h3>
            <p className="text-sm text-gray-600">View your study schedule and events</p>
          </button>
        </div>

        {/* Additional Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <button
            onClick={() => onNavigate('progress')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress Tracker</h3>
            <p className="text-sm text-gray-600">View your learning progress and achievements</p>
          </button>
          <button
            onClick={() => onNavigate('notifications')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">🔔</div>
            <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
            <p className="text-sm text-gray-600">Check messages and updates</p>
          </button>
          <button
            onClick={() => onNavigate('classes')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">🏫</div>
            <h3 className="font-semibold text-gray-900 mb-2">My Classes</h3>
            <p className="text-sm text-gray-600">View joined classes and join new ones</p>
          </button>
        </div>

        {/* Subjects Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Subject to Study</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => onNavigate('chat', subject)}
                className="bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 p-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-center"
              >
                <div className="text-3xl mb-2">
                  {subject === 'math' && '🧮'}
                  {subject === 'physics' && '⚡'}
                  {subject === 'chemistry' && '🧪'}
                  {subject === 'biology' && '🧬'}
                  {subject === 'english' && '📖'}
                  {subject === 'history' && '🏛️'}
                  {subject === 'geography' && '🌍'}
                </div>
                <div className="font-medium capitalize text-gray-900">{subject}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        {dashboardData?.today_events?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              {dashboardData.today_events.map((event, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">📅</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(event.start_time).toLocaleTimeString()} - {event.event_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {dashboardData?.recent_activity?.messages?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {dashboardData.recent_activity.messages.slice(0, 5).map((message, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">
                    {message.subject === 'math' && '🧮'}
                    {message.subject === 'physics' && '⚡'}
                    {message.subject === 'chemistry' && '🧪'}
                    {message.subject === 'biology' && '🧬'}
                    {message.subject === 'english' && '📖'}
                    {message.subject === 'history' && '🏛️'}
                    {message.subject === 'geography' && '🌍'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize text-gray-900">{message.subject}</div>
                    <div className="text-sm text-gray-600 truncate">{message.user_message}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Teacher Analytics Dashboard Component
const TeacherAnalyticsDashboard = ({ teacher, onNavigate }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
    if (selectedView === 'overview') {
      loadOverviewAnalytics();
    }
  }, [selectedView]);

  useEffect(() => {
    if (selectedClass && selectedView === 'class') {
      loadClassAnalytics(selectedClass.class_id);
    }
  }, [selectedClass, selectedView]);

  useEffect(() => {
    if (selectedStudent && selectedView === 'student') {
      loadStudentAnalytics(selectedStudent);
    }
  }, [selectedStudent, selectedView]);

  const loadClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/teacher/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadOverviewAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/teacher/analytics/overview`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error loading overview analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassAnalytics = async (classId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/teacher/analytics/class/${classId}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error loading class analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAnalytics = async (studentId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/teacher/analytics/student/${studentId}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error loading student analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      math: '🧮', physics: '⚡', chemistry: '🧪', biology: '🧬',
      english: '📖', history: '🏛️', geography: '🌍'
    };
    return icons[subject] || '📚';
  };

  const renderOverviewAnalytics = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-600">{analyticsData.overview_metrics.total_classes}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-green-600">{analyticsData.overview_metrics.total_students}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-purple-600">{analyticsData.overview_metrics.total_messages}</div>
            <div className="text-sm text-gray-600">Questions Asked</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-orange-600">{analyticsData.overview_metrics.total_tests}</div>
            <div className="text-sm text-gray-600">Tests Taken</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl font-bold text-red-600">{analyticsData.overview_metrics.average_score}%</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>

        {/* Class Summary */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Class Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.class_summary.map((classData) => (
              <div
                key={classData.class_info.class_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedClass(classData.class_info);
                  setSelectedView('class');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{getSubjectIcon(classData.class_info.subject)}</div>
                  <span className="text-sm text-gray-500">{classData.student_count} students</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{classData.class_info.class_name}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Avg XP: {classData.average_xp}</div>
                  <div>Weekly Activity: {classData.weekly_activity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Distribution Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Activity Distribution</h3>
          <div className="space-y-3">
            {analyticsData.subject_distribution.map((item, index) => {
              const total = analyticsData.subject_distribution.reduce((sum, i) => sum + i.count, 0);
              const percentage = ((item.count / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="text-2xl">{getSubjectIcon(item.subject)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium capitalize">{item.subject}</span>
                      <span className="text-sm text-gray-600">{item.count} questions ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderClassAnalytics = () => {
    if (!analyticsData || !selectedClass) return null;

    return (
      <div className="space-y-6">
        {/* Class Header */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getSubjectIcon(selectedClass.subject)}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedClass.class_name}</h2>
                <p className="text-gray-600">{selectedClass.subject} • Grade {selectedClass.grade_level}</p>
                <p className="text-sm text-gray-500">Join Code: {selectedClass.join_code}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{analyticsData.student_count}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </div>
        </div>

        {/* Class Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.class_metrics.total_messages}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-green-600">{analyticsData.class_metrics.total_tests}</div>
            <div className="text-sm text-gray-600">Tests Taken</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-purple-600">{analyticsData.class_metrics.average_score.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-orange-600">{analyticsData.class_metrics.active_students}</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Student Performance</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.student_analytics).map(([studentId, data]) => (
              <div
                key={studentId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedStudent(studentId);
                  setSelectedView('student');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{data.profile.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{data.profile.name}</h4>
                      <p className="text-sm text-gray-600">Level {data.profile.level} • {data.profile.total_xp} XP</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{data.engagement.total_messages}</div>
                      <div className="text-xs text-gray-600">Questions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{data.performance.total_tests}</div>
                      <div className="text-xs text-gray-600">Tests</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{data.performance.average_score}%</div>
                      <div className="text-xs text-gray-600">Avg Score</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStudentAnalytics = () => {
    if (!analyticsData || !selectedStudent) return null;

    return (
      <div className="space-y-6">
        {/* Student Header */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{analyticsData.student_profile.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{analyticsData.student_profile.name}</h2>
                <p className="text-gray-600">Grade {analyticsData.student_profile.grade_level}</p>
                <p className="text-sm text-gray-500">
                  Level {analyticsData.overall_stats.current_level} • {analyticsData.overall_stats.total_xp} XP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.overall_stats.total_messages}</div>
            <div className="text-sm text-gray-600">Questions Asked</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-green-600">{analyticsData.overall_stats.total_tests}</div>
            <div className="text-sm text-gray-600">Tests Taken</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-purple-600">{analyticsData.overall_stats.average_test_score.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-orange-600">{analyticsData.overall_stats.study_streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Performance</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.subject_analytics).map(([subject, data]) => (
              data.total_messages > 0 && (
                <div key={subject} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getSubjectIcon(subject)}</div>
                      <h4 className="font-semibold capitalize">{subject}</h4>
                    </div>
                    <div className="text-sm text-gray-500">
                      {data.last_activity ? new Date(data.last_activity).toLocaleDateString() : 'No activity'}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{data.total_messages}</div>
                      <div className="text-xs text-gray-600">Questions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{data.total_tests}</div>
                      <div className="text-xs text-gray-600">Tests</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{data.average_score.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600">Avg Score</div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Wellness Data */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Wellness & Mindfulness</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analyticsData.wellness_data.mindfulness_sessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.wellness_data.total_mindfulness_minutes}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.wellness_data.mood_trends.length > 0 
                  ? (analyticsData.wellness_data.mood_trends.reduce((sum, m) => sum + m.improvement, 0) / analyticsData.wellness_data.mood_trends.length).toFixed(1)
                  : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Avg Mood Improvement</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('teacher-dashboard')}
                className="text-indigo-600 hover:text-indigo-800 text-2xl"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Track student performance and engagement</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{teacher?.name}</div>
              <div className="text-xs text-gray-600">{teacher?.school_name}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedView === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setSelectedView('class')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedView === 'class'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏫 Class Analytics
            </button>
            {selectedView === 'class' && (
              <div className="py-4">
                <select
                  value={selectedClass?.class_id || ''}
                  onChange={(e) => {
                    const classData = classes.find(c => c.class_id === e.target.value);
                    setSelectedClass(classData);
                  }}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name} ({cls.subject})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading analytics...</div>
          </div>
        ) : (
          <>
            {selectedView === 'overview' && renderOverviewAnalytics()}
            {selectedView === 'class' && renderClassAnalytics()}
            {selectedView === 'student' && renderStudentAnalytics()}
          </>
        )}
      </div>
    </div>
  );
};

// Teacher Dashboard Component
const TeacherDashboard = ({ teacher, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [classes, setClasses] = useState([]);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newClass, setNewClass] = useState({
    class_name: '',
    subject: 'math',
    grade_level: '9th',
    description: ''
  });

  useEffect(() => {
    loadTeacherClasses();
  }, []);

  const loadTeacherClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/teacher/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const createClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/teacher/classes`, newClass);
      setShowCreateClass(false);
      setNewClass({ class_name: '', subject: 'math', grade_level: '9th', description: '' });
      loadTeacherClasses();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  if (currentView === 'analytics') {
    return <TeacherAnalyticsDashboard teacher={teacher} onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Project K</h1>
                <p className="text-sm text-gray-600">Teacher Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{teacher?.name}</div>
                <div className="text-xs text-gray-600">{teacher?.school_name}</div>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome, {teacher?.name}! 👩‍🏫</h2>
              <p className="text-gray-600 mt-1">Manage your classes and track student progress</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentView('analytics')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setShowCreateClass(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                + Create Class
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🏫</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{classes.length}</div>
                <div className="text-sm text-gray-600">Active Classes</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {classes.reduce((total, cls) => total + cls.students.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(classes.map(cls => cls.subject)).size}
                </div>
                <div className="text-sm text-gray-600">Subjects Taught</div>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Classes</h2>
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Yet</h3>
              <p className="text-gray-600 mb-6">Create your first class to start teaching with Project K</p>
              <button
                onClick={() => setShowCreateClass(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                Create Your First Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div key={classItem.class_id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">
                      {classItem.subject === 'math' && '🧮'}
                      {classItem.subject === 'physics' && '⚡'}
                      {classItem.subject === 'chemistry' && '🧪'}
                      {classItem.subject === 'biology' && '🧬'}
                      {classItem.subject === 'english' && '📖'}
                      {classItem.subject === 'history' && '🏛️'}
                      {classItem.subject === 'geography' && '🌍'}
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {classItem.join_code}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{classItem.class_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{classItem.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Grade {classItem.grade_level}</span>
                    <span className="text-gray-600">{classItem.students.length} students</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Class</h2>
            <form onSubmit={createClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={newClass.class_name}
                  onChange={(e) => setNewClass(prev => ({ ...prev, class_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={newClass.subject}
                  onChange={(e) => setNewClass(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['math', 'physics', 'chemistry', 'biology', 'english', 'history', 'geography'].map(subject => (
                    <option key={subject} value={subject}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                <select
                  value={newClass.grade_level}
                  onChange={(e) => setNewClass(prev => ({ ...prev, grade_level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(grade => (
                    <option key={grade} value={grade}>{grade} Grade</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newClass.description}
                  onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateClass(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Chat Interface Component  
const ChatInterface = ({ student, subject, onNavigate }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (student && subject) {
      createSession();
      loadChatHistory();
    }
  }, [student, subject]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createSession = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/chat/session`, {
        subject: subject
      });
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/chat/history?subject=${subject}`);
      const history = [];
      response.data.forEach(msg => {
        history.push({
          text: msg.user_message,
          sender: 'user',
          timestamp: new Date(msg.timestamp).toLocaleTimeString()
        });
        history.push({
          text: msg.bot_response,
          sender: 'bot',
          bot_type: msg.bot_type,
          timestamp: new Date(msg.timestamp).toLocaleTimeString()
        });
      });
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || !sessionId || isLoading) return;

    const userMessage = { 
      text: message, 
      sender: 'user', 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/chat/message`, {
        session_id: sessionId,
        subject: subject,
        user_message: message
      });

      const botMessage = {
        text: response.data.bot_response,
        sender: 'bot',
        bot_type: response.data.bot_type,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBotIcon = (botType) => {
    if (botType?.includes('math')) return '🧮';
    if (botType?.includes('physics')) return '⚡';
    if (botType?.includes('chemistry')) return '🧪';
    if (botType?.includes('biology')) return '🧬';
    if (botType?.includes('english')) return '📖';
    if (botType?.includes('history')) return '🏛️';
    if (botType?.includes('geography')) return '🌍';
    if (botType?.includes('mindfulness')) return '🧘';
    return '🧠';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="text-indigo-600 hover:text-indigo-700"
              >
                ← Back
              </button>
              <div className="text-2xl">
                {subject === 'math' && '🧮'}
                {subject === 'physics' && '⚡'}
                {subject === 'chemistry' && '🧪'}
                {subject === 'biology' && '🧬'}
                {subject === 'english' && '📖'}
                {subject === 'history' && '🏛️'}
                {subject === 'geography' && '🌍'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{subject} Tutor</h1>
                <p className="text-sm text-gray-600">Personalized learning with AI</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-6xl mb-4">
                  {subject === 'math' && '🧮'}
                  {subject === 'physics' && '⚡'}
                  {subject === 'chemistry' && '🧪'}
                  {subject === 'biology' && '🧬'}
                  {subject === 'english' && '📖'}
                  {subject === 'history' && '🏛️'}
                  {subject === 'geography' && '🌍'}
                </div>
                <p className="text-lg">Ready to learn {subject}? Ask me anything!</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : message.error
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 shadow-md border border-gray-200'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">{getBotIcon(message.bot_type)}</span>
                      <span className="text-xs font-medium text-gray-600">
                        {message.bot_type?.includes('mindfulness') ? 'Mindfulness Guide' 
                         : message.bot_type?.includes('central') ? 'AI Tutor'
                         : `${subject?.charAt(0).toUpperCase() + subject?.slice(1)} Tutor`}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <div className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-md border border-gray-200 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-sm text-gray-600 ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything about ${subject}...`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading || !sessionId}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !sessionId || !inputMessage.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500 text-center">
              💡 I use the Socratic method - I'll guide you to the answer rather than just giving it to you!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('auth'); // 'auth', 'student-dashboard', 'teacher-dashboard', 'chat', etc.
  const [currentSubject, setCurrentSubject] = useState(null);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUserType = localStorage.getItem('user_type');
    const storedUser = localStorage.getItem('user');

    if (token && storedUserType && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setupAxiosAuth(token);
        setUser(userData);
        setUserType(storedUserType);
        
        if (storedUserType === 'student') {
          setCurrentView('student-dashboard');
          loadDashboardData();
        } else {
          setCurrentView('teacher-dashboard');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        handleLogout();
      }
    }
  }, []);

  const navigate = (view, subject = null) => {
    setCurrentView(view);
    if (subject) {
      setCurrentSubject(subject);
    }
  };

  const handleAuthSuccess = (userType, userData) => {
    setUser(userData);
    setUserType(userType);
    
    if (userType === 'student') {
      setCurrentView('student-dashboard');
      loadDashboardData();
    } else {
      setCurrentView('teacher-dashboard');
    }
  };

  const loadDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user');
    setupAxiosAuth(null);
    setUser(null);
    setUserType(null);
    setCurrentView('auth');
    setDashboardData(null);
  };

  if (currentView === 'auth') {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentView === 'student-dashboard') {
    return <StudentDashboard student={user} onNavigate={navigate} dashboardData={dashboardData} onLogout={handleLogout} />;
  }

  if (currentView === 'teacher-dashboard') {
    return <TeacherDashboard teacher={user} onLogout={handleLogout} />;
  }

  if (currentView === 'chat') {
    return <ChatInterface student={user} subject={currentSubject} onNavigate={navigate} />;
  }

  if (currentView === 'practice') {
    return <PracticeTestsComponent student={user} onNavigate={navigate} />;
  }

  if (currentView === 'mindfulness') {
    return <MindfulnessComponent student={user} onNavigate={navigate} />;
  }

  if (currentView === 'progress') {
    return <ProgressTracker student={user} onNavigate={navigate} />;
  }

  if (currentView === 'calendar') {
    return <CalendarComponent student={user} onNavigate={navigate} />;
  }

  if (currentView === 'notifications') {
    return <NotificationsComponent student={user} onNavigate={navigate} />;
  }

  if (currentView === 'classes') {
    return <MyClassesComponent student={user} onNavigate={navigate} />;
  }

  // Other views coming soon
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">🚧 Coming Soon!</h1>
      <p className="text-gray-600 mb-8">This feature is being built</p>
      <button
        onClick={() => navigate(userType === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
        className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600"
      >
        ← Back to Dashboard
      </button>
    </div>
  </div>;
}

export default App;