# Plan dự án

## 1. Giới thiệu chung (Overview)

Dự án này nhằm mục đích phát triển một ứng dụng web trắc nghiệm tương tác (Quiz Web App) tương tự như Quizizz, Kahoot. Ứng dụng sẽ được xây dựng bằng SvelteKit, cho phép người dùng tạo, quản lý và tham gia các bài quiz.

## 2. Mục tiêu dự án (Project Goals)

- Phát triển một nền tảng trắc nghiệm trực tuyến đa năng, dễ sử dụng.
- Cung cấp các tính năng tạo trắc nghiệm linh hoạt cho người dùng.
- Mang lại trải nghiệm làm trắc nghiệm thú vị và có tính tương tác cao.
- Đảm bảo hệ thống hoạt động ổn định và có khả năng mở rộng.

## 3. Phạm vi dự án (Project Scope)

### Core Features (In-Scope):

- **Quản lý người dùng:** Đăng ký, đăng nhập, phân quyền (User, Admin).
- **Tạo và quản lý Quiz:**
  - Tạo quiz với câu hỏi trắc nghiệm nhiều lựa chọn và đúng/sai.
  - Thêm hình ảnh vào câu hỏi.
  - Thiết lập thời gian, điểm sốI'm using Oauth like google, no credential username and password anymore cho câu hỏi.
  - Chỉnh sửa, xóa quiz.
- **Tham gia Quiz - Self-Paced:**
  - **Self-Paced Quiz:** Người tham gia có thể bắt đầu bất cứ lúc nào, làm lại nhiều lần đến khi hết hạn
  - Người dùng tham gia quiz qua link chia sẻ hoặc mã mời.
  - Trả lời câu hỏi trong thời gian giới hạn.
  - Xem kết quả tức thì và lịch sử các lần làm bài.
- **Dashboard cho người tạo quiz:**
  - Active Sessions: Xem các self-paced sessions đang hoạt động
  - Thống kê chi tiết cho từng session
- **Xem kết quả:**
  - Người tạo quiz xem thống kê đơn giản.

### Tính năng phát triển sau:

- **Live Quiz (Kahoot-style):** Host đợi ít nhất 1 người tham gia, tất cả làm bài đồng thời
- WebSocket integration cho real-time features
- Lobby system và synchronized gameplay
- Real-time leaderboards
- Câu hỏi điền từ ngắn (Short Answer)
- Báo cáo chi tiết và xuất file
- AI tạo quiz tự động

## 4. Công nghệ sử dụng (Tech Stack)

- **Frontend & Backend:** SvelteKit
- **Ngôn ngữ:** TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Auth.js với Google OAuth Provider
- **OAuth Provider:** Google OAuth 2.0
- **Styling:** CSS thuần hoặc TailwindCSS
- **Deployment:** Docker via Coolify

## 5. Các mốc thời gian chính

- **Sprint 1-2:** Thiết lập dự án, User Management & Authentication.
- **Sprint 3-4:** Core Quiz CRUD (tạo, sửa, xóa quiz và câu hỏi).
- **Sprint 5-6:** Basic Quiz Participation (tham gia và làm bài).
- **Sprint 7-8:** Results và Reports cơ bản.
- **Sprint 9-10:** UI/UX improvements và testing.
- **Sprint 11:** Deployment và launch.

# SRS: Phân tích yêu cầu và đặc tả

## 1. Yêu cầu chức năng (Functional Requirements)

### FR1: Quản lý người dùng

- **FR1.1:** Đăng nhập bằng Google OAuth - người dùng sử dụng tài khoản Google để xác thực.
- **FR1.2:** Tự động tạo tài khoản người dùng mới khi đăng nhập lần đầu qua Google OAuth.
- **FR1.3:** Đăng xuất và quản lý thông tin cá nhân (tên hiển thị, ảnh đại diện từ Google).
- **FR1.4:** Phân quyền: User (tạo/tham gia quiz), Admin (quản lý hệ thống).
- **FR1.5:** Hệ thống lưu trữ thông tin từ Google: email, tên, ảnh đại diện.

### FR2: Quản lý Quiz

- **FR2.1:** Tạo quiz mới với tiêu đề và mô tả.
- **FR2.2:** Thêm câu hỏi vào quiz:
  - Câu hỏi trắc nghiệm nhiều lựa chọn (2-5 đáp án)
  - Câu hỏi Đúng/Sai
- **FR2.3:** Thêm hình ảnh cho câu hỏi.
- **FR2.4:** Thiết lập thời gian và điểm số cho câu hỏi.
- **FR2.5:** Xem, chỉnh sửa, xóa quiz đã tạo.
- **FR2.6:** Tạo link chia sẻ cho quiz.

### FR3: Tham gia Quiz - Self-Paced

- **FR3.1:** Host tạo Self-Paced session và thiết lập thời gian kết thúc.
- **FR3.2:** Người tham gia có thể bắt đầu bất cứ lúc nào khi họ ấn start.
- **FR3.3:** Cho phép làm lại nhiều lần cho đến khi hết thời gian.
- **FR3.4:** Lưu tất cả lần thử và hiển thị lịch sử để so sánh.
- **FR3.5:** Người tham gia có thể xem báo cáo chi tiết các lần làm bài.
- **FR3.6:** Tham gia quiz bằng link chia sẻ hoặc mã mời.
- **FR3.7:** Nhập nickname để tham gia.
- **FR3.8:** Xem câu hỏi và trả lời trong thời gian quy định.
- **FR3.9:** Xem tổng kết điểm số sau khi hoàn thành.

### FR4: Active Sessions Dashboard

- **FR4.1:** Người tạo quiz xem danh sách các self-paced sessions đang hoạt động.
- **FR4.2:** Hiển thị thông tin session: Tên quiz, trạng thái (Active/Expired), thời gian kết thúc, số người tham gia.
- **FR4.3:** Nút "View Details" để xem thống kê chi tiết từng session.
- **FR4.4:** Khả năng gia hạn thời gian hoặc kết thúc session sớm.

### FR5: Báo cáo cơ bản

- **FR5.1:** Người tạo quiz xem kết quả tổng quan: số người tham gia, điểm trung bình.
- **FR5.2:** Người dùng xem lịch sử các quiz đã tham gia và điểm số.
- **FR5.3:** Thống kê chi tiết cho active sessions: danh sách người tham gia, số lần thử, điểm cao nhất.

## 2. Yêu cầu phi chức năng (Non-Functional Requirements)

- **NFR1: Performance:** Thời gian tải trang, phản hồi nhanh.
- **NFR2: Security:** Google OAuth 2.0 authentication, bảo vệ chống XSS/CSRF, sử dụng HTTPS.
- **NFR3: Usability:** Giao diện trực quan, thông báo lỗi rõ ràng.

# Thiết kế giao diện

## 1. Nguyên tắc thiết kế

- **Tính nhất quán:** Màu sắc, font chữ, components nhất quán toàn ứng dụng.
- **Tính rõ ràng:** Thông tin dễ hiểu, tránh thuật ngữ phức tạp.
- **Tính đơn giản:** Loại bỏ chi tiết không cần thiết.
- **Phản hồi:** Loading states, success/error messages rõ ràng.
- **Desktop-first Design:** Tối ưu cho trải nghiệm desktop.

## 2. Các màn hình chính

### 2.1. Trang chủ (`/`) - Chưa đăng nhập

- Header với logo, navigation
  - "Login" button chuyển đến `/login`
  - Enter Code to join button
- Hero section
- Features overview
- Footer

### 2.2. Authentication (`/login`)

- Trang đăng nhập với nhiều authentication providers
- Google OAuth button (provider chính hiện tại)
- Placeholder cho các providers khác (GitHub, Facebook, etc.)
- Tự động redirect sau khi xác thực thành công
- Tạo User mới nếu chưa có trong database
- Hiển thị thông tin người dùng sau khi đăng nhập thành công (email, tên, ảnh đại diện)
- Redirect về `/join` sau khi đăng nhập thành công

### 2.3. Join Dashboard (`/join`) - Sau khi đăng nhập

- Main content:
  - Create Quiz button (goto `/dashboard`)
  - Burger menu (bên phải) với Settings và Logout
  - Enter code to join section
  - Find a quiz search bar
  - Recent activity: Danh sách quiz đã tham gia gần đây

### 2.4. Dashboard (`/dashboard`) - Sau khi click Create Quiz

- Sidebar bên trái:
  - Create Quiz
  - Library (các quiz đã tạo)
  - Active Sessions (em các self-paced sessions đang hoạt động)
  - Reports (thống kê về các quiz đã tạo)
- Main container:
  - Search bar để tìm quiz
  - Trending Quizzes: Danh sách các quiz đang hot
- Góc phải:
  - Enter code để join quiz
  - Burger menu với:
    - View Profile
    - Settings
    - Logout

### 2.5. Quiz Management (`/dashboard/library`)

- Danh sách quiz đã tạo (dạng cards)
- Mỗi quiz hiển thị: Tên, thời gian từ lúc tạo, số câu hỏi
- Actions: Copy Share Link, Play,
- Click vào quiz để vào trang chi tiết quiz (`/quiz/:id`)

### 2.6. Quiz Detail (`/quiz/:id`)

- Hiển thị thông tin quiz: Tiêu đề, mô tả, người tạo
- Danh sách câu hỏi với số điểm và thời gian
- Buttons: Edit Quiz, Delete Quiz, Start Self-Paced Session
  - Khi ấn Start Self-Paced Session:
    - Thiết lập end time
    - Tạo link chia sẻ `/play/self-paced/:sessionId`

### 2.7. Quiz Editor (`/quiz/edit/:id`)

- Save button (lưu thay đổi)
  - Khi click sẽ lưu quiz và go to `/quiz/:id`
- Return button (trở về dashboard)
- Form thông tin quiz: Tiêu đề
- Danh sách câu hỏi với drag-drop để sắp xếp
- Add Question button
- Question List:
  - Câu hỏi, hình ảnh, đáp án, thời gian, điểm, loại câu hỏi, delete button, edit button

### 2.8. Quiz Player - Self-Paced Mode

#### Self-Paced Quiz (`/play/self-paced/:sessionId`)

**Landing page:**

- Thông tin quiz và thời gian còn lại
- Lịch sử các lần thử trước (nếu có)
- Nút "Start New Attempt"

**Quiz interface (`/attempt/:attemptId`):**

- Progress bar (câu hỏi X/Y)
- Có thể thoát và tiếp tục sau
- Auto-save tiến độ

**Results (`/results/:attemptId`):**

- Kết quả lần thử hiện tại
- So sánh với các lần thử trước
- Nút "Try Again" (nếu chưa hết thời gian)

## 3. Active Sessions Dashboard (`/dashboard/active-sessions`)

- Hiển thị danh sách các self-paced sessions đang hoạt động dưới dạng cards.
- Mỗi card hiển thị:
  - Tên quiz
  - Trạng thái (Active/Expired)
  - Thời gian kết thúc
  - Số người tham gia
  - Link chia sẻ (với nút copy)
- Nút "View Details" trên mỗi card để chuyển đến trang thống kê chi tiết của session đó.
- Có thể có các filter (ví dụ: theo tên quiz, theo thời gian kết thúc).

## 4. Style Guide
