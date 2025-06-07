# Quiz App - Kế hoạch & Todo

## 📋 Thành viên nhóm

| Tên              | GitHub Username | Chuyên môn              |
| ---------------- | --------------- | ----------------------- |
| Trần Thành Long  | nielpattin      | Backend/Core Systems    |
| Vương Quang Quý  | akitosuref      | Quiz Management UI      |
| Nguyễn Xuân Mạnh | xuanmanh-2110   | Auth & Results UI       |
| Vũ Văn Sơn       | sunyn582        | Dashboard & Sessions UI |

## 🎯 Phạm vi dự án

### Ưu tiên 1 (Bắt buộc):

- ✅ Google OAuth Authentication
- ✅ Quiz CRUD (Create, Read, Update, Delete)
- ✅ Self-Paced Sessions với quản lý nâng cao
- ✅ Dashboard cơ bản và kết quả

### Ưu tiên 2 (Tùy chọn):

- 🔄 Báo cáo nâng cao
- 🔄 Live Quiz (tính năng real-time)

## 📅 Các giai đoạn phát triển

### Giai đoạn 1: Nền tảng

- Thiết lập core và hạ tầng
- Triển khai authentication
- Landing pages và UI cơ bản
- Hệ thống login
- Layout dashboard

### Giai đoạn 2: Hệ thống Quiz

- Thiết kế database schema
- Phát triển Quiz CRUD API
- Hệ thống quản lý session
- Giao diện Quiz Editor
- Giao diện Quiz Library
- Các component dashboard

### Giai đoạn 3: Chơi & Hoàn thiện

- Logic Quiz Player
- Hệ thống kết quả
- Giao diện Quiz Player
- Giao diện kết quả & lịch sử
- Session Dashboard
- Tích hợp & kiểm thử

---

# 👥 Phân công nhiệm vụ cá nhân

## 🔧 nielpattin - Backend/Core Systems

### Giai đoạn 1: Nền tảng

#### Thiết lập dự án & hạ tầng core

- [x] Thiết lập Auth.js với Google OAuth provider trong [`src/hooks.server.ts`](src/hooks.server.ts)
- [x] Cấu hình environment variables và secrets trong [`.env`](.env)
- [ ] Thiết lập session management và middleware
- [ ] Kiểm thử Google OAuth flow từ đầu đến cuối
- [ ] Cập nhật user table schema trong [`src/lib/server/db/schema.ts`](src/lib/server/db/schema.ts:1) cho authentication

#### Hệ thống Authentication

- [ ] Triển khai protected routes và middleware
- [ ] Tạo user session management utilities
- [ ] Thiết lập role-based access (User/Admin)
- [ ] Kiểm thử authentication flows với các providers khác nhau
- [ ] Tạo auth utilities cho frontend sử dụng trong [`src/lib/auth.ts`](src/lib/auth.ts)

### Giai đoạn 2: Quiz System Core

#### Database Schema

- [ ] Thiết kế quiz, question, answer tables trong [`src/lib/server/db/schema.ts`](src/lib/server/db/schema.ts:1)
- [ ] Tạo session và attempt tracking tables
- [ ] Thiết lập database relationships và foreign keys
- [ ] Viết migration files và kiểm thử schema
- [ ] Push schema changes sử dụng [`pnpm db:push`](package.json:16)

#### Quiz CRUD API

- [ ] Tạo quiz endpoints trong [`src/routes/api/quiz/+server.ts`](src/routes/api/quiz/+server.ts)
- [ ] Triển khai question management trong [`src/routes/api/quiz/[id]/questions/+server.ts`](src/routes/api/quiz/[id]/questions/+server.ts)
- [ ] Xây dựng quiz update/delete endpoints
- [ ] Thêm image upload handling cho questions
- [ ] Tạo quiz validation và error handling

#### Session Management

- [ ] Triển khai session creation API trong [`src/routes/api/sessions/+server.ts`](src/routes/api/sessions/+server.ts)
- [ ] Xây dựng session state management và validation
- [ ] Tạo session join logic và participant tracking
- [ ] Thêm session expiration và cleanup handling

### Giai đoạn 3: Quiz Playing & Results

#### Quiz Player Logic

- [ ] Xây dựng attempt tracking trong [`src/routes/api/attempts/+server.ts`](src/routes/api/attempts/+server.ts)
- [ ] Triển khai answer submission và validation
- [ ] Tạo scoring calculation và timing logic
- [ ] Thêm progress saving và resume functionality
- [ ] Xây dựng quiz completion và results calculation

#### Results & Integration

- [ ] Tạo results API endpoints
- [ ] Triển khai attempt history và comparison logic
- [ ] Xây dựng basic analytics cho sessions
- [ ] Kiểm thử backend cuối cùng và tối ưu hóa
- [ ] Deploy và cấu hình production environment

---

## 🎨 akitosuref - Quiz Management UI

### Giai đoạn 1: Landing & Navigation

#### Landing Pages

- [ ] Cập nhật home page trong [`src/routes/+page.svelte`](src/routes/+page.svelte:1) với hero section
- [ ] Tạo navigation components trong [`src/lib/components/Header.svelte`](src/lib/components/Header.svelte)
- [ ] Xây dựng responsive layout và mobile navigation
- [ ] Thêm loading states và error handling components
- [ ] Tạo footer và cải thiện cấu trúc trang tổng thể
- [ ] Xóa database testing content khỏi home page

### Giai đoạn 2: Quiz Management UI

#### Quiz Editor

- [ ] Xây dựng quiz creation form trong [`src/routes/quiz/create/+page.svelte`](src/routes/quiz/create/+page.svelte)
- [ ] Tạo question editor với drag-drop trong [`src/lib/components/QuestionEditor.svelte`](src/lib/components/QuestionEditor.svelte)
- [ ] Triển khai answer option management components
- [ ] Thêm image upload component cho questions
- [ ] Xây dựng quiz settings (time limits, points, question types)

#### Hoàn thiện Quiz Editor

- [ ] Thêm question type selection (Multiple choice, True/False)
- [ ] Triển khai quiz preview functionality
- [ ] Thêm comprehensive form validation và error handling
- [ ] Tạo quiz duplication và template features

### Giai đoạn 3: Quiz Playing Experience

#### Quiz Player UI

- [ ] Xây dựng self-paced quiz player trong [`src/routes/play/self-paced/[sessionId]/+page.svelte`](src/routes/play/self-paced/[sessionId]/+page.svelte)
- [ ] Tạo question display với timer component
- [ ] Triển khai answer selection và submission interface
- [ ] Thêm progress bar và question navigation
- [ ] Xây dựng quiz completion và immediate feedback

#### Hoàn thiện cuối cùng

- [ ] Thêm smooth loading states và transitions
- [ ] Triển khai responsive design cho tất cả quiz components
- [ ] Tạo consistent styling trên tất cả quiz interfaces
- [ ] Kiểm thử UI cuối cùng và cross-browser compatibility

---

## 🖥️ xuanmanh-2110 - Frontend Developer

### Giai đoạn 1: Authentication UI

#### Hệ thống Login

- [ ] Tạo login page trong [`src/routes/login/+page.svelte`](src/routes/login/+page.svelte)
- [ ] Xây dựng Google OAuth button và authentication flow
- [ ] Triển khai authentication state management
- [ ] Thêm login/logout functionality và redirects
- [ ] Tạo authentication guards cho protected routes

#### Join Dashboard

- [ ] Xây dựng join dashboard trong [`src/routes/join/+page.svelte`](src/routes/join/+page.svelte)
- [ ] Tạo "Enter Code" section để tham gia quizzes
- [ ] Thêm recent activity display và user history
- [ ] Triển khai search functionality cho public quizzes
- [ ] Thêm user profile display và quick actions

### Giai đoạn 2: Quiz Library

#### Library Interface

- [ ] Xây dựng quiz library trong [`src/routes/dashboard/library/+page.svelte`](src/routes/dashboard/library/+page.svelte)
- [ ] Tạo quiz cards với actions (Edit, Delete, Share)
- [ ] Triển khai quiz listing, filtering, và sorting
- [ ] Thêm quiz detail view trong [`src/routes/quiz/[id]/+page.svelte`](src/routes/quiz/[id]/+page.svelte)
- [ ] Tạo quiz statistics và metadata display

#### Quản lý Quiz

- [ ] Tạo share link generation và copy functionality
- [ ] Xây dựng session creation interface và modal
- [ ] Thêm quiz actions (Start Session, Edit, Delete, Duplicate)
- [ ] Triển khai quiz export và sharing options

### Giai đoạn 3: Results & History

#### Results Interface

- [ ] Xây dựng results page trong [`src/routes/results/[attemptId]/+page.svelte`](src/routes/results/[attemptId]/+page.svelte)
- [ ] Tạo attempt history và comparison view
- [ ] Triển khai score visualization và charts
- [ ] Thêm detailed question-by-question review
- [ ] Xây dựng "Try Again" và sharing functionality

#### Hoàn thiện & Kiểm thử

- [ ] Thêm animations và smooth transitions
- [ ] Triển khai comprehensive error states và loading
- [ ] Tạo user onboarding và help tooltips
- [ ] Kiểm thử cuối cùng tất cả user authentication flows

---

## 📊 sunyn582 - Frontend Developer

### Giai đoạn 1: Dashboard Layout

#### Cấu trúc Dashboard

- [ ] Tạo main dashboard layout trong [`src/routes/dashboard/+layout.svelte`](src/routes/dashboard/+layout.svelte)
- [ ] Xây dựng sidebar navigation component trong [`src/lib/components/Sidebar.svelte`](src/lib/components/Sidebar.svelte)
- [ ] Triển khai user menu và profile section
- [ ] Thêm responsive sidebar với mobile hamburger menu
- [ ] Tạo consistent dashboard header và breadcrumbs

### Giai đoạn 2: Dashboard Components

#### Tính năng Dashboard

- [ ] Xây dựng main dashboard trong [`src/routes/dashboard/+page.svelte`](src/routes/dashboard/+page.svelte)
- [ ] Tạo trending quizzes section và discovery
- [ ] Triển khai search bar cho quiz discovery
- [ ] Xây dựng user profile menu và settings access
- [ ] Thêm dashboard statistics và activity feed

#### Hoàn thiện Navigation

- [ ] Tạo breadcrumb navigation component
- [ ] Thêm active state indicators cho sidebar
- [ ] Triển khai smooth transitions giữa các dashboard sections
- [ ] Thêm keyboard navigation và accessibility

### Giai đoạn 3: Session Management UI

#### Active Sessions Dashboard

- [ ] Xây dựng active sessions page trong [`src/routes/dashboard/active-sessions/+page.svelte`](src/routes/dashboard/active-sessions/+page.svelte)
- [ ] Tạo session cards với real-time status indicators
- [ ] Triển khai session actions (Extend, End Early, View Details)
- [ ] Thêm participant count và live session analytics
- [ ] Xây dựng session details modal với participant list

#### Tích hợp cuối cùng

- [ ] Kết nối tất cả dashboard components với real data
- [ ] Thêm real-time session status updates
- [ ] Triển khai dashboard notifications và alerts
- [ ] Kiểm thử cuối cùng dashboard functionality và responsiveness

---

# 🚀 Tiêu chuẩn kỹ thuật

## Tiêu chuẩn Code

- **Commit Messages:** Sử dụng conventional commits format
- **Branch Naming:** `feature/[feature-name]`

## Quy ước cấu trúc File

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   ├── server/
│   │   ├── db/             # Database schema and utilities
│   │   └── auth/           # Authentication utilities
│   └── utils/              # Shared utilities
├── routes/
│   ├── api/                # API endpoints
│   ├── dashboard/          # Dashboard pages
│   ├── quiz/               # Quiz management pages
│   └── play/               # Quiz playing pages
└── app.css                 # Global styles
```

## Database Tables cần thiết

- [`users`](src/lib/server/db/schema.ts) - User authentication data
- [`quizzes`](src/lib/server/db/schema.ts) - Quiz metadata
- [`questions`](src/lib/server/db/schema.ts) - Quiz questions
- [`answers`](src/lib/server/db/schema.ts) - Answer options
- [`sessions`](src/lib/server/db/schema.ts) - Quiz sessions
- [`attempts`](src/lib/server/db/schema.ts) - User attempts
- [`responses`](src/lib/server/db/schema.ts) - Individual question responses

---

# 🎯 Tiêu chí hoàn thành

## Sản phẩm giai đoạn 1

- [ ] Google OAuth authentication hoạt động
- [ ] Basic page layouts và navigation
- [ ] Database schema được định nghĩa và migrated
- [ ] Development environment được cấu hình đầy đủ

## Sản phẩm giai đoạn 2

- [ ] Hoàn thành quiz creation và editing
- [ ] Quiz library với tất cả CRUD operations
- [ ] Session management system hoạt động
- [ ] Tất cả API endpoints functional

## Sản phẩm giai đoạn 3

- [ ] Self-paced quiz playing experience
- [ ] Results và attempt history
- [ ] Session dashboard cho creators
- [ ] Hệ thống tích hợp và kiểm thử đầy đủ

## Yêu cầu demo cuối cùng

- [ ] User có thể sign in với Google
- [ ] User có thể tạo và chỉnh sửa quizzes
- [ ] User có thể start self-paced session
- [ ] Participants có thể join và complete quiz
- [ ] Results được tính toán và hiển thị
- [ ] Session management dashboard hoạt động
- [ ] Responsive design trên desktop và mobile

---
