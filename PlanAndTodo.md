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

#### Database Schema

- [x] user, account, session
- [x] Thiết kế quiz, question, question_option, quiz_session, session_participant, game_attempt, session_question, session_question_option, question_attempt

#### Quiz Player Logic

#### Results & Integration

---

## 🎨 akitosuref - Quiz Management UI

#### Quiz Editor

- [x] Tạo question editor
- [x] Quiz settings (time limits, points, question types)
- [x] Thêm question type selection (Multiple choice, True/False)
- [ ] Tạo question display với timer component
- [ ] Triển khai answer selection và submission interface
- [ ] Thêm progress bar và question navigation
- [ ] Xây dựng quiz completion và immediate feedback

#### Quản lý Quiz

- [ ] Tạo share link generation và copy functionality
- [ ] Xây dựng session creation interface và modal
- [ ] Thêm quiz actions (Start Session, Edit, Delete, Duplicate)
- [ ] Triển khai quiz export và sharing options

---

## 🖥️ xuanmanh-2110 - Login, Join, Library Page

#### Landing Pages

- [ ] Hero section, Footer, Features, FAQ

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

- [x] Xây dựng quiz library
- [x] Tạo quiz cards với actions (Edit, Delete, Archive, Play, Publish)
- [x] Triển khai quiz listing, filtering, và sorting
  - [x] Tạo trang Library để quản lý quiz.
  - [x] Phân loại quiz theo tab (Published, Drafts, Archived).
  - [x] Thêm các hành động cho quiz (Publish, Archive, Delete, Edit).
  - [x] Hiển thị thông tin chi tiết trên thẻ quiz (tác giả, số câu hỏi, thời gian tạo).
- [x] Quiz statistics và metadata display

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
