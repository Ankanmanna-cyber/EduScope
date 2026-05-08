# EduScope
AI POWERED CLASSROOM ENGAGEMENT ANALYZER
EduScope is an AI-powered classroom engagement monitoring system designed to analyze student attention, emotions, and classroom participation in real-time. The project combines Artificial Intelligence, Computer Vision, and Full-Stack Web Development to help teachers and educational institutions improve classroom interaction and learning outcomes through intelligent analytics and monitoring.

Features
EduScope provides real-time classroom engagement monitoring by detecting student presence, analyzing attention levels, and tracking participation during classroom sessions. The system also performs emotion analysis to identify whether students are focused, distracted, or sleepy. A smart analytics dashboard allows teachers to monitor live engagement scores, classroom activity, and session insights in an easy and interactive way.

Tech Stack
The frontend of EduScope is developed using React.js to create a modern and responsive user interface. The backend is built with Node.js and Express for handling APIs, authentication, and data management. MongoDB is used as the database to store session details and engagement records. The AI engine is developed in Python using TensorFlow, DeepFace, OpenCV, and Mediapipe for face detection, emotion analysis, and classroom monitoring functionalities.

Project Structure
The project is divided into three main sections: frontend, backend, and AI engine. The frontend handles the user interface and dashboard system, the backend manages APIs and database communication, and the AI engine processes classroom video analysis and emotion detection using computer vision models.
eduscope/
│
├── frontend/
├── backend/
├── ai_engine/
└── README.md

Installation
To set up the project locally, first clone the repository from GitHub and move into the project directory using Git commands.
git clone https://github.com/your-username/eduscope.git
cd eduscope

 #1 Backend Setup
For the backend setup, navigate to the backend folder, install all required Node.js dependencies, and start the Express server. The backend service runs on port 5000 and handles API requests, authentication, and database operations.
cd backend
npm install
node server.js

Backend URL: http://localhost:5000

#2 Frontend Setup
For the frontend setup, navigate to the frontend folder, install the required packages, and start the React development server. The frontend dashboard runs on port 5173 and provides the user interface for monitoring classroom engagement and analytics.
cd frontend
npm install
npm run dev
Frontend URL: http://localhost:5173

#3 AI Engine Setup
The AI engine is developed using Python and requires a virtual environment for dependency management. After creating and activating the virtual environment, install TensorFlow, DeepFace, Mediapipe, OpenCV, and Flask libraries. Once the dependencies are installed, run the AI service to start real-time engagement and emotion analysis.

#4 API Endpoints
EduScope provides REST API endpoints for user authentication and AI-based classroom analysis. The /run-ai endpoint is used to trigger AI analysis, while authentication routes manage user login and registration. Engagement data can also be fetched using the latest engagement API endpoint.

#5 Future Improvements
Future versions of EduScope may include advanced eye-tracking systems, voice analysis, cloud deployment, multi-classroom support, mobile applications, and more detailed AI-powered analytics to improve classroom intelligence and educational insights.

#6 Team
EduScope is developed collaboratively by frontend developers, backend developers, AI engineers, and database engineers working together to build an intelligent classroom engagement platform.
