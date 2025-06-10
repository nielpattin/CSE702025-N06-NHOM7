# Quiz App - Kế hoạch & Todo

## 📋 Thành viên nhóm

| Tên              | GitHub Username | Chuyên môn              |
| ---------------- | --------------- | ----------------------- |
| Trần Thành Long  | nielpattin      | Backend/Core Systems    |
| Vương Quang Quý  | akitosuref      | Quiz Management UI      |
| Nguyễn Xuân Mạnh | xuanmanh-2110   | Auth & Results UI       |
| Vũ Văn Sơn       | sunyn582        | Dashboard & Sessions UI |

## 📅 Các giai đoạn phát triển

- **Sprint 1-2:** Thiết lập dự án, User Management & Authentication.
- **Sprint 3-4:** Core Quiz CRUD (tạo, sửa, xóa quiz và câu hỏi).
- **Sprint 5-6:** Basic Quiz Participation (tham gia và làm bài).
- **Sprint 7-8:** Results và Reports cơ bản.
- **Sprint 9-10:** UI/UX improvements và testing.
- **Sprint 11:** Deployment và launch.

---

# 👥 Phân công nhiệm vụ cá nhân

## 🔧 nielpattin - Backend/Core Systems

### Giai đoạn 1: Nền tảng

#### Thiết lập dự án

- [x] Thiết lập Auth.js với OAuth provider (Google, Github)
- [x] Cấu hình PostgreSQL database với Drizzle ORM
- [x] Tạo project structure và cấu hình SvelteKit
- [x] Cấu hình environment variables và secrets (.env)
- [x] Thiết lập ESLint, Prettier, Husky, Commitlint

#### Hệ thống Authentication

- [x] Add Role Management (User/Admin)
- [x] Test auth flows với các providers khác nhau
- [x] Triển khai protected routes

### Giai đoạn 2: Quiz System Core

#### Database Schema

- [x] user, account, session
- [x] Thiết kế quiz, question, question_option, quiz_session, session_participant, game_attempt, session_question, session_question_option, question_attempt

### Giai đoạn 3: Quiz Playing & Results

#### Quiz Player Logic

- [ ] Xây dựng attempt tracking
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

#### Landing Pages

- [ ] Cập nhật home page với hero section
- [ ] Tạo navigation components
- [ ] Xây dựng responsive layout và mobile navigation
- [ ] Thêm loading states và error handling components
- [ ] Tạo footer và cải thiện cấu trúc trang tổng thể
- [ ] Xóa database testing content khỏi home page

#### Quiz Editor

- [ ] Xây dựng quiz creation form
- [ ] Tạo question editor với drag-drop
- [ ] Triển khai answer option management components
- [ ] Thêm image upload component cho questions
- [ ] Xây dựng quiz settings (time limits, points, question types)

#### Hoàn thiện Quiz Editor

- [ ] Thêm question type selection (Multiple choice, True/False)
- [ ] Triển khai quiz preview functionality
- [ ] Thêm comprehensive form validation và error handling
- [ ] Tạo quiz duplication và template features

#### Quiz Player UI

- [ ] Xây dựng self-paced quiz player
- [ ] Tạo question display với timer component
- [ ] Triển khai answer selection và submission interface
- [ ] Thêm progress bar và question navigation
- [ ] Xây dựng quiz completion và immediate feedback

---

## 🖥️ xuanmanh-2110 - Login & Join Page

#### Hệ thống Login

- [x] Tạo login page
- [x] Add Google, Github OAuth Providers
- [x] Thêm login/logout functionality và redirects

#### Join Page

- [x] Tạo "Enter Code" section để tham gia quizzes
- [x] Thêm recent activity display
- [x] Thêm user profile display
- [ ] Search functionality cho public quizzes

#### Library Interface

- [ ] Xây dựng quiz library
- [ ] Tạo quiz cards với actions (Edit, Delete, Share)
- [ ] Triển khai quiz listing, filtering, và sorting
- [ ] Thêm quiz detail view
- [ ] Tạo quiz statistics và metadata display

#### Quản lý Quiz

- [ ] Tạo share link generation và copy functionality
- [ ] Xây dựng session creation interface và modal
- [ ] Thêm quiz actions (Start Session, Edit, Delete, Duplicate)
- [ ] Triển khai quiz export và sharing options

#### Results Interface

- [ ] Xây dựng results page
- [ ] Tạo attempt history và comparison view
- [ ] Triển khai score visualization và charts
- [ ] Thêm detailed question-by-question review
- [ ] Xây dựng "Try Again" và sharing functionality

---

## 📊 sunyn582 - Dashboard UI

#### Cấu trúc Dashboard

- [x] Tạo main dashboard layout
- [x] Xây dựng sidebar navigation component
- [ ] Triển khai user menu và profile section

#### Tính năng Dashboard

- [x] Xây dựng main dashboard
- [x] Tạo trending quizzes section
- [x] Triển khai search bar cho quiz
- [ ] Xây dựng user profile menu và settings access
- [ ] Thêm dashboard statistics và activity feed

#### Active Sessions Dashboard

- [ ] Xây dựng active sessions page
- [ ] Tạo session cards với real-time status indicators
- [ ] Triển khai session actions (Extend, End Early, View Details)
- [ ] Thêm participant count và live session analytics
- [ ] Xây dựng session details modal với participant list
