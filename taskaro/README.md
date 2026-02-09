# 🚀 Taskaro – Task Tracking & Team Management App

Taskaro is a modern full-stack task tracking and team collaboration application built with Next.js. It allows teams to manage tasks, assign work, track progress, and collaborate in real time using a clean, scalable, and secure architecture.

## ✨ Features
- Secure authentication & authorization
- Role-based access (Admin & Members)
- Workspace & team management
- Task creation, assignment & tracking
- Real-time notifications
- Subscription & plan management
- Responsive modern UI
- Real-time updates using Socket.io

## 🧱 Tech Stack
Frontend:
- Next.js 15
- React 19
- Tailwind CSS
- Zustand / Redux Toolkit
- Framer Motion

Backend:
- Next.js API Routes
- Node.js
- Express (Socket.io server)
- MongoDB & Mongoose

Auth & Realtime:
- NextAuth
- Socket.io
- JWT

Other Tools:
- Razorpay (Payments)
- Nodemailer (Emails)
- Web Push Notifications

## 📁 Project Structure
```text
taskaro/
├── app/                 # Next.js App Router
│   ├── api/             # Backend APIs
│   ├── dashboard/       # Protected pages
│   └── auth/            # Authentication pages
├── components/          # Reusable components
├── models/              # Database models
├── lib/                 # Helpers & utilities
├── server.js            # Socket.io server
├── public/              # Static assets
└── README.md
```

## ⚙️ Installation & Setup
```bash
1. Clone the repository
git clone https://github.com/your-username/taskaro.git
cd taskaro

2. Install dependencies
npm install

3. Create .env.local file
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=your_mongodb_uri
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
EMAIL_HOST=smtp_host
EMAIL_USER=email
EMAIL_PASS=password
```

## ▶️ Run Project
Start Next.js app:
npm run dev

Start Socket.io server (separate terminal):
npm run dev:socket

## 🔐 Authentication
Authentication is handled using NextAuth with role-based route protection and secure API access.

## 🔔 Real-Time Features
- Task assignment notifications
- Team activity updates
- Persistent notifications stored in MongoDB
- Socket.io based real-time communication

## 💳 Subscription System
- Free & Paid plans
- Feature-based limits
- Razorpay integration
- Secure server-side payment handling

## 🚀 Deployment
- Frontend & APIs: Vercel
- Database: MongoDB Atlas
- Socket server: Deploy separately if required

## 📄 License
This project is private and intended for internal use or learning purposes.

## 🤝 Contributing
Contributions are welcome via pull requests.

## 📬 Contact
For queries or collaboration, feel free to reach out.
