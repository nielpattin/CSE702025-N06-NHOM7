# Báo cáo Dự án: Quiz Learn

## 1. Bảng phân chia công việc chi tiết

Dưới đây là bảng phân chia công việc chi tiết cho từng thành viên dựa trên tệp [`PlanAndTodo.md`](PlanAndTodo.md).

| Tuần      | Nhiệm vụ chính                     | Trần Thành Long (Backend)                                                                                                      | Vương Quang Quý (Quiz UI)                                                                            | Nguyễn Xuân Mạnh (Auth/Results UI)                                                        | Vũ Văn Sơn (Dashboard/Sessions UI)                                                             |
| :-------- | :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **1-2**   | **Khởi tạo & Nền tảng**            | - Thiết lập project SvelteKit, Drizzle ORM, Auth.js<br>- Cấu hình ESLint, Prettier, Husky<br>- Schema DB ban đầu (Users, Auth) | - Nghiên cứu thư viện component<br>- Dựng layout cơ bản cho trang Quiz Editor                        | - Thiết kế Landing Page<br>- Dựng trang đăng nhập với các provider OAuth (Google, Github) | - Thiết kế layout chính cho Dashboard<br>- Tạo Sidebar và Header components                    |
| **3-4**   | **Core Features - Backend & DB**   | - Hoàn thiện schema DB (Quiz, Questions, Sessions)<br>- Logic tạo/quản lý Quiz<br>- Logic tạo và theo dõi Session              | - Xây dựng form tạo/sửa câu hỏi<br>- Giao diện quản lý các lựa chọn (answers)                        | - Hoàn thiện luồng đăng nhập/đăng xuất<br>- Xây dựng trang Profile người dùng             | - Dựng các section chính trên Dashboard (Welcome, Trending)<br>- Tích hợp thanh tìm kiếm       |
| **5-6**   | **Xây dựng giao diện cốt lõi**     | - API cho việc tạo/lấy dữ liệu Quiz<br>- API cho việc tham gia Session<br>- Hoàn thiện vai trò User/Admin                      | - Hoàn thiện Quiz Editor (thêm/sửa/xóa câu hỏi)<br>- Giao diện cài đặt Quiz (thời gian, điểm)        | - Giao diện nhập mã code tham gia<br>- Xây dựng sảnh chờ (session lobby)                  | - Xây dựng trang liệt kê Sessions<br>- Giao diện chi tiết một Session                          |
| **7-8**   | **Hoàn thiện luồng chơi Quiz**     | - Logic tính điểm và theo dõi lượt chơi (Attempts)<br>- Snapshot Quiz content khi tạo Session<br>- Tối ưu query DB             | - Xây dựng giao diện chơi Quiz (hiển thị câu hỏi, timer)<br>- Luồng trả lời và chuyển câu hỏi        | - Xây dựng trang thư viện Quiz (Library)<br>- Thêm bộ lọc, sắp xếp, tìm kiếm cho thư viện | - Giao diện quản lý người tham gia trong Session<br>- Bắt đầu xây dựng trang Báo cáo (Reports) |
| **9-10**  | **Tích hợp & Báo cáo**             | - API cho trang báo cáo<br>- Hoàn thiện Admin panel (quản lý user)<br>- Seeding script cho DB                                  | - Giao diện hiển thị kết quả sau khi chơi<br>- Hoàn thiện các action trên Quiz (Start, Edit, Delete) | - Giao diện xem kết quả cá nhân<br>- Review lại từng câu trả lời                          | - Hoàn thiện trang liệt kê Reports<br>- Giao diện báo cáo chi tiết theo Session                |
| **11-12** | **Hoàn thiện & Tối ưu**            | - Tối ưu hiệu năng backend<br>- Logic dọn dẹp session hết hạn<br>- Review và vá lỗi bảo mật                                    | - Tối ưu UI/UX cho Quiz Editor và Player<br>- Thêm chức năng nhân bản Quiz                           | - Tối ưu UI/UX cho trang Library và Results<br>- Hoàn thiện responsive trên các giao diện | - Tối ưu và hoàn thiện Dashboard<br>- Thêm các biểu đồ/thống kê cơ bản cho trang Reports       |
| **13-16** | **Kiểm thử, Sửa lỗi & Triển khai** | - Viết test (nếu có)<br>- Rà soát toàn bộ API<br>- Chuẩn bị cho production                                                     | - Kiểm thử chéo các luồng Quiz<br>- Sửa lỗi UI/UX                                                    | - Kiểm thử luồng xác thực và tham gia<br>- Sửa lỗi UI/UX                                  | - Kiểm thử toàn bộ luồng Dashboard và Session<br>- Sửa lỗi UI/UX                               |

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
  - Đăng nhập/Đăng ký bằng tài khoản Google, Github.
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

## 3. Đặc tả và thiết kế chi tiết

### a. Usecase và mô tả

| Usecase              | Mô tả                                                                                                                                                                                                                                |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Quản lý Quiz**     | Người dùng có thể tạo một quiz mới, thêm các câu hỏi thuộc loại trắc nghiệm hoặc đúng/sai, đính kèm hình ảnh, thiết lập điểm số và thời gian cho mỗi câu. Họ cũng có thể chỉnh sửa, xóa và sắp xếp các quiz trong thư viện của mình. |
| **Tổ chức Session**  | Từ một quiz đã tạo, người dùng (Host) có thể khởi tạo một "self-paced session", thiết lập thời gian kết thúc và nhận một mã mời hoặc link để chia sẻ cho người khác.                                                                 |
| **Tham gia Session** | Người tham gia (Player) sử dụng mã mời hoặc link để truy cập vào session. Họ nhập một nickname và có thể bắt đầu làm bài. Hệ thống cho phép làm lại nhiều lần cho đến khi session hết hạn.                                           |
| **Xem báo cáo**      | Host có thể xem báo cáo chi tiết của một session, bao gồm danh sách người tham gia, số lần thử, và điểm số cao nhất. Player có thể xem lại lịch sử các lần làm bài của mình để so sánh tiến độ.                                      |

### b. Sơ đồ quan hệ thực thể (ERD)

Sơ đồ ERD dưới đây được cập nhật để phản ánh chính xác schema database hiện tại của dự án, thể hiện thiết kế hướng đối tượng của hệ thống.

```mermaid
erDiagram
    users {
        text id PK "UUID"
        text email UK
        text name
        text image
        timestamp emailVerified
        text role "Admin, User"
        timestamp createdAt
        timestamp updatedAt
    }
    accounts {
        text userId FK "user.id"
        text type
        text provider
        text providerAccountId
        text refresh_token
        text access_token
        integer expires_at
        text token_type
        text scope
        text id_token
        text session_state
    }
    sessions {
        text sessionToken PK
        text userId FK "user.id"
        timestamp expires
    }
    quizzes {
        serial id PK
        varchar title
        text description
        text creatorId FK "users.id"
        varchar status "draft, published, archived"
        visibility visibility "public, private"
        difficulty difficulty "easy, medium, hard"
        integer duration
        real rating
        integer participants
        text imageUrl
        timestamp createdAt
        timestamp updatedAt
    }
    questions {
        serial id PK
        integer quizId FK "quizzes.id"
        varchar type "multiple_choice, true_false"
        varchar content
        integer timeLimit
        integer points
        timestamp createdAt
        timestamp updatedAt
    }
    question_options {
        serial id PK
        integer questionId FK "questions.id"
        integer order
        varchar content
        boolean correct
    }
    quiz_sessions {
        serial id PK
        integer quizId FK "quizzes.id"
        text hostId FK "users.id"
        varchar code UK
        varchar status "active, inactive, expired, deleting"
        timestamp expiresAt
        timestamp createdAt
        timestamp updatedAt
    }
    participants {
        serial id PK
        integer quizSessionId FK "quiz_sessions.id"
        text userId FK "users.id"
        text guestId
        varchar name
        timestamp createdAt
        timestamp updatedAt
    }
    game_attempts {
        serial id PK
        integer quizSessionId FK "quiz_sessions.id"
        integer participantId FK "participants.id"
        integer attemptNumber
        integer score
        varchar status "in_progress, completed, abandoned"
        timestamp startedAt
        timestamp completedAt
        timestamp updatedAt
    }
    session_questions {
        serial id PK
        integer quizSessionId FK "quiz_sessions.id"
        integer originalQuestionId FK "questions.id"
        varchar type
        text content
        integer timeLimit
        integer points
    }
    session_question_options {
        serial id PK
        integer sessionQuestionId FK "session_questions.id"
        integer originalOptionId FK "question_options.id"
        integer order
        varchar content
        boolean correct
    }
    question_attempts {
        serial id PK
        integer gameAttemptId FK "game_attempts.id"
        integer sessionQuestionId FK "session_questions.id"
        integer selectedSessionOptionId FK "session_question_options.id"
        boolean correct
        integer timeTakenMs
        integer pointsAwarded
    }
    question_attempt_options {
        serial id PK
        integer questionAttemptId FK "question_attempts.id"
        integer selectedSessionOptionId FK "session_question_options.id"
    }
    quiz_tags {
        serial id PK
        varchar name UK
        text description
        varchar color
        varchar icon
        timestamp createdAt
        timestamp updatedAt
    }
    quiz_tag_assignments {
        serial id PK
        integer quizId FK "quizzes.id"
        integer tagId FK "quiz_tags.id"
        timestamp assignedAt
    }

    users ||--o{ accounts : "has"
    users ||--o{ sessions : "has"
    users ||--o{ quizzes : "creates"
    users ||--o{ quiz_sessions : "hosts"
    users ||--o{ participants : "participates_as"

    quizzes ||--o{ questions : "contains"
    quizzes ||--o{ quiz_sessions : "is_used_in"
    quizzes ||--o{ quiz_tag_assignments : "is_assigned"

    questions ||--o{ question_options : "has"
    questions ||--o{ session_questions : "is_snapshotted_as"

    question_options ||--o{ session_question_options : "is_snapshotted_as"

    quiz_sessions ||--o{ participants : "has"
    quiz_sessions ||--o{ game_attempts : "contains"
    quiz_sessions ||--o{ session_questions : "snapshots"

    participants ||--o{ game_attempts : "makes"

    game_attempts ||--o{ question_attempts : "consists_of"

    question_attempts ||--o{ question_attempt_options : "has_multiple_selections"

    session_questions ||--o{ session_question_options : "has"
    session_questions ||--o{ question_attempts : "is_attempted_in"

    session_question_options ||--o| question_attempts : "is_selected_in"
    session_question_options ||--o{ question_attempt_options : "is_one_of_selections"

    quiz_tags ||--o{ quiz_tag_assignments : "is_assigned"
```

### c. Mô tả chi tiết các bảng (Data Dictionary)

Dưới đây là mô tả chi tiết về mục đích và các trường quan trọng của từng bảng trong cơ sở dữ liệu.

#### Nhóm bảng Xác thực & Người dùng

| Bảng         | Mô tả                                                                                        |
| :----------- | :------------------------------------------------------------------------------------------- |
| **users**    | Lưu trữ thông tin cốt lõi của người dùng, bao gồm cả vai trò (Admin/User).                   |
| **accounts** | Hỗ trợ OAuth, liên kết tài khoản người dùng với các nhà cung cấp bên ngoài (Google, Github). |
| **sessions** | Lưu trữ thông tin phiên đăng nhập của người dùng theo chuẩn của Auth.js.                     |

#### Nhóm bảng Quản lý Quiz

| Bảng                     | Mô tả                                                                                                              |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------- |
| **quizzes**              | Lưu trữ nội dung chính của một bài quiz, bao gồm tiêu đề, mô tả, và các thiết lập như độ khó, trạng thái.          |
| **questions**            | Chứa các câu hỏi thuộc về một quiz. Mỗi câu hỏi có loại (trắc nghiệm, đúng/sai), nội dung, và các thiết lập riêng. |
| **question_options**     | Chứa các lựa chọn trả lời cho một câu hỏi. Mỗi lựa chọn có nội dung và một cờ `correct` để xác định đáp án đúng.   |
| **quiz_tags**            | Định nghĩa các thẻ (tags) để phân loại quiz (ví dụ: "Toán", "Lịch sử").                                            |
| **quiz_tag_assignments** | Bảng trung gian để gán các thẻ cho quiz, tạo mối quan hệ nhiều-nhiều.                                              |

#### Nhóm bảng Vận hành Session & Chơi game

| Bảng                         | Mô tả                                                                                                                                         |
| :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **quiz_sessions**            | Đại diện cho một phiên chơi quiz được khởi tạo từ một quiz gốc. Mỗi session có một mã tham gia (`code`) duy nhất và thời gian hết hạn.        |
| **participants**             | Lưu trữ thông tin người tham gia một session, có thể là người dùng đã đăng ký (`userId`) hoặc người chơi khách (`guestId`).                   |
| **game_attempts**            | Ghi lại mỗi lượt chơi của một người tham gia trong một session. Một người có thể chơi nhiều lần.                                              |
| **question_attempts**        | Ghi lại câu trả lời cụ thể của người chơi cho một câu hỏi trong một lượt chơi, bao gồm đáp án đã chọn, thời gian trả lời và điểm số đạt được. |
| **question_attempt_options** | Bảng trung gian hỗ trợ cho câu hỏi trắc nghiệm cho phép chọn nhiều đáp án.                                                                    |

#### Nhóm bảng Snapshot

| Bảng                         | Mô tả                                                                                                                                                                                     |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **session_questions**        | "Chụp lại" (snapshot) nội dung của một câu hỏi tại thời điểm session được tạo. Điều này đảm bảo rằng nếu câu hỏi gốc trong quiz bị thay đổi, nó không ảnh hưởng đến session đang diễn ra. |
| **session_question_options** | Snapshot các lựa chọn trả lời tương ứng với `session_questions`.                                                                                                                          |

### d. Luồng dữ liệu (Data Flow)

#### Luồng tạo Session và Snapshot câu hỏi

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

#### Luồng người chơi làm bài

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

    Player->>System: Submit Answer (attempt_id, question_id, option_id(s))
    activate System
    System->>Database: CREATE question_attempt (and question_attempt_options if needed)
    System->>System: Calculate score
    System->>Database: UPDATE game_attempt (score)
    deactivate System
```

---

## 4. Công nghệ sử dụng

Dự án được xây dựng trên một ngăn xếp công nghệ hiện đại, tập trung vào hiệu năng, trải nghiệm phát triển và khả năng mở rộng.

| Hạng mục       | Công nghệ                                                                                                                                                                                         | Lý do lựa chọn                                                                                                                                                               |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**  | [**SvelteKit 5**](https://kit.svelte.dev/)                                                                                                                                                        | Một meta-framework mạnh mẽ xây dựng trên Svelte, cung cấp routing, server-side rendering (SSR), và API endpoints tích hợp sẵn.                                               |
| **UI**         | - [**Tailwind CSS**](https://tailwindcss.com/)<br>- [**shadcn-svelte**](https://www.shadcn-svelte.com/)<br>- [**Bits UI**](https://www.bits-ui.com/)<br>- [**Lucide Icons**](https://lucide.dev/) | Cung cấp một hệ thống utility-first để xây dựng giao diện nhanh chóng. shadcn-svelte và Bits UI cung cấp các components Headless UI dễ tùy biến và có khả năng tiếp cận cao. |
| **Backend**    | - **SvelteKit Server Routes**<br>- [**Auth.js (SvelteKitAuth)**](https://authjs.dev/)                                                                                                             | Tận dụng môi trường Node.js của SvelteKit để xử lý logic backend, API và tương tác với database. Auth.js đơn giản hóa việc tích hợp xác thực OAuth.                          |
| **Database**   | - [**PostgreSQL**](https://www.postgresql.org/)<br>- [**Drizzle ORM**](https://orm.drizzle.team/)                                                                                                 | PostgreSQL là một hệ quản trị CSDL quan hệ mạnh mẽ và tin cậy. Drizzle là một ORM "headless" siêu nhẹ, an toàn về kiểu cho TypeScript.                                       |
| **Tooling**    | - **pnpm, Vite**<br>- **ESLint, Prettier**<br>- **Husky, lint-staged**                                                                                                                            | `pnpm` quản lý package hiệu quả. `Vite` cung cấp HMR siêu nhanh. Các công cụ linting và pre-commit hooks đảm bảo chất lượng và tính nhất quán của code.                      |
| **Deployment** | [**Docker**](https://www.docker.com/)                                                                                                                                                             | Đóng gói ứng dụng và các dịch vụ phụ thuộc (như database) vào các container để đảm bảo môi trường phát triển và production nhất quán.                                        |

---

## 5. Kiến trúc hệ thống

Hệ thống được thiết kế theo kiến trúc Monolithic với SvelteKit đóng vai trò trung tâm, xử lý cả logic frontend và backend.

### a. Sơ đồ kiến trúc tổng quan

```mermaid
graph TD
    subgraph "User's Browser"
        A[SvelteKit Frontend]
    end

    subgraph "Server (Vercel/Docker)"
        B[SvelteKit Backend]
        C[Auth.js]
        D[Drizzle ORM]
        E[PostgreSQL Database]
    end

    A -- HTTP Requests --> B
    B -- Authentication --> C
    B -- Database Queries --> D
    D -- SQL --> E

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
    style E fill:#cff,stroke:#333,stroke-width:2px
```

- **Client (Browser):** Giao diện người dùng được xây dựng bằng Svelte, render bởi SvelteKit. Nó tương tác với backend thông qua các `load` functions và form actions.
- **Server:**
  - **SvelteKit Backend:** Xử lý các yêu cầu HTTP, cung cấp API endpoints, thực thi logic nghiệp vụ.
  - **Auth.js:** Tích hợp vào SvelteKit để xử lý các luồng xác thực (đăng nhập, đăng xuất, quản lý session).
  - **Drizzle ORM:** Đóng vai trò là lớp trung gian giữa ứng dụng và database, chuyển đổi các lời gọi hàm TypeScript thành các câu lệnh SQL an toàn và hiệu quả.
- **Database:** PostgreSQL lưu trữ toàn bộ dữ liệu của ứng dụng, từ thông tin người dùng đến nội dung quiz và kết quả.

### b. Luồng dữ liệu chính

1.  **Tải trang:** Khi người dùng truy cập một URL, SvelteKit sẽ chạy các hàm `load` tương ứng trên server để lấy dữ liệu từ database thông qua Drizzle.
2.  **Render:** Dữ liệu được truyền xuống client, SvelteKit render trang HTML và gửi về cho trình duyệt.
3.  **Tương tác:** Các hành động của người dùng (ví dụ: tạo quiz, trả lời câu hỏi) được xử lý thông qua SvelteKit Form Actions. Các action này chạy trên server, thực hiện các thay đổi cần thiết trên database và sau đó cập nhật lại giao diện.

---

## 6. Kết luận và Hướng phát triển

### a. Kết luận

Dự án **Quiz Learn** đã thành công trong việc xây dựng một nền tảng trắc nghiệm tương tác hoàn chỉnh, đáp ứng đầy đủ các yêu cầu cốt lõi đã đề ra. Hệ thống cho phép người dùng tạo, quản lý, chia sẻ và tham gia các bài quiz một cách hiệu quả. Việc lựa chọn SvelteKit và các công nghệ hiện đại khác đã mang lại một sản phẩm có hiệu năng cao, trải nghiệm người dùng mượt mà và một codebase dễ bảo trì, mở rộng.

### b. Hướng phát triển trong tương lai

Để tiếp tục nâng cao giá trị và sự hấp dẫn của sản phẩm, một số hướng phát triển tiềm năng có thể được xem xét:

- **Tương tác thời gian thực:** Tích hợp WebSockets (ví dụ: sử dụng `socket.io`) để xây dựng các tính năng real-time như bảng xếp hạng cập nhật trực tiếp, sảnh chờ tương tác, và chế độ "live game" do Host điều khiển.
- **Mở rộng các loại câu hỏi:** Thêm các dạng câu hỏi mới như điền vào chỗ trống, sắp xếp thứ tự, câu hỏi mở để làm phong phú thêm nội dung quiz.
- **Chế độ chơi theo đội (Team Mode):** Cho phép người tham gia được chia thành các đội và thi đấu với nhau.
- **Thư viện Quiz công khai:** Xây dựng một "marketplace" nơi người dùng có thể chia sẻ quiz của mình cho cộng đồng và tìm kiếm, sử dụng các quiz do người khác tạo.
- **Gamification nâng cao:** Thêm hệ thống huy hiệu, điểm kinh nghiệm, và các yếu tố game hóa khác để tăng cường sự gắn kết của người dùng.
- **Phân tích và báo cáo nâng cao:** Cung cấp các biểu đồ và phân tích sâu hơn về hiệu suất của câu hỏi và người tham gia, giúp Host có cái nhìn chi tiết hơn.
