# 🩺 AI-Powered Disease Prediction & Doctor Recommendation System

## 🚀 Overview

This project is an intelligent healthcare web application that bridges the gap between patients and doctors using an AI-driven approach.

The system allows users to interact through a chatbot, describe their symptoms in natural language, and receive:

- Structured symptom extraction (via LLM)
- Disease prediction (via Machine Learning)
- Doctor recommendations
- Appointment booking with payment integration

---

## 🧠 Key Features

- 💬 **Chatbot-based Symptom Input**
  - Users can describe symptoms naturally
  - Supports multi-turn conversation with follow-up questions

- 🤖 **LLM-based Symptom Extraction**
  - Uses Gemini API to extract structured symptoms from conversation
  - Maintains session-based conversational context
  - Implements conversation summarization for scalability

- 🧬 **Machine Learning Disease Prediction**
  - Uses Naïve Bayes classifier
  - Predicts disease with confidence score based on symptoms

- 👨‍⚕️ **Doctor Recommendation System**
  - Suggests doctors based on predicted disease and specialization

- 📅 **Appointment Booking System**
  - Includes slot management and integrated payment handling

- 📊 **Medical History & Review System**
  - Tracks patient history and doctor feedback

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **UI Components:** Shadcn UI, Lucide Icons
- **Content:** React Markdown, Remark GFM

### Backend

- **Runtime:** Node.js (Express.js)
- **AI/LLM:** Google Gemini Pro API (`@google/genai`)
- **State Management:** `express-session` for conversational context
- **Logging:** Winston (with daily rotation)
- **Error Handling:** Centralized middleware

---

## 🏗️ Getting Started

Follow these steps to set up and run the application locally.

### 📋 Prerequisites

- **Node.js:** v18.x or higher
- **NPM:** v9.x or higher
- **Gemini API Key:** Obtain one from [Google AI Studio](https://aistudio.google.com/)

### 🔧 Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/SRSA.git
   cd SRSA
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   npm install
   ```

   - Create a `.env` file in the `backend/` directory:
     ```env
     PORT=5000
     GEMINI_API_KEY=YOUR_GEMINI_API_KEY
     FRONTEND_URL=http://127.0.0.1:3000
     NODE_ENV=development
     ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

   - Create a `.env` file in the `frontend/` directory:
     ```env
     BACKEND_URL=http://127.0.0.1:5000
     ```

---

---

## 🚀 Running the Application

### Option 1: Simplified (Recommended)
You can run both the frontend and backend concurrently from the root directory.

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run both servers:**
   ```bash
   npm run dev
   ```

### Option 2: Individual Components
If you prefer to run them separately:

#### 1. Start the Backend
```bash
cd backend
npm run dev
```
The backend server will start at `http://127.0.0.1:5000`.

#### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
The frontend application will be available at `http://127.0.0.1:3000`.

---

