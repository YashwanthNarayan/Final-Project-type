# Project K - AI Educational Platform

## 🎓 About
An AI-powered educational platform with personalized tutoring, practice tests, and progress tracking for students and teachers.

## ✨ Features
- 🤖 AI Tutoring with 7 subject-specific bots
- 📝 AI-generated practice tests with multiple question types
- 📊 Detailed progress tracking and analytics
- 🏫 Class management for teachers
- 🧘 Mindfulness and wellness tools
- 📅 Study scheduling and calendar
- 🔔 Real-time notifications
- 🎮 Gamification with XP and achievements

## 🚀 Live Demo
- **Frontend**: [https://your-project.vercel.app](https://your-project.vercel.app)
- **API Docs**: [https://your-backend.railway.app/docs](https://your-backend.railway.app/docs)

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS, Axios
- **Backend**: FastAPI, Python 3.11
- **Database**: MongoDB Atlas
- **AI**: Google Gemini API
- **Auth**: JWT with bcrypt
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📋 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Gemini API key

### Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/project-k.git
cd project-k
```

2. Backend setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn server:app --reload
```

3. Frontend setup
```bash
cd frontend
npm install
npm start
```

## 🚀 Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License
MIT License

## 🙋‍♂️ Support
For questions or support, please open an issue or contact [your-email@example.com]