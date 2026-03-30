# 🚀 1-on-1 Mentorship Platform

## 🌐 Live Demo
Frontend: https://your-app.vercel.app  
Backend: https://your-backend.onrender.com  

## ✨ Features
- 🔐 Authentication (Mentor / Student)
- 📅 Session Management
- 💻 Real-time Code Editor (Monaco + Socket.io)
- 💬 Live Chat
- 🎥 1-on-1 Video Call (WebRTC)
- 🔄 Real-time Sync

## 🛠 Tech Stack
- Frontend: Next.js, Tailwind
- Backend: Node.js, Express
- Realtime: Socket.io
- Database: Supabase
- Video: WebRTC

## ⚙️ Setup
```bash
npm install
npm run dev



## 🎯 MVP Scope (Minimum Viable Product)

This project focuses on building a minimal 1-on-1 mentor-student platform with core real-time features.

### ✅ Features Included

* User Authentication (Mentor / Student)
* Session Creation (Mentor)
* Session Joining via Link (Student)
* Real-time Collaborative Code Editor
* Real-time Chat Messaging
* Basic 1-on-1 Video Calling (camera + mic)

### ❌ Features Excluded (Future Scope)

* Payments
* Screen sharing
* Code execution
* Advanced UI/UX



## 🏗️ Architecture Design

The application follows a full-stack architecture with real-time communication.

### 🔹 Frontend

* Built with Next.js (React + TypeScript)
* Handles UI, video interface, chat, and code editor

### 🔹 Backend

* Built with Node.js and Express
* Handles APIs and real-time communication via Socket.io

### 🔹 Database

* PostgreSQL (via Supabase)
* Stores users, sessions, and messages

### 🔹 Real-time Layer

* Socket.io for chat and code editor synchronization
* WebRTC for peer-to-peer video/audio communication

### 🔄 Data Flow

User → Frontend → Backend → Database
↓
Socket.io / WebRTC (real-time)

## 🗄️ ER Diagram (Database Design)

### 👤 Users Table

* id (UUID, Primary Key)
* email (Text)
* role (Mentor / Student)
* created_at (Timestamp)

### 🧑‍🤝‍🧑 Sessions Table

* id (UUID, Primary Key)
* mentor_id (UUID, Foreign Key → Users.id)
* student_id (UUID, Foreign Key → Users.id)
* created_at (Timestamp)

### 💬 Messages Table

* id (UUID, Primary Key)
* session_id (UUID, Foreign Key → Sessions.id)
* sender_id (UUID, Foreign Key → Users.id)
* content (Text)
* created_at (Timestamp)

---

### 🔗 Relationships

* One **User (Mentor)** can create many **Sessions**
* One **Session** belongs to one **Mentor** and one **Student**
* One **Session** can have many **Messages**
* Each **Message** belongs to one **User**


