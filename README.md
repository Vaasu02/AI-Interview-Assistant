# AI-Powered Interview Assistant

A comprehensive React application that serves as an AI-powered interview assistant for Full Stack Developer positions.

## Features

### 🎯 Core Functionality
- **Two-Tab Interface**: Seamlessly switch between Interviewee and Interviewer views
- **Resume Upload & Parsing**: Supports PDF and DOCX files with automatic field extraction
- **AI-Powered Questions**: Dynamic question generation using Google Gemini AI
- **Real-time Scoring**: Intelligent answer evaluation and scoring
- **Timer System**: Question-specific timers (Easy: 20s, Medium: 60s, Hard: 120s)
- **Data Persistence**: All progress saved locally with Redux Persist

### 👤 Interviewee Experience
- Upload resume (PDF/DOCX supported)
- Automatic extraction of Name, Email, Phone
- Interactive chat interface with AI interviewer
- Real-time question timer with visual feedback
- Progress tracking throughout the interview
- 6 questions total: 2 Easy → 2 Medium → 2 Hard

### 👨‍💼 Interviewer Dashboard
- Complete candidate management system
- Sortable and searchable candidate list
- Detailed candidate profiles with scores
- Full interview history and chat logs
- AI-generated summaries and recommendations
- Export capabilities for candidate data

### 🔧 Technical Features
- **State Management**: Redux Toolkit with persistence
- **UI Framework**: Ant Design components
- **AI Integration**: Google Gemini AI for questions and evaluation
- **File Processing**: PDF.js and Mammoth for resume parsing
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Comprehensive error management
- **Welcome Back Modal**: Resume interrupted sessions

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-interview-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
echo "VITE_GEMINI_API_KEY=your_gemini_api_key_here" > .env
```

4. Get your Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate an API key
   - Replace `your_gemini_api_key_here` in the .env file

5. Start the development server:
```bash
npm run dev
```

## Usage

### For Candidates (Interviewee Tab)
1. Upload your resume (PDF or DOCX)
2. Verify/complete your contact information
3. Start the interview when ready
4. Answer 6 questions within the time limits
5. View your final score and feedback

### For Interviewers (Interviewer Tab)
1. View all candidates in the dashboard
2. Sort and filter candidates by various criteria
3. Click on any candidate to view detailed results
4. Review interview questions, answers, and AI evaluations
5. Access complete chat history and AI summaries

## Technology Stack

- **Frontend**: React 18 + Vite
- **State Management**: Redux Toolkit + Redux Persist
- **UI Library**: Ant Design
- **AI Service**: Google Gemini AI
- **File Processing**: PDF.js + Mammoth
- **Styling**: Tailwind CSS + Custom CSS
- **Routing**: React Router DOM
- **Notifications**: React Toastify

## Key Features Explained

### Resume Parsing
- Extracts Name, Email, and Phone from uploaded resumes
- Supports both PDF and DOCX formats
- Handles missing fields with user prompts
- Validates extracted information

### AI Integration
- Generates contextual interview questions
- Evaluates answers in real-time
- Provides detailed feedback and scoring
- Creates comprehensive candidate summaries

### Timer System
- Visual countdown timers for each question
- Different time limits based on difficulty
- Auto-submission when time expires
- Time usage tracking for evaluation

### Data Persistence
- All interview data saved locally
- Resume sessions after browser refresh
- Welcome back modal for interrupted interviews
- Complete interview history preservation

## Project Structure

```
src/
├── components/
│   ├── Layout/           # App layout and navigation
│   ├── Interviewee/      # Candidate-facing components
│   ├── Interviewer/      # Interviewer dashboard components
│   └── Modals/           # Modal components
├── store/
│   └── slices/           # Redux slices for state management
├── utils/
│   ├── geminiAI.js       # AI service integration
│   └── resumeParser.js   # Resume parsing utilities
└── App.jsx               # Main application component
```



