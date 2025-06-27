import React, { useState, useEffect } from 'react';
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

// Notes Component
const NotesComponent = ({ student, onNavigate }) => {
  const [currentView, setCurrentView] = useState('library'); // library, generate, view
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Note generation form
  const [noteForm, setNoteForm] = useState({
    subject: '',
    topic: '',
    note_type: 'comprehensive'
  });

  const subjects = ['math', 'physics', 'chemistry', 'biology', 'english', 'history', 'geography'];
  const noteTypes = [
    { id: 'comprehensive', name: 'Comprehensive Notes', description: 'Detailed notes with examples and explanations' },
    { id: 'summary', name: 'Summary Notes', description: 'Concise overview of key points' },
    { id: 'quick_reference', name: 'Quick Reference', description: 'Essential formulas and facts' }
  ];

  useEffect(() => {
    if (currentView === 'library') {
      loadNotes();
    }
  }, [currentView, filterSubject, showFavoritesOnly]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSubject) params.append('subject', filterSubject);
      if (showFavoritesOnly) params.append('favorites_only', 'true');
      
      const response = await axios.get(`${API_BASE}/api/notes?${params}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotes = async () => {
    if (!noteForm.subject || !noteForm.topic.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${API_BASE}/api/notes/generate`, {
        subject: noteForm.subject,
        topic: noteForm.topic.trim(),
        note_type: noteForm.note_type
      });

      // Show the generated note
      setSelectedNote(response.data);
      setCurrentView('view');
      
      // Reset form
      setNoteForm({ subject: '', topic: '', note_type: 'comprehensive' });
      
      // Reload notes library
      setTimeout(() => loadNotes(), 1000);
      
    } catch (error) {
      console.error('Error generating notes:', error);
      alert('Error generating notes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const viewNote = async (noteId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/notes/${noteId}`);
      setSelectedNote(response.data);
      setCurrentView('view');
    } catch (error) {
      console.error('Error loading note:', error);
    }
  };

  const toggleFavorite = async (noteId) => {
    try {
      await axios.put(`${API_BASE}/api/notes/${noteId}/favorite`);
      loadNotes(); // Reload to reflect changes
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`${API_BASE}/api/notes/${noteId}`);
      loadNotes(); // Reload to reflect changes
      if (selectedNote && selectedNote.id === noteId) {
        setCurrentView('library');
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      math: '🧮', physics: '⚡', chemistry: '🧪', biology: '🧬',
      english: '📖', history: '🏛️', geography: '🌍'
    };
    return icons[subject] || '📝';
  };

  const formatNoteContent = (content) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-800 mb-3 mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-700 mb-2 mt-4">$1</h3>')
      .replace(/^\* (.+)$/gm, '<li class="text-gray-700 mb-1">$1</li>')
      .replace(/^- (.+)$/gm, '<li class="text-gray-700 mb-1">$1</li>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 mb-3">')
      .replace(/\n/g, '<br>');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Generate Notes View
  if (currentView === 'generate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setCurrentView('library')}
              className="text-indigo-600 hover:text-indigo-700 mr-4"
            >
              ← Back to Library
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📝 Generate Notes</h1>
              <p className="text-gray-600">Create comprehensive study notes for any topic</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <select
                  name="subject"
                  value={noteForm.subject}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {getSubjectIcon(subject)} {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
                <input
                  type="text"
                  value={noteForm.topic}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Quadratic Equations, Photosynthesis, World War II"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {noteTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setNoteForm(prev => ({ ...prev, note_type: type.id }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        noteForm.note_type === type.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium mb-1">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={generateNotes}
                  disabled={generating || !noteForm.subject || !noteForm.topic.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating Notes...
                    </div>
                  ) : (
                    'Generate Notes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // View Note View
  if (currentView === 'view' && selectedNote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setCurrentView('library')}
              className="text-indigo-600 hover:text-indigo-700 mr-4"
            >
              ← Back to Library
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{selectedNote.topic}</h1>
              <div className="flex items-center text-gray-600">
                <span className="mr-2">{getSubjectIcon(selectedNote.subject)}</span>
                <span className="capitalize">{selectedNote.subject}</span>
                <span className="mx-2">•</span>
                <span>{new Date(selectedNote.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleFavorite(selectedNote.id)}
                className="p-2 rounded-full hover:bg-gray-100"
                title={selectedNote.is_favorite ? "Remove from favorites" : "Add to favorites"}
              >
                {selectedNote.is_favorite ? (
                  <span className="text-2xl">⭐</span>
                ) : (
                  <span className="text-2xl">☆</span>
                )}
              </button>
              <button
                onClick={() => deleteNote(selectedNote.id)}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Delete note"
              >
                <span className="text-2xl">🗑️</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div 
              className="prose prose-indigo max-w-none"
              dangerouslySetInnerHTML={{ __html: `<p class="text-gray-700 mb-3">${formatNoteContent(selectedNote.content)}</p>` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Library View (Default)
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
              <h1 className="text-3xl font-bold text-gray-900">📚 My Notes</h1>
              <p className="text-gray-600">Your personal study notes library</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('generate')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Generate New Notes
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </option>
                ))}
              </select>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700">Favorites only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => viewNote(note.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="text-xl">{getSubjectIcon(note.subject)}</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 capitalize">{note.subject}</div>
                        <div className="text-xs text-gray-500">{new Date(note.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {note.is_favorite && <div className="text-yellow-500">⭐</div>}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{note.topic}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{note.content.replace(/#+\s|[*_]/g, '')}</p>
                </div>
                <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {note.note_type === 'comprehensive' && 'Comprehensive Notes'}
                    {note.note_type === 'summary' && 'Summary Notes'}
                    {note.note_type === 'quick_reference' && 'Quick Reference'}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(note.id);
                      }}
                      className="text-gray-400 hover:text-yellow-500"
                    >
                      {note.is_favorite ? '⭐' : '☆'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterSubject || showFavoritesOnly
                ? "No notes match your current filters. Try adjusting your search or filters."
                : "You haven't created any notes yet. Click the 'Generate New Notes' button to get started!"}
            </p>
            {(searchTerm || filterSubject || showFavoritesOnly) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSubject('');
                  setShowFavoritesOnly(false);
                }}
                className="text-indigo-600 hover:text-indigo-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <button
            onClick={() => onNavigate('progress')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress Tracker</h3>
            <p className="text-sm text-gray-600">View your learning progress and achievements</p>
          </button>
          <button
            onClick={() => onNavigate('notes')}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-gray-900 mb-2">My Notes</h3>
            <p className="text-sm text-gray-600">Access your study notes library</p>
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

function App() {
  const [currentView, setCurrentView] = useState('auth'); // 'auth', 'student-dashboard', 'teacher-dashboard', 'chat', etc.
  const [currentSubject, setCurrentSubject] = useState(null);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [classPerformance, setClassPerformance] = useState(null);
  const [testResultsLoading, setTestResultsLoading] = useState(false);
  const [filters, setFilters] = useState({
    class_id: '',
    student_id: '',
    subject: ''
  });

  const loadTestResults = async (classId = '', studentId = '', subject = '') => {
    setTestResultsLoading(true);
    try {
      const params = new URLSearchParams();
      if (classId) params.append('class_id', classId);
      if (studentId) params.append('student_id', studentId);
      if (subject) params.append('subject', subject);
      
      const response = await axios.get(`${API_BASE}/api/teacher/analytics/test-results?${params}`);
      setTestResults(response.data.test_results || []);
    } catch (error) {
      console.error('Error loading test results:', error);
      setTestResults([]);
    } finally {
      setTestResultsLoading(false);
    }
  };

  const loadClassPerformance = async (classId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/teacher/analytics/class-performance/${classId}`);
      setClassPerformance(response.data);
    } catch (error) {
      console.error('Error loading class performance:', error);
      setClassPerformance(null);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/teacher/analytics/overview`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error loading overview analytics:', error);
      // Set default structure to prevent crashes
      setAnalyticsData({
        overview_metrics: {
          total_classes: 0,
          total_students: 0,
          total_messages: 0,
          total_tests: 0,
          average_score: 0
        },
        class_summary: [],
        subject_distribution: [],
        weekly_activity_trend: []
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (currentView === 'notes') {
    return <NotesComponent student={user} onNavigate={navigate} />;
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