# Quiz App - Kế hoạch & Todo

## 📋 Thành viên nhóm

| Tên              | GitHub Username | Chuyên môn              |
| ---------------- | --------------- | ----------------------- |
| Trần Thành Long  | nielpattin      | Backend/Core Systems    |
| Vương Quang Quý  | akitosuref      | Quiz Management UI      |
| Nguyễn Xuân Mạnh | xuanmanh-2110   | Auth & Results UI       |
| Vũ Văn Sơn       | sunyn582        | Dashboard & Sessions UI |

## 🎯 Phạm vi dự án

## 🥅 Mục tiêu dự án

- Phát triển một nền tảng trắc nghiệm trực tuyến đa năng, dễ sử dụng.
- Cung cấp các tính năng tạo trắc nghiệm linh hoạt cho người dùng.
- Mang lại trải nghiệm làm trắc nghiệm thú vị và có tính tương tác cao.
- Đảm bảo hệ thống hoạt động ổn định và có khả năng mở rộng.

## ⚙️ Công nghệ sử dụng

- **Frontend & Backend:** SvelteKit
- **Ngôn ngữ:** TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Auth.js với Google OAuth Provider
- **OAuth Provider:** Google OAuth 2.0
- **Styling:** CSS thuần hoặc TailwindCSS
- **Deployment:** Docker via Coolify

### Core Features (In-Scope):

- **Quản lý người dùng:** Đăng ký, đăng nhập, phân quyền (User, Admin).
- **Tạo và quản lý Quiz:**
  - Tạo quiz với câu hỏi trắc nghiệm nhiều lựa chọn và đúng/sai.
  - Thêm hình ảnh vào câu hỏi.
  - Thiết lập thời gian, điểm số cho câu hỏi.
  - Chỉnh sửa, xóa quiz.
- **Tham gia Quiz:**
  - Người tham gia có thể bắt đầu bất cứ lúc nào, làm lại nhiều lần đến khi hết hạn
  - Người dùng tham gia quiz qua link chia sẻ hoặc mã mời.
  - Trả lời câu hỏi trong thời gian giới hạn.
  - Xem kết quả và lịch sử các lần làm bài.
- **Dashboard cho người tạo quiz:**
  - Active Sessions: Xem các self-paced sessions đang hoạt động
  - Thống kê chi tiết cho từng session
- **Xem kết quả:**
  - Người tạo quiz xem thống kê đơn giản.
- **Guest Player Behavior:**
  - Người chơi không cần đăng nhập có thể tham gia bằng nickname.
  - Dữ liệu của Guest (điểm số, các lần thử) chỉ được lưu trong phạm vi của `Quiz Session` và có thể bị xóa sau khi session kết thúc. Lịch sử làm bài không được lưu trữ lâu dài cho guest.

### Tính năng phát triển sau:

- Live Quiz (Kahoot-style): Host đợi ít nhất 1 người tham gia, tất cả làm bài đồng thời
- WebSocket integration cho real-time features
- Lobby system và synchronized gameplay
- Real-time leaderboards
- Câu hỏi điền từ ngắn (Short Answer)
- Báo cáo chi tiết và xuất file
- AI tạo quiz tự động

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

- [ ] Thiết kế quiz, question, answer tables
- [ ] Tạo quiz-session và attempt tracking tables
- [ ] Thiết lập database relationships và foreign keys
- [x] Viết migration files và kiểm thử schema
  - [x] users, accounts, sessions (for Auth.js)
  - [ ] quizzes, questions, answers, attempts, responses, quiz-sessions
- [ ] Push schema changes sử dụng `pnpm db:push`

#### Quiz CRUD API

- [ ] Tạo quiz endpoints
- [ ] Triển khai question management
- [ ] Xây dựng quiz update/delete endpoints
- [ ] Thêm image upload handling cho questions
- [ ] Tạo quiz validation và error handling

#### Session Management

- [ ] Triển khai session creation API
- [ ] Xây dựng session state management và validation
- [ ] Tạo session join logic và participant tracking
- [ ] Thêm session expiration và cleanup handling

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

### Giai đoạn 1: Landing & Navigation

#### Landing Pages

- [ ] Cập nhật home page với hero section
- [ ] Tạo navigation components
- [ ] Xây dựng responsive layout và mobile navigation
- [ ] Thêm loading states và error handling components
- [ ] Tạo footer và cải thiện cấu trúc trang tổng thể
- [ ] Xóa database testing content khỏi home page

### Giai đoạn 2: Quiz Management UI

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

### Giai đoạn 3: Quiz Playing Experience

#### Quiz Player UI

- [ ] Xây dựng self-paced quiz player
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

- [ ] Tạo login page
- [ ] Xây dựng Google OAuth button và authentication flow
- [ ] Triển khai authentication state management
- [ ] Thêm login/logout functionality và redirects
- [ ] Tạo authentication guards cho protected routes

#### Join Dashboard

- [ ] Xây dựng join dashboard
- [ ] Tạo "Enter Code" section để tham gia quizzes
- [ ] Thêm recent activity display và user history
- [ ] Triển khai search functionality cho public quizzes
- [ ] Thêm user profile display và quick actions

### Giai đoạn 2: Quiz Library

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

### Giai đoạn 3: Results & History

#### Results Interface

- [ ] Xây dựng results page
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

- [ ] Tạo main dashboard layout
- [ ] Xây dựng sidebar navigation component
- [ ] Triển khai user menu và profile section
- [ ] Thêm responsive sidebar với mobile hamburger menu
- [ ] Tạo consistent dashboard header và breadcrumbs

### Giai đoạn 2: Dashboard Components

#### Tính năng Dashboard

- [ ] Xây dựng main dashboard
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

- [ ] Xây dựng active sessions page
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
