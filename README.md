# PrepMaster - AI-Powered Exam Preparation Platform

A full-stack web application for exam preparation with role-based access control, test management, and analytics.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: Firebase Authentication (Google + Phone OTP)

## Features

### Authentication
- Google Sign-in (Popup)
- Phone OTP Login
- Role-based access (Student, Admin, Super Admin)

### Student Panel
- Dashboard with stats and recent results
- Browse and filter available tests
- Take tests with timer and navigation
- View detailed results with analytics
- Weak/Strong topics identification

### Admin Panel
- Dashboard with overview stats
- Question management (add, bulk upload CSV)
- Test creation and management
- Student performance tracking

### Super Admin Panel
- Platform analytics
- Admin management
- User management (block/unblock)
- Content approval system

## Project Structure

```
PrepMaster/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # Node.js API
│   ├── src/
│   │   ├── config/        # Database & Firebase config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Mongoose models
│   │   └── routes/        # API routes
│   └── package.json
└── package.json       # Root workspace config
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Firebase project

### 1. Clone and Install Dependencies

```bash
cd PrepMaster
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Configuration

**Backend (.env)**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prepmaster
FIREBASE_PROJECT_ID=mock-test81
FIREBASE_CLIENT_EMAIL=your-service-account-email@mock-test81.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your-private-key
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Google and Phone providers)
3. Get your Firebase config and update `frontend/src/config/firebase.js`
4. Generate a service account key for the backend

### 4. Run the Application

**Development mode (runs both frontend and backend)**:
```bash
npm run dev
```

**Or run separately**:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

The frontend will run on `http://localhost:5173` and backend on `http://localhost:5000`.

## API Endpoints

### Auth
- `POST /api/users/sync` - Sync Firebase user to MongoDB
- `GET /api/users/profile` - Get user profile

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question
- `POST /api/questions/bulk` - Bulk upload CSV
- `DELETE /api/questions/:id` - Delete question

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/available` - Get available tests for students
- `POST /api/tests` - Create test
- `GET /api/tests/:id/attempt` - Get test for attempting

### Results
- `POST /api/results` - Submit test result
- `GET /api/results/user/:userId` - Get user results
- `GET /api/results/:id` - Get result details
- `GET /api/results/analytics/platform` - Platform analytics

## CSV Upload Format

For bulk question upload, use this CSV format:

```csv
question,option1,option2,option3,option4,correctAnswer,subject,topic,difficulty
"What is 2+2?","2","3","4","5","2","Mathematics","Basic Arithmetic","easy"
```

Note: `correctAnswer` is 0-indexed (0=option1, 1=option2, etc.)

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Set up database user
3. Whitelist IP addresses
4. Get connection string and update backend .env

## License

MIT
