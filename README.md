# LearnLink - Frontend

![LearnLink](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)

A modern, feature-rich student collaboration platform built with **Next.js** and **React**. LearnLink empowers students to connect, collaborate, and succeed together through community Q&A, smart planning, direct messaging, and gamification features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [WebSocket Implementation](#websocket-implementation)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)
- [License](#license)

---

## 📱 Overview

**LearnLink** is a comprehensive student platform designed to enhance the academic experience through:

- **Peer Collaboration**: Connect with classmates and find study partners
- **Community Support**: Ask questions and get answers from the community
- **Smart Organization**: Plan your academic calendar and assignments
- **Real-time Communication**: Chat and coordinate with peers
- **Gamification**: Earn points and achievements to stay motivated
- **Progress Tracking**: Monitor your learning journey with detailed analytics

### 🎯 Target Users

- University and college students
- Online learners
- Study groups
- Academic institutions

---

## ✨ Features

### 1. **Community Q&A**
- Post questions and get answers from peers
- Upvote helpful responses
- Search through existing questions
- Tag-based categorization

### 2. **Study Partner Matching**
- Smart algorithm matching based on courses and learning styles
- Browse potential study partners
- View detailed profiles
- Send connection requests

### 3. **Smart Planner**
- Create and manage assignments
- Track exam schedules
- Personal study goals
- Calendar view with multiple perspectives
- Deadline notifications

### 4. **Direct Messaging**
- Real-time one-on-one conversations
- WebSocket-powered instant delivery
- Chat history and persistence
- Typing indicators

### 5. **Gamification System**
- Points and badges for contributions
- Leaderboards
- Achievement tracking
- Level progression

### 6. **Admin & Moderation**
- Content moderation dashboard
- User management
- Community guidelines enforcement
- Report handling

---

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 16.1.6** - React framework for production
- **React 19.2.3** - UI library with latest hooks
- **TypeScript 5.0** - Type-safe development

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS transformations
- **Lucide React** - Icon library

### State Management & Data Fetching
- **Zustand 5.0** - Lightweight state management
- **TanStack React Query 5.90** - Server state management
- **Axios 1.13** - HTTP client

### Real-time Communication
- **STOMP/WebSocket** - Real-time messaging
- **SockJS Client** - WebSocket fallback
- **Socket.IO Alternative Support**

### Forms & Validation
- **React Hook Form 7.71** - Flexible form management
- **Zod 4.3** - TypeScript-first schema validation
- **@hookform/resolvers** - Form resolution utilities

### Utilities
- **Clsx 2.1.1** - Conditional className utility
- **Tailwind Merge 3.5** - Merge Tailwind classes
- **Date-fns 4.1** - Date manipulation
- **JS Cookie 3.0** - Cookie management
- **React Hot Toast 2.6** - Toast notifications

---

## 📁 Project Structure

```
learn-link-frontend/
├── app/                              # Next.js App Router
│   ├── page.tsx                     # Home page
│   ├── layout.tsx                   # Root layout
│   ├── providers.tsx                # Global providers
│   ├── globals.css                  # Global styles
│   │
│   ├── auth/                        # Authentication routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── student/                     # Student dashboard routes
│   │   ├── page.tsx
│   │   ├── community/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── planner/page.tsx
│   │   ├── connections/page.tsx
│   │   ├── achievements/page.tsx
│   │   └── profile/page.tsx
│   │
│   ├── moderator/                   # Moderator routes
│   │   ├── page.tsx
│   │   └── moderation/page.tsx
│   │
│   └── admin/                       # Admin management routes
│       ├── users/page.tsx
│       ├── moderators/page.tsx
│       └── moderation/page.tsx
│
├── components/                       # Reusable React components
│   ├── community/                   # Community feature components
│   │   ├── PostCard.tsx
│   │   ├── PostComposer.tsx
│   │   ├── PostDetailsModal.tsx
│   │   ├── QuestionsSection.tsx
│   │   └── utils.ts
│   │
│   ├── messaging/                   # Messaging components
│   │   ├── ChatWindow.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ConversationList.tsx
│   │   └── MessageBubble.tsx
│   │
│   ├── connections/                 # Study partner components
│   │   ├── StudyPartnerCard.tsx
│   │   └── ProfileModal.tsx
│   │
│   ├── layout/                      # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── AuthLayout.tsx
│   │
│   └── ui/                          # Shared UI components
│       └── index.tsx
│
├── hookes/                           # Custom React hooks
│   ├── useDashboard.ts
│   ├── useMessaging.ts
│   ├── usePosts.ts
│   ├── useComments.ts
│   ├── useWebSocket.ts
│   ├── usePlanner.ts
│   ├── useGamification.ts
│   ├── useNotifications.ts
│   └── useAdminModeration.ts
│
├── lib/                              # Utility functions and API
│   ├── utils.ts                     # Helper functions
│   ├── api/
│   │   ├── api-client.ts            # Axios instance configuration
│   │   ├── types.ts                 # API type definitions
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── post.service.ts
│   │   │   ├── planner.service.ts
│   │   │   ├── gamification.service.ts
│   │   │   └── ...other services
│   │   └── websocket/
│   │       └── websocket services
│   │
│   └── stores/                      # Zustand stores
│       ├── message.store.ts
│       └── ...other stores
│
├── stores/                           # Zustand state management
│   └── ...stores
│
├── public/                           # Static assets
│
├── next.config.ts                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.mjs               # ESLint configuration
└── package.json                     # Project dependencies
```

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** ≥ 18.0 (LTS recommended)
- **npm** ≥ 9.0 or **yarn** ≥ 1.22
- **Git** for version control
- A code editor (VS Code recommended with TypeScript support)

---

## 💾 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/learn-link-frontend.git
cd learn-link-frontend
```

### 2. Install Dependencies

```bash
npm install
```

Or using Yarn:

```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

See [Environment Variables](#environment-variables) for detailed configuration.

---

## 🚀 Getting Started

### Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build for production:

```bash
npm run build
npm start
```

### Linting

Run ESLint:

```bash
npm run lint
```

---

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build optimized production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint validation |

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Authentication
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_FEATURE_GAMIFICATION=true
NEXT_PUBLIC_FEATURE_MESSAGING=true
NEXT_PUBLIC_FEATURE_MODERATION=true
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are accessible in the browser. Never expose sensitive data.

---

## 🏗 Architecture

### Technology Layers

```
┌─────────────────────────────────────────┐
│   Presentation Layer (React Components) │
├─────────────────────────────────────────┤
│   State Management (Zustand)            │
├─────────────────────────────────────────┤
│   Data Layer (React Query, Axios)       │
├─────────────────────────────────────────┤
│   Real-time Layer (WebSocket/STOMP)     │
├─────────────────────────────────────────┤
│   Backend API Layer (REST Endpoints)    │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → UI Component
2. **State Update** → Zustand Store
3. **API Call** → Axios Client
4. **Server Response** → React Query Cache
5. **Component Re-render** → Updated UI

---

## 🎨 Key Components

### Layout Components
- **DashboardLayout**: Main application layout with sidebar
- **AuthLayout**: Authentication pages layout
- **Navbar**: Top navigation with user menu
- **Sidebar**: Navigation menu for authenticated users

### Feature Components
- **PostCard**: Display community posts
- **PostComposer**: Create new posts
- **ChatWindow**: Real-time messaging interface
- **StudyPartnerCard**: Display potential study partners

### Hooks
- `useDashboard()` - Dashboard data and operations
- `useMessaging()` - Messaging functionality
- `usePosts()` - Community posts management
- `useWebSocket()` - WebSocket connection management

---

## 🔌 API Integration

### API Client Setup

The Axios client is configured in `lib/api/api-client.ts`:

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Service Examples

All API services are in `lib/api/services/`:

```typescript
// User authentication
import { AuthService } from '@/lib/api/services/auth.service';

// Posts and comments
import { PostService } from '@/lib/api/services/post.service';

// Messaging
import { MessageService } from '@/lib/api/services/message.service';
```

---

## ⚡ WebSocket Implementation

Real-time features use WebSocket with STOMP protocol:

```typescript
import { useWebSocket } from '@/hookes/useWebSocket';

const { connected, sendMessage, disconnect } = useWebSocket();
```

See `WEBSOCKET_LIFECYCLE_ANALYSIS.md` for detailed WebSocket documentation.

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Keep components small and focused
- Use custom hooks for logic extraction

### Component Structure
```typescript
'use client'; // Mark client components explicitly

import { useState } from 'react';
import { useApiService } from '@/hookes';

export default function MyComponent() {
  const [state, setState] = useState();
  
  return (
    <div className="flex items-center justify-center">
      {/* Component content */}
    </div>
  );
}
```

### File Naming Conventions
- Components: PascalCase (e.g., `PostCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `usePosts.ts`)
- Utils: camelCase (e.g., `utils.ts`)
- Types: PascalCase (e.g., `types.ts`)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Guidelines
- Provide a clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass and linting succeeds
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@learnlink.app
- Documentation: https://docs.learnlink.app

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- React community for continuous innovation
- Tailwind CSS for utility-first styling
- All contributors and users of LearnLink

---

**Happy Learning! 🎓**
