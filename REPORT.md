# Báo cáo Dự án: Quiz Learn

## 1. Bảng phân chia công việc chi tiết

Dưới đây là bảng phân chia công việc chi tiết cho từng thành viên dựa trên tệp [`PlanAndTodo.md`](PlanAndTodo.md).

| Tên                  | GitHub Username | Chuyên môn                    | Nhiệm vụ chi tiết                                                                                                                                                                                                                                                                                                                                                                                |
| :------------------- | :-------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trần Thành Long**  | `nielpattin`    | Backend/Core Systems/Database | **Thiết lập dự án:** Auth.js, PostgreSQL & Drizzle ORM, cấu trúc SvelteKit, env, linting.<br>**Hệ thống Authentication:** Quản lý vai trò (User/Admin), protected routes, admin panel.<br>**Database:** Thiết kế schema (10+ bảng), 18+ migrations, seeding script.<br>**Core Backend Logic:** Logic tạo và quản lý quiz, quản lý session, hệ thống tính điểm và lưu trữ kết quả.                |
| **Vương Quang Quý**  | `akitosuref`    | Quiz Management UI            | **Quiz Editor:** Giao diện chỉnh sửa câu hỏi, cài đặt quiz (thời gian, điểm), quản lý câu hỏi và đáp án.<br>**Quiz Player Interface:** Giao diện hiển thị câu hỏi, timer, thanh tiến trình, flow hoàn thành quiz, và trang hiển thị kết quả.<br>**Quiz Management:** Các hành động với quiz (Start Session, Edit, Delete), quản lý trạng thái (draft, published, archived).                      |
| **Nguyễn Xuân Mạnh** | `xuanmanh-2110` | Auth & Results UI             | **Landing Pages & Authentication:** Landing page, trang đăng nhập với Google/Github OAuth, trang profile người dùng.<br>**Join & Participation:** Giao diện nhập code, sảnh chờ session.<br>**Library Interface:** Thư viện quiz với filter, sắp xếp, tìm kiếm, và pagination.<br>**Basic Results Interface:** Giao diện xem kết quả cá nhân và review từng câu hỏi.                             |
| **Vũ Văn Sơn**       | `sunyn582`      | Dashboard & Sessions UI       | **Dashboard Infrastructure:** Layout chính, sidebar, header.<br>**Dashboard Features:** Welcome section, trending quizzes, thanh tìm kiếm, hoạt động gần đây.<br>**Sessions Management:** Giao diện liệt kê, chi tiết, và tạo session; quản lý người tham gia và theo dõi trạng thái session.<br>**Reports Interface:** Giao diện xem báo cáo theo session và theo dõi hiệu suất người tham gia. |

---

## 2. Phân tích yêu cầu

### a. Đặt vấn đề bài toán

Dự án nhằm mục đích phát triển một ứng dụng web trắc nghiệm tương tác (Quiz Web App) tương tự như Quizizz và Kahoot. Ứng dụng cho phép người dùng tạo, quản lý, chia sẻ và tham gia các bài quiz một cách linh hoạt. Mục tiêu là cung cấp một nền tảng dễ sử dụng, có tính tương tác cao, hoạt động ổn định và có khả năng mở rộng trong tương lai.

### b. Tác nhân, người dùng

Hệ thống có hai vai trò chính:

1.  **User (Người dùng):**
    - **Người tạo Quiz (Host):** Có quyền tạo, quản lý, và chia sẻ các quiz của riêng mình. Họ có thể tạo các "self-paced sessions" và xem báo cáo, thống kê từ các session đó.
    - **Người tham gia (Player):** Có thể tham gia vào các quiz thông qua mã mời hoặc link chia sẻ. Họ có thể là người dùng đã đăng ký (lịch sử được lưu lại) hoặc khách (guest).
2.  **Admin (Quản trị viên):**
    - Có quyền quản lý toàn bộ hệ thống, bao gồm quản lý tất cả người dùng và các quiz được tạo trên nền tảng.

### c. Chức năng, phân tích chức năng (theo tác nhân)

#### Chức năng dành cho User (Host & Player)

- **FR1: Quản lý người dùng**
  - Đăng nhập/Đăng ký bằng tài khoản Google.
  - Tự động tạo tài khoản khi đăng nhập lần đầu.
  - Quản lý thông tin cá nhân cơ bản.
- **FR2: Quản lý Quiz (Host)**
  - Tạo quiz mới với tiêu đề, mô tả.
  - Thêm câu hỏi (trắc nghiệm nhiều lựa chọn, đúng/sai) và hình ảnh.
  - Thiết lập thời gian, điểm số cho từng câu hỏi.
  - Chỉnh sửa, xóa, và quản lý các quiz đã tạo.
- **FR3: Tham gia Quiz (Player)**
  - Tham gia bằng mã mời hoặc link.
  - Có thể tham gia với tư cách khách (guest) bằng nickname.
  - Trả lời câu hỏi trong thời gian giới hạn.
  - Xem kết quả và lịch sử làm bài (chỉ dành cho người dùng đã đăng ký).
  - Được phép làm lại nhiều lần trong các "self-paced sessions" cho đến khi hết hạn.
- **FR4: Dashboard & Active Sessions (Host)**
  - Xem danh sách các session đang hoạt động.
  - Xem thông tin chi tiết: trạng thái, thời gian kết thúc, số người tham gia.
  - Gia hạn hoặc kết thúc session sớm.
- **FR5: Báo cáo (Host & Player)**
  - **Host:** Xem thống kê tổng quan về số người tham gia, điểm trung bình, và hiệu suất của từng người chơi trong session.
  - **Player:** Xem lịch sử các quiz đã tham gia và điểm số của mình.

#### Chức năng dành cho Admin

- **FR1.4: Phân quyền**
  - Quản lý toàn bộ người dùng và quiz trong hệ thống.

---

## 3. Đặc tả và thiết kế

### a. Usecase và mô tả

| Usecase              | Mô tả                                                                                                                                                                                                                                |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Quản lý Quiz**     | Người dùng có thể tạo một quiz mới, thêm các câu hỏi thuộc loại trắc nghiệm hoặc đúng/sai, đính kèm hình ảnh, thiết lập điểm số và thời gian cho mỗi câu. Họ cũng có thể chỉnh sửa, xóa và sắp xếp các quiz trong thư viện của mình. |
| **Tổ chức Session**  | Từ một quiz đã tạo, người dùng (Host) có thể khởi tạo một "self-paced session", thiết lập thời gian kết thúc và nhận một mã mời hoặc link để chia sẻ cho người khác.                                                                 |
| **Tham gia Session** | Người tham gia (Player) sử dụng mã mời hoặc link để truy cập vào session. Họ nhập một nickname và có thể bắt đầu làm bài. Hệ thống cho phép làm lại nhiều lần cho đến khi session hết hạn.                                           |
| **Xem báo cáo**      | Host có thể xem báo cáo chi tiết của một session, bao gồm danh sách người tham gia, số lần thử, và điểm số cao nhất. Player có thể xem lại lịch sử các lần làm bài của mình để so sánh tiến độ.                                      |

### b. Flow chi tiết: Luồng tạo Session và Snapshot câu hỏi

Dưới đây là sơ đồ sequence mô tả chi tiết luồng xử lý khi một Host tạo session mới. Hệ thống sẽ "chụp lại" (snapshot) toàn bộ nội dung của quiz tại thời điểm đó để đảm bảo tính toàn vẹn, ngay cả khi quiz gốc bị chỉnh sửa sau này.

```mermaid
sequenceDiagram
    participant Host
    participant System
    participant Database

    Host->>System: Create Session (with quiz_id)
    activate System
    System->>Database: CREATE quiz_session
    Database-->>System: return quiz_session_id
    System->>Database: SELECT questions, question_options FROM quiz WHERE id = quiz_id
    Database-->>System: return quiz content
    System->>Database: INSERT session_questions (with quiz_session_id)
    System->>Database: INSERT session_question_options
    deactivate System
```

### c. Thiết kế hướng đối tượng (Sơ đồ quan hệ thực thể)

Sơ đồ ERD dưới đây mô tả các thực thể chính và mối quan hệ giữa chúng trong cơ sở dữ liệu, thể hiện thiết kế hướng đối tượng của hệ thống.

```mermaid
erDiagram
    %% Auth.js Tables
    users {
        text id PK "UUID"
        text email UK "Unique email address"
        text name "Display name"
        text image "Profile picture URL"
        timestamp emailVerified "Email verification timestamp"
        text role "ENUM: Admin, User"
        timestamp created_at
        timestamp updated_at
    }

    accounts {
        text userId FK "References users.id"
        text type "Account type (oidc, oauth)"
        text provider "OAuth provider (google, github)"
        text providerAccountId "Provider account ID"
        text refresh_token "OAuth refresh token"
        text access_token "OAuth access token"
        int expires_at "Token expiration"
        text token_type "Token type"
        text scope "OAuth scope"
        text id_token "ID token"
        text session_state "Session state"
    }

    sessions {
        text sessionToken PK "Session token"
        text userId FK "References users.id"
        timestamp expires "Session expiration"
    }

    %% Application Tables
    quizzes {
        serial id PK "Auto-increment ID"
        varchar title "Quiz title (256 chars)"
        text description "Quiz description"
        text creator_id FK "References users.id"
        varchar status "ENUM: draft, published, archived"
        varchar visibility "ENUM: public, private, unlisted"
        timestamp created_at
        timestamp updated_at
    }

    questions {
        serial id PK "Auto-increment ID"
        int quiz_id FK "References quizzes.id"
        varchar type "ENUM: multiple_choice, true_false"
        varchar content "Question text (5000 chars)"
        int time_limit "Time limit in seconds"
        int points "Points for correct answer"
        timestamp created_at
        timestamp updated_at
    }

    question_options {
        serial id PK "Auto-increment ID"
        int question_id FK "References questions.id"
        int order "Option order"
        varchar content "Option text (2500 chars)"
        boolean correct "Correct answer flag"
    }

    quiz_sessions {
        serial id PK "Auto-increment ID"
        int quiz_id FK "References quizzes.id"
        text host_id FK "References users.id"
        varchar shareable_code UK "7-digit code (0-9)"
        jsonb settings_overrides "Custom session settings"
        timestamp created_at
        timestamp updated_at
        timestamp end_time
    }

    session_participants {
        serial id PK "Auto-increment ID"
        int quiz_session_id FK "References quiz_sessions.id"
        varchar player_id UK "Guest/registered player identifier"
        text user_id FK "References users.id (NULL for guests)"
        varchar nickname "Display name for session"
        int total_attempts "Number of attempts made"
        int best_score "Highest score achieved"
        jsonb data "Report data: correct, incorrect, attempts, total_time_ms, questions_per_sec"
        timestamp created_at
        timestamp updated_at
    }

    game_attempts {
        serial id PK "Auto-increment ID"
        int quiz_session_id FK "References quiz_sessions.id"
        varchar player_id FK "References session_participants.player_id"
        int attempt_number "Attempt sequence number"
        int score "Total score for attempt"
        varchar status "ENUM: in_progress, completed, abandoned"
        timestamp started_at "Attempt start time"
        timestamp completed_at "Attempt completion time"
        timestamp updated_at
    }

    question_attempts {
        serial id PK "Auto-increment ID"
        int game_attempt_id FK "References game_attempts.id"
        int session_question_id FK "References session_questions.id"
        int selected_session_option_id FK "References session_question_options.id (NULL if no answer)"
        boolean correct "Answer correctness snapshot"
        int time_taken_ms "Response time in milliseconds"
        int points_awarded "Points earned for this question"
    }

    %% Session-specific tables for temporary questions/options
    session_questions {
        serial id PK "Auto-increment ID"
        int quiz_session_id FK "References quiz_sessions.id"
        int original_question_id FK "References questions.id"
        varchar type "Question type snapshot"
        text content "Question content snapshot"
        int time_limit "Time limit snapshot"
        int points "Points value snapshot"
    }

    session_question_options {
        serial id PK "Auto-increment ID"
        int session_question_id FK "References session_questions.id"
        int original_option_id FK "References question_options.id"
        int order "Option order snapshot"
        varchar content "Option text snapshot"
        boolean correct "Correct answer snapshot"
    }

    %% Relationships
    users ||--o{ accounts : has
    users ||--o{ sessions : has
    users ||--o{ quizzes : creates
    users ||--o{ quiz_sessions : hosts
    users ||--o| session_participants : participates

    quizzes ||--o{ questions : contains
    quizzes ||--o{ quiz_sessions : used_in

    questions ||--o{ question_options : has
    questions ||--o{ session_questions : source_for

    quiz_sessions ||--o{ session_participants : has
    quiz_sessions ||--o{ game_attempts : contains
    quiz_sessions ||--o{ session_questions : snapshots

    session_participants ||--o{ game_attempts : makes

    session_questions ||--o{ session_question_options : has
    session_questions ||--o{ question_attempts : attempted_in

    question_options ||--o{ session_question_options : source_for
    game_attempts ||--o{ question_attempts : consists_of
    session_question_options ||--o| question_attempts : selected_in
```

### d. Data flow và cơ sở dữ liệu

Luồng dữ liệu và cơ sở dữ liệu được thể hiện qua hai sơ đồ chính:

1.  **Sơ đồ ERD (ở mục 3c):** Mô tả cấu trúc và các mối quan hệ của cơ sở dữ liệu PostgreSQL.
2.  **Sơ đồ Sequence (ở mục 3b):** Minh họa luồng dữ liệu tương tác giữa người dùng, hệ thống và cơ sở dữ liệu trong một kịch bản cụ thể (tạo session).

Ngoài ra, luồng dữ liệu khi người chơi làm bài cũng rất quan trọng:

```mermaid
sequenceDiagram
    participant Player
    participant System
    participant Database

    Player->>System: Start Game Attempt (in quiz_session_id)
    activate System
    System->>Database: CREATE game_attempt (quiz_session_id, player_id)
    Database-->>System: return game_attempt_id
    System->>Database: SELECT * FROM session_questions WHERE quiz_session_id = quiz_session_id
    Database-->>System: return session questions
    deactivate System

    Note over Player, System: System presents questions to Player...

    Player->>System: Submit Answer (attempt_id, question_id, option_id)
    activate System
    System->>Database: CREATE question_attempt
    System->>System: Calculate score
    System->>Database: UPDATE game_attempt (score)
    deactivate System
```
